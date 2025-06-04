"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import AdminNavigation from "@/components/AdminNavigation"
import { AlertCircle, CheckCircle, RefreshCw, Database, Trash2 } from "lucide-react"

export default function DataStorePage() {
  const [status, setStatus] = useState<{
    isInitialized: boolean
    isInitializing: boolean
    error: string | null
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [initializing, setInitializing] = useState(false)
  const [storeData, setStoreData] = useState<any>(null)
  const [loadingData, setLoadingData] = useState(false)

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

  const loadStoreData = async () => {
    try {
      setLoadingData(true)
      const response = await fetch("/api/debug/data-store")
      const data = await response.json()

      if (data.success) {
        setStoreData(data.data)
      } else {
        alert("Failed to load data store: " + (data.error || "Unknown error"))
      }
    } catch (error) {
      console.error("Error loading data store:", error)
      alert("Failed to load data store due to an error")
    } finally {
      setLoadingData(false)
    }
  }

  const clearAllData = async () => {
    if (!confirm("Are you sure you want to clear ALL data? This action cannot be undone!")) {
      return
    }

    try {
      const response = await fetch("/api/debug/data-store", { method: "DELETE" })
      const data = await response.json()

      if (data.success) {
        alert("All data cleared successfully")
        checkStatus()
        setStoreData(null)
      } else {
        alert("Failed to clear data: " + (data.error || "Unknown error"))
      }
    } catch (error) {
      console.error("Error clearing data:", error)
      alert("Failed to clear data due to an error")
    }
  }

  useEffect(() => {
    checkStatus()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNavigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 flex items-center gap-3">
          <Database className="h-8 w-8 text-blue-600" />
          Data Store Management
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>System Status</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center p-4">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-3"></div>
                  <span className="text-gray-600">Checking status...</span>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Status:</span>
                    <div className="flex items-center">
                      {status?.isInitialized ? (
                        <>
                          <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                          <span className="text-green-600">Initialized</span>
                        </>
                      ) : (
                        <>
                          <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                          <span className="text-red-600">Not Initialized</span>
                        </>
                      )}
                    </div>
                  </div>

                  {status?.error && (
                    <div className="bg-red-50 border border-red-200 rounded-md p-3 text-red-600 text-sm">
                      <strong>Error:</strong> {status.error}
                    </div>
                  )}

                  <div className="flex flex-col space-y-2">
                    <Button
                      variant="outline"
                      onClick={checkStatus}
                      disabled={loading}
                      className="flex items-center justify-center"
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Refresh Status
                    </Button>

                    <Button
                      onClick={() => initializeSystem(false)}
                      disabled={initializing || status?.isInitialized}
                      className="flex items-center justify-center"
                    >
                      <Database className="h-4 w-4 mr-2" />
                      Initialize System
                    </Button>

                    <Button
                      variant="secondary"
                      onClick={() => initializeSystem(true)}
                      disabled={initializing}
                      className="flex items-center justify-center"
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Force Reinitialize
                    </Button>

                    <Button variant="destructive" onClick={clearAllData} className="flex items-center justify-center">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Clear All Data
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Data Explorer</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={loadStoreData}
                  disabled={loadingData}
                  className="flex items-center"
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${loadingData ? "animate-spin" : ""}`} />
                  {loadingData ? "Loading..." : "Load Data"}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {loadingData ? (
                <div className="flex items-center justify-center p-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3"></div>
                  <span className="text-gray-600">Loading data store...</span>
                </div>
              ) : storeData ? (
                <Tabs defaultValue="users">
                  <TabsList className="mb-4">
                    <TabsTrigger value="users">Users ({storeData.users?.length || 0})</TabsTrigger>
                    <TabsTrigger value="categories">Categories ({storeData.categories?.length || 0})</TabsTrigger>
                    <TabsTrigger value="posts">Posts ({storeData.posts?.length || 0})</TabsTrigger>
                    <TabsTrigger value="groups">Groups ({storeData.groups?.length || 0})</TabsTrigger>
                    <TabsTrigger value="meets">Meets ({storeData.meets?.length || 0})</TabsTrigger>
                  </TabsList>

                  <TabsContent value="users" className="max-h-96 overflow-auto">
                    <pre className="bg-gray-100 p-4 rounded-md text-sm">{JSON.stringify(storeData.users, null, 2)}</pre>
                  </TabsContent>

                  <TabsContent value="categories" className="max-h-96 overflow-auto">
                    <pre className="bg-gray-100 p-4 rounded-md text-sm">
                      {JSON.stringify(storeData.categories, null, 2)}
                    </pre>
                  </TabsContent>

                  <TabsContent value="posts" className="max-h-96 overflow-auto">
                    <pre className="bg-gray-100 p-4 rounded-md text-sm">{JSON.stringify(storeData.posts, null, 2)}</pre>
                  </TabsContent>

                  <TabsContent value="groups" className="max-h-96 overflow-auto">
                    <pre className="bg-gray-100 p-4 rounded-md text-sm">
                      {JSON.stringify(storeData.groups, null, 2)}
                    </pre>
                  </TabsContent>

                  <TabsContent value="meets" className="max-h-96 overflow-auto">
                    <pre className="bg-gray-100 p-4 rounded-md text-sm">{JSON.stringify(storeData.meets, null, 2)}</pre>
                  </TabsContent>
                </Tabs>
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
                  <Database className="h-12 w-12 text-gray-400 mx-auto" />
                  <h3 className="mt-4 text-lg font-medium text-gray-900">No data loaded</h3>
                  <p className="mt-2 text-gray-500">Click "Load Data" to view the contents of the data store</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
