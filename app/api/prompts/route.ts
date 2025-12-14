import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserInfo } from '@/lib/auth';

export async function GET() {
    try {
        const { clientId, isAdmin } = await getUserInfo();

        if (!clientId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const where = isAdmin ? {} : { clientId };

        const prompts = await prisma.prompt.findMany({
            where,
            include: {
                _count: {
                    select: { versions: true }
                }
            },
            orderBy: { createdAt: 'desc' },
        });

        return NextResponse.json(prompts);
    } catch (error) {
        console.error('Error fetching prompts:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const { clientId, userId, name: userName } = await getUserInfo();

        if (!clientId || !userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { name } = body;

        if (!name) {
            return NextResponse.json(
                { error: 'Missing required field: name' },
                { status: 400 }
            );
        }

        // Create prompt with initial version
        // We use a transaction to ensure both are created
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const prompt = await prisma.$transaction(async (tx: any) => {
            const newPrompt = await tx.prompt.create({
                data: {
                    clientId,
                    name,
                    createdBy: userName || userId,
                    updatedBy: userName || userId,
                }
            });

            const initialVersion = await tx.promptVersion.create({
                data: {
                    promptId: newPrompt.id,
                    systemPrompt: '',
                    userPrompt: '',
                    label: 'Initial version',
                    createdBy: userName || userId,
                    updatedBy: userName || userId,
                }
            });

            const updatedPrompt = await tx.prompt.update({
                where: { id: newPrompt.id },
                data: { liveVersionId: initialVersion.id },
                include: {
                    versions: true // return versions to client
                }
            });

            return updatedPrompt;
        });

        return NextResponse.json(prompt);
    } catch (error) {
        console.error('Error creating prompt:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
