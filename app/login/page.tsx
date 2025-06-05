"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Link from "next/link"

export default function LoginPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [isAdmin, setIsAdmin] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Only run on client side
  useEffect(() => {
    setMounted(true)
    // Check if admin mode is requested
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search)
      setIsAdmin(urlParams.get("admin") === "true")
    }
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage("")

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ username, password }),
      })

      const data = await response.json()

      if (data.success) {
        setMessage(`Login successful! Welcome ${data.user.username}`)

        // Only access localStorage on client side
        if (typeof window !== "undefined") {
          localStorage.setItem("user", JSON.stringify(data.user))
          localStorage.setItem("authToken", data.token)

          // Redirect based on role
          if (data.user.role === "admin") {
            window.location.href = "/admin"
          } else {
            // Get redirect URL or default to home
            const urlParams = new URLSearchParams(window.location.search)
            const redirect = urlParams.get("redirect") || "/"
            window.location.href = redirect
          }
        }
      } else {
        setMessage(`Login failed: ${data.error}`)
      }
    } catch (error) {
      setMessage(`Error: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  const handleQuickCreate = async () => {
    if (!username) {
      setMessage("Please enter a username")
      return
    }

    setLoading(true)
    setMessage("")

    try {
      const response = await fetch("/api/debug/create-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          password: password || username, // Use username as password if none provided
          email: `${username}@example.com`,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setMessage(`Account created! You can now login.`)
      } else {
        setMessage(`Account creation failed: ${data.error}`)
      }
    } catch (error) {
      setMessage(`Error: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  // Don't render anything with localStorage until client-side
  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-full max-w-md p-4">
          <Card>
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl text-center">Login</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-center">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Login</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Logging in..." : "Login"}
              </Button>
            </form>

            <div className="text-center text-sm">
              <Button variant="link" onClick={handleQuickCreate} disabled={loading}>
                Create account if username doesn't exist
              </Button>
            </div>
          </CardContent>

          {message && (
            <CardContent>
              <Alert>
                <AlertDescription>{message}</AlertDescription>
              </Alert>
            </CardContent>
          )}

          {isAdmin && (
            <CardFooter className="flex flex-col space-y-2 border-t pt-4">
              <div className="text-sm text-center">
                <p className="font-medium">Default Admin Credentials:</p>
                <p>
                  Username: <code>admin</code> / Password: <code>admin123</code>
                </p>
                <p>
                  Username: <code>demo</code> / Password: <code>demo123</code>
                </p>
              </div>
            </CardFooter>
          )}

          <CardFooter className="flex justify-center border-t pt-4">
            <div className="text-sm text-center">
              <Link href="/register" className="text-blue-600 hover:underline">
                Register
              </Link>
              {" | "}
              <Link href="/forgot-password" className="text-blue-600 hover:underline">
                Forgot Password
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
