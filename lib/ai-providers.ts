// AI Provider integrations for testing prompts

export type AIProvider = 'openai' | 'anthropic' | 'mock';

interface AITestRequest {
    provider: AIProvider;
    promptContent: string;
    testInput?: string;
    model?: string;
    apiKey?: string;
    imageUrl?: string;
}

interface AITestResponse {
    success: boolean;
    output: string;
    provider: AIProvider;
    error?: string;
    model?: string;
    usage?: {
        prompt_tokens: number;
        completion_tokens: number;
        total_tokens: number;
    };
    latencyMs?: number;
}



interface TokenUsage {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
}

export async function testWithOpenAI(
    promptContent: string,
    testInput?: string,
    model: string = 'gpt-4o-mini',
    apiKey?: string,
    imageUrl?: string
): Promise<{ content: string; usage?: TokenUsage; latencyMs: number }> {
    const effectiveApiKey = apiKey?.trim() || process.env.OPENAI_API_KEY?.trim();

    if (!effectiveApiKey) {
        throw new Error('OpenAI API key not configured');
    }

    console.log(`[OpenAI Debug] Testing model: ${model}`);

    const isNewArchitecture = model.startsWith('o1') || model.startsWith('o3') || model.startsWith('gpt-5');

    // Chat Payload
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const chatBody: any = {
        model: model,
        messages: [
            { role: 'system', content: promptContent },
            // User message: Text only OR Multimodal
            ...(testInput || imageUrl ? [{
                role: 'user',
                content: imageUrl
                    ? [
                        { type: 'text', text: testInput || '' },
                        { type: 'image_url', image_url: { url: imageUrl } }
                    ]
                    : testInput || ''
            }] : []),
        ],
    };

    if (isNewArchitecture) {
        chatBody.max_completion_tokens = 1000;
    } else {
        chatBody.max_tokens = 1000;
    }

    const startTime = Date.now();
    let response;
    let retried = false;

    try {
        // Attempt 1: Chat Completions
        response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${effectiveApiKey}`,
            },
            body: JSON.stringify(chatBody),
        });

        // Retry logic managed here... 
        if (!response.ok) {
            const initialError = await response.json();
            const initialErrorMessage = initialError.error?.message || '';

            console.warn(`[OpenAI Debug] Error with model ${model}: ${initialErrorMessage}`);

            // Error Case 1: "Not a chat model" -> Retry with Completions API
            if (initialErrorMessage.includes('This is not a chat model')) {
                console.log(`[OpenAI Debug] Switching to /v1/completions for ${model}`);
                retried = true;
                // Attempt 2: Completions
                const prompt = `${promptContent}\n\n${testInput || ''}`;
                const completionBody = {
                    model: model,
                    prompt: prompt,
                    max_tokens: 1000,
                };

                response = await fetch('https://api.openai.com/v1/completions', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${effectiveApiKey}`,
                    },
                    body: JSON.stringify(completionBody),
                });
            }
            // Error Case 2: "max_tokens is not supported" -> Retry with max_completion_tokens
            else if (initialErrorMessage.includes("'max_tokens' is not supported")) {
                console.log(`[OpenAI Debug] Retrying with max_completion_tokens for ${model}`);
                retried = true;

                // Remove max_tokens and add max_completion_tokens
                delete chatBody.max_tokens;
                chatBody.max_completion_tokens = 1000;

                response = await fetch('https://api.openai.com/v1/chat/completions', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${effectiveApiKey}`,
                    },
                    body: JSON.stringify(chatBody),
                });
            }

            // Check response again after retry
            if (!response.ok) {
                // If we didn't retry, or if the retry failed
                if (!retried) {
                    throw new Error(initialErrorMessage || 'OpenAI API error');
                }

                // If we DID retry and it failed again:
                const retryError = await response.json();
                throw new Error(retryError.error?.message || 'OpenAI API retry error');
            }
        }
    } catch (e) {
        throw e;
    }

    const endTime = Date.now();
    const latencyMs = endTime - startTime;

    let data;

    // If a retry to /completions was successful, handle its specific data structure
    if (retried && response && response.url.includes('/completions')) {
        data = await response.json();
        return {
            content: data.choices[0]?.text || '[No content returned]',
            usage: data.usage,
            latencyMs
        };
    }

    // Otherwise, handle chat completions data structure (either initial success or chat retry success)
    data = await response.json();

    const content = data.choices[0]?.message?.content;

    if (!content) {
        console.warn('OpenAI returned no content:', data);
        if (data.error) throw new Error(`Error: ${data.error.message}`);
        return {
            content: `[No content returned by API for model ${model}. Raw response logged.]`,
            usage: data.usage,
            latencyMs
        };
    }

    return {
        content,
        usage: data.usage,
        latencyMs
    };
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
        let output: string = '';
        let effectiveModel = request.model;
        let usage;
        let latencyMs;

        switch (request.provider) {

            case 'openai':
                effectiveModel = request.model || 'gpt-4o-mini';
                effectiveModel = request.model || 'gpt-4o-mini';
                const result = await testWithOpenAI(request.promptContent, request.testInput, effectiveModel, request.apiKey, request.imageUrl);
                output = result.content;
                usage = result.usage;
                latencyMs = result.latencyMs;
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
            usage,
            latencyMs
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
