import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserInfo } from '@/lib/auth';

export async function GET(request: NextRequest) {
    try {
        const { clientId, userId } = await getUserInfo();

        if (!clientId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const prompts = await prisma.prompt.findMany({
            where: { clientId },
            include: {
                branches: {
                    include: {
                        versions: {
                            orderBy: { createdAt: 'desc' },
                            take: 1,
                        },
                    },
                },
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
    },
},
            },
include: {
    branches: {
        include: {
            versions: true,
                    },
    },
},
        });

// Update branch to set headVersionId
const mainBranch = prompt.branches[0];
const initialVersion = mainBranch.versions[0];

await prisma.branch.update({
    where: { id: mainBranch.id },
    data: { headVersionId: initialVersion.id },
});

// Update prompt to set liveBranchId
const updatedPrompt = await prisma.prompt.update({
    where: { id: prompt.id },
    data: { liveBranchId: mainBranch.id },
    include: {
        branches: {
            include: {
                versions: true,
            },
        },
    },
});

return NextResponse.json(updatedPrompt);
    } catch (error) {
    console.error('Error creating prompt:', error);
    return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
    );
}
}
