"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Users,
  MessageSquare,
  Settings,
  Shield,
  Activity,
  Clock,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
} from "lucide-react"
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
    pendingPosts: 0,
    reportedPosts: 0,
  })
  const [recentActivity, setRecentActivity] = useState([
    {
      id: 1,
      type: "new_post",
      user: "Sarah Johnson",
      action: "created a new post",
      target: "How to setup my store?",
      time: "2 minutes ago",
      status: "active",
    },
    {
      id: 2,
      type: "new_user",
      user: "Mike Chen",
      action: "joined the community",
      target: "",
      time: "15 minutes ago",
      status: "active",
    },
    {
      id: 3,
      type: "report",
      user: "Emma Wilson",
      action: "reported a post",
      target: "Spam content in General",
      time: "1 hour ago",
      status: "pending",
    },
    {
      id: 4,
      type: "new_post",
      user: "David Lee",
      action: "replied to",
      target: "Product recommendations",
      time: "2 hours ago",
      status: "active",
    },
  ])

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
      const response = await fetch("/api/forum/stats?shop_id=demo")
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setStats({
            ...data.data,
            pendingPosts: 3,
            reportedPosts: 1,
          })
        }
      }
    } catch (error) {
      console.error("Error loading stats:", error)
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
            <div className="text-2xl font-bold">{stats.totalPosts}</div>
            <p className="text-xs text-gray-500">+12% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-gray-500">+5% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Today</CardTitle>
            <Activity className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeToday}</div>
            <p className="text-xs text-gray-500">Users active today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
            <Settings className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCategories}</div>
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
      </div>

      {/* Alerts & Notifications */}
      {(stats.pendingPosts > 0 || stats.reportedPosts > 0) && (
        <div className="grid gap-4 md:grid-cols-2">
          {stats.pendingPosts > 0 && (
            <Card className="border-yellow-200 bg-yellow-50">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-yellow-800">
                  <Clock className="h-5 w-5" />
                  Pending Approval
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-yellow-700 mb-3">{stats.pendingPosts} posts are waiting for your approval</p>
                <Button size="sm" variant="outline" className="border-yellow-300 text-yellow-800">
                  Review Posts
                </Button>
              </CardContent>
            </Card>
          )}

          {stats.reportedPosts > 0 && (
            <Card className="border-red-200 bg-red-50">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-red-800">
                  <AlertTriangle className="h-5 w-5" />
                  Reported Content
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-red-700 mb-3">{stats.reportedPosts} posts have been reported by users</p>
                <Button size="sm" variant="outline" className="border-red-300 text-red-800">
                  Review Reports
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest actions and events in your forum</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                    {activity.user.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm">
                      <span className="font-medium">{activity.user}</span> {activity.action}{" "}
                      {activity.target && <span className="text-blue-600">"{activity.target}"</span>}
                    </p>
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {activity.status === "active" ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <Clock className="h-4 w-4 text-yellow-500" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
