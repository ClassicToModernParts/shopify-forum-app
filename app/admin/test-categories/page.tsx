"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, CheckCircle, RefreshCw, Edit, Trash2 } from "lucide-react"

interface Category {
  id: string
  name: string
  description: string
  postCount: number
  color: string
  icon: string
  isPrivate: boolean
  createdAt: string
  updatedAt: string
}

export default function TestCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const addResult = (test: string, success: boolean, data: any) => {
    setResults((prev) => [
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

      return { success: response.ok, data }
    } catch (error) {
      addResult(`${method} ${endpoint}`, false, {
        error: error instanceof Error ? error.message : "Unknown error",
      })
      return { success: false, error }
    }
  }

  const loadCategories = async () => {
    setLoading(true)
    const result = await testAPI("/api/admin/categories?include_private=true", "GET")
    if (result.success && result.data.success) {
      setCategories(result.data.data)
    }
    setLoading(false)
  }

  const testCreateCategory = async () => {
    await testAPI("/api/admin/categories", "POST", {
      name: "Test Category " + Date.now(),
      description: "This is a test category",
      color: "#FF5733",
      icon: "TestIcon",
      isPrivate: false,
    })
    loadCategories()
  }

  const testUpdateCategory = async (categoryId: string) => {
    await testAPI("/api/admin/categories", "PUT", {
      categoryId,
      updates: {
        name: "Updated Category " + Date.now(),
        description: "This category has been updated",
      },
    })
    loadCategories()
  }

  const testDeleteCategory = async (categoryId: string) => {
    await testAPI("/api/admin/categories", "DELETE", {
      categoryId,
    })
    loadCategories()
  }

  const clearResults = () => setResults([])

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Category Management Test</h1>
        <p className="text-gray-600">Test category CRUD operations</p>
      </div>

      <div className="flex gap-4 flex-wrap">
        <Button onClick={loadCategories} disabled={loading}>
          {loading ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : "Load Categories"}
        </Button>
        <Button onClick={testCreateCategory}>Create Test Category</Button>
        <Button onClick={clearResults} variant="outline">
          Clear Results
        </Button>
        <Badge variant="outline">{results.length} tests completed</Badge>
      </div>

      {/* Categories Display */}
      <Card>
        <CardHeader>
          <CardTitle>Current Categories ({categories.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {categories.length === 0 ? (
            <p className="text-gray-500">No categories loaded. Click "Load Categories" to fetch them.</p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {categories.map((category) => (
                <Card key={category.id} className="border-l-4" style={{ borderLeftColor: category.color }}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{category.name}</CardTitle>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => testUpdateCategory(category.id)}
                          title="Test update"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => testDeleteCategory(category.id)}
                          disabled={category.postCount > 0}
                          className="text-red-600 hover:text-red-700"
                          title="Test delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <CardDescription>{category.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm">
                      <span>{category.postCount} posts</span>
                      <div className="flex gap-1">
                        {category.isPrivate && (
                          <Badge variant="secondary" className="text-xs">
                            Private
                          </Badge>
                        )}
                        <Badge variant="outline" className="text-xs">
                          {category.icon}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Test Results */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Test Results</h2>
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
                  {result.test}
                </CardTitle>
                <Badge variant={result.success ? "default" : "destructive"}>{result.success ? "PASS" : "FAIL"}</Badge>
              </div>
            </CardHeader>
            <CardContent>
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
            <p className="text-gray-500">No tests run yet. Click buttons above to start testing.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
