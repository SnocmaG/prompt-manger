import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding database...');

    // Create a demo prompt with initial version
    // Using transaction for atomicity (optional in seed but good practice)
    const prompt = await prisma.$transaction(async (tx) => {
        const newPrompt = await tx.prompt.create({
            data: {
                clientId: 'demo-client',
                name: 'welcome_email',
                createdBy: 'system',
                updatedBy: 'system',
            }
        });

        const initialVersion = await tx.promptVersion.create({
            data: {
                promptId: newPrompt.id,
                systemPrompt: `You are a friendly customer support assistant. Your goal is to help users with their questions in a warm and professional manner.

Key guidelines:
- Be concise but thorough
- Use a friendly, conversational tone
- Provide actionable solutions
- Ask clarifying questions when needed

Remember to always maintain a positive attitude and prioritize customer satisfaction.`,
                userPrompt: '',
                label: 'Initial version',
                createdBy: 'system',
                updatedBy: 'system',
            }
        });

        const updatedPrompt = await tx.prompt.update({
            where: { id: newPrompt.id },
            data: { liveVersionId: initialVersion.id },
            include: {
                versions: true
            }
        });

        return updatedPrompt;
    });

    console.log('✅ Seed completed successfully!');
    console.log(`Created prompt: ${prompt.name}`);
    console.log(`Created version: ${prompt.versions[0].label}`);
}

main()
    .catch((e) => {
        console.error('❌ Seed failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
