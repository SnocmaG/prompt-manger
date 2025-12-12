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
        const { branchId, testInput, provider = 'mock' } = body;

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

        if (!branch.headVersionId) {
            return NextResponse.json(
                { error: 'Branch has no head version' },
                { status: 400 }
            );
        }

        // Get the head version
        const headVersion = await prisma.promptVersion.findUnique({
            where: { id: branch.headVersionId },
        });

        if (!headVersion) {
            return NextResponse.json(
                { error: 'Head version not found' },
                { status: 404 }
            );
        }

        // Test with AI provider
        const result = await testPrompt({
            provider: provider as AIProvider,
            promptContent: headVersion.content,
            testInput,
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
            promptContent: headVersion.content,
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
