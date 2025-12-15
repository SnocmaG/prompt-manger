import { GitBranch } from "lucide-react";

export function Logo({ className = "", iconClassName = "h-5 w-5", collapsed = false }: { className?: string, iconClassName?: string, collapsed?: boolean }) {
    return (
        <div className={`flex items-center gap-2 ${className}`}>
            <div className="p-1.5 rounded-md bg-gradient-to-br from-primary to-primary/60 shadow-lg shadow-primary/20">
                <GitBranch className={`${iconClassName} text-primary-foreground`} />
            </div>
            {!collapsed && (
                <div className="flex flex-col gap-0 leading-none">
                    <span className="font-bold text-lg tracking-tight">Prompt</span>
                    <span className="font-medium text-[10px] text-muted-foreground uppercase opacity-80 tracking-widest ml-[1px]">Manager</span>
                </div>
            )}
        </div>
    );
}
