import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { ClerkProvider, SignedIn } from "@clerk/nextjs";
import { ThemeProvider } from "@/components/theme-provider"
import { AppSidebar } from '@/components/app-sidebar';
import { MobileNav } from "@/components/mobile-nav";
import "./globals.css";

const inter = Inter({
    subsets: ["latin"],
    variable: "--font-sans",
});

const jetbrainsMono = JetBrains_Mono({
    subsets: ["latin"],
    variable: "--font-mono",
});

export const metadata: Metadata = {
    metadataBase: new URL("https://prompt-manger.onrender.com"),
    title: "Prompt Manager - Branch & Deploy AI Prompts",
    description: "Professional prompt management with Git-like branching for AI automations",
    icons: {
        icon: '/favicon.ico',
    },
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <ClerkProvider appearance={{
            elements: {
                footer: "hidden",
            }
        }}>
            <html lang="en" suppressHydrationWarning>
                <body className={`${inter.variable} ${jetbrainsMono.variable} antialiased`}>
                    <ThemeProvider
                        attribute="class"
                        defaultTheme="system"
                        enableSystem
                        disableTransitionOnChange
                    >
                        <div className="flex h-screen overflow-hidden bg-background relative">
                            {/* Cheerful Background Gradient */}
                            <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-3xl" />
                                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-400/5 blur-3xl" />
                                <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] rounded-full bg-purple-400/5 blur-3xl animate-pulse delay-1000 [animation-duration:4000ms]" />
                            </div>

                            {/* Sidebar only visible when authenticated - wrapper check handled inside Sidebar or we wrap children */}
                            <SignedIn>
                                <div className="relative z-10 h-full">
                                    <AppSidebar />
                                </div>
                            </SignedIn>

                            {/* Main Content Area */}
                            <div className="flex-1 flex flex-col h-full overflow-hidden relative z-10">
                                <SignedIn>
                                    <MobileNav />
                                </SignedIn>
                                {children}
                            </div>
                        </div>
                    </ThemeProvider>
                </body>
            </html>
        </ClerkProvider>
    );
}
