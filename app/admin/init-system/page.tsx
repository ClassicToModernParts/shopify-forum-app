"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, AlertCircle, RefreshCw, ArrowRight } from "lucide-react"
import Link from "next/link"

export default function InitSystemPage() {
  const [loading, setLoading] = useState(true)
  const [initializing, setInitializing] = useState(false)
  const [status, setStatus] = useState<{
    hasCategories: boolean
    hasUsers: boolean
    isReady: boolean
  } | null>(null)
  const [error, setError] = useState<string | null>(null)

  const checkStatus = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch("/api/admin/init-system")
      const data = await response.json()

      if (data.success) {
        setStatus(data.data)
      } else {
        setError(data.error || "Failed to check system status")
      }
    } catch (err) {
      setError("An error occurred while checking system status")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const initializeSystem = async () => {
    try {
      setInitializing(true)
      setError(null)

      const response = await fetch("/api/admin/init-system", {
        method: "POST",
      })
      const data = await response.json()

      if (data.success) {
        await checkStatus()
      } else {
        setError(data.error || "Failed to initialize system")
      }
    } catch (err) {
      setError("An error occurred while initializing the system")
      console.error(err)
    } finally {
      setInitializing(false)
    }
  }

  useEffect(() => {
    checkStatus()
  }, [])

  return (
    <div className="container mx-auto p-6">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>System Initialization</CardTitle>
          <CardDescription>Initialize your forum system with default data</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              <p>{error}</p>
            </div>
          )}

          {loading ? (
            <div className="text-center py-8">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
              <p className="text-gray-600">Checking system status...</p>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                <h3 className="text-lg font-medium">System Status</h3>
                <div className="grid gap-2">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                    <span>Admin Users</span>
                    {status?.hasUsers ? (
                      <span className="flex items-center text-green-600">
                        <CheckCircle className="h-5 w-5 mr-1" />
                        Available
                      </span>
                    ) : (
                      <span className="text-amber-600">Missing</span>
                    )}
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                    <span>Forum Categories</span>
                    {status?.hasCategories ? (
                      <span className="flex items-center text-green-600">
                        <CheckCircle className="h-5 w-5 mr-1" />
                        Available
                      </span>
                    ) : (
                      <span className="text-amber-600">Missing</span>
                    )}
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                    <span>Overall Status</span>
                    {status?.isReady ? (
                      <span className="flex items-center text-green-600">
                        <CheckCircle className="h-5 w-5 mr-1" />
                        Ready
                      </span>
                    ) : (
                      <span className="text-amber-600">Needs Initialization</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={checkStatus} disabled={loading}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh Status
                </Button>

                {status?.isReady ? (
                  <Link href="/admin">
                    <Button>
                      Go to Admin Panel
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                ) : (
                  <Button onClick={initializeSystem} disabled={initializing}>
                    {initializing ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Initializing...
                      </>
                    ) : (
                      "Initialize System"
                    )}
                  </Button>
                )}
              </div>

              {status?.isReady && (
                <div className="bg-blue-50 border border-blue-200 text-blue-700 p-4 rounded-md mt-4">
                  <p className="font-medium mb-1">Default Admin Credentials:</p>
                  <p>
                    Username: <code className="bg-blue-100 px-1 py-0.5 rounded">admin</code>
                  </p>
                  <p>
                    Password: <code className="bg-blue-100 px-1 py-0.5 rounded">admin123</code>
                  </p>
                  <p className="text-sm mt-2 text-blue-600">
                    Please change this password immediately after logging in!
                  </p>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
