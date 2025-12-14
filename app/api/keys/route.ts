import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserInfo } from '@/lib/auth';
import { randomBytes } from 'crypto';

export async function GET() {
    try {
        const { clientId, userId } = await getUserInfo();

        if (!clientId || !userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const keys = await prisma.apiKey.findMany({
            where: { clientId },
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                name: true,
                // Do NOT return the key itself in list
                key: false,
                createdAt: true,
                lastUsed: true,
                createdBy: true
            }
        });

        // Add a mask to the key for display if needed, but usually we just don't show it.
        // For UI, we might want to show "sk_...abcd"
        const maskedKeys = await Promise.all(keys.map(async (k: typeof keys[0]) => {
            // We can't actually mask it because we didn't select it. 
            // That's fine, standard practice is you never see it again.
            // But for UX, let's fetch the key just to mask it? 
            // Nah, let's select it and mask it here.
            const fullKey = await prisma.apiKey.findUnique({ where: { id: k.id }, select: { key: true } });
            return {
                ...k,
                maskedKey: fullKey?.key ? `${fullKey.key.substring(0, 7)}...${fullKey.key.substring(fullKey.key.length - 4)}` : '***'
            }
        }));

        return NextResponse.json(maskedKeys);
    } catch (error) {
        console.error('Error fetching keys:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const { clientId, userId } = await getUserInfo();

        if (!clientId || !userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { name } = body;

        if (!name) {
            return NextResponse.json({ error: 'Name is required' }, { status: 400 });
        }

        // Generate Key: sk_live_<random>
        const randomStr = randomBytes(24).toString('hex');
        const key = `sk_live_${randomStr}`;

        const newKey = await prisma.apiKey.create({
            data: {
                key,
                name,
                clientId,
                createdBy: userId
            }
        });

        return NextResponse.json(newKey);
    } catch (error) {
        console.error('Error creating key:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const { clientId, userId } = await getUserInfo();
        if (!clientId || !userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'ID is required' }, { status: 400 });
        }

        // Verify ownership
        const key = await prisma.apiKey.findUnique({ where: { id } });
        if (!key || key.clientId !== clientId) {
            return NextResponse.json({ error: 'Not found or access denied' }, { status: 404 });
        }

        await prisma.apiKey.delete({ where: { id } });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting key:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
