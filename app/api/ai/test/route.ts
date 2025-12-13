import { NextRequest, NextResponse } from 'next/server';
import { getUserInfo } from '@/lib/auth';
import { testPrompt, AIProvider } from '@/lib/ai-providers';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
    try {
        const { clientId } = await getUserInfo();

        if (!clientId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { branchId, testInput, provider, model } = body;

        if (!branchId) {
            return NextResponse.json(
                { error: 'Missing required field: branchId' },
                { status: 400 }
            );
        }

        // Get branch with head version
        const branch = await prisma.branch.findFirst({
            where: {
                id: branchId,
            },
            include: {
                prompt: true,
            },
        });

        if (!branch || branch.prompt.clientId !== clientId) {
            return NextResponse.json(
                { error: 'Branch not found' },
                { status: 404 }
            );
        }

        // 2. Determine prompt content
        let promptContent = '';

        if (body.overrideContent) {
            promptContent = body.overrideContent;
        } else {
            // Fetch from DB if no override
            const version = await prisma.promptVersion.findFirst({
                where: { branchId },
                orderBy: { createdAt: 'desc' },
            });
            if (!version) {
                return NextResponse.json({ error: 'No version found' }, { status: 404 });
            }
            promptContent = version.content;
        }

        // 3. Test the prompt
        const result = await testPrompt({
            provider: provider as AIProvider,
            promptContent,
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
            promptContent: promptContent,
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
