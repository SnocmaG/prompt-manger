"use client";

import React, { useState } from 'react';
import { cn } from "@/lib/utils";
import { Copy, Check } from "lucide-react";

interface CodeBlockProps {
    code: string;
    className?: string;
}

export function CodeBlock({ code, className }: CodeBlockProps) {
    const [isCopied, setIsCopied] = useState(false);

    const handleCopy = () => {
        if (!code) return;
        navigator.clipboard.writeText(code);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    // Basic JSON syntax highlighting
    const highlightJson = (jsonValues: string) => {
        if (!jsonValues) return '';

        // Escape HTML
        const json = jsonValues
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');

        // Highlight
        return json.replace(
            /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
            function (match) {
                let cls = 'text-orange-400'; // number
                if (/^"/.test(match)) {
                    if (/:$/.test(match)) {
                        cls = 'text-blue-400'; // key
                    } else {
                        cls = 'text-green-400'; // string
                    }
                } else if (/true|false/.test(match)) {
                    cls = 'text-purple-400'; // boolean
                } else if (/null/.test(match)) {
                    cls = 'text-gray-400'; // null
                }
                return '<span class="' + cls + '">' + match + '</span>';
            }
        );
    };

    const [isCopied, setIsCopied] = React.useState(false);

    const handleCopy = () => {
        if (!code) return;
        navigator.clipboard.writeText(code);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    return (
        <div className={cn("relative group border border-border/20 rounded-lg overflow-hidden", className)}>
            <div className="absolute top-0 left-0 w-full h-8 bg-muted/10 border-b border-border/10 flex items-center justify-between px-4">
                <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500/50" />
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50" />
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500/50" />
                </div>
                <button
                    onClick={handleCopy}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
                    title="Copy code"
                >
                    {isCopied ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                    {isCopied ? <span className="text-green-500">Copied</span> : <span>Copy</span>}
                </button>
            </div>
            <pre
                className="bg-[#1a1a1a] text-zinc-100 p-6 pt-12 rounded-lg text-xs font-mono overflow-x-auto leading-relaxed shadow-inner"
                dangerouslySetInnerHTML={{ __html: highlightJson(code) }}
            />
        </div>
    );
}
