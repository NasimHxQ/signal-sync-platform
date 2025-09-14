import { NextRequest, NextResponse } from "next/server"
import { updatePassword } from "@/lib/server/services/user"
import { UpdatePasswordSchema, validateBody } from "@/lib/server/validation"
import { createErrorResponse, createValidationError } from "@/lib/server/errors"
import { logger, generateRequestId } from "@/lib/server/logger"
import type { UpdatePasswordResponse } from "@/lib/server/types"

export async function POST(request: NextRequest) {
  const reqId = generateRequestId()
  const startTime = Date.now()

  try {
    // Parse request body
    const body = await request.json()

    // Validate request body
    const passwordData = validateBody(UpdatePasswordSchema, body)

    logger.info("Updating password", {}, reqId)

    // Update password via service
    const result = await updatePassword(passwordData)

    const duration = Date.now() - startTime
    logger.request(reqId, "POST", "/api/me/password", 200, duration, { 
      updated: result.updated 
    })

    return NextResponse.json<UpdatePasswordResponse>(result)

  } catch (error) {
    const duration = Date.now() - startTime
    
    if (error instanceof Error) {
      if (error.message.includes("Validation failed")) {
        logger.request(reqId, "POST", "/api/me/password", 400, duration, { error: error.message })
        return createErrorResponse(createValidationError(error))
      }
      
      if (error.message === "Current password is incorrect") {
        logger.request(reqId, "POST", "/api/me/password", 401, duration, { error: "Invalid current password" })
        return NextResponse.json({ error: { code: "INVALID_PASSWORD", message: "Current password is incorrect" } }, { status: 401 })
      }
      
      if (error.message === "User not found") {
        logger.request(reqId, "POST", "/api/me/password", 404, duration, { error: "User not found" })
        return NextResponse.json({ error: { code: "USER_NOT_FOUND", message: "User not found" } }, { status: 404 })
      }
    }

    logger.error("Error updating password", { error: error instanceof Error ? error.message : String(error) }, reqId)
    logger.request(reqId, "POST", "/api/me/password", 500, duration)
    
    return createErrorResponse(error)
  }
}
