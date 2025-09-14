"use client"

import type * as React from "react"
import { BarChart3, Bell, Filter, Home, Settings, TrendingUp, Zap, Search, Target, Activity } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  collapsed?: boolean
}

export function AppSidebar({ className, collapsed = false }: SidebarProps) {
  const navigation = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: Home,
      current: true,
    },
    {
      name: "Live Signals",
      href: "/dashboard/signals",
      icon: Zap,
      current: false,
      badge: "12",
    },
    {
      name: "Analytics",
      href: "/dashboard/analytics",
      icon: BarChart3,
      current: false,
    },
    {
      name: "Watchlist",
      href: "/dashboard/watchlist",
      icon: Target,
      current: false,
    },
    {
      name: "Performance",
      href: "/dashboard/performance",
      icon: TrendingUp,
      current: false,
    },
  ]

  const tools = [
    {
      name: "Signal Scanner",
      href: "/dashboard/scanner",
      icon: Search,
    },
    {
      name: "Filters",
      href: "/dashboard/filters",
      icon: Filter,
    },
    {
      name: "Alerts",
      href: "/dashboard/alerts",
      icon: Bell,
      badge: "3",
    },
    {
      name: "Activity",
      href: "/dashboard/activity",
      icon: Activity,
    },
  ]

  return (
    <div className={cn("flex h-full flex-col border-r bg-sidebar", collapsed ? "w-16" : "w-64", className)}>
      <div className="flex h-14 items-center border-b px-4">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Zap className="h-4 w-4" />
            </div>
            <span className="font-semibold">SignalSync</span>
          </div>
        )}
        {collapsed && (
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground mx-auto">
            <Zap className="h-4 w-4" />
          </div>
        )}
      </div>

      <ScrollArea className="flex-1">
        <div className="space-y-4 py-4">
          <div className="px-3 py-2">
            {!collapsed && <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">Navigation</h2>}
            <div className="space-y-1">
              {navigation.map((item) => (
                <Button
                  key={item.name}
                  variant={item.current ? "secondary" : "ghost"}
                  className={cn("w-full justify-start", collapsed && "px-2")}
                  asChild
                >
                  <a href={item.href}>
                    <item.icon className={cn("h-4 w-4", !collapsed && "mr-2")} />
                    {!collapsed && (
                      <>
                        {item.name}
                        {item.badge && (
                          <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                            {item.badge}
                          </span>
                        )}
                      </>
                    )}
                  </a>
                </Button>
              ))}
            </div>
          </div>

          <Separator />

          <div className="px-3 py-2">
            {!collapsed && <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">Tools</h2>}
            <div className="space-y-1">
              {tools.map((item) => (
                <Button
                  key={item.name}
                  variant="ghost"
                  className={cn("w-full justify-start", collapsed && "px-2")}
                  asChild
                >
                  <a href={item.href}>
                    <item.icon className={cn("h-4 w-4", !collapsed && "mr-2")} />
                    {!collapsed && (
                      <>
                        {item.name}
                        {item.badge && (
                          <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-xs text-destructive-foreground">
                            {item.badge}
                          </span>
                        )}
                      </>
                    )}
                  </a>
                </Button>
              ))}
            </div>
          </div>
        </div>
      </ScrollArea>

      <div className="border-t p-4">
        <Button variant="ghost" className={cn("w-full justify-start", collapsed && "px-2")} asChild>
          <a href="/dashboard/settings">
            <Settings className={cn("h-4 w-4", !collapsed && "mr-2")} />
            {!collapsed && "Settings"}
          </a>
        </Button>
      </div>
    </div>
  )
}
