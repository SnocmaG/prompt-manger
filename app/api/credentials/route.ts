
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';

export async function GET() {
    const { userId } = auth();
    if (!userId) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        const credentials = await prisma.lLMCredential.findMany({
            where: {
                clientId: userId,
            },
            orderBy: {
                createdAt: 'desc',
            },
            select: {
                id: true,
                name: true,
                provider: true,
                isDefault: true,
                createdAt: true,
                // Do NOT return the actual apiKey for security, or return masked
                apiKey: false,
            }
        });

        // We might want to indicate if a system default is available
        const hasSystemKey = !!process.env.OPENAI_API_KEY;

        return NextResponse.json({
            credentials,
            hasSystemKey
        });
    } catch (error) {
        console.error("Error fetching credentials:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}

export async function POST(req: Request) {
    const { userId } = auth();
    if (!userId) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        const body = await req.json();
        const { name, apiKey, provider = 'openai' } = body;

        if (!name || !apiKey) {
            return new NextResponse("Missing required fields", { status: 400 });
        }

        // Check if user has any existing credentials for this provider
        const existingCount = await prisma.lLMCredential.count({
            where: {
                clientId: userId,
                provider: provider
            }
        });

        const credential = await prisma.lLMCredential.create({
            data: {
                name,
                apiKey, // Storing plain text as requested
                provider,
                clientId: userId,
                isDefault: existingCount === 0, // Auto-set default if it's the first one
            }
        });

        return NextResponse.json(credential);
    } catch (error) {
        console.error("Error creating credential:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}

export async function PUT(req: Request) {
    const { userId } = auth();
    if (!userId) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        const body = await req.json();
        const { id, isDefault } = body;

        if (!id) {
            return new NextResponse("Missing id", { status: 400 });
        }

        if (isDefault) {
            // Transaction to unset other defaults and set this one
            await prisma.$transaction([
                prisma.lLMCredential.updateMany({
                    where: { clientId: userId, isDefault: true },
                    data: { isDefault: false }
                }),
                prisma.lLMCredential.update({
                    where: { id, clientId: userId },
                    data: { isDefault: true }
                })
            ]);
        } else {
            // Just update
            await prisma.lLMCredential.update({
                where: { id, clientId: userId },
                data: { isDefault: false } // or other fields if we add them
            });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error updating credential:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}

export async function DELETE(req: Request) {
    const { userId } = auth();
    if (!userId) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!id) {
            return new NextResponse("Missing id", { status: 400 });
        }

        await prisma.lLMCredential.delete({
            where: {
                id,
                clientId: userId
            }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting credential:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
