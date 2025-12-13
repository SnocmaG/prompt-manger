import { DashboardHeader } from "@/components/dashboard-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Webhook, Zap, ArrowRight, Save, Play } from "lucide-react"

export default function WebhookPage() {
    return (
        <div className="flex flex-col min-h-screen bg-background">
            <DashboardHeader />

            <main className="container max-w-5xl py-10 space-y-10">
                <section className="text-center space-y-4">
                    <Badge variant="outline" className="px-4 py-1 text-sm rounded-full">Coming from Zapier or n8n?</Badge>
                    <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">
                        Test AI Workflows <span className="text-primary">Instantly</span>
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        Don't copy-paste prompts between apps. Use our built-in Webhook Tester to send prompt outputs directly to your automation workflow.
                    </p>
                </section>

                <div className="grid md:grid-cols-3 gap-6">
                    <Card>
                        <CardHeader>
                            <Webhook className="h-8 w-8 text-primary mb-2" />
                            <CardTitle>Connect Anything</CardTitle>
                            <CardDescription>
                                Works with n8n, Zapier, Make.com, or any custom API endpoint.
                            </CardDescription>
                        </CardHeader>
                    </Card>
                    <Card>
                        <CardHeader>
                            <Save className="h-8 w-8 text-primary mb-2" />
                            <CardTitle>Persist URLs</CardTitle>
                            <CardDescription>
                                Save your test URL once per prompt. We remember it for you.
                            </CardDescription>
                        </CardHeader>
                    </Card>
                    <Card>
                        <CardHeader>
                            <Zap className="h-8 w-8 text-primary mb-2" />
                            <CardTitle>Real-time Testing</CardTitle>
                            <CardDescription>
                                Trigger workflows immediately with your prompt's output.
                            </CardDescription>
                        </CardHeader>
                    </Card>
                </div>

                <section className="border rounded-xl bg-card p-8 space-y-6">
                    <h2 className="text-2xl font-bold">How to Use Webhooks</h2>
                    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">

                        <div className="space-y-2">
                            <div className="bg-primary/10 w-8 h-8 rounded-full flex items-center justify-center font-bold text-primary">1</div>
                            <h3 className="font-semibold">Select Prompt</h3>
                            <p className="text-sm text-muted-foreground">Go to the "Prompts" tab and open any prompt you want to test.</p>
                        </div>

                        <div className="space-y-2">
                            <div className="bg-primary/10 w-8 h-8 rounded-full flex items-center justify-center font-bold text-primary">2</div>
                            <h3 className="font-semibold">Open Test Panel</h3>
                            <p className="text-sm text-muted-foreground">Click "Test Prompt" at the bottom. Choose <strong>Webhook URL</strong> as the provider.</p>
                        </div>

                        <div className="space-y-2">
                            <div className="bg-primary/10 w-8 h-8 rounded-full flex items-center justify-center font-bold text-primary">3</div>
                            <h3 className="font-semibold">Save URL</h3>
                            <p className="text-sm text-muted-foreground">Paste your webhook URL (e.g. from n8n) and click the <Save className="h-3 w-3 inline" /> icon to save it.</p>
                        </div>

                        <div className="space-y-2">
                            <div className="bg-primary/10 w-8 h-8 rounded-full flex items-center justify-center font-bold text-primary">4</div>
                            <h3 className="font-semibold">Run Test</h3>
                            <p className="text-sm text-muted-foreground">Enter input JSON and click <strong>Run Test</strong>. We'll POST the data to your endpoint.</p>
                        </div>

                    </div>
                </section>
            </main>
        </div>
    )
}
