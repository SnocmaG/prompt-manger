"use client"

import Link from "next/link"
import { UserButton, OrganizationSwitcher } from "@clerk/nextjs"
import {
    GitBranch,
    Plus,
    Search,
    BookOpen,
    Webhook,
    Settings,
    MoreHorizontal,
    LayoutDashboard
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import { ModeToggle } from "@/components/mode-toggle"

interface Prompt {
    id: string
    name: string
}

export function AppSidebar() {
    const pathname = usePathname()
    const router = useRouter()
    const searchParams = useSearchParams()
    const activeBranchId = searchParams.get('branch')
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

    // Extract prompt ID from path (robust method)
    // Pathname format: /prompt/[id]
    const activePromptId = pathname.startsWith('/prompt/') ? pathname.split('/')[2] : null

    const [branches, setBranches] = useState<any[]>([])

    // Fetch branches if we are on a prompt page
    useEffect(() => {
        if (!activePromptId) {
            setBranches([])
            return
        }

        const fetchBranches = async () => {
            try {
                const res = await fetch(`/api/prompts/${activePromptId}`)
                if (res.ok) {
                    const data = await res.json()
                    // The API returns the prompt object which contains branches
                    if (data.branches) {
                        setBranches(data.branches)
                    }
                }
            } catch (e) {
                console.error("Failed to fetch branches", e)
            }
        }
        fetchBranches()
    }, [activePromptId])

    return (
        <div className="w-[260px] h-screen flex flex-col bg-[#171717] text-gray-300 border-r border-[#ffffff10] shrink-0">
            {/* Header / New Prompt */}
            <div className="p-3 mb-2">
                <Button
                    variant="default"
                    className="w-full justify-start gap-2 shadow-sm font-semibold from-primary to-primary/80 bg-gradient-to-r text-primary-foreground hover:opacity-90 transition-all border-0"
                    onClick={() => router.push('/')}
                >
                    <Plus className="h-4 w-4" />
                    <span className="text-sm">New Prompt</span>
                </Button>
            </div>

            {/* Navigation / Main Links */}
            <div className="px-3 py-2 space-y-1">
                <Link href="/">
                    <div className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors hover:bg-[#ffffff10]",
                        pathname === "/" && "bg-[#ffffff10] text-white"
                    )}>
                        <LayoutDashboard className="h-4 w-4" />
                        Explore Library
                    </div>
                </Link>
                <Link href="/webhook">
                    <div className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors hover:bg-[#ffffff10]",
                        pathname === "/webhook" && "bg-[#ffffff10] text-white"
                    )}>
                        <Webhook className="h-4 w-4" />
                        Webhooks
                    </div>
                </Link>
                <Link href="/docs">
                    <div className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors hover:bg-[#ffffff10]",
                        pathname === "/docs" && "bg-[#ffffff10] text-white"
                    )}>
                        <BookOpen className="h-4 w-4" />
                        Documentation
                    </div>
                </Link>
            </div>

            {/* Search */}
            <div className="px-3 py-2">
                <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-3 w-3 text-muted-foreground" />
                    <Input
                        placeholder="Search prompts..."
                        className="h-8 pl-8 bg-[#2f2f2f] border-none text-xs text-white placeholder:text-gray-500 focus-visible:ring-1 focus-visible:ring-gray-600"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            {/* Contextual Branches List (Only when inside a prompt) */}
            {activePromptId && branches.length > 0 && (
                <div className="px-3 py-2">
                    <div className="flex items-center justify-between px-2 mb-1">
                        <div className="text-xs font-semibold text-gray-500">Branches</div>
                        {/* We could add a create button here if we wire it up, but simpler for now just list */}
                    </div>
                    <div className="space-y-0.5">
                        {branches.map(branch => {
                            const isActive = activeBranchId === branch.id;
                            return (
                                <Link
                                    key={branch.id}
                                    href={`/prompt/${activePromptId}?branch=${branch.id}`}
                                >
                                    <div
                                        className={cn(
                                            "group flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors cursor-pointer",
                                            isActive
                                                ? "bg-[#ffffff15] text-white font-medium"
                                                : "text-gray-400 hover:text-white hover:bg-[#ffffff10]"
                                        )}>
                                        <div className="flex items-center gap-2 truncate">
                                            <GitBranch className={cn("h-3 w-3", isActive ? "text-primary" : "")} />
                                            <span className="truncate max-w-[140px]">{branch.label || branch.name}</span>
                                        </div>
                                        {branch.isLive && <span className="text-[10px] bg-green-900/40 text-green-400 px-1.5 py-0.5 rounded">Live</span>}
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Prompt List (Scrollable) */}
            <div className="flex-1 overflow-hidden mt-2">
                <div className="px-4 text-xs font-semibold text-gray-500 mb-2">Recent</div>
                <ScrollArea className="h-full px-2">
                    <div className="space-y-0.5">
                        {filteredPrompts.map(prompt => (
                            <Link key={prompt.id} href={`/prompt/${prompt.id}`}>
                                <div className={cn(
                                    "group flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors hover:bg-[#ffffff10] cursor-pointer",
                                    pathname === `/prompt/${prompt.id}` ? "bg-[#ffffff10] text-white" : "text-gray-400"
                                )}>
                                    <span className="truncate max-w-[180px]">{prompt.name}</span>
                                </div>
                            </Link>
                        ))}
                        {filteredPrompts.length === 0 && (
                            <div className="px-3 py-4 text-xs text-gray-600 text-center">
                                No prompts found
                            </div>
                        )}
                    </div>
                </ScrollArea>
            </div>

            {/* Footer / User Profile */}
            <div className="p-3 border-t border-[#ffffff10] mt-auto">
                <div className="flex items-center justify-between gap-2 px-2 py-2 rounded-lg hover:bg-[#ffffff10] transition-colors">
                    <div className="flex items-center gap-2 overflow-hidden">
                        <UserButton afterSignOutUrl="/" />
                        <div className="flex flex-col truncate">
                            <span className="text-sm font-medium text-white truncate max-w-[120px]">Profile</span>
                        </div>
                    </div>
                    <ModeToggle />
                </div>
                {/* Organization Switcher - Styled simply */}
                <div className="mt-2 px-1">
                    <OrganizationSwitcher
                        appearance={{
                            elements: {
                                rootBox: "w-full",
                                organizationSwitcherTrigger: "w-full flex items-center justify-between text-gray-300 hover:text-white text-xs py-2 px-2 rounded hover:bg-[#ffffff10] transition-colors group",
                                organizationPreviewTextContainer: "text-gray-300 group-hover:text-white",
                                organizationPreviewMainIdentifier: "text-gray-300 group-hover:text-white font-medium"
                            }
                        }}
                    />
                </div>
            </div>
        </div>
    )
}
