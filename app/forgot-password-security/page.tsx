"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Link from "next/link"

export default function ForgotPasswordSecurityPage() {
  const [step, setStep] = useState<"username" | "question">("username")
  const [username, setUsername] = useState("")
  const [securityQuestion, setSecurityQuestion] = useState("")
  const [securityAnswer, setSecurityAnswer] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleUsernameSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setMessage("")
    setIsLoading(true)

    try {
      const response = await fetch("/api/auth/reset-password-security", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          step: "getQuestion",
        }),
      })

      const data = await response.json()

      if (data.success) {
        setSecurityQuestion(data.securityQuestion)
        setStep("question")
      } else {
        setError(data.message)
      }
    } catch (error) {
      setError("Failed to retrieve security question. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setMessage("")

    // Validate passwords match
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    // Validate password length
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters long")
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch("/api/auth/reset-password-security", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          securityAnswer,
          newPassword,
          step: "resetPassword",
        }),
      })

      const data = await response.json()

      if (data.success) {
        setMessage(data.message)
        // Redirect to login after 3 seconds
        setTimeout(() => {
          router.push("/login")
        }, 3000)
      } else {
        setError(data.message)
      }
    } catch (error) {
      setError("Failed to reset password. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Reset Password</CardTitle>
          <CardDescription className="text-center">
            {step === "username"
              ? "Enter your username to retrieve your security question"
              : "Answer your security question to reset your password"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === "username" ? (
            <form onSubmit={handleUsernameSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Getting Question..." : "Get Security Question"}
              </Button>
            </form>
          ) : (
            <form onSubmit={handlePasswordReset} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {message && (
                <Alert>
                  <AlertDescription>
                    {message}
                    <br />
                    <span className="text-sm text-gray-600">Redirecting to login page...</span>
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label>Security Question</Label>
                <div className="p-3 bg-gray-50 rounded-md border">
                  <p className="text-sm font-medium">{securityQuestion}</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="securityAnswer">Your Answer</Label>
                <Input
                  id="securityAnswer"
                  type="text"
                  placeholder="Enter your answer"
                  value={securityAnswer}
                  onChange={(e) => setSecurityAnswer(e.target.value)}
                  required
                  disabled={!!message}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  placeholder="Enter your new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  disabled={!!message}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm your new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={!!message}
                />
              </div>

              <Button type="submit" className="w-full" disabled={isLoading || !!message}>
                {isLoading ? "Resetting Password..." : "Reset Password"}
              </Button>

              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => setStep("username")}
                disabled={isLoading || !!message}
              >
                Back to Username
              </Button>
            </form>
          )}

          <div className="mt-4 text-center text-sm">
            <Link href="/login" className="text-blue-600 hover:underline">
              Back to Sign In
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
