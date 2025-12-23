import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getUserInfo } from '@/lib/auth';

const prisma = new PrismaClient();

export async function POST(req: Request) {
    try {
        const user = await getUserInfo();
        const body = await req.json();
        const { client, inputType, limit = 10 } = body;

        const where: Record<string, unknown> = {};

        // Security: Enforce Client Scope
        if (!user.isAdmin) {
            // Standard User: Can ONLY see their own client data
            if (!user.clientId) {
                return NextResponse.json({ inputs: [] }); // No context, no data
            }
            where.client = user.clientId;
        } else {
            // Admin: Can filter by client if provided, otherwise sees all
            if (client) {
                if (Array.isArray(client)) {
                    if (client.length > 0) where.client = { in: client };
                } else {
                    where.client = client;
                }
            }
        }

        if (inputType) {
            if (Array.isArray(inputType)) {
                if (inputType.length > 0) where.inputType = { in: inputType };
            } else {
                where.inputType = inputType;
            }
        }

        // Future: Add metadata filtering here if needed (requires JSON filtering syntax)

        const inputs = await prisma.clientInput.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            take: limit
        });

        // Map back to a standard format if needed, but returning generic objects is fine
        // Maybe just flatten metadata?
        const mapped = inputs.map(i => ({
            ...i,
            // Flatten for easier UI consumption if helpful, or keep nested
            metadata: i.metadata,
            imageUrl: i.imageUrl
        }));

        return NextResponse.json({ inputs: mapped });

    } catch (e) {
        console.error('Failed to fetch inputs:', e);
        return NextResponse.json({ error: 'Failed to fetch inputs' }, { status: 500 });
    }
}
