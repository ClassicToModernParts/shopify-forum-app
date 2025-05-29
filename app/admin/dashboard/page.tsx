"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Users, MessageSquare, Settings, Shield, Activity, CheckCircle, RefreshCw } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/hooks/useAuth"

export default function AdminDashboard() {
  const router = useRouter()
  const { isAdmin, loading, logout } = useAuth()
  const [stats, setStats] = useState({
    totalPosts: 0,
    totalUsers: 0,
    totalCategories: 0,
    activeToday: 0,
    postsThisMonth: 0,
    newUsersThisMonth: 0,
    topCategories: [],
    recentActivity: [],
  })
  const [loadingStats, setLoadingStats] = useState(true)

  useEffect(() => {
    console.log("Dashboard: isAdmin =", isAdmin, "loading =", loading)

    if (!loading && !isAdmin) {
      console.log("Not admin, redirecting to login")
      router.push("/admin/login")
      return
    }

    if (isAdmin) {
      loadStats()
    }
  }, [isAdmin, loading, router])

  const loadStats = async () => {
    try {
      setLoadingStats(true)
      const response = await fetch("/api/forum/stats?shop_id=demo")
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setStats(data.data)
        }
      }
    } catch (error) {
      console.error("Error loading stats:", error)
    } finally {
      setLoadingStats(false)
    }
  }

  const handleLogout = () => {
    logout()
    router.push("/admin/login")
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card>
          <CardContent className="p-8 text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-gray-600">Loading...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card>
          <CardContent className="p-8 text-center">
            <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
            <p className="text-gray-600 mb-4">You need admin privileges to access this page.</p>
            <Link href="/admin/login" className="text-blue-600 hover:underline">
              Go to Admin Login
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-gray-600">Welcome back! Here's what's happening in your forum.</p>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="px-3 py-1">
            <Shield className="h-4 w-4 mr-1" />
            Admin Access
          </Badge>
          <Button variant="outline" onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
            <MessageSquare className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loadingStats ? <RefreshCw className="h-6 w-6 animate-spin" /> : stats.totalPosts}
            </div>
            <p className="text-xs text-gray-500">
              {stats.postsThisMonth > 0 ? `+${stats.postsThisMonth} this month` : "No posts this month"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loadingStats ? <RefreshCw className="h-6 w-6 animate-spin" /> : stats.totalUsers}
            </div>
            <p className="text-xs text-gray-500">
              {stats.newUsersThisMonth > 0 ? `+${stats.newUsersThisMonth} this month` : "No new users this month"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Today</CardTitle>
            <Activity className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loadingStats ? <RefreshCw className="h-6 w-6 animate-spin" /> : stats.activeToday}
            </div>
            <p className="text-xs text-gray-500">Users active today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
            <Settings className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loadingStats ? <RefreshCw className="h-6 w-6 animate-spin" /> : stats.totalCategories}
            </div>
            <p className="text-xs text-gray-500">Discussion categories</p>
          </CardContent>
        </Card>
      </div>

      {/* Action Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <Link href="/admin?tab=categories">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-blue-600" />
                Manage Categories
              </CardTitle>
              <CardDescription>Create, edit, and organize forum categories</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{stats.totalCategories} categories</span>
                <Button variant="ghost" size="sm">
                  Manage →
                </Button>
              </div>
            </CardContent>
          </Link>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <Link href="/admin?tab=posts">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-green-600" />
                Manage Posts
              </CardTitle>
              <CardDescription>Moderate posts, handle reports, and manage content</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{stats.totalPosts} posts</span>
                <Button variant="ghost" size="sm">
                  Manage →
                </Button>
              </div>
            </CardContent>
          </Link>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <Link href="/admin?tab=settings">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-purple-600" />
                Forum Settings
              </CardTitle>
              <CardDescription>Configure forum settings and preferences</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">General & moderation</span>
                <Button variant="ghost" size="sm">
                  Configure →
                </Button>
              </div>
            </CardContent>
          </Link>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <Link href="/admin?tab=users">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-orange-600" />
                User Management
              </CardTitle>
              <CardDescription>Manage users, roles, and permissions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{stats.totalUsers} users</span>
                <Button variant="ghost" size="sm">
                  Manage →
                </Button>
              </div>
            </CardContent>
          </Link>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <Link href="/forum">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-blue-600" />
                View Forum
              </CardTitle>
              <CardDescription>Visit the public forum as a user</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Public view</span>
                <Button variant="ghost" size="sm">
                  Visit →
                </Button>
              </div>
            </CardContent>
          </Link>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <Link href="/admin/debug">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-red-600" />
                Debug Panel
              </CardTitle>
              <CardDescription>Debug API endpoints and system status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">System diagnostics</span>
                <Button variant="ghost" size="sm">
                  Debug →
                </Button>
              </div>
            </CardContent>
          </Link>
        </Card>
      </div>

      {/* Top Categories */}
      {stats.topCategories && stats.topCategories.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Top Categories</CardTitle>
            <CardDescription>Most active discussion categories</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.topCategories.map((category, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium">{category.name}</p>
                      <p className="text-sm text-gray-500">{category.posts} posts</p>
                    </div>
                  </div>
                  <Badge variant="secondary">{category.posts}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Activity */}
      {stats.recentActivity && stats.recentActivity.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest actions and events in your forum</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                      {activity.author?.charAt(0) || "U"}
                    </div>
                    <div>
                      <p className="text-sm">
                        <span className="font-medium">{activity.author}</span>{" "}
                        {activity.type === "post" ? "created" : "replied to"}{" "}
                        <span className="text-blue-600">"{activity.title}"</span>
                      </p>
                      <p className="text-xs text-gray-500">{new Date(activity.timestamp).toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {(!stats.recentActivity || stats.recentActivity.length === 0) && !loadingStats && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest actions and events in your forum</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Recent Activity</h3>
              <p className="text-gray-500 mb-4">
                Your forum is quiet right now. Activity will appear here as users interact with your forum.
              </p>
              <Link href="/forum">
                <Button variant="outline">Visit Forum</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
