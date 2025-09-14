"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { TrendingUp, TrendingDown, Target, AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"

interface PerformanceMetricsProps {
  source: string
  totalSignals: number
  winRate: number
  avgReturn: number
  totalPnL: number
  accuracy: number
  riskScore: number
  className?: string
}

export function PerformanceMetrics({
  source,
  totalSignals,
  winRate,
  avgReturn,
  totalPnL,
  accuracy,
  riskScore,
  className,
}: PerformanceMetricsProps) {
  const isProfit = totalPnL >= 0
  const getRiskLevel = (score: number) => {
    if (score <= 30) return { label: "Low", color: "text-green-600 dark:text-green-400" }
    if (score <= 70) return { label: "Medium", color: "text-yellow-600 dark:text-yellow-400" }
    return { label: "High", color: "text-red-600 dark:text-red-400" }
  }

  const risk = getRiskLevel(riskScore)

  return (
    <Card className={cn("", className)}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">{source}</CardTitle>
            <CardDescription>Signal Provider Performance</CardDescription>
          </div>
          <Badge variant={isProfit ? "default" : "destructive"} className="text-xs">
            {isProfit ? <TrendingUp className="mr-1 h-3 w-3" /> : <TrendingDown className="mr-1 h-3 w-3" />}
            {isProfit ? "Profitable" : "Loss"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Total P&L</p>
            <p
              className={cn(
                "text-xl font-bold font-mono",
                isProfit ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400",
              )}
            >
              {isProfit ? "+" : ""}${totalPnL.toLocaleString()}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Avg Return</p>
            <p
              className={cn(
                "text-xl font-bold",
                avgReturn >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400",
              )}
            >
              {avgReturn >= 0 ? "+" : ""}
              {avgReturn.toFixed(1)}%
            </p>
          </div>
        </div>

        {/* Win Rate */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Win Rate</span>
            </div>
            <span className="text-sm font-semibold">{winRate.toFixed(1)}%</span>
          </div>
          <Progress value={winRate} className="h-2" />
        </div>

        {/* Accuracy */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Accuracy</span>
            </div>
            <span className="text-sm font-semibold">{accuracy.toFixed(1)}%</span>
          </div>
          <Progress value={accuracy} className="h-2" />
        </div>

        {/* Risk Score */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Risk Level</span>
            </div>
            <span className={cn("text-sm font-semibold", risk.color)}>{risk.label}</span>
          </div>
          <Progress value={riskScore} className="h-2" />
        </div>

        {/* Additional Stats */}
        <div className="pt-4 border-t">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Total Signals</span>
            <span className="font-medium">{totalSignals}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
