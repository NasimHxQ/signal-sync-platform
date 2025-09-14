import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser, updateUserPreferences } from "@/lib/server/services/user"
import { UpdatePreferencesSchema, validateBody } from "@/lib/server/validation"
import { createErrorResponse, createValidationError } from "@/lib/server/errors"
import { logger, generateRequestId } from "@/lib/server/logger"
import type { UserPreferences, UpdatePreferencesResponse } from "@/lib/server/types"

export async function GET(request: NextRequest) {
  const reqId = generateRequestId()
  const startTime = Date.now()

  try {
    logger.info("Fetching user preferences", {}, reqId)

    // Get current user with preferences
    const user = await getCurrentUser()
    const preferences = user.preferences

    const duration = Date.now() - startTime
    logger.request(reqId, "GET", "/api/me/preferences", 200, duration, { 
      userId: user.id
    })

    return NextResponse.json<{ preferences: UserPreferences }>({ preferences: preferences! })

  } catch (error) {
    const duration = Date.now() - startTime
    
    logger.error("Error fetching user preferences", { error: error instanceof Error ? error.message : String(error) }, reqId)
    logger.request(reqId, "GET", "/api/me/preferences", 500, duration)
    
    return createErrorResponse(error)
  }
}

export async function PATCH(request: NextRequest) {
  const reqId = generateRequestId()
  const startTime = Date.now()

  try {
    // Parse request body
    const body = await request.json()

    // Validate request body
    const preferencesData = validateBody(UpdatePreferencesSchema, body)

    logger.info("Updating user preferences", { 
      hasDisplay: !!preferencesData.display,
      hasTrading: !!preferencesData.trading
    }, reqId)

    // Update preferences via service
    const result = await updateUserPreferences(preferencesData)

    const duration = Date.now() - startTime
    logger.request(reqId, "PATCH", "/api/me/preferences", 200, duration, { 
      updated: result.updated 
    })

    return NextResponse.json<UpdatePreferencesResponse>(result)

  } catch (error) {
    const duration = Date.now() - startTime
    
    if (error instanceof Error && error.message.includes("Validation failed")) {
      logger.request(reqId, "PATCH", "/api/me/preferences", 400, duration, { error: error.message })
      return createErrorResponse(createValidationError(error))
    }

    logger.error("Error updating preferences", { error: error instanceof Error ? error.message : String(error) }, reqId)
    logger.request(reqId, "PATCH", "/api/me/preferences", 500, duration)
    
    return createErrorResponse(error)
  }
}
