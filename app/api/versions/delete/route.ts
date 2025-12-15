import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserInfo } from '@/lib/auth';

export async function DELETE(request: NextRequest) {
    const { userId } = await getUserInfo();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const promptId = searchParams.get('promptId');
    const clearAll = searchParams.get('all') === 'true';

    if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        if (clearAll && promptId) {
            // Delete all versions for this prompt EXCEPT the one marked as live in the prompt
            // First get the liveVersionId
            const prompt = await prisma.prompt.findUnique({
                where: { id: promptId },
                select: { liveVersionId: true }
            });

            if (!prompt) {
                return NextResponse.json({ error: 'Prompt not found' }, { status: 404 });
            }

            await prisma.promptVersion.deleteMany({
                where: {
                    promptId: promptId,
                    id: { not: prompt.liveVersionId || undefined } // Don't delete live version
                }
            });
            return NextResponse.json({ success: true, message: 'Cleared all non-live versions' });
        }

        if (id) {
            // Check if this is the live version
            const version = await prisma.promptVersion.findUnique({
                where: { id },
                include: { prompt: true }
            });

            if (!version) return NextResponse.json({ error: 'Version not found' }, { status: 404 });

            if (version.prompt.liveVersionId === id) {
                return NextResponse.json({ error: 'Cannot delete the live version' }, { status: 400 });
            }

            // Delete single version
            await prisma.promptVersion.delete({
                where: { id }
            });
            return NextResponse.json({ success: true });
        }

        return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete version' }, { status: 500 });
    }
}
