"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { SignalCard } from "@/components/ui/signal-card"
import { SignalTable } from "@/components/ui/signal-table"
import { SkeletonLoader } from "@/components/ui/skeleton-loader"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TrendingUp, Activity, Zap, Filter, Plus } from "lucide-react"
import { useState, useEffect } from "react"
import type { Signal } from "@/lib/server/types"

// Mock data for demonstration
const mockSignals = [
  {
    id: "1",
    symbol: "BTC/USDT",
    type: "long" as const,
    price: 43250,
    targetPrice: 45000,
    stopLoss: 42000,
    leverage: 10,
    timeframe: "4h",
    source: "CryptoWhales",
    confidence: 85,
    timestamp: new Date().toISOString(),
    status: "active" as const,
    pnl: 2.3,
  },
  {
    id: "2",
    symbol: "ETH/USDT",
    type: "short" as const,
    price: 2650,
    targetPrice: 2500,
    stopLoss: 2750,
    timeframe: "1h",
    source: "TradingPro",
    confidence: 72,
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    status: "filled" as const,
    pnl: -1.2,
  },
  {
    id: "3",
    symbol: "SOL/USDT",
    type: "buy" as const,
    price: 98.5,
    targetPrice: 105,
    stopLoss: 95,
    leverage: 5,
    timeframe: "15m",
    source: "SolanaSignals",
    confidence: 91,
    timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    status: "active" as const,
    pnl: 4.1,
  },
]

const stats = [
  {
    title: "Active Signals",
    value: "12",
    change: "+2 from yesterday",
    trend: "up" as const,
    icon: Activity,
  },
  {
    title: "Win Rate",
    value: "73.2%",
    change: "+5.1% from last week",
    trend: "up" as const,
    icon: TrendingUp,
  },
  {
    title: "Total P&L",
    value: "+$2,847",
    change: "+12.3% this month",
    trend: "up" as const,
    icon: TrendingUp,
  },
  {
    title: "Signal Sources",
    value: "8",
    change: "2 new sources added",
    trend: "up" as const,
    icon: Zap,
  },
]

export default function DashboardPage() {
  const [loading, setLoading] = useState(true)
  const [signals, setSignals] = useState<Signal[]>([])
  const [view, setView] = useState<"cards" | "table">("cards")

  // Fetch recent signals on component mount
  useEffect(() => {
    async function fetchSignals() {
      try {
        setLoading(true)
        const response = await fetch('/api/signals?since=-24h&limit=6')
        if (response.ok) {
          const data = await response.json()
          setSignals(data.items || [])
        } else {
          console.error('Failed to fetch signals:', response.statusText)
          // Fallback to mock data on error
          setSignals(mockSignals)
        }
      } catch (error) {
        console.error('Error fetching signals:', error)
        // Fallback to mock data on error
        setSignals(mockSignals)
      } finally {
        setLoading(false)
      }
    }

    fetchSignals()
  }, [])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Monitor your crypto trading signals and performance</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Filter className="mr-2 h-4 w-4" />
            Filters
          </Button>
          <Button size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Add Source
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Signals Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Recent Signals</h2>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              Live: {signals.filter(s => s.status === 'active').length} signals
            </Badge>
            <Tabs value={view} onValueChange={(v) => setView(v as "cards" | "table")}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="cards">Cards</TabsTrigger>
                <TabsTrigger value="table">Table</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>

        {loading ? (
          <SkeletonLoader type={view === "cards" ? "card" : "table"} count={3} />
        ) : (
          <Tabs value={view} className="space-y-4">
            <TabsContent value="cards" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {signals.map((signal) => (
                  <SignalCard key={signal.id} signal={signal} />
                ))}
              </div>
            </TabsContent>
            <TabsContent value="table">
              <SignalTable signals={signals} />
            </TabsContent>
          </Tabs>
        )}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks and shortcuts for managing your signals</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <Button variant="outline" className="h-20 flex-col gap-2 bg-transparent">
              <Filter className="h-6 w-6" />
              <span>Create Filter</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2 bg-transparent">
              <Zap className="h-6 w-6" />
              <span>Add Source</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2 bg-transparent">
              <TrendingUp className="h-6 w-6" />
              <span>View Analytics</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
