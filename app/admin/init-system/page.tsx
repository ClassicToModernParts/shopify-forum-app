"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"

export default function InitSystemPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [systemStatus, setSystemStatus] = useState<any>(null)

  const checkSystemStatus = async () => {
    try {
      const response = await fetch("/api/admin/init-system")
      const data = await response.json()
      setSystemStatus(data)
    } catch (error) {
      console.error("Error checking system status:", error)
    }
  }

  const initializeSystem = async () => {
    setIsLoading(true)
    setResult(null)

    try {
      const response = await fetch("/api/admin/init-system", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      const data = await response.json()
      setResult(data)

      if (data.success) {
        // Refresh system status
        await checkSystemStatus()
      }
    } catch (error) {
      console.error("Error initializing system:", error)
      setResult({
        success: false,
        message: "Failed to initialize system",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Check status on component mount
  useState(() => {
    checkSystemStatus()
  })

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold mb-6">System Initialization</h1>

          {/* System Status */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h2 className="text-lg font-semibold mb-2">Current System Status</h2>
            {systemStatus ? (
              <div className="space-y-2">
                <p>
                  <span className="font-medium">Status:</span>{" "}
                  <span
                    className={`px-2 py-1 rounded text-sm ${
                      systemStatus.isInitialized ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                    }`}
                  >
                    {systemStatus.isInitialized ? "Initialized" : "Not Initialized"}
                  </span>
                </p>
                <p>
                  <span className="font-medium">Users:</span> {systemStatus.stats?.users || 0}
                </p>
                <p>
                  <span className="font-medium">Categories:</span> {systemStatus.stats?.categories || 0}
                </p>
                <p>
                  <span className="font-medium">Posts:</span> {systemStatus.stats?.posts || 0}
                </p>
              </div>
            ) : (
              <p>Loading status...</p>
            )}
          </div>

          {/* Initialize Button */}
          <div className="mb-6">
            <Button
              onClick={initializeSystem}
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isLoading ? "Initializing..." : "Initialize System"}
            </Button>
            <Button onClick={checkSystemStatus} variant="outline" className="ml-2">
              Refresh Status
            </Button>
          </div>

          {/* Results */}
          {result && (
            <div className="p-4 rounded-lg border">
              <h3 className="font-semibold mb-2">Initialization Result</h3>
              <div
                className={`p-3 rounded ${result.success ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"}`}
              >
                <p className="font-medium">{result.message}</p>
                {result.success && result.data && (
                  <div className="mt-2 text-sm">
                    <p>Admin Username: {result.data.adminUser?.username}</p>
                    <p>Default Password: {result.data.defaultPassword}</p>
                    <p>Categories Created: {result.data.categoriesCreated}</p>
                    <p className="text-red-600 font-medium mt-2">
                      ⚠️ Please change the default admin password immediately!
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">Instructions</h3>
            <ul className="text-blue-700 text-sm space-y-1">
              <li>• Click "Initialize System" to create default admin user and categories</li>
              <li>• Default admin credentials: username "admin", password "admin123"</li>
              <li>• Change the admin password immediately after initialization</li>
              <li>• This will create basic categories and a welcome post</li>
              <li>• Run this after each deployment to restore essential data</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
