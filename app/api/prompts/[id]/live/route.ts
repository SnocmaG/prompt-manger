import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserInfo } from '@/lib/auth';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { clientId } = await getUserInfo();
        const { id } = await params;

        if (!clientId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const livePrompt = await prisma.prompt.findUnique({
            where: {
                id,
                clientId,
            },
        });

        if (!livePrompt) {
            return NextResponse.json({ error: 'Prompt not found' }, { status: 404 });
        }

        if (!livePrompt.liveVersionId) {
            return NextResponse.json({ error: 'No live version set' }, { status: 404 });
        }

        const version = await prisma.promptVersion.findUnique({
            where: { id: livePrompt.liveVersionId }
        });

        if (!version) {
            return NextResponse.json({ error: 'Live version data missing' }, { status: 404 });
        }

        return NextResponse.json({
            id: livePrompt.id,
            name: livePrompt.name,
            version: {
                id: version.id,
                systemPrompt: version.systemPrompt,
                userPrompt: version.userPrompt,
                label: version.label,
                createdAt: version.createdAt
            }
        });

    } catch (error) {
        console.error('Error fetching live prompt:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
