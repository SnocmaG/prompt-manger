import Link from "next/link";
import { ArrowRight, Book, GitBranch, Terminal, Zap } from "lucide-react";

export default function DocsPage() {
    return (
        <div className="flex flex-col min-h-screen bg-background p-6">
            <main className="container max-w-4xl py-10 mx-auto">

                <div className="text-center mb-16">
                    <h1 className="text-4xl font-bold tracking-tight mb-4">User Guide</h1>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        Master the Prompt Manager workflow: design, test, and deploy AI prompts with confidence.
                    </p>
                    <div className="mt-8 flex justify-center gap-4">
                        <Link href="/docs/api" className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2">
                            <Terminal className="mr-2 h-4 w-4" />
                            API Reference
                        </Link>
                    </div>
                </div>

                <div className="grid gap-12 relative">
                    {/* Vertical Line */}
                    <div className="absolute left-[27px] top-4 bottom-4 w-0.5 bg-border hidden md:block" />

                    {/* Step 1 */}
                    <div className="relative flex gap-8 items-start">
                        <div className="flex-none z-10 bg-background">
                            <div className="flex items-center justify-center w-14 h-14 rounded-full border-2 border-primary bg-card text-primary font-bold text-xl shadow-sm">
                                1
                            </div>
                        </div>
                        <div className="flex-1 pt-2 space-y-4">
                            <h3 className="text-2xl font-semibold flex items-center gap-2">
                                Create & Draft
                                <Book className="h-5 w-5 text-muted-foreground" />
                            </h3>
                            <p className="text-muted-foreground leading-relaxed">
                                Start by creating a <strong>Prompt</strong> container. Think of this as a repository for a specific task (e.g., &quot;Customer Support Bot&quot;).
                                Inside the Workshop, write your system instructions. Use variables like <code className="bg-muted px-1 rounded text-xs">{`{variable}`}</code> to make them dynamic.
                            </p>
                        </div>
                    </div>

                    {/* Step 2 */}
                    <div className="relative flex gap-8 items-start">
                        <div className="flex-none z-10 bg-background">
                            <div className="flex items-center justify-center w-14 h-14 rounded-full border-2 border-muted bg-card text-muted-foreground font-bold text-xl shadow-sm">
                                2
                            </div>
                        </div>
                        <div className="flex-1 pt-2 space-y-4">
                            <h3 className="text-2xl font-semibold flex items-center gap-2">
                                Versioning
                                <GitBranch className="h-5 w-5 text-muted-foreground" />
                            </h3>
                            <p className="text-muted-foreground leading-relaxed">
                                Save <strong>Versions</strong> frequently as you iterate on your instructions and user prompts.
                            </p>
                            <p className="text-muted-foreground">
                                Every save creates an immutable snapshot. You can easily roll back to previous versions using the history panel.
                            </p>
                        </div>
                    </div>

                    {/* Step 3 */}
                    <div className="relative flex gap-8 items-start">
                        <div className="flex-none z-10 bg-background">
                            <div className="flex items-center justify-center w-14 h-14 rounded-full border-2 border-muted bg-card text-muted-foreground font-bold text-xl shadow-sm">
                                3
                            </div>
                        </div>
                        <div className="flex-1 pt-2 space-y-4">
                            <h3 className="text-2xl font-semibold flex items-center gap-2">
                                Test & Iterate
                                <Zap className="h-5 w-5 text-muted-foreground" />
                            </h3>
                            <p className="text-muted-foreground leading-relaxed">
                                Use the <strong>Test Sandbox</strong> (right panel) to verify your prompt.
                                Select an AI model (including GPT-5 Preview) and run inputs against your current draft.
                            </p>
                            <div className="bg-muted/50 p-4 rounded-lg text-sm border">
                                <strong>Tip:</strong> If you see &quot;Unsupported parameter&quot; errors with new models, ensure you are using the latest version of the app which handles <code>max_completion_tokens</code> automatically.
                            </div>
                        </div>
                    </div>

                    {/* Step 4 */}
                    <div className="relative flex gap-8 items-start">
                        <div className="flex-none z-10 bg-background">
                            <div className="flex items-center justify-center w-14 h-14 rounded-full border-2 border-green-500/20 bg-green-500/10 text-green-600 font-bold text-xl shadow-sm">
                                4
                            </div>
                        </div>
                        <div className="flex-1 pt-2 space-y-4">
                            <h3 className="text-2xl font-semibold flex items-center gap-2">
                                Deploy
                                <ArrowRight className="h-5 w-5 text-muted-foreground" />
                            </h3>
                            <p className="text-muted-foreground leading-relaxed">
                                Ready to go live? Click <strong>Deploy</strong> on a specific version.
                                This updates the <code>liveVersionId</code> pointer.
                            </p>
                            <p className="text-muted-foreground">
                                Your application can then fetch this prompt using the API without needing code changes.
                            </p>
                            <Link href="/docs/api" className="inline-flex items-center text-primary hover:underline text-sm font-medium">
                                View Integration API &rarr;
                            </Link>
                        </div>
                    </div>

                </div>
            </main>
        </div>
    )
}
