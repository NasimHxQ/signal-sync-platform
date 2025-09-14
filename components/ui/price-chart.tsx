"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface PriceChartProps {
  symbol: string
  currentPrice: number
  priceChange: number
  priceChangePercent: number
  high24h: number
  low24h: number
  volume24h: number
  className?: string
}

export function PriceChart({
  symbol,
  currentPrice,
  priceChange,
  priceChangePercent,
  high24h,
  low24h,
  volume24h,
  className,
}: PriceChartProps) {
  const isPositive = priceChange >= 0

  return (
    <Card className={cn("", className)}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">{symbol}</CardTitle>
          <Badge variant={isPositive ? "default" : "destructive"} className="text-xs">
            {isPositive ? <TrendingUp className="mr-1 h-3 w-3" /> : <TrendingDown className="mr-1 h-3 w-3" />}
            {priceChangePercent.toFixed(2)}%
          </Badge>
        </div>
        <CardDescription>24h Price Movement</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono">${currentPrice.toLocaleString()}</span>
            <span
              className={cn(
                "text-sm font-medium",
                isPositive ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400",
              )}
            >
              {isPositive ? "+" : ""}
              {priceChange.toFixed(2)}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">24h High</p>
            <p className="font-mono font-semibold">${high24h.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-muted-foreground">24h Low</p>
            <p className="font-mono font-semibold">${low24h.toLocaleString()}</p>
          </div>
        </div>

        <div>
          <p className="text-muted-foreground text-sm">24h Volume</p>
          <p className="font-mono font-semibold">${volume24h.toLocaleString()}</p>
        </div>

        {/* Simple price bar visualization */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>${low24h.toLocaleString()}</span>
            <span>${high24h.toLocaleString()}</span>
          </div>
          <div className="relative h-2 bg-muted rounded-full overflow-hidden">
            <div
              className={cn("absolute top-0 left-0 h-full rounded-full", isPositive ? "bg-green-500" : "bg-red-500")}
              style={{
                width: `${((currentPrice - low24h) / (high24h - low24h)) * 100}%`,
              }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
