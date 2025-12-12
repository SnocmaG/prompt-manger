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
    const { orgId, userId } = await auth();

    // If an organization is selected, use that as the clientId (Workspace ID)
    if (orgId) return orgId;

    // Otherwise fall back to personal user ID
    if (userId) return userId;

    return null;
}

export async function getUserInfo() {
    const user = await currentUser();
    const { orgId } = await auth();

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
        // Workspace context: prioritize Organization ID, fallback to Personal ID
        clientId: orgId || user.id,
        email: user.emailAddresses[0]?.emailAddress || null,
        name: user.firstName && user.lastName
            ? `${user.firstName} ${user.lastName}`
            : user.firstName || user.emailAddresses[0]?.emailAddress || 'Unknown',
    };
}
