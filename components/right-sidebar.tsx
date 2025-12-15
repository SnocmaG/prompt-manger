import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ChevronRight } from "lucide-react";
import { ReactNode } from "react";

export interface SidebarTab {
    id: string;
    icon: ReactNode;
    label: string;
    content: ReactNode;
}

interface RightSidebarProps {
    tabs: SidebarTab[];
    activeTab: string | null;
    onTabChange: (tabId: string | null) => void;
}

export function RightSidebar({ tabs, activeTab, onTabChange }: RightSidebarProps) {
    const activeContent = tabs.find(t => t.id === activeTab);

    return (
        <div className="flex h-full shrink-0">
            {/* Expanded Drawer Area */}
            <div
                className={cn(
                    "flex flex-col border-l bg-card transition-all duration-300 overflow-hidden",
                    activeTab ? "w-80 sm:w-96" : "w-0 opacity-0"
                )}
            >
                {activeTab && activeContent && (
                    <div className="flex flex-col h-full min-w-[20rem]">
                        <div className="flex items-center justify-between p-3 border-b h-14 shrink-0">
                            <h3 className="font-semibold text-sm flex items-center gap-2">
                                {activeContent.icon}
                                {activeContent.label}
                            </h3>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                onClick={() => onTabChange(null)}
                            >
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                        <div className="flex-1 overflow-hidden">
                            {activeContent.content}
                        </div>
                    </div>
                )}
            </div>

            {/* Minimized Action Strip */}
            <div className="w-[50px] border-l bg-muted/10 flex flex-col items-center py-4 gap-4 shrink-0 z-20">
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
                        {/* Tooltip-ish label on hover if not active */}
                        <div className="absolute right-full mr-2 top-1/2 -translate-y-1/2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded shadow-md opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                            {tab.label}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
