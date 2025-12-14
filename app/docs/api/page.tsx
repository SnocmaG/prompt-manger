import Link from "next/link";
import { ArrowLeft, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";
import { getUserInfo } from "@/lib/auth";

export default async function ApiDocsPage() {
    const { isAdmin } = await getUserInfo();

    return (
        <div className="flex flex-col h-full overflow-y-auto bg-background p-6">
            <main className="container max-w-4xl py-10 mx-auto pb-24">
                <div className="mb-8">
                    <Link href="/docs" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-2 mb-4 transition-colors">
                        <ArrowLeft className="h-4 w-4" />
                        Back to User Guide
                    </Link>
                    <h1 className="text-4xl font-extrabold tracking-tight mb-4">API Reference</h1>
                    <p className="text-lg text-muted-foreground leading-relaxed">
                        Welcome to the Prompt Manager API. This documentation is designed to be <strong>extremely easy to understand</strong>.
                        We&apos;ll show you exactly how to fetch your prompts, run tests, and manage versions using code.
                    </p>
                </div>

                <div className="space-y-8">
                    {/* SECTION: AUTHENTICATION */}
                    <SectionTitle title="Authentication" description="How to authenticate your requests." />

                    <div className="border rounded-xl bg-card overflow-hidden shadow-sm p-6 space-y-4">
                        <p className="text-muted-foreground">
                            Authenticate your requests using the <code>x-api-key</code> header.
                            You can generate an API Key in <Link href="/settings/keys" className="text-primary hover:underline">Settings &gt; API Keys</Link>.
                        </p>
                        <div className="bg-muted/50 p-4 rounded-lg border border-border/50">
                            <h4 className="text-xs font-bold uppercase text-muted-foreground mb-2">Example Header</h4>
                            <code className="text-sm font-mono block mb-4">x-api-key: sk_live_12345...</code>

                            <h4 className="text-xs font-bold uppercase text-muted-foreground mb-2">Try it in your terminal</h4>
                            <pre className="text-xs font-mono bg-black/5 dark:bg-black/30 p-2 rounded border border-border">
                                {`curl -H "x-api-key: sk_live_..." \\
     https://prompt-manger.onrender.com/api/prompts`}
                            </pre>
                        </div>
                    </div>

                    {/* ADMIN SECTION (CONDITIONAL) */}
                    {isAdmin && (
                        <div className="rounded-xl border border-red-200 bg-red-50/50 dark:bg-red-900/10 p-6 space-y-4">
                            <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                                <ShieldAlert className="h-5 w-5" />
                                <h3 className="text-lg font-bold">Admin Capabilities</h3>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                As an Admin (<strong>snircomag@gmail.com</strong> or <strong>snir@moonshot.com</strong>), you have special access privileges.
                            </p>
                            <div className="space-y-2">
                                <h4 className="font-semibold text-sm">Global Data Access</h4>
                                <p className="text-sm text-muted-foreground">
                                    Your <code>GET /api/prompts</code> requests will return <strong>ALL</strong> prompts from ALL workspaces/users,
                                    ignoring the usual <code>clientId</code> filter.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* SECTION: FETCHING PROMPTS */}
                    <SectionTitle title="Fetching Prompts" description="How to get your prompts into your code." />

                    {/* GET /api/v1/get_current_prompt */}
                    <EndpointBlock
                        method="GET"
                        path="/api/v1/get_current_prompt"
                        title="Get Live Prompt (Best for Integration)"
                        description="This is the main endpoint you will use in your app. It fetches the 'Live' version of a prompt. If you update the prompt in the dashboard, this endpoint will automatically return the new version without any code changes."
                    >
                        <ParamSection title="Query Parameters (URL)">
                            <ParamRow name="promptId" type="string" required description="The unique ID of the prompt you want to fetch. You can copy this from the URL of the prompt in the dashboard." />
                        </ParamSection>

                        <ExampleSection
                            title="Example Request (JavaScript/Fetch)"
                            code={`const promptId = "cm4..."; // Your Prompt ID\n\nconst response = await fetch(\`/api/v1/get_current_prompt?promptId=\${promptId}\`);\nconst data = await response.json();\n\nconsole.log(data.systemPrompt); // "You are a helpful assistant..."`}
                        />

                        <ResponseSection
                            code={`{
  "promptId": "cm47...",
  "name": "Customer Support Bot",
  "versionId": "cm47...v1",
  "systemPrompt": "You are a helpful customer support agent...",
  "userPrompt": "",
  "label": "v1.0 - Initial Release",
  "createdAt": "2023-12-14T00:00:00.000Z"
}`}
                        />
                    </EndpointBlock>


                    {/* SECTION: MANAGEMENT */}
                    <SectionTitle title="Management API" description="Advanced endpoints for managing prompts and versions programmatically." />

                    {/* GET /api/prompts */}
                    <EndpointBlock
                        method="GET"
                        path="/api/prompts"
                        title="List All Prompts"
                        description="Get a list of all prompt containers in your workspace."
                    >
                        <ResponseSection
                            code={`[
  {
    "id": "cm47...",
    "name": "Email Generator",
    "updatedAt": "2023-12-14...",
    "_count": { "versions": 5 }
  },
  {
    "id": "cm48...",
    "name": "SQL Helper",
    "updatedAt": "2023-12-13...",
    "_count": { "versions": 12 }
  }
]`}
                        />
                    </EndpointBlock>

                    {/* GET /api/prompts/[id]/live */}
                    <EndpointBlock
                        method="GET"
                        path="/api/prompts/[id]/live"
                        title="Check Live Version Status"
                        description="Check which version is currently live for a specific prompt ID."
                    >
                        <ParamSection title="URL Parameters">
                            <ParamRow name="id" type="string" required description="The unique ID of the prompt container." />
                        </ParamSection>

                        <ResponseSection
                            code={`{
  "id": "cm47...",
  "name": "Email Generator",
  "version": {
    "id": "cm47...v3",
    "label": "v2.0 - Production",
    "systemPrompt": "You are an expert email copywriter...",
    "userPrompt": "Write a welcome email for...",
    "createdAt": "2023-12-14..."
  }
}`}
                        />
                    </EndpointBlock>

                    {/* POST /api/versions/create */}
                    <EndpointBlock
                        method="POST"
                        path="/api/versions/create"
                        title="Create New Version"
                        description="Save a new snapshot of a prompt. Useful if you are building your own editor interface."
                    >
                        <ParamSection title="Body Parameters (JSON)">
                            <ParamRow name="promptId" type="string" required description="The ID of the prompt container." />
                            <ParamRow name="systemPrompt" type="string" required description="The main instructions for the AI." />
                            <ParamRow name="userPrompt" type="string" optional description="Accessory user input (often used for testing)." />
                            <ParamRow name="label" type="string" optional description="A human-readable name for this version (e.g. 'v1.5')." />
                        </ParamSection>

                        <ExampleSection
                            title="Example Request"
                            code={`await fetch('/api/versions/create', {
  method: 'POST',
  body: JSON.stringify({
    promptId: "cm47...",
    systemPrompt: "You are a pirate...",
    label: "Pirate Version"
  })
});`}
                        />
                    </EndpointBlock>

                    {/* PATCH /api/prompts/[id] */}
                    <EndpointBlock
                        method="PATCH"
                        path="/api/prompts/[id]"
                        title="Deploy Version"
                        description="Set a specific version as 'Live'. This is how you deploy changes programmatically."
                    >
                        <ParamSection title="URL Parameters">
                            <ParamRow name="id" type="string" required description="The ID of the prompt container." />
                        </ParamSection>

                        <ParamSection title="Body Parameters (JSON)">
                            <ParamRow name="liveVersionId" type="string" required description="The ID of the version you want to trigger live." />
                        </ParamSection>

                        <ExampleSection
                            title="Example Deployment"
                            code={`await fetch('/api/prompts/cm47...', {
  method: 'PATCH',
  body: JSON.stringify({
    liveVersionId: "cm49...new-version-id"
  })
});`}
                        />
                    </EndpointBlock>

                </div>
            </main>
        </div>
    );
}

// --- Helper Components ---

function SectionTitle({ title, description }: { title: string, description: string }) {
    return (
        <div className="pt-8 pb-4 border-b border-border/40">
            <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
            <p className="text-muted-foreground mt-1">{description}</p>
        </div>
    );
}

function EndpointBlock({ method, path, title, description, children }: { method: string, path: string, title: string, description: string, children?: React.ReactNode }) {
    const colorClass =
        method === "GET" ? "bg-blue-500/10 text-blue-500 border-blue-500/20" :
            method === "POST" ? "bg-green-500/10 text-green-500 border-green-500/20" :
                method === "PATCH" ? "bg-orange-500/10 text-orange-500 border-orange-500/20" :
                    "bg-gray-500/10 text-gray-500";

    return (
        <div className="border rounded-xl bg-card overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            <div className="p-6 border-b bg-muted/30">
                <div className="flex flex-wrap items-center gap-3 mb-3">
                    <span className={cn("px-3 py-1 text-xs font-bold rounded-full border", colorClass)}>
                        {method}
                    </span>
                    <span className="font-mono text-sm font-semibold selection:bg-primary/20">{path}</span>
                </div>
                <h3 className="text-xl font-bold mb-2">{title}</h3>
                <p className="text-muted-foreground">{description}</p>
            </div>
            <div className="p-6 space-y-6">
                {children}
            </div>
        </div>
    );
}

function ParamSection({ title, children }: { title: string, children: React.ReactNode }) {
    return (
        <div>
            <h4 className="text-sm font-semibold uppercase text-muted-foreground tracking-wider mb-3">{title}</h4>
            <div className="border rounded-lg divide-y bg-background">
                {children}
            </div>
        </div>
    );
}

function ParamRow({ name, type, required = false, optional = false, description }: { name: string, type: string, required?: boolean, optional?: boolean, description: string }) {
    return (
        <div className="p-3 flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-4 text-sm">
            <div className="min-w-[140px] pt-0.5">
                <code className="text-xs font-bold bg-primary/10 text-primary px-1.5 py-0.5 rounded">{name}</code>
            </div>
            <div className="min-w-[80px] pt-0.5 text-xs text-muted-foreground font-mono">
                {type}
            </div>
            <div className="min-w-[80px] pt-0.5">
                {required && <span className="text-[10px] font-bold text-red-500 uppercase border border-red-500/30 px-1 rounded">Required</span>}
                {optional && <span className="text-[10px] font-bold text-muted-foreground uppercase border border-border px-1 rounded">Optional</span>}
            </div>
            <div className="flex-1 text-muted-foreground leading-relaxed">
                {description}
            </div>
        </div>
    );
}

function ExampleSection({ title, code }: { title: string, code: string }) {
    return (
        <div>
            <h4 className="text-sm font-semibold uppercase text-muted-foreground tracking-wider mb-3">{title}</h4>
            <div className="relative group">
                <pre className="bg-zinc-950 text-zinc-50 p-4 rounded-lg text-xs font-mono overflow-x-auto border border-zinc-800 leading-relaxed">
                    {code}
                </pre>
            </div>
        </div>
    );
}

function ResponseSection({ code }: { code: string }) {
    return (
        <ExampleSection title="Typical JSON Response" code={code} />
    );
}
