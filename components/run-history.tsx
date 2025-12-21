import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Trash2, X, AlertCircle, Layers, Timer, Coins, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ExpressionText } from '@/components/expression-text';

interface PromptExecution {
    id: string;
    promptId: string;
    versionLabel?: string;
    systemPrompt: string;
    userPrompt: string;
    model: string;
    provider: string;
    response: string;
    createdAt: string;
    createdBy: string;
    // Analytics
    durationMs?: number;
    tokensIn?: number;
    tokensOut?: number;
    cost?: number;
    runMode?: string;
}

interface RunHistoryProps {
    executions: PromptExecution[];
    onSelect: (execution: PromptExecution) => void;
    onDelete: (id: string) => void;
    onClearAll: () => void;
    selectedId?: string | null;
}

export function RunHistory({ executions, onSelect, onDelete, onClearAll, selectedId }: RunHistoryProps) {
    if (!executions || executions.length === 0) {
        return (
            <div className="flex flex-col h-full bg-card">
                <div className="flex flex-col items-center justify-center flex-1 text-muted-foreground p-4 text-center">
                    <p className="text-sm">No run history yet.</p>
                    <p className="text-xs mt-1 text-muted-foreground/60">Run a test to see logs here.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-card">
            <div className="p-2 border-b flex justify-end">
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs text-muted-foreground hover:text-destructive flex items-center gap-1.5"
                    onClick={(e) => {
                        e.stopPropagation();
                        if (confirm('Are you sure you want to clear all history?')) onClearAll();
                    }}
                >
                    <Trash2 className="h-3 w-3" />
                    Clear All
                </Button>
            </div>

            <ScrollArea className="flex-1">
                <div className="flex flex-col divide-y">
                    {executions.map((run) => {
                        const date = new Date(run.createdAt);
                        const formattedDate = date.toISOString().slice(0, 19).replace('T', ' '); // yyyy-mm-dd hh:mm:ss

                        return (
                            <div
                                key={run.id}
                                className={cn(
                                    "group flex flex-col items-start gap-1 p-4 text-left hover:bg-muted/50 transition-colors w-full relative",
                                    selectedId === run.id && "bg-muted"
                                )}
                            >
                                <div
                                    className="absolute inset-0 cursor-pointer"
                                    onClick={() => onSelect(run)}
                                />

                                <div className="flex items-center justify-between w-full mb-1 pointer-events-none relative z-10">
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <span>{formattedDate}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-primary/5 text-primary">
                                            {run.model}
                                        </span>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onDelete(run.id);
                                            }}
                                            className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive p-0.5 rounded-sm hover:bg-muted ml-1 pointer-events-auto"
                                            title="Delete run"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>

                                {run.versionLabel && (
                                    <div className="text-xs font-medium text-blue-500 mb-1 pointer-events-none">
                                        {run.versionLabel}
                                    </div>
                                )}

                                <div className="text-sm font-medium line-clamp-1 w-full text-foreground/90 pointer-events-none">
                                    <ExpressionText text={run.userPrompt || '<Empty Input>'} />
                                </div>
                                <div className="text-xs text-muted-foreground line-clamp-2 w-full font-mono mt-1 opacity-80 pointer-events-none">
                                    {run.response}
                                </div>

                                {/* Analytics Footer */}
                                <div className="flex items-center gap-3 mt-2 w-full pt-1.5 border-t border-border/40 pointer-events-none">
                                    {run.runMode === 'bulk' && (
                                        <div className="flex items-center gap-1 text-[10px] text-purple-600 bg-purple-500/10 px-1.5 py-0.5 rounded border border-purple-500/20">
                                            <Layers className="h-3 w-3" />
                                            <span>Bulk</span>
                                        </div>
                                    )}
                                    {run.durationMs && (
                                        <div className="flex items-center gap-1 text-[10px] text-muted-foreground" title="Latency">
                                            <Timer className="h-3 w-3 opacity-70" />
                                            <span>{(run.durationMs / 1000).toFixed(2)}s</span>
                                        </div>
                                    )}
                                    {/* Only show tokens/cost if available (non-zero) */}
                                    {(run.cost || 0) > 0 && (
                                        <div className="flex items-center gap-1 text-[10px] text-green-600/80 ml-auto" title="Cost">
                                            <Zap className="h-3 w-3 opacity-70" />
                                            <span>${run.cost?.toFixed(5)}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </ScrollArea>
        </div>
    );
}
