import { NextRequest, NextResponse } from "next/server"
import { CreateFilterSchema, validateBody } from "@/lib/server/validation"
import { createFilter } from "@/lib/server/services/filters"
import { createErrorResponse, createValidationError } from "@/lib/server/errors"
import { logger, generateRequestId } from "@/lib/server/logger"
import type { CreateFilterResponse } from "@/lib/server/types"

export async function POST(request: NextRequest) {
  const reqId = generateRequestId()
  const startTime = Date.now()

  try {
    // Parse request body
    const body = await request.json()

    // Validate request body
    const filterData = validateBody(CreateFilterSchema, body)

    logger.info("Creating filter", { name: filterData.name }, reqId)

    // Create filter via service
    const result = await createFilter(filterData)

    const duration = Date.now() - startTime
    logger.request(reqId, "POST", "/api/filters", 201, duration, { 
      filterId: result.id,
      name: result.name 
    })

    return NextResponse.json<CreateFilterResponse>(result, { status: 201 })

  } catch (error) {
    const duration = Date.now() - startTime
    
    if (error instanceof Error && error.message.includes("Validation failed")) {
      logger.request(reqId, "POST", "/api/filters", 400, duration, { error: error.message })
      return createErrorResponse(createValidationError(error))
    }

    logger.error("Error creating filter", { error: error instanceof Error ? error.message : String(error) }, reqId)
    logger.request(reqId, "POST", "/api/filters", 500, duration)
    
    return createErrorResponse(error)
  }
}
