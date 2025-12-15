"use client";

import React from 'react';
import { cn } from "@/lib/utils";

interface CodeBlockProps {
    code: string;
    className?: string;
}

export function CodeBlock({ code, className }: CodeBlockProps) {
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

    return (
        <div className={cn("relative group border border-border/20 rounded-lg overflow-hidden", className)}>
            <div className="absolute top-0 left-0 w-full h-8 bg-muted/10 border-b border-border/10 flex items-center px-4 gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500/50" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-500/50" />
            </div>
            <pre
                className="bg-[#1a1a1a] text-zinc-100 p-6 pt-12 rounded-lg text-xs font-mono overflow-x-auto leading-relaxed shadow-inner"
                dangerouslySetInnerHTML={{ __html: highlightJson(code) }}
            />
        </div>
    );
}
