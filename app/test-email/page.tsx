"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface ProviderInfo {
  name: string
  configured: boolean
  details: string
}

export default function TestEmailPage() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string; provider?: ProviderInfo } | null>(null)
  const [providerInfo, setProviderInfo] = useState<ProviderInfo | null>(null)

  useEffect(() => {
    // Get provider info on load
    fetch("/api/test-email")
      .then((res) => res.json())
      .then((data) => setProviderInfo(data.provider))
      .catch(console.error)
  }, [])

  const sendTestEmail = async () => {
    if (!email) {
      setResult({ success: false, message: "Please enter an email address" })
      return
    }

    setLoading(true)
    setResult(null)

    try {
      const response = await fetch("/api/test-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()
      setResult(data)
    } catch (error) {
      setResult({ success: false, message: "Network error occurred" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>📧 Email Service Test</CardTitle>
          <CardDescription>Test your email configuration</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Input
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <Button onClick={sendTestEmail} disabled={loading} className="w-full">
            {loading ? "Sending..." : "Send Test Email"}
          </Button>

          {result && (
            <div
              className={`p-4 rounded-lg ${
                result.success
                  ? "bg-green-50 text-green-800 border border-green-200"
                  : "bg-red-50 text-red-800 border border-red-200"
              }`}
            >
              <div className="flex items-center gap-2">
                <span>{result.success ? "✅" : "❌"}</span>
                <span className="font-medium">{result.success ? "Success!" : "Failed"}</span>
              </div>
              <p className="mt-1 text-sm">{result.message}</p>
              {result.provider && <p className="mt-1 text-xs">Provider: {result.provider.name}</p>}
            </div>
          )}

          {providerInfo && (
            <div className="text-sm space-y-2 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                <span>{providerInfo.configured ? "✅" : "⚠️"}</span>
                <span className="font-medium">Email Provider: {providerInfo.name}</span>
              </div>
              <p className="text-gray-600">{providerInfo.details}</p>

              {!providerInfo.configured && (
                <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded text-blue-800">
                  <p className="font-medium">To set up Resend:</p>
                  <ol className="text-xs mt-1 space-y-1">
                    <li>
                      1. Go to{" "}
                      <a href="https://resend.com" target="_blank" className="underline" rel="noreferrer">
                        resend.com
                      </a>
                    </li>
                    <li>2. Sign up for free (3,000 emails/month)</li>
                    <li>3. Get your API key</li>
                    <li>4. Add it as RESEND_API_KEY environment variable</li>
                  </ol>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
