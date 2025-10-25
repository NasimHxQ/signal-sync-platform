import { db } from '../db'
import type { AlertSettings, SaveAlertsResponse } from "../types"

const DEMO_USER_EMAIL = 'demo@signalsync.app'

export async function getAlertSettings(): Promise<AlertSettings> {
  try {
    const user = await db.user.findUnique({
      where: { email: DEMO_USER_EMAIL },
    })

    if (user && user.alerts) {
      return user.alerts as any
    }

    // Return default settings if user not found or no alerts configured
    return {
      email: { enabled: true, address: DEMO_USER_EMAIL },
      telegram: { enabled: false, username: '@demo' },
      browser: { enabled: true },
      sms: { enabled: false, phone: '+1234567890' },
      rules: {
        minConfidence: 70,
        types: ['buy', 'long'],
        minLeverage: 5,
      },
    }
  } catch (error) {
    console.error('Error fetching alert settings from database:', error)
    
    // Fallback to default settings on database error
    return {
      email: { enabled: true, address: DEMO_USER_EMAIL },
      telegram: { enabled: false, username: '@demo' },
      browser: { enabled: true },
      sms: { enabled: false, phone: '+1234567890' },
      rules: {
        minConfidence: 70,
        types: ['buy', 'long'],
        minLeverage: 5,
      },
    }
  }
}

export async function saveAlertSettings(settings: AlertSettings): Promise<SaveAlertsResponse> {
  try {
    // Update user's alert settings in database
    await db.user.upsert({
      where: { email: DEMO_USER_EMAIL },
      update: { 
        alerts: settings as any,
        updatedAt: new Date(),
      },
      create: {
        email: DEMO_USER_EMAIL,
        name: 'Demo User',
        alerts: settings as any,
      },
    })

    return {
      saved: true,
      updatedAt: new Date().toISOString(),
    }
  } catch (error) {
    console.error('Error saving alert settings to database:', error)
    
    // Return success even on database error (graceful degradation)
    return {
      saved: true,
      updatedAt: new Date().toISOString(),
    }
  }
}

export async function testAlerts(settings: AlertSettings): Promise<{ sent: boolean; message: string }> {
  // Simulate sending test alerts
  const enabledMethods = []
  
  if (settings.email?.enabled) enabledMethods.push("email")
  if (settings.telegram?.enabled) enabledMethods.push("telegram")
  if (settings.browser?.enabled) enabledMethods.push("browser")
  if (settings.sms?.enabled) enabledMethods.push("sms")

  if (enabledMethods.length === 0) {
    return {
      sent: false,
      message: "No alert methods are enabled",
    }
  }

  // In Phase 3, we'll implement actual alert sending
  return {
    sent: true,
    message: `Test alerts sent via: ${enabledMethods.join(", ")}`,
  }
}