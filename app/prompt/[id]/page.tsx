"use client";

import { useEffect, useState, useCallback } from "react";
import { useUser, useOrganization } from "@clerk/nextjs";
import { Clock, GitCommit, ChevronRight, Home } from "lucide-react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { PromptEditor } from "@/components/prompt-editor";
import { VersionHistory } from "@/components/version-history";
import { UserPromptInput } from "@/components/user-prompt-input";
import { ResponseViewer } from "@/components/response-viewer";
import { DeployDialog } from "@/components/deploy-dialog";
import { EditVersionDialog } from "@/components/edit-version-dialog";

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
    const [editTarget, setEditTarget] = useState<Version | null>(null);

    const { organization } = useOrganization();

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
                const newVersion = await response.json();

                // Check if we were editing the live version and this is a "Deploy Changes" action
                // The most reliable way is to verify if we are in the "dirty live" state

                // If user intends to deploy this change immediately (simplified heuristic: if it was live & dirty, auto-deploy)
                // However, the user might just want to save a draft. 
                // BUT, the yellow button says "Deploy Changes". So we should deploy it.
                // We'll rely on the button text in the UI to set expectations, but here we need to know.
                // Or better, we can ask the user... but the requirement was "change live button to deploy".
                // Let's safe-guard: if the label implies deployment or if we are in that 'yellow button' mode.

                // For now, let's keep it simple: Just Create. User can then Click 'Deploy' in history.
                // But the user asked "change the live button to deploy".
                // I will add logic: if the previous live version's content was different, and we just saved,
                // we should probably offer to deploy or auto-deploy. 
                // Let's add a second fetch to set it as live if it was a "Deploy Changes" click.
                // Since I can't pass extra args easily without breaking signature, I will manually check:

                const liveVersion = prompt.versions.find(v => v.id === prompt.liveVersionId);
                const isDirtyLive = liveVersion && liveVersion.systemPrompt !== systemPrompt;

                // Only auto-deploy if we were conceptually 'on' the live version (which we track via UI state currentVersionId logic if we had it, but here we just check dirty)
                // Actually, let's just create for now. The user said "deploy again", implying two steps?
                // "limit edit... and then deploy again."
                // "change the live button to deploy". 
                // If the button says "Deploy Changes", it should Deploy.

                if (isDirtyLive) {
                    await fetch(`/api/prompts/${prompt.id}`, {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ liveVersionId: newVersion.id })
                    });
                }

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
                <div className="flex items-center gap-2 text-sm text-muted-foreground overflow-hidden whitespace-nowrap">
                    <div className="flex items-center hover:text-foreground transition-colors cursor-pointer">
                        <Home className="h-4 w-4 mr-1" />
                        <span className="font-medium">{organization ? organization.name : (user?.primaryEmailAddress?.emailAddress || 'Personal')}</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground/50" />
                    <div className="flex items-center font-semibold text-foreground">
                        {prompt.name}
                        <div className="ml-3 flex items-center gap-1.5 text-xs font-normal text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full">
                            <GitCommit className="h-3 w-3" />
                            {prompt.versions.length}
                        </div>
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
                            hasUnsavedChanges={
                                !!(prompt.liveVersionId &&
                                    prompt.versions.find(v => v.id === prompt.liveVersionId)?.systemPrompt !== systemPrompt)
                            }
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

            {editTarget && (
                <EditVersionDialog
                    open={!!editTarget}
                    onOpenChange={(open) => !open && setEditTarget(null)}
                    versionId={editTarget.id}
                    currentLabel={editTarget.label}
                    onSuccess={() => {
                        setEditTarget(null);
                        fetchPrompt();
                    }}
                />
            )}
        </div>
    );
}
