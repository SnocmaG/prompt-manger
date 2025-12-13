'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Play, Loader2, Sparkles, Save, Check } from 'lucide-react';

interface TestPanelProps {
    branchId: string;
    promptId: string;
    initialWebhookUrl: string;
    onWebhookSave: () => void;
}

type AIProvider = 'mock' | 'openai' | 'anthropic' | 'webhook';

export function TestPanel({ branchId, promptId, initialWebhookUrl, onWebhookSave }: TestPanelProps) {
    const [testInput, setTestInput] = useState('');
    const [testOutput, setTestOutput] = useState('');
    const [testing, setTesting] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [provider, setProvider] = useState<AIProvider>('mock');
    const [webhookUrl, setWebhookUrl] = useState(initialWebhookUrl);
    const [isSavingUrl, setIsSavingUrl] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);

    // Update local state if prop changes (external refresh)
    useEffect(() => {
        setWebhookUrl(initialWebhookUrl);
    }, [initialWebhookUrl]);

    const handleSaveWebhook = async () => {
        setIsSavingUrl(true);
        try {
            const response = await fetch(`/api/prompts/${promptId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ webhookUrl }),
            });

            if (response.ok) {
                setSaveSuccess(true);
                onWebhookSave(); // Refresh parent to sync state
                setTimeout(() => setSaveSuccess(false), 2000);
            }
        } catch (error) {
            console.error('Failed to save webhook URL', error);
        } finally {
            setIsSavingUrl(false);
        }
    };

    const handleTest = async () => {
        setTesting(true);
        setIsExpanded(true);
        try {
            const response = await fetch('/api/ai/test', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    branchId,
                    testInput,
                    provider,
                    webhookUrl: provider === 'webhook' ? webhookUrl : undefined,
                }),
            });

            if (response.ok) {
                const data = await response.json();
                setTestOutput(data.output);
            } else {
                const error = await response.json();
                setTestOutput(`Error: ${error.error || 'Failed to test prompt'}`);
            }
        } catch (error) {
            console.error('Error testing prompt:', error);
            setTestOutput('Error: Failed to test prompt');
        } finally {
            setTesting(false);
        }
    };

    return (
        <div className="bg-card">
            <div className="border-b px-4 py-2 flex items-center justify-between">
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors"
                >
                    <Sparkles className="h-4 w-4" />
                    Test Prompt
                </button>
                {isExpanded && (
                    <div className="flex items-center gap-2">
                        <select
                            value={provider}
                            onChange={(e) => setProvider(e.target.value as AIProvider)}
                            className="text-xs border rounded px-2 py-1 bg-background"
                        >
                            <option value="mock">Mock (No API Key)</option>
                            <option value="webhook">Webhook URL</option>
                            <option value="openai">OpenAI GPT-4</option>
                            <option value="anthropic">Anthropic Claude</option>
                        </select>
                    </div>
                )}
            </div>

            {isExpanded && (
                <div className="p-4 space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-3">
                            {provider === 'webhook' && (
                                <div>
                                    <label className="text-xs font-medium mb-1.5 block text-muted-foreground">
                                        Webhook URL (Saved)
                                    </label>
                                    <div className="flex gap-2">
                                        <Input
                                            value={webhookUrl}
                                            onChange={(e) => setWebhookUrl(e.target.value)}
                                            placeholder="https://hooks.zapier.com/..."
                                            className="text-xs font-mono"
                                        />
                                        <Button
                                            size="icon"
                                            className="h-9 w-9 shrink-0"
                                            variant="outline"
                                            onClick={handleSaveWebhook}
                                            title="Save URL"
                                            disabled={isSavingUrl}
                                        >
                                            {isSavingUrl ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : saveSuccess ? (
                                                <Check className="h-4 w-4 text-green-500" />
                                            ) : (
                                                <Save className="h-4 w-4" />
                                            )}
                                        </Button>
                                    </div>
                                    <p className="text-[10px] text-muted-foreground mt-1">
                                        This URL will be saved for this prompt.
                                    </p>
                                </div>
                            )}

                            <div>
                                <label className="text-xs font-medium mb-1.5 block text-muted-foreground">
                                    Test Input (JSON or Text)
                                </label>
                                <Textarea
                                    value={testInput}
                                    onChange={(e) => setTestInput(e.target.value)}
                                    placeholder='Enter test payload...'
                                    className="min-h-[100px] text-sm font-mono"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-medium mb-1.5 block text-muted-foreground">
                                {provider === 'webhook' ? 'Webhook Response' : 'AI Response'}
                            </label>
                            <div className="border rounded-md p-3 min-h-[100px] bg-muted/30 text-sm font-mono whitespace-pre-wrap max-h-[200px] overflow-y-auto">
                                {testing ? (
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        {provider === 'webhook' ? 'Triggering webhook...' : `Testing with ${provider}...`}
                                    </div>
                                ) : testOutput ? (
                                    testOutput
                                ) : (
                                    <span className="text-muted-foreground">
                                        Click "Run Test" to see result
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="text-xs text-muted-foreground">
                            {provider === 'mock' && 'Using mock testing (no API key required)'}
                            {provider === 'webhook' && 'Will POST payload to the saved URL'}
                        </div>
                        <Button onClick={handleTest} disabled={testing} size="sm">
                            <Play className="h-4 w-4 mr-2" />
                            {testing ? 'Running...' : 'Run Test'}
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
