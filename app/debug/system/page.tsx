"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { RefreshCw, Database, Users, Settings } from "lucide-react"

export default function SystemDebugPage() {
  const [status, setStatus] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const checkStatus = async () => {
    setLoading(true)
    setError("")
    try {
      const response = await fetch("/api/system/status")
      const data = await response.json()

      if (data.success) {
        setStatus(data.status)
      } else {
        setError(data.error || "Failed to get status")
      }
    } catch (err) {
      setError("Error checking status")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const initializeSystem = async () => {
    setLoading(true)
    setError("")
    try {
      const response = await fetch("/api/system/initialize", { method: "POST" })
      const data = await response.json()

      if (data.success) {
        setStatus(data.status)
        alert("System initialized successfully!")
      } else {
        setError(data.error || "Failed to initialize")
      }
    } catch (err) {
      setError("Error initializing system")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    checkStatus()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">System Debug</h1>
          <p className="text-gray-600">Check and manage system status</p>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Storage Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              {status ? (
                <div className="space-y-2">
                  <p>
                    <strong>Initialized:</strong> {status.isInitialized ? "✅ Yes" : "❌ No"}
                  </p>
                  <p>
                    <strong>Storage Type:</strong> {status.storageType}
                  </p>
                  <p>
                    <strong>Initialized At:</strong> {status.initializedAt || "Never"}
                  </p>
                </div>
              ) : (
                <p className="text-gray-500">Loading...</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Data Statistics
              </CardTitle>
            </CardHeader>
            <CardContent>
              {status?.stats ? (
                <div className="space-y-2">
                  <p>
                    <strong>Users:</strong> {status.stats.users}
                  </p>
                  <p>
                    <strong>Categories:</strong> {status.stats.categories}
                  </p>
                  <p>
                    <strong>Posts:</strong> {status.stats.posts}
                  </p>
                  <p>
                    <strong>Replies:</strong> {status.stats.replies}
                  </p>
                  <p>
                    <strong>Meets:</strong> {status.stats.meets}
                  </p>
                </div>
              ) : (
                <p className="text-gray-500">Loading...</p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="flex gap-4">
          <Button onClick={checkStatus} disabled={loading} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Status
          </Button>

          <Button onClick={initializeSystem} disabled={loading}>
            <Settings className="h-4 w-4 mr-2" />
            Initialize System
          </Button>
        </div>

        {status && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Raw Status Data</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">{JSON.stringify(status, null, 2)}</pre>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
