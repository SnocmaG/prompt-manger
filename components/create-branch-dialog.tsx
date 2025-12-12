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
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';

interface CreateBranchDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    promptId: string;
    onSuccess: () => void;
}

export function CreateBranchDialog({
    open,
    onOpenChange,
    promptId,
    onSuccess,
}: CreateBranchDialogProps) {
    const [name, setName] = useState('');
    const [label, setLabel] = useState('');
    const [creating, setCreating] = useState(false);

    const handleCreate = async () => {
        if (!name.trim() || !label.trim()) return;

        setCreating(true);
        try {
            const response = await fetch('/api/branches/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    promptId,
                    name: name.toLowerCase().replace(/\s+/g, '-'),
                    label,
                }),
            });

            if (response.ok) {
                setName('');
                setLabel('');
                onSuccess();
            }
        } catch (error) {
            console.error('Error creating branch:', error);
        } finally {
            setCreating(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create New Branch</DialogTitle>
                    <DialogDescription>
                        Create a new branch from the current live branch. The content will be copied
                        so you can edit safely.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div>
                        <label className="text-sm font-medium mb-1.5 block">
                            Branch Name (slug)
                        </label>
                        <Input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g., shorter-copy"
                            className="font-mono"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                            Lowercase, use hyphens instead of spaces
                        </p>
                    </div>

                    <div>
                        <label className="text-sm font-medium mb-1.5 block">
                            Branch Label (display name)
                        </label>
                        <Input
                            value={label}
                            onChange={(e) => setLabel(e.target.value)}
                            placeholder="e.g., Shorter Copy"
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleCreate}
                        disabled={creating || !name.trim() || !label.trim()}
                    >
                        {creating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                        Create Branch
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
