
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserInfo } from '@/lib/auth';

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { clientId, userId, name: userName } = await getUserInfo();
        const { id } = await params;

        if (!clientId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { label } = body;

        if (!label) {
            return NextResponse.json({ error: 'Label is required' }, { status: 400 });
        }

        // Verify ownership via Prompt link could be expensive, easier to just check if version exists and linked prompt belongs to client
        // But for direct query:
        const existingVersion = await prisma.promptVersion.findUnique({
            where: { id },
            include: { prompt: true }
        });

        if (!existingVersion || existingVersion.prompt.clientId !== clientId) {
            return NextResponse.json({ error: 'Not found or unauthorized' }, { status: 404 });
        }

        const updatedVersion = await prisma.promptVersion.update({
            where: { id },
            data: {
                label,
                updatedBy: userName || userId,
            },
        });

        return NextResponse.json(updatedVersion);

    } catch (error) {
        console.error('Error updating version:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
