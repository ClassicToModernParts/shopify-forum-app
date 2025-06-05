"use client"

import { useState, useEffect } from "react"
import { Settings, User, Shield, Bell, Eye, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import UserNavigation from "@/components/UserNavigation"

export default function SettingsPage() {
  const [userInfo, setUserInfo] = useState({ email: "", name: "", username: "" })
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  const [settings, setSettings] = useState({
    notifications: {
      email: true,
      browser: true,
      mentions: true,
    },
    privacy: {
      profileVisible: true,
      showEmail: false,
      showActivity: true,
    },
    preferences: {
      theme: "light",
      language: "en",
      timezone: "UTC",
    },
  })

  useEffect(() => {
    const checkAuth = async () => {
      try {
        setLoading(true)

        // Check for session cookie first
        const sessionCookie = document.cookie
          .split("; ")
          .find((row) => row.startsWith("session="))
          ?.split("=")[1]

        // Check for auth token in localStorage
        const authToken = localStorage.getItem("authToken")

        if (!sessionCookie && !authToken) {
          setIsAuthenticated(false)
          setLoading(false)
          return
        }

        // Try to get user info
        const headers = {}
        if (authToken) {
          headers["Authorization"] = `Bearer ${authToken}`
        }

        const response = await fetch("/api/auth/user-info", {
          headers,
          credentials: "include",
        })

        const data = await response.json()

        if (data.success && data.user) {
          setIsAuthenticated(true)
          setUserInfo({
            email: data.user.email || "",
            name: data.user.name || data.user.username || "User",
            username: data.user.username || "",
          })
        } else {
          setIsAuthenticated(false)
        }
      } catch (error) {
        console.error("Auth check error:", error)
        setIsAuthenticated(false)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  const handleSaveSettings = async () => {
    // In a real app, you'd save these to the backend
    console.log("Saving settings:", settings)
    alert("Settings saved successfully!")
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <UserNavigation currentPage="settings" showBreadcrumb={true} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading settings...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50">
        <UserNavigation currentPage="settings" showBreadcrumb={true} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">Authentication Required</h2>
            <p className="text-gray-600 mb-4">Please log in to access your settings.</p>
            <Button onClick={() => (window.location.href = "/login")}>Go to Login</Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <UserNavigation currentPage="settings" showBreadcrumb={true} />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Settings className="h-8 w-8 text-blue-600" />
            Settings
          </h1>
          <p className="text-gray-600 mt-2">Manage your account preferences and privacy settings</p>
          <p className="text-sm text-green-600 mt-1">
            Logged in as: {userInfo.name} ({userInfo.username})
          </p>
        </div>

        <div className="space-y-6">
          {/* Account Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Account Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                <input
                  type="text"
                  value={userInfo.username}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                />
                <p className="text-xs text-gray-500 mt-1">Username cannot be changed</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Display Name</label>
                <input
                  type="text"
                  value={userInfo.name}
                  onChange={(e) => setUserInfo((prev) => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={userInfo.email}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                />
                <p className="text-xs text-gray-500 mt-1">Contact admin to change email</p>
              </div>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Email Notifications</h4>
                  <p className="text-sm text-gray-600">Receive notifications via email</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.notifications.email}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      notifications: { ...prev.notifications, email: e.target.checked },
                    }))
                  }
                  className="h-4 w-4 text-blue-600 rounded"
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Browser Notifications</h4>
                  <p className="text-sm text-gray-600">Show browser notifications</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.notifications.browser}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      notifications: { ...prev.notifications, browser: e.target.checked },
                    }))
                  }
                  className="h-4 w-4 text-blue-600 rounded"
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Mention Notifications</h4>
                  <p className="text-sm text-gray-600">Get notified when mentioned</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.notifications.mentions}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      notifications: { ...prev.notifications, mentions: e.target.checked },
                    }))
                  }
                  className="h-4 w-4 text-blue-600 rounded"
                />
              </div>
            </CardContent>
          </Card>

          {/* Privacy Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Privacy
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Profile Visibility</h4>
                  <p className="text-sm text-gray-600">Make your profile visible to others</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.privacy.profileVisible}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      privacy: { ...prev.privacy, profileVisible: e.target.checked },
                    }))
                  }
                  className="h-4 w-4 text-blue-600 rounded"
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Show Email</h4>
                  <p className="text-sm text-gray-600">Display email on your profile</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.privacy.showEmail}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      privacy: { ...prev.privacy, showEmail: e.target.checked },
                    }))
                  }
                  className="h-4 w-4 text-blue-600 rounded"
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Show Activity</h4>
                  <p className="text-sm text-gray-600">Display your recent activity</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.privacy.showActivity}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      privacy: { ...prev.privacy, showActivity: e.target.checked },
                    }))
                  }
                  className="h-4 w-4 text-blue-600 rounded"
                />
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button onClick={handleSaveSettings} className="flex items-center gap-2">
              <Save className="h-4 w-4" />
              Save Settings
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
