// AI Provider integrations for testing prompts

export type AIProvider = 'openai' | 'anthropic' | 'mock' | 'webhook';

interface AITestRequest {
    provider: AIProvider;
    promptContent: string;
    testInput?: string;
    webhookUrl?: string;
}

interface AITestResponse {
    success: boolean;
    output: string;
    provider: AIProvider;
    error?: string;
}

export async function testWithWebhook(
    promptContent: string,
    webhookUrl: string,
    testInput?: string
): Promise<string> {
    if (!webhookUrl) {
        throw new Error('Webhook URL is required');
    }

    try {
        const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                prompt: promptContent,
                input: testInput,
                timestamp: new Date().toISOString(),
            }),
        });

        if (!response.ok) {
            throw new Error(`Webhook failed with status: ${response.status}`);
        }

        const text = await response.text();
        return `✅ Webhook trigger successful!\n\nStatus: ${response.status} ${response.statusText}\nResponse: ${text.slice(0, 500)}${text.length > 500 ? '...' : ''}`;
    } catch (error) {
        throw new Error(`Webhook error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

export async function testWithOpenAI(
    promptContent: string,
    testInput?: string
): Promise<string> {
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
        throw new Error('OpenAI API key not configured');
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
            model: 'gpt-4',
            messages: [
                { role: 'system', content: promptContent },
                ...(testInput ? [{ role: 'user', content: testInput }] : []),
            ],
            max_tokens: 500,
        }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'OpenAI API error');
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || 'No response';
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

        switch (request.provider) {
            case 'webhook':
                output = await testWithWebhook(request.promptContent, request.webhookUrl!, request.testInput);
                break;
            case 'openai':
                output = await testWithOpenAI(request.promptContent, request.testInput);
                break;
            case 'anthropic':
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
