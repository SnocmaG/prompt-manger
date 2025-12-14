"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Menu, X, Plus, LayoutDashboard, BookOpen, Search } from "lucide-react"
import { usePathname, useRouter } from "next/navigation"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { UserButton, OrganizationSwitcher } from "@clerk/nextjs"
import { ModeToggle } from "@/components/mode-toggle"

interface Prompt {
    id: string
    name: string
}

export function MobileNav() {
    const [isOpen, setIsOpen] = useState(false)
    const pathname = usePathname()
    const router = useRouter()
    const [prompts, setPrompts] = useState<Prompt[]>([])
    const [search, setSearch] = useState("")

    // Close on navigation
    useEffect(() => {
        setIsOpen(false)
    }, [pathname])

    useEffect(() => {
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
        if (isOpen && prompts.length === 0) {
            fetchPrompts()
        }
    }, [isOpen, prompts.length])

    const filteredPrompts = prompts.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase())
    )

    return (
        <div className="h-14 border-b bg-[#171717] flex items-center px-4 justify-between shrink-0 md:hidden z-20 sticky top-0 w-full">
            <div className="font-semibold text-white">Prompt Manager</div>
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(true)} className="text-white hover:bg-[#ffffff10]">
                <Menu className="h-5 w-5" />
            </Button>

            {/* Mobile Drawer Overlay */}
            {isOpen && (
                <div className="fixed inset-0 z-50 flex">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                        onClick={() => setIsOpen(false)}
                    />

                    {/* Drawer Content */}
                    <div className="relative w-[300px] h-full bg-[#171717] text-gray-300 border-r border-[#ffffff10] flex flex-col shadow-xl animate-in slide-in-from-left duration-300">
                        {/* Drawer Header */}
                        <div className="p-4 flex items-center justify-between border-b border-[#ffffff10]">
                            <span className="font-semibold text-white">Menu</span>
                            <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="h-8 w-8 text-white hover:bg-[#ffffff10]">
                                <X className="h-4 w-4" />
                            </Button>
                        </div>

                        {/* Same Sidebar Content Content... */}
                        <div className="p-3 mb-2">
                            <Button
                                variant="default"
                                className="w-full justify-start gap-2 shadow-sm font-semibold from-primary to-primary/80 bg-gradient-to-r text-primary-foreground hover:opacity-90 transition-all border-0"
                                onClick={() => { setIsOpen(false); router.push('/'); }}
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
                                    placeholder="Search..."
                                    className="h-8 pl-8 bg-[#2f2f2f] border-none text-xs text-white placeholder:text-gray-500 focus-visible:ring-1 focus-visible:ring-gray-600"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>
                        </div>

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
                                </div>
                            </ScrollArea>
                        </div>

                        {/* Footer */}
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
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
