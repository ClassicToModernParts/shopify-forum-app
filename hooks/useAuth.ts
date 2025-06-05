"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

interface User {
  id: string
  username: string
  name?: string
  email: string
  role: "admin" | "user" | "moderator"
}

export function useAuth(options: { redirectTo?: string; requiredRole?: "admin" | "user" | "moderator" } = {}) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    async function checkAuth() {
      try {
        // First try to get user from localStorage
        const storedUser = localStorage.getItem("user")
        const storedToken = localStorage.getItem("authToken")

        if (storedUser && storedToken) {
          const parsedUser = JSON.parse(storedUser)
          setUser(parsedUser)

          // Verify token with server in background
          try {
            const response = await fetch("/api/auth/user-info")
            if (response.ok) {
              const data = await response.json()
              if (data.success && data.user) {
                // Update user info if it's different
                if (JSON.stringify(data.user) !== storedUser) {
                  localStorage.setItem("user", JSON.stringify(data.user))
                  setUser(data.user)
                }
              } else {
                // Token invalid, clear localStorage
                localStorage.removeItem("user")
                localStorage.removeItem("authToken")
                setUser(null)

                if (options.redirectTo) {
                  router.push(options.redirectTo)
                }
              }
            }
          } catch (e) {
            console.error("Error verifying token:", e)
          }
        } else {
          // No stored user, try to get from server
          const response = await fetch("/api/auth/user-info")
          if (response.ok) {
            const data = await response.json()
            if (data.success && data.user) {
              localStorage.setItem("user", JSON.stringify(data.user))
              if (data.token) {
                localStorage.setItem("authToken", data.token)
              }
              setUser(data.user)
            } else if (options.redirectTo) {
              router.push(options.redirectTo)
            }
          } else if (options.redirectTo) {
            router.push(options.redirectTo)
          }
        }
      } catch (err) {
        console.error("Auth error:", err)
        setError("Authentication error")
        if (options.redirectTo) {
          router.push(options.redirectTo)
        }
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [router, options.redirectTo])

  // Check if user has required role
  useEffect(() => {
    if (!loading && user && options.requiredRole && user.role !== options.requiredRole) {
      if (options.redirectTo) {
        router.push(options.redirectTo)
      }
    }
  }, [user, loading, options.requiredRole, options.redirectTo, router])

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" })
    } catch (e) {
      console.error("Error logging out:", e)
    }

    // Clear local storage
    localStorage.removeItem("user")
    localStorage.removeItem("authToken")
    localStorage.removeItem("userEmail")
    localStorage.removeItem("userName")

    setUser(null)
    router.push("/login")
  }

  return { user, loading, error, logout, isAuthenticated: !!user }
}
