import { NextRequest, NextResponse } from 'next/server';
import { getUserInfo } from '@/lib/auth';
import { testPrompt, AIProvider } from '@/lib/ai-providers';

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
            model
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

        // Save execution history (Fire and forget or await? Await to ensure safety)
        if (promptId && result.success) {
            try {
                await prisma.promptExecution.create({
                    data: {
                        promptId,
                        systemPrompt: overrideContent,
                        userPrompt: testInput || '',
                        model: result.model || model || provider,
                        provider: result.provider,
                        response: result.output,
                        createdBy: name || userId || 'system',
                    }
                });
            } catch (err) {
                console.error('Failed to save execution history:', err);
                // Don't fail the request just because save failed
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
