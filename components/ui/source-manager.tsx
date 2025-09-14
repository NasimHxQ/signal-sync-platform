"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Plus, Settings, Trash2, MessageSquare, Twitter, Hash, Globe } from "lucide-react"
import { useState, useEffect } from "react"
import type { Provider } from "@/lib/server/types"

interface Source {
  id: string
  name: string
  type: "discord" | "telegram" | "twitter" | "premium"
  status: "active" | "inactive" | "error"
  signalCount: number
  lastSignal: string
  winRate: number
}

const mockSources: Source[] = [
  {
    id: "1",
    name: "CryptoWhales Discord",
    type: "discord",
    status: "active",
    signalCount: 156,
    lastSignal: "2 minutes ago",
    winRate: 73.2,
  },
  {
    id: "2",
    name: "TradingPro Telegram",
    type: "telegram",
    status: "active",
    signalCount: 89,
    lastSignal: "15 minutes ago",
    winRate: 68.5,
  },
  {
    id: "3",
    name: "@CryptoAnalyst",
    type: "twitter",
    status: "inactive",
    signalCount: 34,
    lastSignal: "2 hours ago",
    winRate: 81.2,
  },
  {
    id: "4",
    name: "Premium Signals VIP",
    type: "premium",
    status: "error",
    signalCount: 203,
    lastSignal: "1 day ago",
    winRate: 76.8,
  },
]

export function SourceManager({ className }: { className?: string }) {
  const [sources, setSources] = useState<Provider[]>([])
  const [loading, setLoading] = useState(true)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [connecting, setConnecting] = useState(false)
  const [selectedProviderType, setSelectedProviderType] = useState<string>("")
  const [providerName, setProviderName] = useState("")
  const [connectionDetails, setConnectionDetails] = useState("")

  // Load providers on component mount
  useEffect(() => {
    async function loadProviders() {
      try {
        setLoading(true)
        const response = await fetch('/api/me')
        if (response.ok) {
          const data = await response.json()
          setSources(data.providers || [])
        } else {
          // Fallback to mock data
          setSources(mockSources as any)
        }
      } catch (error) {
        console.error('Error loading providers:', error)
        // Fallback to mock data
        setSources(mockSources as any)
      } finally {
        setLoading(false)
      }
    }

    loadProviders()
  }, [])

  const handleAddSource = async () => {
    if (!selectedProviderType || !providerName || !connectionDetails) {
      return
    }

    try {
      setConnecting(true)
      
      const response = await fetch(`/api/connect/${selectedProviderType}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: providerName,
          credentials: { connectionString: connectionDetails },
        }),
      })

      if (response.ok) {
        const newProvider = await response.json()
        
        // Add the new provider to the list
        const providerToAdd: Provider = {
          id: newProvider.id,
          name: providerName,
          type: newProvider.type,
          status: newProvider.status,
          signalCount: 0,
          lastSignal: "Just connected",
          winRate: 0,
        }
        
        setSources(prev => [...prev, providerToAdd])
        
        // Reset form
        setProviderName("")
        setConnectionDetails("")
        setSelectedProviderType("")
        setIsAddDialogOpen(false)
        
        console.log('Provider connected successfully')
      } else {
        console.error('Failed to connect provider:', response.statusText)
      }
    } catch (error) {
      console.error('Error connecting provider:', error)
    } finally {
      setConnecting(false)
    }
  }

  const getSourceIcon = (type: Provider["type"]) => {
    switch (type) {
      case "discord":
        return MessageSquare
      case "telegram":
        return MessageSquare
      case "twitter":
        return Twitter
      case "premium":
        return Globe
      default:
        return Hash
    }
  }

  const getStatusColor = (status: Provider["status"]) => {
    switch (status) {
      case "active":
        return "bg-green-500"
      case "inactive":
        return "bg-yellow-500"
      case "error":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  const toggleSourceStatus = (id: string) => {
    setSources((prev) =>
      prev.map((source) =>
        source.id === id
          ? {
              ...source,
              status: source.status === "active" ? "inactive" : "active",
            }
          : source,
      ),
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Signal Sources</CardTitle>
            <CardDescription>Manage your connected signal providers</CardDescription>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Add Source
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Signal Source</DialogTitle>
                <DialogDescription>Connect a new signal provider to your dashboard</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Source Type</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { type: "discord", label: "Discord", icon: MessageSquare },
                      { type: "telegram", label: "Telegram", icon: MessageSquare },
                      { type: "twitter", label: "Twitter/X", icon: Twitter },
                      { type: "premium", label: "Premium", icon: Globe },
                    ].map(({ type, label, icon: Icon }) => (
                      <Button 
                        key={type} 
                        variant={selectedProviderType === type ? "default" : "outline"}
                        className="h-20 flex-col gap-2 bg-transparent"
                        onClick={() => setSelectedProviderType(type)}
                      >
                        <Icon className="h-6 w-6" />
                        <span>{label}</span>
                      </Button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Source Name</Label>
                  <Input 
                    placeholder="Enter source name..." 
                    value={providerName}
                    onChange={(e) => setProviderName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Connection Details</Label>
                  <Input 
                    placeholder="Server ID, Channel, or API Key..." 
                    value={connectionDetails}
                    onChange={(e) => setConnectionDetails(e.target.value)}
                  />
                </div>
                <div className="flex gap-2 pt-4">
                  <Button 
                    onClick={handleAddSource}
                    disabled={connecting || !selectedProviderType || !providerName || !connectionDetails}
                  >
                    {connecting ? 'Connecting...' : 'Add Source'}
                  </Button>
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sources.map((source) => {
            const Icon = getSourceIcon(source.type)
            return (
              <div key={source.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Icon className="h-8 w-8 text-muted-foreground" />
                    <div
                      className={`absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-2 border-background ${getStatusColor(source.status)}`}
                    />
                  </div>
                  <div>
                    <h4 className="font-medium">{source.name}</h4>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{source.signalCount} signals</span>
                      <span>Last: {source.lastSignal}</span>
                      <span>Win rate: {source.winRate}%</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant={
                      source.status === "active" ? "default" : source.status === "error" ? "destructive" : "secondary"
                    }
                  >
                    {source.status}
                  </Badge>
                  <Switch checked={source.status === "active"} onCheckedChange={() => toggleSourceStatus(source.id)} />
                  <Button variant="ghost" size="sm">
                    <Settings className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
