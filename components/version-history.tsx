'use client';

import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { History, Clock } from 'lucide-react';

interface Version {
    id: string;
    content: string;
    label: string;
    createdAt: string;
    createdBy?: string;
}

interface VersionHistoryProps {
    versions: Version[];
    onRestore: (content: string, label: string) => void;
}

export function VersionHistory({ versions, onRestore }: VersionHistoryProps) {
    const sortedVersions = [...versions].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;

        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
        });
    };

    return (
        <div className="flex flex-col h-full">
            <div className="p-4 border-b">
                <div className="flex items-center gap-2 mb-1">
                    <History className="h-4 w-4 text-muted-foreground" />
                    <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                        Version History
                    </h2>
                </div>
                <p className="text-xs text-muted-foreground">
                    {sortedVersions.length} version{sortedVersions.length !== 1 ? 's' : ''}
                </p>
            </div>

            <ScrollArea className="flex-1">
                <div className="p-3 space-y-2">
                    {sortedVersions.map((version, index) => (
                        <div
                            key={version.id}
                            className="border rounded-lg p-3 hover:bg-accent/50 transition-colors"
                        >
                            <div className="flex items-start justify-between gap-2 mb-2">
                                <div className="flex-1 min-w-0">
                                    <div className="font-medium text-sm mb-1 truncate">
                                        {version.label}
                                    </div>
                                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                        <Clock className="h-3 w-3" />
                                        <span>{formatDate(version.createdAt)}</span>
                                    </div>
                                </div>
                                {index === 0 && (
                                    <div className="bg-primary/10 text-primary text-xs px-2 py-0.5 rounded font-medium">
                                        Current
                                    </div>
                                )}
                            </div>

                            <div className="text-xs text-muted-foreground mb-2">
                                by {version.createdBy || 'Unknown'}
                            </div>

                            <div className="text-xs bg-muted/50 p-2 rounded font-mono line-clamp-3">
                                {version.content}
                            </div>

                            {index !== 0 && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="w-full mt-2 text-xs h-7"
                                    onClick={() => {
                                        onRestore(version.content, version.label);
                                    }}
                                >
                                    Restore Version
                                </Button>
                            )}
                        </div>
                    ))}

                    {sortedVersions.length === 0 && (
                        <div className="text-center py-8 text-muted-foreground text-sm">
                            No versions yet
                        </div>
                    )}
                </div>
            </ScrollArea>
        </div>
    );
}
