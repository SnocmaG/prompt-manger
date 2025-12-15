import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const promptId = searchParams.get('promptId');

        if (!promptId) {
            // Return all prompts with their live versions
            const allPrompts = await prisma.prompt.findMany({
                include: {
                    versions: true // We need this to find the live version content
                }
            });

            const result = allPrompts
                .filter(p => p.liveVersionId) // Only those with live versions
                .map(p => {
                    const liveVersion = p.versions.find(v => v.id === p.liveVersionId);
                    if (!liveVersion) return null;

                    return {
                        promptId: p.id,
                        name: p.name,
                        versionId: liveVersion.id,
                        systemPrompt: liveVersion.systemPrompt,
                        userPrompt: liveVersion.userPrompt,
                        label: liveVersion.label,
                        createdAt: liveVersion.createdAt,
                        env: 'production' // Default to production for this legacy-style endpoint compatibility
                    };
                })
                .filter(Boolean); // Remove nulls

            return NextResponse.json(result);
        }

        const targetPrompt = await prisma.prompt.findUnique({
            where: { id: promptId }
        });

        if (!targetPrompt) {
            return NextResponse.json({ error: 'Prompt not found' }, { status: 404 });
        }

        if (!targetPrompt.liveVersionId) {
            return NextResponse.json({ error: 'No live version configured for this prompt' }, { status: 404 });
        }

        const version = await prisma.promptVersion.findUnique({
            where: { id: targetPrompt.liveVersionId }
        });

        if (!version) {
            return NextResponse.json({ error: 'Version content not found' }, { status: 404 });
        }

        return NextResponse.json({
            promptId: targetPrompt.id,
            name: targetPrompt.name,
            versionId: version.id,
            systemPrompt: version.systemPrompt,
            userPrompt: version.userPrompt,
            label: version.label,
            createdAt: version.createdAt
        });

    } catch (error) {
        console.error('Error fetching current prompt:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
