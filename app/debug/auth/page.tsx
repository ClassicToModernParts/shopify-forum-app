"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function AuthDebugPage() {
  const [username, setUsername] = useState("admin")
  const [password, setPassword] = useState("admin123")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [authStatus, setAuthStatus] = useState<any>(null)

  const checkAuthStatus = async () => {
    try {
      const response = await fetch("/api/auth/user-info", {
        credentials: "include",
      })
      const data = await response.json()
      setAuthStatus(data)
    } catch (error) {
      setAuthStatus({ error: "Failed to check auth status" })
    }
  }

  const testLogin = async () => {
    setLoading(true)
    setMessage("")

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ username, password }),
      })

      const data = await response.json()

      if (data.success) {
        setMessage(`✅ Login successful! Welcome ${data.user.username}`)
        // Store in localStorage
        localStorage.setItem("user", JSON.stringify(data.user))
        localStorage.setItem("authToken", data.token)
        await checkAuthStatus()
      } else {
        setMessage(`❌ Login failed: ${data.error}`)
      }
    } catch (error) {
      setMessage(`❌ Login error: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  const testLogout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      })
      localStorage.removeItem("user")
      localStorage.removeItem("authToken")
      setMessage("✅ Logged out successfully")
      await checkAuthStatus()
    } catch (error) {
      setMessage(`❌ Logout error: ${error}`)
    }
  }

  useEffect(() => {
    checkAuthStatus()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Authentication Debug</h1>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Test Login</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter username"
                />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={testLogin} disabled={loading}>
                  {loading ? "Logging in..." : "Test Login"}
                </Button>
                <Button onClick={testLogout} variant="outline">
                  Test Logout
                </Button>
                <Button onClick={checkAuthStatus} variant="outline">
                  Check Status
                </Button>
              </div>
            </CardContent>
          </Card>

          {message && (
            <Alert>
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Current Auth Status</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">{JSON.stringify(authStatus, null, 2)}</pre>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>LocalStorage Data</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p>
                  <strong>User:</strong> {localStorage.getItem("user") || "None"}
                </p>
                <p>
                  <strong>Token:</strong> {localStorage.getItem("authToken") || "None"}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
