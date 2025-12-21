
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('🔒 Starting Database Hardening...');

    // 1. Create Trigger Function
    console.log('Creating trigger function...');
    await prisma.$executeRawUnsafe(`
        CREATE OR REPLACE FUNCTION update_updated_at_column()
        RETURNS TRIGGER AS $$
        BEGIN
            NEW."updatedAt" = NOW();
            RETURN NEW;
        END;
        $$ language 'plpgsql';
    `);

    // Tables with BOTH createdAt and updatedAt (Apply Trigger)
    const tablesWithUpdate = [
        'Prompt',
        'PromptEnvironment',
        'PromptVersion',
        'Evaluation',
        'Review'
    ];

    // Tables with ONLY createdAt (Just constraints)
    const tablesCreatedOnly = [
        'PromptExecution',
        'ApiKey',
        'EvaluationItem',
        'EvaluationRun',
        'EvaluationResult'
    ];

    // -- Process Tables with updatedAt --
    for (const table of tablesWithUpdate) {
        console.log(`Processing ${table}...`);

        // 1. Enforce createdAt
        await safeExecute(`UPDATE "${table}" SET "createdAt" = NOW() WHERE "createdAt" IS NULL`);
        await safeExecute(`ALTER TABLE "${table}" ALTER COLUMN "createdAt" SET DEFAULT NOW()`);
        await safeExecute(`ALTER TABLE "${table}" ALTER COLUMN "createdAt" SET NOT NULL`);

        // 2. Enforce updatedAt
        await safeExecute(`UPDATE "${table}" SET "updatedAt" = NOW() WHERE "updatedAt" IS NULL`);
        await safeExecute(`ALTER TABLE "${table}" ALTER COLUMN "updatedAt" SET DEFAULT NOW()`);
        await safeExecute(`ALTER TABLE "${table}" ALTER COLUMN "updatedAt" SET NOT NULL`);

        // 3. Attach Trigger
        await safeExecute(`DROP TRIGGER IF EXISTS set_updated_at ON "${table}"`);
        await safeExecute(`
            CREATE TRIGGER set_updated_at
            BEFORE UPDATE ON "${table}"
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
        `);
    }

    // -- Process Tables with createdAt only --
    for (const table of tablesCreatedOnly) {
        console.log(`Processing ${table} (createdAt only)...`);

        // 1. Enforce createdAt
        try {
            // Check if column exists first? Prisma schema implies it does.
            await safeExecute(`UPDATE "${table}" SET "createdAt" = NOW() WHERE "createdAt" IS NULL`);
            await safeExecute(`ALTER TABLE "${table}" ALTER COLUMN "createdAt" SET DEFAULT NOW()`);
            await safeExecute(`ALTER TABLE "${table}" ALTER COLUMN "createdAt" SET NOT NULL`);
        } catch (e: any) {
            console.warn(`Skipping ${table} createdAt enforcement (might not exist or other error): ${e.message}`);
        }
    }

    console.log('✅ Database Hardening Complete.');
}

async function safeExecute(query: string) {
    try {
        await prisma.$executeRawUnsafe(query);
    } catch (e: any) {
        // Ignorable errors? 
        // e.g. "column does not exist" if our checklist is wrong.
        // But for constraint violations, we want to know.
        console.error(`Error executing "${query}":`);
        console.error(e.message);
        // We generally continue to try other tables.
    }
}

main()
    .catch((e: any) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
