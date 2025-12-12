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

interface DeployDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    branchId: string;
    branchLabel: string;
    onSuccess: () => void;
}

export function DeployDialog({
    open,
    onOpenChange,
    branchId,
    branchLabel,
    onSuccess,
}: DeployDialogProps) {
    const [deploying, setDeploying] = useState(false);

    const handleDeploy = async () => {
        setDeploying(true);
        try {
            const response = await fetch('/api/branches/deploy', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ branchId }),
            });

            if (response.ok) {
                onSuccess();
            }
        } catch (error) {
            console.error('Error deploying branch:', error);
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
                        Deploy to Live
                    </DialogTitle>
                    <DialogDescription>
                        Are you sure you want to deploy <strong>{branchLabel}</strong> to live?
                        This will make it the active prompt for all production automations.
                    </DialogDescription>
                </DialogHeader>

                <div className="bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-900 rounded-lg p-4 my-4">
                    <p className="text-sm text-yellow-800 dark:text-yellow-200">
                        <strong>Warning:</strong> External systems (like n8n) will immediately start
                        using this version. Make sure you've tested it thoroughly.
                    </p>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button onClick={handleDeploy} disabled={deploying}>
                        {deploying && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                        Deploy to Live
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
