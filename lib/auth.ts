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
    const apiKey = headersList.get('x-api-key');

    if (apiKey) {
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
                isAdmin: false // API keys currently don't grant Admin superpowers unless we add a specific scope
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
