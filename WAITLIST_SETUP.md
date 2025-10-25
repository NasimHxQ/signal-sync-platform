# Waitlist Implementation Guide

This guide helps you convert the current full-application dashboard into a waitlist landing page for validation before building out the full application.

---

## Option 1: Quick Waitlist (Minimal Changes)

### 1. Modify the Marketing Page CTAs

Update `/app/(marketing)/page.tsx` to point to a waitlist form instead of the dashboard:

```typescript
// Change line 61-64 from:
<Link href="/dashboard">
  Start Free Trial
  <ArrowRight className="ml-2 h-4 w-4" />
</Link>

// To:
<Link href="#waitlist">
  Join Waitlist
  <ArrowRight className="ml-2 h-4 w-4" />
</Link>
```

### 2. Add Waitlist Section to Marketing Page

Add this section before the footer in `/app/(marketing)/page.tsx`:

```typescript
{/* Waitlist Section */}
<section id="waitlist" className="container space-y-6 py-8 md:py-12 lg:py-24 max-w-7xl mx-auto">
  <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center">
    <h2 className="font-bold text-3xl leading-[1.1] sm:text-3xl md:text-6xl">
      Join the Waitlist
    </h2>
    <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
      Be the first to know when SignalSync launches. Early access members get exclusive features and lifetime discounts.
    </p>
    <form className="w-full max-w-md space-y-4" action="/api/waitlist" method="POST">
      <div className="flex flex-col gap-2">
        <input
          type="text"
          name="name"
          placeholder="Your Name"
          required
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        />
        <input
          type="email"
          name="email"
          placeholder="your@email.com"
          required
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        />
      </div>
      <button
        type="submit"
        className="inline-flex h-10 w-full items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground"
      >
        Join Waitlist
      </button>
    </form>
  </div>
</section>
```

### 3. Add Waitlist Database Schema

Update `/prisma/schema.prisma` to add the waitlist model:

```prisma
model WaitlistEntry {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  source    String?  // e.g., "landing_page", "referral"
  metadata  Json?    // Store additional info like referrer, utm params
  createdAt DateTime @default(now())
  notified  Boolean  @default(false)
  
  @@index([createdAt])
  @@map("waitlist_entries")
}
```

Then run:
```bash
npx prisma db push
npx prisma generate
```

### 4. Create Waitlist API Endpoint

Create `/app/api/waitlist/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/server/db'
import { z } from 'zod'

const waitlistSchema = z.object({
  email: z.string().email('Invalid email address'),
  name: z.string().min(1, 'Name is required').optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validated = waitlistSchema.parse(body)

    // Check if email already exists
    const existing = await db.waitlistEntry.findUnique({
      where: { email: validated.email }
    })

    if (existing) {
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

    return NextResponse.json({
      success: true,
      message: 'Successfully joined waitlist!',
      position: await db.waitlistEntry.count()
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: { code: 'ValidationError', message: error.errors[0].message } },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: { code: 'InternalError', message: 'Failed to join waitlist' } },
      { status: 500 }
    )
  }
}

// Get waitlist count (optional - for displaying on landing page)
export async function GET() {
  try {
    const count = await db.waitlistEntry.count()
    return NextResponse.json({ count })
  } catch (error) {
    return NextResponse.json({ count: 0 })
  }
}
```

### 5. Block Dashboard Access (Optional)

If you want to prevent access to the dashboard during waitlist phase, add a middleware:

Create `/middleware.ts`:

```typescript
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Block access to dashboard during waitlist phase
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/#waitlist', request.url))
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: '/dashboard/:path*',
}
```

---

## Option 2: Dedicated Waitlist Page

### 1. Create Waitlist Page

Create `/app/(marketing)/waitlist/page.tsx`:

```typescript
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, Zap } from "lucide-react"
import Link from "next/link"

export default function WaitlistPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
        <div className="container flex h-14 items-center px-4 md:px-6 max-w-7xl mx-auto">
          <Link href="/" className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Zap className="h-4 w-4" />
            </div>
            <span className="font-bold">SignalSync</span>
          </Link>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold">Join the Waitlist</h1>
            <p className="text-muted-foreground">
              Be among the first to experience SignalSync when we launch.
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Early Access Benefits</CardTitle>
              <CardDescription>
                As an early member, you'll receive:
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-primary mt-0.5" />
                <p className="text-sm">Priority access when we launch</p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-primary mt-0.5" />
                <p className="text-sm">50% lifetime discount on premium features</p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-primary mt-0.5" />
                <p className="text-sm">Exclusive beta testing opportunities</p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-primary mt-0.5" />
                <p className="text-sm">Direct input on feature development</p>
              </div>
            </CardContent>
          </Card>

          <form className="space-y-4" action="/api/waitlist" method="POST">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">
                Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                placeholder="John Doe"
                required
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="john@example.com"
                required
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
            <Button type="submit" className="w-full">
              Join Waitlist
            </Button>
          </form>

          <p className="text-center text-xs text-muted-foreground">
            We respect your privacy. Unsubscribe at any time.
          </p>
        </div>
      </main>
    </div>
  )
}
```

