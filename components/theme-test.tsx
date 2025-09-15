"use client"

import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Sun, Moon, Monitor } from "lucide-react"

export function ThemeTest() {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <div>Loading theme test...</div>
  }

  return (
    <div className="space-y-6 p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Theme System Test
            <Badge variant={resolvedTheme === "dark" ? "default" : "secondary"}>
              {resolvedTheme}
            </Badge>
          </CardTitle>
          <CardDescription>
            Test the theme system functionality and visual consistency
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <Button
              variant={theme === "light" ? "default" : "outline"}
              onClick={() => setTheme("light")}
              className="flex items-center gap-2"
            >
              <Sun className="h-4 w-4" />
              Light
            </Button>
            <Button
              variant={theme === "dark" ? "default" : "outline"}
              onClick={() => setTheme("dark")}
              className="flex items-center gap-2"
            >
              <Moon className="h-4 w-4" />
              Dark
            </Button>
            <Button
              variant={theme === "system" ? "default" : "outline"}
              onClick={() => setTheme("system")}
              className="flex items-center gap-2"
            >
              <Monitor className="h-4 w-4" />
              System
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Theme Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Current Theme:</span>
                  <Badge variant="outline">{theme}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Resolved Theme:</span>
                  <Badge variant="outline">{resolvedTheme}</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Visual Test</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="p-3 bg-primary text-primary-foreground rounded">
                  Primary Color Test
                </div>
                <div className="p-3 bg-secondary text-secondary-foreground rounded">
                  Secondary Color Test
                </div>
                <div className="p-3 bg-muted text-muted-foreground rounded">
                  Muted Color Test
                </div>
                <div className="p-3 border border-border rounded">
                  Border Color Test
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Component Test</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Badge>Default Badge</Badge>
                <Badge variant="secondary">Secondary Badge</Badge>
                <Badge variant="destructive">Destructive Badge</Badge>
                <Badge variant="outline">Outline Badge</Badge>
              </div>
              
              <div className="flex flex-wrap gap-2">
                <Button size="sm">Small Button</Button>
                <Button variant="outline" size="sm">Outline Button</Button>
                <Button variant="secondary" size="sm">Secondary Button</Button>
                <Button variant="ghost" size="sm">Ghost Button</Button>
                <Button variant="destructive" size="sm">Destructive Button</Button>
              </div>

              <div className="space-y-4">
                <Label className="text-sm">Form Elements Test</Label>
                <div className="space-y-3">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Label className="text-sm">Toggle Off:</Label>
                      <Switch />
                    </div>
                    <div className="flex items-center gap-2">
                      <Label className="text-sm">Toggle On:</Label>
                      <Switch defaultChecked />
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Input placeholder="Test input field" className="w-48" />
                    <Button variant="outline" size="sm">Test Button</Button>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-card border border-border rounded-lg">
                <h3 className="font-semibold text-card-foreground mb-2">Card Component</h3>
                <p className="text-muted-foreground text-sm">
                  This card should have proper contrast in both light and dark modes.
                </p>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  )
}
