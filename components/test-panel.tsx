'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Play, Loader2 } from 'lucide-react';

interface TestPanelProps {
    branchId: string;
}

export function TestPanel({ branchId }: TestPanelProps) {
    const [testInput, setTestInput] = useState('');
    const [testOutput, setTestOutput] = useState('');
    const [testing, setTesting] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);

    const handleTest = async () => {
        setTesting(true);
        setIsExpanded(true);
        try {
            const response = await fetch('/api/branches/test', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    branchId,
                    testInput,
                }),
            });

            if (response.ok) {
                const data = await response.json();
                setTestOutput(data.output);
            } else {
                setTestOutput('Error: Failed to test prompt');
            }
        } catch (error) {
            console.error('Error testing prompt:', error);
            setTestOutput('Error: Failed to test prompt');
        } finally {
            setTesting(false);
        }
    };

    return (
        <div className="bg-card">
            <div className="border-b px-4 py-2 flex items-center justify-between">
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors"
                >
                    <Play className="h-4 w-4" />
                    Test Prompt
                </button>
            </div>

            {isExpanded && (
                <div className="p-4 space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-medium mb-1.5 block text-muted-foreground">
                                Test Input (Optional)
                            </label>
                            <Textarea
                                value={testInput}
                                onChange={(e) => setTestInput(e.target.value)}
                                placeholder="Enter test input data..."
                                className="min-h-[100px] text-sm font-mono"
                            />
                        </div>

                        <div>
                            <label className="text-xs font-medium mb-1.5 block text-muted-foreground">
                                Output
                            </label>
                            <div className="border rounded-md p-3 min-h-[100px] bg-muted/30 text-sm font-mono whitespace-pre-wrap">
                                {testing ? (
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Testing...
                                    </div>
                                ) : testOutput ? (
                                    testOutput
                                ) : (
                                    <span className="text-muted-foreground">
                                        Click "Run Test" to see output
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    <Button onClick={handleTest} disabled={testing} size="sm">
                        <Play className="h-4 w-4 mr-2" />
                        {testing ? 'Testing...' : 'Run Test'}
                    </Button>
                </div>
            )}
        </div>
    );
}
