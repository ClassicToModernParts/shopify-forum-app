"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"

const SECURITY_QUESTIONS = [
  "What was the name of your first pet?",
  "What is your mother's maiden name?",
  "What city were you born in?",
  "What was the name of your elementary school?",
  "What is your favorite movie?",
  "What was the make of your first car?",
  "What is your favorite food?",
  "What was your childhood nickname?",
  "What is the name of your best friend from childhood?",
  "What street did you grow up on?",
]

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    password: "",
    confirmPassword: "",
    securityQuestion: "",
    securityAnswer: "",
  })
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSecurityQuestionChange = (value: string) => {
    setFormData({
      ...formData,
      securityQuestion: value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      return
    }

    // Validate password length
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long")
      return
    }

    // Validate username
    if (formData.username.length < 3) {
      setError("Username must be at least 3 characters long")
      return
    }

    // Validate security question and answer
    if (!formData.securityQuestion || !formData.securityAnswer.trim()) {
      setError("Please select a security question and provide an answer")
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          username: formData.username,
          password: formData.password,
          securityQuestion: formData.securityQuestion,
          securityAnswer: formData.securityAnswer,
        }),
      })

      const data = await response.json()

      if (data.success) {
        // Auto-login after registration
        const loginResponse = await fetch("/api/auth/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: formData.username,
            password: formData.password,
          }),
        })

        const loginData = await loginResponse.json()

        if (loginData.success) {
          // Store user data in localStorage
          localStorage.setItem("user", JSON.stringify(loginData.user))
          router.push("/forum")
        } else {
          router.push("/login")
        }
      } else {
        setError(data.message)
      }
    } catch (error) {
      setError("Registration failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Create Account</CardTitle>
          <CardDescription className="text-center">Enter your information to create your account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                name="username"
                type="text"
                placeholder="Choose a username"
                value={formData.username}
                onChange={handleChange}
                required
              />
              <p className="text-xs text-gray-500">You'll use this to sign in</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Create a password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="securityQuestion">Security Question</Label>
              <Select onValueChange={handleSecurityQuestionChange} required>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a security question" />
                </SelectTrigger>
                <SelectContent>
                  {SECURITY_QUESTIONS.map((question, index) => (
                    <SelectItem key={index} value={question}>
                      {question}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="securityAnswer">Security Answer</Label>
              <Input
                id="securityAnswer"
                name="securityAnswer"
                type="text"
                placeholder="Enter your answer"
                value={formData.securityAnswer}
                onChange={handleChange}
                required
              />
              <p className="text-xs text-gray-500">This will be used to reset your password if needed</p>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Creating Account..." : "Create Account"}
            </Button>
          </form>

          <div className="mt-4 text-center text-sm">
            Already have an account?{" "}
            <Link href="/login" className="text-blue-600 hover:underline">
              Sign in
            </Link>
          </div>

          <div className="mt-2 text-center">
            <Link href="/forum" className="text-sm text-gray-600 hover:underline">
              Continue as guest
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
