"use client"

import type React from "react"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { SignalBadge } from "./signal-badge"
import { cn } from "@/lib/utils"
import { ArrowUpDown, MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface Signal {
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
  pnl?: number
}

interface SignalTableProps {
  signals: Signal[]
  onSort?: (column: string) => void
  sortColumn?: string
  sortDirection?: "asc" | "desc"
  className?: string
}

export function SignalTable({ signals, onSort, sortColumn, sortDirection, className }: SignalTableProps) {
  const handleSort = (column: string) => {
    if (onSort) {
      onSort(column)
    }
  }

  const SortableHeader = ({ column, children }: { column: string; children: React.ReactNode }) => (
    <TableHead className="cursor-pointer hover:bg-muted/50 select-none" onClick={() => handleSort(column)}>
      <div className="flex items-center gap-1">
        {children}
        <ArrowUpDown className="h-3 w-3 opacity-50" />
      </div>
    </TableHead>
  )

  return (
    <div className={cn("rounded-md border", className)}>
      <Table>
        <TableHeader>
          <TableRow>
            <SortableHeader column="symbol">Symbol</SortableHeader>
            <SortableHeader column="type">Type</SortableHeader>
            <SortableHeader column="price">Entry</SortableHeader>
            <TableHead>Target</TableHead>
            <TableHead>Stop Loss</TableHead>
            <SortableHeader column="confidence">Confidence</SortableHeader>
            <SortableHeader column="source">Source</SortableHeader>
            <SortableHeader column="timestamp">Time</SortableHeader>
            <TableHead>Status</TableHead>
            <TableHead>P&L</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {signals.map((signal) => (
            <TableRow key={signal.id} className="hover:bg-muted/50">
              <TableCell className="font-medium">
                <div className="flex items-center gap-2">
                  {signal.symbol}
                  {signal.leverage && (
                    <Badge variant="outline" className="text-xs">
                      {signal.leverage}x
                    </Badge>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <SignalBadge type={signal.type} size="sm" />
              </TableCell>
              <TableCell className="font-mono">${signal.price.toLocaleString()}</TableCell>
              <TableCell className="font-mono text-green-600 dark:text-green-400">
                {signal.targetPrice ? `$${signal.targetPrice.toLocaleString()}` : "-"}
              </TableCell>
              <TableCell className="font-mono text-red-600 dark:text-red-400">
                {signal.stopLoss ? `$${signal.stopLoss.toLocaleString()}` : "-"}
              </TableCell>
              <TableCell>
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
              </TableCell>
              <TableCell>
                <Badge variant="secondary" className="text-xs">
                  {signal.source}
                </Badge>
              </TableCell>
              <TableCell className="text-xs text-muted-foreground">
                {new Date(signal.timestamp).toLocaleTimeString()}
              </TableCell>
              <TableCell>
                <Badge
                  variant={
                    signal.status === "active" ? "default" : signal.status === "filled" ? "secondary" : "outline"
                  }
                  className="text-xs"
                >
                  {signal.status}
                </Badge>
              </TableCell>
              <TableCell>
                {signal.pnl !== undefined && (
                  <span
                    className={cn(
                      "font-mono font-medium",
                      signal.pnl > 0
                        ? "text-green-600 dark:text-green-400"
                        : signal.pnl < 0
                          ? "text-red-600 dark:text-red-400"
                          : "text-muted-foreground",
                    )}
                  >
                    {signal.pnl > 0 ? "+" : ""}
                    {signal.pnl.toFixed(2)}%
                  </span>
                )}
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>View Details</DropdownMenuItem>
                    <DropdownMenuItem>Copy Signal</DropdownMenuItem>
                    <DropdownMenuItem>Add to Watchlist</DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive">Delete Signal</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
