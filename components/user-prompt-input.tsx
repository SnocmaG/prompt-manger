import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, List, FileText, Send } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

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
    onRemoveBulkInput
}: UserPromptInputProps) {
    if (isBulkMode) {
        return (
            <div className="flex flex-col h-full bg-card border-b border-border/40">
                <div className="flex items-center justify-between px-4 py-2 border-b bg-muted/20">
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Bulk Inputs</span>
                        <Badge variant="outline" className="text-[10px] h-4">{bulkInputs.length} Cases</Badge>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="flex items-center gap-2 mr-2">
                            <Switch
                                id="bulk-mode"
                                checked={isBulkMode}
                                onCheckedChange={onToggleBulk}
                            />
                            <Label htmlFor="bulk-mode" className="text-xs">Bulk Mode</Label>
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
                    {onToggleBulk && (
                        <div className="flex items-center gap-2 mr-2">
                            <Switch
                                id="bulk-mode"
                                checked={isBulkMode}
                                onCheckedChange={onToggleBulk}
                            />
                            <Label htmlFor="bulk-mode" className="text-xs text-muted-foreground">Bulk Mode</Label>
                        </div>
                    )}
                    <Button
                        size="icon"
                        variant="default"
                        className="h-6 w-6 rounded-full shadow-sm hover:shadow-md transition-all active:scale-95 bg-primary text-primary-foreground"
                        onClick={onRun}
                        disabled={isTesting}
                        title="Run Test (⌘+Enter)"
                    >
                        <Send className="h-3 w-3 translate-x-px translate-y-px" />
                    </Button>
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
