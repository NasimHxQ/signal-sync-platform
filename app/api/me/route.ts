import { NextRequest, NextResponse } from "next/server"
import { getUserProfile, updateAccount } from "@/lib/server/services/user"
import { UpdateAccountSchema, validateBody } from "@/lib/server/validation"
import { createErrorResponse, createValidationError } from "@/lib/server/errors"
import { logger, generateRequestId } from "@/lib/server/logger"
import type { MeResponse, UpdateAccountResponse } from "@/lib/server/types"

export async function GET(request: NextRequest) {
  const reqId = generateRequestId()
  const startTime = Date.now()

  try {
    logger.info("Fetching user profile", {}, reqId)

    // Get user profile from service
    const result = await getUserProfile()

    const duration = Date.now() - startTime
    logger.request(reqId, "GET", "/api/me", 200, duration, { 
      userId: result.user.id,
      providersCount: result.providers.length 
    })

    return NextResponse.json<MeResponse>(result)

  } catch (error) {
    const duration = Date.now() - startTime
    
    logger.error("Error fetching user profile", { error: error instanceof Error ? error.message : String(error) }, reqId)
    logger.request(reqId, "GET", "/api/me", 500, duration)
    
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
    const accountData = validateBody(UpdateAccountSchema, body)

    logger.info("Updating account", { 
      hasFirstName: !!accountData.firstName,
      hasLastName: !!accountData.lastName,
      hasEmail: !!accountData.email,
      hasTimezone: !!accountData.timezone
    }, reqId)

    // Update account via service
    const result = await updateAccount(accountData)

    const duration = Date.now() - startTime
    logger.request(reqId, "PATCH", "/api/me", 200, duration, { 
      userId: result.user.id,
      updated: result.updated 
    })

    return NextResponse.json<UpdateAccountResponse>(result)

  } catch (error) {
    const duration = Date.now() - startTime
    
    if (error instanceof Error && error.message.includes("Validation failed")) {
      logger.request(reqId, "PATCH", "/api/me", 400, duration, { error: error.message })
      return createErrorResponse(createValidationError(error))
    }

    logger.error("Error updating account", { error: error instanceof Error ? error.message : String(error) }, reqId)
    logger.request(reqId, "PATCH", "/api/me", 500, duration)
    
    return createErrorResponse(error)
  }
}
