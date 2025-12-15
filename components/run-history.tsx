import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface PromptExecution {
    id: string;
    promptId: string;
    versionLabel?: string;
    systemPrompt: string;
    userPrompt: string;
    model: string;
    provider: string;
    response: string;
    createdAt: string;
    createdBy: string;
}

interface RunHistoryProps {
    executions: PromptExecution[];
    onSelect: (execution: PromptExecution) => void;
    selectedId?: string | null;
}

export function RunHistory({ executions, onSelect, selectedId }: RunHistoryProps) {
    if (!executions || executions.length === 0) {
        return (
            <div className="flex flex-col h-full bg-card">

                <div className="flex flex-col items-center justify-center flex-1 text-muted-foreground p-4 text-center">
                    <p className="text-sm">No run history yet.</p>
                    <p className="text-xs mt-1 text-muted-foreground/60">Run a test to see logs here.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-card">

            <ScrollArea className="flex-1">
                <div className="flex flex-col divide-y">
                    {executions.map((run) => {
                        const date = new Date(run.createdAt);
                        const formattedDate = date.toISOString().slice(0, 19).replace('T', ' '); // yyyy-mm-dd hh:mm:ss

                        return (
                            <button
                                key={run.id}
                                onClick={() => onSelect(run)}
                                className={cn(
                                    "flex flex-col items-start gap-1 p-4 text-left hover:bg-muted/50 transition-colors w-full",
                                    selectedId === run.id && "bg-muted"
                                )}
                            >
                                <div className="flex items-center justify-between w-full mb-1">
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <span>{formattedDate}</span>
                                    </div>
                                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-primary/5 text-primary">
                                        {run.model}
                                    </span>
                                </div>

                                {run.versionLabel && (
                                    <div className="text-xs font-medium text-blue-500 mb-1">
                                        {run.versionLabel}
                                    </div>
                                )}

                                <div className="text-sm font-medium line-clamp-1 w-full text-foreground/90">
                                    {run.userPrompt || '<Empty Input>'}
                                </div>
                                <div className="text-xs text-muted-foreground line-clamp-2 w-full font-mono mt-1 opacity-80">
                                    {run.response}
                                </div>
                            </button>
                        );
                    })}
                </div>
            </ScrollArea>
        </div>
    );
}
