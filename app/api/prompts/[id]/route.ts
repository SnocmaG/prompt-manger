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

        const prompt = await prisma.prompt.findFirst({
            where: {
                id,
                clientId,
            },
            include: {
                versions: {
                    orderBy: { createdAt: 'desc' },
                },
                environments: true, // Include deployments
                executions: {
                    orderBy: { createdAt: 'desc' },
                    take: 20
                }
            },
        });

        if (!prompt) {
            return NextResponse.json({ error: 'Prompt not found' }, { status: 404 });
        }

        return NextResponse.json(prompt);
    } catch (error) {
        console.error('Error fetching prompt:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

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
        const { name, liveVersionId, deployment, defaultModel } = body;

        // 1. Update basic prompt fields
        const updatedPrompt = await prisma.prompt.update({
            where: {
                id,
                clientId // Ensure ownership
            },
            data: {
                ...(name && { name }),
                ...(defaultModel && { defaultModel }),
                updatedBy: userName || userId,
            },
            include: {
                environments: true
            }
        });

        // 2. Handle Deployments (Environments)
        // New way: { deployment: { slug: 'staging', versionId: '...' } }
        if (deployment) {
            const { slug, versionId } = deployment;
            await prisma.promptEnvironment.upsert({
                where: {
                    promptId_slug: { promptId: id, slug }
                },
                update: { versionId },
                create: { promptId: id, slug, versionId }
            });
        }

        // Backward compatibility: liveVersionId -> 'production'
        if (liveVersionId) {
            await prisma.promptEnvironment.upsert({
                where: {
                    promptId_slug: { promptId: id, slug: 'production' }
                },
                update: { versionId: liveVersionId },
                create: { promptId: id, slug: 'production', versionId: liveVersionId }
            });
        }

        return NextResponse.json(updatedPrompt);
    } catch (error) {
        console.error('Error updating prompt:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
