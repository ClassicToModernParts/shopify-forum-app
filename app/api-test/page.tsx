"use client"

import { useState } from "react"

export default function ApiTestPage() {
  const [result, setResult] = useState("")
  const [loading, setLoading] = useState(false)

  const testAPI = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/forum?type=categories&shop_id=demo")
      const data = await response.json()
      setResult(JSON.stringify(data, null, 2))
    } catch (error) {
      setResult("Error: " + error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Forum API Test</h1>
      
      <button 
        onClick={testAPI}
        disabled={loading}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? "Testing..." : "Test API"}
      </button>

      {result && (
        <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm">
          {result}
        </pre>
      )}
    </div>
  )
}
