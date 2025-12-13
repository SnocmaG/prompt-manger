'use client';

import { useEffect, useState } from 'react';
import { useUser, SignIn, OrganizationSwitcher } from '@clerk/nextjs';
import { UserButton } from '@clerk/nextjs';
import { BranchList } from '@/components/branch-list';
import { PromptEditor } from '@/components/prompt-editor';
import { VersionHistory } from '@/components/version-history';
import { TestPanel } from '@/components/test-panel';
import { GitBranch, Plus, FolderPlus } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { CreatePromptDialog } from '@/components/create-prompt-dialog';
import { ModeToggle } from '@/components/mode-toggle';
import { LandingPage } from '@/components/landing-page';

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

export default function Home() {
    const { user, isLoaded } = useUser();
    const [prompts, setPrompts] = useState<Prompt[]>([]);
    const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);
    const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
    const [loading, setLoading] = useState(true);
    const [restoredContent, setRestoredContent] = useState<{ content: string, label: string } | null>(null);
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

    useEffect(() => {
        if (isLoaded && user) {
            fetchPrompts();
        } else if (isLoaded && !user) {
            // User is loaded but not authenticated
            setLoading(false);
        }
    }, [isLoaded, user]);

    const fetchPrompts = async () => {
        try {
            const response = await fetch('/api/prompts');
            if (response.ok) {
                const data = await response.json();
                setPrompts(data);
                if (data.length > 0) {
                    setSelectedPrompt(data[0]);
                    if (data[0].branches.length > 0) {
                        // Select live branch or first branch
                        const liveBranch = data[0].branches.find(
                            (b: Branch) => b.id === data[0].liveBranchId
                        );
                        setSelectedBranch(liveBranch || data[0].branches[0]);
                    }
                }
            }
        } catch (error) {
            console.error('Error fetching prompts:', error);
        } finally {
            setLoading(false);
        }
    };

    const refreshPrompt = async () => {
        if (!selectedPrompt) return;

        try {
            const response = await fetch(`/api/prompts/${selectedPrompt.id}`);
            if (response.ok) {
                const data = await response.json();
                setSelectedPrompt(data);

                // Update selected branch
                if (selectedBranch) {
                    const updatedBranch = data.branches.find(
                        (b: Branch) => b.id === selectedBranch.id
                    );
                    if (updatedBranch) {
                        setSelectedBranch(updatedBranch);
                    }
                }

                // Update prompts list
                setPrompts(prev =>
                    prev.map(p => p.id === data.id ? data : p)
                );
            }
        } catch (error) {
            console.error('Error refreshing prompt:', error);
        }
    };

    const handleRestore = (content: string, label: string) => {
        setRestoredContent({ content, label });
    };

    if (!isLoaded || loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return <LandingPage />;
    }


    // ... (logic)

    if (prompts.length === 0) {
        return (
            <div className="flex flex-col h-screen">
                <header className="border-b bg-card">
                    <div className="flex items-center justify-between px-6 py-4">
                        <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                            <GitBranch className="h-6 w-6 text-primary" />
                            <h1 className="text-xl font-semibold">Prompt Manager</h1>
                        </Link>
                        <div className="flex items-center gap-4">
                            <OrganizationSwitcher />
                            <UserButton afterSignOutUrl="/" />
                        </div>
                    </div>
                </header>
                <div className="flex items-center justify-center flex-1">
                    <div className="text-center max-w-md">
                        <GitBranch className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                        <h2 className="text-2xl font-semibold mb-2">No Prompts Yet</h2>
                        <p className="text-muted-foreground mb-6">
                            Get started by creating your first prompt in this workspace.
                        </p>
                        <Button onClick={() => setIsCreateDialogOpen(true)}>
                            <FolderPlus className="mr-2 h-4 w-4" />
                            Create First Prompt
                        </Button>
                    </div>
                </div>
                <CreatePromptDialog
                    open={isCreateDialogOpen}
                    onOpenChange={setIsCreateDialogOpen}
                    onSuccess={fetchPrompts}
                />
            </div>
        );
    }

    return (
        <div className="flex flex-col h-screen bg-background">
            {/* Header */}
            <header className="border-b bg-card">
                <div className="flex items-center justify-between px-6 py-4">
                    <div className="flex items-center gap-3">
                        <Link href="/" className="hover:opacity-80 transition-opacity">
                            <GitBranch className="h-6 w-6 text-primary" />
                        </Link>
                        <div>
                            <h1 className="text-xl font-semibold">Prompt Manager</h1>
                            <p className="text-sm text-muted-foreground">
                                {selectedPrompt?.name || 'No prompt selected'}
                            </p>
                        </div>
                    </div>


                    // ... (in Header)
                    <div className="flex items-center gap-4">
                        <ModeToggle />
                        <OrganizationSwitcher
                            appearance={{
                                elements: {
                                    rootBox: "flex items-center",
                                    organizationSwitcherTrigger: "flex items-center gap-2 px-3 py-1.5 rounded-md hover:bg-muted transition-colors border border-transparent hover:border-border"
                                }
                            }}
                        />
                        <UserButton afterSignOutUrl="/" />
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <div className="flex flex-1 overflow-hidden">
                {/* Left Sidebar - Branch List */}
                <div className="w-64 border-r bg-sidebar overflow-y-auto flex flex-col">
                    <div className="p-3 border-b flex items-center justify-between sticky top-0 bg-card z-10">
                        <span className="text-xs font-semibold text-muted-foreground">PROMPTS</span>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => setIsCreateDialogOpen(true)}
                            title="Create New Prompt"
                        >
                            <Plus className="h-4 w-4" />
                        </Button>
                    </div>
                    <div className="flex-1">
                        {/* Prompt Selector (Simple List for now) */}
                        <div className="px-2 py-2 space-y-1">
                            {prompts.map(prompt => (
                                <button
                                    key={prompt.id}
                                    onClick={() => setSelectedPrompt(prompt)}
                                    className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${selectedPrompt?.id === prompt.id
                                        ? 'bg-accent text-accent-foreground font-medium'
                                        : 'hover:bg-muted text-muted-foreground'
                                        }`}
                                >
                                    {prompt.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="border-t mt-auto">
                        {selectedPrompt && (
                            <BranchList
                                branches={selectedPrompt.branches}
                                liveBranchId={selectedPrompt.liveBranchId}
                                selectedBranchId={selectedBranch?.id || null}
                                onSelectBranch={(branch) => setSelectedBranch(branch)}
                                onBranchCreated={refreshPrompt}
                                promptId={selectedPrompt.id}
                            />
                        )}
                    </div>
                </div>

                {/* Center - Prompt Editor */}
                <div className="flex-1 flex flex-col overflow-hidden">
                    <div className="flex-1 overflow-y-auto">
                        {selectedBranch ? (
                            <PromptEditor
                                branch={selectedBranch}
                                isLive={selectedBranch.id === selectedPrompt?.liveBranchId}
                                onSave={refreshPrompt}
                                onDeploy={refreshPrompt}
                                onRestore={handleRestore}
                            />
                        ) : (
                            <div className="flex flex-1 items-center justify-center text-muted-foreground">
                                <p>Select a prompt and branch to start editing</p>
                            </div>
                        )}
                    </div>

                    {/* Bottom - Test Panel */}
                    <div className="border-t">
                        <div className="border-t">
                            {selectedBranch && selectedPrompt && (
                                <TestPanel
                                    branchId={selectedBranch.id}
                                    promptId={selectedPrompt.id}
                                    initialWebhookUrl={selectedPrompt.webhookUrl || ''}
                                    onWebhookSave={refreshPrompt}
                                />
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Sidebar - Version History */}
                <div className="w-80 border-l bg-card overflow-y-auto">
                    {selectedBranch && (
                        <VersionHistory
                            versions={selectedBranch.versions}
                            onRestore={handleRestore}
                        />
                    )}
                </div>
            </div>

            <CreatePromptDialog
                open={isCreateDialogOpen}
                onOpenChange={setIsCreateDialogOpen}
                onSuccess={fetchPrompts}
            />
        </div>
    );

}
