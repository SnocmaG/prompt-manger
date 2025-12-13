"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { Clock, PanelRightClose, PanelRightOpen, ArrowLeft, GitBranch } from "lucide-react";
import { useSearchParams, useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { BranchList } from "@/components/branch-list";
import { PromptEditor } from "@/components/prompt-editor";
import { VersionHistory } from "@/components/version-history";
import { TestPanel } from "@/components/test-panel";
import { DashboardHeader } from "@/components/dashboard-header";
import { UserPromptInput } from "@/components/user-prompt-input";
import { ResponseViewer } from "@/components/response-viewer";
import { Input } from "@/components/ui/input";

interface Version {
    id: string;
    content: string;
    label: string;
    createdAt: string;
    createdBy?: string;
}

interface Branch {
    id: string;
    name: string;
    label: string;
    headVersionId: string | null;
    versions: Version[];
}

interface Prompt {
    id: string;
    name: string;
    liveBranchId: string | null;
    branches: Branch[];
    webhookUrl?: string;
    createdAt: string;
    updatedAt: string;
    createdById: string;
}

type AIProvider = 'mock' | 'openai' | 'anthropic';

export default function PromptWorkshop() {
    const { user, isLoaded } = useUser();
    const params = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();
    const branchParam = searchParams.get('branch');

    const [prompt, setPrompt] = useState<Prompt | null>(null);
    const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
    const [loading, setLoading] = useState(true);
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);

    // --- Lifted State ---
    const [systemPrompt, setSystemPrompt] = useState('');
    const [userPrompt, setUserPrompt] = useState('');
    const [aiOutput, setAiOutput] = useState('');
    const [error, setError] = useState<string | undefined>();
    const [isRunning, setIsRunning] = useState(false);

    // AI Config State
    // AI Config State
    const [provider, setProvider] = useState<AIProvider>('openai');
    const [customModel, setCustomModel] = useState('gpt-4o-mini');

    const promptId = params.id as string;

    // ... Auth Effect ...
    useEffect(() => {
        if (!isLoaded) return;
        // Simple auth check
        if (!user) {
            // console.log("User not found, redirecting");
            // router.push("/"); 
            // Commented out auto-redirect for testing to prevent ghost redirects if Clerk flickers. 
            // Middleware should handle mostly.
        }
        fetchPrompt();
    }, [isLoaded, user, promptId]);

    // Update systemPrompt when branch changes
    useEffect(() => {
        if (selectedBranch) {
            const head = selectedBranch.versions.find(v => v.id === selectedBranch.headVersionId);
            setSystemPrompt(head?.content || '');
        }
    }, [selectedBranch, prompt]);

    // ... Fetch Logic ...
    const fetchPrompt = async () => {
        try {
            const response = await fetch(`/api/prompts/${promptId}`);
            if (response.ok) {
                const data = await response.json();
                setPrompt(data);
                // Selection logic: Keep current if possible, else default
                const targetId = selectedBranch?.id || branchParam || data.liveBranchId || (data.branches[0]?.id);
                const branch = data.branches.find((b: any) => b.id === targetId) || data.branches[0];
                setSelectedBranch(branch);
            }
        } catch (e) { console.error(e); } finally { setLoading(false); }
    };

    // --- Actions ---

    // 1. Run Test
    const handleRunTest = async () => {
        if (!selectedBranch) return;
        setIsRunning(true);
        setError(undefined);
        setAiOutput('');

        try {
            // We use the 'testPrompt' API which might need update to accept RAW content?
            // The existing API reads from DB. We want to test CURRENT EDITOR CONTENT.
            // If the API only supports DB, we need to save a draft OR update API to accept 'content' override.
            // LET'S UPDATE API TO ACCEPT 'promptContent' override.
            // Check `app / api / ai / test / route.ts` - it reads from DB.
            // FIX: We will pass `promptContent` in the body.

            const response = await fetch('/api/ai/test', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    branchId: selectedBranch.id, // Still needed for auth?
                    testInput: userPrompt,
                    provider,
                    model: provider === 'openai' ? customModel : undefined,
                    overrideContent: systemPrompt // We need to handle this in backend
                }),
            });

            const data = await response.json();
            if (response.ok) {
                setAiOutput(data.output);
            } else {
                setError(data.error || 'Test failed');
            }
        } catch (e) {
            setError('Network error');
        } finally {
            setIsRunning(false);
        }
    };

    // 2. Save System Prompt (Version)
    const handleSaveVersion = async (label: string) => {
        if (!selectedBranch) return;
        try {
            const response = await fetch('/api/versions/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    branchId: selectedBranch.id,
                    content: systemPrompt,
                    label,
                }),
            });
            if (response.ok) {
                fetchPrompt(); // Refresh list
            }
        } catch (e) { console.error(e); }
    };

    if (loading) return <div className="flex h-screen items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>;
    if (!prompt) return <div>Not Found</div>;

    return (
        <div className="flex flex-col h-screen bg-background overflow-hidden font-sans">
            {/* Header / Context Bar */}
            <div className="h-14 border-b bg-card flex items-center justify-between px-4 shrink-0 z-20">
                <div className="flex items-center gap-4">
                    <span className="font-semibold text-lg">{prompt.name}</span>
                    {selectedBranch && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded-full">
                            <GitBranch className="h-3 w-3" />
                            {selectedBranch.label}
                        </div>
                    )}
                </div>

                {/* AI Config Bar (Top Right) */}
                <div className="flex items-center gap-2">
                    {provider === 'openai' && (
                        <Input
                            value={customModel}
                            onChange={e => setCustomModel(e.target.value)}
                            className="h-7 w-32 text-xs bg-background"
                            placeholder="Model"
                        />
                    )}
                    <select
                        value={provider}
                        onChange={e => setProvider(e.target.value as AIProvider)}
                        className="h-7 text-xs bg-background border rounded px-2"
                    >
                        <option value="openai">OpenAI</option>
                        <option value="anthropic">Anthropic</option>
                        <option value="mock">Mock</option>
                        <option value="mock">Mock</option>
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

                    {/* Top Pane: User Prompt (Test Input) - 40% height initially? Or flex-1? User asked for "upper half is user prompt". 50/50 vertical. */}
                    <div className="flex-1 min-h-0 border-b border-border/50">
                        <UserPromptInput
                            value={userPrompt}
                            onChange={setUserPrompt}
                            onRun={handleRunTest}
                            isTesting={isRunning}
                        />
                    </div>

                    {/* Bottom Pane: System Prompt (Editor) - 50% */}
                    <div className="flex-1 min-h-0">
                        {selectedBranch ? (
                            <PromptEditor
                                branch={selectedBranch}
                                isLive={selectedBranch.id === prompt.liveBranchId}
                                content={systemPrompt}
                                onChange={setSystemPrompt}
                                onSave={handleSaveVersion}
                                onDeploy={fetchPrompt}
                                onRestore={(c, l) => { setSystemPrompt(c); setIsHistoryOpen(false); }}
                            />
                        ) : <div>Select Branch</div>}
                    </div>
                </div>

                {/* Right Column: AI Response (50%) */}
                <div className="flex-1 flex flex-col min-w-[400px] bg-black">
                    <ResponseViewer
                        output={aiOutput}
                        isTesting={isRunning}
                        provider={provider}
                        error={error}
                    />
                </div>

                {/* Drawer Overlay */}
                <div
                    className={`fixed inset-y-0 right-0 z-30 w-80 bg-card border-l shadow-2xl transition-transform duration-300 ${isHistoryOpen ? 'translate-x-0' : 'translate-x-full'} pt-14`}
                >
                    <div className="h-full overflow-y-auto">
                        {selectedBranch && (
                            <VersionHistory
                                versions={selectedBranch.versions}
                                onRestore={(c, l) => { setSystemPrompt(c); setIsHistoryOpen(false); }}
                            />
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}
