"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";

interface EditVersionDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    versionId: string;
    currentLabel: string;
    onSuccess: () => void;
}

export function EditVersionDialog({ open, onOpenChange, versionId, currentLabel, onSuccess }: EditVersionDialogProps) {
    const [label, setLabel] = useState(currentLabel);
    const [loading, setLoading] = useState(false);

    const handleSave = async () => {
        if (!label.trim()) return;
        setLoading(true);
        try {
            const response = await fetch(`/api/versions/${versionId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ label }),
            });

            if (response.ok) {
                onSuccess();
                onOpenChange(false);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Edit Version Label</DialogTitle>
                    <DialogDescription>
                        Update the label for this version.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <label htmlFor="label" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            Label
                        </label>
                        <Input
                            id="label"
                            value={label}
                            onChange={(e) => setLabel(e.target.value)}
                            placeholder="e.g. v1.0"
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
                        Cancel
                    </Button>
                    <Button onClick={handleSave} disabled={loading || !label.trim()}>
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Changes
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
