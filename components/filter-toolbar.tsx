"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuCheckboxItem,
    DropdownMenuTrigger,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem
} from "@/components/ui/dropdown-menu"
import {
    ListFilter,
    Star,
    Tag,
    Hash,
    CloudDownload,
    Loader2,
    X,
    Building2
} from "lucide-react"

interface FilterToolbarProps {
    onFetch: (options: { ratings: number[], types: string[], clients: string[], limit: number }) => void;
    isFetching: boolean;
    availableTypes: string[];
    availableClients: string[];
    isBulkMode?: boolean; // If false, limit is fixed to 1 and hidden
}

export function FilterToolbar({ onFetch, isFetching, availableTypes, availableClients, isBulkMode = false }: FilterToolbarProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [selectedRatings, setSelectedRatings] = useState<number[]>([]);
    const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
    const [selectedClients, setSelectedClients] = useState<string[]>([]);
    const [limit, setLimit] = useState(isBulkMode ? 10 : 1);

    // Reset limit if mode changes
    useEffect(() => {
        setLimit(isBulkMode ? 10 : 1);
    }, [isBulkMode]);

    const activeCount = selectedRatings.length + selectedTypes.length + selectedClients.length;

    const handleFetch = () => {
        onFetch({ ratings: selectedRatings, types: selectedTypes, clients: selectedClients, limit });
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

    const toggleClient = (c: string) => {
        setSelectedClients(prev =>
            prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c]
        );
    };

    const clearFilters = (e: React.MouseEvent) => {
        e.stopPropagation();
        setSelectedRatings([]);
        setSelectedTypes([]);
        setSelectedClients([]);
    };

    return (
        <motion.div
            layout
            className="flex items-center bg-card border rounded-md shadow-sm overflow-hidden h-9"
            initial={false}
            animate={{ width: isExpanded ? "auto" : "auto" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
            {/* Main Toggle Button */}
            <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
                className={`h-full px-3 gap-2 text-xs font-medium hover:bg-muted/50 rounded-none ${activeCount > 0 ? "text-primary" : "text-muted-foreground"}`}
            >
                <ListFilter className="h-4 w-4" />
                <span className="hidden sm:inline">Filters</span>
                {activeCount > 0 && (
                    <Badge variant="secondary" className="px-1 h-4 min-w-[16px] text-[9px] flex items-center justify-center">
                        {activeCount}
                    </Badge>
                )}
            </Button>

            {/* Expanded Controls */}
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: "auto" }}
                        exit={{ opacity: 0, width: 0 }}
                        transition={{ duration: 0.2 }}
                        className="flex items-center overflow-hidden border-l"
                    >
                        {/* Rating Filter */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant={selectedRatings.length > 0 ? "secondary" : "ghost"} size="icon" className="h-9 w-9 rounded-none border-r hover:bg-muted/50">
                                    <Star className={`h-4 w-4 ${selectedRatings.length > 0 ? 'text-yellow-500 fill-current' : ''}`} />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start">
                                <DropdownMenuLabel>Filter by Rating</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                {[5, 4, 3, 2, 1].map(r => (
                                    <DropdownMenuCheckboxItem
                                        key={r}
                                        checked={selectedRatings.includes(r)}
                                        onCheckedChange={() => toggleRating(r)}
                                    >
                                        {r} Stars
                                    </DropdownMenuCheckboxItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>

                        {/* Type Filter */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant={selectedTypes.length > 0 ? "secondary" : "ghost"} size="icon" className="h-9 w-9 rounded-none border-r hover:bg-muted/50">
                                    <Tag className={`h-4 w-4 ${selectedTypes.length > 0 ? 'text-blue-500' : ''}`} />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start">
                                <DropdownMenuLabel>Filter by Type</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <ScrollArea className="h-[200px]">
                                    {availableTypes.length === 0 ? (
                                        <div className="p-2 text-xs text-muted-foreground">No types found</div>
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
                            </DropdownMenuContent>
                        </DropdownMenu>

                        {/* Client Filter */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant={selectedClients.length > 0 ? "secondary" : "ghost"} size="icon" className="h-9 w-9 rounded-none border-r hover:bg-muted/50">
                                    <Building2 className={`h-4 w-4 ${selectedClients.length > 0 ? 'text-purple-500' : ''}`} />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start">
                                <DropdownMenuLabel>Filter by Client</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <ScrollArea className="h-[200px]">
                                    {availableClients.length === 0 ? (
                                        <div className="p-2 text-xs text-muted-foreground">No clients found</div>
                                    ) : (
                                        availableClients.map(c => (
                                            <DropdownMenuCheckboxItem
                                                key={c}
                                                checked={selectedClients.includes(c)}
                                                onCheckedChange={() => toggleClient(c)}
                                            >
                                                {c}
                                            </DropdownMenuCheckboxItem>
                                        ))
                                    )}
                                </ScrollArea>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        {/* Limit Filter (Bulk Only) */}
                        {isBulkMode && (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-9 w-9 rounded-none border-r hover:bg-muted/50">
                                        <div className="relative">
                                            <Hash className="h-4 w-4" />
                                            <span className="absolute -bottom-2 -right-2 text-[8px] font-mono bg-muted px-0.5 rounded border">{limit}</span>
                                        </div>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="start">
                                    <DropdownMenuLabel>Fetch Limit</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuRadioGroup value={limit.toString()} onValueChange={(v) => setLimit(parseInt(v))}>
                                        {[10, 20, 50, 100].map(l => (
                                            <DropdownMenuRadioItem key={l} value={l.toString()}>
                                                {l} Reviews
                                            </DropdownMenuRadioItem>
                                        ))}
                                    </DropdownMenuRadioGroup>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        )}

                        {/* Fetch Button */}
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-9 px-3 gap-2 rounded-none hover:bg-primary/10 hover:text-primary transition-colors"
                            onClick={handleFetch}
                            disabled={isFetching}
                        >
                            {isFetching ? <Loader2 className="h-4 w-4 animate-spin" /> : <CloudDownload className="h-4 w-4" />}
                            <span className="text-xs font-medium">Fetch</span>
                        </Button>

                        {/* Clear Button (if active) */}
                        {activeCount > 0 && (
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-9 w-9 rounded-none border-l hover:bg-destructive/10 hover:text-destructive"
                                onClick={clearFilters}
                                title="Clear Filters"
                            >
                                <X className="h-3 w-3" />
                            </Button>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
