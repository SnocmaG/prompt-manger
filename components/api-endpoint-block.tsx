"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface EndpointBlockProps {
    method: string;
    path: string;
    title: string;
    description: string;
    children?: React.ReactNode;
}

export function EndpointBlock({ method, path, title, description, children }: EndpointBlockProps) {
    const [isOpen, setIsOpen] = useState(false);

    const colorClass =
        method === "GET" ? "bg-blue-500/10 text-blue-500 border-blue-500/20" :
            method === "POST" ? "bg-green-500/10 text-green-500 border-green-500/20" :
                method === "PATCH" ? "bg-orange-500/10 text-orange-500 border-orange-500/20" :
                    method === "DELETE" ? "bg-red-500/10 text-red-500 border-red-500/20" :
                        "bg-gray-500/10 text-gray-500";

    return (
        <div className="border rounded-xl bg-card overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full text-left p-6 border-b bg-muted/30 hover:bg-muted/50 transition-colors flex items-start gap-4 group"
            >
                <div className="mt-1 text-muted-foreground group-hover:text-foreground transition-colors">
                    {isOpen ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
                </div>

                <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-3 mb-3">
                        <span className={cn("px-3 py-1 text-xs font-bold rounded-full border", colorClass)}>
                            {method}
                        </span>
                        <span className="font-mono text-sm font-semibold selection:bg-primary/20">{path}</span>
                        <div
                            onClick={(e) => {
                                e.stopPropagation();
                                navigator.clipboard.writeText(path);
                                const btn = e.currentTarget;
                                const icon = btn.querySelector('.copy-icon');
                                const check = btn.querySelector('.check-icon');
                                icon?.classList.add('hidden');
                                check?.classList.remove('hidden');
                                setTimeout(() => {
                                    icon?.classList.remove('hidden');
                                    check?.classList.add('hidden');
                                }, 1500);
                            }}
                            className="ml-auto md:ml-2 p-1.5 hover:bg-black/5 dark:hover:bg-white/10 rounded-md cursor-pointer transition-colors text-muted-foreground hover:text-foreground"
                            title="Copy Endpoint URL"
                        >
                            <svg className="copy-icon h-3.5 w-3.5" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2" /><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" /></svg>
                            <svg className="check-icon h-3.5 w-3.5 text-green-500 hidden" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                        </div>
                    </div>
                    <h3 className="text-xl font-bold mb-2">{title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
                </div>
            </button>

            {isOpen && (
                <div className="p-6 space-y-6 animate-in slide-in-from-top-2 duration-200">
                    {children}
                </div>
            )}
        </div>
    );
}
