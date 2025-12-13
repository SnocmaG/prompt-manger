import Link from "next/link";
import { GitBranch, Clock, MoreHorizontal } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

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
            <Card className="hover:border-primary/50 transition-all hover:shadow-md cursor-pointer group h-full flex flex-col">
                <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                        <CardTitle className="text-lg font-semibold truncate pr-4 group-hover:text-primary transition-colors">
                            {name}
                        </CardTitle>
                        <Button variant="ghost" size="icon" className="h-8 w-8 -mt-1 -mr-2 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="flex-1 pb-2">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                            <GitBranch className="h-3 w-3" />
                            <span>{branchCount} Branches</span>
                        </div>
                        {liveBranchId && (
                            <Badge variant="secondary" className="text-[10px] h-5">Live</Badge>
                        )}
                    </div>
                </CardContent>
                <CardFooter className="pt-2 border-t mt-auto">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>Updated {date}</span>
                    </div>
                </CardFooter>
            </Card>
        </Link>
    );
}
