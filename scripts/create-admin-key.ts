import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

async function main() {
    const key = `sk_live_admin_${crypto.randomBytes(12).toString('hex')}`;

    // We'll assign this to the 'snircomag@gmail.com' user effectively, 
    // but the ID assumes we know it? 
    // Actually, let's just create it with a placeholder ID if we don't have one, 
    // or better, fetch the first user?
    // Since we don't sync users perfectly, let's just use a hardcoded 'admin-script' user ID 
    // or try to find an existing prompt's creator?
    // Let's use 'user_2pg...' if we knew it. 
    // Safest: Use a distinct ID.
    const adminUserId = 'admin_script_user';

    const apiKey = await prisma.apiKey.create({
        data: {
            key,
            name: 'Master Admin Key',
            clientId: adminUserId, // This ID will be seeing ALL prompts so clientId doesn't matter much for fetching, but useful for creation
            createdBy: adminUserId,
            isAdmin: true
        }
    });

    console.log(`\n\nCREATED ADMIN KEY:\n${apiKey.key}\n\n`);
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
