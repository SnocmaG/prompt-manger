import { NextRequest, NextResponse } from 'next/server';
import { getUserInfo } from '@/lib/auth';
import { testPrompt, AIProvider } from '@/lib/ai-providers';

export async function POST(request: NextRequest) {
    try {
        const { clientId } = await getUserInfo();

        if (!clientId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { testInput, provider, model, overrideContent } = body;

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
