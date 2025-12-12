"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <div className="h-screen w-full flex flex-col items-center justify-center bg-background text-foreground space-y-4">
            <h2 className="text-2xl font-bold">Something went wrong!</h2>
            <p className="text-muted-foreground">
                We apologize for the inconvenience.
            </p>
            <div className="flex gap-2">
                <Button onClick={() => reset()} variant="default">
                    Try again
                </Button>
                <Button
                    onClick={() => (window.location.href = "/")}
                    variant="outline"
                >
                    Go Home
                </Button>
            </div>
        </div>
    );
}
