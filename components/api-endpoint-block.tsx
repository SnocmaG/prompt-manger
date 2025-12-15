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
