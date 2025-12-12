'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { DeployDialog } from '@/components/deploy-dialog';
import { Save, Rocket } from 'lucide-react';

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
}

export function PromptEditor({ branch, isLive, onSave, onDeploy }: PromptEditorProps) {
    const currentVersion = branch.versions.find(v => v.id === branch.headVersionId);
    const [content, setContent] = useState(currentVersion?.content || '');
    const [versionLabel, setVersionLabel] = useState('');
    const [saving, setSaving] = useState(false);
    const [showDeployDialog, setShowDeployDialog] = useState(false);

    const hasChanges = content !== currentVersion?.content;

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
                    <div>
                        <label className="text-sm font-medium mb-2 block">
                            Prompt Content
                        </label>
                        <Textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="Enter your prompt content here..."
                            className="min-h-[400px] font-mono text-sm"
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
