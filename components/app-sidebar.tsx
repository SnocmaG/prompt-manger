"use client"

import Link from "next/link"
import { UserButton, OrganizationSwitcher } from "@clerk/nextjs"
import {
    Plus,
    Search,
    BookOpen,
    LayoutDashboard,
    PanelLeftClose,
    PanelLeftOpen,
    Key
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { ModeToggle } from "@/components/mode-toggle"

interface Prompt {
    id: string
    name: string
}

export function AppSidebar() {
    const pathname = usePathname()
    const router = useRouter()
    // const searchParams = useSearchParams()
    // const activeBranchId = searchParams.get('branch') // Removed
    const [isCollapsed, setIsCollapsed] = useState(false)
    const [prompts, setPrompts] = useState<Prompt[]>([])
    const [search, setSearch] = useState("")

    useEffect(() => {
        // Fetch prompts for the sidebar list
        const fetchPrompts = async () => {
            try {
                const res = await fetch('/api/prompts')
                if (res.ok) {
                    const data = await res.json()
                    setPrompts(data)
                }
            } catch (e) {
                console.error("Failed to fetch sidebar prompts", e)
            }
        }
        fetchPrompts()
    }, [])

    const filteredPrompts = prompts.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase())
    )

    return (
        <div
            className={cn(
                "hidden md:flex h-screen flex-col bg-[#171717] text-gray-300 border-r border-[#ffffff10] shrink-0 transition-all duration-300 relative group",
                isCollapsed ? "w-[64px]" : "w-[260px]"
            )}
        >
            {/* Header / New Prompt */}
            <div className={cn("p-3 mb-2 flex items-center", isCollapsed ? "justify-center" : "justify-between")}>
                {!isCollapsed && (
                    <Button
                        variant="default"
                        className="w-full justify-start gap-2 shadow-sm font-semibold from-primary to-primary/80 bg-gradient-to-r text-primary-foreground hover:opacity-90 transition-all border-0 truncate"
                        onClick={() => router.push('/')}
                    >
                        <Plus className="h-4 w-4 shrink-0" />
                        <span className="text-sm truncate">New Prompt</span>
                    </Button>
                )}
                {isCollapsed && (
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-white"
                        onClick={() => router.push('/')}
                        title="New Prompt"
                    >
                        <Plus className="h-4 w-4" />
                    </Button>
                )}
            </div>

            {/* Toggle Button - Visible on hover only */}
            <Button
                variant="ghost"
                size="icon"
                className="absolute -right-3 top-6 h-6 w-6 rounded-full border bg-card text-muted-foreground shadow-sm hover:bg-accent hover:text-accent-foreground opacity-0 group-hover:opacity-100 transition-opacity z-50 hidden md:flex"
                onClick={() => setIsCollapsed(!isCollapsed)}
            >
                {isCollapsed ? <PanelLeftOpen className="h-3 w-3" /> : <PanelLeftClose className="h-3 w-3" />}
            </Button>

            {/* Navigation / Main Links */}
            <div className="px-3 py-2 space-y-1">
                <Link href="/">
                    <div className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors hover:bg-[#ffffff10]",
                        pathname === "/" && "bg-[#ffffff10] text-white",
                        isCollapsed && "justify-center px-2"
                    )} title={isCollapsed ? "Explore Library" : undefined}>
                        <LayoutDashboard className="h-4 w-4 shrink-0" />
                        {!isCollapsed && <span className="truncate">Explore Library</span>}
                    </div>
                </Link>
                <Link href="/docs/api">
                    <div className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors hover:bg-[#ffffff10]",
                        pathname === "/docs/api" && "bg-[#ffffff10] text-white",
                        isCollapsed && "justify-center px-2"
                    )} title={isCollapsed ? "Documentation" : undefined}>
                        <BookOpen className="h-4 w-4 shrink-0" />
                        {!isCollapsed && <span className="truncate">Documentation</span>}
                    </div>
                </Link>
            </div>

            {/* Search */}
            {!isCollapsed && (
                <div className="px-3 py-2">
                    <div className="relative">
                        <Search className="absolute left-2 top-2.5 h-3 w-3 text-muted-foreground" />
                        <Input
                            placeholder="Search..."
                            className="h-8 pl-8 bg-[#2f2f2f] border-none text-xs text-white placeholder:text-gray-500 focus-visible:ring-1 focus-visible:ring-gray-600"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>
            )}

            {/* Prompt List (Scrollable) */}
            <div className="flex-1 overflow-hidden mt-2">
                {!isCollapsed && <div className="px-4 text-xs font-semibold text-gray-500 mb-2">Recent</div>}

                <ScrollArea className="h-full px-2">
                    <div className="space-y-0.5">
                        {filteredPrompts.map(prompt => (
                            <Link key={prompt.id} href={`/prompt/${prompt.id}`}>
                                <div className={cn(
                                    "group flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors hover:bg-[#ffffff10] cursor-pointer",
                                    pathname === `/prompt/${prompt.id}` ? "bg-[#ffffff10] text-white" : "text-gray-400",
                                    isCollapsed && "justify-center px-2"
                                )} title={isCollapsed ? prompt.name : undefined}>
                                    {/* Use a consistent icon for prompts if collapsed, or just initials? Let's use GitCommit-ish icon or just text truncation? User wants icons. */}
                                    {isCollapsed ? (
                                        <span className="text-[10px] font-mono border rounded px-1 min-w-[20px] text-center">{prompt.name.substring(0, 2).toUpperCase()}</span>
                                    ) : (
                                        <span className="truncate max-w-[180px]">{prompt.name}</span>
                                    )}
                                </div>
                            </Link>
                        ))}
                    </div>
                </ScrollArea>
            </div>

            {/* Footer / User Profile */}
            <div className="p-3 border-t border-[#ffffff10] mt-auto">
                <div className={cn("flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-[#ffffff10] transition-colors", isCollapsed ? "justify-center" : "justify-between")}>
                    <div className="flex items-center gap-2 overflow-hidden">
                        <UserButton afterSignOutUrl="/" />
                        {!isCollapsed && (
                            <div className="flex flex-col truncate">
                                <span className="text-sm font-medium text-white truncate max-w-[120px]">Profile</span>
                            </div>
                        )}
                    </div>
                    {!isCollapsed && <ModeToggle />}
                </div>

                {/* Organization Switcher - Hidden when collapsed for now as it's hard to style specifically */}
                {!isCollapsed && (
                    <div className="mt-2 px-1">
                        <OrganizationSwitcher
                            appearance={{
                                elements: {
                                    rootBox: "w-full",
                                    organizationSwitcherTrigger: "w-full flex items-center justify-between text-white hover:text-white text-xs py-2 px-2 rounded hover:bg-[#ffffff10] transition-colors group",
                                    organizationPreviewTextContainer: "text-white",
                                    organizationPreviewMainIdentifier: "text-white font-medium",
                                    organizationPreviewSecondaryIdentifier: "text-gray-400"
                                }
                            }}
                        />
                    </div>
                )}
            </div>
        </div>
    )
}
