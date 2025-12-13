"use client";

import { Loader2, Sparkles, AlertCircle } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ResponseViewerProps {
    output: string | null;
    isTesting: boolean;
    provider: string | null;
    error?: string | null;
    model?: string;
}

export function ResponseViewer({ output, isTesting, provider, error, model }: ResponseViewerProps) {
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
                    {model && (
                        <span className="px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-500 text-[10px] font-medium border border-purple-500/20">
                            {model}
                        </span>
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
