
import { getUserInfo } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDistanceToNow } from 'date-fns';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import { Activity, DollarSign, Zap, BarChart3 } from 'lucide-react';

export const dynamic = 'force-dynamic';

interface Trace {
    id: string;
    createdAt: Date;
    model: string;
    durationMs: number | null;
    tokensIn: number | null;
    tokensOut: number | null;
    cost: number | null;
    prompt: {
        name: string;
    };
}

async function getAnalytics(clientId: string) {
    // 1. Get totals
    const aggregations = await prisma.promptExecution.aggregate({
        where: {
            prompt: { clientId } // Scoped to workspace
        },
        _sum: {
            cost: true,
            tokensIn: true,
            tokensOut: true,
            durationMs: true
        },
        _count: {
            id: true
        }
    });

    // 2. Get recent traces
    const traces = await prisma.promptExecution.findMany({
        where: {
            prompt: { clientId }
        },
        orderBy: { createdAt: 'desc' },
        take: 50,
        include: {
            prompt: {
                select: { name: true }
            }
        }
    });

    return { aggregations, traces };
}

export default async function AnalyticsPage() {
    const { clientId } = await getUserInfo();

    // Safety check just in case
    if (!clientId) return <div className="p-8">Unauthorized</div>;

    const { aggregations, traces } = await getAnalytics(clientId);

    // Helpers
    const totalCost = aggregations._sum.cost || 0;
    const totalTokens = (aggregations._sum.tokensIn || 0) + (aggregations._sum.tokensOut || 0);
    const totalCalls = aggregations._count.id || 0;
    const avgLatency = totalCalls > 0 ? Math.round((aggregations._sum.durationMs || 0) / totalCalls) : 0;

    return (
        <div className="flex flex-col h-full overflow-y-auto bg-[#FAFAFA] dark:bg-[#0A0A0A] p-8">
            <div className="max-w-6xl mx-auto w-full space-y-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Analytics & Observability</h1>
                    <p className="text-muted-foreground mt-2">
                        Monitor cost, latency, and volume across all your deployed prompts.
                    </p>
                </div>

                {/* KPI Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <StatCard
                        title="Total Cost"
                        value={`$${totalCost.toFixed(4)}`}
                        icon={<DollarSign className="h-4 w-4 text-green-500" />}
                    />
                    <StatCard
                        title="Total Tokens"
                        value={totalTokens.toLocaleString()}
                        icon={<Zap className="h-4 w-4 text-yellow-500" />}
                    />
                    <StatCard
                        title="Total API Calls"
                        value={totalCalls.toLocaleString()}
                        icon={<Activity className="h-4 w-4 text-blue-500" />}
                    />
                    <StatCard
                        title="Avg. Latency"
                        value={`${avgLatency}ms`}
                        icon={<BarChart3 className="h-4 w-4 text-purple-500" />}
                    />
                </div>

                {/* Traces Table */}
                <div className="rounded-xl border bg-card shadow-sm">
                    <div className="p-6 border-b">
                        <h3 className="text-lg font-semibold">Recent Traces</h3>
                    </div>
                    <div className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Time</TableHead>
                                    <TableHead>Prompt Name</TableHead>
                                    <TableHead>Model</TableHead>
                                    <TableHead>Latency</TableHead>
                                    <TableHead>Tokens</TableHead>
                                    <TableHead className="text-right">Cost</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {traces.map((trace: Trace) => (
                                    <TableRow key={trace.id}>
                                        <TableCell className="text-muted-foreground text-xs whitespace-nowrap">
                                            {formatDistanceToNow(trace.createdAt, { addSuffix: true })}
                                        </TableCell>
                                        <TableCell className="font-medium">
                                            {trace.prompt.name}
                                        </TableCell>
                                        <TableCell>
                                            <span className="px-2 py-1 rounded-full bg-muted text-xs font-mono">
                                                {trace.model}
                                            </span>
                                        </TableCell>
                                        <TableCell>{trace.durationMs ? `${trace.durationMs}ms` : '-'}</TableCell>
                                        <TableCell>
                                            {trace.tokensIn && trace.tokensOut ?
                                                `${(trace.tokensIn + trace.tokensOut).toLocaleString()}` : '-'
                                            }
                                        </TableCell>
                                        <TableCell className="text-right font-mono text-xs">
                                            {trace.cost ? `$${trace.cost.toFixed(5)}` : '-'}
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {traces.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-24 text-center">
                                            No execution data found.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatCard({ title, value, icon }: { title: string, value: string, icon: React.ReactNode }) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                    {title}
                </CardTitle>
                {icon}
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
            </CardContent>
        </Card>
    );
}
