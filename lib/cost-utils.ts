export function calculateCost(model: string = '', usage?: { prompt_tokens: number; completion_tokens: number; total_tokens: number }): number {
    if (!usage || !model) return 0;

    // Pricing per 1M tokens (approximate)
    let inputPrice = 0.15; // gpt-4o-mini default
    let outputPrice = 0.60;

    if (model.includes('gpt-4o') && !model.includes('mini')) {
        inputPrice = 2.50;
        outputPrice = 10.00;
    } else if (model.includes('gpt-4-turbo')) {
        inputPrice = 10.00;
        outputPrice = 30.00;
    }

    const inputCost = (usage.prompt_tokens / 1_000_000) * inputPrice;
    const outputCost = (usage.completion_tokens / 1_000_000) * outputPrice;
    return inputCost + outputCost;
}
