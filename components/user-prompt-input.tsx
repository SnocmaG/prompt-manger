import { useState, useEffect } from 'react';
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Import, Play, Layers } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SmartImportDialog } from "./smart-import-dialog";
// Import new Toolbar
import { FilterToolbar } from "./filter-toolbar";

interface UserPromptInputProps {
    value: string;
    onChange: (value: string) => void;
    onRun: () => void;
    isTesting: boolean;
    // Bulk Props
    isBulkMode?: boolean;
    onToggleBulk?: (enabled: boolean) => void;
    bulkInputs?: { id: string; value: string }[];
    onBulkInputChange?: (id: string, value: string) => void;
    onAddBulkInput?: () => void;
    onRemoveBulkInput?: (id: string) => void;
    onImportBulkInputs?: (inputs: { content: string; imageUrl?: string }[]) => void;
    // Single mode extended prop
    imageUrl?: string;
    onImageChange?: (url: string | undefined) => void;
}

export function UserPromptInput({
    value,
    onChange,
    onRun,
    isTesting,
    isBulkMode = false,
    onToggleBulk,
    bulkInputs = [],
    onBulkInputChange,
    onAddBulkInput,
    onRemoveBulkInput,
    onImportBulkInputs,
    imageUrl,
    onImageChange
}: UserPromptInputProps) {
    const [isImportOpen, setIsImportOpen] = useState(false);
    const [availableTypes, setAvailableTypes] = useState<string[]>([]);
    const [availableClients, setAvailableClients] = useState<string[]>([]);
    const [isFetching, setIsFetching] = useState(false);

    // Fetch types on mount (optimize: only once)
    useEffect(() => {
        const loadFilters = async () => {
            try {
                const [typesRes, clientsRes] = await Promise.all([
                    fetch('/api/inputs/types'),
                    fetch('/api/inputs/clients')
                ]);

                if (typesRes.ok) setAvailableTypes(await typesRes.json());
                if (clientsRes.ok) setAvailableClients(await clientsRes.json());
            } catch (e) {
                console.error(e);
            }
        };
        loadFilters();
    }, []);

    const handleFetchReviews = async ({ types, clients, limit }: { types: string[], clients: string[], limit: number }) => {
        if (isFetching || !onImportBulkInputs) return;
        setIsFetching(true);
        try {
            const res = await fetch('/api/inputs/fetch', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ types, client: clients, limit }) /* metadata filters? */
            });
            if (res.ok) {
                const data = await res.json();
                if (data.inputs && Array.isArray(data.inputs)) {
                    // Normalize to object structure
                    const results = data.inputs.map((i: any) => ({
                        content: i.content,
                        imageUrl: i.imageUrl || undefined
                    }));

                    if (!isBulkMode) {
                        // Single Mode: Extract first one
                        if (results.length > 0) {
                            onChange(results[0].content);
                            if (onImageChange) onImageChange(results[0].imageUrl);
                        }
                    } else {
                        // Bulk Mode
                        // NOTE: Bulk import prop signature needs update if we want images in bulk
                        // For now, map back to string or update parent to handle objects
                        // Assuming valid conversion for now, or casting if parent updated
                        onImportBulkInputs?.(results);
                    }
                }
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsFetching(false);
        }
    };

    if (isBulkMode) {
        return (
            <div className="flex flex-col h-full bg-card border-b border-border/40">
                <div className="flex items-center justify-between px-4 py-2 border-b bg-muted/20">
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Bulk Inputs</span>
                        <Badge variant="outline" className="text-[10px] h-4">{bulkInputs.length} Cases</Badge>
                    </div>
                    <div className="flex items-center gap-1">

                        {/* New Filter Toolbar */}
                        {onImportBulkInputs && (
                            <div className="mr-2">
                                <FilterToolbar
                                    onFetch={handleFetchReviews}
                                    isFetching={isFetching}
                                    availableTypes={availableTypes}
                                    availableClients={availableClients}
                                    isBulkMode={true}
                                />
                            </div>
                        )}

                        {onImportBulkInputs && (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 w-7 p-0 text-muted-foreground hover:text-primary"
                                onClick={() => setIsImportOpen(true)}
                                disabled={isTesting}
                                title="Import file"
                            >
                                <Import className="h-4 w-4" />
                            </Button>
                        )}

                        <div className="h-4 w-px bg-border/50 mx-2" />

                        {/* Run Button */}
                        <Button
                            size="icon"
                            variant="default"
                            className="h-7 w-7 rounded-full shadow-sm hover:shadow-md transition-all active:scale-95 bg-primary text-primary-foreground flex items-center justify-center mr-2"
                            onClick={onRun}
                            disabled={isTesting}
                            title="Run Bulk Tests"
                        >
                            <Play className="h-3.5 w-3.5 fill-current ml-0.5" />
                        </Button>

                        {/* Bulk Toggle Icon */}
                        <div className="flex items-center gap-2 mr-1">
                            {onToggleBulk && (
                                <Button
                                    variant="secondary"
                                    size="icon"
                                    className="h-7 w-7 rounded-sm border-primary/20 bg-primary/10 text-primary"
                                    onClick={() => onToggleBulk(!isBulkMode)}
                                    title="Switch to Single Mode"
                                >
                                    <Layers className="h-4 w-4" />
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
                <div className="flex-1 relative overflow-hidden bg-muted/10">
                    <ScrollArea className="h-full w-full">
                        <div className="p-4 space-y-3">
                            {bulkInputs.map((input, index) => (
                                <div key={input.id} className="relative group">
                                    <div className="absolute top-2 left-2 text-[10px] text-muted-foreground font-mono bg-background/80 px-1 rounded border">
                                        Case #{index + 1}
                                    </div>
                                    <Textarea
                                        value={input.value}
                                        onChange={(e) => onBulkInputChange?.(input.id, e.target.value)}
                                        placeholder={`Test case ${index + 1}...`}
                                        className="min-h-[80px] pt-7 pr-10 text-sm font-mono resize-none bg-background shadow-sm"
                                        disabled={isTesting}
                                    />
                                    {bulkInputs.length > 1 && (
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="absolute top-1 right-1 h-6 w-6 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                                            onClick={() => onRemoveBulkInput?.(input.id)}
                                            disabled={isTesting}
                                        >
                                            <Trash2 className="h-3 w-3" />
                                        </Button>
                                    )}
                                </div>
                            ))}
                            <Button
                                variant="outline"
                                size="sm"
                                className="w-full border-dashed text-muted-foreground hover:text-foreground"
                                onClick={onAddBulkInput}
                                disabled={isTesting || bulkInputs.length >= 20}
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Add Test Case
                            </Button>
                        </div>
                    </ScrollArea>

                    <SmartImportDialog
                        open={isImportOpen}
                        onOpenChange={setIsImportOpen}
                        onImport={(cases) => onImportBulkInputs?.(cases)}
                        availableClients={availableClients}
                        availableTypes={availableTypes}
                    />

                </div>
                <div className="p-3 border-t bg-background/50 flex justify-end">
                    <Button
                        size="sm"
                        onClick={onRun}
                        disabled={isTesting}
                        className="w-full sm:w-auto"
                    >
                        {isTesting ? 'Running All...' : `Run ${bulkInputs.length} Tests`}
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-card border-b border-border/40">
            <div className="flex items-center justify-between px-4 py-2 border-b bg-muted/20">
                <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">User Prompt</span>
                    <Badge variant="outline" className="text-[10px] h-4">Single Input</Badge>
                    {imageUrl && (
                        <Badge variant="secondary" className="text-[10px] h-4 gap-1 text-blue-600 bg-blue-50 border-blue-200">
                            <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
                            Image Attached
                        </Badge>
                    )}
                </div>
                <div className="flex items-center gap-2">

                    {/* Filter Toolbar (Single Mode - No Limit) */}
                    {onImportBulkInputs && (
                        <div className="mr-2">
                            <FilterToolbar
                                onFetch={handleFetchReviews}
                                isFetching={isFetching}
                                availableTypes={availableTypes}
                                availableClients={availableClients}
                                isBulkMode={false} // Force single mode
                            />
                        </div>
                    )}

                    <div className="h-4 w-px bg-border/50 mx-1" />

                    <Button
                        size="icon"
                        variant="default"
                        className="h-7 w-7 rounded-full shadow-sm hover:shadow-md transition-all active:scale-95 bg-primary text-primary-foreground flex items-center justify-center"
                        onClick={onRun}
                        disabled={isTesting}
                        title="Run Test (⌘+Enter)"
                    >
                        <Play className="h-3.5 w-3.5 fill-current ml-0.5" />
                    </Button>

                    {/* Bulk Toggle in Single Mode */}
                    {onToggleBulk && (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground hover:text-foreground rounded-sm ml-1"
                            onClick={() => onToggleBulk(!isBulkMode)}
                            title="Switch to Bulk Mode"
                        >
                            <Layers className="h-4 w-4" />
                        </Button>
                    )}
                </div>
            </div>
            <Textarea
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onKeyDown={(e) => {
                    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
                        e.preventDefault();
                        onRun();
                    }
                }}
                placeholder="Enter test input (User Prompt)..."
                className="flex-1 p-4 text-sm font-mono border-0 focus-visible:ring-0 resize-none rounded-none bg-background/50"
                disabled={isTesting}
            />
            <div className="px-4 py-1 text-[10px] text-muted-foreground border-t flex justify-end bg-background/50">
                Hit <span className="font-mono bg-muted px-1 rounded ml-1">⌘+Enter</span> to run
            </div>
        </div>
    );
}
