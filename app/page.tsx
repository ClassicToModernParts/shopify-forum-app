import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MessageSquare, Settings, TestTube, Store, BarChart3, Shield, Users } from "lucide-react"

export default function HomePage() {
  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Shopify Forum API</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Add community forum functionality to your Shopify store. Connect customers, build engagement, and grow your
          community with advanced features.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <Settings className="h-8 w-8 mb-2 text-blue-600" />
            <CardTitle>Setup Guide</CardTitle>
            <CardDescription>Step-by-step setup instructions</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/setup">Start Setup</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <TestTube className="h-8 w-8 mb-2 text-green-600" />
            <CardTitle>Test API</CardTitle>
            <CardDescription>Test your forum API endpoints</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="w-full">
              <Link href="/test-forum">Test Forum</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <Store className="h-8 w-8 mb-2 text-purple-600" />
            <CardTitle>Shopify Dashboard</CardTitle>
            <CardDescription>Manage your store's forum</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="w-full">
              <Link href="/shopify/dashboard">Dashboard</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <MessageSquare className="h-8 w-8 mb-2 text-orange-600" />
            <CardTitle>Forum Demo</CardTitle>
            <CardDescription>See the forum in action</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="w-full">
              <Link href="/forum">View Forum</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* New Features Section */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="hover:shadow-lg transition-shadow border-2 border-dashed border-green-200">
          <CardHeader>
            <Shield className="h-8 w-8 mb-2 text-green-600" />
            <CardTitle>Admin Panel</CardTitle>
            <CardDescription>Manage categories, moderate posts, and configure settings</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="w-full">
              <Link href="/admin">Admin Panel</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow border-2 border-dashed border-blue-200">
          <CardHeader>
            <BarChart3 className="h-8 w-8 mb-2 text-blue-600" />
            <CardTitle>Analytics</CardTitle>
            <CardDescription>Track engagement, growth, and user activity</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="w-full">
              <Link href="/analytics">View Analytics</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow border-2 border-dashed border-purple-200">
          <CardHeader>
            <Users className="h-8 w-8 mb-2 text-purple-600" />
            <CardTitle>User Profiles</CardTitle>
            <CardDescription>Customer profiles with badges and reputation</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="w-full" disabled>
              Coming Soon
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>🚀 New Features Added!</CardTitle>
          <CardDescription>Your forum now includes powerful new capabilities</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h4 className="font-medium mb-2">✨ Enhanced Features:</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Advanced search and filtering</li>
                <li>• Post likes and reactions</li>
                <li>• Trending posts algorithm</li>
                <li>• Rich post editor with tags</li>
                <li>• Category management</li>
                <li>• User avatars and profiles</li>
                <li>• Post pinning and moderation</li>
                <li>• Private VIP categories</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">📊 Admin & Analytics:</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Complete admin dashboard</li>
                <li>• Real-time analytics</li>
                <li>• User engagement metrics</li>
                <li>• Category performance tracking</li>
                <li>• Content moderation tools</li>
                <li>• Growth rate monitoring</li>
                <li>• Daily activity reports</li>
                <li>• Top posts insights</li>
              </ul>
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button asChild>
              <Link href="/forum">Try the Forum</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/admin">Admin Panel</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/analytics">View Analytics</Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Quick Start</CardTitle>
          <CardDescription>Get your enhanced forum up and running</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center space-y-2">
              <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto font-bold">
                1
              </div>
              <h3 className="font-medium">Setup Environment</h3>
              <p className="text-sm text-muted-foreground">Create your .env.local file and add credentials</p>
            </div>
            <div className="text-center space-y-2">
              <div className="w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto font-bold">
                2
              </div>
              <h3 className="font-medium">Create Shopify App</h3>
              <p className="text-sm text-muted-foreground">Set up your app in Shopify Partners dashboard</p>
            </div>
            <div className="text-center space-y-2">
              <div className="w-8 h-8 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto font-bold">
                3
              </div>
              <h3 className="font-medium">Deploy & Connect</h3>
              <p className="text-sm text-muted-foreground">Deploy to Vercel and connect to your store</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
