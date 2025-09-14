import { db } from '../db'
import type { CreateFilterRequest, CreateFilterResponse } from "../types"

const DEMO_USER_EMAIL = 'demo@signalsync.app'

export async function createFilter(request: CreateFilterRequest): Promise<CreateFilterResponse> {
  try {
    // Get or create demo user
    const user = await db.user.upsert({
      where: { email: DEMO_USER_EMAIL },
      update: {},
      create: {
        email: DEMO_USER_EMAIL,
        name: 'Demo User',
      },
    })

    // Create filter in database
    const filter = await db.savedFilter.create({
      data: {
        userId: user.id,
        name: request.name,
        criteria: request.criteria,
      },
    })

    return {
      id: filter.id,
      name: filter.name,
      criteria: filter.criteria as CreateFilterRequest['criteria'],
      createdAt: filter.createdAt.toISOString(),
    }
  } catch (error) {
    console.error('Error creating filter in database:', error)
    
    // Fallback to generating a mock response on database error
    return {
      id: `filter_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
      name: request.name,
      criteria: request.criteria,
      createdAt: new Date().toISOString(),
    }
  }
}

export async function getFilters(): Promise<CreateFilterResponse[]> {
  try {
    // Get demo user
    const user = await db.user.findUnique({
      where: { email: DEMO_USER_EMAIL },
    })

    if (!user) {
      return []
    }

    // Get user's filters from database
    const filters = await db.savedFilter.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
    })

    return filters.map(filter => ({
      id: filter.id,
      name: filter.name,
      criteria: filter.criteria as CreateFilterRequest['criteria'],
      createdAt: filter.createdAt.toISOString(),
    }))
  } catch (error) {
    console.error('Error fetching filters from database:', error)
    return []
  }
}

export async function getFilter(id: string): Promise<CreateFilterResponse | null> {
  try {
    const filter = await db.savedFilter.findUnique({
      where: { id },
    })

    if (!filter) {
      return null
    }

    return {
      id: filter.id,
      name: filter.name,
      criteria: filter.criteria as CreateFilterRequest['criteria'],
      createdAt: filter.createdAt.toISOString(),
    }
  } catch (error) {
    console.error('Error fetching filter from database:', error)
    return null
  }
}

export async function deleteFilter(id: string): Promise<boolean> {
  try {
    await db.savedFilter.delete({
      where: { id },
    })
    return true
  } catch (error) {
    console.error('Error deleting filter from database:', error)
    return false
  }
}