import { db } from '../db'
import type { Signal, SignalsResponse } from "../types"

export interface SignalFilters {
  since?: string
  status?: string
  source?: string
  type?: string
  minConfidence?: number
  timeframe?: string
  cursor?: string
  limit?: number
}

export async function getSignals(filters: SignalFilters = {}): Promise<SignalsResponse> {
  try {
    // Build where clause based on filters
    const where: any = {}

    if (filters.status && filters.status !== "all") {
      where.status = filters.status
    }

    if (filters.source && filters.source !== "all") {
      where.source = filters.source
    }

    if (filters.type) {
      where.type = filters.type
    }

    if (filters.minConfidence) {
      where.confidence = { gte: filters.minConfidence }
    }

    if (filters.timeframe) {
      where.timeframe = filters.timeframe
    }

    // Handle since filter
    if (filters.since) {
      const sinceDate = parseSinceFilter(filters.since)
      if (sinceDate) {
        where.timestamp = { gte: sinceDate }
      }
    }

    // Query database
    const limit = filters.limit || 50
    const signals = await db.signal.findMany({
      where,
      orderBy: { timestamp: 'desc' },
      take: limit + 1, // Take one extra to check if there are more
    })

    // Convert Prisma results to API format
    const items: Signal[] = signals.slice(0, limit).map(signal => ({
      id: signal.id,
      symbol: signal.symbol,
      type: signal.type as Signal['type'],
      price: signal.price,
      targetPrice: signal.targetPrice || undefined,
      stopLoss: signal.stopLoss || undefined,
      leverage: signal.leverage || undefined,
      timeframe: signal.timeframe,
      source: signal.source,
      confidence: signal.confidence,
      timestamp: signal.timestamp.toISOString(),
      status: signal.status as Signal['status'],
      pnl: signal.pnl || undefined,
    }))

    // Determine if there are more results
    const hasMore = signals.length > limit
    const nextCursor = hasMore ? `cursor_${signals[limit - 1].id}` : undefined

    return {
      items,
      nextCursor,
    }
  } catch (error) {
    console.error('Error fetching signals from database:', error)
    // Fallback to empty result on database error
    return { items: [] }
  }
}

function parseSinceFilter(since: string): Date | null {
  // Handle relative time formats like "-24h", "-7d"
  if (since.startsWith("-")) {
    const match = since.match(/^-(\d+)([hdwmy])$/)
    if (match) {
      const [, amount, unit] = match
      const now = new Date()
      const value = parseInt(amount, 10)

      switch (unit) {
        case "h":
          return new Date(now.getTime() - value * 60 * 60 * 1000)
        case "d":
          return new Date(now.getTime() - value * 24 * 60 * 60 * 1000)
        case "w":
          return new Date(now.getTime() - value * 7 * 24 * 60 * 60 * 1000)
        case "m":
          return new Date(now.getTime() - value * 30 * 24 * 60 * 60 * 1000)
        case "y":
          return new Date(now.getTime() - value * 365 * 24 * 60 * 60 * 1000)
      }
    }
  }

  // Handle ISO date strings
  try {
    return new Date(since)
  } catch {
    return null
  }
}