"use client"

import { useState, useEffect } from "react"

interface User {
  id: string
  name: string
  username: string
}

interface LoginData {
  username: string
  password: string
}

interface RegisterData {
  username: string
  name: string
  password: string
  securityQuestion: string
  securityAnswer: string
}

interface AuthResult {
  success: boolean
  message: string
  user?: User
  token?: string
}

export default function useUserAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Check for existing session on mount
  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        const token = localStorage.getItem("authToken")
        const userData = localStorage.getItem("userData")

        if (token && userData) {
          try {
            const parsedUser = JSON.parse(userData)
            setUser(parsedUser)
          } catch (error) {
            console.error("Error parsing user data:", error)
            // Invalid stored data, clear it
            localStorage.removeItem("authToken")
            localStorage.removeItem("userData")
          }
        }
      }
    } catch (error) {
      console.error("Error accessing localStorage:", error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const login = async (loginData: LoginData): Promise<AuthResult> => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(loginData),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()

      if (result.success && result.user && result.token) {
        setUser(result.user)
        if (typeof window !== "undefined") {
          localStorage.setItem("authToken", result.token)
          localStorage.setItem("userData", JSON.stringify(result.user))
        }
      }

      return result
    } catch (error) {
      console.error("Login error:", error)
      return {
        success: false,
        message: "Login failed. Please try again.",
      }
    }
  }

  const register = async (registerData: RegisterData): Promise<AuthResult> => {
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(registerData),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()

      if (result.success && result.user && result.token) {
        setUser(result.user)
        if (typeof window !== "undefined") {
          localStorage.setItem("authToken", result.token)
          localStorage.setItem("userData", JSON.stringify(result.user))
        }
      }

      return result
    } catch (error) {
      console.error("Registration error:", error)
      return {
        success: false,
        message: "Registration failed. Please try again.",
      }
    }
  }

  const logout = () => {
    setUser(null)
    if (typeof window !== "undefined") {
      localStorage.removeItem("authToken")
      localStorage.removeItem("userData")
    }
  }

  return {
    user,
    isLoading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
  }
}
