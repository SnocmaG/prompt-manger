import Link from "next/link";
import { GitBranch, Clock, MoreHorizontal } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

interface PromptCardProps {
    id: string;
    name: string;
    updatedAt: string;
    liveBranchId: string | null;
    branchCount: number;
}

export function PromptCard({ id, name, updatedAt, liveBranchId, branchCount }: PromptCardProps) {
    // Format date nicely
    const date = new Date(updatedAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });

    return (
        <Link href={`/prompt/${id}`}>
            <Card className="group h-full flex flex-col hover:border-primary/50 hover:shadow-lg transition-all duration-300 relative overflow-hidden bg-card/50 backdrop-blur-sm border-muted/60">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                <CardHeader className="pb-3 relative">
                    <div className="flex justify-between items-start gap-2">
                        <CardTitle className="text-base font-semibold leading-tight group-hover:text-primary transition-colors">
                            {name}
                        </CardTitle>
                        {liveBranchId && (
                            <div className="shrink-0 animate-pulse">
                                <div className="h-2 w-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
                            </div>
                        )}
                    </div>
                </CardHeader>

                <CardContent className="flex-1 pb-4 relative">
                    <div className="flex items-center gap-3 text-xs text-muted-foreground font-medium">
                        <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-muted/50 border border-border/50">
                            <GitBranch className="h-3.5 w-3.5" />
                            <span>{branchCount} Branches</span>
                        </div>
                    </div>
                </CardContent>

                <CardFooter className="pt-3 pb-3 border-t bg-muted/10 relative mt-auto">
                    <div className="flex items-center justify-between w-full text-[10px] text-muted-foreground uppercase tracking-wider font-medium">
                        <div className="flex items-center gap-1.5">
                            <Clock className="h-3 text-primary/60 w-3" />
                            <span>Updated {date}</span>
                        </div>
                        <MoreHorizontal className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity text-primary" />
                    </div>
                </CardFooter>
            </Card>
        </Link>
    );
}
