import { auth, currentUser } from '@clerk/nextjs/server';
import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';

const ADMIN_EMAILS = ['snircomag@gmail.com', 'snir@moonshot.com'];

export async function getCurrentUser() {
    const user = await currentUser();
    return user;
}

export async function getUserId() {
    const { userId } = await auth();
    return userId;
}

export async function getClientId() {
    const info = await getUserInfo();
    return info.clientId;
}

export async function getUserInfo() {
    // 1. Check for API Key first
    const headersList = await headers();
    let apiKey = headersList.get('x-api-key');

    // Check Authorization header fallback (Bearer)
    if (!apiKey) {
        const authHeader = headersList.get('authorization');
        if (authHeader && authHeader.startsWith('Bearer ')) {
            apiKey = authHeader.replace('Bearer ', '').trim();
        }
    }

    if (apiKey) {
        // 0. Check for Environment Variable Admin Key (Fast path, no DB)
        // Support both ADMIN_API_KEY and the legacy API_SECRET_KEY from Render
        const systemKey = process.env.ADMIN_API_KEY || process.env.API_SECRET_KEY;
        if (systemKey && apiKey === systemKey) {
            return {
                userId: 'admin',
                clientId: 'admin',
                email: 'admin@system',
                name: 'System Admin',
                isAdmin: true
            };
        }

        const keyRecord = await prisma.apiKey.findUnique({
            where: { key: apiKey }
        });

        if (keyRecord) {
            // Update last usage asynchronously
            await prisma.apiKey.update({
                where: { id: keyRecord.id },
                data: { lastUsed: new Date() }
            }).catch(console.error);

            return {
                userId: keyRecord.createdBy,
                clientId: keyRecord.clientId,
                email: 'api-key-user',
                name: keyRecord.name,
                isAdmin: keyRecord.isAdmin // API keys now support Admin superpowers if flagged in DB
            };
        }
    }

    // 2. Fallback to Clerk Auth
    const user = await currentUser();
    const { orgId } = await auth();

    if (!user) {
        return {
            userId: null,
            clientId: null,
            email: null,
            name: null,
            isAdmin: false
        };
    }

    const email = user.emailAddresses[0]?.emailAddress || null;
    const isAdmin = email ? ADMIN_EMAILS.includes(email) : false;

    return {
        userId: user.id,
        // Workspace context: prioritize Organization ID, fallback to Personal ID
        clientId: orgId || user.id,
        email: email,
        name: user.firstName && user.lastName
            ? `${user.firstName} ${user.lastName}`
            : user.firstName || user.emailAddresses[0]?.emailAddress || 'Unknown',
        isAdmin
    };
}
