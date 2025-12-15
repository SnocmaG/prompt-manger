
import { NextRequest, NextResponse } from 'next/server';
import { getUserInfo } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import OpenAI from 'openai';

// Helper to substitute variables {{var}}
function substitute(template: string, variables: Record<string, string>): string {
    return template.replace(/\{\{(\w+)\}\}/g, (_, key) => variables[key] || `{{${key}}}`);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { clientId } = await getUserInfo();
    const { id } = await params;

    if (!clientId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 1. Parse Inputs
    const body = await req.json();
    const { promptVersionId } = body;

    if (!promptVersionId) {
        return NextResponse.json({ error: 'promptVersionId is required' }, { status: 400 });
    }

    try {
        // 2. Fetch Context (Eval, Items, PromptVersion)
        const evaluation = await prisma.evaluation.findUnique({
            where: { id },
            include: { items: true }
        });

        if (!evaluation || evaluation.clientId !== clientId) {
            return NextResponse.json({ error: 'Not found' }, { status: 404 });
        }

        const promptVersion = await prisma.promptVersion.findUnique({
            where: { id: promptVersionId },
            include: { prompt: true }
        });

        if (!promptVersion) {
            return NextResponse.json({ error: 'Prompt Version not found' }, { status: 404 });
        }

        // 3. Create Run Record
        const run = await prisma.evaluationRun.create({
            data: {
                evaluationId: id,
                promptVersionId,
                status: 'running',
                score: 0
            }
        });

        // 4. Execute (Async-ish, but for Vercel/Serverless usually need to await or use background jobs. We'll await for MVP).
        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
        let passedCount = 0;

        const results = [];

        for (const item of evaluation.items) {
            // Parse inputs
            let inputs = {};
            try {
                inputs = JSON.parse(item.input);
            } catch {
                console.error("Invalid JSON input for item", item.id);
            }

            // Prepare Messages
            const systemContent = substitute(promptVersion.systemPrompt, inputs);
            const userContent = substitute(promptVersion.userPrompt, inputs);
            const model = promptVersion.prompt.defaultModel || 'gpt-4o-mini';

            const startTime = Date.now();
            let output = '';
            let error = null;

            try {
                const completion = await openai.chat.completions.create({
                    model: model,
                    messages: [
                        { role: 'system', content: systemContent },
                        { role: 'user', content: userContent }
                    ]
                });
                output = completion.choices[0]?.message?.content || '';

                // Track Usage (Optional: Create PromptExecution here too for observability)
                await prisma.promptExecution.create({
                    data: {
                        promptId: promptVersion.promptId,
                        versionLabel: `Eval run ${run.id.slice(0, 8)}`,
                        systemPrompt: systemContent,
                        userPrompt: userContent,
                        model: model,
                        provider: 'openai',
                        response: output,
                        durationMs: Date.now() - startTime,
                        tokensIn: completion.usage?.prompt_tokens,
                        tokensOut: completion.usage?.completion_tokens,
                        // Cost calc omitted for brevity, logic exists in gateway
                        createdBy: 'EvaluationRunner'
                    }
                });

            } catch (e: unknown) {
                const message = e instanceof Error ? e.message : String(e);
                error = message;
                output = `Error: ${message}`;
            }

            // Check correctness (exact match if expectedOutput is set)
            let passed = false;
            // Todo: Implement fuzzy match or LLM grader.
            // For MVP: Simple Includes match or Exact if short?
            // Let's do exact match if expected provided.
            if (item.expectedOutput) {
                if (output.trim() === item.expectedOutput.trim()) {
                    passed = true;
                }
            } else {
                // If no expected output, considered "passed" / valid execution? Or null?
                // Let's say passed=true if no error.
                passed = !error;
            }

            if (passed) passedCount++;

            results.push({
                evaluationRunId: run.id,
                evaluationItemId: item.id,
                output,
                passed,
                score: passed ? 1 : 0
            });
        }

        // 5. Save Results & Update Run
        await prisma.evaluationResult.createMany({
            data: results
        });

        const finalScore = evaluation.items.length > 0 ? (passedCount / evaluation.items.length) : 0;

        await prisma.evaluationRun.update({
            where: { id: run.id },
            data: {
                status: 'completed',
                score: finalScore
            }
        });

        return NextResponse.json({ id: run.id, status: 'completed', score: finalScore });

    } catch (error) {
        console.error('Failed to execute run', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
