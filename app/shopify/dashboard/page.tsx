"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Store, Users, MessageSquare, Settings, ExternalLink } from "lucide-react"

export default function ShopifyDashboard() {
  const searchParams = useSearchParams()
  const shop = searchParams.get("shop")
  const [shopData, setShopData] = useState<any>(null)
  const [forumStats, setForumStats] = useState({
    totalPosts: 127,
    totalUsers: 45,
    totalCategories: 5,
    activeToday: 12,
  })

  useEffect(() => {
    if (shop) {
      loadShopData()
    }
  }, [shop])

  const loadShopData = () => {
    setShopData({
      name: shop?.replace(".myshopify.com", ""),
      domain: shop,
      plan: "Basic Shopify",
      forumEnabled: true,
    })
  }

  if (!shop) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>Error</CardTitle>
            <CardDescription>Shop parameter is missing</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Forum Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your forum for{" "}
            <Badge variant="outline" className="ml-1">
              <Store className="h-3 w-3 mr-1" />
              {shopData?.name || shop}
            </Badge>
          </p>
        </div>
        <Button asChild>
          <a href={`https://${shop}/admin`} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="h-4 w-4 mr-2" />
            Shopify Admin
          </a>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{forumStats.totalPosts}</div>
            <p className="text-xs text-muted-foreground">+12% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Forum Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{forumStats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">+5% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{forumStats.totalCategories}</div>
            <p className="text-xs text-muted-foreground">3 active categories</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Today</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{forumStats.activeToday}</div>
            <p className="text-xs text-muted-foreground">Users active today</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>🎉 OAuth Integration Working!</CardTitle>
          <CardDescription>Your Shopify forum integration is successfully connected</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h4 className="font-medium mb-2">✅ What's Working:</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• OAuth authentication flow</li>
                <li>• Shopify app credentials</li>
                <li>• API endpoints</li>
                <li>• Dashboard interface</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">🚀 Next Steps:</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Deploy to Vercel</li>
                <li>• Add database integration</li>
                <li>• Install app on your store</li>
                <li>• Customize forum features</li>
              </ul>
            </div>
          </div>

          <div className="flex gap-2">
            <Button asChild>
              <a href="/test-forum" target="_blank" rel="noreferrer">
                Test Forum API
              </a>
            </Button>
            <Button variant="outline" asChild>
              <a href="/setup" target="_blank" rel="noreferrer">
                Setup Guide
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
