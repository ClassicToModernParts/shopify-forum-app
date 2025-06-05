"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Shield } from "lucide-react"
import Link from "next/link"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage("")
    setError("")

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (data.success) {
        setMessage(data.message)
        setEmail("")
      } else {
        setError(data.message || "Failed to send password reset email")
      }
    } catch (error) {
      console.error("Forgot password error:", error)
      setError("Network error. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Back to Login */}
        <Link
          href="/login"
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Login
        </Link>

        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-blue-600" />
            </div>
            <CardTitle className="text-2xl font-bold">Reset Password</CardTitle>
            <CardDescription>Choose how you'd like to reset your password</CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Security Questions Option */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-3">
                <Shield className="w-5 h-5 text-blue-600" />
                <h3 className="font-medium text-lg">Reset via Security Questions</h3>
              </div>

              <p className="text-gray-600 mb-4">
                Answer your security questions to reset your password securely without email verification.
              </p>

              <Link href="/forgot-password-security" className="block">
                <Button className="w-full" size="lg">
                  <Shield className="w-4 h-4 mr-2" />
                  Continue with Security Questions
                </Button>
              </Link>
            </div>

            {/* Admin Contact */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Need Help?</h3>
              <p className="text-xs text-gray-600">
                If you can't remember your security questions, contact support at{" "}
                <a href="mailto:support@classictomodernparts.com" className="text-blue-600 hover:underline">
                  support@classictomodernparts.com
                </a>
              </p>
            </div>
          </CardContent>

          {/* Additional Help */}
          <div className="text-center text-sm text-gray-600">
            Remember your password?{" "}
            <Link href="/login" className="text-blue-600 hover:text-blue-800 font-medium">
              Sign in here
            </Link>
          </div>
        </Card>
      </div>
    </div>
  )
}
