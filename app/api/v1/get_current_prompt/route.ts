import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const promptId = searchParams.get('promptId');

        if (!promptId) {
            return NextResponse.json({ error: 'Missing promptId' }, { status: 400 });
        }



        // Revised cleaner query
        const targetPrompt = await prisma.prompt.findUnique({
            where: { id: promptId }
        });

        if (!targetPrompt) {
            return NextResponse.json({ error: 'Prompt not found' }, { status: 404 });
        }

        if (!targetPrompt.liveBranchId) {
            return NextResponse.json({ error: 'No live branch configured for this prompt' }, { status: 404 });
        }

        const liveBranch = await prisma.branch.findUnique({
            where: { id: targetPrompt.liveBranchId },
        });

        if (!liveBranch || !liveBranch.headVersionId) {
            return NextResponse.json({ error: 'Live branch or version not found' }, { status: 404 });
        }

        const version = await prisma.promptVersion.findUnique({
            where: { id: liveBranch.headVersionId }
        });

        if (!version) {
            return NextResponse.json({ error: 'Version content not found' }, { status: 404 });
        }

        return NextResponse.json({
            promptId: targetPrompt.id,
            name: targetPrompt.name,
            versionId: version.id,
            content: version.content,
            createdAt: version.createdAt
        });

    } catch (error) {
        console.error('Error fetching current prompt:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
