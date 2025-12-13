"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { GitBranch } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { BranchList } from "@/components/branch-list";
import { PromptEditor } from "@/components/prompt-editor";
import { VersionHistory } from "@/components/version-history";
import { TestPanel } from "@/components/test-panel";
import { DashboardHeader } from "@/components/dashboard-header";

interface Prompt {
    id: string;
    name: string;
    webhookUrl: string | null;
    liveBranchId: string | null;
    branches: Branch[];
}

interface Branch {
    id: string;
    name: string;
    label: string;
    headVersionId: string | null;
    versions: Version[];
}

interface Version {
    id: string;
    content: string;
    label: string;
    createdAt: string;
    createdBy: string;
}

// ... imports
import { Clock, PanelRightClose, PanelRightOpen, ArrowLeft } from "lucide-react";
import { useSearchParams } from "next/navigation";

// ... interfaces

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

    const promptId = params.id as string;

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

    // ...

    // And update the History button to be safe
    // ... onClick={(e) => { e.preventDefault(); setIsHistoryOpen(!isHistoryOpen); }}

    // Effect to handle branch switching via URL
    useEffect(() => {
        if (prompt && branchParam) {
            const branch = prompt.branches.find(b => b.id === branchParam);
            if (branch) {
                setSelectedBranch(branch);
            }
        }
    }, [branchParam, prompt]);

    const fetchPrompt = async () => {
        try {
            const response = await fetch(`/api/prompts/${promptId}`);
            if (response.ok) {
                const data = await response.json();
                setPrompt(data);

                // Initial branch selection (if not set by URL yet)
                if (!selectedBranch) {
                    // Check URL again inside here? Or just default to live/first
                    const targetBranchId = branchParam || data.liveBranchId;
                    const targetBranch = data.branches.find((b: Branch) => b.id === targetBranchId) || data.branches[0];
                    setSelectedBranch(targetBranch);
                } else {
                    // Refresh selected branch data if it exists
                    const updatedBranch = data.branches.find((b: Branch) => b.id === selectedBranch.id);
                    if (updatedBranch) setSelectedBranch(updatedBranch);
                }
            } else {
                console.error("Prompt not found");
            }
        } catch (error) {
            console.error("Error fetching prompt:", error);
        } finally {
            setLoading(false);
        }
    };

    // ... handleRestore ...
    const handleRestore = (content: string, label: string) => {
        console.log("Restore requested", content, label);
        // Implement full restore logic or pass to Editor
    };

    if (loading) return <div className="flex h-screen items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>;
    if (!prompt) return <div className="p-10 text-center">Prompt not found. <Button variant="link" onClick={() => router.push('/')}>Go Back</Button></div>;

    return (
        <div className="flex flex-col h-screen bg-background overflow-hidden">
            {/* Context Bar */}
            <div className="border-b px-4 py-2 bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex items-center justify-between text-sm h-14 shadow-sm z-20 sticky top-0">
                <div className="flex items-center gap-3">
                    {/* Back button needed since Sidebar doesn't have explicit "Back" for sub-pages? No, Sidebar is global. */}
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <span className="font-semibold text-foreground text-lg flex items-center gap-2">
                            {prompt.name}
                        </span>
                        {selectedBranch && (
                            <span className="flex items-center gap-1 text-xs bg-muted px-2 py-0.5 rounded-full">
                                <GitBranch className="h-3 w-3" />
                                {selectedBranch.label} {selectedBranch.id === prompt.liveBranchId && <span className="text-green-500 font-bold ml-1">• Live</span>}
                            </span>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => { e.preventDefault(); setIsHistoryOpen(!isHistoryOpen); }}
                        className={isHistoryOpen ? "bg-muted text-foreground" : "text-muted-foreground"}
                    >
                        {isHistoryOpen ? <PanelRightClose className="h-4 w-4 mr-2" /> : <Clock className="h-4 w-4 mr-2" />}
                        {isHistoryOpen ? "Hide History" : "History"}
                    </Button>
                </div>
            </div>

            <div className="flex flex-1 overflow-hidden relative">

                {/* Center Content Area - Split Screen */}
                <div className="flex-1 flex flex-row overflow-hidden relative">

                    {/* Left: Editor (50%) */}
                    <div className="flex-1 flex flex-col overflow-hidden border-r border-border/40 min-w-[400px]">
                        <div className="flex-1 overflow-y-auto">
                            {selectedBranch ? (
                                <PromptEditor
                                    branch={selectedBranch}
                                    isLive={selectedBranch.id === prompt.liveBranchId}
                                    onSave={fetchPrompt}
                                    onDeploy={fetchPrompt}
                                    onRestore={handleRestore}
                                />
                            ) : (
                                <div className="flex h-full items-center justify-center text-muted-foreground">Select a branch</div>
                            )}
                        </div>
                    </div>

                    {/* Right: Test Panel (50%) */}
                    <div className="flex-1 flex flex-col bg-background min-w-[400px]">
                        {selectedBranch ? (
                            <TestPanel
                                branchId={selectedBranch.id}
                                promptId={prompt.id}
                                initialWebhookUrl={prompt.webhookUrl || ''}
                                onWebhookSave={fetchPrompt}
                            />
                        ) : (
                            <div className="flex h-full items-center justify-center text-muted-foreground bg-muted/5">
                                Select a branch to test
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Drawer - Version History */}
                {/* We use a fixed/absolute positioning or flex with generic transition */}
                <div
                    className={`
                        fixed inset-y-0 right-0 z-30 w-80 bg-card border-l transform transition-transform duration-300 ease-in-out shadow-2xl
                        ${isHistoryOpen ? 'translate-x-0' : 'translate-x-full'}
                        pt-14 
                    `}
                >
                    <div className="h-full flex flex-col">
                        <div className="p-3 border-b flex items-center justify-between bg-card">
                            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Version History</span>
                            <Button variant="ghost" size="icon" onClick={() => setIsHistoryOpen(false)} className="h-6 w-6">
                                <PanelRightClose className="h-4 w-4" />
                            </Button>
                        </div>
                        <div className="flex-1 overflow-y-auto">
                            {selectedBranch && (
                                <VersionHistory
                                    versions={selectedBranch.versions}
                                    onRestore={handleRestore}
                                />
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
