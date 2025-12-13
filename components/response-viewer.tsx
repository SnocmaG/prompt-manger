"use client";

import { Loader2, Sparkles, AlertCircle } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ResponseViewerProps {
    output: string;
    isTesting: boolean;
    provider: string;
    error?: string;
}

export function ResponseViewer({ output, isTesting, provider, error }: ResponseViewerProps) {
    return (
        <div className="flex flex-col h-full bg-black border-l border-border/40">
            <div className="flex items-center justify-between px-4 py-2 border-b border-white/10 bg-white/5">
                <div className="flex items-center gap-2">
                    <Sparkles className="h-3 w-3 text-green-400" />
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">AI Response</span>
                </div>
                {isTesting && (
                    <div className="flex items-center gap-2 text-green-400 text-xs animate-pulse">
                        <Loader2 className="h-3 w-3 animate-spin" />
                        Running {provider}...
                    </div>
                )}
            </div>
            <div className="flex-1 relative overflow-hidden bg-black/50">
                <ScrollArea className="h-full w-full">
                    <div className="p-4 font-mono text-sm whitespace-pre-wrap">
                        {error ? (
                            <div className="text-red-400 flex items-start gap-2">
                                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                                <div>{error}</div>
                            </div>
                        ) : output ? (
                            <div className="text-green-400/90 leading-relaxed">
                                {output}
                            </div>
                        ) : (
                            !isTesting && (
                                <div className="text-muted-foreground/30 italic text-xs mt-10 text-center">
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
