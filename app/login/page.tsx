"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Eye, EyeOff, LogIn, AlertCircle, Info, UserPlus, Settings } from "lucide-react"

export default function LoginPage() {
  const [credentials, setCredentials] = useState({ username: "", password: "" })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [debugInfo, setDebugInfo] = useState<any>(null)
  const [showQuickCreate, setShowQuickCreate] = useState(false)
  const [isAdminMode, setIsAdminMode] = useState(false)
  const router = useRouter()

  // Check if user is trying to access admin features
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const adminParam = urlParams.get("admin")
    const fromAdmin = window.location.pathname.includes("/admin")

    if (adminParam === "true" || fromAdmin) {
      setIsAdminMode(true)
    }
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setDebugInfo(null)

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
        // Store token and user info in localStorage
        localStorage.setItem("authToken", data.token)
        localStorage.setItem("user", JSON.stringify(data.user))
        localStorage.setItem("userEmail", data.user.email)
        localStorage.setItem("userName", data.user.name || data.user.username)

        // Redirect based on user role and where they came from
        if (data.user.role === "admin" && isAdminMode) {
          router.push("/admin")
        } else {
          router.push("/")
        }
      } else {
        setError(data.error || "Login failed")
        if (data.debug) {
          setDebugInfo(data.debug)
        }
        // Show quick create option if user not found and not in admin mode
        if (data.error?.includes("Invalid username") && !isAdminMode) {
          setShowQuickCreate(true)
        }
      }
    } catch (error) {
      console.error("Login error:", error)
      setError("An error occurred during login. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleQuickCreate = async () => {
    if (!credentials.username || !credentials.password) {
      setError("Please enter username and password first")
      return
    }

    setLoading(true)
    try {
      const response = await fetch("/api/debug/create-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: credentials.username.trim(),
          password: credentials.password.trim(),
          name: credentials.username.trim(),
          email: `${credentials.username.trim()}@example.com`,
          role: "user",
        }),
      })

      const data = await response.json()

      if (data.success) {
        setError("")
        setShowQuickCreate(false)
        // Now try to login
        handleLogin(new Event("submit") as any)
      } else {
        setError(data.message || "Failed to create user")
      }
    } catch (error) {
      console.error("User creation error:", error)
      setError("Failed to create user account")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          {isAdminMode ? "Admin Login" : "Sign in to your account"}
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          {!isAdminMode && (
            <>
              Or{" "}
              <Link href="/register" className="font-medium text-blue-600 hover:text-blue-500">
                create a new account
              </Link>
            </>
          )}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {/* Admin mode indicator */}
          {isAdminMode && (
            <div className="mb-4 p-3 bg-orange-50 rounded-md">
              <div className="flex">
                <div className="flex-shrink-0">
                  <Settings className="h-5 w-5 text-orange-400" aria-hidden="true" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-orange-800">Admin Access Required</h3>
                  <div className="mt-2 text-sm text-orange-700">
                    <p>You need administrator privileges to access this area.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Default credentials info - only show to admin users or in admin mode */}
          {isAdminMode && (
            <div className="mb-4 p-3 bg-blue-50 rounded-md">
              <div className="flex">
                <div className="flex-shrink-0">
                  <Info className="h-5 w-5 text-blue-400" aria-hidden="true" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">Default admin credentials</h3>
                  <div className="mt-2 text-sm text-blue-700">
                    <p>
                      Admin: username <strong>admin</strong> / password <strong>admin123</strong>
                    </p>
                    <p>
                      Demo: username <strong>demo</strong> / password <strong>demo123</strong>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 bg-red-50 rounded-md">
              <div className="flex">
                <div className="flex-shrink-0">
                  <AlertCircle className="h-5 w-5 text-red-400" aria-hidden="true" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Login failed</h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>{error}</p>
                    {debugInfo && isAdminMode && (
                      <div className="mt-2 text-xs font-mono">
                        <p>Username: {debugInfo.receivedUsername}</p>
                        <p>Password length: {debugInfo.receivedPasswordLength}</p>
                        {debugInfo.receivedPasswordHash && (
                          <>
                            <p>Received hash: {debugInfo.receivedPasswordHash}</p>
                            <p>Stored hash: {debugInfo.storedPasswordHash}</p>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {showQuickCreate && !isAdminMode && (
            <div className="mb-4 p-3 bg-yellow-50 rounded-md">
              <div className="flex">
                <div className="flex-shrink-0">
                  <UserPlus className="h-5 w-5 text-yellow-400" aria-hidden="true" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">User not found</h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    <p>Would you like to create an account with username "{credentials.username}"?</p>
                    <button
                      onClick={handleQuickCreate}
                      disabled={loading}
                      className="mt-2 inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-yellow-800 bg-yellow-100 hover:bg-yellow-200 disabled:opacity-50"
                    >
                      <UserPlus className="mr-1 h-3 w-3" />
                      Create Account & Login
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleLogin}>
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                Username
              </label>
              <div className="mt-1">
                <input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  required
                  value={credentials.username}
                  onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1 relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={credentials.password}
                  onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <Link href="/forgot-password" className="font-medium text-blue-600 hover:text-blue-500">
                  Forgot your password?
                </Link>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {loading ? (
                  "Signing in..."
                ) : (
                  <>
                    <LogIn className="mr-2 h-4 w-4" /> Sign in
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Debug tools - only show in admin mode */}
          {isAdminMode && (
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Debug Tools</span>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 gap-3">
                <Link
                  href="/api/debug/users"
                  className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                >
                  View All Users
                </Link>
                <Link
                  href="/api/debug/reinitialize-auth"
                  className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                >
                  Reset Authentication System
                </Link>
              </div>
            </div>
          )}

          {/* Switch to admin mode for regular users */}
          {!isAdminMode && (
            <div className="mt-6 text-center">
              <Link href="/login?admin=true" className="text-sm text-gray-500 hover:text-gray-700">
                Admin Login
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
