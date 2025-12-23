import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
    try {
        const clients = await prisma.clientInput.findMany({
            select: {
                client: true
            },
            distinct: ['client']
        });

        const names = clients.map(c => c.client).sort();
        return NextResponse.json(names);
    } catch (e) {
        console.error('Failed to fetch clients:', e);
        return NextResponse.json([], { status: 500 });
    }
}
