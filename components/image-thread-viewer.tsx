import { ScrollArea } from "@/components/ui/scroll-area";
import { Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useRef } from "react";

interface Execution {
    id: string;
    userPrompt: string;
    response: string;
    model: string;
    createdAt: string;
}

interface ImageThreadViewerProps {
    executions: Execution[];
    isRunning: boolean;
    pendingInput?: string;
    onDownload?: (url: string) => void;
}

export function ImageThreadViewer({ executions, isRunning, pendingInput, onDownload }: ImageThreadViewerProps) {
    const bottomRef = useRef<HTMLDivElement>(null);

    // Filter only image executions for this view (or all if we want mixed mode)
    // For now, let's assume if we are in this view, we want to see the sequence.
    // We reverse the array because executions usually come [newest, ..., oldest] but chat is [oldest, ..., newest]
    const thread = [...executions].reverse();

    useEffect(() => {
        if (bottomRef.current) {
            bottomRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [executions.length, isRunning]);

    return (
        <div className="flex flex-col h-full bg-card border-l border-border/50">
            <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/20">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Image Thread</span>
            </div>

            <div className="flex-1 overflow-hidden bg-muted/10 relative">
                <ScrollArea className="h-full w-full">
                    <div className="flex flex-col gap-6 p-6 min-h-full">
                        {thread.map((run) => {
                            const imageUrlMatch = run.response.match(/^!\[(.*?)\]\((.*?)\)$/);
                            const imageUrl = imageUrlMatch ? imageUrlMatch[2] : null;

                            return (
                                <div key={run.id} className="flex flex-col gap-3 fade-in-up">
                                    {/* User Bubble */}
                                    <div className="flex justify-end">
                                        <div className="bg-primary/10 border border-primary/20 text-foreground px-4 py-2 rounded-2xl rounded-tr-none text-sm max-w-[80%] shadow-sm">
                                            {run.userPrompt}
                                        </div>
                                    </div>

                                    {/* System/Image Bubble */}
                                    <div className="flex justify-start w-full">
                                        <div className="flex flex-col gap-2 max-w-[80%]">
                                            <div className="relative group rounded-xl overflow-hidden border shadow-sm bg-background">
                                                {imageUrl ? (
                                                    // eslint-disable-next-line @next/next/no-img-element
                                                    <img
                                                        src={imageUrl}
                                                        alt="Generated"
                                                        className="w-full h-auto max-h-[500px] object-contain bg-[url('/checker.png')]"
                                                    />
                                                ) : (
                                                    <div className="p-4 text-sm text-destructive font-mono bg-destructive/5">
                                                        {run.response}
                                                    </div>
                                                )}

                                                {/* Overlay Actions */}
                                                {imageUrl && onDownload && (
                                                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <Button size="icon" variant="secondary" className="h-8 w-8 shadow-md" onClick={() => onDownload(imageUrl)}>
                                                            <Download className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="text-[10px] text-muted-foreground ml-1">
                                                {run.model} • {new Date(run.createdAt).toLocaleTimeString()}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}

                        {/* Pending State */}
                        {isRunning && (
                            <div className="flex flex-col gap-3 animate-pulse">
                                {pendingInput && (
                                    <div className="flex justify-end">
                                        <div className="bg-primary/5 text-muted-foreground px-4 py-2 rounded-2xl rounded-tr-none text-sm max-w-[80%] opacity-70">
                                            {pendingInput}
                                        </div>
                                    </div>
                                )}
                                <div className="flex justify-start">
                                    <div className="bg-card border h-[300px] w-[300px] rounded-xl flex items-center justify-center">
                                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                                    </div>
                                </div>
                            </div>
                        )}

                        <div ref={bottomRef} className="h-1" />
                    </div>
                </ScrollArea>
            </div>
        </div>
    );
}
