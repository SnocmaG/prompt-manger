import { NextRequest, NextResponse } from 'next/server';
import { getUserInfo } from '@/lib/auth';
import { testPrompt, AIProvider } from '@/lib/ai-providers';
import { calculateCost } from '@/lib/cost-utils';

import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
    try {
        const { clientId, userId, name } = await getUserInfo();

        if (!clientId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { testInput, provider, model, overrideContent, promptId } = body;

        // Fetch active credential
        const activeCredential = await prisma.lLMCredential.findFirst({
            where: {
                clientId: userId,
                isDefault: true,
                provider: 'openai' // Support other providers later
            }
        });

        const apiKey = activeCredential?.apiKey;

        // If no content provided, we can't test. (Previously checked branch)
        if (!overrideContent) {
            return NextResponse.json(
                { error: 'Missing prompt content' },
                { status: 400 }
            );
        }

        // Test the prompt (overrideContent acts as system prompt)
        const result = await testPrompt({
            provider: provider as AIProvider,
            promptContent: overrideContent,
            testInput,
            model,
            apiKey: apiKey // Pass the custom key if found
        });

        if (!result.success) {
            return NextResponse.json(
                {
                    error: result.error || 'AI test failed',
                    provider: result.provider,
                },
                { status: 500 }
            );
        }

        // Save execution history
        if (promptId && result.success) {
            try {
                // Calculate estimated cost
                const cost = calculateCost(result.model || model, result.usage);

                await prisma.promptExecution.create({
                    data: {
                        promptId,
                        systemPrompt: overrideContent,
                        userPrompt: testInput || '',
                        model: result.model || model || provider,
                        provider: result.provider,
                        response: result.output,
                        createdBy: name || userId || 'system',
                        // Analytics
                        durationMs: result.latencyMs,
                        tokensIn: result.usage?.prompt_tokens,
                        tokensOut: result.usage?.completion_tokens,
                        cost: cost,
                        runMode: body.runMode || 'single',
                        credentialId: activeCredential?.id,
                    }
                });
            } catch (err) {
                console.error('Failed to save execution history:', err);
            }
        }

        return NextResponse.json({
            success: true,
            output: result.output,
            provider: result.provider,
            model: result.model,
            promptContent: overrideContent,
            testInput: testInput || null,
            usage: result.usage,
            latencyMs: result.latencyMs,
        });
    } catch (error) {
        console.error('Error testing with AI:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
