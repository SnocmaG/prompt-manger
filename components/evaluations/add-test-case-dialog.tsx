
'use client';

import { useState } from 'react';
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
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Plus, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface AddTestCaseDialogProps {
    evaluationId: string;
}

export function AddTestCaseDialog({ evaluationId }: AddTestCaseDialogProps) {
    const [open, setOpen] = useState(false);
    const [input, setInput] = useState('{\n  "variable": "value"\n}');
    const [expectedOutput, setExpectedOutput] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleCreate = async () => {
        if (!input.trim()) return;
        setLoading(true);
        try {
            // Validate JSON
            try {
                JSON.parse(input);
            } catch {
                alert("Input variables must be valid JSON");
                setLoading(false);
                return;
            }

            const res = await fetch(`/api/evaluations/${evaluationId}/items`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ input, expectedOutput }),
            });

            if (res.ok) {
                setOpen(false);
                setInput('{\n  "variable": "value"\n}');
                setExpectedOutput('');
                router.refresh();
            }
        } catch (error) {
            console.error('Failed to add test case', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="sm" variant="outline" className="gap-1">
                    <Plus className="h-3.5 w-3.5" />
                    Add Case
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Add Test Case</DialogTitle>
                    <DialogDescription>
                        Define input variables (JSON) and optional expected output.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="input">Input Variables (JSON)</Label>
                        <Textarea
                            id="input"
                            className="font-mono text-xs h-[100px]"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="expected">Expected Output (Optional)</Label>
                        <Textarea
                            id="expected"
                            className="font-mono text-xs h-[80px]"
                            placeholder="Exact match string or leave empty."
                            value={expectedOutput}
                            onChange={(e) => setExpectedOutput(e.target.value)}
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                    <Button onClick={handleCreate} disabled={loading || !input.trim()}>
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Add
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
