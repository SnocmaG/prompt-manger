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

        const prompt = await prisma.prompt.findUnique({
            where: { id: promptId },
            include: {
                versions: {
                    orderBy: { createdAt: 'desc' },
                    take: 5 // Limit to recent versions
                }
            }
        });

        if (!prompt) {
            return NextResponse.json({ error: 'Prompt not found' }, { status: 404 });
        }

        return NextResponse.json(prompt);

    } catch (error) {
        console.error('Error fetching prompt:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
