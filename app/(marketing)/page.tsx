import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Zap, Filter, Bell, BarChart3, Shield, Clock } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center px-4 md:px-6 max-w-7xl mx-auto">
          <div className="mr-4 flex">
            <Link href="/" className="mr-6 flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Zap className="h-4 w-4" />
              </div>
              <span className="font-bold">SignalSync</span>
            </Link>
          </div>
          <div className="flex flex-1 items-center justify-between">
            <nav className="hidden md:flex items-center space-x-8 text-sm font-medium ml-8">
              <Link href="#features" className="transition-colors hover:text-foreground/80">
                Features
              </Link>
              <Link href="#pricing" className="transition-colors hover:text-foreground/80">
                Pricing
              </Link>
              <Link href="#about" className="transition-colors hover:text-foreground/80">
                About
              </Link>
            </nav>
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/login">Sign In</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/dashboard">Get Started</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="space-y-6 pb-8 pt-6 md:pb-12 md:pt-10 lg:py-32">
          <div className="container flex max-w-[64rem] flex-col items-center gap-4 text-center mx-auto">
            <Badge variant="outline" className="text-sm">
              Unified Crypto Signal Hub
            </Badge>
            <h1 className="font-bold text-3xl sm:text-5xl md:text-6xl lg:text-7xl text-balance text-center">
              Never Miss a <span className="text-primary font-bold">Profitable Signal</span> Again
            </h1>
            <p className="max-w-[42rem] leading-normal text-muted-foreground sm:text-xl sm:leading-8 text-balance text-center mx-auto">
              Aggregate crypto trading signals from Discord, Telegram, Twitter/X, and premium groups. Filter noise,
              track performance, and get instant alerts for high-confidence trades.
            </p>
            <div className="flex flex-col gap-2 min-[400px]:flex-row justify-center">
              <Button size="lg" className="h-11 px-8" asChild>
                <Link href="/dashboard">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="h-11 px-8 bg-transparent" asChild>
                <Link href="#demo">View Demo</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="container space-y-6 py-8 md:py-12 lg:py-24 max-w-7xl mx-auto">
          <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center">
            <h2 className="font-bold text-3xl leading-[1.1] sm:text-3xl md:text-6xl">Features</h2>
            <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
              Everything you need to manage crypto signals efficiently and profitably.
            </p>
          </div>
          <div className="mx-auto grid justify-center gap-4 sm:grid-cols-2 md:max-w-[64rem] md:grid-cols-3">
            <Card className="relative overflow-hidden">
              <CardHeader>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Multi-Source Aggregation</CardTitle>
                <CardDescription>
                  Connect Discord, Telegram, Twitter/X, and premium signal groups in one unified dashboard.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="relative overflow-hidden">
              <CardHeader>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Filter className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Smart Filtering</CardTitle>
                <CardDescription>
                  Filter by coin, exchange, leverage, timeframe, and confidence level to focus on relevant signals.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="relative overflow-hidden">
              <CardHeader>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Bell className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Instant Alerts</CardTitle>
                <CardDescription>
                  Get notified via email, Telegram bot, or browser notifications the moment a signal matches your
                  criteria.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="relative overflow-hidden">
              <CardHeader>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <BarChart3 className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Performance Tracking</CardTitle>
                <CardDescription>
                  Track hit-rate and profitability of each signal provider to identify the most reliable sources.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="relative overflow-hidden">
              <CardHeader>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Clock className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Real-Time Processing</CardTitle>
                <CardDescription>
                  Signals are processed and delivered within seconds, ensuring you never miss time-sensitive
                  opportunities.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="relative overflow-hidden">
              <CardHeader>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Risk Management</CardTitle>
                <CardDescription>
                  Built-in risk assessment tools help you evaluate signal quality and manage position sizing.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </section>

        {/* Problem/Solution Section */}
        <section className="container space-y-6 py-8 md:py-12 lg:py-24 bg-muted/50 max-w-7xl mx-auto">
          <div className="mx-auto max-w-[58rem] space-y-8">
            <div className="text-center space-y-4">
              <h2 className="font-bold text-3xl leading-[1.1] sm:text-3xl md:text-6xl">
                Stop Losing Money to Signal Chaos
              </h2>
              <p className="max-w-[85%] mx-auto leading-normal text-muted-foreground sm:text-lg sm:leading-7">
                Traders waste hours jumping between platforms and miss profitable signals buried in noise.
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-2">
              <Card className="border-destructive/20">
                <CardHeader>
                  <CardTitle className="text-destructive">The Problem</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="h-2 w-2 rounded-full bg-destructive mt-2 flex-shrink-0" />
                    <p className="text-sm">Signals scattered across multiple Discord servers and Telegram groups</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="h-2 w-2 rounded-full bg-destructive mt-2 flex-shrink-0" />
                    <p className="text-sm">Important signals buried in chat noise and spam</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="h-2 w-2 rounded-full bg-destructive mt-2 flex-shrink-0" />
                    <p className="text-sm">No way to track which signal providers are actually profitable</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="h-2 w-2 rounded-full bg-destructive mt-2 flex-shrink-0" />
                    <p className="text-sm">Manual monitoring leads to missed opportunities and delayed entries</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-primary/20">
                <CardHeader>
                  <CardTitle className="text-primary">Our Solution</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="h-2 w-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                    <p className="text-sm">Unified dashboard aggregating all your signal sources</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="h-2 w-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                    <p className="text-sm">AI-powered filtering to surface only relevant, high-quality signals</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="h-2 w-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                    <p className="text-sm">Performance analytics to identify the most profitable signal providers</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="h-2 w-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                    <p className="text-sm">Instant alerts ensure you never miss a profitable opportunity</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="container space-y-6 py-8 md:py-12 lg:py-24 max-w-7xl mx-auto">
          <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center">
            <h2 className="font-bold text-3xl leading-[1.1] sm:text-3xl md:text-6xl">
              Ready to Maximize Your Trading Profits?
            </h2>
            <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
              Join thousands of traders who have streamlined their signal management and increased their profitability.
            </p>
            <div className="flex flex-col gap-2 min-[400px]:flex-row">
              <Button size="lg" className="h-11 px-8" asChild>
                <Link href="/dashboard">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="h-11 px-8 bg-transparent" asChild>
                <Link href="#contact">Contact Sales</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t py-6 md:py-0">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row px-4 md:px-6 max-w-7xl mx-auto">
          <div className="flex flex-col items-center gap-4 md:flex-row md:gap-2">
            <div className="flex items-center space-x-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Zap className="h-3 w-3" />
              </div>
              <span className="font-bold">SignalSync</span>
            </div>
            <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
              Built for crypto traders, by crypto traders.
            </p>
          </div>
          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
            <Link href="/privacy">Privacy</Link>
            <Link href="/terms">Terms</Link>
            <Link href="/contact">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
