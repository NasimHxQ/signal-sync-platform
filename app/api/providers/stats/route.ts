import { NextRequest, NextResponse } from "next/server"
import { ProviderStatsQuerySchema, validateQuery } from "@/lib/server/validation"
import { getProviderStats } from "@/lib/server/services/providers"
import { createErrorResponse, createValidationError } from "@/lib/server/errors"
import { logger, generateRequestId } from "@/lib/server/logger"
import type { ProviderStatsResponse } from "@/lib/server/types"

export async function GET(request: NextRequest) {
  const reqId = generateRequestId()
  const startTime = Date.now()

  try {
    // Parse query parameters
    const url = new URL(request.url)
    const queryParams = Object.fromEntries(url.searchParams.entries())

    // Validate query parameters
    const filters = validateQuery(ProviderStatsQuerySchema, queryParams)

    logger.info("Fetching provider stats", { filters }, reqId)

    // Get provider stats from service
    const result = await getProviderStats(filters)

    const duration = Date.now() - startTime
    logger.request(reqId, "GET", "/api/providers/stats", 200, duration, { 
      count: result.items.length,
      summary: filters.summary 
    })

    return NextResponse.json<ProviderStatsResponse>(result)

  } catch (error) {
    const duration = Date.now() - startTime
    
    if (error instanceof Error && error.message.includes("Validation failed")) {
      logger.request(reqId, "GET", "/api/providers/stats", 400, duration, { error: error.message })
      return createErrorResponse(createValidationError(error))
    }

    logger.error("Error fetching provider stats", { error: error instanceof Error ? error.message : String(error) }, reqId)
    logger.request(reqId, "GET", "/api/providers/stats", 500, duration)
    
    return createErrorResponse(error)
  }
}
