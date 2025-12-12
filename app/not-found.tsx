import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
    return (
        <div className="h-screen w-full flex flex-col items-center justify-center bg-background text-foreground space-y-4">
            <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl">404</h1>
            <p className="text-muted-foreground text-lg">Page not found</p>
            <Button asChild variant="default">
                <Link href="/">Return Home</Link>
            </Button>
        </div>
    );
}
