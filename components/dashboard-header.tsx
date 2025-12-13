"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { UserButton, OrganizationSwitcher } from "@clerk/nextjs"
import { GitBranch, BookOpen, Webhook, Zap } from "lucide-react"
import { ModeToggle } from "@/components/mode-toggle"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

export function DashboardHeader() {
    const pathname = usePathname()

    const navItems = [
        {
            name: "Prompts",
            href: "/",
            icon: GitBranch,
            active: pathname === "/"
        },
        {
            name: "Webhooks",
            href: "/webhook",
            icon: Webhook,
            active: pathname === "/webhook"
        },
        {
            name: "Documentation",
            href: "/docs",
            icon: BookOpen,
            active: pathname === "/docs"
        }
    ]

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-14 items-center px-4 max-w-screen-2xl">
                <div className="mr-8 flex items-center gap-2">
                    <Link href="/" className="flex items-center gap-2 font-bold">
                        <GitBranch className="h-6 w-6 text-primary" />
                        <span className="hidden md:inline-block">Prompt Manager</span>
                    </Link>
                </div>

                <nav className="flex items-center space-x-4 lg:space-x-6 flex-1">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center text-sm font-medium transition-colors hover:text-primary",
                                item.active ? "text-foreground" : "text-muted-foreground"
                            )}
                        >
                            <item.icon className="mr-2 h-4 w-4" />
                            {item.name}
                        </Link>
                    ))}
                </nav>

                <div className="flex items-center gap-4">
                    <ModeToggle />
                    <div className="flex items-center gap-2 border-l pl-4 ml-2">
                        <OrganizationSwitcher
                            appearance={{
                                elements: {
                                    rootBox: "flex items-center",
                                    organizationSwitcherTrigger: "h-8 flex items-center gap-2 px-2 rounded-md hover:bg-muted transition-colors"
                                }
                            }}
                        />
                        <UserButton afterSignOutUrl="/" />
                    </div>
                </div>
            </div>
        </header>
    )
}
