import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider, SignedIn } from "@clerk/nextjs";
import { ThemeProvider } from "@/components/theme-provider"
import { AppSidebar } from '@/components/app-sidebar';
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

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
        <ClerkProvider>
            <html lang="en" suppressHydrationWarning>
                <body className={inter.className}>
                    <ThemeProvider
                        attribute="class"
                        defaultTheme="system"
                        enableSystem
                        disableTransitionOnChange
                    >
                        <div className="flex h-screen overflow-hidden bg-background">
                            {/* Sidebar only visible when authenticated - wrapper check handled inside Sidebar or we wrap children */}
                            <SignedIn>
                                <AppSidebar />
                            </SignedIn>

                            {/* Main Content Area */}
                            <div className="flex-1 flex flex-col h-full overflow-hidden relative">
                                {children}
                            </div>
                        </div>
                    </ThemeProvider>
                </body>
            </html>
        </ClerkProvider>
    );
}
