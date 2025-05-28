"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export default function TestSettingsPage() {
  const [testResults, setTestResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const addResult = (test: string, success: boolean, data: any) => {
    setTestResults((prev) => [
      ...prev,
      {
        test,
        success,
        data,
        timestamp: new Date().toISOString(),
      },
    ])
  }

  const testAPI = async (endpoint: string, method: string, body?: any) => {
    setLoading(true)
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

      addResult(`${method} ${endpoint}`, response.ok, {
        status: response.status,
        data,
      })
    } catch (error) {
      addResult(`${method} ${endpoint}`, false, {
        error: error instanceof Error ? error.message : "Unknown error",
      })
    } finally {
      setLoading(false)
    }
  }

  const testSettingsGet = () => {
    testAPI("/api/admin/settings", "GET")
  }

  const testSettingsPost = () => {
    const testSettings = {
      settings: {
        general: {
          forumName: "TEST FORUM - " + Date.now(),
          description: "Test description",
          welcomeMessage: "Test welcome message",
          contactEmail: "test@example.com",
        },
        moderation: {
          requireApproval: true,
          autoSpamDetection: false,
          allowAnonymous: true,
          enableReporting: false,
          maxPostLength: 1000,
        },
        appearance: {
          primaryColor: "#FF0000",
          accentColor: "#00FF00",
          darkMode: true,
          customCSS: "/* test css */",
        },
        notifications: {
          emailNotifications: false,
          newPostNotifications: false,
          moderationAlerts: false,
        },
      },
    }
    testAPI("/api/admin/settings", "POST", testSettings)
  }

  const testBasicAPI = () => {
    testAPI("/api/admin/test-settings", "GET")
  }

  const testBasicPost = () => {
    testAPI("/api/admin/test-settings", "POST", { test: "data", timestamp: Date.now() })
  }

  const clearResults = () => {
    setTestResults([])
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings API Test</h1>
        <p className="text-gray-600">Debug the forum settings functionality</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Button onClick={testBasicAPI} disabled={loading}>
          Test Basic GET
        </Button>
        <Button onClick={testBasicPost} disabled={loading}>
          Test Basic POST
        </Button>
        <Button onClick={testSettingsGet} disabled={loading}>
          Test Settings GET
        </Button>
        <Button onClick={testSettingsPost} disabled={loading}>
          Test Settings POST
        </Button>
      </div>

      <div className="flex gap-2">
        <Button onClick={clearResults} variant="outline">
          Clear Results
        </Button>
        <Badge variant="outline">{testResults.length} tests run</Badge>
      </div>

      <div className="space-y-4">
        {testResults.map((result, index) => (
          <Card key={index} className={result.success ? "border-green-500" : "border-red-500"}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{result.test}</CardTitle>
                <Badge variant={result.success ? "default" : "destructive"}>
                  {result.success ? "✅ Success" : "❌ Failed"}
                </Badge>
              </div>
              <CardDescription>{new Date(result.timestamp).toLocaleString()}</CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">
                {JSON.stringify(result.data, null, 2)}
              </pre>
            </CardContent>
          </Card>
        ))}
      </div>

      {testResults.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-gray-500">No tests run yet. Click a button above to start testing.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
