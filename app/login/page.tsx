"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, AlertCircle, UserPlus, LogIn } from "lucide-react"

export default function LoginPage() {
  const [credentials, setCredentials] = useState({ username: "", password: "" })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [isAdminMode, setIsAdminMode] = useState(false)
  const [redirectUrl, setRedirectUrl] = useState<string | null>(null)
  const router = useRouter()

  // Check for admin mode and redirect URL from URL parameters
  useEffect(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search)
      const admin = urlParams.get("admin")
      const redirect = urlParams.get("redirect")

      setIsAdminMode(admin === "true")
      setRedirectUrl(redirect)
    }
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: credentials.username.trim(),
          password: credentials.password.trim(),
        }),
      })

      const data = await response.json()

      if (data.success) {
        // Store user data and token
        localStorage.setItem("user", JSON.stringify(data.user))
        localStorage.setItem("authToken", data.token)
        localStorage.setItem("userEmail", data.user.email)
        localStorage.setItem("userName", data.user.name || data.user.username)

        // Redirect to intended page or default
        if (redirectUrl) {
          router.push(redirectUrl)
        } else if (data.user.role === "admin") {
          router.push("/admin/dashboard")
        } else {
          router.push("/forum")
        }
      } else {
        setError(data.error || "Invalid credentials")
      }
    } catch (error) {
      console.error("Login error:", error)
      setError("Login failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleQuickCreate = async () => {
    if (!credentials.username.trim()) {
      setError("Please enter a username")
      return
    }

    setLoading(true)
    setError("")

    try {
      const response = await fetch("/api/debug/create-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: credentials.username.trim(),
          email: `${credentials.username.trim()}@example.com`,
          password: credentials.password.trim() || "password123",
          name: credentials.username.trim(),
        }),
      })

      const data = await response.json()

      if (data.success) {
        // Auto-login after creation
        const loginResponse = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: credentials.username.trim(),
            password: credentials.password.trim() || "password123",
          }),
        })

        const loginData = await loginResponse.json()

        if (loginData.success) {
          localStorage.setItem("user", JSON.stringify(loginData.user))
          localStorage.setItem("authToken", loginData.token)
          localStorage.setItem("userEmail", loginData.user.email)
          localStorage.setItem("userName", loginData.user.name || loginData.user.username)

          if (redirectUrl) {
            router.push(redirectUrl)
          } else {
            router.push("/forum")
          }
        } else {
          setError("Account created but login failed")
        }
      } else {
        setError(data.error || "Failed to create account")
      }
    } catch (error) {
      console.error("Error creating user:", error)
      setError("Failed to create account")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg">
        <div className="p-6 sm:p-8 text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <LogIn className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            {isAdminMode ? "Admin Login" : "Welcome Back"}
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">
            {isAdminMode ? "Access the administration panel" : "Sign in to your account or create a new one"}
          </p>
        </div>

        <div className="px-6 pb-6 sm:px-8 sm:pb-8">
          {/* Admin credentials - only show in admin mode */}
          {isAdminMode && (
            <div className="mb-6 p-4 bg-blue-50 rounded-lg">
              <div className="flex items-start">
                <AlertCircle className="h-5 w-5 text-blue-400 mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <h3 className="text-sm font-medium text-blue-800 mb-2">Default Admin Credentials</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm text-blue-700">
                    <div>
                      <p className="font-medium">Username:</p>
                      <p className="font-mono bg-blue-100 px-2 py-1 rounded">admin</p>
                    </div>
                    <div>
                      <p className="font-medium">Password:</p>
                      <p className="font-mono bg-blue-100 px-2 py-1 rounded">admin123</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-lg">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                Username
              </label>
              <input
                id="username"
                type="text"
                placeholder="Enter your username"
                value={credentials.username}
                onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
                required
                autoComplete="username"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={credentials.password}
                  onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base pr-12"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium text-base"
              >
                {loading ? "Signing in..." : "Sign In"}
              </button>

              {!isAdminMode && (
                <button
                  type="button"
                  onClick={handleQuickCreate}
                  disabled={loading}
                  className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium text-base flex items-center justify-center"
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  {loading ? "Creating..." : "Quick Create Account"}
                </button>
              )}
            </div>
          </form>

          {!isAdminMode && (
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                {"Don't have an account? Just enter a username and click 'Quick Create Account'"}
              </p>
            </div>
          )}

          {isAdminMode && (
            <div className="mt-4 text-center">
              <a href="/api/debug/reinitialize-auth" className="text-sm text-blue-600 hover:text-blue-800">
                Reset Authentication System
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
