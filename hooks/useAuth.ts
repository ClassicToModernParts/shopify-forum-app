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
      const tokenExpiry = localStorage.getItem("admin_token_expiry")
      const now = Date.now()

      console.log("🔍 Checking auth status:")
      console.log("  - Token exists:", !!storedToken)
      console.log("  - Token expiry exists:", !!tokenExpiry)

      if (storedToken && tokenExpiry && Number.parseInt(tokenExpiry) > now) {
        setToken(storedToken)
        setIsAdmin(true)
        console.log("  ✅ User is authenticated (token valid)")
      } else if (storedToken && (!tokenExpiry || Number.parseInt(tokenExpiry) <= now)) {
        // Token expired, clean up
        console.log("  ⚠️ Token expired, logging out")
        localStorage.removeItem("admin_token")
        localStorage.removeItem("admin_token_expiry")
        setToken(null)
        setIsAdmin(false)
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

      // Set token with 24-hour expiry
      const expiryTime = Date.now() + 24 * 60 * 60 * 1000 // 24 hours from now
      localStorage.setItem("admin_token", newToken)
      localStorage.setItem("admin_token_expiry", expiryTime.toString())

      setToken(newToken)
      setIsAdmin(true)

      console.log("  ✅ Login successful")
      console.log("  - Token expiry set to:", new Date(expiryTime).toLocaleString())

      // Verify the token was saved
      const savedToken = localStorage.getItem("admin_token")
      const savedExpiry = localStorage.getItem("admin_token_expiry")
      console.log("  - Verification - token saved:", !!savedToken)
      console.log("  - Verification - expiry saved:", !!savedExpiry)
    } catch (error) {
      console.error("❌ Error during login:", error)
    }
  }, [])

  const logout = useCallback(() => {
    try {
      console.log("🚪 Logging out")
      localStorage.removeItem("admin_token")
      localStorage.removeItem("admin_token_expiry")
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
