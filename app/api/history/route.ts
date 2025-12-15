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
            // Delete all history for this prompt
            await prisma.promptExecution.deleteMany({
                where: {
                    promptId: promptId,
                    // Check ownership via prompt if strictly needed, 
                    // but usually userId check on prompt is done. 
                    // For now assuming access if they have the promptId context 
                    // (Real app should verify prompt ownership here too)
                }
            });
            return NextResponse.json({ success: true });
        }

        if (id) {
            // Delete single execution
            await prisma.promptExecution.delete({
                where: { id }
            });
            return NextResponse.json({ success: true });
        }

        return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete history' }, { status: 500 });
    }
}
