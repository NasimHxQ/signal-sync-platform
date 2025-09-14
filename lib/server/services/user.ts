import { db } from '../db'
import type { User, MeResponse, Provider, UpdateAccountRequest, UpdateAccountResponse, UpdatePasswordRequest, UpdatePasswordResponse, UserPreferences, UpdatePreferencesRequest, UpdatePreferencesResponse } from "../types"
import { getAlertSettings } from "./alerts"
import bcrypt from 'bcryptjs'

const DEMO_USER_EMAIL = 'demo@signalsync.app'

export async function getCurrentUser(): Promise<User> {
  try {
    const user = await db.user.findUnique({
      where: { email: DEMO_USER_EMAIL },
    })

    if (user) {
      return {
        id: user.id,
        name: user.name,
        email: user.email,
        firstName: user.firstName || undefined,
        lastName: user.lastName || undefined,
        timezone: user.timezone || undefined,
        preferences: user.preferences ? JSON.parse(user.preferences as string) : getDefaultPreferences(),
      }
    }

    // Return demo user if not found
    return {
      id: 'demo_user',
      name: 'Demo User',
      email: DEMO_USER_EMAIL,
      preferences: getDefaultPreferences(),
    }
  } catch (error) {
    console.error('Error fetching user from database:', error)
    
    // Fallback to demo user on database error
    return {
      id: 'demo_user',
      name: 'Demo User',
      email: DEMO_USER_EMAIL,
      preferences: getDefaultPreferences(),
    }
  }
}

export async function getUserProfile(): Promise<MeResponse> {
  try {
    // Fetch user data and related settings from database
    const [user, alerts, providersFromDb] = await Promise.all([
      getCurrentUser(),
      getAlertSettings(),
      db.provider.findMany({
        orderBy: { createdAt: 'desc' },
      }),
    ])

    // Convert providers to API format
    const providers = providersFromDb.map(provider => ({
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

    return {
      user,
      alerts,
      providers,
    }
  } catch (error) {
    console.error('Error fetching user profile from database:', error)
    
    // Fallback to basic profile on database error
    const user = await getCurrentUser()
    const alerts = await getAlertSettings()
    
    return {
      user,
      alerts,
      providers: [],
    }
  }
}

export async function updateAccount(request: UpdateAccountRequest): Promise<UpdateAccountResponse> {
  try {
    // Build update data
    const updateData: any = {}
    
    if (request.firstName !== undefined) updateData.firstName = request.firstName
    if (request.lastName !== undefined) updateData.lastName = request.lastName
    if (request.email !== undefined) updateData.email = request.email
    if (request.timezone !== undefined) updateData.timezone = request.timezone
    
    // Update name if firstName or lastName provided
    if (request.firstName || request.lastName) {
      const firstName = request.firstName || ''
      const lastName = request.lastName || ''
      updateData.name = `${firstName} ${lastName}`.trim() || 'User'
    }

    // If email is being updated, we need to handle the unique constraint
    const whereClause = request.email && request.email !== DEMO_USER_EMAIL 
      ? { email: DEMO_USER_EMAIL } 
      : { email: DEMO_USER_EMAIL }

    const updatedUser = await db.user.update({
      where: whereClause,
      data: updateData,
    })

    return {
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        firstName: updatedUser.firstName || undefined,
        lastName: updatedUser.lastName || undefined,
        timezone: updatedUser.timezone || undefined,
      },
      updated: true,
      updatedAt: new Date().toISOString(),
    }
  } catch (error) {
    console.error('Error updating account in database:', error)
    throw new Error('Failed to update account')
  }
}

export async function updatePassword(request: UpdatePasswordRequest): Promise<UpdatePasswordResponse> {
  try {
    // Get the current user to verify their current password
    const user = await db.user.findUnique({
      where: { email: DEMO_USER_EMAIL },
    })

    if (!user) {
      throw new Error('User not found')
    }

    // Verify current password if user has one set
    if (user.passwordHash) {
      const currentPasswordValid = await bcrypt.compare(request.currentPassword, user.passwordHash)
      if (!currentPasswordValid) {
        throw new Error('Current password is incorrect')
      }
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(request.newPassword, 12)

    // Update password in database
    await db.user.update({
      where: { email: DEMO_USER_EMAIL },
      data: { 
        passwordHash: hashedPassword,
        updatedAt: new Date(),
      },
    })

    return {
      updated: true,
      updatedAt: new Date().toISOString(),
    }
  } catch (error) {
    console.error('Error updating password in database:', error)
    
    // Re-throw known errors with specific messages
    if (error instanceof Error) {
      if (error.message === 'Current password is incorrect' || error.message === 'User not found') {
        throw error
      }
    }
    
    throw new Error('Failed to update password')
  }
}

export async function updateUserPreferences(request: UpdatePreferencesRequest): Promise<UpdatePreferencesResponse> {
  try {
    // Get current user to merge preferences
    const currentUser = await getCurrentUser()
    const currentPrefs = currentUser.preferences || getDefaultPreferences()
    
    // Deep merge the preferences
    const updatedPrefs: UserPreferences = {
      display: {
        ...currentPrefs.display,
        ...(request.display || {}),
      },
      trading: {
        ...currentPrefs.trading,
        ...(request.trading || {}),
      },
    }

    // Update in database
    await db.user.update({
      where: { email: DEMO_USER_EMAIL },
      data: { 
        preferences: JSON.stringify(updatedPrefs),
        updatedAt: new Date(),
      },
    })

    return {
      preferences: updatedPrefs,
      updated: true,
      updatedAt: new Date().toISOString(),
    }
  } catch (error) {
    console.error('Error updating preferences in database:', error)
    throw new Error('Failed to update preferences')
  }
}

function getDefaultPreferences(): UserPreferences {
  return {
    display: {
      darkMode: false,
      compactView: false,
      defaultCurrency: 'usd',
    },
    trading: {
      defaultRiskLevel: 'medium',
      autoFollowSignals: false,
    },
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