import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserInfo } from '@/lib/auth';

export async function POST(request: NextRequest) {
    try {
        const { clientId, userId, name: userName } = await getUserInfo();

        if (!clientId || !userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { promptId, systemPrompt, userPrompt, label } = body;

        if (!promptId || !systemPrompt || !label) {
            return NextResponse.json(
                { error: 'Missing required fields: promptId, systemPrompt, label' },
                { status: 400 }
            );
        }

        // Verify prompt ownership
        const prompt = await prisma.prompt.findFirst({
            where: {
                id: promptId,
                clientId,
            },
        });

        if (!prompt) {
            return NextResponse.json(
                { error: 'Prompt not found' },
                { status: 404 }
            );
        }

        // Create new version
        const newVersion = await prisma.promptVersion.create({
            data: {
                promptId,
                systemPrompt: systemPrompt.replace(/\\n/g, '\n').replace(/\\t/g, '\t'),
                userPrompt: (userPrompt || '').replace(/\\n/g, '\n').replace(/\\t/g, '\t'),
                label,
                createdBy: userName || userId,
                updatedBy: userName || userId,
            },
        });

        return NextResponse.json(newVersion);
    } catch (error) {
        console.error('Error creating version:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
