"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import InitializeSystemButton from "@/components/InitializeSystemButton"
import { ArrowLeft, CheckCircle, XCircle } from "lucide-react"

export default function InitializePage() {
  const [systemStatus, setSystemStatus] = useState<{
    isInitialized: boolean
    loading: boolean
    error: string | null
  }>({
    isInitialized: false,
    loading: true,
    error: null,
  })

  useEffect(() => {
    const checkSystemStatus = async () => {
      try {
        const response = await fetch("/api/system/init")
        const data = await response.json()

        setSystemStatus({
          isInitialized: data.success && data.status?.isInitialized,
          loading: false,
          error: data.success ? null : data.error,
        })
      } catch (error) {
        setSystemStatus({
          isInitialized: false,
          loading: false,
          error: "Failed to check system status",
        })
      }
    }

    checkSystemStatus()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">CTM Community System</CardTitle>
          <CardDescription>Initialize the system to start using the community features</CardDescription>
        </CardHeader>

        <CardContent>
          {systemStatus.loading ? (
            <div className="flex justify-center py-6">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : systemStatus.isInitialized ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
              <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <p className="text-green-700 font-medium">System is already initialized!</p>
              <p className="text-green-600 text-sm mt-1">You can now use all community features</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-yellow-800">System needs to be initialized before you can use community features.</p>
              </div>

              <div className="flex justify-center pt-2">
                <InitializeSystemButton />
              </div>
            </div>
          )}

          {systemStatus.error && (
            <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
              <XCircle className="h-5 w-5 text-red-500 inline mr-2" />
              <span className="text-red-700">{systemStatus.error}</span>
            </div>
          )}

          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-medium text-blue-800 mb-2">Default Login Credentials</h3>
            <div className="text-sm text-blue-700 space-y-1">
              <p>
                <strong>Admin:</strong> admin / admin123
              </p>
              <p>
                <strong>Demo:</strong> demo / demo123
              </p>
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex justify-between">
          <Link href="/">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>

          <Link href="/login">
            <Button>Go to Login</Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}
