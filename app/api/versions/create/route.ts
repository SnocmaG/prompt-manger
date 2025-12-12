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
        const { branchId, content, label } = body;

        if (!branchId || !content || !label) {
            return NextResponse.json(
                { error: 'Missing required fields: branchId, content, label' },
                { status: 400 }
            );
        }

        // Verify branch ownership
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

        // Create new version
        const newVersion = await prisma.promptVersion.create({
            data: {
                branchId,
                content,
                label,
                parentVersionId: branch.headVersionId,
                createdBy: userName || userId,
                updatedBy: userName || userId,
            },
        });

        // Update branch head
        await prisma.branch.update({
            where: { id: branchId },
            data: {
                headVersionId: newVersion.id,
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
