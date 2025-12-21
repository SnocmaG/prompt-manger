"use client";

import { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Upload, Sparkles } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

interface SmartImportDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onImport: (cases: string[]) => void;
}

export function SmartImportDialog({ open, onOpenChange, onImport }: SmartImportDialogProps) {
    const [text, setText] = useState('');
    const [separator, setSeparator] = useState('---');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [previewCases, setPreviewCases] = useState<string[]>([]);
    const [activeTab, setActiveTab] = useState('manual');
    const fileInputRef = useRef<HTMLInputElement>(null);

    // -- Logic --

    const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newVal = e.target.value;
        setText(newVal);
        if (activeTab === 'manual') {
            updateManualPreview(newVal, separator);
        }
    };

    const updateManualPreview = (content: string, sep: string) => {
        if (!content.trim()) {
            setPreviewCases([]);
            return;
        }

        let split: string[] = [];
        if (sep === '\\n' || sep === 'newline') {
            split = content.split(/\n+/).filter(t => t.trim().length > 0);
        } else {
            split = content.split(sep).filter(t => t.trim().length > 0);
        }
        setPreviewCases(split.map(s => s.trim()));
    };

    const handleSeparatorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const sep = e.target.value;
        setSeparator(sep);
        updateManualPreview(text, sep);
    };

    const handleAIAnalyze = async () => {
        if (!text.trim()) return;
        setIsAnalyzing(true);
        try {
            const res = await fetch('/api/ai/parse-inputs', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text }),
            });
            const data = await res.json();
            if (data.cases && Array.isArray(data.cases)) {
                setPreviewCases(data.cases);
            }
        } catch (e) {
            console.error(e);
            // Fallback?
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        readFile(file);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const file = e.dataTransfer.files?.[0];
        if (file) readFile(file);
    };

    const readFile = (file: File) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const content = e.target?.result as string;
            setText(content);
            if (activeTab === 'manual') updateManualPreview(content, separator);
        };
        reader.readAsText(file);
    };

    const handleImport = () => {
        onImport(previewCases);
        onOpenChange(false);
        // Reset
        setText('');
        setPreviewCases([]);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl h-[80vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>Batch Import Cases</DialogTitle>
                    <DialogDescription>
                        Paste text or drag a file to add multiple test cases at once.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 flex flex-col gap-4 overflow-hidden min-h-0">

                    {/* Input Area (Drop Zone) */}
                    <div
                        className="relative flex-1 min-h-[150px] border-2 border-dashed border-muted-foreground/25 rounded-md flex flex-col hover:bg-muted/5 transition-colors"
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={handleDrop}
                    >
                        <Textarea
                            placeholder="Paste your prompt cases here... (or drag a file)"
                            className="flex-1 w-full h-full resize-none border-0 focus-visible:ring-0 p-4 bg-transparent"
                            value={text}
                            onChange={handleTextChange}
                        />
                        <div className="absolute right-2 bottom-2">
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-7 text-xs gap-2"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <Upload className="h-3 w-3" />
                                Upload File
                            </Button>
                            <input
                                type="file"
                                className="hidden"
                                ref={fileInputRef}
                                accept=".txt,.csv,.json,.md"
                                onChange={handleFileUpload}
                            />
                        </div>
                    </div>

                    {/* Logic Controls */}
                    <div className="flex flex-col gap-3 shrink-0">
                        <Tabs value={activeTab} onValueChange={(v: string) => {
                            setActiveTab(v);
                            if (v === 'manual') updateManualPreview(text, separator);
                            else if (v === 'ai' && text) handleAIAnalyze(); // Auto trigger? Maybe better manual
                        }}>
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="manual">Custom Separator</TabsTrigger>
                                <TabsTrigger value="ai" className="gap-2">
                                    <Sparkles className="h-3 w-3" />
                                    Smart Auto-Split
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="manual" className="mt-4 space-y-2">
                                <div className="flex items-center gap-4">
                                    <div className="grid w-full max-w-sm items-center gap-1.5">
                                        <Label htmlFor="separator" className="text-xs">Separator String</Label>
                                        <div className="flex gap-2">
                                            <Input
                                                id="separator"
                                                value={separator}
                                                onChange={handleSeparatorChange}
                                                className="h-8"
                                                placeholder="e.g. ---"
                                            />
                                            <Button variant="outline" size="sm" className="h-8" onClick={() => {
                                                setSeparator('\\n');
                                                updateManualPreview(text, '\\n');
                                            }}>Use Newline</Button>
                                        </div>
                                    </div>
                                    <div className="text-xs text-muted-foreground pt-4">
                                        Type a character sequence to split by. <br />Use <code>\n</code> for newlines.
                                    </div>
                                </div>
                            </TabsContent>

                            <TabsContent value="ai" className="mt-4">
                                <div className="flex items-center justify-between bg-muted/30 p-3 rounded-md border">
                                    <div className="text-sm text-foreground">
                                        <span className="font-semibold">AI Analysis</span>
                                        <p className="text-xs text-muted-foreground">Automatically detect and split independent cases.</p>
                                    </div>
                                    <Button
                                        size="sm"
                                        onClick={handleAIAnalyze}
                                        disabled={!text.trim() || isAnalyzing}
                                        className="gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 border-0"
                                    >
                                        {isAnalyzing ? <Sparkles className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
                                        Analyze Text
                                    </Button>
                                </div>
                            </TabsContent>
                        </Tabs>
                    </div>

                    {/* Preview / Results */}
                    <div className="h-[150px] shrink-0 flex flex-col border rounded-md bg-muted/10">
                        <div className="p-2 border-b bg-muted/20 flex items-center justify-between">
                            <span className="text-xs font-semibold uppercase text-muted-foreground">Preview ({previewCases.length} cases found)</span>
                        </div>
                        <ScrollArea className="flex-1 p-2">
                            <div className="space-y-2">
                                {previewCases.length === 0 && (
                                    <div className="text-center text-xs text-muted-foreground py-8 italic">
                                        No cases detected yet. Upload text and choose a split method.
                                    </div>
                                )}
                                {previewCases.map((c, i) => (
                                    <div key={i} className="text-xs p-2 bg-background border rounded-md font-mono line-clamp-2">
                                        <Badge variant="outline" className="mr-2 text-[10px] h-5">#{i + 1}</Badge>
                                        {c.substring(0, 100)}{c.length > 100 ? '...' : ''}
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                    </div>
                </div>

                <DialogFooter className="mt-4">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button onClick={handleImport} disabled={previewCases.length === 0}>
                        Import {previewCases.length} Cases
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
