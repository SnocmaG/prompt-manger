import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
    try {
        // Fetch distinct review types
        // Note: Prisma distinct is distinct on rows, but here we want distinct values of a column
        const types = await prisma.review.findMany({
            distinct: ['reviewType'],
            select: {
                reviewType: true
            },
            where: {
                reviewType: {
                    not: null
                }
            },
            orderBy: {
                reviewType: 'asc'
            }
        });

        // Map to flat array of strings
        const flatTypes = types
            .map(t => t.reviewType)
            .filter((t): t is string => !!t);

        return NextResponse.json(flatTypes);
    } catch (e) {
        console.error('Failed to fetch review types:', e);
        return NextResponse.json({ error: 'Failed to fetch types' }, { status: 500 });
    }
}
