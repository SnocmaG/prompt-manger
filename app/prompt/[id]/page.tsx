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

export default function PromptWorkshop() {
    const { user, isLoaded } = useUser();
    const params = useParams();
    const router = useRouter();

    const [prompt, setPrompt] = useState<Prompt | null>(null);
    const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
    const [loading, setLoading] = useState(true);

    const promptId = params.id as string;

    useEffect(() => {
        if (!isLoaded) return;
        if (!user) {
            // Should be handled by middleware, but safe fallback
            router.push("/");
            return;
        }
        fetchPrompt();
    }, [isLoaded, user, promptId]);

    const fetchPrompt = async () => {
        try {
            const response = await fetch(`/api/prompts/${promptId}`);
            if (response.ok) {
                const data = await response.json();
                setPrompt(data);

                // Initial branch selection logic
                if (!selectedBranch && data.branches.length > 0) {
                    const liveBranch = data.branches.find(
                        (b: Branch) => b.id === data.liveBranchId
                    );
                    setSelectedBranch(liveBranch || data.branches[0]);
                } else if (selectedBranch) {
                    // Refresh selected branch data
                    const updatedBranch = data.branches.find(
                        (b: Branch) => b.id === selectedBranch.id
                    );
                    if (updatedBranch) setSelectedBranch(updatedBranch);
                }
            } else {
                // Handle 404
                console.error("Prompt not found");
            }
        } catch (error) {
            console.error("Error fetching prompt:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleRestore = (content: string, label: string) => {
        // This state is passed to editor via props in the original, 
        // but the editor handles content via internal state too.
        // For now, we'll implement this properly in the editor component refactor.
        // The current implementation in page.tsx passed `restoredContent` to PromptEditor.
        // I need to check PromptEditor to see if it accepts a prop for this.
        console.log("Restore requested", content, label);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-background">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!prompt) {
        return (
            <div className="flex flex-col h-screen bg-background">
                <DashboardHeader />
                <div className="flex flex-1 items-center justify-center">
                    <div className="text-center">
                        <h2 className="text-xl font-bold">Prompt Not Found</h2>
                        <Button variant="link" onClick={() => router.push("/")}>Return to Dashboard</Button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="flex flex-col h-screen bg-background">

            {/* Context Bar */}
            <div className="border-b px-6 py-2 bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex items-center justify-between text-sm h-12 shadow-sm z-10">
                <div className="flex items-center gap-2 text-muted-foreground">
                    <Button variant="ghost" size="sm" className="h-6 px-2 text-muted-foreground hover:text-foreground" onClick={() => router.push('/')}>
                        Dashboard
                    </Button>
                    <span className="text-muted-foreground/40">/</span>
                    <span className="font-medium text-foreground flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-primary/60"></span>
                        {prompt.name}
                    </span>
                </div>
            </div>

            <div className="flex flex-1 overflow-hidden">
                {/* Left Sidebar - Branch List */}
                <div className="w-64 border-r bg-sidebar overflow-y-auto flex flex-col">
                    <div className="p-3 border-b">
                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Branches</span>
                    </div>
                    <div className="flex-1">
                        <BranchList
                            branches={prompt.branches}
                            liveBranchId={prompt.liveBranchId}
                            selectedBranchId={selectedBranch?.id || null}
                            onSelectBranch={setSelectedBranch}
                            onBranchCreated={fetchPrompt}
                            promptId={prompt.id}
                        />
                    </div>
                </div>

                {/* Center - Editor */}
                <div className="flex-1 flex flex-col overflow-hidden relative">
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
                            <div className="flex h-full items-center justify-center text-muted-foreground">
                                Select a branch to start editing
                            </div>
                        )}
                    </div>
                    {/* Bottom - Test Panel */}
                    <div className="border-t bg-background">
                        {selectedBranch && (
                            <TestPanel
                                branchId={selectedBranch.id}
                                promptId={prompt.id}
                                initialWebhookUrl={prompt.webhookUrl || ''}
                                onWebhookSave={fetchPrompt}
                            />
                        )}
                    </div>
                </div>

                {/* Right Sidebar - History */}
                <div className="w-80 border-l bg-card overflow-y-auto">
                    <div className="p-3 border-b sticky top-0 bg-card z-10">
                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Version History</span>
                    </div>
                    {selectedBranch && (
                        <VersionHistory
                            versions={selectedBranch.versions}
                            onRestore={handleRestore}
                        />
                    )}
                </div>

            </div>
        </div>
    );
}
