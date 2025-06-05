"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Shield, Eye, EyeOff, AlertCircle, Info } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"

interface DebugInfo {
  receivedUsername: string
  receivedPasswordLength: number
  expectedUsername: string
  expectedPasswordLength: number
  receivedPasswordHash?: string
  storedPasswordHash?: string
}

export default function AdminLoginContent() {
  const [credentials, setCredentials] = useState({ username: "", password: "" })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [debugInfo, setDebugInfo] = useState<DebugInfo | null>(null)
  const router = useRouter()
  const { login } = useAuth()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setDebugInfo(null)

    try {
      console.log("Attempting login with:", {
        username: credentials.username,
        password: credentials.password ? "***" : "empty",
      })

      const response = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: credentials.username.trim(),
          password: credentials.password.trim(),
        }),
      })

      const data = await response.json()
      console.log("Login response:", data)

      if (data.success) {
        login(data.token) // Use the auth hook
        router.push("/admin/dashboard")
      } else {
        setError(data.error || "Invalid credentials")
        if (data.debug) {
          setDebugInfo(data.debug as DebugInfo)
        }
      }
    } catch (error) {
      console.error("Login error:", error)
      setError("Login failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg">
        <div className="p-6 text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Admin Login</h1>
          <p className="text-gray-600">Access the forum administration panel</p>
        </div>

        <div className="p-6">
          {/* Default credentials info */}
          <div className="mb-4 p-3 bg-blue-50 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <Info className="h-5 w-5 text-blue-400" aria-hidden="true" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">Default admin credentials</h3>
                <div className="mt-2 text-sm text-blue-700">
                  <p>
                    Username: <strong>admin</strong>
                  </p>
                  <p>
                    Password: <strong>admin123</strong>
                  </p>
                </div>
              </div>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-lg">
                <AlertCircle className="h-4 w-4" />
                <div>
                  <span className="text-sm">{error}</span>
                  {debugInfo && (
                    <div className="text-xs mt-1 font-mono">
                      <div>
                        Username: "{debugInfo.receivedUsername}" (expected: "{debugInfo.expectedUsername}")
                      </div>
                      <div>
                        Password length: {debugInfo.receivedPasswordLength} (expected:{" "}
                        {debugInfo.expectedPasswordLength})
                      </div>
                      {debugInfo.receivedPasswordHash && (
                        <>
                          <div>Received hash: {debugInfo.receivedPasswordHash}</div>
                          <div>Stored hash: {debugInfo.storedPasswordHash}</div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                Username
              </label>
              <input
                id="username"
                type="text"
                placeholder="Enter admin username"
                value={credentials.username}
                onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
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
                  placeholder="Enter admin password"
                  value={credentials.password}
                  onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div className="mt-4 text-center">
            <a href="/api/debug/reinitialize-auth" className="text-sm text-blue-600 hover:text-blue-800">
              Reset Authentication System
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
