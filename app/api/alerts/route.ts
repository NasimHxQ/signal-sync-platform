import { NextRequest, NextResponse } from "next/server"
import { AlertSettingsSchema, validateBody } from "@/lib/server/validation"
import { saveAlertSettings } from "@/lib/server/services/alerts"
import { createErrorResponse, createValidationError } from "@/lib/server/errors"
import { logger, generateRequestId } from "@/lib/server/logger"
import type { SaveAlertsResponse } from "@/lib/server/types"

export async function POST(request: NextRequest) {
  const reqId = generateRequestId()
  const startTime = Date.now()

  try {
    // Parse request body
    const body = await request.json()

    // Validate request body
    const alertSettings = validateBody(AlertSettingsSchema, body)

    logger.info("Saving alert settings", { 
      enabledMethods: [
        alertSettings.email?.enabled && "email",
        alertSettings.telegram?.enabled && "telegram", 
        alertSettings.browser?.enabled && "browser",
        alertSettings.sms?.enabled && "sms"
      ].filter(Boolean)
    }, reqId)

    // Save alert settings via service
    const result = await saveAlertSettings(alertSettings)

    const duration = Date.now() - startTime
    logger.request(reqId, "POST", "/api/alerts", 200, duration, { 
      saved: result.saved,
      updatedAt: result.updatedAt 
    })

    return NextResponse.json<SaveAlertsResponse>(result)

  } catch (error) {
    const duration = Date.now() - startTime
    
    if (error instanceof Error && error.message.includes("Validation failed")) {
      logger.request(reqId, "POST", "/api/alerts", 400, duration, { error: error.message })
      return createErrorResponse(createValidationError(error))
    }

    logger.error("Error saving alert settings", { error: error instanceof Error ? error.message : String(error) }, reqId)
    logger.request(reqId, "POST", "/api/alerts", 500, duration)
    
    return createErrorResponse(error)
  }
}
