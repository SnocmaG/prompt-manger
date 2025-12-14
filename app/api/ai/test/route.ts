import { NextRequest, NextResponse } from 'next/server';
import { getUserInfo } from '@/lib/auth';
import { testPrompt, AIProvider } from '@/lib/ai-providers';

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
                // We need to import prisma from lib if not already imported, but it usually is in these files?
                // Checking imports... 'import { getUserInfo } from '@/lib/auth';' 
                // We need 'import { prisma } from '@/lib/prisma';'
                // Let's assume I fix imports in a separate/block.
                // Actually replace_file_content replaces block. I need to make sure prisma is available.
                // The file imports `prisma`? No, viewed file didn't show it. It showed getUserInfo and testPrompt. 
                // I will add prisma import.

                await import('@/lib/prisma').then(async ({ prisma }) => {
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
        });
    } catch (error) {
        console.error('Error testing with AI:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
