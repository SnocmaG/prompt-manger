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
        const { branchId } = body;

        if (!branchId) {
            return NextResponse.json(
                { error: 'Missing required field: branchId' },
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

        // Update prompt to set this branch as live
        const updatedPrompt = await prisma.prompt.update({
            where: { id: branch.promptId },
            data: {
                liveBranchId: branchId,
                updatedBy: userName || userId,
            },
            include: {
                branches: {
                    include: {
                        versions: {
                            orderBy: { createdAt: 'desc' },
                        },
                    },
                },
            },
        });

        return NextResponse.json(updatedPrompt);
    } catch (error) {
        console.error('Error deploying branch:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
