'use client';

import { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Loader2, Sparkles } from 'lucide-react';

const OPENAI_MODELS = [
    'gpt-4o',
    'gpt-4o-mini',
    'gpt-4-turbo',
    'gpt-4',
    'gpt-3.5-turbo',
    'o1-preview',
    'o1-mini',
    'gpt-4o-realtime-preview',
    'gpt-4o-audio-preview',
];

interface TestPanelProps {
    branchId: string;
}

type AIProvider = 'mock' | 'openai' | 'anthropic';

export function TestPanel({ branchId }: TestPanelProps) {
    const [testInput, setTestInput] = useState('');
    const [testOutput, setTestOutput] = useState('');
    const [testing, setTesting] = useState(false);
    const [provider, setProvider] = useState<AIProvider>('mock');
    const [customModel, setCustomModel] = useState('gpt-4o-mini');
    const [showModelDropdown, setShowModelDropdown] = useState(false);

    // Remove unused Webhook persistence logic since it's removed globally? 
    // Wait, the user only removed it from the PAGE but TestPanel might still have some vestiges.
    // The previous edit tried to remove isSavingUrl etc. I will implement a clean version.

    const handleTest = async () => {
        setTesting(true);
        try {
            const response = await fetch('/api/ai/test', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    branchId,
                    testInput,
                    provider,
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
                <div className="flex items-center gap-2 relative">
                    {provider === 'openai' && (
                        <div className="relative">
                            <Input
                                value={customModel}
                                onChange={(e) => {
                                    setCustomModel(e.target.value);
                                    setShowModelDropdown(true);
                                }}
                                onFocus={() => setShowModelDropdown(true)}
                                onBlur={() => setTimeout(() => setShowModelDropdown(false), 200)} // Delay to allow click
                                placeholder="Model"
                                className="h-6 w-48 text-xs bg-background/50"
                            />
                            {showModelDropdown && (
                                <div className="absolute top-full left-0 w-full mt-1 bg-popover border rounded-md shadow-md z-50 overflow-hidden">
                                    <div className="max-h-[200px] overflow-y-auto py-1">
                                        {OPENAI_MODELS
                                            .filter(m => m.toLowerCase().includes(customModel.toLowerCase()))
                                            .slice(0, 7)
                                            .map((model) => (
                                                <div
                                                    key={model}
                                                    className="px-2 py-1.5 text-xs hover:bg-muted cursor-pointer truncate"
                                                    onClick={() => {
                                                        setCustomModel(model);
                                                        setShowModelDropdown(false);
                                                    }}
                                                >
                                                    {model}
                                                </div>
                                            ))}
                                        {OPENAI_MODELS.filter(m => m.toLowerCase().includes(customModel.toLowerCase())).length === 0 && (
                                            <div className="px-2 py-1.5 text-xs text-muted-foreground italic">
                                                No matching models
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                    <select
                        value={provider}
                        onChange={(e) => setProvider(e.target.value as AIProvider)}
                        className="text-xs border rounded px-2 py-1 bg-background"
                    >
                        <option value="mock">Mock</option>
                        <option value="openai">OpenAI</option>
                        <option value="anthropic">Anthropic</option>
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
                            <span>AI Response</span>
                            {testing && <Loader2 className="h-3 w-3 animate-spin text-green-400" />}
                        </div>
                        <div className="flex-1 p-3 text-green-400 font-mono text-xs whitespace-pre-wrap overflow-y-auto shadow-inner">
                            {testing ? (
                                <div className="flex items-center gap-2 text-green-400/70">
                                    <span className="animate-pulse">Testing with {provider}...</span>
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
            </div>
        </div>
    );
}
