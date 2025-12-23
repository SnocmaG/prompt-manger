import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { reviews, client = "Default" } = body;

        if (!reviews || !Array.isArray(reviews) || reviews.length === 0) {
            return NextResponse.json({ error: 'No reviews provided' }, { status: 400 });
        }

        // Prepare data for batch insert
        // Assuming review inputs are strings (text only) or objects. 
        // Based on current simple smart-import, inputs are just strings (cases).
        // We will map them to simple Review objects.

        const reviewData = reviews.map((text: string) => ({
            reviewId: crypto.randomUUID(),
            reviewText: text,
            client: client,
            // Defaults
            starRating: null,
            reviewType: 'Imported',
            reviewDate: new Date()
        }));

        const result = await prisma.review.createMany({
            data: reviewData
        });

        return NextResponse.json({
            success: true,
            count: result.count,
            message: `Successfully imported ${result.count} reviews for ${client}`
        });

    } catch (e) {
        console.error('Failed to ingest reviews:', e);
        return NextResponse.json({ error: 'Failed to ingest reviews' }, { status: 500 });
    }
}
