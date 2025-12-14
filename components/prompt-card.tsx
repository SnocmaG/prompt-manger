"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { GitCommit, Clock, MoreHorizontal, Bot, Copy, Edit, Trash2, Loader2 } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface PromptCardProps {
    id: string;
    name: string;
    updatedAt: string;
    liveVersionId: string | null;
    versionCount: number;
    defaultModel: string | null;
    onDuplicate?: () => void;
}

export function PromptCard({ id, name, updatedAt, liveVersionId, versionCount, defaultModel, onDuplicate }: PromptCardProps) {
    const router = useRouter();
    const [isDuplicating, setIsDuplicating] = useState(false);

    // Format date nicely
    const date = new Date(updatedAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });

    const handleDuplicate = async (e: React.MouseEvent) => {
        e.preventDefault(); // Prevent Link navigation
        if (isDuplicating) return;

        setIsDuplicating(true);
        try {
            const res = await fetch(`/api/prompts/${id}/duplicate`, { method: 'POST' });
            if (res.ok) {
                if (onDuplicate) onDuplicate();
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsDuplicating(false);
        }
    };

    return (
        <Card className="group h-full flex flex-col hover:border-primary/50 hover:shadow-lg transition-all duration-300 relative overflow-hidden bg-card/50 backdrop-blur-sm border-muted/60">
            <Link href={`/prompt/${id}`} className="absolute inset-0 z-0" />

            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

            <CardHeader className="pb-3 relative z-10">
                <div className="flex justify-between items-start gap-2">
                    <CardTitle className="text-base font-semibold leading-tight group-hover:text-primary transition-colors truncate pr-6">
                        {name}
                    </CardTitle>
                    <div className="flex items-center gap-2 shrink-0">
                        {liveVersionId && (
                            <div className="shrink-0 animate-pulse" title="Live">
                                <div className="h-2 w-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
                            </div>
                        )}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-6 w-6 -mr-2 text-muted-foreground hover:text-foreground">
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => router.push(`/prompt/${id}`)}>
                                    <Edit className="mr-2 h-4 w-4" />
                                    Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={handleDuplicate} disabled={isDuplicating}>
                                    {isDuplicating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Copy className="mr-2 h-4 w-4" />}
                                    Duplicate
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-destructive focus:text-destructive">
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="flex-1 pb-4 relative z-0 pointer-events-none">
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-3 text-xs text-muted-foreground font-medium">
                        <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-muted/50 border border-border/50">
                            <GitCommit className="h-3.5 w-3.5" />
                            <span>{versionCount} Versions</span>
                        </div>
                    </div>
                    {defaultModel && (
                        <div className="flex items-center gap-1.5 text-[10px] font-medium text-muted-foreground/80">
                            <Bot className="h-3 w-3" />
                            <span>{defaultModel}</span>
                        </div>
                    )}
                </div>
            </CardContent>

            <CardFooter className="pt-3 pb-3 border-t bg-muted/10 relative mt-auto z-0 pointer-events-none">
                <div className="flex items-center justify-between w-full text-[10px] text-muted-foreground uppercase tracking-wider font-medium">
                    <div className="flex items-center gap-1.5">
                        <Clock className="h-3 text-primary/60 w-3" />
                        <span>Updated {date}</span>
                    </div>
                </div>
            </CardFooter>
        </Card>
    );
}
