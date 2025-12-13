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

export interface PromptEditorProps {
    branch: Branch;
    isLive: boolean;
    content: string; // Controlled
    onChange: (value: string) => void; // Controlled
    onSave: (label: string) => Promise<void>; // Updated signature
    onDeploy: () => void;
    onRestore?: (content: string, label: string) => void;
}

export function PromptEditor({ branch, isLive, content, onChange, onSave, onDeploy, onRestore }: PromptEditorProps) {
    // const currentVersion = branch.versions.find(v => v.id === branch.headVersionId);
    // REMOVED local state for content

    const [versionLabel, setVersionLabel] = useState('');
    const [saving, setSaving] = useState(false);
    const [restoredFrom, setRestoredFrom] = useState<string | null>(null);
    const [showDeployDialog, setShowDeployDialog] = useState(false);

    // Reset restored state when branch changes, parent handles content reset
    React.useEffect(() => {
        setRestoredFrom(null);
    }, [branch.id]);

    const handleSaveClick = async () => {
        if (!versionLabel.trim()) return;
        setSaving(true);
        try {
            await onSave(versionLabel); // Delegate save logic
            setVersionLabel('');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-card"> {/* Removed bg-card/50 to check contrast */}
            <div className="border-b bg-card p-2 px-4 shrink-0 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">System Prompt</span>
                    <code className="bg-muted px-1.5 py-0.5 rounded text-[10px] text-muted-foreground">{branch.name}</code>
                    {isLive && <Badge variant="success" className="h-4 text-[10px]">Live</Badge>}
                </div>
                <div className="flex items-center gap-2">
                    {!isLive && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs"
                            onClick={() => setShowDeployDialog(true)}
                        >
                            <Rocket className="h-3 w-3 mr-1" />
                            Deploy
                        </Button>
                    )}
                </div>
            </div>

            <div className="flex-1 flex flex-col min-h-0">
                <div className="flex-1 relative">
                    <Textarea
                        value={content}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder="Enter system prompt (instructions)..."
                        className="absolute inset-0 w-full h-full p-4 font-mono text-sm leading-relaxed bg-background/50 border-0 focus-visible:ring-0 resize-none rounded-none"
                    />
                </div>

                {/* Bottom Bar: Version Label & Save */}
                <div className="border-t p-2 bg-muted/10 shrink-0">
                    <div className="flex gap-2">
                        <Input
                            value={versionLabel}
                            onChange={(e) => setVersionLabel(e.target.value)}
                            placeholder="Version label (e.g. Iteration 5)..."
                            className="flex-1 h-8 text-xs bg-background"
                        />
                        <Button
                            onClick={handleSaveClick}
                            disabled={saving || !versionLabel.trim()}
                            size="sm"
                            className="h-8 text-xs"
                        >
                            <Save className="h-3 w-3 mr-1" />
                            {saving ? 'Saving...' : 'Save Version'}
                        </Button>
                    </div>
                    {restoredFrom && (
                        <div className="mt-1 flex items-center gap-1 text-[10px] text-blue-400">
                            <RotateCcw className="h-3 w-3" />
                            Restored from: {restoredFrom}
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

// Remove usePromptEditor hook if no longer needed or update it

