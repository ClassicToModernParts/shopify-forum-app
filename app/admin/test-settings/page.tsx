"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { RefreshCw, Save } from "lucide-react"

export default function TestSettingsPage() {
  const [settings, setSettings] = useState({
    general: {
      forumName: "",
      description: "",
      welcomeMessage: "",
      contactEmail: "",
    },
    moderation: {
      requireApproval: false,
      autoSpamDetection: true,
    },
    appearance: {
      primaryColor: "",
      accentColor: "",
    },
    notifications: {
      emailNotifications: true,
      newPostNotifications: true,
    },
  })

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState("")
  const [lastSaved, setLastSaved] = useState<string | null>(null)

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/admin/settings")
      if (!response.ok) {
        throw new Error(`Settings API failed: ${response.status}`)
      }
      const data = await response.json()
      if (data.success) {
        setSettings(data.data)
        setLastSaved(data.data.lastUpdated)
      } else {
        setMessage(`Error: ${data.error || "Failed to load settings"}`)
      }
    } catch (error) {
      setMessage(`Error: ${error instanceof Error ? error.message : "Unknown error"}`)
    } finally {
      setLoading(false)
    }
  }

  const updateSettings = (section: string, key: string, value: any) => {
    setSettings((prev) => {
      // Create a deep copy of the section
      const updatedSection = { ...prev[section as keyof typeof prev], [key]: value }
      // Return a new object with the updated section
      return { ...prev, [section]: updatedSection }
    })
  }

  const saveSettings = async () => {
    setSaving(true)
    setMessage("")

    try {
      const response = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings }),
      })

      if (!response.ok) {
        throw new Error(`Settings save failed: ${response.status}`)
      }

      const data = await response.json()

      if (data.success) {
        setMessage("Settings saved successfully!")
        setLastSaved(data.data.lastUpdated)
      } else {
        setMessage(`Error: ${data.error || "Failed to save settings"}`)
      }
    } catch (error) {
      setMessage(`Error: ${error instanceof Error ? error.message : "Unknown error"}`)
    } finally {
      setSaving(false)
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Never"
    return new Date(dateString).toLocaleString()
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Settings Test Page</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {message && (
            <div
              className={`p-4 rounded-md ${message.includes("Error") ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"}`}
            >
              {message}
            </div>
          )}

          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-medium">General Settings</h2>
              <p className="text-sm text-gray-500">Last saved: {formatDate(lastSaved)}</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={loadSettings} disabled={loading}>
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                {loading ? "Loading..." : "Reload"}
              </Button>
              <Button onClick={saveSettings} disabled={saving}>
                <Save className="h-4 w-4 mr-2" />
                {saving ? "Saving..." : "Save Settings"}
              </Button>
            </div>
          </div>

          <div className="space-y-4 border p-4 rounded-md">
            <div className="space-y-2">
              <label className="text-sm font-medium">Forum Name</label>
              <Input
                value={settings.general.forumName}
                onChange={(e) => updateSettings("general", "forumName", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Textarea
                value={settings.general.description}
                onChange={(e) => updateSettings("general", "description", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Contact Email</label>
              <Input
                value={settings.general.contactEmail}
                onChange={(e) => updateSettings("general", "contactEmail", e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-4 border p-4 rounded-md">
            <h3 className="font-medium">Moderation Settings</h3>

            <div className="flex items-center justify-between">
              <span className="text-sm">Require approval for new posts</span>
              <Switch
                checked={settings.moderation.requireApproval}
                onCheckedChange={(checked) => updateSettings("moderation", "requireApproval", checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm">Auto spam detection</span>
              <Switch
                checked={settings.moderation.autoSpamDetection}
                onCheckedChange={(checked) => updateSettings("moderation", "autoSpamDetection", checked)}
              />
            </div>
          </div>

          <div className="space-y-4 border p-4 rounded-md">
            <h3 className="font-medium">Appearance Settings</h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Primary Color</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={settings.appearance.primaryColor}
                    onChange={(e) => updateSettings("appearance", "primaryColor", e.target.value)}
                    className="h-10 w-10"
                  />
                  <Input
                    value={settings.appearance.primaryColor}
                    onChange={(e) => updateSettings("appearance", "primaryColor", e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Accent Color</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={settings.appearance.accentColor}
                    onChange={(e) => updateSettings("appearance", "accentColor", e.target.value)}
                    className="h-10 w-10"
                  />
                  <Input
                    value={settings.appearance.accentColor}
                    onChange={(e) => updateSettings("appearance", "accentColor", e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
