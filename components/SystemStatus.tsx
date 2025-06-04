"use client"

import { useState, useEffect } from "react"
import { AlertCircle, CheckCircle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function SystemStatus() {
  const [status, setStatus] = useState<{
    isInitialized: boolean
    isInitializing: boolean
    error: string | null
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [initializing, setInitializing] = useState(false)

  const checkStatus = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/system/init")
      const data = await response.json()

      if (data.success) {
        setStatus(data.status)
      } else {
        setStatus({
          isInitialized: false,
          isInitializing: false,
          error: data.error || "Unknown error",
        })
      }
    } catch (error) {
      console.error("Error checking system status:", error)
      setStatus({
        isInitialized: false,
        isInitializing: false,
        error: "Failed to check system status",
      })
    } finally {
      setLoading(false)
    }
  }

  const initializeSystem = async (force = false) => {
    try {
      setInitializing(true)
      const url = force ? "/api/system/init?force=true" : "/api/system/init"
      const response = await fetch(url, { method: "POST" })
      const data = await response.json()

      if (data.success) {
        setStatus(data.status)
        alert(data.message)
      } else {
        setStatus({
          isInitialized: false,
          isInitializing: false,
          error: data.error || "Unknown error",
        })
        alert("Failed to initialize system: " + (data.error || "Unknown error"))
      }
    } catch (error) {
      console.error("Error initializing system:", error)
      setStatus({
        isInitialized: false,
        isInitializing: false,
        error: "Failed to initialize system",
      })
      alert("Failed to initialize system due to an error")
    } finally {
      setInitializing(false)
    }
  }

  useEffect(() => {
    checkStatus()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4 bg-gray-50 rounded-lg">
        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-3"></div>
        <span className="text-gray-600">Checking system status...</span>
      </div>
    )
  }

  if (!status) {
    return null
  }

  return (
    <div className="p-4 rounded-lg border">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-medium">System Status</h3>
        <Button variant="ghost" size="sm" onClick={checkStatus} disabled={initializing}>
          <RefreshCw className="h-4 w-4 mr-1" />
          Refresh
        </Button>
      </div>

      <div className="space-y-2">
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full mr-2 bg-gray-300">
            {status.isInitialized && <div className="w-3 h-3 rounded-full bg-green-500"></div>}
            {!status.isInitialized && <div className="w-3 h-3 rounded-full bg-red-500"></div>}
          </div>
          <span className="text-sm">{status.isInitialized ? "System initialized" : "System not initialized"}</span>
        </div>

        {status.error && (
          <div className="flex items-start text-red-600 text-sm">
            <AlertCircle className="h-4 w-4 mr-1 mt-0.5 flex-shrink-0" />
            <span>{status.error}</span>
          </div>
        )}

        {!status.isInitialized && (
          <div className="flex space-x-2 mt-2">
            <Button size="sm" onClick={() => initializeSystem(false)} disabled={initializing}>
              {initializing ? "Initializing..." : "Initialize System"}
            </Button>
            <Button size="sm" variant="outline" onClick={() => initializeSystem(true)} disabled={initializing}>
              Force Reinitialize
            </Button>
          </div>
        )}

        {status.isInitialized && (
          <div className="flex items-center text-green-600 text-sm">
            <CheckCircle className="h-4 w-4 mr-1" />
            <span>System is ready</span>
          </div>
        )}
      </div>
    </div>
  )
}
