"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function TestNavigationPage() {
  const router = useRouter()

  const testNavigations = [
    {
      name: "Admin Dashboard",
      path: "/admin/dashboard",
      description: "Go to main admin dashboard",
    },
    {
      name: "Admin Panel (Categories)",
      path: "/admin",
      description: "Go to admin panel - categories tab",
    },
    {
      name: "Admin Panel (Settings)",
      path: "/admin?tab=settings",
      description: "Go to admin panel - settings tab",
    },
    {
      name: "Forum",
      path: "/forum",
      description: "Go to public forum",
    },
    {
      name: "Admin Login",
      path: "/admin/login",
      description: "Go to admin login",
    },
  ]

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Navigation Test Page</h1>
        <p className="text-gray-600">Test all navigation links to debug routing issues</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {testNavigations.map((nav) => (
          <Card key={nav.path}>
            <CardHeader>
              <CardTitle className="text-lg">{nav.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-gray-600">{nav.description}</p>
              <div className="space-y-2">
                <Button onClick={() => router.push(nav.path)} className="w-full">
                  Navigate with router.push()
                </Button>
                <Button onClick={() => (window.location.href = nav.path)} variant="outline" className="w-full">
                  Navigate with window.location
                </Button>
              </div>
              <p className="text-xs text-gray-500 font-mono">Path: {nav.path}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <h3 className="font-medium text-blue-900 mb-2">🔍 Debug Steps:</h3>
          <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
            <li>First, test "Admin Login" to make sure you're authenticated</li>
            <li>Then test "Admin Dashboard" to see the main dashboard</li>
            <li>Try "Admin Panel (Settings)" to go directly to settings</li>
            <li>Check browser console for any JavaScript errors</li>
            <li>If settings don't work, try the other admin tabs first</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  )
}
