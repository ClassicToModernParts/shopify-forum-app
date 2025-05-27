"use client"

import { useState, useEffect } from "react"

export function useAuth() {
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = () => {
    try {
      const token = localStorage.getItem("admin_token")
      setIsAdmin(!!token)
    } catch (error) {
      console.error("Error checking auth status:", error)
      setIsAdmin(false)
    } finally {
      setLoading(false)
    }
  }

  const login = (token: string) => {
    localStorage.setItem("admin_token", token)
    setIsAdmin(true)
  }

  const logout = () => {
    localStorage.removeItem("admin_token")
    setIsAdmin(false)
  }

  return {
    isAdmin,
    loading,
    login,
    logout,
    checkAuthStatus,
  }
}

export default useAuth
