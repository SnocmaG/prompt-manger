import { useState, useEffect } from 'react';
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Import, Play, Star, Tag, Hash, CloudDownload, Loader2, ListFilter, Layers, Square, X } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { SmartImportDialog } from "./smart-import-dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuCheckboxItem,
    DropdownMenuTrigger,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";

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
    onImportBulkInputs?: (inputs: string[]) => void;
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
    onImportBulkInputs
}: UserPromptInputProps) {
    const [isImportOpen, setIsImportOpen] = useState(false);

    // Filter State
    const [selectedRatings, setSelectedRatings] = useState<number[]>([]);
    const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
    const [availableTypes, setAvailableTypes] = useState<string[]>([]);
    const [limit, setLimit] = useState(10);
    const [isFetching, setIsFetching] = useState(false);

    // Fetch available review types on mount (if in bulk mode)
    useEffect(() => {
        if (isBulkMode) {
            fetch('/api/reviews/types')
                .then(res => res.ok ? res.json() : [])
                .then(setAvailableTypes)
                .catch(console.error);
        }
    }, [isBulkMode]);

    const handleFetchReviews = async () => {
        if (isFetching || !onImportBulkInputs) return;
        setIsFetching(true);
        try {
            const res = await fetch('/api/reviews/fetch', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ratings: selectedRatings,
                    types: selectedTypes,
                    limit
                })
            });
            if (res.ok) {
                const data = await res.json();
                if (data.reviews && Array.isArray(data.reviews)) {
                    onImportBulkInputs(data.reviews);
                }
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsFetching(false);
        }
    };

    const toggleRating = (r: number) => {
        setSelectedRatings(prev =>
            prev.includes(r) ? prev.filter(x => x !== r) : [...prev, r]
        );
    };

    const toggleType = (t: string) => {
        setSelectedTypes(prev =>
            prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]
        );
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

                        {/* Filter Menu */}
                        {onImportBulkInputs && (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant={selectedRatings.length > 0 || selectedTypes.length > 0 ? "secondary" : "outline"}
                                        size="sm"
                                        className="h-7 gap-2 px-2 text-xs mr-2 border-dashed"
                                    >
                                        <ListFilter className="h-3.5 w-3.5" />
                                        <span>Filters</span>
                                        {(selectedRatings.length > 0 || selectedTypes.length > 0) && (
                                            <Badge variant="secondary" className="px-1 h-4 min-w-[16px] text-[9px] ml-0.5">
                                                {selectedRatings.length + selectedTypes.length}
                                            </Badge>
                                        )}
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-[200px]">
                                    <DropdownMenuLabel className="flex items-center justify-between">
                                        <span>Filter Reviews</span>
                                        {(selectedRatings.length > 0 || selectedTypes.length > 0) && (
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-4 w-4"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    setSelectedRatings([]);
                                                    setSelectedTypes([]);
                                                }}
                                            >
                                                <X className="h-3 w-3" />
                                            </Button>
                                        )}
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator />

                                    <DropdownMenuLabel className="text-xs font-normal text-muted-foreground flex items-center gap-2">
                                        <Star className="h-3 w-3" /> Ratings
                                    </DropdownMenuLabel>
                                    {[5, 4, 3, 2, 1].map(r => (
                                        <DropdownMenuCheckboxItem
                                            key={r}
                                            checked={selectedRatings.includes(r)}
                                            onCheckedChange={() => toggleRating(r)}
                                        >
                                            {r} Stars
                                        </DropdownMenuCheckboxItem>
                                    ))}

                                    <DropdownMenuSeparator />
                                    <DropdownMenuLabel className="text-xs font-normal text-muted-foreground flex items-center gap-2">
                                        <Tag className="h-3 w-3" /> Type
                                    </DropdownMenuLabel>
                                    <ScrollArea className="h-[100px]">
                                        {availableTypes.length === 0 ? (
                                            <div className="p-2 text-xs text-muted-foreground italic">No types found</div>
                                        ) : (
                                            availableTypes.map(t => (
                                                <DropdownMenuCheckboxItem
                                                    key={t}
                                                    checked={selectedTypes.includes(t)}
                                                    onCheckedChange={() => toggleType(t)}
                                                >
                                                    {t}
                                                </DropdownMenuCheckboxItem>
                                            ))
                                        )}
                                    </ScrollArea>

                                    <DropdownMenuSeparator />
                                    <DropdownMenuLabel className="text-xs font-normal text-muted-foreground flex items-center gap-2">
                                        <Hash className="h-3 w-3" /> Limit
                                    </DropdownMenuLabel>
                                    <DropdownMenuRadioGroup value={limit.toString()} onValueChange={(v) => setLimit(parseInt(v))}>
                                        <div className="flex items-center justify-between px-2 py-1">
                                            {[10, 20, 50].map(l => (
                                                <Button
                                                    key={l}
                                                    variant={limit === l ? "secondary" : "ghost"}
                                                    size="sm"
                                                    className="h-6 w-8 text-[10px] p-0"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        setLimit(l);
                                                    }}
                                                >
                                                    {l}
                                                </Button>
                                            ))}
                                        </div>
                                    </DropdownMenuRadioGroup>

                                    <DropdownMenuSeparator />
                                    <div className="p-2">
                                        <Button
                                            size="sm"
                                            className="w-full h-7 gap-2"
                                            onClick={handleFetchReviews}
                                            disabled={isFetching}
                                        >
                                            {isFetching ? <Loader2 className="h-3 w-3 animate-spin" /> : <CloudDownload className="h-3 w-3" />}
                                            Fetch {limit} Reviews
                                        </Button>
                                    </div>
                                </DropdownMenuContent>
                            </DropdownMenu>
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
                                    variant={isBulkMode ? "secondary" : "ghost"}
                                    size="icon"
                                    className="h-7 w-7 rounded-sm"
                                    onClick={() => onToggleBulk(!isBulkMode)}
                                    title="Toggle Bulk Mode"
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
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        size="icon"
                        variant="default"
                        className="h-6 w-6 rounded-full shadow-sm hover:shadow-md transition-all active:scale-95 bg-primary text-primary-foreground flex items-center justify-center"
                        onClick={onRun}
                        disabled={isTesting}
                        title="Run Test (⌘+Enter)"
                    >
                        <Play className="h-3 w-3 fill-current ml-0.5" />
                    </Button>

                    {onToggleBulk && (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-muted-foreground hover:text-foreground"
                            onClick={() => onToggleBulk(!isBulkMode)}
                            title="Switch to Bulk Mode"
                        >
                            <Square className="h-4 w-4" />
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
            {/* Added a hint for consistency, though not strictly required if keeping orig style */}
            <div className="px-4 py-1 text-[10px] text-muted-foreground border-t flex justify-end bg-background/50">
                Hit <span className="font-mono bg-muted px-1 rounded ml-1">⌘+Enter</span> to run
            </div>
        </div>
    );
}
