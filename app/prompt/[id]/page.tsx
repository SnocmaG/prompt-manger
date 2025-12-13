"use client";

import { useEffect, useState, useCallback } from "react";
import { useUser } from "@clerk/nextjs";
import { Clock, GitCommit } from "lucide-react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { PromptEditor } from "@/components/prompt-editor";
import { VersionHistory } from "@/components/version-history";
import { UserPromptInput } from "@/components/user-prompt-input";
import { ResponseViewer } from "@/components/response-viewer";
import { DeployDialog } from "@/components/deploy-dialog";

interface Version {
    id: string;
    systemPrompt: string;
    userPrompt: string;
    label: string;
    createdAt: string;
    createdBy?: string;
}

interface Prompt {
    id: string;
    name: string;
    liveVersionId: string | null;
    versions: Version[];
    createdAt: string;
    updatedAt: string;
    createdById: string;
}

type AIProvider = 'mock' | 'openai' | 'anthropic';

export default function PromptWorkshop() {
    const { user, isLoaded } = useUser();
    const params = useParams();

    const [prompt, setPrompt] = useState<Prompt | null>(null);
    const [loading, setLoading] = useState(true);
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);

    // --- Lifted State ---
    const [systemPrompt, setSystemPrompt] = useState('');
    const [userPrompt, setUserPrompt] = useState('');
    const [aiOutput, setAiOutput] = useState('');
    const [error, setError] = useState<string | undefined>();
    const [isRunning, setIsRunning] = useState(false);
    const [usedModel, setUsedModel] = useState<string | undefined>();

    // AI Config State
    const [provider] = useState<AIProvider>('openai');
    const [customModel, setCustomModel] = useState('gpt-4o-mini');

    const [deployTarget, setDeployTarget] = useState<Version | null>(null);

    const promptId = params.id as string;

    // ... Fetch Logic ...
    const fetchPrompt = useCallback(async () => {
        try {
            const response = await fetch(`/api/prompts/${promptId}`);
            if (response.ok) {
                const data = await response.json();
                setPrompt(data);

                // If it's the first load or we have no inputs yet, load the latest/live version
                // For now, let's load HEAD (latest created) if distinct
                if (data.versions && data.versions.length > 0) {
                    const head = data.versions[0]; // Ordered by desc
                    setSystemPrompt(head.systemPrompt);
                    setUserPrompt(head.userPrompt || '');
                }
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, [promptId]);

    // ... Auth Effect ...
    useEffect(() => {
        if (!isLoaded) return;
        fetchPrompt();
    }, [isLoaded, user, promptId, fetchPrompt]);


    // --- Actions ---

    // 1. Run Test
    const handleRunTest = async () => {
        setIsRunning(true);
        setError(undefined);
        setAiOutput('');

        try {
            const response = await fetch('/api/ai/test', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    testInput: userPrompt,
                    provider,
                    model: customModel,
                    overrideContent: systemPrompt
                }),
            });

            const data = await response.json();
            if (response.ok) {
                setAiOutput(data.output);
                setUsedModel(data.model);
            } else {
                setError(data.error || 'Test failed');
                setUsedModel(undefined);
            }
        } catch {
            setError('Network error');
        } finally {
            setIsRunning(false);
        }
    };

    // 2. Save System Prompt (Version)
    const handleSaveVersion = async (label: string) => {
        if (!prompt) return;
        try {
            const response = await fetch('/api/versions/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    promptId: prompt.id,
                    systemPrompt,
                    userPrompt,
                    label,
                }),
            });
            if (response.ok) {
                fetchPrompt(); // Refresh list
            }
        } catch (e) { console.error(e); }
    };

    const handleRestore = (sys: string, user: string) => {
        setSystemPrompt(sys);
        setUserPrompt(user);
        setIsHistoryOpen(false);
    };

    if (loading) return <div className="flex h-screen items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>;
    if (!prompt) return <div>Not Found</div>;

    const currentVersionId = prompt.versions?.[0]?.id; // Simplification: "Current" is just latest for editing context usually

    return (
        <div className="flex flex-col h-screen bg-background overflow-hidden font-sans">
            {/* Header / Context Bar */}
            <div className="h-14 border-b bg-card flex items-center justify-between px-4 shrink-0 z-20">
                <div className="flex items-center gap-4">
                    <span className="font-semibold text-lg">{prompt.name}</span>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded-full">
                        <GitCommit className="h-3 w-3" />
                        {prompt.versions.length} versions
                    </div>
                </div>

                {/* AI Config Bar (Top Right) */}
                <div className="flex items-center gap-2">
                    <select
                        value={customModel}
                        onChange={e => setCustomModel(e.target.value)}
                        className="h-7 text-xs bg-background border rounded px-2 min-w-[140px]"
                    >
                        <optgroup label="GPT-5 (Preview)">
                            <option value="gpt-5-preview">GPT-5 Preview</option>
                            <option value="gpt-5">GPT-5</option>
                        </optgroup>
                        <optgroup label="GPT-4 Checkpoints">
                            <option value="gpt-4o">GPT-4o</option>
                            <option value="gpt-4o-mini">GPT-4o Mini</option>
                            <option value="gpt-4-turbo">GPT-4 Turbo</option>
                            <option value="gpt-4">GPT-4</option>
                        </optgroup>
                        <optgroup label="GPT-3.5">
                            <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                        </optgroup>
                    </select>


                    <div className="w-px h-4 bg-border mx-2" />
                    <Button variant="ghost" size="sm" onClick={() => setIsHistoryOpen(!isHistoryOpen)}>
                        <Clock className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Main Workspace - 2 Columns */}
            <div className="flex-1 flex flex-row overflow-hidden">

                {/* Left Column: Input + System Prompt (50%) */}
                <div className="flex-1 flex flex-col border-r border-border/50 min-w-[400px] overflow-hidden">

                    {/* Top Pane: User Prompt (Test Input) */}
                    <div className="flex-1 min-h-0 border-b border-border/50">
                        <UserPromptInput
                            value={userPrompt}
                            onChange={setUserPrompt}
                            onRun={handleRunTest}
                            isTesting={isRunning}
                        />
                    </div>

                    {/* Bottom Pane: System Prompt (Editor) */}
                    <div className="flex-1 min-h-0">
                        <PromptEditor
                            systemPrompt={systemPrompt}
                            onChange={setSystemPrompt}
                            onSave={handleSaveVersion}
                            // onDeploy={fetchPrompt} // TODO: Implement deploy/set live logic
                            isLive={currentVersionId === prompt.liveVersionId}
                        />
                    </div>
                </div>

                {/* Right Column: AI Response (50%) */}
                <div className="flex-1 flex flex-col min-w-[400px] border-l border-border/50">
                    <ResponseViewer
                        output={aiOutput}
                        isTesting={isRunning}
                        provider={provider}
                        error={error}
                        model={usedModel}
                    />
                </div>

                {/* Drawer Overlay */}
                <div
                    className={`fixed inset-y-0 right-0 z-30 w-80 bg-card border-l shadow-2xl transition-transform duration-300 ${isHistoryOpen ? 'translate-x-0' : 'translate-x-full'} pt-14`}
                >
                    <div className="h-full overflow-y-auto">
                        <VersionHistory
                            versions={prompt.versions}
                            liveVersionId={prompt.liveVersionId}
                            onRestore={handleRestore}
                            onDeploy={setDeployTarget}
                        />
                    </div>
                </div>

            </div>

            {deployTarget && (
                <DeployDialog
                    open={!!deployTarget}
                    onOpenChange={(open) => !open && setDeployTarget(null)}
                    promptId={prompt.id}
                    versionId={deployTarget.id}
                    versionLabel={deployTarget.label}
                    onSuccess={() => {
                        setDeployTarget(null);
                        fetchPrompt();
                    }}
                />
            )}
        </div>
    );
}
