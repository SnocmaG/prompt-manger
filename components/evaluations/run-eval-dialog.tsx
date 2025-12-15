
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Label } from '@/components/ui/label';
import { Play, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface RunEvalDialogProps {
    evaluationId: string;
}

export function RunEvalDialog({ evaluationId }: RunEvalDialogProps) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [prompts, setPrompts] = useState<{ id: string, name: string }[]>([]);

    const [selectedPromptId, setSelectedPromptId] = useState('');
    const [selectedVersionId, setSelectedVersionId] = useState('');

    const [versions, setVersions] = useState<{ id: string, major: number, minor: number, patch: number, label?: string }[]>([]);

    const router = useRouter();

    // Fetch Prompts on Open
    useEffect(() => {
        if (open) {
            fetch('/api/prompts') // Assumes returns list of {id, name}
                .then(res => res.json())
                .then(data => setPrompts(data))
                .catch(err => console.error(err));
        }
    }, [open]);

    // Fetch Versions when Prompt Selected
    useEffect(() => {
        if (selectedPromptId) {
            fetch(`/api/prompts/${selectedPromptId}`)
                .then(res => res.json())
                .then(data => {
                    // data.versions should be available? Or separate endpoint.
                    // The GET /api/prompts/[id] previously returned versions?
                    // Let's check previously viewed code. Yes, it returns versions.
                    if (data.versions) setVersions(data.versions);
                })
                .catch(err => console.error(err));
        } else {
            setVersions([]);
        }
    }, [selectedPromptId]);


    const handleRun = async () => {
        if (!selectedVersionId) return;
        setLoading(true);
        try {
            const res = await fetch(`/api/evaluations/${evaluationId}/run`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ promptVersionId: selectedVersionId }),
            });

            if (res.ok) {
                setOpen(false);
                router.refresh();
            }
        } catch (error) {
            console.error('Failed to start run', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Play className="mr-2 h-4 w-4" />
                    Run Evaluation
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Run Evaluation</DialogTitle>
                    <DialogDescription>
                        Select a prompt version to test against this dataset.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label>Prompt</Label>
                        <Select onValueChange={setSelectedPromptId}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select Prompt" />
                            </SelectTrigger>
                            <SelectContent>
                                {prompts.map(p => (
                                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid gap-2">
                        <Label>Version</Label>
                        <Select onValueChange={setSelectedVersionId} disabled={!selectedPromptId}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select Version" />
                            </SelectTrigger>
                            <SelectContent>
                                {versions.map(v => (
                                    <SelectItem key={v.id} value={v.id}>
                                        {v.major}.{v.minor}.{v.patch} / {v.label || 'No Label'}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                    <Button onClick={handleRun} disabled={loading || !selectedVersionId}>
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Run Test
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
