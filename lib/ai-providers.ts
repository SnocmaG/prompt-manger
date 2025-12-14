// AI Provider integrations for testing prompts

export type AIProvider = 'openai' | 'anthropic' | 'mock';

interface AITestRequest {
    provider: AIProvider;
    promptContent: string;
    testInput?: string;
    model?: string;
}

interface AITestResponse {
    success: boolean;
    output: string;
    provider: AIProvider;
    error?: string;
    model?: string;
}



export async function testWithOpenAI(
    promptContent: string,
    testInput?: string,
    model: string = 'gpt-4o-mini'
): Promise<string> {
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
        throw new Error('OpenAI API key not configured');
    }

    const isNewModel = model.startsWith('gpt-5') || model.startsWith('o1') || model.startsWith('o3');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const body: any = {
        model: model,
        messages: [
            { role: 'system', content: promptContent },
            ...(testInput ? [{ role: 'user', content: testInput }] : []),
        ],
    };

    if (isNewModel) {
        body.max_completion_tokens = 500;
    } else {
        body.max_tokens = 500;
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify(body),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'OpenAI API error');
    }

    const data = await response.json();

    if (isNewModel) {
        console.log('[OpenAI Debug] Response for', model, ':', JSON.stringify(data, null, 2));
    }

    const content = data.choices[0]?.message?.content;

    if (!content) {
        console.warn('OpenAI returned no content:', data);
        if (data.error) return `Error: ${data.error.message}`;
        return `[No content returned by API for model ${model}. Raw response logged.]`;
    }

    return content;
}

export async function testWithAnthropic(
    promptContent: string,
    testInput?: string
): Promise<string> {
    const apiKey = process.env.ANTHROPIC_API_KEY;

    if (!apiKey) {
        throw new Error('Anthropic API key not configured');
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
            model: 'claude-3-sonnet-20240229',
            max_tokens: 500,
            system: promptContent,
            messages: testInput ? [{ role: 'user', content: testInput }] : [],
        }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Anthropic API error');
    }

    const data = await response.json();
    return data.content[0]?.text || 'No response';
}

export async function testWithMock(
    promptContent: string,
    testInput?: string
): Promise<string> {
    // Simulated response for testing without API keys
    return `✅ Mock Test Successful!

Prompt Content:
${promptContent}

${testInput ? `\nTest Input:\n${testInput}\n` : ''}

This is a simulated response. Configure OpenAI or Anthropic API keys in your environment to test with real AI models.

Response would appear here based on your prompt and input.`;
}

export async function testPrompt(request: AITestRequest): Promise<AITestResponse> {
    try {
        let output: string;
        let effectiveModel = request.model;

        switch (request.provider) {

            case 'openai':
                effectiveModel = request.model || 'gpt-4o-mini';
                output = await testWithOpenAI(request.promptContent, request.testInput, effectiveModel);
                break;
            case 'anthropic':
                // For now hardcoded in existing function, but we can expose if needed
                output = await testWithAnthropic(request.promptContent, request.testInput);
                break;
            case 'mock':
            default:
                output = await testWithMock(request.promptContent, request.testInput);
                break;
        }

        return {
            success: true,
            output,
            provider: request.provider,
            model: effectiveModel,
        };
    } catch (error) {
        return {
            success: false,
            output: '',
            provider: request.provider,
            error: error instanceof Error ? error.message : 'Unknown error',
        };
    }
}
