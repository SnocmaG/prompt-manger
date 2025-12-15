'use client';

import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, AlertTriangle } from 'lucide-react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';

interface DeployDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    promptId: string;
    versionId: string;
    versionLabel: string;
    onSuccess: () => void;
}

export function DeployDialog({
    open,
    onOpenChange,
    promptId,
    versionId,
    versionLabel,
    onSuccess,
}: DeployDialogProps) {
    const [deploying, setDeploying] = useState(false);
    const [envSlug, setEnvSlug] = useState('production');

    const handleDeploy = async () => {
        setDeploying(true);
        try {
            // New API structure for environments
            const response = await fetch(`/api/prompts/${promptId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    deployment: {
                        slug: envSlug,
                        versionId: versionId
                    }
                }),
            });

            if (response.ok) {
                onSuccess();
            }
        } catch (error) {
            console.error('Error deploying version:', error);
        } finally {
            setDeploying(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-yellow-500" />
                        Deploy Version
                    </DialogTitle>
                    <DialogDescription>
                        You are about to deploy version <strong>{versionLabel}</strong>.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="env">Target Environment</Label>
                        <Select value={envSlug} onValueChange={setEnvSlug}>
                            <SelectTrigger id="env">
                                <SelectValue placeholder="Select environment" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="production">Production</SelectItem>
                                <SelectItem value="staging">Staging</SelectItem>
                                <SelectItem value="development">Development</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-900 rounded-lg p-4">
                        <p className="text-sm text-yellow-800 dark:text-yellow-200">
                            <strong>Warning:</strong> External systems connected to <strong>{envSlug}</strong> will immediately start using this version.
                        </p>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button onClick={handleDeploy} disabled={deploying}>
                        {deploying && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                        Deploy to {envSlug.charAt(0).toUpperCase() + envSlug.slice(1)}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
