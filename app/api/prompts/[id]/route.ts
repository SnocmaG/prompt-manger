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
                branches: {
                    include: {
                        versions: {
                            orderBy: { createdAt: 'desc' },
                        },
                    },
                    orderBy: { createdAt: 'asc' },
                },
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
