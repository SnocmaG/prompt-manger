"use client";

import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

interface UserPromptInputProps {
    value: string;
    onChange: (value: string) => void;
    onRun: () => void;
    isTesting: boolean;
}

export function UserPromptInput({ value, onChange, onRun, isTesting }: UserPromptInputProps) {
    return (
        <div className="flex flex-col h-full bg-card border-b border-border/40">
            <div className="flex items-center justify-between px-4 py-2 border-b bg-muted/20">
                <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">User Prompt</span>
                    <Badge variant="outline" className="text-[10px] h-4">Test Input</Badge>
                </div>
                <div className="text-[10px] text-muted-foreground">
                    Hit <span className="font-mono bg-muted px-1 rounded">⌘+Enter</span> to run
                </div>
            </div>
            <Textarea
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onKeyDown={(e) => {
                    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
                        e.preventDefault();
                        onRun();
                    }
                }}
                placeholder="Enter test input (User Prompt)..."
                className="flex-1 p-4 text-sm font-mono border-0 focus-visible:ring-0 resize-none rounded-none bg-background/50"
                disabled={isTesting}
            />
        </div>
    );
}
