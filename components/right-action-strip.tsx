import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

export interface SidebarTab {
    id: string;
    icon: ReactNode;
    label: string;
    content: ReactNode;
}

interface RightActionStripProps {
    tabs: SidebarTab[];
    activeTab: string | null;
    onTabChange: (tabId: string | null) => void;
}

export function RightActionStrip({ tabs, activeTab, onTabChange }: RightActionStripProps) {
    return (
        <div className="w-[50px] border-l bg-muted/10 flex flex-col items-center py-4 gap-4 shrink-0 z-20 h-full">
            {tabs.map((tab) => (
                <div key={tab.id} className="relative group">
                    <Button
                        variant={activeTab === tab.id ? "secondary" : "ghost"}
                        size="icon"
                        className={cn(
                            "h-10 w-10 rounded-xl transition-all",
                            activeTab === tab.id
                                ? "bg-primary/10 text-primary hover:bg-primary/20"
                                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                        )}
                        onClick={() => onTabChange(activeTab === tab.id ? null : tab.id)}
                        title={tab.label}
                    >
                        {tab.icon}
                    </Button>
                    <div className="absolute right-full mr-2 top-1/2 -translate-y-1/2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded shadow-md opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                        {tab.label}
                    </div>
                </div>
            ))}
        </div>
    );
}
