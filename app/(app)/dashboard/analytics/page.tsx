"use client"

import { useState, useEffect } from "react"
import type { ProviderPerformance } from "@/lib/server/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PriceChart } from "@/components/ui/price-chart"
import { PerformanceMetrics } from "@/components/ui/performance-metrics"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BarChart3, TrendingUp, Download, Calendar } from "lucide-react"

const mockPriceData = [
  {
    symbol: "BTC/USDT",
    currentPrice: 43250,
    priceChange: 1250,
    priceChangePercent: 2.98,
    high24h: 44100,
    low24h: 41800,
    volume24h: 28500000000,
  },
  {
    symbol: "ETH/USDT",
    currentPrice: 2650,
    priceChange: -85,
    priceChangePercent: -3.11,
    high24h: 2780,
    low24h: 2620,
    volume24h: 15200000000,
  },
  {
    symbol: "SOL/USDT",
    currentPrice: 98.5,
    priceChange: 4.2,
    priceChangePercent: 4.46,
    high24h: 102,
    low24h: 94.1,
    volume24h: 2100000000,
  },
]

const mockPerformanceData = [
  {
    source: "CryptoWhales",
    totalSignals: 156,
    winRate: 73.2,
    avgReturn: 4.8,
    totalPnL: 12450,
    accuracy: 78.5,
    riskScore: 45,
  },
  {
    source: "TradingPro",
    totalSignals: 89,
    winRate: 68.5,
    avgReturn: 3.2,
    totalPnL: 8920,
    accuracy: 71.2,
    riskScore: 62,
  },
  {
    source: "SolanaSignals",
    totalSignals: 67,
    winRate: 81.2,
    avgReturn: 6.1,
    totalPnL: 15680,
    accuracy: 85.3,
    riskScore: 38,
  },
]

export default function AnalyticsPage() {
  const [performanceData, setPerformanceData] = useState<ProviderPerformance[]>(mockPerformanceData)
  const [loading, setLoading] = useState(true)

  // Fetch provider performance stats
  useEffect(() => {
    async function fetchProviderStats() {
      try {
        setLoading(true)
        const response = await fetch('/api/providers/stats')
        if (response.ok) {
          const data = await response.json()
          setPerformanceData(data.items || [])
        } else {
          console.error('Failed to fetch provider stats:', response.statusText)
          // Keep mock data as fallback
        }
      } catch (error) {
        console.error('Error fetching provider stats:', error)
        // Keep mock data as fallback
      } finally {
        setLoading(false)
      }
    }

    fetchProviderStats()
  }, [])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground">Track performance and analyze market data</p>
        </div>
        <div className="flex items-center gap-2">
          <Select defaultValue="7d">
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1d">1 Day</SelectItem>
              <SelectItem value="7d">7 Days</SelectItem>
              <SelectItem value="30d">30 Days</SelectItem>
              <SelectItem value="90d">90 Days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            <Calendar className="mr-2 h-4 w-4" />
            Custom Range
          </Button>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="markets">Markets</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total P&L</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">+$37,050</div>
                <p className="text-xs text-muted-foreground">+18.2% from last month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Win Rate</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">74.3%</div>
                <p className="text-xs text-muted-foreground">+2.1% from last week</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Signals</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">12</div>
                <p className="text-xs text-muted-foreground">3 new today</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Return</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">+4.8%</div>
                <p className="text-xs text-muted-foreground">Per signal</p>
              </CardContent>
            </Card>
          </div>

          {/* Performance Overview */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {loading ? (
              // Show loading skeletons
              Array.from({ length: 3 }).map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-4 bg-muted rounded w-1/2"></div>
                    <div className="h-3 bg-muted rounded w-1/3"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="h-8 bg-muted rounded"></div>
                      <div className="h-2 bg-muted rounded"></div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              performanceData.map((data) => (
                <PerformanceMetrics key={data.source} {...data} />
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {loading ? (
              // Show loading skeletons
              Array.from({ length: 3 }).map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-4 bg-muted rounded w-1/2"></div>
                    <div className="h-3 bg-muted rounded w-1/3"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="h-8 bg-muted rounded"></div>
                      <div className="h-2 bg-muted rounded"></div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              performanceData.map((data) => (
                <PerformanceMetrics key={data.source} {...data} />
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="markets" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {mockPriceData.map((data) => (
              <PriceChart key={data.symbol} {...data} />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
