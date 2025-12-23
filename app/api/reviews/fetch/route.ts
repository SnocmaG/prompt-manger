import { NextResponse } from 'next/server';
import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { ratings, types, clients, limit = 10 } = body;

        // Build Where Clause
        const where: Prisma.ReviewWhereInput = {
            reviewText: {
                not: '' // Ensure we get actual text
            }
        };

        if (ratings && Array.isArray(ratings) && ratings.length > 0) {
            where.starRating = { in: ratings };
        }

        if (types && Array.isArray(types) && types.length > 0) {
            where.reviewType = { in: types };
        }

        if (clients && Array.isArray(clients) && clients.length > 0) {
            where.client = { in: clients };
        }

        const reviews = await prisma.review.findMany({
            where,
            take: Math.min(limit, 100), // Cap at 100 for safety
            orderBy: {
                createdAt: 'desc'
            },
            select: {
                reviewText: true
            }
        });

        return NextResponse.json({
            count: reviews.length,
            reviews: reviews.map(r => r.reviewText)
        });

    } catch (e) {
        console.error('Failed to fetch reviews:', e);
        return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 });
    }
}
