import { PrismaClient } from '@/lib/generated/prisma'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Ensure tests use the dedicated test database regardless of external env
const isTestEnv = process.env.NODE_ENV === 'test'
const prisma = new PrismaClient(
  isTestEnv
    ? { datasources: { db: { url: 'file:./test.db' } } }
    : undefined,
)

export const db = globalForPrisma.prisma ?? prisma

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
