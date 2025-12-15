import React from 'react';

interface ExpressionTextProps {
    text: string;
    className?: string;
}

export function ExpressionText({ text, className }: ExpressionTextProps) {
    if (!text) return null;

    // Split by {{ and }} to capture expressions
    // Example: "Hello {{ name }}, how are you?" -> ["Hello ", " name ", ", how are you?"]
    // We need to keep the delimiters or reconstruct them.
    // Better regex: /({{[^}]+}})/g
    const parts = text.split(/(\{\{[^}]+\}\})/g);

    return (
        <span className={className}>
            {parts.map((part, index) => {
                if (part.startsWith('{{') && part.endsWith('}}')) {
                    // This is an expression
                    return (
                        <span
                            key={index}
                            className="inline-flex items-center px-1.5 py-0.5 mx-0.5 rounded-md bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300 font-medium text-[10px] tracking-tight border border-orange-200 dark:border-orange-800/50"
                        >
                            {part}
                        </span>
                    );
                }
                // Regular text
                return <span key={index}>{part}</span>;
            })}
        </span>
    );
}
