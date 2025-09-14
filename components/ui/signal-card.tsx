import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { SignalBadge } from "./signal-badge"
import { cn } from "@/lib/utils"
import { Clock, Target, AlertTriangle } from "lucide-react"

interface SignalCardProps {
  signal: {
    id: string
    symbol: string
    type: "buy" | "sell" | "long" | "short"
    price: number
    targetPrice?: number
    stopLoss?: number
    leverage?: number
    timeframe: string
    source: string
    confidence: number
    timestamp: string
    status: "active" | "filled" | "cancelled" | "expired"
  }
  compact?: boolean
  className?: string
}

export function SignalCard({ signal, compact = false, className }: SignalCardProps) {
  const isPositive = signal.type === "buy" || signal.type === "long"

  return (
    <Card
      className={cn(
        "transition-all hover:shadow-md border-l-4",
        isPositive ? "border-l-green-500" : "border-l-red-500",
        className,
      )}
    >
      <CardHeader className={cn("pb-2", compact && "pb-1")}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-lg">{signal.symbol}</h3>
            <SignalBadge type={signal.type} size="sm" />
            {signal.leverage && (
              <Badge variant="outline" className="text-xs">
                {signal.leverage}x
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            {signal.timeframe}
          </div>
        </div>
      </CardHeader>

      <CardContent className={cn("pt-0", compact && "py-2")}>
        <div className="grid grid-cols-2 gap-4 mb-3">
          <div>
            <p className="text-xs text-muted-foreground">Entry Price</p>
            <p className="font-mono font-semibold">${signal.price.toLocaleString()}</p>
          </div>
          {signal.targetPrice && (
            <div>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Target className="h-3 w-3" />
                Target
              </p>
              <p className="font-mono font-semibold text-green-600 dark:text-green-400">
                ${signal.targetPrice.toLocaleString()}
              </p>
            </div>
          )}
        </div>

        {signal.stopLoss && (
          <div className="mb-3">
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" />
              Stop Loss
            </p>
            <p className="font-mono font-semibold text-red-600 dark:text-red-400">
              ${signal.stopLoss.toLocaleString()}
            </p>
          </div>
        )}

        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Source:</span>
            <Badge variant="secondary" className="text-xs">
              {signal.source}
            </Badge>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-muted-foreground">Confidence:</span>
            <span
              className={cn(
                "font-medium",
                signal.confidence >= 80
                  ? "text-green-600 dark:text-green-400"
                  : signal.confidence >= 60
                    ? "text-yellow-600 dark:text-yellow-400"
                    : "text-red-600 dark:text-red-400",
              )}
            >
              {signal.confidence}%
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
