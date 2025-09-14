import { db } from '../db'
import type { ProviderPerformance, ProviderStatsResponse, Provider, ConnectProviderRequest, ConnectProviderResponse } from "../types"

export interface ProviderStatsFilters {
  from?: string
  to?: string
  summary?: boolean
}

export async function getProviderStats(filters: ProviderStatsFilters = {}): Promise<ProviderStatsResponse> {
  try {
    // Get all providers with their signal counts and performance metrics
    const providers = await db.provider.findMany({
      where: {
        status: 'active', // Only include active providers in stats
      },
      orderBy: { winRate: 'desc' },
    })

    // Calculate performance metrics for each provider
    const items: ProviderPerformance[] = await Promise.all(
      providers.map(async (provider) => {
        // Get signals for this provider to calculate metrics
        const signals = await db.signal.findMany({
          where: { 
            source: provider.name,
            // Add date filtering if provided
            ...(filters.from && { timestamp: { gte: new Date(filters.from) } }),
            ...(filters.to && { timestamp: { lte: new Date(filters.to) } }),
          },
        })

        // Calculate metrics
        const totalSignals = signals.length
        const filledSignals = signals.filter(s => s.status === 'filled')
        const profitableSignals = filledSignals.filter(s => (s.pnl || 0) > 0)
        
        const winRate = totalSignals > 0 ? (profitableSignals.length / totalSignals) * 100 : 0
        const avgReturn = filledSignals.length > 0 
          ? filledSignals.reduce((sum, s) => sum + (s.pnl || 0), 0) / filledSignals.length 
          : 0
        const totalPnL = filledSignals.reduce((sum, s) => sum + (s.pnl || 0), 0)
        
        // Calculate accuracy (signals that hit target vs total filled)
        const targetHitSignals = filledSignals.filter(s => (s.pnl || 0) > 0)
        const accuracy = filledSignals.length > 0 ? (targetHitSignals.length / filledSignals.length) * 100 : 0
        
        // Calculate risk score based on leverage and volatility
        const avgLeverage = signals.filter(s => s.leverage).reduce((sum, s) => sum + (s.leverage || 0), 0) / Math.max(signals.filter(s => s.leverage).length, 1)
        const riskScore = Math.min(avgLeverage * 5, 100) // Simple risk calculation

        return {
          source: provider.name,
          totalSignals,
          winRate: Math.round(winRate * 10) / 10,
          avgReturn: Math.round(avgReturn * 10) / 10,
          totalPnL: Math.round(totalPnL),
          accuracy: Math.round(accuracy * 10) / 10,
          riskScore: Math.round(riskScore),
        }
      })
    )

    // If summary is requested, return top performers
    if (filters.summary) {
      return { 
        items: items
          .sort((a, b) => b.winRate - a.winRate)
          .slice(0, 3)
      }
    }

    return { items }
  } catch (error) {
    console.error('Error fetching provider stats from database:', error)
    // Fallback to empty result on database error
    return { items: [] }
  }
}

export async function getProviders(): Promise<Provider[]> {
  try {
    const providers = await db.provider.findMany({
      orderBy: { createdAt: 'desc' },
    })

    return providers.map(provider => ({
      id: provider.id,
      name: provider.name,
      type: provider.type as Provider['type'],
      status: provider.status as Provider['status'],
      signalCount: provider.signalCount,
      lastSignal: provider.lastSignalAt 
        ? formatRelativeTime(provider.lastSignalAt)
        : 'Never',
      winRate: Math.round(provider.winRate * 10) / 10,
    }))
  } catch (error) {
    console.error('Error fetching providers from database:', error)
    return []
  }
}

export async function connectProvider(
  providerType: string,
  request: ConnectProviderRequest
): Promise<ConnectProviderResponse> {
  try {
    // Create new provider in database
    const provider = await db.provider.create({
      data: {
        name: request.name,
        type: providerType,
        status: 'active', // Start as active, can be updated later
        signalCount: 0,
        winRate: 0,
        credentials: request.credentials,
        metadata: request.metadata as any || {},
      },
    })

    return {
      id: provider.id,
      type: provider.type as ConnectProviderResponse['type'],
      status: provider.status as ConnectProviderResponse['status'],
    }
  } catch (error) {
    console.error('Error connecting provider to database:', error)
    
    // Return error status on database failure
    return {
      id: `error_${Date.now()}`,
      type: providerType as ConnectProviderResponse['type'],
      status: 'error',
    }
  }
}

function formatRelativeTime(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMinutes = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffMinutes < 1) return 'Just now'
  if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes === 1 ? '' : 's'} ago`
  if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`
  return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`
}