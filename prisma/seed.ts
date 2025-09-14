import { PrismaClient } from '../lib/generated/prisma'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Hash the demo password
  const demoPasswordHash = await bcrypt.hash('password123', 12)
  
  // Create demo user
  const user = await prisma.user.upsert({
    where: { email: 'demo@signalsync.app' },
    update: {},
    create: {
      email: 'demo@signalsync.app',
      name: 'Demo User',
      firstName: 'Demo',
      lastName: 'User',
      timezone: 'utc',
      passwordHash: demoPasswordHash,
      preferences: {
        display: {
          darkMode: false,
          compactView: false,
          defaultCurrency: 'usd',
        },
        trading: {
          defaultRiskLevel: 'medium',
          autoFollowSignals: false,
        },
      },
      alerts: {
        email: { enabled: true, address: 'demo@signalsync.app' },
        telegram: { enabled: false, username: '@demo' },
        browser: { enabled: true },
        sms: { enabled: false, phone: '+1234567890' },
        rules: {
          minConfidence: 70,
          types: ['buy', 'long'],
          minLeverage: 5,
        },
      },
    },
  })

  // Create providers
  const providers = await Promise.all([
    prisma.provider.upsert({
      where: { id: 'provider_1' },
      update: {},
      create: {
        id: 'provider_1',
        name: 'CryptoWhales Discord',
        type: 'discord',
        status: 'active',
        signalCount: 156,
        lastSignalAt: new Date(Date.now() - 2 * 60 * 1000), // 2 minutes ago
        winRate: 73.2,
        credentials: { token: 'discord_token_123', serverId: '123456789' },
        metadata: { description: 'Premium Discord signals' },
      },
    }),
    prisma.provider.upsert({
      where: { id: 'provider_2' },
      update: {},
      create: {
        id: 'provider_2',
        name: 'TradingPro Telegram',
        type: 'telegram',
        status: 'active',
        signalCount: 89,
        lastSignalAt: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
        winRate: 68.5,
        credentials: { botToken: 'telegram_token_456', chatId: '-987654321' },
      },
    }),
    prisma.provider.upsert({
      where: { id: 'provider_3' },
      update: {},
      create: {
        id: 'provider_3',
        name: '@CryptoAnalyst',
        type: 'twitter',
        status: 'inactive',
        signalCount: 34,
        lastSignalAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        winRate: 81.2,
        credentials: { apiKey: 'twitter_key_789', apiSecret: 'twitter_secret_123' },
      },
    }),
    prisma.provider.upsert({
      where: { id: 'provider_4' },
      update: {},
      create: {
        id: 'provider_4',
        name: 'Premium Signals VIP',
        type: 'premium',
        status: 'error',
        signalCount: 203,
        lastSignalAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
        winRate: 76.8,
        credentials: { apiKey: 'premium_key_abc', endpoint: 'https://api.premium.com' },
      },
    }),
  ])

  // Create signals
  const signals = await Promise.all([
    prisma.signal.upsert({
      where: { id: 'signal_1' },
      update: {},
      create: {
        id: 'signal_1',
        symbol: 'BTC/USDT',
        type: 'long',
        price: 43250,
        targetPrice: 45000,
        stopLoss: 42000,
        leverage: 10,
        timeframe: '4h',
        source: 'CryptoWhales',
        confidence: 85,
        timestamp: new Date(),
        status: 'active',
        pnl: 2.3,
      },
    }),
    prisma.signal.upsert({
      where: { id: 'signal_2' },
      update: {},
      create: {
        id: 'signal_2',
        symbol: 'ETH/USDT',
        type: 'short',
        price: 2650,
        targetPrice: 2500,
        stopLoss: 2750,
        timeframe: '1h',
        source: 'TradingPro',
        confidence: 72,
        timestamp: new Date(Date.now() - 30 * 60 * 1000),
        status: 'filled',
        pnl: -1.2,
      },
    }),
    prisma.signal.upsert({
      where: { id: 'signal_3' },
      update: {},
      create: {
        id: 'signal_3',
        symbol: 'SOL/USDT',
        type: 'buy',
        price: 98.5,
        targetPrice: 105,
        stopLoss: 95,
        leverage: 5,
        timeframe: '15m',
        source: 'SolanaSignals',
        confidence: 91,
        timestamp: new Date(Date.now() - 45 * 60 * 1000),
        status: 'active',
        pnl: 4.1,
      },
    }),
    prisma.signal.upsert({
      where: { id: 'signal_4' },
      update: {},
      create: {
        id: 'signal_4',
        symbol: 'ADA/USDT',
        type: 'long',
        price: 0.485,
        targetPrice: 0.52,
        stopLoss: 0.46,
        leverage: 8,
        timeframe: '2h',
        source: 'CardanoHub',
        confidence: 68,
        timestamp: new Date(Date.now() - 60 * 60 * 1000),
        status: 'cancelled',
        pnl: 0,
      },
    }),
    prisma.signal.upsert({
      where: { id: 'signal_5' },
      update: {},
      create: {
        id: 'signal_5',
        symbol: 'MATIC/USDT',
        type: 'short',
        price: 0.92,
        targetPrice: 0.85,
        stopLoss: 0.98,
        timeframe: '30m',
        source: 'PolygonPro',
        confidence: 79,
        timestamp: new Date(Date.now() - 90 * 60 * 1000),
        status: 'expired',
        pnl: -2.8,
      },
    }),
    prisma.signal.upsert({
      where: { id: 'signal_6' },
      update: {},
      create: {
        id: 'signal_6',
        symbol: 'LINK/USDT',
        type: 'buy',
        price: 14.25,
        targetPrice: 16.0,
        stopLoss: 13.5,
        leverage: 3,
        timeframe: '1d',
        source: 'ChainlinkPro',
        confidence: 77,
        timestamp: new Date(Date.now() - 120 * 60 * 1000),
        status: 'active',
        pnl: 1.8,
      },
    }),
  ])

  console.log(`Created user: ${user.email}`)
  console.log(`Created ${providers.length} providers`)
  console.log(`Created ${signals.length} signals`)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
