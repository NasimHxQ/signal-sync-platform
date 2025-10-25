import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/server/db'
import { z } from 'zod'
import { logger } from '@/lib/server/logger'
import { ApiErrorClass, createErrorResponse } from '@/lib/server/errors'

const waitlistSchema = z.object({
  email: z.string().email('Invalid email address'),
  name: z.string().min(1, 'Name is required').optional(),
})

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  const reqId = crypto.randomUUID()

  try {
    const body = await request.json()
    const validated = waitlistSchema.parse(body)

    // Check if email already exists
    const existing = await db.waitlistEntry.findUnique({
      where: { email: validated.email }
    })

    if (existing) {
      logger.request(reqId, 'POST', '/api/waitlist', 409, Date.now() - startTime)

      return NextResponse.json(
        { error: { code: 'AlreadyRegistered', message: 'Email already registered' } },
        { status: 409 }
      )
    }

    // Create waitlist entry
    const entry = await db.waitlistEntry.create({
      data: {
        email: validated.email,
        name: validated.name,
        source: 'landing_page',
      }
    })

    // Get position in waitlist
    const position = await db.waitlistEntry.count()

    logger.request(reqId, 'POST', '/api/waitlist', 200, Date.now() - startTime, {
      email: validated.email
    })

    return NextResponse.json({
      success: true,
      message: 'Successfully joined waitlist!',
      position
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.request(reqId, 'POST', '/api/waitlist', 400, Date.now() - startTime)

      return NextResponse.json(
        { error: { code: 'ValidationError', message: error.errors[0].message } },
        { status: 400 }
      )
    }

    logger.request(reqId, 'POST', '/api/waitlist', 500, Date.now() - startTime)
    logger.error('Waitlist creation failed', { error: error instanceof Error ? error.message : 'Unknown error' }, reqId)

    if (error instanceof ApiErrorClass) {
      return createErrorResponse(error)
    }

    return NextResponse.json(
      { error: { code: 'InternalError', message: 'Failed to join waitlist' } },
      { status: 500 }
    )
  }
}

// Get waitlist count (optional - for displaying on landing page)
export async function GET(request: NextRequest) {
  const startTime = Date.now()
  const reqId = crypto.randomUUID()

  try {
    const count = await db.waitlistEntry.count()
    
    logger.request(reqId, 'GET', '/api/waitlist', 200, Date.now() - startTime, { count })

    return NextResponse.json({ count })
  } catch (error) {
    logger.request(reqId, 'GET', '/api/waitlist', 500, Date.now() - startTime)
    logger.error('Failed to get waitlist count', { error: error instanceof Error ? error.message : 'Unknown error' }, reqId)

    return NextResponse.json({ count: 0 })
  }
}

