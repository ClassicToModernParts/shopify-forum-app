"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

interface EmailStatus {
  configured: boolean
  provider: string
  details: string
  keyPrefix?: string
}

export default function EmailSetupPage() {
  const [status, setStatus] = useState<EmailStatus | null>(null)
  const [testEmail, setTestEmail] = useState("")
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null)

  const checkStatus = async () => {
    try {
      const response = await fetch("/api/test-email")
      const data = await response.json()
      setStatus(data.provider)
    } catch (error) {
      console.error("Failed to check email status:", error)
    }
  }

  const testEmailService = async () => {
    if (!testEmail) return

    setTesting(true)
    setTestResult(null)

    try {
      const response = await fetch("/api/test-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: testEmail }),
      })

      const data = await response.json()
      setTestResult(data)
    } catch (error) {
      setTestResult({ success: false, message: "Network error" })
    } finally {
      setTesting(false)
    }
  }

  useEffect(() => {
    checkStatus()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>📧 Email Service Setup</CardTitle>
            <CardDescription>Configure and test your email service</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {status && (
              <div
                className={`p-4 rounded-lg border ${
                  status.configured
                    ? "bg-green-50 border-green-200 text-green-800"
                    : "bg-yellow-50 border-yellow-200 text-yellow-800"
                }`}
              >
                <div className="flex items-center gap-2 font-medium">
                  <span>{status.configured ? "✅" : "⚠️"}</span>
                  <span>Provider: {status.provider}</span>
                </div>
                <p className="mt-1 text-sm">{status.details}</p>
                {status.keyPrefix && <p className="mt-1 text-xs">Key prefix: {status.keyPrefix}</p>}
              </div>
            )}

            <Button onClick={checkStatus} variant="outline" className="w-full">
              🔄 Refresh Status
            </Button>
          </CardContent>
        </Card>

        {!status?.configured && (
          <Card>
            <CardHeader>
              <CardTitle>🔧 Setup Instructions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <span className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium">
                    1
                  </span>
                  <div>
                    <p className="font-medium">Sign up for Resend</p>
                    <p className="text-sm text-gray-600">
                      Go to{" "}
                      <a href="https://resend.com" target="_blank" className="text-blue-600 underline" rel="noreferrer">
                        resend.com
                      </a>{" "}
                      and create a free account
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium">
                    2
                  </span>
                  <div>
                    <p className="font-medium">Get your API Key</p>
                    <p className="text-sm text-gray-600">Dashboard → API Keys → Create API Key</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium">
                    3
                  </span>
                  <div>
                    <p className="font-medium">Add to Vercel</p>
                    <p className="text-sm text-gray-600">
                      Vercel Project → Settings → Environment Variables → Add{" "}
                      <code className="bg-gray-100 px-1 rounded">RESEND_API_KEY</code>
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium">
                    4
                  </span>
                  <div>
                    <p className="font-medium">Redeploy</p>
                    <p className="text-sm text-gray-600">Redeploy your app for changes to take effect</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>🧪 Test Email Service</CardTitle>
            <CardDescription>Send a test email to verify everything works</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              type="email"
              placeholder="Enter your email address"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
            />

            <Button onClick={testEmailService} disabled={testing || !testEmail} className="w-full">
              {testing ? "Sending..." : "Send Test Email"}
            </Button>

            {testResult && (
              <div
                className={`p-4 rounded-lg ${
                  testResult.success
                    ? "bg-green-50 text-green-800 border border-green-200"
                    : "bg-red-50 text-red-800 border border-red-200"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span>{testResult.success ? "✅" : "❌"}</span>
                  <span className="font-medium">{testResult.success ? "Success!" : "Failed"}</span>
                </div>
                <p className="mt-1 text-sm">{testResult.message}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>💡 Tips</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-gray-600">
            <p>• Resend free tier: 3,000 emails/month, 100 emails/day</p>
            <p>• API keys start with "re_" (e.g., re_123abc...)</p>
            <p>• You can use onboarding@resend.dev for testing</p>
            <p>• Add your own domain later for custom sender addresses</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
