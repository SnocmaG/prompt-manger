"use client";

import { useEffect, useState, useCallback } from "react";
import { useUser, useOrganization } from "@clerk/nextjs";
import { GitCommit, ChevronRight, Home, History as HistoryIcon } from "lucide-react";
import { useParams } from "next/navigation";
import { PromptEditor } from "@/components/prompt-editor";
import { VersionHistory } from "@/components/version-history";
import { UserPromptInput } from "@/components/user-prompt-input";
import { ResponseViewer } from "@/components/response-viewer";
import { DeployDialog } from "@/components/deploy-dialog";
import { EditVersionDialog } from "@/components/edit-version-dialog";
import { RunHistory } from "@/components/run-history";
import { RightSidebar } from "@/components/right-sidebar";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { PlayCircle } from "lucide-react";

interface Version {
    id: string;
    systemPrompt: string;
    userPrompt: string;
    label: string;
    createdAt: string;
    createdBy?: string;
}

// Basic type structure matching PromptExecution from prisma
interface Execution {
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

interface Prompt {
    id: string;
    name: string;
    liveVersionId: string | null;
    defaultModel?: string | null;
    versions: Version[];
    createdAt: string;
    updatedAt: string;
    createdById: string;
    executions?: Execution[];
}

type AIProvider = 'mock' | 'openai' | 'anthropic';

export default function PromptWorkshop() {
    const { user, isLoaded } = useUser();
    const params = useParams();

    const [prompt, setPrompt] = useState<Prompt | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeRightTab, setActiveRightTab] = useState<string | null>(null);

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
    const [availableModels, setAvailableModels] = useState<{ id: string }[]>([]);

    const [deployTarget, setDeployTarget] = useState<Version | null>(null);
    const [editTarget, setEditTarget] = useState<Version | null>(null);

    const [activeMobileTab, setActiveMobileTab] = useState<'input' | 'system' | 'response'>('input');

    const { organization } = useOrganization();

    const promptId = params.id as string;

