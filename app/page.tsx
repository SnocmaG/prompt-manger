'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { UserButton } from '@clerk/nextjs';
import { BranchList } from '@/components/branch-list';
import { PromptEditor } from '@/components/prompt-editor';
import { VersionHistory } from '@/components/version-history';
import { TestPanel } from '@/components/test-panel';
import { GitBranch } from 'lucide-react';

interface Prompt {
    id: string;
    name: string;
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

    useEffect(() => {
        if (isLoaded && user) {
            fetchPrompts();
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
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-center">
                    <p className="text-muted-foreground">Please sign in to continue</p>
                </div>
            </div>
        );
    }

    if (prompts.length === 0) {
        return (
            <div className="flex flex-col h-screen">
                <header className="border-b bg-card">
                    <div className="flex items-center justify-between px-6 py-4">
                        <div className="flex items-center gap-3">
                            <GitBranch className="h-6 w-6 text-primary" />
                            <h1 className="text-xl font-semibold">Prompt Manager</h1>
                        </div>
                        <UserButton afterSignOutUrl="/" />
                    </div>
                </header>
                <div className="flex items-center justify-center flex-1">
                    <div className="text-center max-w-md">
                        <GitBranch className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                        <h2 className="text-2xl font-semibold mb-2">No Prompts Yet</h2>
                        <p className="text-muted-foreground mb-6">
                            Get started by creating your first prompt. We've seeded a demo prompt for you.
                        </p>
                        <p className="text-sm text-muted-foreground">
                            Run: <code className="bg-muted px-2 py-1 rounded">npm run db:seed</code>
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-screen bg-background">
            {/* Header */}
            <header className="border-b bg-card">
                <div className="flex items-center justify-between px-6 py-4">
                    <div className="flex items-center gap-3">
                        <GitBranch className="h-6 w-6 text-primary" />
                        <div>
                            <h1 className="text-xl font-semibold">Prompt Manager</h1>
                            <p className="text-sm text-muted-foreground">
                                {selectedPrompt?.name || 'No prompt selected'}
                            </p>
                        </div>
                    </div>
                    <UserButton afterSignOutUrl="/" />
                </div>
            </header>

            {/* Main Content */}
            <div className="flex flex-1 overflow-hidden">
                {/* Left Sidebar - Branch List */}
                <div className="w-64 border-r bg-card overflow-y-auto">
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

                {/* Center - Prompt Editor */}
                <div className="flex-1 flex flex-col overflow-hidden">
                    <div className="flex-1 overflow-y-auto">
                        {selectedBranch && (
                            <PromptEditor
                                branch={selectedBranch}
                                isLive={selectedBranch.id === selectedPrompt?.liveBranchId}
                                onSave={refreshPrompt}
                                onDeploy={refreshPrompt}
                            />
                        )}
                    </div>

                    {/* Bottom - Test Panel */}
                    <div className="border-t">
                        {selectedBranch && (
                            <TestPanel branchId={selectedBranch.id} />
                        )}
                    </div>
                </div>

                {/* Right Sidebar - Version History */}
                <div className="w-80 border-l bg-card overflow-y-auto">
                    {selectedBranch && (
                        <VersionHistory
                            versions={selectedBranch.versions}
                            onRestore={refreshPrompt}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}
