'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CreateBranchDialog } from '@/components/create-branch-dialog';
import { GitBranch, Plus } from 'lucide-react';

interface Branch {
    id: string;
    name: string;
    label: string;
    headVersionId: string | null;
    versions: unknown[];
}

interface BranchListProps {
    branches: Branch[];
    liveBranchId: string | null;
    selectedBranchId: string | null;
    onSelectBranch: (branch: Branch) => void;
    onBranchCreated: () => void;
    promptId: string;
}

export function BranchList({
    branches,
    liveBranchId,
    selectedBranchId,
    onSelectBranch,
    onBranchCreated,
    promptId,
}: BranchListProps) {
    const [showCreateDialog, setShowCreateDialog] = useState(false);

    return (
        <div className="flex flex-col h-full">
            <div className="p-4 border-b">
                <div className="flex items-center justify-between mb-3">
                    <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                        Branches
                    </h2>
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setShowCreateDialog(true)}
                        className="h-7 w-7 p-0"
                    >
                        <Plus className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            <ScrollArea className="flex-1">
                <div className="p-2">
                    {branches.map((branch) => {
                        const isLive = branch.id === liveBranchId;
                        const isSelected = branch.id === selectedBranchId;

                        return (
                            <button
                                key={branch.id}
                                onClick={() => onSelectBranch(branch)}
                                className={`w-full text-left p-3 rounded-lg mb-1 transition-colors ${isSelected
                                    ? 'bg-primary/10 border border-primary/20'
                                    : 'hover:bg-accent'
                                    }`}
                            >
                                <div className="flex items-start justify-between gap-2">
                                    <div className="flex items-center gap-2 min-w-0 flex-1">
                                        <GitBranch className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                        <div className="min-w-0 flex-1">
                                            <div className="font-medium text-sm truncate">
                                                {branch.label}
                                            </div>
                                            <div className="text-xs text-muted-foreground truncate">
                                                {branch.name}
                                            </div>
                                        </div>
                                    </div>
                                    {isLive && (
                                        <Badge variant="success" className="flex-shrink-0 text-xs">
                                            Live
                                        </Badge>
                                    )}
                                </div>
                            </button>
                        );
                    })}
                </div>
            </ScrollArea>

            <CreateBranchDialog
                open={showCreateDialog}
                onOpenChange={setShowCreateDialog}
                promptId={promptId}
                onSuccess={() => {
                    setShowCreateDialog(false);
                    onBranchCreated();
                }}
            />
        </div>
    );
}
