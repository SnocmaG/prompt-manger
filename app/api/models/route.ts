
import { NextResponse } from 'next/server';

interface OpenAIModel {
    id: string;
    created: number;
    object: string;
    owned_by: string;
}

export async function GET() {
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
        return NextResponse.json({ error: 'OpenAI API key not configured' }, { status: 500 });
    }

    try {
        const response = await fetch('https://api.openai.com/v1/models', {
            headers: {
                'Authorization': `Bearer ${apiKey} `,
            },
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error?.message || 'Failed to fetch models');
        }

        const data = await response.json();

        // Filter for chat models (gpt-*) and sort them
        // We might also want to include 'o1' or 'o3' if they become available via API in a standard way
        const models = data.data
            .filter((model: OpenAIModel) => model.id.includes('gpt') || model.id.startsWith('o1') || model.id.startsWith('o3'))
            .sort((a: OpenAIModel, b: OpenAIModel) => b.created - a.created); // Newest first

        return NextResponse.json(models);
    } catch (error) {
        console.error('Error fetching models:', error);
        return NextResponse.json(
            { error: 'Failed to fetch models from OpenAI' },
            { status: 500 }
        );
    }
}
