
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import OpenAI from 'openai';

// Force dynamic to prevent static generation issues
export const dynamic = 'force-dynamic';

const PRICING = {
    'gpt-4o': { input: 5.0, output: 15.0 }, // per 1M tokens
    'gpt-4o-2024-05-13': { input: 5.0, output: 15.0 },
    'gpt-4o-mini': { input: 0.15, output: 0.60 },
    'gpt-3.5-turbo': { input: 0.50, output: 1.50 },
};

export async function POST(req: NextRequest) {
    const startTime = Date.now();

    // 1. Extract Headers & Config
    const promptId = req.headers.get('x-prompt-id');

    // We need a server-side OpenAI client. 
    // Ideally, we use the user's key if provided, or fall back to system key?
    // "Drop-in replacement" implies the client provides the key usually (e.g. standard SDK).
    // If they use our API Key, we might map it to an internal user.
    // For now, let's assume standard OpenAI behavior: client sends OpenAI Key in Authorization.
    // OPTION B: Client sends OUR Api Key, and we use OUR system OpenAI Key.
    // Given the "Manager" context, usually it's Option B for enterprise control.
    // Let's support both: If 'Authorization' starts with 'sk-', use it. Else use system env.

    let openaiApiKey = process.env.OPENAI_API_KEY;
    const authHeader = req.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer sk-')) {
        openaiApiKey = authHeader.replace('Bearer ', '');
    }

    if (!openaiApiKey) {
        return NextResponse.json({ error: 'Missing OpenAI API Key' }, { status: 401 });
    }

    const openai = new OpenAI({ apiKey: openaiApiKey });

    try {
        const body = await req.json();

        // 2. Call OpenAI
        const completion = await openai.chat.completions.create(body);

        // 3. Log Mechanics
        const durationMs = Date.now() - startTime;
        const usage = completion.usage || { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 };
        const model = completion.model;

        // Calculate Cost
        let cost = 0;
        const pricing = Object.entries(PRICING).find(([k]) => model.includes(k))?.[1];
        if (pricing) {
            cost = (usage.prompt_tokens / 1_000_000) * pricing.input +
                (usage.completion_tokens / 1_000_000) * pricing.output;
        }

        // Extract content
        const content = completion.choices[0]?.message?.content || '';
        const inputMessages = (body.messages || []) as { role: string, content: string }[];

        // Attempt to log if we have context
        // If promptId is provided, we try to link it.
        // Even if not, we could store it if we had a generic "Trace" table.
        // Current PromptExecution requires promptId.
        if (promptId) {
            // Check if prompt exists
            const prompt = await prisma.prompt.findUnique({ where: { id: promptId } });
            if (prompt) {
                await prisma.promptExecution.create({
                    data: {
                        promptId: prompt.id,
                        systemPrompt: inputMessages.find((m) => m.role === 'system')?.content || '',
                        userPrompt: inputMessages.filter((m) => m.role === 'user').map((m) => m.content).join('\n'),
                        model: model,
                        provider: 'openai',
                        response: content,
                        durationMs,
                        tokensIn: usage.prompt_tokens,
                        tokensOut: usage.completion_tokens,
                        cost,
                        createdBy: 'API_GATEWAY',
                    }
                });
            }
        }

        return NextResponse.json(completion);

    } catch (error: unknown) {
        console.error('Gateway Error:', error);
        const rm = error instanceof Error ? error.message : 'Gateway Internal Error';
        return NextResponse.json(
            { error: rm },
            { status: 500 }
        );
    }
}
