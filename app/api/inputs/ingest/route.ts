import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { inputs, client = "Default", inputType = "Generic" } = body;

        if (!inputs || !Array.isArray(inputs) || inputs.length === 0) {
            return NextResponse.json({ error: 'No inputs provided' }, { status: 400 });
        }

        const data = inputs.map((item: any) => {
            // Support both string inputs and object inputs with content/imageUrl
            const content = typeof item === 'string' ? item : item.content;
            const imageUrl = typeof item === 'object' ? item.imageUrl : undefined;

            return {
                externalId: crypto.randomUUID(),
                content: content,
                client: client,
                inputType: inputType,
                metadata: {}, // Default empty metadata
                imageUrl: imageUrl
            };
        });

        const result = await prisma.clientInput.createMany({
            data: data
        });

        return NextResponse.json({
            success: true,
            count: result.count,
            message: `Successfully imported ${result.count} inputs for ${client}`
        });

    } catch (e) {
        console.error('Failed to ingest inputs:', e);
        return NextResponse.json({ error: 'Failed to ingest inputs' }, { status: 500 });
    }
}
