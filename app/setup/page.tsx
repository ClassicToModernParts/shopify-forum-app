"use client"

import { useState } from "react"

export default function SetupPage() {
  const [completedSteps, setCompletedSteps] = useState<number[]>([])

  const toggleStep = (stepNumber: number) => {
    setCompletedSteps((prev) =>
      prev.includes(stepNumber) ? prev.filter((s) => s !== stepNumber) : [...prev, stepNumber],
    )
  }

  const steps = [
    {
      id: 1,
      title: "Create .env.local file",
      description: "Set up your local environment variables",
    },
    {
      id: 2,
      title: "Create Shopify Partner Account",
      description: "Sign up for Shopify Partners",
    },
    {
      id: 3,
      title: "Create Shopify App",
      description: "Create your app in Partners dashboard",
    },
    {
      id: 4,
      title: "Get App Credentials",
      description: "Copy API key and secret from your app",
    },
    {
      id: 5,
      title: "Deploy to Vercel",
      description: "Deploy your app to production",
    },
    {
      id: 6,
      title: "Update App URLs",
      description: "Update Shopify app with production URLs",
    },
  ]

  return (
    <div className="container mx-auto p-6 max-w-4xl space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Shopify Forum Setup</h1>
        <p className="text-gray-600">Follow these steps to integrate your forum with Shopify</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {steps.map((step) => (
          <div
            key={step.id}
            className={`p-4 border rounded-lg cursor-pointer transition-colors ${
              completedSteps.includes(step.id) ? "border-green-500 bg-green-50" : "border-gray-200"
            }`}
            onClick={() => toggleStep(step.id)}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-500">Step {step.id}</span>
              <div className={`w-5 h-5 rounded-full ${
                completedSteps.includes(step.id) ? "bg-green-500" : "bg-gray-300"
              }`}>
                {completedSteps.includes(step.id) && (
                  <div className="w-full h-full flex items-center justify-center text-white text-xs">✓</div>
                )}
              </div>
            </div>
            <h3 className="font-medium text-sm">{step.title}</h3>
            <p className="text-xs text-gray-600 mt-1">{step.description}</p>
          </div>
        ))}
      </div>

      <div className="space-y-6">
        <div className="p-6 border rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Step 1: Environment Variables</h2>
          <div className="bg-gray-100 p-4 rounded font-mono text-sm">
            <div># Add these to your .env.local file:</div>
            <div>SHOPIFY_API_KEY=your_api_key_here</div>
            <div>SHOPIFY_API_SECRET=your_api_secret_here</div>
            <div>SHOPIFY_WEBHOOK_SECRET=your_webhook_secret_here</div>
            <div>NEXT_PUBLIC_APP_URL=http://localhost:3000</div>
          </div>
        </div>

        <div className="p-6 border rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Step 2: Shopify Partners</h2>
          <p className="text-gray-600 mb-4">
            Create a free Shopify Partners account to build and distribute apps.
          </p>
          <a
            href="https://partners.shopify.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Go to Shopify Partners →
          </a>
        </div>

        <div className="p-6 border rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Step 3: Deploy to Vercel</h2>
          <p className="text-gray-600 mb-4">
            Deploy your forum to production using Vercel's GitHub integration.
          </p>
          <a
            href="https://vercel.com/new"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-4 py-2 bg-black text-white rounded hover:bg-gray-800"
          >
            Deploy to Vercel →
          </a>
        </div>
      </div>

      {completedSteps.length === steps.length && (
        <div className="p-6 border-2 border-green-500 bg-green-50 rounded-lg text-center">
          <h2 className="text-xl font-bold text-green-700 mb-2">🎉 Setup Complete!</h2>
          <p className="text-green-600 mb-4">Your Shopify forum is ready to use</p>
          <div className="space-x-4">
            <a
              href="/forum"
              className="inline-block px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              View Forum
            </a>
            <a
              href="/admin"
              className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Admin Panel
            </a>
          </div>
        </div>
      )}
    </div>
  )
}
