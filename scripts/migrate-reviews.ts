
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function migrate() {
    console.log("Starting migration...");

    // Fetch all reviews
    const reviews = await prisma.review.findMany();
    console.log(`Found ${reviews.length} reviews to migrate.`);

    for (const review of reviews) {
        // Map data
        const metadata = {
            rating: review.starRating,
            reviewDate: review.reviewDate,
            originalType: review.reviewType
        };

        const existing = await prisma.clientInput.findFirst({
            where: { externalId: review.reviewId }
        });

        if (existing) {
            console.log(`Skipping ${review.reviewId} (already migrated)`);
            continue;
        }

        await prisma.clientInput.create({
            data: {
                externalId: review.reviewId,
                content: review.reviewText,
                client: review.client || "Default",
                inputType: "Review",
                metadata: metadata,
                createdAt: review.createdAt,
                updatedAt: review.updatedAt
            }
        });
    }

    console.log("Migration complete.");
}

migrate()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
