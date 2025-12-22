"use client";

import { CredentialsManager } from "@/components/credentials-manager";
import { ApiKeysManager } from "@/components/api-keys-manager";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";

export default function SettingsPage() {
    const [tab, setTab] = useState("openai");

    return (
        <div className="container mx-auto py-10 space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
                <p className="text-muted-foreground">
                    Manage your API connections and access keys.
                </p>
            </div>

            <Tabs value={tab} onValueChange={setTab} className="w-full max-w-4xl mx-auto">
                <TabsList className="grid w-full grid-cols-2 mb-8">
                    <TabsTrigger value="openai">OpenAI Configuration</TabsTrigger>
                    <TabsTrigger value="app-keys">App Access Keys</TabsTrigger>
                </TabsList>

                <TabsContent value="openai">
                    <div className="space-y-4">
                        <div className="bg-blue-50/50 dark:bg-blue-900/10 p-4 rounded-lg border border-blue-200 dark:border-blue-800 text-sm text-blue-800 dark:text-blue-300 mb-6">
                            <strong>Use these keys to generate AI responses.</strong> <br />
                            These keys are used by the Prompt Manager to call OpenAI on your behalf (using your billing).
                        </div>
                        <CredentialsManager />
                    </div>
                </TabsContent>

                <TabsContent value="app-keys">
                    <div className="space-y-4">
                        <div className="bg-amber-50/50 dark:bg-amber-900/10 p-4 rounded-lg border border-amber-200 dark:border-amber-800 text-sm text-amber-800 dark:text-amber-300 mb-6">
                            <strong>Use these keys to access your Prompt Manager data.</strong> <br />
                            These keys allow your external apps to fetch prompts and log history from this system.
                        </div>
                        <ApiKeysManager />
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
