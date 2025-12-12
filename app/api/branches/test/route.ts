import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserInfo } from '@/lib/auth';

export async function POST(request: NextRequest) {
    try {
        const { clientId } = await getUserInfo();

        if (!clientId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { branchId, testInput } = body;

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

        // Simulate test execution
        // In a real implementation, you might call an AI API here
        const testOutput = `Test executed successfully!

Prompt Content:
${headVersion.content}

${testInput ? `\nTest Input:\n${testInput}` : ''}

This is a simulated test response. In production, this would call your AI provider (OpenAI, Anthropic, etc.) with the prompt content and test input.`;

        return NextResponse.json({
            success: true,
            output: testOutput,
            promptContent: headVersion.content,
            testInput: testInput || null,
        });
    } catch (error) {
        console.error('Error testing branch:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
