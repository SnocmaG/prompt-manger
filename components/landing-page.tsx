"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { GitBranch, Zap, Layers } from "lucide-react";
import { SignInButton } from "@clerk/nextjs";

export function LandingPage() {
    return (
        <div className="flex flex-col min-h-screen bg-background">
            {/* Header */}
            <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
                <div className="container flex h-14 max-w-screen-2xl items-center justify-between px-4 md:px-8">
                    <div className="flex items-center gap-2">
                        <GitBranch className="h-6 w-6 text-primary" />
                        <span className="font-bold text-lg hidden md:inline-block">Prompt Manager</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <SignInButton mode="modal">
                            <Button variant="ghost" size="sm">
                                Sign In
                            </Button>
                        </SignInButton>
                        <SignInButton mode="modal">
                            <Button size="sm">Get Started</Button>
                        </SignInButton>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section className="flex-1 space-y-6 pt-10 pb-16 md:pb-24 lg:py-24">
                <div className="container px-4 md:px-6 max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-10">
                    {/* Text Content */}
                    <div className="flex flex-col items-center md:items-start text-center md:text-left gap-4 flex-1">
                        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground">
                            Manage AI Prompts with <br className="hidden md:inline" />
                            <span className="text-primary">Git-like Precision</span>
                        </h1>
                        <p className="max-w-[700px] text-muted-foreground text-lg md:text-xl">
                            Stop copying prompts from Slack. Branch, version, and deploy your prompts.
                            Test automations instantly with built-in webhooks.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 mt-6">
                            <SignInButton mode="modal">
                                <Button size="lg" className="h-12 px-8 text-lg">
                                    Start Managing Prompts
                                </Button>
                            </SignInButton>
                            <SignInButton mode="modal">
                                <Button variant="outline" size="lg" className="h-12 px-8 text-lg">
                                    View Demo
                                </Button>
                            </SignInButton>
                        </div>

                        <div className="flex items-center gap-6 mt-8 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                                <Zap className="h-4 w-4" />
                                <span>Instant Webhooks</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Layers className="h-4 w-4" />
                                <span>Version History</span>
                            </div>
                        </div>
                    </div>

                    {/* Hero Image */}
                    <div className="flex-1 w-full max-w-[600px] relative">
                        <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 to-purple-500/20 rounded-xl blur-2xl opacity-50" />
                        <div className="relative rounded-xl border bg-card shadow-2xl overflow-hidden aspect-[4/3]">
                            <Image
                                src="/hero.png"
                                alt="Prompt Manager Workflow"
                                fill
                                className="object-cover"
                                priority
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-6 md:px-8 md:py-0 border-t">
                <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
                    <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
                        Built by <span className="font-semibold">SnocmaG</span>.
                    </p>
                </div>
            </footer>
        </div>
    );
}
