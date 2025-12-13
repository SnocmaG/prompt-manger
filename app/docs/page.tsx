import { DashboardHeader } from "@/components/dashboard-header"

export default function DocsPage() {
    return (
        <div className="flex flex-col min-h-screen bg-background">
            <div className="flex flex-col min-h-screen bg-background p-6">

                <main className="container max-w-3xl py-10">
                    <article className="prose prose-stone dark:prose-invert max-w-none">
                        <h1>Documentation</h1>
                        <p className="lead">
                            Welcome to Prompt Manager. This tool helps you treat your AI prompts like code—with version control, drafting, and safe deployments.
                        </p>

                        <hr />

                        <h2>Core Concepts</h2>

                        <h3>📄 Prompts</h3>
                        <p>
                            A Prompt is a container for a specific AI task (e.g., "Welcome Email Generator").
                            Instead of overwriting your prompts in a text file, you store them here to track changes over time.
                        </p>

                        <h3>🌿 Branches</h3>
                        <p>
                            Just like Git. Every prompt has a <strong>Main</strong> branch (production) and you can create feature branches for testing.
                        </p>
                        <ul>
                            <li><strong>Main</strong>: The "Live" version. Don't edit this directly if you want to be safe.</li>
                            <li><strong>Feature Branch</strong>: Create a branch (e.g., "fix-tone") to experiment safely.</li>
                        </ul>

                        <h3>⏱️ Versions</h3>
                        <p>
                            Every time you click <strong>Save Version</strong>, we take a snapshot. You can never lose work.
                            If you break something, just go to the "History" tab and restore an old version.
                        </p>

                        <hr />

                        <h2>Workflow Guide</h2>

                        <h3>1. Create a Prompt</h3>
                        <p>Click the "New Prompt" button on the <strong>Dashboard</strong>. Give it a clear name.</p>

                        <h3>2. The Workshop</h3>
                        <p>
                            Clicking a prompt card opens the <strong>Workshop</strong>. This is your focused IDE for editing.
                            Write your prompt in the main editor. You can use variables like <code>{'{customer_name}'}</code>.
                            When you're ready, create a new branch or save a version.
                        </p>

                        <h3>3. Test It</h3>
                        <p>
                            Use the <strong>Test Panel</strong> at the bottom of the Workshop.
                            <ul>
                                <li><strong>Mock</strong>: Just echoes your input back.</li>
                                <li><strong>AI Providers</strong>: Connects to OpenAI/Anthropic (via your API keys).</li>
                                <li><strong>Webhook</strong>: Sends the payload to your automation tool (n8n/Zapier).</li>
                            </ul>
                        </p>

                        <h3>4. Deploy to Live</h3>
                        <p>
                            When a version is perfect, click <strong>Deploy</strong>.
                            This sets that specific version as the "Live" version that your API will return.
                        </p>

                    </article>
                </main>
            </div>
            )
}
