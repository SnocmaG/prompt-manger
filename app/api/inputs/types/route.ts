import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
    try {
        const types = await prisma.clientInput.findMany({
            select: {
                inputType: true
            },
            distinct: ['inputType']
        });

        const names = types.map(t => t.inputType).filter(Boolean).sort();
        return NextResponse.json(names);
    } catch (e) {
        console.error('Failed to fetch types:', e);
        return NextResponse.json([], { status: 500 });
    }
}
