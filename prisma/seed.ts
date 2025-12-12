import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding database...');

    // Create a demo prompt with main branch
    const prompt = await prisma.prompt.create({
        data: {
            clientId: 'demo-client',
            name: 'welcome_email',
            createdBy: 'system',
            updatedBy: 'system',
            branches: {
                create: {
                    name: 'main',
                    label: 'Main',
                    createdBy: 'system',
                    updatedBy: 'system',
                    versions: {
                        create: {
                            content: `You are a friendly customer support assistant. Your goal is to help users with their questions in a warm and professional manner.

Key guidelines:
- Be concise but thorough
- Use a friendly, conversational tone
- Provide actionable solutions
- Ask clarifying questions when needed

Remember to always maintain a positive attitude and prioritize customer satisfaction.`,
                            label: 'Initial version',
                            createdBy: 'system',
                            updatedBy: 'system',
                        },
                    },
                },
            },
        },
        include: {
            branches: {
                include: {
                    versions: true,
                },
            },
        },
    });

    // Update the branch to set headVersionId
    const mainBranch = prompt.branches[0];
    const initialVersion = mainBranch.versions[0];

    await prisma.branch.update({
        where: { id: mainBranch.id },
        data: { headVersionId: initialVersion.id },
    });

    // Update the prompt to set liveBranchId
    await prisma.prompt.update({
        where: { id: prompt.id },
        data: { liveBranchId: mainBranch.id },
    });

    console.log('✅ Seed completed successfully!');
    console.log(`Created prompt: ${prompt.name}`);
    console.log(`Created branch: ${mainBranch.name}`);
    console.log(`Created version: ${initialVersion.label}`);
}

main()
    .catch((e) => {
        console.error('❌ Seed failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
