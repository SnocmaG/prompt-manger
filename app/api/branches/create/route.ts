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
        const { promptId, name, label } = body;

        if (!promptId || !name || !label) {
            return NextResponse.json(
                { error: 'Missing required fields: promptId, name, label' },
                { status: 400 }
            );
        }

        // Get the prompt and verify ownership
        const prompt = await prisma.prompt.findFirst({
            where: {
                id: promptId,
                clientId,
            },
        });

        if (!prompt || !prompt.liveBranchId) {
            return NextResponse.json(
                { error: 'Prompt not found or no live branch' },
                { status: 404 }
            );
        }

        // Get the live branch's head version
        const liveBranch = await prisma.branch.findUnique({
            where: { id: prompt.liveBranchId },
        });

        if (!liveBranch || !liveBranch.headVersionId) {
            return NextResponse.json(
                { error: 'Live branch head version not found' },
                { status: 404 }
            );
        }

        // Get the head version content
        const headVersion = await prisma.promptVersion.findUnique({
            where: { id: liveBranch.headVersionId },
        });

        if (!headVersion) {
            return NextResponse.json(
                { error: 'Head version not found' },
                { status: 404 }
            );
        }

        // Create new branch with copied content
        const newBranch = await prisma.branch.create({
            data: {
                promptId,
                name,
                label,
                baseVersionId: headVersion.id,
                createdBy: userName || userId,
                updatedBy: userName || userId,
                versions: {
                    create: {
                        content: headVersion.content,
                        label: `Branched from ${liveBranch.label}`,
                        parentVersionId: headVersion.id,
                        createdBy: userName || userId,
                        updatedBy: userName || userId,
                    },
                },
            },
            include: {
                versions: true,
            },
        });

        // Set the head version for the new branch
        const branchVersion = newBranch.versions[0];
        await prisma.branch.update({
            where: { id: newBranch.id },
            data: { headVersionId: branchVersion.id },
        });

        return NextResponse.json(newBranch);
    } catch (error) {
        console.error('Error creating branch:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
