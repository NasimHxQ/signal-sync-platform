import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

interface SignalBadgeProps {
  type: "buy" | "sell" | "hold" | "long" | "short"
  size?: "sm" | "md" | "lg"
  className?: string
}

export function SignalBadge({ type, size = "md", className }: SignalBadgeProps) {
  const variants = {
    buy: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 border-green-200 dark:border-green-800",
    long: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 border-green-200 dark:border-green-800",
    sell: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400 border-red-200 dark:border-red-800",
    short: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400 border-red-200 dark:border-red-800",
    hold: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800",
  }

  const sizes = {
    sm: "text-xs px-1.5 py-0.5",
    md: "text-sm px-2 py-1",
    lg: "text-base px-3 py-1.5",
  }

  return (
    <Badge className={cn("font-medium border", variants[type], sizes[size], className)}>{type.toUpperCase()}</Badge>
  )
}
