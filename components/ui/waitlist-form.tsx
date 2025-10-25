"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export function WaitlistForm() {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [position, setPosition] = useState<number | null>(null)

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
      setPosition(result.position)
      
      // Reset form
      e.currentTarget.reset()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="w-full max-w-md space-y-4 pt-4 text-center">
        <div className="rounded-lg bg-primary/10 p-6 space-y-2">
          <div className="text-4xl">🎉</div>
          <h3 className="text-xl font-semibold text-primary">You're on the list!</h3>
          {position && (
            <p className="text-muted-foreground">
              You're #{position} in line for early access
            </p>
          )}
          <p className="text-sm text-muted-foreground">
            We'll email you when SignalSync launches with your exclusive early access link.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setSuccess(false)}
          className="mx-auto"
        >
          Add another person
        </Button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md space-y-4 pt-4">
      <div className="flex flex-col gap-3">
        <input
          type="text"
          name="name"
          placeholder="Your Name"
          required
          disabled={loading}
          className="flex h-11 w-full rounded-md border border-input bg-background px-4 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        />
        <input
          type="email"
          name="email"
          placeholder="your@email.com"
          required
          disabled={loading}
          className="flex h-11 w-full rounded-md border border-input bg-background px-4 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        />
      </div>
      {error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}
      <Button type="submit" size="lg" className="w-full h-11" disabled={loading}>
        {loading ? 'Joining...' : 'Join Waitlist'}
        {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
      </Button>
      <p className="text-xs text-muted-foreground">
        🎁 Early members get <span className="font-semibold text-primary">50% lifetime discount</span> on premium features
      </p>
    </form>
  )
}

