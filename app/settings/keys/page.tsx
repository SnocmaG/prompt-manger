"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Trash2, Copy, Plus } from "lucide-react"
import { useUser, useOrganization } from "@clerk/nextjs"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

interface ApiKey {
    id: string
    name: string
    maskedKey: string
    createdAt: string
    lastUsed: string | null
}

export default function ApiKeysPage() {
    const { user } = useUser();
    const { organization } = useOrganization();

    const [keys, setKeys] = useState<ApiKey[]>([])
    const [loading, setLoading] = useState(true)
    const [newKeyName, setNewKeyName] = useState("")
    const [createdKey, setCreatedKey] = useState<string | null>(null)
    const [isCreateOpen, setIsCreateOpen] = useState(false)

    const fetchKeys = async () => {
        try {
            const res = await fetch('/api/keys')
            if (res.ok) {
                const data = await res.json()
                setKeys(data)
            }
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchKeys()
    }, [])

    const handleCreate = async () => {
        if (!newKeyName) return;
        try {
            const res = await fetch('/api/keys', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newKeyName })
            })
            if (res.ok) {
                const data = await res.json()
                setCreatedKey(data.key) // Show the full key once
                fetchKeys()
                setNewKeyName("")
            }
        } catch (error) {
            console.error(error)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to revoke this key?')) return;
        try {
            await fetch(`/api/keys?id=${id}`, { method: 'DELETE' })
            fetchKeys()
        } catch (error) {
            console.error(error)
        }
    }

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        alert('Copied to clipboard!');
    };

    return (
        <div className="container mx-auto py-10 px-4 max-w-5xl">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">API Keys</h1>
                    <p className="text-muted-foreground mt-1">
                        Manage API keys for {organization?.name || user?.primaryEmailAddress?.emailAddress} workspace.
                    </p>
                </div>
                <Dialog open={isCreateOpen} onOpenChange={(open) => {
                    setIsCreateOpen(open);
                    if (!open) setCreatedKey(null); // Reset on close
                }}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" /> Create New Key
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Create API Key</DialogTitle>
                            <DialogDescription>
                                Enter a name for your new API key.
                            </DialogDescription>
                        </DialogHeader>

                        {!createdKey ? (
                            <div className="grid gap-4 py-4">
                                <Input
                                    placeholder="e.g. CI/CD Pipeline"
                                    value={newKeyName}
                                    onChange={(e) => setNewKeyName(e.target.value)}
                                />
                            </div>
                        ) : (
                            <div className="py-4 space-y-4">
                                <div className="p-4 bg-muted rounded-md text-sm break-all font-mono border border-primary/20 bg-primary/5 text-primary">
                                    {createdKey}
                                </div>
                                <div className="text-sm text-yellow-600 font-medium">
                                    Copy this key now. You won&apos;t be able to see it again!
                                </div>
                                <Button variant="outline" className="w-full" onClick={() => copyToClipboard(createdKey)}>
                                    <Copy className="mr-2 h-4 w-4" /> Copy Key
                                </Button>
                            </div>
                        )}

                        {!createdKey && (
                            <DialogFooter>
                                <Button onClick={handleCreate} disabled={!newKeyName}>Create</Button>
                            </DialogFooter>
                        )}
                    </DialogContent>
                </Dialog>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Active Keys</CardTitle>
                    <CardDescription>These keys allow access to the Prompt Manager API.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Key Prefix</TableHead>
                                <TableHead>Created</TableHead>
                                <TableHead>Last Used</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center h-24">Loading...</TableCell>
                                </TableRow>
                            ) : keys.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">No API keys found.</TableCell>
                                </TableRow>
                            ) : (
                                keys.map((key) => (
                                    <TableRow key={key.id}>
                                        <TableCell className="font-medium">{key.name}</TableCell>
                                        <TableCell className="font-mono text-xs">{key.maskedKey}</TableCell>
                                        <TableCell>{new Date(key.createdAt).toLocaleDateString()}</TableCell>
                                        <TableCell>{key.lastUsed ? new Date(key.lastUsed).toLocaleDateString() : 'Never'}</TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="icon" onClick={() => handleDelete(key.id)} className="text-red-500 hover:text-red-600 hover:bg-red-50">
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
