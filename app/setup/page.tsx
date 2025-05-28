"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Circle, ExternalLink, Copy, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function SetupPage() {
  const [completedSteps, setCompletedSteps] = useState<number[]>([])
  const [credentials, setCredentials] = useState({
    apiKey: "",
    apiSecret: "",
    webhookSecret: "",
    appUrl: "",
  })

  const toggleStep = (stepNumber: number) => {
    setCompletedSteps((prev) =>
      prev.includes(stepNumber) ? prev.filter((s) => s !== stepNumber) : [...prev, stepNumber],
    )
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const generateEnvFile = () => {
    return `# Shopify App Credentials
SHOPIFY_API_KEY=${credentials.apiKey || "your_api_key_here"}
SHOPIFY_API_SECRET=${credentials.apiSecret || "your_api_secret_here"}
SHOPIFY_WEBHOOK_SECRET=${credentials.webhookSecret || "your_webhook_secret_here"}

# Your app URL
NEXT_PUBLIC_APP_URL=${credentials.appUrl || "http://localhost:3000"}`
  }

  const steps = [
    {
      id: 1,
      title: "Create .env.local file",
      description: "Set up your local environment variables",
      completed: completedSteps.includes(1),
    },
    {
      id: 2,
      title: "Create Shopify Partner Account",
      description: "Sign up for Shopify Partners",
      completed: completedSteps.includes(2),
    },
    {
      id: 3,
      title: "Create Shopify App",
      description: "Create your app in Partners dashboard",
      completed: completedSteps.includes(3),
    },
    {
      id: 4,
      title: "Get App Credentials",
      description: "Copy API key and secret from your app",
      completed: completedSteps.includes(4),
    },
    {
      id: 5,
      title: "Deploy to Vercel",
      description: "Deploy your app to production",
      completed: completedSteps.includes(5),
    },
    {
      id: 6,
      title: "Update App URLs",
      description: "Update Shopify app with production URLs",
      completed: completedSteps.includes(6),
    },
  ]

  return (
    <div className="container mx-auto p-6 max-w-4xl space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Shopify Forum Setup</h1>
        <p className="text-muted-foreground">Follow these steps to integrate your forum with Shopify</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {steps.map((step) => (
          <Card
            key={step.id}
            className={`cursor-pointer transition-colors ${
              step.completed ? "border-green-500 bg-green-50 dark:bg-green-950" : ""
            }`}
            onClick={() => toggleStep(step.id)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <Badge variant={step.completed ? "default" : "secondary"}>Step {step.id}</Badge>
                {step.completed ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <Circle className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
              <CardTitle className="text-sm">{step.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-xs">{step.description}</CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="step1" className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="step1">Step 1</TabsTrigger>
          <TabsTrigger value="step2">Step 2</TabsTrigger>
          <TabsTrigger value="step3">Step 3</TabsTrigger>
          <TabsTrigger value="step4">Step 4</TabsTrigger>
          <TabsTrigger value="step5">Step 5</TabsTrigger>
          <TabsTrigger value="step6">Step 6</TabsTrigger>
        </TabsList>

        <TabsContent value="step1" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Step 1: Create .env.local File</CardTitle>
              <CardDescription>Set up your local environment variables</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-medium">Terminal Commands:</h4>
                <div className="bg-muted p-3 rounded-lg font-mono text-sm space-y-1">
                  <div className="flex items-center justify-between">
                    <span>cd shopify-forum-api</span>
                    <Button size="sm" variant="ghost" onClick={() => copyToClipboard("cd shopify-forum-api")}>
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>touch .env.local</span>
                    <Button size="sm" variant="ghost" onClick={() => copyToClipboard("touch .env.local")}>
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>code .env.local</span>
                    <Button size="sm" variant="ghost" onClick={() => copyToClipboard("code .env.local")}>
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">Add this content to .env.local:</h4>
                <div className="bg-muted p-3 rounded-lg font-mono text-sm relative">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="absolute top-2 right-2"
                    onClick={() => copyToClipboard(generateEnvFile())}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                  <pre className="whitespace-pre-wrap">{generateEnvFile()}</pre>
                </div>
              </div>

              <Button onClick={() => toggleStep(1)} className="w-full">
                {completedSteps.includes(1) ? "✓ Completed" : "Mark as Complete"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="step2" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Step 2: Create Shopify Partner Account</CardTitle>
              <CardDescription>You need a Partner account to create Shopify apps</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Go to Shopify Partners</h4>
                    <p className="text-sm text-muted-foreground">Sign up for a free Partner account</p>
                  </div>
                  <Button asChild>
                    <a href="https://partners.shopify.com" target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Open
                    </a>
                  </Button>
                </div>

                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>What you'll need:</strong>
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      <li>Email address</li>
                      <li>Business information (can be personal)</li>
                      <li>Phone number for verification</li>
                    </ul>
                  </AlertDescription>
                </Alert>
              </div>

              <Button onClick={() => toggleStep(2)} className="w-full">
                {completedSteps.includes(2) ? "✓ Completed" : "Mark as Complete"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="step3" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Step 3: Create Your Shopify App</CardTitle>
              <CardDescription>Create a new app in your Partners dashboard</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="p-3 border rounded-lg">
                  <h4 className="font-medium mb-2">App Settings:</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="font-medium">App name:</span>
                      <span>Community Forum</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">App URL:</span>
                      <span className="font-mono">http://localhost:3000/shopify/dashboard</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Redirect URL:</span>
                      <span className="font-mono">http://localhost:3000/api/shopify/auth</span>
                    </div>
                  </div>
                </div>

                <div className="p-3 border rounded-lg">
                  <h4 className="font-medium mb-2">Required Scopes:</h4>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">read_customers</Badge>
                    <Badge variant="outline">read_products</Badge>
                    <Badge variant="outline">write_script_tags</Badge>
                  </div>
                </div>
              </div>

              <Button onClick={() => toggleStep(3)} className="w-full">
                {completedSteps.includes(3) ? "✓ Completed" : "Mark as Complete"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="step4" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Step 4: Get Your App Credentials</CardTitle>
              <CardDescription>Copy these from your Shopify app settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="apiKey">API Key (Client ID)</Label>
                  <Input
                    id="apiKey"
                    placeholder="Enter your API key"
                    value={credentials.apiKey}
                    onChange={(e) => setCredentials({ ...credentials, apiKey: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="apiSecret">API Secret</Label>
                  <Input
                    id="apiSecret"
                    type="password"
                    placeholder="Enter your API secret"
                    value={credentials.apiSecret}
                    onChange={(e) => setCredentials({ ...credentials, apiSecret: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="webhookSecret">Webhook Secret</Label>
                  <Input
                    id="webhookSecret"
                    type="password"
                    placeholder="Enter webhook secret"
                    value={credentials.webhookSecret}
                    onChange={(e) => setCredentials({ ...credentials, webhookSecret: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="appUrl">App URL</Label>
                  <Input
                    id="appUrl"
                    placeholder="http://localhost:3000"
                    value={credentials.appUrl}
                    onChange={(e) => setCredentials({ ...credentials, appUrl: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">Updated .env.local content:</h4>
                <div className="bg-muted p-3 rounded-lg font-mono text-sm relative">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="absolute top-2 right-2"
                    onClick={() => copyToClipboard(generateEnvFile())}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                  <pre className="whitespace-pre-wrap">{generateEnvFile()}</pre>
                </div>
              </div>

              <Button onClick={() => toggleStep(4)} className="w-full">
                {completedSteps.includes(4) ? "✓ Completed" : "Mark as Complete"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="step5" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Step 5: Deploy to Vercel</CardTitle>
              <CardDescription>Deploy your forum to production</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Connect GitHub to Vercel</h4>
                    <p className="text-sm text-muted-foreground">Import your repository</p>
                  </div>
                  <Button asChild>
                    <a href="https://vercel.com/new" target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Deploy
                    </a>
                  </Button>
                </div>

                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Don't forget:</strong> Add your environment variables in Vercel's project settings after
                    deployment.
                  </AlertDescription>
                </Alert>
              </div>

              <Button onClick={() => toggleStep(5)} className="w-full">
                {completedSteps.includes(5) ? "✓ Completed" : "Mark as Complete"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="step6" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Step 6: Update App URLs</CardTitle>
              <CardDescription>Update your Shopify app with production URLs</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="p-3 border rounded-lg">
                  <h4 className="font-medium mb-2">Update these URLs in Shopify:</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="font-medium">App URL:</span>
                      <span className="font-mono">https://your-app.vercel.app/shopify/dashboard</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Redirect URL:</span>
                      <span className="font-mono">https://your-app.vercel.app/api/shopify/auth</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Webhook URL:</span>
                      <span className="font-mono">https://your-app.vercel.app/api/shopify/webhook</span>
                    </div>
                  </div>
                </div>
              </div>

              <Button onClick={() => toggleStep(6)} className="w-full">
                {completedSteps.includes(6) ? "✓ Completed" : "Mark as Complete"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {completedSteps.length === steps.length && (
        <Card className="border-green-500 bg-green-50 dark:bg-green-950">
          <CardHeader>
            <CardTitle className="text-green-700 dark:text-green-300">🎉 Setup Complete!</CardTitle>
            <CardDescription>Your Shopify forum is ready to use</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Button asChild className="w-full">
                <a href="/test-forum" target="_blank" rel="noreferrer">
                  Test Your Forum API
                </a>
              </Button>
              <Button variant="outline" asChild className="w-full">
                <a href="/shopify/dashboard" target="_blank" rel="noreferrer">
                  View Dashboard
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
