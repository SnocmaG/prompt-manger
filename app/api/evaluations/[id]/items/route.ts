
import { NextRequest, NextResponse } from 'next/server';
import { getUserInfo } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { clientId } = await getUserInfo();
    const { id } = await params; // await params in Next.js 15

    if (!clientId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { input, expectedOutput } = body;

        // Verify ownership
        const evaluation = await prisma.evaluation.findUnique({
            where: { id }
        });

        if (!evaluation || evaluation.clientId !== clientId) {
            return NextResponse.json({ error: 'Not found' }, { status: 404 });
        }

        const item = await prisma.evaluationItem.create({
            data: {
                evaluationId: id,
                input,
                expectedOutput
            }
        });

        return NextResponse.json(item);
    } catch (error) {
        console.error('Failed to create item', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
