
import { getUserInfo } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileJson } from 'lucide-react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';

import { CreateEvalDialog } from '@/components/evaluations/create-eval-dialog';

export const dynamic = 'force-dynamic';

interface EvaluationWithCounts {
    id: string;
    clientId: string;
    name: string;
    updatedAt: Date;
    _count: {
        items: number;
        runs: number;
    };
}

async function getEvaluations(clientId: string): Promise<EvaluationWithCounts[]> {
    return await prisma.evaluation.findMany({
        where: { clientId },
        orderBy: { updatedAt: 'desc' },
        include: {
            _count: {
                select: { items: true, runs: true }
            }
        }
    });
}

export default async function EvaluationsPage() {
    const { clientId } = await getUserInfo();
    if (!clientId) return <div>Unauthorized</div>;

    const evaluations = await getEvaluations(clientId);

    return (
        <div className="flex flex-col h-full overflow-y-auto bg-[#FAFAFA] dark:bg-[#0A0A0A] p-8">
            <div className="max-w-6xl mx-auto w-full space-y-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-foreground">Evaluations</h1>
                        <p className="text-muted-foreground mt-2">
                            Create datasets and run batch tests against your prompts.
                        </p>
                    </div>
                    <CreateEvalDialog />
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {evaluations.map((evalSet) => (
                        <Link key={evalSet.id} href={`/evaluations/${evalSet.id}`}>
                            <Card className="hover:border-primary/50 transition-colors cursor-pointer group">
                                <CardHeader className="pb-3">
                                    <div className="flex items-start justify-between">
                                        <CardTitle className="text-base font-semibold group-hover:text-primary transition-colors">
                                            {evalSet.name}
                                        </CardTitle>
                                        <FileJson className="h-4 w-4 text-muted-foreground" />
                                    </div>
                                    <CardDescription>
                                        Updated {formatDistanceToNow(evalSet.updatedAt, { addSuffix: true })}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                        <div className="flex items-center gap-1">
                                            <span className="font-medium text-foreground">{evalSet._count.items}</span> items
                                        </div>
                                        <div className="h-1 w-1 rounded-full bg-border" />
                                        <div className="flex items-center gap-1">
                                            <span className="font-medium text-foreground">{evalSet._count.runs}</span> runs
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}

                    {evaluations.length === 0 && (
                        <div className="col-span-full text-center py-12 border rounded-xl border-dashed bg-muted/20">
                            <h3 className="text-lg font-semibold">No evaluations yet</h3>
                            <p className="text-muted-foreground mb-4">Create a dataset to start testing your prompts.</p>
                            <Button variant="outline">Create Dataset</Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
