"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Link from "next/link"
import useUserAuth from "@/hooks/useUserAuth"

export default function LoginPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const router = useRouter()
  const { login } = useUserAuth()

  // Check if current user is admin
  useEffect(() => {
    const checkAdminStatus = () => {
      try {
        const user = localStorage.getItem("user")
        if (user) {
          const userData = JSON.parse(user)
          setIsAdmin(userData.role === "admin")
        }
      } catch (error) {
        console.error("Error checking admin status:", error)
      }
    }

    checkAdminStatus()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      console.log("🔐 Login Page: Attempting login for:", username)
      const result = await login({ username, password })

      console.log("🔐 Login Page: Login result:", { success: result.success, message: result.message })

      if (result.success) {
        console.log("✅ Login Page: Login successful, redirecting to forum")
        // Update admin status after successful login
        if (result.user?.role === "admin") {
          setIsAdmin(true)
        }
        router.push("/forum")
      } else {
        console.log("❌ Login Page: Login failed:", result.message)
        setError(result.message || "Login failed. Please try again.")
      }
    } catch (error) {
      console.error("❌ Login Page: Login error:", error)
      setError("Login failed. Please check your connection and try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="w-full max-w-sm sm:max-w-md space-y-6">
        <Card className="shadow-lg">
          <CardHeader className="space-y-2 pb-4">
            <CardTitle className="text-xl sm:text-2xl font-bold text-center">Sign in</CardTitle>
            <CardDescription className="text-center text-sm sm:text-base px-2">
              Enter your username and password to access your account
            </CardDescription>
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive" className="text-sm">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="username" className="text-sm font-medium">
                  Username
                </Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="h-11 text-base"
                  autoComplete="username"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-sm font-medium">
                    Password
                  </Label>
                  <Link href="/forgot-password-security" className="text-xs sm:text-sm text-blue-600 hover:underline">
                    Forgot password?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-11 text-base"
                  autoComplete="current-password"
                />
              </div>

              <Button type="submit" className="w-full h-11 text-base font-medium" disabled={isLoading}>
                {isLoading ? "Signing in..." : "Sign in"}
              </Button>
            </form>

            <div className="mt-6 space-y-3">
              <div className="text-center text-sm">
                Don't have an account?{" "}
                <Link href="/register" className="text-blue-600 hover:underline font-medium">
                  Sign up
                </Link>
              </div>

              <div className="text-center">
                <Link href="/forum" className="text-sm text-gray-600 hover:underline">
                  Continue as guest
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Debug section - only show for admins */}
        {isAdmin && (
          <Card className="shadow-lg">
            <CardContent className="p-4">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Debug Options</h3>
              <div className="grid grid-cols-1 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-10 text-sm"
                  onClick={async () => {
                    try {
                      const response = await fetch("/api/debug/auth")
                      const data = await response.json()
                      console.log("Debug info:", data)
                      alert(`System has ${data.debug?.userCount || 0} users. Check console for details.`)
                    } catch (error) {
                      console.error("Debug error:", error)
                      alert("Debug check failed. Check console for details.")
                    }
                  }}
                >
                  Check System State
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-10 text-sm"
                  onClick={async () => {
                    try {
                      const response = await fetch("/api/debug/reinitialize", { method: "POST" })
                      const data = await response.json()
                      console.log("Reinitialize result:", data)
                      if (data.success) {
                        alert("System reinitialized! You can now login with default users.")
                      } else {
                        alert("Failed to reinitialize. Check console for details.")
                      }
                    } catch (error) {
                      console.error("Reinitialize error:", error)
                      alert("Reinitialize failed. Check console for details.")
                    }
                  }}
                >
                  Reinitialize System
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-10 text-sm"
                  onClick={async () => {
                    try {
                      const response = await fetch("/api/debug/create-test-user", { method: "POST" })
                      const data = await response.json()
                      console.log("Test user creation:", data)
                      if (data.success) {
                        alert("Test user created! Username: testuser, Password: password123")
                      } else {
                        alert("Failed to create test user. Check console for details.")
                      }
                    } catch (error) {
                      console.error("Test user creation error:", error)
                      alert("Test user creation failed. Check console for details.")
                    }
                  }}
                >
                  Create Test User
                </Button>
              </div>

              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <h4 className="text-xs font-medium text-blue-800 mb-2">Default Login Credentials:</h4>
                <div className="text-xs text-blue-700 space-y-1">
                  <div className="flex justify-between">
                    <span>
                      <strong>Admin:</strong>
                    </span>
                    <span>ctm_admin / admin123</span>
                  </div>
                  <div className="flex justify-between">
                    <span>
                      <strong>Moderator:</strong>
                    </span>
                    <span>tech_expert / tech123</span>
                  </div>
                  <div className="flex justify-between">
                    <span>
                      <strong>User:</strong>
                    </span>
                    <span>builder_pro / builder123</span>
                  </div>
                  <div className="flex justify-between">
                    <span>
                      <strong>Test User:</strong>
                    </span>
                    <span>testuser / password123</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
