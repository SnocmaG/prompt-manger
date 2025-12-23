import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
    try {
        const clients = await prisma.review.findMany({
            distinct: ['client'],
            select: {
                client: true
            },
            orderBy: {
                client: 'asc'
            }
        });

        const flatClients = clients
            .map(c => c.client)
            .filter((c): c is string => !!c);

        return NextResponse.json(flatClients);
    } catch (e) {
        console.error('Failed to fetch clients:', e);
        return NextResponse.json({ error: 'Failed to fetch clients' }, { status: 500 });
    }
}
