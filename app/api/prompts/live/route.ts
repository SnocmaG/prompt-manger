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
        });

        if (!prompt || !prompt.liveVersionId) {
            return NextResponse.json(
                { error: 'Prompt not found or no live version set' },
                { status: 404 }
            );
        }

        // Get the live version
        const liveVersion = await prisma.promptVersion.findUnique({
            where: { id: prompt.liveVersionId },
        });

        if (!liveVersion) {
            return NextResponse.json(
                { error: 'Live version not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            systemPrompt: liveVersion.systemPrompt,
            userPrompt: liveVersion.userPrompt,
            versionLabel: liveVersion.label,
            updatedAt: liveVersion.updatedAt.toISOString(),
            updatedBy: liveVersion.updatedBy,
        });
    } catch (error) {
        console.error('Error fetching live prompt:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
