import { NextRequest, NextResponse } from "next/server"
import { SignalsQuerySchema, validateQuery } from "@/lib/server/validation"
import { getSignals } from "@/lib/server/services/signals"
import { createErrorResponse, createValidationError } from "@/lib/server/errors"
import { logger, generateRequestId } from "@/lib/server/logger"
import type { SignalsResponse } from "@/lib/server/types"

export async function GET(request: NextRequest) {
  const reqId = generateRequestId()
  const startTime = Date.now()

  try {
    // Parse query parameters
    const url = new URL(request.url)
    const queryParams = Object.fromEntries(url.searchParams.entries())

    // Validate query parameters
    const filters = validateQuery(SignalsQuerySchema, queryParams)

    logger.info("Fetching signals", { filters }, reqId)

    // Get signals from service
    const result = await getSignals(filters)

    const duration = Date.now() - startTime
    logger.request(reqId, "GET", "/api/signals", 200, duration, { 
      count: result.items.length,
      hasNextCursor: !!result.nextCursor 
    })

    return NextResponse.json<SignalsResponse>(result)

  } catch (error) {
    const duration = Date.now() - startTime
    
    if (error instanceof Error && error.message.includes("Validation failed")) {
      logger.request(reqId, "GET", "/api/signals", 400, duration, { error: error.message })
      return createErrorResponse(createValidationError(error))
    }

    logger.error("Error fetching signals", { error: error instanceof Error ? error.message : String(error) }, reqId)
    logger.request(reqId, "GET", "/api/signals", 500, duration)
    
    return createErrorResponse(error)
  }
}
