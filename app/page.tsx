'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { Plus, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CreatePromptDialog } from '@/components/create-prompt-dialog';
import { LandingPage } from '@/components/landing-page';
import { DashboardHeader } from '@/components/dashboard-header';
import { PromptCard } from '@/components/prompt-card';

interface Prompt {
    id: string;
    name: string;
    webhookUrl: string | null;
    liveBranchId: string | null;
    updatedAt: string;
    _count: {
        branches: number;
    };
    branches: any[]; // Kept for now if needed, but we rely on _count mostly
}

export default function Dashboard() {
    const { user, isLoaded } = useUser();
    const [prompts, setPrompts] = useState<Prompt[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

    useEffect(() => {
        if (isLoaded && user) {
            fetchPrompts();
        } else if (isLoaded && !user) {
            setLoading(false);
        }
    }, [isLoaded, user]);

    const fetchPrompts = async () => {
        try {
            const response = await fetch('/api/prompts');
            if (response.ok) {
                const data = await response.json();
                // We might need to adjust this depending on what the API actually returns for counts
                // If API doesn't return counts, we'll calculate them.
                const processed = data.map((p: any) => ({
                    ...p,
                    updatedAt: p.updatedAt || new Date().toISOString(), // Fallback if not in API yet
                    _count: { branches: p.branches?.length || 0 }
                }));
                setPrompts(processed);
            }
        } catch (error) {
            console.error('Error fetching prompts:', error);
        } finally {
            setLoading(false);
        }
    };

    if (!isLoaded) {
        return null; // Or a global loading spinner
    }

    if (!user) {
        return <LandingPage />;
    }

    return (
        <div className="flex flex-col min-h-screen bg-background">
            <div className="flex flex-col min-h-screen bg-background">

                <main className="flex-1 container max-w-screen-2xl py-8 px-4">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                            <p className="text-muted-foreground mt-1">
                                Manage your prompt library and deployments.
                            </p>
                        </div>
                        <Button onClick={() => setIsCreateDialogOpen(true)}>
                            <Plus className="mr-2 h-4 w-4" />
                            New Prompt
                        </Button>
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-20">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : prompts.length === 0 ? (
                        <div className="text-center py-20 border rounded-xl bg-card/50 border-dashed">
                            <h3 className="text-lg font-semibold">No prompts yet</h3>
                            <p className="text-muted-foreground mb-4">Create your first prompt to get started.</p>
                            <Button variant="outline" onClick={() => setIsCreateDialogOpen(true)}>
                                Create Prompt
                            </Button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {prompts.map((prompt) => (
                                <PromptCard
                                    key={prompt.id}
                                    id={prompt.id}
                                    name={prompt.name}
                                    updatedAt={prompt.updatedAt}
                                    liveBranchId={prompt.liveBranchId}
                                    branchCount={prompt._count.branches}
                                />
                            ))}
                        </div>
                    )}
                </main>

                <CreatePromptDialog
                    open={isCreateDialogOpen}
                    onOpenChange={setIsCreateDialogOpen}
                    onSuccess={fetchPrompts}
                />
            </div>
            );
}
