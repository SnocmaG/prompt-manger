"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, Plus, Trash2, Check, Key } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";

interface Credential {
    id: string;
    name: string;
    provider: string;
    isDefault: boolean;
    createdAt: string;
}

export function CredentialsManager() {
    const [credentials, setCredentials] = useState<Credential[]>([]);
    const [loading, setLoading] = useState(true);
    const [hasSystemKey, setHasSystemKey] = useState(false);

    // Form State
    const [isAdding, setIsAdding] = useState(false);
    const [newName, setNewName] = useState("");
    const [newKey, setNewKey] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const fetchCredentials = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/credentials");
            if (res.ok) {
                const data = await res.json();
                setCredentials(data.credentials);
                setHasSystemKey(data.hasSystemKey);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCredentials();
    }, []);

    const handleAdd = async () => {
        if (!newName || !newKey) return;
        setSubmitting(true);
        try {
            const res = await fetch("/api/credentials", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: newName,
                    apiKey: newKey,
                    provider: "openai"
                })
            });
            if (res.ok) {
                setNewName("");
                setNewKey("");
                setIsAdding(false);
                fetchCredentials();
            }
        } catch (e) {
            console.error(e);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this key?")) return;
        try {
            await fetch(`/api/credentials?id=${id}`, { method: "DELETE" });
            fetchCredentials();
        } catch (e) { console.error(e); }
    };

    const handleSetDefault = async (id: string) => {
        try {
            // Optimistic update
            setCredentials(prev => prev.map(c => ({
                ...c,
                isDefault: c.id === id
            })));

            await fetch("/api/credentials", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id, isDefault: true })
            });
            fetchCredentials(); // Sync to be sure
        } catch (e) { console.error(e); }
    };

    // If no credential is set as default, and system key exists, that's effectively the default.
    // However, our UI logic explicitly sets one as default=true in DB.
    // If NO DB record has default=true, then System Key is the fallback.
    const activeDefaultId = credentials.find(c => c.isDefault)?.id;
    const usingSystemDefault = !activeDefaultId && hasSystemKey;

    if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;

    return (
        <Card className="w-full max-w-4xl mx-auto">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Key className="h-5 w-5" />
                    OpenAI Credentials
                </CardTitle>
                <CardDescription>
                    Manage API keys used for generating responses.
                    {hasSystemKey && (
                        <span className="ml-1 text-green-600 font-medium">
                            System default key is available.
                        </span>
                    )}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-6">
                    {/* Add New Section */}
                    {!isAdding ? (
                        <Button onClick={() => setIsAdding(true)} variant="outline" size="sm">
                            <Plus className="h-4 w-4 mr-2" />
                            Add New Key
                        </Button>
                    ) : (
                        <div className="bg-muted/30 p-4 rounded-md border space-y-4">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label>Name</Label>
                                    <Input
                                        placeholder="My Personal Key"
                                        value={newName}
                                        onChange={e => setNewName(e.target.value)}
                                        disabled={submitting}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>API Key</Label>
                                    <Input
                                        type="password"
                                        placeholder="sk-..."
                                        value={newKey}
                                        onChange={e => setNewKey(e.target.value)}
                                        disabled={submitting}
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end gap-2">
                                <Button variant="ghost" size="sm" onClick={() => setIsAdding(false)} disabled={submitting}>Cancel</Button>
                                <Button size="sm" onClick={handleAdd} disabled={!newName || !newKey || submitting}>
                                    {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Save Key
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* List Section */}
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Created</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {/* System Key Row (Virtual) */}
                                {hasSystemKey && (
                                    <TableRow className={usingSystemDefault ? "bg-muted/50" : ""}>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                {usingSystemDefault ? (
                                                    <Badge variant="default" className="bg-green-600 hover:bg-green-700">Active</Badge>
                                                ) : (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-6 text-xs text-muted-foreground"
                                                        onClick={() => {
                                                            // To "switch" to system default, we just unset all others?
                                                            // Or we need a specific action. 
                                                            // For now, let's assume if you toggle OFF the active one, it goes back to system?
                                                            // My API logic in PUT supports setting, but unsetting all is tricky in one go?
                                                            // Actually, if we just set the current active one to false.
                                                            if (activeDefaultId) {
                                                                handleSetDefault(activeDefaultId).then(() => {
                                                                    // Actually my PUT logic toggles? 
                                                                    // Re-read PUT: it sets isDefault: true for one, and false for others.
                                                                    // If I send isDefault: false to the active one, it should work.
                                                                    fetch("/api/credentials", {
                                                                        method: "PUT",
                                                                        headers: { "Content-Type": "application/json" },
                                                                        body: JSON.stringify({ id: activeDefaultId, isDefault: false })
                                                                    }).then(fetchCredentials);
                                                                });
                                                            }
                                                        }}
                                                    >
                                                        Use System
                                                    </Button>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="font-medium flex items-center gap-2">
                                            System Default
                                            <Badge variant="secondary" className="text-[10px]">Env Var</Badge>
                                        </TableCell>
                                        <TableCell className="text-muted-foreground">-</TableCell>
                                        <TableCell className="text-right text-muted-foreground text-xs italic">
                                            Managed by Admin
                                        </TableCell>
                                    </TableRow>
                                )}

                                {credentials.map((cred) => (
                                    <TableRow key={cred.id} className={cred.isDefault ? "bg-muted/30" : ""}>
                                        <TableCell>
                                            <Switch
                                                checked={cred.isDefault}
                                                onCheckedChange={(checked) => {
                                                    if (checked) {
                                                        handleSetDefault(cred.id);
                                                    } else {
                                                        // Uncheck (revert to system if exists)
                                                        fetch("/api/credentials", {
                                                            method: "PUT",
                                                            headers: { "Content-Type": "application/json" },
                                                            body: JSON.stringify({ id: cred.id, isDefault: false })
                                                        }).then(fetchCredentials);
                                                    }
                                                }}
                                            />
                                        </TableCell>
                                        <TableCell className="font-medium">{cred.name}</TableCell>
                                        <TableCell className="text-muted-foreground text-xs">
                                            {new Date(cred.createdAt).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-destructive hover:text-destructive"
                                                onClick={() => handleDelete(cred.id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}

                                {credentials.length === 0 && !hasSystemKey && (
                                    <TableRow>
                                        <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                                            No credentials found. Add one to start generating.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
