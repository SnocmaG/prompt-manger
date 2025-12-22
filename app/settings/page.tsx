"use client";

import { CredentialsManager } from "@/components/credentials-manager";

export default function SettingsPage() {
    return (
        <div className="container mx-auto py-10 space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
                <p className="text-muted-foreground">
                    Manage your preferences and API configurations.
                </p>
            </div>

            <div className="space-y-6">
                <CredentialsManager />
            </div>
        </div>
    );
}
