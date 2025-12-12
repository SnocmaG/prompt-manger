import { auth, currentUser } from '@clerk/nextjs/server';

export async function getCurrentUser() {
    const user = await currentUser();
    return user;
}

export async function getUserId() {
    const { userId } = await auth();
    return userId;
}

export async function getClientId() {
    const user = await currentUser();
    if (!user) return null;

    // Use the user's ID as the clientId for now
    // In a multi-tenant setup, you might use organization ID or custom metadata
    return user.id;
}

export async function getUserInfo() {
    const user = await currentUser();
    if (!user) {
        return {
            userId: null,
            clientId: null,
            email: null,
            name: null,
        };
    }

    return {
        userId: user.id,
        clientId: user.id, // Using userId as clientId
        email: user.emailAddresses[0]?.emailAddress || null,
        name: user.firstName && user.lastName
            ? `${user.firstName} ${user.lastName}`
            : user.firstName || user.emailAddresses[0]?.emailAddress || 'Unknown',
    };
}