    // ... Fetch Logic ...
    const fetchPrompt = useCallback(async () => {
        try {
            const response = await fetch(`/api/prompts/${promptId}`);
            if (response.ok) {
                const data: Prompt = await response.json();
                setPrompt(data);

                // If it's the first load or we have no inputs yet, load the latest/live version
                // For now, let's load HEAD (latest created) if distinct
                if (data.versions && data.versions.length > 0) {
                    const head = data.versions[0]; // Ordered by desc
                    setSystemPrompt(head.systemPrompt);
                    setUserPrompt(head.userPrompt || '');
                }

                // Initial model from DB
                if (data.defaultModel) {
                    setCustomModel(data.defaultModel);
                }
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, [promptId]);

    // Fetch available models
    useEffect(() => {
        const fetchModels = async () => {
            try {
                const res = await fetch('/api/models');
                if (res.ok) {
                    const data = await res.json();
                    setAvailableModels(data);
                }
            } catch (e) {
                console.error("Failed to fetch models", e);
            }
        };
        fetchModels();
    }, []);

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

                // Update default model if changed
                if (prompt && prompt.defaultModel !== customModel) {
                    // Fire and forget update
                    fetch(`/api/prompts/${prompt.id}`, {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ defaultModel: customModel })
                    });
                    // Optimistic update
                    setPrompt({ ...prompt, defaultModel: customModel });
                }

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
                const liveVersion = prompt.versions.find(v => v.id === prompt.liveVersionId);
                const isDirtyLive = liveVersion && liveVersion.systemPrompt !== systemPrompt;

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
        setActiveRightTab(null);
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
                        <span className="font-medium hidden sm:inline">{organization ? organization.name : (user?.primaryEmailAddress?.emailAddress || 'Personal')}</span>
                        <span className="font-medium sm:hidden">Home</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground/50" />
                    <div className="flex items-center font-semibold text-foreground truncate max-w-[150px] sm:max-w-none">
                        {prompt.name}
                        <div className="ml-3 flex items-center gap-1.5 text-xs font-normal text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full">
                            <GitCommit className="h-3 w-3" />
                            {prompt.versions.length}
                        </div>
                    </div>
                </div>

                {/* AI Config Bar (Top Right) */}
                <div className="flex items-center gap-2">
                    <span className="hidden sm:inline-block">
                        <select
                            value={customModel}
                            onChange={e => setCustomModel(e.target.value)}
                            className="h-7 text-xs bg-background border rounded px-2 min-w-[140px] max-w-[200px]"
                        >
                            {availableModels.length > 0 ? (
                                availableModels.map(model => (
                                    <option key={model.id} value={model.id}>
                                        {model.id}
                                    </option>
                                ))
                            ) : (
                                // Fallback if API fails
                                <>
                                    <option value="gpt-4o">gpt-4o</option>
                                    <option value="gpt-4o-mini">gpt-4o-mini</option>
                                    <option value="gpt-4-turbo">gpt-4-turbo</option>
                                </>
                            )}
                        </select>
                    </span>

                </div>
            </div>

            {/* Main Workspace + Sidebar */}
            <div className="flex-1 flex overflow-hidden relative">
                {/* Editor Area */}
                <div className="flex-1 flex flex-col min-w-0 relative">

                    {/* Mobile Tab Nav */}
                    <div className="md:hidden flex items-center border-b bg-muted/20 shrink-0">
                        <button
                            onClick={() => setActiveMobileTab('input')}
                            className={`flex-1 py-2 text-sm font-medium border-b-2 transition-colors ${activeMobileTab === 'input' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground'}`}
                        >
                            Input
                        </button>
                        <button
                            onClick={() => setActiveMobileTab('system')}
                            className={`flex-1 py-2 text-sm font-medium border-b-2 transition-colors ${activeMobileTab === 'system' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground'}`}
                        >
                            System
                        </button>
                        <button
                            onClick={() => setActiveMobileTab('response')}
                            className={`flex-1 py-2 text-sm font-medium border-b-2 transition-colors ${activeMobileTab === 'response' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground'}`}
                        >
                            Response
                        </button>
                    </div>

                    {/* Mobile Content Area */}
                    <div className="md:hidden flex-1 relative overflow-hidden">
                        {activeMobileTab === 'input' && (
                            <div className="absolute inset-0 flex flex-col">
                                <UserPromptInput
                                    value={userPrompt}
                                    onChange={setUserPrompt}
                                    onRun={() => {
                                        handleRunTest();
                                        setActiveMobileTab('response'); // Auto switch
                                    }}
                                    isTesting={isRunning}
                                />
                            </div>
                        )}
                        {activeMobileTab === 'system' && (
                            <div className="absolute inset-0 flex flex-col">
                                <PromptEditor
                                    systemPrompt={systemPrompt}
                                    onChange={setSystemPrompt}
                                    onSave={handleSaveVersion}
                                    isLive={currentVersionId === prompt.liveVersionId}
                                    hasUnsavedChanges={
                                        !!(prompt.liveVersionId &&
                                            prompt.versions.find(v => v.id === prompt.liveVersionId)?.systemPrompt !== systemPrompt)
                                    }
                                />
                            </div>
                        )}
                        {activeMobileTab === 'response' && (
                            <div className="absolute inset-0 flex flex-col bg-card">
                                <ResponseViewer
                                    output={aiOutput}
                                    isTesting={isRunning}
                                    provider={provider}
                                    error={error}
                                    model={usedModel}
                                />
                            </div>
                        )}
                    </div>


                    {/* Desktop Resizable Grid - Hidden on Mobile */}
                    <div className="hidden md:flex absolute inset-0">
                        <PanelGroup direction="horizontal" className="h-full w-full">

                            {/* Left Column: Input + System Prompt (Resizable Width) */}
                            <Panel defaultSize={50} minSize={20}>
                                <PanelGroup direction="vertical">

                                    {/* Top Pane: User Prompt (Resizable Height) */}
                                    <Panel defaultSize={40} minSize={20}>
                                        <div className="h-full flex flex-col border-b border-border/50">
                                            <UserPromptInput
                                                value={userPrompt}
                                                onChange={setUserPrompt}
                                                onRun={handleRunTest}
                                                isTesting={isRunning}
                                            />
                                        </div>
                                    </Panel>

                                    <PanelResizeHandle className="h-1 bg-border/50 hover:bg-primary/20 transition-colors w-full cursor-row-resize" />

                                    {/* Bottom Pane: System Prompt */}
                                    <Panel defaultSize={60} minSize={20}>
                                        <div className="h-full flex flex-col">
                                            <PromptEditor
                                                systemPrompt={systemPrompt}
                                                onChange={setSystemPrompt}
                                                onSave={handleSaveVersion}
                                                isLive={currentVersionId === prompt.liveVersionId}
                                                hasUnsavedChanges={
                                                    !!(prompt.liveVersionId &&
                                                        prompt.versions.find(v => v.id === prompt.liveVersionId)?.systemPrompt !== systemPrompt)
                                                }
                                            />
                                        </div>
                                    </Panel>
                                </PanelGroup>
                            </Panel>

                            <PanelResizeHandle className="w-1 bg-border/50 hover:bg-primary/20 transition-colors h-full cursor-col-resize" />

                            {/* Right Column: AI Response (Resizable Width) */}
                            <Panel defaultSize={50} minSize={20}>
                                <div className="h-full flex flex-col border-l border-border/50 bg-card">
                                    <ResponseViewer
                                        output={aiOutput}
                                        isTesting={isRunning}
                                        provider={provider}
                                        error={error}
                                        model={usedModel}
                                    />
                                </div>
                            </Panel>

                        </PanelGroup>
                    </div>

                </div>

                <RightSidebar
                    activeTab={activeRightTab}
                    onTabChange={setActiveRightTab}
                    tabs={[
                        {
                            id: 'history',
                            label: 'Version History',
                            icon: <HistoryIcon className="h-5 w-5" />,
                            content: prompt && (
                                <VersionHistory
                                    versions={prompt.versions}
                                    liveVersionId={prompt.liveVersionId}
                                    onRestore={handleRestore}
                                    onDeploy={setDeployTarget}
                                />
                            )
                        },
                        {
                            id: 'runs',
                            label: 'Run History',
                            icon: <PlayCircle className="h-5 w-5" />,
                            content: prompt && (
                                <RunHistory
                                    executions={prompt.executions ? prompt.executions.map(e => ({
                                        ...e,
                                        versionLabel: e.versionLabel || undefined
                                    })) : []}
                                    onSelect={(run) => {
                                        setAiOutput(run.response);
                                        setUserPrompt(run.userPrompt);
                                        setUsedModel(run.model);
                                        setActiveMobileTab('response');
                                        setActiveRightTab(null);
                                    }}
                                />
                            )
                        }
                    ]}
                />
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
