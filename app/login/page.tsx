"use client"

import type React from "react"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff, User, Lock, AlertCircle, Info } from "lucide-react"

function LoginForm() {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isAdminMode, setIsAdminMode] = useState(false)

  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Check if this is admin mode
    const adminParam = searchParams.get("admin")
    const referrer = document.referrer
    const isFromAdmin = referrer.includes("/admin") || adminParam === "true"
    setIsAdminMode(isFromAdmin)

    // Check if user is already logged in
    const checkAuth = async () => {
      try {
        const storedUser = localStorage.getItem("user")
        const storedToken = localStorage.getItem("authToken")

        if (storedUser && storedToken) {
          const response = await fetch("/api/auth/user-info", {
            credentials: "include",
            headers: {
              Authorization: `Bearer ${storedToken}`,
            },
          })

          if (response.ok) {
            const data = await response.json()
            if (data.success && data.user) {
              // User is already logged in, redirect
              const redirectTo = searchParams.get("redirect") || "/"
              router.push(redirectTo)
              return
            }
          }
        }
      } catch (error) {
        console.error("Auth check error:", error)
      }
    }

    checkAuth()
  }, [router, searchParams])

  const handleQuickCreate = async (username: string) => {
    try {
      setLoading(true)
      setError("")

      const response = await fetch("/api/debug/create-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          password: "password123",
          email: `${username}@example.com`,
          name: username.charAt(0).toUpperCase() + username.slice(1),
        }),
      })

      const data = await response.json()

      if (data.success) {
        // Auto-login the created user
        setFormData({ username, password: "password123" })
        await handleLogin(username, "password123")
      } else {
        setError(data.error || "Failed to create account")
      }
    } catch (error) {
      console.error("Quick create error:", error)
      setError("An error occurred while creating account")
    } finally {
      setLoading(false)
    }
  }

  const handleLogin = async (username?: string, password?: string) => {
    const loginUsername = username || formData.username
    const loginPassword = password || formData.password

    if (!loginUsername || !loginPassword) {
      setError("Please enter both username and password")
      return
    }

    setLoading(true)
    setError("")

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          username: loginUsername,
          password: loginPassword,
        }),
      })

      const data = await response.json()

      if (data.success) {
        // Store user data and token
        localStorage.setItem("user", JSON.stringify(data.user))
        localStorage.setItem("authToken", data.token)
        localStorage.setItem("userEmail", data.user.email)
        localStorage.setItem("userName", data.user.name || data.user.username)

        console.log("✅ Login successful")

        // Redirect to intended page or home
        const redirectTo = searchParams.get("redirect") || "/"
        router.push(redirectTo)
      } else {
        if (data.error === "User not found" && !isAdminMode) {
          // Offer to create account for regular users
          const shouldCreate = confirm(
            `Username "${loginUsername}" not found. Would you like to create this account with password "password123"?`,
          )
          if (shouldCreate) {
            await handleQuickCreate(loginUsername)
            return
          }
        }
        setError(data.error || "Login failed")
      }
    } catch (error) {
      console.error("Login error:", error)
      setError("An error occurred during login")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await handleLogin()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center flex items-center justify-center gap-2">
            <User className="h-6 w-6 text-blue-600" />
            {isAdminMode ? "Admin Login" : "Login"}
          </CardTitle>
          <p className="text-gray-600 text-center text-sm">
            {isAdminMode ? "Access admin dashboard" : "Sign in to your account"}
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {isAdminMode && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <p className="font-medium">Default Admin Credentials:</p>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="font-medium">Admin:</p>
                      <p>admin / admin123</p>
                    </div>
                    <div>
                      <p className="font-medium">Demo:</p>
                      <p>demo / demo123</p>
                    </div>
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="Enter your username"
                value={formData.username}
                onChange={(e) => setFormData((prev) => ({ ...prev, username: e.target.value }))}
                required
                autoComplete="username"
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
                  required
                  autoComplete="current-password"
                  className="h-11 pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <Button type="submit" className="w-full h-11" disabled={loading}>
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Signing in...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  Sign In
                </div>
              )}
            </Button>
          </form>

          {!isAdminMode && (
            <div className="text-center">
              <p className="text-sm text-gray-600">
                Don't have an account? Just enter a username and we'll create one for you!
              </p>
            </div>
          )}

          <div className="text-center space-y-2">
            <Button variant="link" onClick={() => router.push("/forgot-password")} className="text-sm">
              Forgot your password?
            </Button>
          </div>

          {isAdminMode && (
            <div className="border-t pt-4">
              <p className="text-xs text-gray-500 text-center">
                Debug tools and system management available after login
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginForm />
    </Suspense>
  )
}
