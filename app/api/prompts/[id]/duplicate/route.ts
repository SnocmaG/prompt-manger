import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserInfo } from '@/lib/auth';

export async function POST(
    request: NextRequest,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    try {
        const { clientId, userId, name: userName } = await getUserInfo();

        if (!clientId || !userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const promptId = params.id;

        // 1. Fetch source prompt with its versions (to get latest)
        const sourcePrompt = await prisma.prompt.findFirst({
            where: {
                id: promptId,
                clientId
            },
            include: {
                versions: {
                    orderBy: { createdAt: 'desc' },
                    take: 1
                }
            }
        });

        if (!sourcePrompt) {
            return NextResponse.json({ error: 'Prompt not found' }, { status: 404 });
        }

        const sourceVersion = sourcePrompt.versions[0];

        // 2. Determine new unique name
        let newName = `${sourcePrompt.name}_copy`;
        let counter = 1;
        while (true) {
            const existing = await prisma.prompt.findFirst({
                where: { clientId, name: newName }
            });
            if (!existing) break;
            newName = `${sourcePrompt.name}_copy_${counter}`;
            counter++;
        }

        // 3. Create Copied Prompt and Initial Version Transactionally
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const newPrompt = await prisma.$transaction(async (tx: any) => {
            const createdPrompt = await tx.prompt.create({
                data: {
                    clientId,
                    name: newName,
                    defaultModel: sourcePrompt.defaultModel,
                    createdBy: userName || userId,
                    updatedBy: userName || userId,
                }
            });

            // Create initial version based on source's HEAD
            await tx.promptVersion.create({
                data: {
                    promptId: createdPrompt.id,
                    systemPrompt: sourceVersion ? sourceVersion.systemPrompt : '',
                    userPrompt: sourceVersion ? sourceVersion.userPrompt : '',
                    label: 'Initial version (Copy)',
                    createdBy: userName || userId,
                    updatedBy: userName || userId,
                }
            });

            // If source was live, should we deploy the copy? Maybe not initially.
            // Let's keep it undeployed (no liveVersionId) for safety.

            return createdPrompt;
        });

        return NextResponse.json(newPrompt);

    } catch (error) {
        console.error('Error duplicating prompt:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
