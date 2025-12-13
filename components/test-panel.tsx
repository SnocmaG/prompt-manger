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
    const [customModel, setCustomModel] = useState('gpt-4o-mini');
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
                    model: provider === 'openai' ? customModel : undefined
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
        <div className="h-full flex flex-col bg-card">
            <div className="border-b px-4 py-2 flex items-center justify-between shrink-0 h-10">
                <div className="flex items-center gap-2 font-semibold text-xs text-muted-foreground uppercase tracking-wider">
                    <Sparkles className="h-4 w-4" />
                    Test Playground
                </div>
                <div className="flex items-center gap-2">
                    {provider === 'openai' && (
                        <Input
                            value={customModel}
                            onChange={(e) => setCustomModel(e.target.value)}
                            placeholder="Model (e.g. gpt-4)"
                            className="h-6 w-32 text-xs bg-background/50"
                        />
                    )}
                    <select
                        value={provider}
                        onChange={(e) => setProvider(e.target.value as AIProvider)}
                        className="text-xs border rounded px-2 py-1 bg-background"
                    >
                        <option value="mock">Mock (No API Key)</option>
                        <option value="webhook">Webhook URL</option>
                        <option value="openai">OpenAI</option>
                        <option value="anthropic">Anthropic Claude</option>
                    </select>
                </div>
            </div>

            <div className="flex-1 flex flex-col p-4 space-y-3 overflow-hidden">
                <div className="flex-1 flex flex-col gap-4 overflow-hidden">
                    {/* Input Area */}
                    <div className="flex-1 flex flex-col border rounded-md overflow-hidden bg-background min-h-[150px]">
                        <div className="px-3 py-2 border-b bg-muted/20 text-xs font-medium text-muted-foreground flex justify-between items-center shrink-0">
                            <span>Input (JSON/Text)</span>
                            <span className="text-[10px] opacity-70">⌘+Enter to run</span>
                        </div>
                        <Textarea
                            value={testInput}
                            onChange={(e) => setTestInput(e.target.value)}
                            onKeyDown={(e) => {
                                if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
                                    e.preventDefault();
                                    handleTest();
                                }
                            }}
                            placeholder='Enter test payload...'
                            className="flex-1 p-3 text-sm font-mono border-0 focus-visible:ring-0 resize-none rounded-none"
                        />
                    </div>

                    {/* Output Area */}
                    <div className="flex-1 flex flex-col border rounded-md overflow-hidden bg-black min-h-[150px]">
                        <div className="px-3 py-2 border-b border-white/10 bg-white/5 text-xs font-medium text-muted-foreground flex justify-between items-center shrink-0">
                            <span>{provider === 'webhook' ? 'Webhook Response' : 'AI Response'}</span>
                            {testing && <Loader2 className="h-3 w-3 animate-spin text-green-400" />}
                        </div>
                        <div className="flex-1 p-3 text-green-400 font-mono text-xs whitespace-pre-wrap overflow-y-auto shadow-inner">
                            {testing ? (
                                <div className="flex items-center gap-2 text-green-400/70">
                                    <span className="animate-pulse">{provider === 'webhook' ? 'Triggering webhook...' : `Testing with ${provider}...`}</span>
                                </div>
                            ) : testOutput ? (
                                testOutput
                            ) : (
                                <span className="text-muted-foreground/50 opacity-50">
                                    $ Waiting for test execution...
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="text-[10px] text-muted-foreground text-center shrink-0">
                    {provider === 'openai' && 'Using OpenAI Model: ' + customModel}
                </div>
            </div>
        </div>
    );
}
