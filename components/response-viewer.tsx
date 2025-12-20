"use client";

import { useState } from "react";
import { Loader2, AlertCircle, Download } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface ResponseViewerProps {
    output: string | null;
    isTesting: boolean;
    provider: string | null;
    error?: string | null;
    model?: string;
    customModel?: string;
    setCustomModel?: (model: string) => void;
    availableModels?: { id: string }[];
    onDownload?: () => void;
    // Bulk Props
    isBulkMode?: boolean;
    bulkOutputs?: { inputId: string; output: string; model: string; status: 'pending' | 'running' | 'completed' | 'error' }[];
    bulkInputs?: { id: string; value: string }[];
}

export function ResponseViewer({
    output,
    isTesting,
    provider,
    error,
    model,
    customModel,
    setCustomModel,
    availableModels = [],
    onDownload,
    // Bulk Props
    isBulkMode,
    bulkOutputs = [],
    bulkInputs = []
}: ResponseViewerProps) {
    const [showModelDropdown, setShowModelDropdown] = useState(false);

    // Fallback models...
    const FALLBACK_MODELS = [
        { id: 'gpt-4o' },
        { id: 'gpt-4o-mini' },
        { id: 'gpt-4-turbo' },
    ];

    // Helper to get status icon
    const getStatusIcon = (status: 'pending' | 'running' | 'completed' | 'error') => {
        switch (status) {
            case 'running': return <Loader2 className="h-3 w-3 animate-spin text-primary" />;
            case 'completed': return <div className="h-2 w-2 rounded-full bg-green-500" />;
            case 'error': return <div className="h-2 w-2 rounded-full bg-red-500" />;
            default: return <div className="h-2 w-2 rounded-full bg-muted" />;
        }
    };

    if (isBulkMode) {
        return (
            <div className="flex flex-col h-full bg-card border-l border-border/50">
                <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/20">
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Bulk Results ({bulkOutputs.filter(o => o.status === 'completed').length}/{bulkOutputs.length})</span>
                    <div className="flex items-center gap-2">
                        {onDownload && (
                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onDownload}>
                                <Download className="h-4 w-4" />
                            </Button>
                        )}
                    </div>
                </div>
                <div className="flex-1 overflow-hidden bg-muted/10">
                    <ScrollArea className="h-full w-full">
                        <div className="p-4 space-y-3">
                            {bulkOutputs.length === 0 && (
                                <div className="text-center text-muted-foreground text-xs mt-10 italic">
                                    Run tests to see results here
                                </div>
                            )}
                            {bulkOutputs.map((output, idx) => {
                                const inputVal = bulkInputs.find(i => i.id === output.inputId)?.value || '';
                                return (
                                    <div key={output.inputId} className="bg-background border rounded-md shadow-sm overflow-hidden flex flex-col group">
                                        {/* Header */}
                                        <div className="flex items-center justify-between px-3 py-2 bg-muted/30 border-b">
                                            <div className="flex items-center gap-2 overflow-hidden">
                                                {getStatusIcon(output.status)}
                                                <span className="text-xs font-medium truncate max-w-[200px]">Case #{idx + 1}</span>
                                            </div>
                                            <span className="text-[10px] text-muted-foreground uppercase">{output.model || '-'}</span>
                                        </div>

                                        {/* Input Preview (Hover for full) */}
                                        <div className="relative px-3 py-2 border-b border-dashed bg-muted/5">
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] uppercase font-semibold text-muted-foreground shrink-0">Input:</span>
                                                <div className="relative flex-1 group/tooltip">
                                                    <p className="text-xs text-muted-foreground truncate max-w-[250px] cursor-help">
                                                        {inputVal || <span className="italic opacity-50">Empty</span>}
                                                    </p>

                                                    {/* Custom Tooltip Box */}
                                                    {inputVal && (
                                                        <div className="absolute left-0 bottom-full mb-2 w-[300px] p-3 bg-popover text-popover-foreground text-xs rounded-md border shadow-lg z-50 opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all duration-200 pointer-events-none">
                                                            <div className="font-semibold mb-1 text-[10px] uppercase tracking-wider text-muted-foreground">Full Input</div>
                                                            <div className="font-mono whitespace-pre-wrap break-words max-h-[200px] overflow-hidden">{inputVal}</div>
                                                            {/* Arrow */}
                                                            <div className="absolute left-4 -bottom-1 w-2 h-2 bg-popover border-r border-b transform rotate-45"></div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* AI Output */}
                                        <div className="p-3 text-xs font-mono whitespace-pre-wrap max-h-[300px] overflow-y-auto">
                                            {output.output || <span className="text-muted-foreground italic">Pending...</span>}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </ScrollArea>
                </div>
            </div>
        );
    }

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
                <div className="flex items-center gap-2">
                    {onDownload && (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-muted-foreground hover:text-foreground"
                            onClick={onDownload}
                            title="Download as Excel"
                        >
                            <Download className="h-4 w-4" />
                        </Button>
                    )}
                    {isTesting && (
                        <div className="flex items-center gap-2 text-primary text-xs animate-pulse">
                            <Loader2 className="h-3 w-3 animate-spin" />
                            Running {provider}...
                        </div>
                    )}
                </div>
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
