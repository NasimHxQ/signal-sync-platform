"use client"

import { useState, useEffect } from "react"
import type { User } from "@/lib/server/types"
import { AlertSettings } from "@/components/ui/alert-settings"
import { SourceManager } from "@/components/ui/source-manager"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { useTheme } from "next-themes"

export default function SettingsPage() {
  const { toast } = useToast()
  const { theme, setTheme } = useTheme()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [passwordSaving, setPasswordSaving] = useState(false)
  const [preferencesSaving, setPreferencesSaving] = useState(false)
  
  // Form state
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [timezone, setTimezone] = useState("utc")
  
  // Preferences state
  const [darkMode, setDarkMode] = useState(false)
  const [compactView, setCompactView] = useState(false)
  const [defaultCurrency, setDefaultCurrency] = useState("usd")
  const [defaultRiskLevel, setDefaultRiskLevel] = useState("medium")
  const [autoFollowSignals, setAutoFollowSignals] = useState(false)
  
  // Password form state
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  // Load user data on component mount
  useEffect(() => {
    async function loadUser() {
      try {
        setLoading(true)
        const response = await fetch('/api/me')
        if (response.ok) {
          const data = await response.json()
          setUser(data.user)
          
          // Populate form fields
          setFirstName(data.user.firstName || '')
          setLastName(data.user.lastName || '')
          setEmail(data.user.email || '')
          setTimezone(data.user.timezone || 'utc')
          
          // Populate preferences
          if (data.user.preferences) {
            const prefs = data.user.preferences
            setDarkMode(prefs.display.darkMode)
            setCompactView(prefs.display.compactView)
            setDefaultCurrency(prefs.display.defaultCurrency)
            setDefaultRiskLevel(prefs.trading.defaultRiskLevel)
            setAutoFollowSignals(prefs.trading.autoFollowSignals)
          }
        }
      } catch (error) {
        toast({
          title: "Loading failed",
          description: "Failed to load user settings. Please refresh the page.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    loadUser()
  }, [toast])

  const handleSaveAccount = async () => {
    try {
      setSaving(true)
      
      const response = await fetch('/api/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          timezone,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
        toast({
          title: "Account updated",
          description: "Your account information has been saved successfully.",
        })
      } else {
        const errorData = await response.json()
        toast({
          title: "Update failed",
          description: errorData.error?.message || "Failed to update account information",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Update failed",
        description: "An unexpected error occurred while updating your account.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleUpdatePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast({
        title: "Password mismatch",
        description: "New password and confirmation password do not match.",
        variant: "destructive",
      })
      return
    }

    try {
      setPasswordSaving(true)
      
      const response = await fetch('/api/me/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      })

      if (response.ok) {
        toast({
          title: "Password updated",
          description: "Your password has been changed successfully.",
        })
        // Clear form
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
      } else {
        const errorData = await response.json()
        if (response.status === 401 && errorData.error?.code === 'INVALID_PASSWORD') {
          toast({
            title: "Invalid password",
            description: "The current password you entered is incorrect.",
            variant: "destructive",
          })
        } else {
          toast({
            title: "Password update failed",
            description: errorData.error?.message || "Failed to update password",
            variant: "destructive",
          })
        }
      }
    } catch (error) {
      toast({
        title: "Password update failed",
        description: "An unexpected error occurred while updating your password.",
        variant: "destructive",
      })
    } finally {
      setPasswordSaving(false)
    }
  }

  const handleSavePreferences = async () => {
    try {
      setPreferencesSaving(true)
      
      const response = await fetch('/api/me/preferences', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          display: {
            darkMode,
            compactView,
            defaultCurrency,
          },
          trading: {
            defaultRiskLevel,
            autoFollowSignals,
          },
        }),
      })

      if (response.ok) {
        toast({
          title: "Preferences saved",
          description: "Your preferences have been updated successfully.",
        })
      } else {
        const errorData = await response.json()
        toast({
          title: "Preferences update failed",
          description: errorData.error?.message || "Failed to update preferences",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Preferences update failed",
        description: "An unexpected error occurred while updating preferences.",
        variant: "destructive",
      })
    } finally {
      setPreferencesSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your account and application preferences</p>
      </div>

      <Tabs defaultValue="alerts" className="space-y-6">
        <TabsList>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
          <TabsTrigger value="sources">Sources</TabsTrigger>
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
        </TabsList>

        <TabsContent value="alerts">
          <AlertSettings />
        </TabsContent>

        <TabsContent value="sources">
          <SourceManager />
        </TabsContent>

        <TabsContent value="account" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
              <CardDescription>Update your account details and preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>First Name</Label>
                  <Input 
                    value={firstName} 
                    onChange={(e) => setFirstName(e.target.value)}
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Last Name</Label>
                  <Input 
                    value={lastName} 
                    onChange={(e) => setLastName(e.target.value)}
                    disabled={loading}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Email Address</Label>
                <Input 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label>Timezone</Label>
                <Select value={timezone} onValueChange={setTimezone} disabled={loading}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="utc">UTC</SelectItem>
                    <SelectItem value="est">Eastern Time</SelectItem>
                    <SelectItem value="pst">Pacific Time</SelectItem>
                    <SelectItem value="cet">Central European Time</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleSaveAccount} disabled={saving || loading}>
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Security</CardTitle>
              <CardDescription>Manage your account security settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Current Password</Label>
                <Input 
                  type="password" 
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label>New Password</Label>
                <Input 
                  type="password" 
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label>Confirm New Password</Label>
                <Input 
                  type="password" 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={loading}
                />
              </div>
              <Button 
                onClick={handleUpdatePassword} 
                disabled={passwordSaving || loading || !currentPassword || !newPassword || newPassword !== confirmPassword}
              >
                {passwordSaving ? 'Updating...' : 'Update Password'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preferences" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Display Preferences</CardTitle>
              <CardDescription>Customize how information is displayed</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Dark Mode</Label>
                  <p className="text-sm text-muted-foreground">Use dark theme for the interface</p>
                </div>
                <Switch 
                  checked={theme === "dark"}
                  onCheckedChange={(checked) => {
                    setTheme(checked ? "dark" : "light")
                    setDarkMode(checked)
                  }}
                  disabled={loading}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Compact View</Label>
                  <p className="text-sm text-muted-foreground">Show more information in less space</p>
                </div>
                <Switch 
                  checked={compactView}
                  onCheckedChange={setCompactView}
                  disabled={loading}
                />
              </div>
              <Separator />
              <div className="space-y-2">
                <Label>Default Currency</Label>
                <Select 
                  value={defaultCurrency} 
                  onValueChange={setDefaultCurrency}
                  disabled={loading}
                >
                  <SelectTrigger className="w-[200px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="usd">USD ($)</SelectItem>
                    <SelectItem value="eur">EUR (€)</SelectItem>
                    <SelectItem value="btc">BTC (₿)</SelectItem>
                    <SelectItem value="eth">ETH (Ξ)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Trading Preferences</CardTitle>
              <CardDescription>Configure default trading settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Default Risk Level</Label>
                <Select 
                  value={defaultRiskLevel} 
                  onValueChange={setDefaultRiskLevel}
                  disabled={loading}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low Risk</SelectItem>
                    <SelectItem value="medium">Medium Risk</SelectItem>
                    <SelectItem value="high">High Risk</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Auto-follow Signals</Label>
                <p className="text-sm text-muted-foreground">Automatically execute signals that meet your criteria</p>
                <Switch 
                  checked={autoFollowSignals}
                  onCheckedChange={setAutoFollowSignals}
                  disabled={loading}
                />
              </div>
              <Button 
                onClick={handleSavePreferences} 
                disabled={preferencesSaving || loading}
                className="mt-4"
              >
                {preferencesSaving ? 'Saving...' : 'Save Preferences'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
