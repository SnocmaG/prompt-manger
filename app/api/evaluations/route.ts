
import { NextRequest, NextResponse } from 'next/server';
import { getUserInfo } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
    const { clientId } = await getUserInfo();
    if (!clientId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { name } = body;

        if (!name) {
            return NextResponse.json({ error: 'Name is required' }, { status: 400 });
        }

        const evaluation = await prisma.evaluation.create({
            data: {
                clientId,
                name,
            }
        });

        return NextResponse.json(evaluation);
    } catch (error) {
        console.error('Failed to create evaluation', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
