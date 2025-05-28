"use client"

import { useState, useEffect, useCallback } from "react"

export function useAuth() {
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [token, setToken] = useState<string | null>(null)

  const checkAuthStatus = useCallback(() => {
    try {
      if (typeof window === "undefined") {
        console.log("Server side, skipping auth check")
        return
      }

      const storedToken = localStorage.getItem("admin_token")
      console.log("🔍 Checking auth status:")
      console.log("  - Token exists:", !!storedToken)
      console.log("  - Token value:", storedToken ? `${storedToken.substring(0, 8)}...` : "null")

      if (storedToken) {
        setToken(storedToken)
        setIsAdmin(true)
        console.log("  ✅ User is authenticated")
      } else {
        setToken(null)
        setIsAdmin(false)
        console.log("  ❌ User is not authenticated")
      }
    } catch (error) {
      console.error("❌ Error checking auth status:", error)
      setIsAdmin(false)
      setToken(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    checkAuthStatus()
  }, [checkAuthStatus])

  const login = useCallback((newToken: string) => {
    try {
      console.log("🔐 Logging in:")
      console.log("  - Token:", newToken ? `${newToken.substring(0, 8)}...` : "empty")

      localStorage.setItem("admin_token", newToken)
      setToken(newToken)
      setIsAdmin(true)

      console.log("  ✅ Login successful")

      // Verify the token was saved
      const savedToken = localStorage.getItem("admin_token")
      console.log("  - Verification - token saved:", !!savedToken)
    } catch (error) {
      console.error("❌ Error during login:", error)
    }
  }, [])

  const logout = useCallback(() => {
    try {
      console.log("🚪 Logging out")
      localStorage.removeItem("admin_token")
      setToken(null)
      setIsAdmin(false)
      console.log("  ✅ Logout successful")
    } catch (error) {
      console.error("❌ Error during logout:", error)
    }
  }, [])

  // Debug info
  useEffect(() => {
    console.log("🔄 Auth state changed:")
    console.log("  - isAdmin:", isAdmin)
    console.log("  - loading:", loading)
    console.log("  - token exists:", !!token)
  }, [isAdmin, loading, token])

  return {
    isAdmin,
    loading,
    token,
    login,
    logout,
    checkAuthStatus,
  }
}

export default useAuth
