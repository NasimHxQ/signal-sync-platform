import { PrismaClient } from '@/lib/generated/prisma'

let testDb: PrismaClient

export async function setupTestDb() {
  testDb = new PrismaClient({
    datasources: {
      db: {
        url: 'file:./test.db'
      }
    }
  })

  // Ensure tables exist (jest.global-setup runs prisma db push, but this is an extra safety)
  // If the DB is brand new, some engines lazily create the file; touching models guarantees readiness
  await testDb.$executeRaw`SELECT 1`;

  // Clean database
  await testDb.savedFilter.deleteMany()
  await testDb.signal.deleteMany()
  await testDb.provider.deleteMany()
  await testDb.user.deleteMany()

  // Seed test data
  const user = await testDb.user.create({
    data: {
      id: 'test_user',
      email: 'demo@signalsync.app',
      name: 'Demo User',
      alerts: {
        email: { enabled: true, address: 'demo@signalsync.app' },
        rules: { minConfidence: 70, types: ['buy', 'long'] },
      },
    },
  })

  const providers = await Promise.all([
    testDb.provider.create({
      data: {
        id: 'provider_1',
        name: 'CryptoWhales',
        type: 'discord',
        status: 'active',
        signalCount: 156,
        winRate: 73.2,
        lastSignalAt: new Date(Date.now() - 2 * 60 * 1000),
      },
    }),
    testDb.provider.create({
      data: {
        id: 'provider_2',
        name: 'TradingPro',
        type: 'telegram',
        status: 'active',
        signalCount: 89,
        winRate: 68.5,
        lastSignalAt: new Date(Date.now() - 15 * 60 * 1000),
      },
    }),
    testDb.provider.create({
      data: {
        id: 'provider_3',
        name: 'SolanaSignals',
        type: 'twitter',
        status: 'active',
        signalCount: 67,
        winRate: 81.2,
        lastSignalAt: new Date(Date.now() - 30 * 60 * 1000),
      },
    }),
  ])

  const signals = await Promise.all([
    testDb.signal.create({
      data: {
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
    testDb.signal.create({
      data: {
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
    testDb.signal.create({
      data: {
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
    testDb.signal.create({
      data: {
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
    testDb.signal.create({
      data: {
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
    testDb.signal.create({
      data: {
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

  return { user, providers, signals, testDb }
}

export async function teardownTestDb() {
  if (testDb) {
    await testDb.$disconnect()
  }
}

export function getTestDb() {
  return testDb
}
