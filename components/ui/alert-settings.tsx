"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Bell, Mail, MessageSquare, Smartphone } from "lucide-react"
import { useState, useEffect } from "react"
import type { AlertSettings as AlertSettingsType } from "@/lib/server/types"

interface AlertSettingsProps {
  className?: string
}

export function AlertSettings({ className }: AlertSettingsProps) {
  const [emailAlerts, setEmailAlerts] = useState(true)
  const [telegramAlerts, setTelegramAlerts] = useState(false)
  const [browserAlerts, setBrowserAlerts] = useState(true)
  const [smsAlerts, setSmsAlerts] = useState(false)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  // Load alert settings on component mount
  useEffect(() => {
    async function loadAlertSettings() {
      try {
        setLoading(true)
        const response = await fetch('/api/me')
        if (response.ok) {
          const data = await response.json()
          const alerts = data.alerts
          
          setEmailAlerts(alerts.email?.enabled || false)
          setTelegramAlerts(alerts.telegram?.enabled || false)
          setBrowserAlerts(alerts.browser?.enabled || false)
          setSmsAlerts(alerts.sms?.enabled || false)
        }
      } catch (error) {
        console.error('Error loading alert settings:', error)
      } finally {
        setLoading(false)
      }
    }

    loadAlertSettings()
  }, [])

  const handleSaveSettings = async () => {
    try {
      setSaving(true)
      
      const alertSettings: AlertSettingsType = {
        email: { enabled: emailAlerts, address: "user@example.com" },
        telegram: { enabled: telegramAlerts, username: "@user" },
        browser: { enabled: browserAlerts },
        sms: { enabled: smsAlerts, phone: "+1234567890" },
        rules: {
          minConfidence: 70,
          types: ["buy", "long"],
          minLeverage: 5,
        },
      }

      const response = await fetch('/api/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(alertSettings),
      })

      if (response.ok) {
        console.log('Alert settings saved successfully')
      } else {
        console.error('Failed to save alert settings:', response.statusText)
      }
    } catch (error) {
      console.error('Error saving alert settings:', error)
    } finally {
      setSaving(false)
    }
  }

  const alertTypes = [
    {
      id: "email",
      label: "Email Notifications",
      description: "Receive alerts via email",
      icon: Mail,
      enabled: emailAlerts,
      setEnabled: setEmailAlerts,
    },
    {
      id: "telegram",
      label: "Telegram Bot",
      description: "Get instant messages via Telegram",
      icon: MessageSquare,
      enabled: telegramAlerts,
      setEnabled: setTelegramAlerts,
    },
    {
      id: "browser",
      label: "Browser Notifications",
      description: "Desktop notifications in your browser",
      icon: Bell,
      enabled: browserAlerts,
      setEnabled: setBrowserAlerts,
    },
    {
      id: "sms",
      label: "SMS Alerts",
      description: "Text message notifications",
      icon: Smartphone,
      enabled: smsAlerts,
      setEnabled: setSmsAlerts,
      badge: "Premium",
    },
  ]

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Alert Settings
        </CardTitle>
        <CardDescription>Configure how you want to receive signal notifications</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Alert Methods */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium">Notification Methods</h4>
          {alertTypes.map((alert) => (
            <div key={alert.id} className="flex items-center justify-between space-x-2">
              <div className="flex items-center space-x-3">
                <alert.icon className="h-4 w-4 text-muted-foreground" />
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <Label className="text-sm font-medium">{alert.label}</Label>
                    {alert.badge && (
                      <Badge variant="secondary" className="text-xs">
                        {alert.badge}
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">{alert.description}</p>
                </div>
              </div>
              <Switch checked={alert.enabled} onCheckedChange={alert.setEnabled} />
            </div>
          ))}
        </div>

        {/* Alert Conditions */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium">Alert Conditions</h4>
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label className="text-sm">Minimum Confidence Level</Label>
              <Select defaultValue="70">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="50">50% - All Signals</SelectItem>
                  <SelectItem value="60">60% - Medium Confidence</SelectItem>
                  <SelectItem value="70">70% - High Confidence</SelectItem>
                  <SelectItem value="80">80% - Very High Confidence</SelectItem>
                  <SelectItem value="90">90% - Extremely High</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm">Signal Types</Label>
              <div className="flex flex-wrap gap-2">
                {["Buy", "Sell", "Long", "Short"].map((type) => (
                  <Badge
                    key={type}
                    variant="outline"
                    className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                  >
                    {type}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm">Minimum Leverage</Label>
              <Input type="number" placeholder="e.g., 5" min="1" max="100" />
            </div>
          </div>
        </div>

        {/* Contact Information */}
        {(emailAlerts || telegramAlerts || smsAlerts) && (
          <div className="space-y-4">
            <h4 className="text-sm font-medium">Contact Information</h4>
            <div className="grid gap-4">
              {emailAlerts && (
                <div className="space-y-2">
                  <Label className="text-sm">Email Address</Label>
                  <Input type="email" placeholder="your@email.com" />
                </div>
              )}
              {telegramAlerts && (
                <div className="space-y-2">
                  <Label className="text-sm">Telegram Username</Label>
                  <Input placeholder="@yourusername" />
                </div>
              )}
              {smsAlerts && (
                <div className="space-y-2">
                  <Label className="text-sm">Phone Number</Label>
                  <Input type="tel" placeholder="+1 (555) 123-4567" />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-4">
          <Button onClick={handleSaveSettings} disabled={saving || loading}>
            {saving ? 'Saving...' : 'Save Settings'}
          </Button>
          <Button variant="outline" disabled={loading}>Test Alerts</Button>
        </div>
      </CardContent>
    </Card>
  )
}