### 2. Update Marketing Page CTAs

Update links in `/app/(marketing)/page.tsx`:

```typescript
// Change all /dashboard links to /waitlist
<Link href="/waitlist">Join Waitlist</Link>
```

---

## Option 3: Modal/Popup Waitlist

### 1. Create Waitlist Dialog Component

Create `/components/ui/waitlist-dialog.tsx`:

```typescript
"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function WaitlistDialog({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const data = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
    }

    try {
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error?.message || 'Failed to join waitlist')
      }

      setSuccess(true)
      setTimeout(() => setOpen(false), 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Join the Waitlist</DialogTitle>
          <DialogDescription>
            Be the first to know when SignalSync launches.
          </DialogDescription>
        </DialogHeader>
        
        {success ? (
          <div className="py-8 text-center">
            <p className="text-lg font-semibold text-green-600">
              🎉 You're on the list!
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              We'll email you when we launch.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" placeholder="John Doe" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" placeholder="john@example.com" required />
            </div>
            {error && (
              <p className="text-sm text-red-600">{error}</p>
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Joining...' : 'Join Waitlist'}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
```

### 2. Use in Marketing Page

Update `/app/(marketing)/page.tsx`:

```typescript
import { WaitlistDialog } from "@/components/ui/waitlist-dialog"

// Replace Button with WaitlistDialog
<WaitlistDialog>
  <Button size="lg" className="h-11 px-8">
    Start Free Trial
    <ArrowRight className="ml-2 h-4 w-4" />
  </Button>
</WaitlistDialog>
```

---

## Waitlist Analytics

### Track Waitlist Growth

Create `/app/api/admin/waitlist/route.ts` (protect with auth in production):

```typescript
import { NextResponse } from 'next/server'
import { db } from '@/lib/server/db'

export async function GET() {
  const total = await db.waitlistEntry.count()
  const last24h = await db.waitlistEntry.count({
    where: {
      createdAt: {
        gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
      }
    }
  })
  const last7days = await db.waitlistEntry.count({
    where: {
      createdAt: {
        gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      }
    }
  })

  return NextResponse.json({
    total,
    last24h,
    last7days,
    entries: await db.waitlistEntry.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50
    })
  })
}
```

---

## Exporting Waitlist Data

```typescript
// app/api/admin/waitlist/export/route.ts
import { NextResponse } from 'next/server'
import { db } from '@/lib/server/db'

export async function GET() {
  const entries = await db.waitlistEntry.findMany({
    orderBy: { createdAt: 'asc' }
  })

  const csv = [
    'Email,Name,Created At',
    ...entries.map(e => `${e.email},${e.name || ''},${e.createdAt.toISOString()}`)
  ].join('\n')

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': 'attachment; filename="waitlist.csv"'
    }
  })
}
```

---

## Email Notification (Future - Phase 3)

When ready to notify waitlist members:

```typescript
// Example structure for future implementation
async function notifyWaitlistMembers() {
  const entries = await db.waitlistEntry.findMany({
    where: { notified: false }
  })

  for (const entry of entries) {
    // Send email using your email service
    // await sendEmail({
    //   to: entry.email,
    //   subject: 'SignalSync is Live!',
    //   body: '...'
    // })

    await db.waitlistEntry.update({
      where: { id: entry.id },
      data: { notified: true }
    })
  }
}
```

---

## Testing Your Waitlist

1. **Submit a test entry**:
   ```bash
   curl -X POST http://localhost:3000/api/waitlist \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","name":"Test User"}'
   ```

2. **Check database**:
   ```bash
   npx prisma studio
   # Navigate to WaitlistEntry table
   ```

3. **Test duplicate prevention**:
   Submit the same email twice - should receive error

4. **Test form validation**:
   Submit invalid email - should receive validation error

---

## Recommended: Option 1 (Quick Waitlist)

For fastest deployment to get validation, I recommend **Option 1** because:

- ✅ Minimal code changes
- ✅ Uses existing landing page
- ✅ Simple form submission
- ✅ Easy to track signups
- ✅ Can keep dashboard accessible for demos

You can always upgrade to Option 2 or 3 later!

---

**Next Steps:**
1. Choose your waitlist option
2. Implement the code changes
3. Test locally
4. Deploy using the deployment checklist
5. Share your landing page and collect signups!

