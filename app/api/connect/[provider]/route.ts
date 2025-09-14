import { NextRequest, NextResponse } from "next/server"
import { ConnectProviderSchema, ProviderParamSchema, validateBody } from "@/lib/server/validation"
import { connectProvider } from "@/lib/server/services/providers"
import { createErrorResponse, createValidationError, BadRequestError } from "@/lib/server/errors"
import { logger, generateRequestId } from "@/lib/server/logger"
import type { ConnectProviderResponse } from "@/lib/server/types"

export async function POST(
  request: NextRequest,
  { params }: { params: { provider: string } }
) {
  const reqId = generateRequestId()
  const startTime = Date.now()

  try {
    // Validate provider parameter
    const { provider } = ProviderParamSchema.parse({ provider: params.provider })

    // Parse request body
    const body = await request.json()

    // Validate request body
    const providerData = validateBody(ConnectProviderSchema, body)

    logger.info("Connecting provider", { 
      provider,
      name: providerData.name,
      hasCredentials: Object.keys(providerData.credentials).length > 0
    }, reqId)

    // Connect provider via service
    const result = await connectProvider(provider, providerData)

    const duration = Date.now() - startTime
    logger.request(reqId, "POST", `/api/connect/${provider}`, 201, duration, { 
      providerId: result.id,
      status: result.status 
    })

    return NextResponse.json<ConnectProviderResponse>(result, { status: 201 })

  } catch (error) {
    const duration = Date.now() - startTime
    
    if (error instanceof Error && error.message.includes("Validation failed")) {
      logger.request(reqId, "POST", `/api/connect/${params.provider}`, 400, duration, { error: error.message })
      return createErrorResponse(createValidationError(error))
    }

    logger.error("Error connecting provider", { 
      provider: params.provider,
      error: error instanceof Error ? error.message : String(error) 
    }, reqId)
    logger.request(reqId, "POST", `/api/connect/${params.provider}`, 500, duration)
    
    return createErrorResponse(error)
  }
}
