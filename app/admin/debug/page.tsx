"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, CheckCircle, RefreshCw } from "lucide-react"

interface TestResult {
  name: string
  endpoint: string
  method: string
  success: boolean
  status?: number
  data?: any
  error?: string
  timestamp: string
}

export default function AdminDebugPage() {
  const [results, setResults] = useState<TestResult[]>([])
  const [testing, setTesting] = useState(false)

  const addResult = (result: Omit<TestResult, "timestamp">) => {
    setResults((prev) => [...prev, { ...result, timestamp: new Date().toISOString() }])
  }

  const testEndpoint = async (name: string, endpoint: string, method = "GET", body?: any) => {
    try {
      const options: RequestInit = {
        method,
        headers: { "Content-Type": "application/json" },
      }

      if (body) {
        options.body = JSON.stringify(body)
      }

      const response = await fetch(endpoint, options)
      const data = await response.json()

      addResult({
        name,
        endpoint,
        method,
        success: response.ok,
        status: response.status,
        data,
        error: response.ok ? undefined : data.error || "Request failed",
      })
    } catch (error) {
      addResult({
        name,
        endpoint,
        method,
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      })
    }
  }

  const runAllTests = async () => {
    setTesting(true)
    setResults([])

    // Test basic API endpoints
    await testEndpoint("Forum Categories", "/api/forum?type=categories&shop_id=demo")
    await testEndpoint("Forum Posts", "/api/forum?type=posts&shop_id=demo")
    await testEndpoint("Forum Stats", "/api/forum/stats?shop_id=demo")

    // Test admin API endpoints
    await testEndpoint("Admin Posts GET", "/api/admin/posts")
    await testEndpoint("Admin Settings GET", "/api/admin/settings")

    // Test admin auth
    await testEndpoint("Admin Auth", "/api/admin/auth", "POST", {
      username: "admin",
      password: "admin123",
    })

    // Test admin post actions
    await testEndpoint("Admin Post Pin", "/api/admin/posts", "POST", {
      action: "pin",
      postId: "1",
    })

    // Test settings save
    await testEndpoint("Admin Settings Save", "/api/admin/settings", "POST", {
      settings: {
        general: { forumName: "Test Forum" },
        moderation: { requireApproval: false },
        appearance: { primaryColor: "#3B82F6" },
        notifications: { emailNotifications: true },
      },
    })

    setTesting(false)
  }

  const clearResults = () => setResults([])

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Admin Debug Panel</h1>
        <p className="text-gray-600">Test all admin functionality and API endpoints</p>
      </div>

      <div className="flex gap-4">
        <Button onClick={runAllTests} disabled={testing}>
          {testing ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Testing...
            </>
          ) : (
            "Run All Tests"
          )}
        </Button>
        <Button variant="outline" onClick={clearResults}>
          Clear Results
        </Button>
        <Badge variant="outline">{results.length} tests completed</Badge>
      </div>

      <div className="grid gap-4">
        {results.map((result, index) => (
          <Card key={index} className={`border-l-4 ${result.success ? "border-green-500" : "border-red-500"}`}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  {result.success ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-red-600" />
                  )}
                  {result.name}
                </CardTitle>
                <div className="flex gap-2">
                  <Badge variant={result.success ? "default" : "destructive"}>{result.success ? "PASS" : "FAIL"}</Badge>
                  {result.status && <Badge variant="outline">{result.status}</Badge>}
                </div>
              </div>
              <CardDescription>
                {result.method} {result.endpoint}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {result.error && (
                <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded text-red-800 text-sm">
                  <strong>Error:</strong> {result.error}
                </div>
              )}
              <details className="cursor-pointer">
                <summary className="text-sm font-medium mb-2">Response Data</summary>
                <pre className="bg-gray-100 p-3 rounded text-xs overflow-auto max-h-40">
                  {JSON.stringify(result.data, null, 2)}
                </pre>
              </details>
              <p className="text-xs text-gray-500 mt-2">{new Date(result.timestamp).toLocaleString()}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {results.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-gray-500">No tests run yet. Click "Run All Tests" to start debugging.</p>
          </CardContent>
        </Card>
      )}

      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-900">Debug Instructions</CardTitle>
        </CardHeader>
        <CardContent className="text-blue-800 text-sm space-y-2">
          <p>
            <strong>1.</strong> Run all tests to see which endpoints are failing
          </p>
          <p>
            <strong>2.</strong> Check the browser console for JavaScript errors
          </p>
          <p>
            <strong>3.</strong> Verify you're logged in as admin first
          </p>
          <p>
            <strong>4.</strong> Look for 404 errors indicating missing API routes
          </p>
          <p>
            <strong>5.</strong> Check for CORS or authentication issues
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
