"use client"

import { useState, useEffect, useCallback } from "react"

interface User {
  id: string
  email: string
  name: string
  username: string
}

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
}

export function useUserAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: true,
  })

  // Check if user is authenticated on mount
  useEffect(() => {
    const checkAuth = () => {
      try {
        const storedToken = localStorage.getItem("user_token")
        const storedUser = localStorage.getItem("user_data")

        if (storedToken && storedUser) {
          const userData = JSON.parse(storedUser)
          setAuthState({
            user: userData,
            token: storedToken,
            isAuthenticated: true,
            isLoading: false,
          })
        } else {
          setAuthState({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
          })
        }
      } catch (error) {
        console.error("Error checking auth status:", error)
        setAuthState({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
        })
      }
    }

    checkAuth()
  }, [])

  // Register a new user
  const register = async (userData: {
    email: string
    username: string
    password: string
    name: string
  }) => {
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      })

      const data = await response.json()

      if (data.success && data.token && data.user) {
        localStorage.setItem("user_token", data.token)
        localStorage.setItem("user_data", JSON.stringify(data.user))

        setAuthState({
          user: data.user,
          token: data.token,
          isAuthenticated: true,
          isLoading: false,
        })

        return { success: true, message: data.message }
      } else {
        return { success: false, message: data.message || "Registration failed" }
      }
    } catch (error) {
      console.error("Registration error:", error)
      return { success: false, message: "Registration failed. Please try again." }
    }
  }

  // Login user
  const login = async (credentials: { email: string; password: string }) => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      })

      const data = await response.json()

      if (data.success && data.token && data.user) {
        localStorage.setItem("user_token", data.token)
        localStorage.setItem("user_data", JSON.stringify(data.user))

        setAuthState({
          user: data.user,
          token: data.token,
          isAuthenticated: true,
          isLoading: false,
        })

        return { success: true, message: data.message }
      } else {
        return { success: false, message: data.message || "Login failed" }
      }
    } catch (error) {
      console.error("Login error:", error)
      return { success: false, message: "Login failed. Please try again." }
    }
  }

  // Logout user
  const logout = useCallback(() => {
    localStorage.removeItem("user_token")
    localStorage.removeItem("user_data")

    setAuthState({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
    })
  }, [])

  return {
    user: authState.user,
    token: authState.token,
    isAuthenticated: authState.isAuthenticated,
    isLoading: authState.isLoading,
    register,
    login,
    logout,
  }
}

export default useUserAuth
