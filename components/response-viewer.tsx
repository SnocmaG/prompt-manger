"use client";

import { useState } from "react";
import { Loader2, AlertCircle } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";

interface ResponseViewerProps {
    output: string | null;
    isTesting: boolean;
    provider: string | null;
    error?: string | null;
    model?: string;
    customModel?: string;
    setCustomModel?: (model: string) => void;
    availableModels?: { id: string }[];
}

export function ResponseViewer({
    output,
    isTesting,
    provider,
    error,
    model,
    customModel,
    setCustomModel,
    availableModels = []
}: ResponseViewerProps) {
    const [showModelDropdown, setShowModelDropdown] = useState(false);

    // Fallback models should match page.tsx or be passed in. 
    // Defining here briefly for safety if not passed, though ideally passed.
    const FALLBACK_MODELS = [
        { id: 'gpt-4o' },
        { id: 'gpt-4o-mini' },
        { id: 'gpt-4-turbo' },
    ];

    if (!output && !isTesting && !error) {
        return (
            <div className="flex flex-col h-full items-center justify-center text-muted-foreground p-8 border-l border-border/50 bg-muted/20">
                <p>Run a test to see the AI response here.</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-card border-l border-border/50">
            <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/20">
                <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">AI Response</span>
                    <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-medium uppercase border border-primary/20">
                        {provider || 'UNKNOWN'}
                    </span>

                    {/* Model Selector / Badge */}
                    {customModel && setCustomModel ? (
                        <div className="relative">
                            <Input
                                value={customModel}
                                onChange={(e) => {
                                    setCustomModel(e.target.value);
                                    setShowModelDropdown(true);
                                }}
                                onFocus={() => setShowModelDropdown(true)}
                                onBlur={() => setTimeout(() => setShowModelDropdown(false), 200)}
                                placeholder="Model"
                                className="h-6 text-[10px] bg-background/50 w-[140px] px-2 py-0 border-purple-500/20 text-purple-600 focus-visible:ring-purple-500/30"
                            />
                            {showModelDropdown && (
                                <div className="absolute top-full right-0 w-[250px] mt-1 bg-popover border rounded-md shadow-md z-50 overflow-hidden">
                                    <div className="max-h-[145px] overflow-y-auto py-1">
                                        {(availableModels.length > 0 ? availableModels : FALLBACK_MODELS)
                                            .filter(m => m.id.toLowerCase().includes(customModel.toLowerCase()))
                                            .map((modelItem) => (
                                                <div
                                                    key={modelItem.id}
                                                    className="px-2 py-1.5 text-xs hover:bg-muted cursor-pointer truncate"
                                                    onClick={() => {
                                                        setCustomModel(modelItem.id);
                                                        setShowModelDropdown(false);
                                                    }}
                                                    title={modelItem.id}
                                                >
                                                    {modelItem.id}
                                                </div>
                                            ))}
                                        {(availableModels.length > 0 ? availableModels : FALLBACK_MODELS)
                                            .filter(m => m.id.toLowerCase().includes(customModel.toLowerCase())).length === 0 && (
                                                <div className="px-2 py-1.5 text-xs text-muted-foreground italic">
                                                    No matching models
                                                </div>
                                            )}
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        model && (
                            <span className="px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-500 text-[10px] font-medium border border-purple-500/20">
                                {model}
                            </span>
                        )
                    )}
                </div>
                {isTesting && (
                    <div className="flex items-center gap-2 text-primary text-xs animate-pulse">
                        <Loader2 className="h-3 w-3 animate-spin" />
                        Running {provider}...
                    </div>
                )}
            </div>
            <div className="flex-1 relative overflow-hidden">
                <ScrollArea className="h-full w-full">
                    <div className="p-4 font-mono text-sm whitespace-pre-wrap">
                        {error ? (
                            <div className="text-destructive flex items-start gap-2">
                                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                                <div>{error}</div>
                            </div>
                        ) : output ? (
                            <div className="text-foreground leading-relaxed">
                                {output}
                            </div>
                        ) : (
                            !isTesting && (
                                <div className="text-muted-foreground/50 italic text-xs mt-10 text-center">
                                    waiting for execution...
                                </div>
                            )
                        )}
                    </div>
                </ScrollArea>
            </div>
        </div>
    );
}
