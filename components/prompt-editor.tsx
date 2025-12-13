'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
// import { Label } from "@/components/ui/label"; // Removed as file is missing
import { Save, Loader2 } from "lucide-react";


interface PromptEditorProps {
    systemPrompt: string;
    onChange: (value: string) => void;
    onSave: (label: string) => Promise<void>;
    isLive: boolean;
}

export function PromptEditor({ systemPrompt, onChange, onSave, isLive }: PromptEditorProps) {
    const [isSaving, setIsSaving] = useState(false);
    const [label, setLabel] = useState('');
    const [showSaveDialog, setShowSaveDialog] = useState(false);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await onSave(label);
            setShowSaveDialog(false);
            setLabel('');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-card">
            <div className="flex items-center justify-between px-4 py-2 border-b shrink-0 h-14">
                <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm">System Prompt</span>
                    {isLive && (
                        <div className="flex items-center gap-1 bg-green-500/10 text-green-500 px-2 py-0.5 rounded text-[10px] font-medium uppercase tracking-wider">
                            <span className="relative flex h-1.5 w-1.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500"></span>
                            </span>
                            Live
                        </div>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
                        <DialogTrigger asChild>
                            <Button size="sm" className="h-8 gap-2">
                                <Save className="h-4 w-4" />
                                Save Version
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Save Version</DialogTitle>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <label htmlFor="label" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                        Version Label
                                    </label>
                                    <Input
                                        id="label"
                                        placeholder="e.g. v1.2 - refined system prompt"
                                        value={label}
                                        onChange={(e) => setLabel(e.target.value)}
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setShowSaveDialog(false)}>Cancel</Button>
                                <Button onClick={handleSave} disabled={isSaving || !label}>
                                    {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save'}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <div className="flex-1 min-h-0 relative">
                <Textarea
                    value={systemPrompt}
                    onChange={(e) => onChange(e.target.value)}
                    className="absolute inset-0 w-full h-full resize-none p-4 rounded-none border-0 focus-visible:ring-0 font-mono text-sm leading-relaxed"
                    placeholder="You are a helpful assistant..."
                />
            </div>
        </div>
    );
}

// Remove usePromptEditor hook if no longer needed or update it
