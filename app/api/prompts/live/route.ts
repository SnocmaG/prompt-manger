import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const clientId = searchParams.get('clientId');
        const name = searchParams.get('name');
        const apiKey = request.headers.get('x-api-key');

        // Validate API key
        if (!apiKey || apiKey !== process.env.API_SECRET_KEY) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Validate required parameters
        if (!clientId || !name) {
            return NextResponse.json(
                { error: 'Missing required parameters: clientId and name' },
                { status: 400 }
            );
        }

        // Find the prompt
        const prompt = await prisma.prompt.findUnique({
            where: {
                clientId_name: {
                    clientId,
                    name,
                },
            },
            include: {
                branches: {
                    where: {
                        id: {
                            equals: prisma.prompt.fields.liveBranchId,
                        },
                    },
                    include: {
                        versions: {
                            orderBy: {
                                createdAt: 'desc',
                            },
                            take: 1,
                        },
                    },
                },
            },
        });

        if (!prompt || !prompt.liveBranchId) {
            return NextResponse.json(
                { error: 'Prompt not found or no live branch set' },
                { status: 404 }
            );
        }

        // Get the live branch
        const liveBranch = await prisma.branch.findUnique({
            where: { id: prompt.liveBranchId },
            include: {
                versions: {
                    where: {
                        id: {
                            // Get the head version
                            equals: prisma.branch.fields.headVersionId,
                        },
                    },
                },
            },
        });

        if (!liveBranch || !liveBranch.headVersionId) {
            return NextResponse.json(
                { error: 'Live branch not found or no head version' },
                { status: 404 }
            );
        }

        // Get the head version
        const headVersion = await prisma.promptVersion.findUnique({
            where: { id: liveBranch.headVersionId },
        });

        if (!headVersion) {
            return NextResponse.json(
                { error: 'Head version not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            content: headVersion.content,
            branchLabel: liveBranch.label,
            versionLabel: headVersion.label,
            updatedAt: headVersion.updatedAt.toISOString(),
            updatedBy: headVersion.updatedBy,
        });
    } catch (error) {
        console.error('Error fetching live prompt:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
