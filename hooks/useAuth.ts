"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

interface User {
  id: string
  username: string
  name: string
  email: string
  role: "admin" | "user" | "moderator"
}

export function useAuth(options: { redirectTo?: string } = {}) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const checkAuth = async () => {
    try {
      console.log("🔍 useAuth: Checking authentication")

      // First check localStorage
      const storedUser = localStorage.getItem("user")
      const storedToken = localStorage.getItem("authToken")

      console.log("🔍 useAuth: Stored user exists:", !!storedUser)
      console.log("🔍 useAuth: Stored token exists:", !!storedToken)

      if (storedUser && storedToken) {
        try {
          const parsedUser = JSON.parse(storedUser)
          setUser(parsedUser)
          console.log("✅ useAuth: User loaded from localStorage:", parsedUser.username)
        } catch (e) {
          console.error("❌ useAuth: Error parsing stored user:", e)
          localStorage.removeItem("user")
          localStorage.removeItem("authToken")
        }
      }

      // Verify with server
      const response = await fetch("/api/auth/user-info", {
        credentials: "include",
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success && data.user) {
          console.log("✅ useAuth: User verified with server:", data.user.username)
          setUser(data.user)
          localStorage.setItem("user", JSON.stringify(data.user))
          localStorage.setItem("authToken", data.token)
          setError(null)
        } else {
          console.log("❌ useAuth: Server verification failed")
          setUser(null)
          localStorage.removeItem("user")
          localStorage.removeItem("authToken")
          if (options.redirectTo) {
            router.push(options.redirectTo)
          }
        }
      } else {
        console.log("❌ useAuth: Server request failed")
        setUser(null)
        localStorage.removeItem("user")
        localStorage.removeItem("authToken")
        if (options.redirectTo) {
          router.push(options.redirectTo)
        }
      }
    } catch (err) {
      console.error("❌ useAuth: Error checking auth:", err)
      setError("Authentication error")
      setUser(null)
      localStorage.removeItem("user")
      localStorage.removeItem("authToken")
      if (options.redirectTo) {
        router.push(options.redirectTo)
      }
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    try {
      console.log("🚪 useAuth: Logging out")
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      })
    } catch (e) {
      console.error("Error during logout:", e)
    }

    // Clear all stored data
    localStorage.removeItem("user")
    localStorage.removeItem("authToken")
    localStorage.removeItem("userEmail")
    localStorage.removeItem("userName")

    setUser(null)
    router.push("/login")
  }

  useEffect(() => {
    checkAuth()
  }, [])

  return {
    user,
    loading,
    error,
    logout,
    isAuthenticated: !!user,
    checkAuth, // Expose for manual refresh
  }
}
