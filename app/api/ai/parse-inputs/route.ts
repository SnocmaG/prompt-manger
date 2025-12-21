import { NextRequest, NextResponse } from 'next/server';
import { getUserInfo } from '@/lib/auth';
import { testWithOpenAI } from '@/lib/ai-providers';

export const dynamic = 'force-dynamic';

const SYSTEM_PROMPT = `
You are a smart text parser helper.
Your goal is to split a bulk text input into distinct, logical test cases for an LLM prompt experiment.

Rules:
1. Analyze the structure of the input text.
2. Identify independent test cases (e.g. separated by newlines, dashes, numbers, or context).
3. Return a STRICT JSON array of strings.
4. Each string in the array should be one distinct test case.
5. Do not include markdown formatting (like \`\`\`json) in your response, just the raw JSON.
6. If the input seems to be just one case, return an array with one string.
`.trim();

export async function POST(request: NextRequest) {
    try {
        const { clientId } = await getUserInfo();
        if (!clientId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { text } = body;

        if (!text || typeof text !== 'string') {
            return NextResponse.json(
                { error: 'Missing or invalid text input' },
                { status: 400 }
            );
        }

        // We use 'gpt-4o-mini' for speed and cost effectiveness, as this is a simple utility task.
        const result = await testWithOpenAI(
            SYSTEM_PROMPT,
            text, // The user's bulk text
            'gpt-4o-mini'
        );

        // Sanitize result to ensure valid JSON
        let cleanResult = result.trim();
        if (cleanResult.startsWith('```json')) {
            cleanResult = cleanResult.replace(/^```json/, '').replace(/```$/, '');
        } else if (cleanResult.startsWith('```')) {
            cleanResult = cleanResult.replace(/^```/, '').replace(/```$/, '');
        }

        let parsed: string[];
        try {
            parsed = JSON.parse(cleanResult);
            if (!Array.isArray(parsed)) {
                throw new Error('Response is not an array');
            }
        } catch (_e) {
            console.error('Failed to parse AI response:', cleanResult);
            // Fallback: simple split by double newline if AI JSON fails
            parsed = text.split(/\n\s*\n/).filter(t => t.trim().length > 0);
        }

        return NextResponse.json({ cases: parsed });

    } catch (error) {
        console.error('Error parsing inputs with AI:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
