import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function ApiDocsPage() {
    return (
        <div className="flex flex-col min-h-screen bg-background p-6">
            <main className="container max-w-4xl py-10 mx-auto">
                <div className="mb-8">
                    <Link href="/docs" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-2 mb-4">
                        <ArrowLeft className="h-4 w-4" />
                        Back to User Guide
                    </Link>
                    <h1 className="text-3xl font-bold tracking-tight mb-2">API Reference</h1>
                    <p className="text-lg text-muted-foreground">
                        Detailed documentation for Prompt Manager SDK and API endpoints.
                    </p>
                </div>

                <div className="space-y-6">
                    {/* GET /api/prompts */}
                    <details className="group border rounded-lg bg-card open:ring-1 open:ring-primary/20">
                        <summary className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50 transition-colors">
                            <div className="flex items-center gap-4">
                                <span className="px-2 py-1 text-xs font-bold bg-blue-500/10 text-blue-500 rounded uppercase">GET</span>
                                <span className="font-mono text-sm font-semibold">/api/prompts</span>
                            </div>
                            <span className="text-sm text-muted-foreground italic group-open:not-italic group-open:text-foreground">List all prompts</span>
                        </summary>
                        <div className="p-4 pt-0 border-t border-muted/50 mt-4">
                            <p className="text-sm text-muted-foreground mb-4">
                                Retrieves a list of all prompts associated with the current user/organization.
                            </p>

                            <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-2">Response</h4>
                            <pre className="bg-muted p-3 rounded-md text-xs font-mono overflow-x-auto">
                                {`[
  {
    "id": "cm...',
    "name": "Product Description",
    "updatedAt": "2023-10-...",
    "_count": { "branches": 2 }
  }
]`}
                            </pre>
                        </div>
                    </details>

                    {/* GET /api/v1/get_current_prompt */}
                    <details className="group border rounded-lg bg-card open:ring-1 open:ring-primary/20">
                        <summary className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50 transition-colors">
                            <div className="flex items-center gap-4">
                                <span className="px-2 py-1 text-xs font-bold bg-blue-500/10 text-blue-500 rounded uppercase">GET</span>
                                <span className="font-mono text-sm font-semibold">/api/v1/get_current_prompt</span>
                            </div>
                            <span className="text-sm text-muted-foreground italic group-open:not-italic group-open:text-foreground">Get Live Prompt</span>
                        </summary>
                        <div className="p-4 pt-0 border-t border-muted/50 mt-4">
                            <p className="text-sm text-muted-foreground mb-4">
                                Fetches the currently deployed (&quot;Live&quot;) version of a prompt. Useful for SDK integration.
                            </p>

                            <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-2">Query Parameters</h4>
                            <div className="grid grid-cols-[120px_1fr] gap-2 text-sm mb-4">
                                <code className="text-xs bg-muted px-1 py-0.5 rounded">promptId</code>
                                <span className="text-muted-foreground">The ID of the prompt to fetch.</span>
                            </div>

                            <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-2">Response</h4>
                            <pre className="bg-muted p-3 rounded-md text-xs font-mono overflow-x-auto">
                                {`{
  "promptId": "cm...",
  "name": "Marketing Email",
  "versionId": "...",
  "systemPrompt": "You are a helpful assistant...",
  "userPrompt": "Draft an email about...",
  "label": "v1.2",
  "createdAt": "..."
}`}
                            </pre>
                        </div>
                    </details>

                    {/* POST /api/ai/test */}
                    <details className="group border rounded-lg bg-card open:ring-1 open:ring-primary/20">
                        <summary className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50 transition-colors">
                            <div className="flex items-center gap-4">
                                <span className="px-2 py-1 text-xs font-bold bg-green-500/10 text-green-500 rounded uppercase">POST</span>
                                <span className="font-mono text-sm font-semibold">/api/ai/test</span>
                            </div>
                            <span className="text-sm text-muted-foreground italic group-open:not-italic group-open:text-foreground">Run AI Test</span>
                        </summary>
                        <div className="p-4 pt-0 border-t border-muted/50 mt-4">
                            <p className="text-sm text-muted-foreground mb-4">
                                Execute a prompt against an AI provider (OpenAI, Anthropic) or Mock.
                            </p>

                            <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-2">Body Parameters</h4>
                            <div className="grid grid-cols-[120px_1fr] gap-y-2 text-sm mb-4">
                                <code className="text-xs bg-muted px-1 py-0.5 rounded w-fit">provider</code>
                                <span className="text-muted-foreground">&quot;openai&quot; | &quot;anthropic&quot; | &quot;mock&quot;</span>

                                <code className="text-xs bg-muted px-1 py-0.5 rounded w-fit">model</code>
                                <span className="text-muted-foreground">
                                    Model identifier (e.g., <code>gpt-4o</code>, <code>gpt-5-preview</code>).
                                    <br />
                                    <span className="text-xs text-yellow-500">Note: Newer models (GPT-5, o1) automatically use `max_completion_tokens`.</span>
                                </span>

                                <code className="text-xs bg-muted px-1 py-0.5 rounded w-fit">testInput</code>
                                <span className="text-muted-foreground">User input string to append to the system prompt.</span>

                                <code className="text-xs bg-muted px-1 py-0.5 rounded w-fit">promptContent</code>
                                <span className="text-muted-foreground">(Optional) Override the prompt content (e.g., from editor state).</span>
                            </div>

                            <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-2">Response</h4>
                            <pre className="bg-muted p-3 rounded-md text-xs font-mono overflow-x-auto">
                                {`{
  "success": true,
  "output": "Here is the AI response...",
  "provider": "openai"
}`}
                            </pre>
                        </div>
                    </details>

                    {/* POST /api/versions/create */}
                    <details className="group border rounded-lg bg-card open:ring-1 open:ring-primary/20">
                        <summary className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50 transition-colors">
                            <div className="flex items-center gap-4">
                                <span className="px-2 py-1 text-xs font-bold bg-green-500/10 text-green-500 rounded uppercase">POST</span>
                                <span className="font-mono text-sm font-semibold">/api/versions/create</span>
                            </div>
                            <span className="text-sm text-muted-foreground italic group-open:not-italic group-open:text-foreground">Save Version</span>
                        </summary>
                        <div className="p-4 pt-0 border-t border-muted/50 mt-4">
                            <p className="text-sm text-muted-foreground mb-4">
                                Save a new immutable version of a prompt on a specific branch.
                            </p>

                            <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-2">Body Parameters</h4>
                            <div className="grid grid-cols-[120px_1fr] gap-y-2 text-sm mb-4">
                                <code className="text-xs bg-muted px-1 py-0.5 rounded w-fit">promptId</code>
                                <span className="text-muted-foreground">ID of the prompt to save version for.</span>

                                <code className="text-xs bg-muted px-1 py-0.5 rounded w-fit">systemPrompt</code>
                                <span className="text-muted-foreground">The system instructions.</span>

                                <code className="text-xs bg-muted px-1 py-0.5 rounded w-fit">userPrompt</code>
                                <span className="text-muted-foreground">The user prompt (test input).</span>

                                <code className="text-xs bg-muted px-1 py-0.5 rounded w-fit">label</code>
                                <span className="text-muted-foreground">Human-readable version label.</span>
                            </div>
                        </div>
                    </details>

                </div>
            </main>
        </div>
    );
}
