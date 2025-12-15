
import { getUserInfo } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import { AddTestCaseDialog } from '@/components/evaluations/add-test-case-dialog';
import { RunEvalDialog } from '@/components/evaluations/run-eval-dialog';
import { formatDistanceToNow } from 'date-fns';

export const dynamic = 'force-dynamic';

interface EvaluationItem {
    id: string;
    input: string;
    expectedOutput: string | null;
}

interface EvaluationRun {
    id: string;
    createdAt: Date;
    status: string;
    score: number | null;
    promptVersion: {
        label: string | null;
        prompt: {
            name: string;
        };
    };
}

interface EvaluationDetail {
    id: string;
    name: string;
    clientId: string;
    items: EvaluationItem[];
    runs: EvaluationRun[];
}

async function getEvaluation(id: string, clientId: string): Promise<EvaluationDetail | null> {
    const evaluation = await prisma.evaluation.findUnique({
        where: { id },
        include: {
            items: {
                orderBy: { createdAt: 'desc' }
            },
            runs: {
                orderBy: { createdAt: 'desc' },
                take: 5,
                include: {
                    promptVersion: {
                        include: {
                            prompt: true
                        }
                    }
                }
            }
        }
    });

    // Security check
    if (evaluation && evaluation.clientId !== clientId) return null;
    return evaluation as unknown as EvaluationDetail;
}

export default async function EvaluationDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { clientId } = await getUserInfo();
    const { id } = await params;

    if (!clientId) return <div>Unauthorized</div>;

    const evaluation = await getEvaluation(id, clientId);
    if (!evaluation) return <div>Not Found</div>;

    return (
        <div className="flex flex-col h-full overflow-y-auto bg-[#FAFAFA] dark:bg-[#0A0A0A] p-8">
            <div className="max-w-6xl mx-auto w-full space-y-8">

                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-foreground">{evaluation.name}</h1>
                        <p className="text-muted-foreground mt-2">
                            Manage test cases and view run history.
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        {/* Run Button (Placeholder for now) */}
                        <RunEvalDialog evaluationId={evaluation.id} />
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    {/* Left: Test Cases */}
                    <Card className="md:col-span-2 lg:col-span-1">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-lg font-semibold">Test Cases ({evaluation.items.length})</CardTitle>
                            <AddTestCaseDialog evaluationId={evaluation.id} />
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="rounded-md border-t">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Variables (JSON)</TableHead>
                                            <TableHead>Expected Output</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {evaluation.items.map((item) => (
                                            <TableRow key={item.id}>
                                                <TableCell className="font-mono text-xs max-w-[200px] truncate" title={item.input}>
                                                    {item.input}
                                                </TableCell>
                                                <TableCell className="text-xs max-w-[200px] truncate" title={item.expectedOutput || ''}>
                                                    {item.expectedOutput || '-'}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                        {evaluation.items.length === 0 && (
                                            <TableRow>
                                                <TableCell colSpan={2} className="h-24 text-center text-muted-foreground">
                                                    No test cases yet.
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Right: Recent Runs */}
                    <Card className="md:col-span-2 lg:col-span-1">
                        <CardHeader>
                            <CardTitle className="text-lg font-semibold">Recent Runs</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {evaluation.runs.map(run => (
                                    <div key={run.id} className="flex items-center justify-between p-4 border rounded-lg bg-muted/20">
                                        <div>
                                            <div className="font-medium text-sm">
                                                {run.promptVersion.prompt.name} / {run.promptVersion.label}
                                            </div>
                                            <div className="text-xs text-muted-foreground mt-1">
                                                {formatDistanceToNow(run.createdAt, { addSuffix: true })}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className={`text-sm font-bold ${run.status === 'completed' ? 'text-green-500' :
                                                run.status === 'running' ? 'text-blue-500' : 'text-red-500'
                                                }`}>
                                                {run.score !== null ? `${Math.round(run.score * 100)}%` : run.status}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {evaluation.runs.length === 0 && (
                                    <div className="text-center py-8 text-muted-foreground text-sm">
                                        No runs yet.
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
