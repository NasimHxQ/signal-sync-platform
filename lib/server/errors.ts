import { NextResponse } from "next/server"
import type { ApiError, ErrorResponse } from "./types"

export class ApiErrorClass extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode: number = 500,
    public details?: Record<string, unknown>
  ) {
    super(message)
    this.name = "ApiError"
  }
}

// Common error constructors
export const BadRequestError = (message: string, details?: Record<string, unknown>) =>
  new ApiErrorClass("BadRequest", message, 400, details)

export const NotFoundError = (message: string = "Resource not found") =>
  new ApiErrorClass("NotFound", message, 404)

export const ValidationError = (message: string, details?: Record<string, unknown>) =>
  new ApiErrorClass("ValidationError", message, 400, details)

export const InternalServerError = (message: string = "Internal server error") =>
  new ApiErrorClass("InternalServerError", message, 500)

export const RateLimitError = (message: string = "Rate limit exceeded") =>
  new ApiErrorClass("RateLimitExceeded", message, 429)

// Convert error to API response
export function createErrorResponse(error: unknown): NextResponse<ErrorResponse> {
  let apiError: ApiError

  if (error instanceof ApiErrorClass) {
    apiError = {
      code: error.code,
      message: error.message,
      details: error.details,
    }
    return NextResponse.json({ error: apiError }, { status: error.statusCode })
  }

  if (error instanceof Error) {
    // Don't expose internal error details in production
    const message = process.env.NODE_ENV === "development" ? error.message : "Internal server error"
    apiError = {
      code: "InternalServerError",
      message,
    }
    return NextResponse.json({ error: apiError }, { status: 500 })
  }

  // Unknown error type
  apiError = {
    code: "InternalServerError",
    message: "An unexpected error occurred",
  }
  return NextResponse.json({ error: apiError }, { status: 500 })
}

// Validation error helper
export function createValidationError(zodError: any): ApiErrorClass {
  const details: Record<string, unknown> = {}
  
  if (zodError.issues) {
    for (const issue of zodError.issues) {
      const path = issue.path.join(".")
      details[path] = issue.message
    }
  }

  return new ApiErrorClass("ValidationError", "Invalid input data", 400, details)
}
