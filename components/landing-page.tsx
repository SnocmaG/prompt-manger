"use client";

import { Button } from "@/components/ui/button";
import { GitBranch, Zap, Terminal, Code2, Cpu, ArrowRight, ShieldCheck, BookOpen } from "lucide-react";
import { SignInButton } from "@clerk/nextjs";
import { motion } from "framer-motion";
import Link from "next/link";

import { Logo } from "@/components/logo";

export function LandingPage() {
    return (
        <div className="flex flex-col min-h-screen bg-background text-foreground overflow-hidden selection:bg-primary/20">
            {/* Header */}
            <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
                <div className="container flex h-16 items-center justify-between px-4 md:px-8">
                    <Logo />

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
                        <Link href="/docs" className="transition-colors hover:text-foreground">Documentation</Link>
                        <Link href="#features" className="transition-colors hover:text-foreground">Features</Link>
                        <a href="https://github.com/SnocmaG/prompt-manger" target="_blank" rel="noreferrer" className="transition-colors hover:text-foreground">GitHub</a>
                    </nav>

                    <div className="flex items-center gap-4">
                        <SignInButton mode="modal">
                            <Button variant="ghost" size="sm" className="hidden sm:inline-flex text-muted-foreground hover:text-foreground">
                                Sign In
                            </Button>
                        </SignInButton>
                        <SignInButton mode="modal">
                            <Button size="sm" className="font-medium shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95">Get Started</Button>
                        </SignInButton>
                    </div>
                </div>
            </header>

            <main className="flex-1">
                {/* Hero Section */}
                <section className="relative pt-20 pb-20 md:pt-32 md:pb-32 overflow-hidden">
                    {/* Background Gradients */}
                    <div className="absolute inset-0 pointer-events-none">
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-primary/20 rounded-full blur-3xl opacity-30 animate-pulse" />
                        <div className="absolute bottom-0 right-0 w-[800px] h-[600px] bg-purple-500/10 rounded-full blur-3xl opacity-30" />
                    </div>

                    <div className="container relative z-10 px-4 md:px-6 flex flex-col items-center text-center">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            className="inline-flex items-center gap-2 rounded-full border bg-background/50 px-3 py-1 text-sm font-medium text-muted-foreground mb-8 backdrop-blur-sm"
                        >
                            <span className="flex h-2 w-2 rounded-full bg-primary animate-ping" />
                            <span>v1.0 is now live</span>
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                            className="text-4xl sm:text-5xl md:text-7xl font-extrabold tracking-tighter max-w-4xl bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/60"
                        >
                            The Operating System for <span className="text-primary">AI Prompts</span>
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="mt-6 max-w-[700px] text-lg md:text-xl text-muted-foreground leading-relaxed"
                        >
                            Stop treating prompts like magic strings.
                            <br className="hidden md:inline" />
                            Version, test, and deploy with the same rigor you apply to code.
                        </motion.p>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.3 }}
                            className="flex flex-col sm:flex-row gap-4 mt-8"
                        >
                            <SignInButton mode="modal">
                                <Button size="lg" className="h-12 px-8 text-lg font-medium shadow-xl shadow-primary/20 hover:shadow-primary/30 transition-all hover:scale-105 active:scale-95">
                                    Start Building Free
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </SignInButton>
                            <Link href="/docs">
                                <Button variant="outline" size="lg" className="h-12 px-8 text-lg bg-background/50 backdrop-blur-sm hover:bg-background/80 transition-all">
                                    <BookOpen className="mr-2 h-4 w-4" />
                                    Read Documentation
                                </Button>
                            </Link>
                        </motion.div>

                        {/* Code Snippet / Visual */}
                        <motion.div
                            initial={{ opacity: 0, y: 40 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.7, delay: 0.4 }}
                            className="mt-16 w-full max-w-4xl rounded-xl border bg-card/50 backdrop-blur-sm shadow-2xl overflow-hidden group hover:border-primary/50 transition-colors duration-500"
                        >
                            <div className="flex items-center gap-2 px-4 py-3 border-b bg-muted/50">
                                <div className="flex gap-1.5">
                                    <div className="w-3 h-3 rounded-full bg-red-500/80" />
                                    <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                                    <div className="w-3 h-3 rounded-full bg-green-500/80" />
                                </div>
                                <div className="text-xs text-muted-foreground font-mono ml-2">production-flow.ts</div>
                            </div>
                            <div className="p-6 text-left overflow-x-auto">
                                <pre className="text-sm font-mono leading-relaxed text-muted-foreground group-hover:text-foreground transition-colors duration-300">
                                    <code>
                                        <span className="text-purple-400">const</span> prompt = <span className="text-purple-400">await</span> client.getPrompt(<span className="text-green-400">&quot;customer-support-v2&quot;</span>);{"\n"}
                                        {"\n"}
                                        <span className="text-muted-foreground/60">{`// Execute with live variables`}</span>{"\n"}
                                        <span className="text-purple-400">const</span> response = <span className="text-purple-400">await</span> prompt.run({"{"}{"\n"}
                                        {"  "}inputs: {"{"} query: <span className="text-green-400">&quot;Where is my order?&quot;</span> {"}"},{"\n"}
                                        {"  "}model: <span className="text-green-400">&quot;gpt-4o&quot;</span>{"\n"}
                                        {"}"});
                                    </code>
                                </pre>
                            </div>
                        </motion.div>
                    </div>
                </section>

                {/* Features Grid */}
                <section className="py-24 bg-muted/30 border-y relative">
                    <div className="container px-4 md:px-6">
                        <div className="text-center max-w-3xl mx-auto mb-16">
                            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4 text-foreground/90">
                                Engineering-Grade Infrastructure
                            </h2>
                            <p className="text-lg text-muted-foreground">
                                Built for teams who refuse to compromise on quality or velocity.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-fr">
                            {/* Feature 1 */}
                            <motion.div
                                whileHover={{ y: -5 }}
                                className="group relative overflow-hidden rounded-2xl border bg-background p-8 shadow-sm transition-all hover:shadow-md md:col-span-2 hover:border-primary/50"
                            >
                                <div className="absolute top-0 right-0 p-8 opacity-20 group-hover:opacity-40 transition-opacity">
                                    <GitBranch className="h-32 w-32 text-primary rotate-12" />
                                </div>
                                <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
                                    <GitBranch className="h-5 w-5 text-primary" />
                                    True Git-based Versioning
                                </h3>
                                <p className="text-muted-foreground max-w-md">
                                    Treat prompts with the respect they deserve. Branch, commit, and rollback instantly. No more mystery changes or broken prods.
                                </p>
                            </motion.div>

                            {/* Feature 2 */}
                            <motion.div
                                whileHover={{ y: -5 }}
                                className="group relative overflow-hidden rounded-2xl border bg-background p-8 shadow-sm transition-all hover:shadow-md hover:border-blue-500/50"
                            >
                                <div className="absolute bottom-0 right-0 p-4 opacity-10 group-hover:opacity-30 transition-opacity">
                                    <Terminal className="h-24 w-24 text-blue-500" />
                                </div>
                                <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
                                    <Terminal className="h-5 w-5 text-blue-500" />
                                    Typed SDK & API
                                </h3>
                                <p className="text-muted-foreground">
                                    Consume prompts via a typesafe SDK. Catch errors at compile time, not runtime.
                                </p>
                            </motion.div>

                            {/* Feature 3 */}
                            <motion.div
                                whileHover={{ y: -5 }}
                                className="group relative overflow-hidden rounded-2xl border bg-background p-8 shadow-sm transition-all hover:shadow-md hover:border-orange-500/50"
                            >
                                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-30 transition-opacity">
                                    <Cpu className="h-24 w-24 text-orange-500" />
                                </div>
                                <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
                                    <Cpu className="h-5 w-5 text-orange-500" />
                                    Cross-Model Validation
                                </h3>
                                <p className="text-muted-foreground">
                                    A/B test across providers instantly. Is GPT-4o worth the cost? Prove it with data.
                                </p>
                            </motion.div>

                            {/* Feature 4 */}
                            <motion.div
                                whileHover={{ y: -5 }}
                                className="group relative overflow-hidden rounded-2xl border bg-background p-8 shadow-sm transition-all hover:shadow-md md:col-span-2 hover:border-green-500/50"
                            >
                                <div className="absolute bottom-0 right-0 p-8 opacity-10 group-hover:opacity-30 transition-opacity">
                                    <ShieldCheck className="h-32 w-32 text-green-500 -rotate-12" />
                                </div>
                                <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
                                    <ShieldCheck className="h-5 w-5 text-green-500" />
                                    Deploy with Confidence
                                </h3>
                                <p className="text-muted-foreground max-w-lg">
                                    Decouple prompt updates from code deploys. Rollout new versions to a subset of users, monitor, and promote to Live only when ready.
                                </p>
                            </motion.div>
                        </div>
                    </div>
                </section>

                {/* Workflow Section */}
                <section className="py-24 bg-background">
                    <div className="container px-4 md:px-6 flex flex-col items-center">
                        <h2 className="text-3xl font-bold tracking-tight mb-12 text-center text-foreground/80">Integrates with your stack</h2>
                        <div className="relative flex flex-wrap justify-center gap-8 md:gap-16 items-center opacity-70 hover:opacity-100 transition-all duration-700">
                            {/* Icons remain same but with better hover effect group */}
                            <div className="flex flex-col items-center gap-3 group cursor-default">
                                <div className="h-20 w-20 rounded-2xl bg-muted/50 flex items-center justify-center border group-hover:border-yellow-500/50 group-hover:bg-yellow-500/10 transition-all">
                                    <Zap className="h-10 w-10 text-yellow-500" />
                                </div>
                                <span className="font-semibold text-sm text-muted-foreground group-hover:text-foreground">n8n / Zapier</span>
                            </div>
                            <ArrowRight className="text-muted-foreground/20 hidden md:block" />
                            <div className="flex flex-col items-center gap-3 group cursor-default">
                                <div className="h-20 w-20 rounded-2xl bg-muted/50 flex items-center justify-center border group-hover:border-blue-500/50 group-hover:bg-blue-500/10 transition-all">
                                    <Code2 className="h-10 w-10 text-blue-500" />
                                </div>
                                <span className="font-semibold text-sm text-muted-foreground group-hover:text-foreground">Next.js / React</span>
                            </div>
                            <ArrowRight className="text-muted-foreground/20 hidden md:block" />
                            <div className="flex flex-col items-center gap-3 group cursor-default">
                                <div className="h-20 w-20 rounded-2xl bg-muted/50 flex items-center justify-center border group-hover:border-purple-500/50 group-hover:bg-purple-500/10 transition-all">
                                    <Terminal className="h-10 w-10 text-foreground" />
                                </div>
                                <span className="font-semibold text-sm text-muted-foreground group-hover:text-foreground">Python / Node</span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* CTA */}
                <section className="py-24 border-t bg-gradient-to-b from-muted to-background">
                    <div className="container px-4 flex flex-col items-center text-center">
                        <h2 className="text-3xl md:text-5xl font-bold mb-6 tracking-tight">Stop hardcoding prompts.</h2>
                        <p className="text-xl text-muted-foreground mb-10 max-w-2xl">
                            Join thousands of engineers who have upgraded their AI workflow.
                        </p>
                        <SignInButton mode="modal">
                            <Button size="lg" className="h-14 px-10 text-xl font-semibold shadow-2xl shadow-primary/30 hover:shadow-primary/50 transition-all hover:scale-105">
                                Start Building for Free
                            </Button>
                        </SignInButton>
                        <p className="mt-6 text-sm text-muted-foreground font-medium">
                            <ShieldCheck className="inline h-4 w-4 mr-1 text-green-500" />
                            Enterprise-grade security. Open Source.
                        </p>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="py-8 border-t bg-muted/10">
                <div className="container flex flex-col md:flex-row items-center justify-between gap-4 px-4">
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <GitBranch className="h-4 w-4" />
                        <span className="text-sm font-semibold">Prompt Manager</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        Built with ❤️ by SnocmaG
                    </p>
                </div>
            </footer>
        </div>
    );
}
