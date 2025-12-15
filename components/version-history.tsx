import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Clock, Trash2, XCircle } from 'lucide-react';

interface Version {
    id: string;
    systemPrompt: string;
    userPrompt: string;
    label: string;
    createdAt: string;
    createdBy?: string;
}

interface VersionHistoryProps {
    versions: Version[];
    liveVersionId: string | null;
    onRestore: (systemPrompt: string, userPrompt: string) => void;
    onDeploy: (version: Version) => void;
    onDelete: (id: string) => void;
    onClearAll: () => void;
}

export function VersionHistory({ versions, liveVersionId, onRestore, onDeploy, onDelete, onClearAll }: VersionHistoryProps) {
    // They usually come sorted from API, but sort again to be safe
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

            <div className="flex items-center justify-between px-4 py-2 bg-muted/20 border-b">
                <p className="text-xs text-muted-foreground">
                    {sortedVersions.length} version{sortedVersions.length !== 1 ? 's' : ''}
                </p>
                {sortedVersions.length > 1 && (
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 text-[10px] text-muted-foreground hover:text-destructive px-2"
                        onClick={() => {
                            if (confirm('Delete all versions except the live one?')) onClearAll();
                        }}
                    >
                        <Trash2 className="h-3 w-3 mr-1" />
                        Clear Old
                    </Button>
                )}
            </div>

            <ScrollArea className="flex-1">
                <div className="p-3 space-y-2">
                    {sortedVersions.map((version) => (
                        <div
                            key={version.id}
                            className={`group relative border rounded-lg p-3 hover:bg-muted/50 transition-all ${version.id === liveVersionId ? 'border-primary/50 bg-primary/5' : 'bg-card'}`}
                        >
                            {version.id !== liveVersionId && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (confirm('Delete this version?')) onDelete(version.id);
                                    }}
                                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                                    title="Delete version"
                                >
                                    <XCircle className="h-3.5 w-3.5" />
                                </button>
                            )}

                            <div className="flex items-start justify-between gap-2 mb-2 pr-4">
                                <div className="flex-1 min-w-0">
                                    <div className="font-medium text-sm mb-1 truncate">
                                        {version.label}
                                    </div>
                                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                        <Clock className="h-3 w-3" />
                                        <span>{formatDate(version.createdAt)}</span>
                                    </div>
                                </div>
                                {version.id === liveVersionId && (
                                    <div className="bg-green-500/10 text-green-600 text-[10px] px-2 py-0.5 rounded font-medium border border-green-500/20">
                                        LIVE
                                    </div>
                                )}
                            </div>

                            <div className="text-xs text-muted-foreground mb-2">
                                by {version.createdBy || 'Unknown'}
                            </div>

                            <div className="text-xs bg-muted/50 p-2 rounded max-h-20 overflow-hidden mb-2">
                                <span className="font-semibold text-[10px] uppercase text-muted-foreground block mb-1">System</span>
                                <div className="line-clamp-2 font-mono">{version.systemPrompt}</div>
                            </div>

                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="flex-1 text-xs h-7"
                                    onClick={() => onDeploy(version)}
                                    disabled={version.id === liveVersionId}
                                >
                                    {version.id === liveVersionId ? 'Live' : 'Deploy'}
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="flex-1 text-xs h-7"
                                    onClick={() => onRestore(version.systemPrompt, version.userPrompt)}
                                >
                                    Edit
                                </Button>
                            </div>
                        </div>
                    ))}

                    {sortedVersions.length === 0 && (
                        <div className="text-center py-8 text-muted-foreground text-sm">
                            No versions yet
                        </div>
                    )}
                </div>
            </ScrollArea>
        </div >
    );
}
