"use client"

import { useState, useEffect, useCallback } from "react"
import type { Signal } from "@/lib/server/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { SignalTable } from "@/components/ui/signal-table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Filter, Download, RefreshCw, Settings } from "lucide-react"
import { EmptyState } from "@/components/ui/empty-state"

// Extended mock data
const allSignals = [
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
  {
    id: "4",
    symbol: "ADA/USDT",
    type: "long" as const,
    price: 0.485,
    targetPrice: 0.52,
    stopLoss: 0.46,
    leverage: 8,
    timeframe: "2h",
    source: "CardanoHub",
    confidence: 68,
    timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    status: "cancelled" as const,
    pnl: 0,
  },
  {
    id: "5",
    symbol: "MATIC/USDT",
    type: "short" as const,
    price: 0.92,
    targetPrice: 0.85,
    stopLoss: 0.98,
    timeframe: "30m",
    source: "PolygonPro",
    confidence: 79,
    timestamp: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
    status: "expired" as const,
    pnl: -2.8,
  },
]

export default function SignalsPage() {
  const [signals, setSignals] = useState<Signal[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [sourceFilter, setSourceFilter] = useState("all")
  const [sortColumn, setSortColumn] = useState("timestamp")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")

  // Fetch signals from API with current filters
  const fetchSignals = useCallback(async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      
      if (statusFilter !== "all") params.set("status", statusFilter)
      if (sourceFilter !== "all") params.set("source", sourceFilter)
      params.set("limit", "100") // Get more signals for the signals page
      
      const response = await fetch(`/api/signals?${params.toString()}`)
      if (response.ok) {
        const data = await response.json()
        setSignals(data.items || [])
      } else {
        console.error('Failed to fetch signals:', response.statusText)
        // Fallback to mock data on error
        setSignals(allSignals)
      }
    } catch (error) {
      console.error('Error fetching signals:', error)
      // Fallback to mock data on error
      setSignals(allSignals)
    } finally {
      setLoading(false)
    }
  }, [statusFilter, sourceFilter])

  // Fetch signals on component mount and when filters change
  useEffect(() => {
    fetchSignals()
  }, [fetchSignals])

  // Client-side filtering for search term (since API doesn't support text search yet)
  const filteredSignals = signals.filter((signal) => {
    const matchesSearch =
      signal.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
      signal.source.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  })

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortColumn(column)
      setSortDirection("desc")
    }
  }

  const activeSignals = filteredSignals.filter((s) => s.status === "active")
  const filledSignals = filteredSignals.filter((s) => s.status === "filled")
  const closedSignals = filteredSignals.filter((s) => s.status === "cancelled" || s.status === "expired")

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Live Signals</h1>
          <p className="text-muted-foreground">Monitor and manage all your trading signals in real-time</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button variant="outline" size="sm" onClick={fetchSignals} disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button size="sm">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters</CardTitle>
          <CardDescription>Filter and search through your signals</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search symbols or sources..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="filled">Filled</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sourceFilter} onValueChange={setSourceFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Source" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sources</SelectItem>
                <SelectItem value="CryptoWhales">CryptoWhales</SelectItem>
                <SelectItem value="TradingPro">TradingPro</SelectItem>
                <SelectItem value="SolanaSignals">SolanaSignals</SelectItem>
                <SelectItem value="CardanoHub">CardanoHub</SelectItem>
                <SelectItem value="PolygonPro">PolygonPro</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Signal Tabs */}
      <Tabs defaultValue="all" className="space-y-4">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="all" className="relative">
              All Signals
              <Badge variant="secondary" className="ml-2 text-xs">
                {filteredSignals.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="active" className="relative">
              Active
              <Badge variant="default" className="ml-2 text-xs">
                {activeSignals.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="filled" className="relative">
              Filled
              <Badge variant="secondary" className="ml-2 text-xs">
                {filledSignals.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="closed" className="relative">
              Closed
              <Badge variant="outline" className="ml-2 text-xs">
                {closedSignals.length}
              </Badge>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="all">
          {filteredSignals.length > 0 ? (
            <SignalTable
              signals={filteredSignals}
              onSort={handleSort}
              sortColumn={sortColumn}
              sortDirection={sortDirection}
            />
          ) : (
            <EmptyState
              icon={Filter}
              title="No signals found"
              description="Try adjusting your filters or search terms to find signals."
              action={{
                label: "Clear Filters",
                onClick: () => {
                  setSearchTerm("")
                  setStatusFilter("all")
                  setSourceFilter("all")
                },
              }}
            />
          )}
        </TabsContent>

        <TabsContent value="active">
          {activeSignals.length > 0 ? (
            <SignalTable
              signals={activeSignals}
              onSort={handleSort}
              sortColumn={sortColumn}
              sortDirection={sortDirection}
            />
          ) : (
            <EmptyState
              icon={Filter}
              title="No active signals"
              description="All your signals have been filled or closed."
            />
          )}
        </TabsContent>

        <TabsContent value="filled">
          {filledSignals.length > 0 ? (
            <SignalTable
              signals={filledSignals}
              onSort={handleSort}
              sortColumn={sortColumn}
              sortDirection={sortDirection}
            />
          ) : (
            <EmptyState icon={Filter} title="No filled signals" description="No signals have been filled yet." />
          )}
        </TabsContent>

        <TabsContent value="closed">
          {closedSignals.length > 0 ? (
            <SignalTable
              signals={closedSignals}
              onSort={handleSort}
              sortColumn={sortColumn}
              sortDirection={sortDirection}
            />
          ) : (
            <EmptyState
              icon={Filter}
              title="No closed signals"
              description="No signals have been cancelled or expired."
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
