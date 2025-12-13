'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { DeployDialog } from '@/components/deploy-dialog';
import { Save, Rocket, RotateCcw } from 'lucide-react';

interface Branch {
    id: string;
    name: string;
    label: string;
    headVersionId: string | null;
    versions: Version[];
}

interface Version {
    id: string;
    content: string;
    label: string;
}

interface PromptEditorProps {
    branch: Branch;
    isLive: boolean;
    onSave: () => void;
    onDeploy: () => void;
    onRestore?: (content: string, label: string) => void;
}

export function PromptEditor({ branch, isLive, onSave, onDeploy, onRestore }: PromptEditorProps) {
    const currentVersion = branch.versions.find(v => v.id === branch.headVersionId);
    const [content, setContent] = useState(currentVersion?.content || '');
    const [versionLabel, setVersionLabel] = useState('');
    const [saving, setSaving] = useState(false);
    const [restoredFrom, setRestoredFrom] = useState<string | null>(null); // Added new state
    const [showDeployDialog, setShowDeployDialog] = useState(false);

    // Update content when branch changes
    React.useEffect(() => {
        const newContent = currentVersion?.content || '';
        setContent(newContent);
        setRestoredFrom(null);
    }, [branch.id, currentVersion?.id]);

    const hasChanges = content !== currentVersion?.content;

    const handleRestore = (restoredContent: string, fromLabel: string) => {
        setContent(restoredContent);
        setRestoredFrom(fromLabel);
        setVersionLabel(`Restored from: ${fromLabel}`);
    };

    const handleSave = async () => {
        if (!hasChanges || !versionLabel.trim()) {
            return;
        }

        setSaving(true);
        try {
            const response = await fetch('/api/versions/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    branchId: branch.id,
                    content,
                    label: versionLabel,
                }),
            });

            if (response.ok) {
                setVersionLabel('');
                onSave();
            }
        } catch (error) {
            console.error('Error saving version:', error);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="flex flex-col h-full">
            <div className="border-b bg-card p-4">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                        <h2 className="text-lg font-semibold">{branch.label}</h2>
                        {isLive && <Badge variant="success">Live</Badge>}
                    </div>
                    <div className="flex items-center gap-2">
                        {!isLive && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setShowDeployDialog(true)}
                            >
                                <Rocket className="h-4 w-4 mr-2" />
                                Deploy to Live
                            </Button>
                        )}
                    </div>
                </div>
                <p className="text-sm text-muted-foreground">
                    Branch: <code className="bg-muted px-1.5 py-0.5 rounded text-xs">{branch.name}</code>
                </p>
            </div>

            <div className="flex-1 p-6 overflow-y-auto">
                <div className="max-w-4xl mx-auto space-y-4">
                    {restoredFrom && (
                        <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-lg p-3 flex items-center gap-2">
                            <RotateCcw className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                            <p className="text-sm text-blue-800 dark:text-blue-200">
                                Content restored from version: <strong>{restoredFrom}</strong>
                            </p>
                        </div>
                    )}

                    <div>
                        <label className="text-sm font-medium mb-2 block">
                            Prompt Content
                        </label>
                        <Textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="Enter your prompt content here..."
                            className="min-h-[500px] font-mono text-sm leading-relaxed bg-background dark:bg-[#1e1e1e] border-0 focus-visible:ring-0 resize-none p-4"
                        />
                    </div>

                    {hasChanges && (
                        <div className="border rounded-lg p-4 bg-accent/50">
                            <label className="text-sm font-medium mb-2 block">
                                Version Label
                            </label>
                            <div className="flex gap-2">
                                <Input
                                    value={versionLabel}
                                    onChange={(e) => setVersionLabel(e.target.value)}
                                    placeholder="e.g., Updated intro section"
                                    className="flex-1"
                                />
                                <Button
                                    onClick={handleSave}
                                    disabled={saving || !versionLabel.trim()}
                                >
                                    <Save className="h-4 w-4 mr-2" />
                                    {saving ? 'Saving...' : 'Save Version'}
                                </Button>
                            </div>
                            <p className="text-xs text-muted-foreground mt-2">
                                Saving will create a new immutable version in the history
                            </p>
                        </div>
                    )}
                </div>
            </div>

            <DeployDialog
                open={showDeployDialog}
                onOpenChange={setShowDeployDialog}
                branchId={branch.id}
                branchLabel={branch.label}
                onSuccess={() => {
                    setShowDeployDialog(false);
                    onDeploy();
                }}
            />
        </div>
    );
}

// Export handleRestore for parent component
export function usePromptEditor(branch: Branch) {
    const currentVersion = branch.versions.find(v => v.id === branch.headVersionId);
    const [content, setContent] = React.useState(currentVersion?.content || '');
    const [restoredFrom, setRestoredFrom] = React.useState<string | null>(null);

    const handleRestore = (restoredContent: string, fromLabel: string) => {
        setContent(restoredContent);
        setRestoredFrom(fromLabel);
    };

    return { content, restoredFrom, handleRestore };
}
