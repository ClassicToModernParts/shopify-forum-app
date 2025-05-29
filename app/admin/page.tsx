"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Users,
  MessageSquare,
  Settings,
  BarChart3,
  Shield,
  Plus,
  Edit,
  Trash2,
  Lock,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  X,
  Bug,
  Save,
} from "lucide-react"
import Link from "next/link"
import { Switch } from "@/components/ui/switch"
import { useAuth } from "@/hooks/useAuth"

interface ForumSettings {
  general: {
    forumName: string
    description: string
    welcomeMessage: string
    contactEmail: string
  }
  moderation: {
    requireApproval: boolean
    autoSpamDetection: boolean
    allowAnonymous: boolean
    enableReporting: boolean
    maxPostLength: number
  }
  appearance: {
    primaryColor: string
    accentColor: string
    darkMode: boolean
    customCSS: string
  }
  notifications: {
    emailNotifications: boolean
    newPostNotifications: boolean
    moderationAlerts: boolean
  }
}

interface Category {
  id: string
  name: string
  description: string
  postCount: number
  color: string
  icon: string
  isPrivate: boolean
  createdAt: string
  updatedAt: string
}

interface Post {
  id: string
  title: string
  content: string
  author: string
  categoryId: string
  createdAt: string
  replies: number
  views: number
  likes: number
  isPinned: boolean
  isLocked: boolean
  status: string
}

export default function AdminPage() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const [activeTab, setActiveTab] = useState("categories")
  const [categories, setCategories] = useState<Category[]>([])
  const [posts, setPosts] = useState<Post[]>([])
  const [selectedPosts, setSelectedPosts] = useState<string[]>([])
  const [editingPost, setEditingPost] = useState<Post | null>(null)
  const [editForm, setEditForm] = useState({ title: "", content: "" })
  const [postStatusFilter, setPostStatusFilter] = useState("active")
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  const [stats, setStats] = useState({
    totalPosts: 0,
    totalUsers: 0,
    totalCategories: 0,
    activeToday: 0,
  })

  const [showNewCategoryForm, setShowNewCategoryForm] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [newCategory, setNewCategory] = useState({
    name: "",
    description: "",
    color: "#3B82F6",
    icon: "MessageSquare",
    isPrivate: false,
  })

  const [settings, setSettings] = useState<ForumSettings>({
    general: {
      forumName: "Community Forum",
      description: "Connect with other customers and get support",
      welcomeMessage: "Welcome to our community! Please read the guidelines before posting.",
      contactEmail: "support@yourstore.com",
    },
    moderation: {
      requireApproval: false,
      autoSpamDetection: true,
      allowAnonymous: false,
      enableReporting: true,
      maxPostLength: 5000,
    },
    appearance: {
      primaryColor: "#3B82F6",
      accentColor: "#10B981",
      darkMode: false,
      customCSS: "",
    },
    notifications: {
      emailNotifications: true,
      newPostNotifications: true,
      moderationAlerts: true,
    },
  })

  const [settingsLoading, setSettingsLoading] = useState(false)
  const [settingsMessage, setSettingsMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [lastSaved, setLastSaved] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [dataLoading, setDataLoading] = useState(true)
  const [apiErrors, setApiErrors] = useState<string[]>([])

  const { isAdmin, loading, logout, checkAuthStatus } = useAuth()

  useEffect(() => {
    const tabParam = searchParams.get("tab")
    if (tabParam && ["categories", "posts", "users", "settings"].includes(tabParam)) {
      setActiveTab(tabParam)
    } else {
      setActiveTab("categories") // Default to categories if no valid tab
    }
  }, [searchParams])

  useEffect(() => {
    console.log("🏛️ Admin page effect triggered:")
    console.log("  - isAdmin:", isAdmin)
    console.log("  - loading:", loading)

    // Don't redirect while still loading
    if (loading) {
      console.log("  ⏳ Still loading, waiting...")
      return
    }

    // Only redirect if definitely not admin
    if (!isAdmin) {
      console.log("  🚫 Not admin, redirecting to login")
      router.push("/admin/login")
      return
    }

    console.log("  ✅ Admin confirmed, loading data")
    loadData()
    loadSettings()
  }, [isAdmin, loading, router])

  // Add a manual auth check button for debugging
  const handleManualAuthCheck = () => {
    console.log("🔄 Manual auth check triggered")
    checkAuthStatus()
  }

  const addApiError = (error: string) => {
    setApiErrors((prev) => [...prev, error])
    console.error("API Error:", error)
  }

  const clearApiErrors = () => {
    setApiErrors([])
  }

  const loadData = async () => {
    setDataLoading(true)
    setApiErrors([])

    try {
      // Load categories from admin API
      try {
        console.log("Loading categories...")
        const categoriesResponse = await fetch("/api/admin/categories?include_private=true")
        console.log("Categories response status:", categoriesResponse.status)

        if (!categoriesResponse.ok) {
          throw new Error(`Categories API failed: ${categoriesResponse.status}`)
        }

        const categoriesData = await categoriesResponse.json()
        console.log("Categories response data:", categoriesData)

        if (categoriesData.success) {
          if (Array.isArray(categoriesData.data)) {
            setCategories(categoriesData.data)
            console.log("✅ Categories loaded successfully:", categoriesData.data.length, "items")
          } else {
            console.warn("⚠️ Categories data is not an array:", categoriesData.data)
            setCategories([])
            addApiError(`Categories: Expected array but got ${typeof categoriesData.data}`)
          }
        } else {
          console.error("❌ Categories API returned error:", categoriesData.error)
          setCategories([])
          addApiError(`Categories: ${categoriesData.error || "API returned success: false"}`)
        }
      } catch (error) {
        console.error("❌ Categories fetch error:", error)
        setCategories([])
        addApiError(`Categories: ${error instanceof Error ? error.message : "Unknown error"}`)
      }

      // Load posts from admin API with status filter
      try {
        console.log(`Loading posts with status filter: ${postStatusFilter}...`)
        const postsResponse = await fetch(`/api/admin/posts?status=${postStatusFilter}`)
        if (!postsResponse.ok) {
          throw new Error(`Admin posts API failed: ${postsResponse.status}`)
        }
        const postsData = await postsResponse.json()
        console.log("Posts response:", postsData)
        if (postsData.success && Array.isArray(postsData.data)) {
          setPosts(postsData.data)
        } else {
          console.warn("Posts data is not an array:", postsData.data)
          setPosts([])
          addApiError(`Posts: ${postsData.error || "Invalid data format"}`)
        }
      } catch (error) {
        console.error("Posts error:", error)
        setPosts([])
        addApiError(`Posts: ${error instanceof Error ? error.message : "Unknown error"}`)
      }

      // Load stats
      try {
        console.log("Loading stats...")
        const statsResponse = await fetch("/api/forum/stats?shop_id=demo")
        if (!statsResponse.ok) {
          throw new Error(`Stats API failed: ${statsResponse.status}`)
        }
        const statsData = await statsResponse.json()
        console.log("Stats response:", statsData)
        if (statsData.success) {
          setStats(statsData.data)
        } else {
          addApiError(`Stats: ${statsData.error}`)
        }
      } catch (error) {
        console.error("Stats error:", error)
        addApiError(`Stats: ${error instanceof Error ? error.message : "Unknown error"}`)
      }
    } catch (error) {
      console.error("General error:", error)
      addApiError(`General: ${error instanceof Error ? error.message : "Unknown error"}`)
    } finally {
      setDataLoading(false)
    }
  }

  const loadSettings = async () => {
    try {
      const response = await fetch("/api/admin/settings")
      if (!response.ok) {
        throw new Error(`Settings API failed: ${response.status}`)
      }
      const data = await response.json()
      console.log("Loaded settings:", data)
      if (data.success) {
        setSettings(data.data)
        setLastSaved(data.data.lastUpdated)
      } else {
        addApiError(`Settings load: ${data.error}`)
      }
    } catch (error) {
      addApiError(`Settings load: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }

  const updateSettings = (section: string, key: string, value: any) => {
    setSettings((prev) => {
      // Create a deep copy of the section
      const updatedSection = { ...prev[section as keyof ForumSettings], [key]: value }
      // Return a new object with the updated section
      return { ...prev, [section as keyof ForumSettings]: updatedSection }
    })
  }

  const saveSettings = async () => {
    setSettingsLoading(true)
    setSettingsMessage(null)

    try {
      console.log("Saving settings:", settings)
      const response = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings }),
      })

      if (!response.ok) {
        throw new Error(`Settings save failed: ${response.status}`)
      }

      const data = await response.json()
      console.log("Settings save response:", data)

      if (data.success) {
        setSettingsMessage({ type: "success", text: "Settings saved successfully!" })
        setLastSaved(data.data.lastUpdated)
        setTimeout(() => setSettingsMessage(null), 3000)
      } else {
        setSettingsMessage({ type: "error", text: data.error || "Failed to save settings" })
        addApiError(`Settings save: ${data.error}`)
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Unknown error"
      setSettingsMessage({ type: "error", text: "Failed to save settings" })
      addApiError(`Settings save: ${errorMsg}`)
    } finally {
      setSettingsLoading(false)
    }
  }

  // Category management functions
  const createCategory = async () => {
    if (!newCategory.name || !newCategory.description) {
      setSettingsMessage({ type: "error", text: "Please fill in all required fields" })
      return
    }

    setActionLoading("create-category")
    try {
      const response = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCategory),
      })

      if (!response.ok) {
        throw new Error(`Create category failed: ${response.status}`)
      }

      const data = await response.json()
      if (data.success) {
        setNewCategory({ name: "", description: "", color: "#3B82F6", icon: "MessageSquare", isPrivate: false })
        setShowNewCategoryForm(false)
        setSettingsMessage({ type: "success", text: "Category created successfully!" })
        loadData()
        setTimeout(() => setSettingsMessage(null), 3000)
      } else {
        setSettingsMessage({ type: "error", text: data.error || "Failed to create category" })
        addApiError(`Create category: ${data.error}`)
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Unknown error"
      setSettingsMessage({ type: "error", text: "Failed to create category" })
      addApiError(`Create category: ${errorMsg}`)
    } finally {
      setActionLoading(null)
    }
  }

  const updateCategory = async (categoryId: string, updates: Partial<Category>) => {
    setActionLoading(`update-${categoryId}`)
    try {
      const response = await fetch("/api/admin/categories", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ categoryId, updates }),
      })

      if (!response.ok) {
        throw new Error(`Update category failed: ${response.status}`)
      }

      const data = await response.json()
      if (data.success) {
        setSettingsMessage({ type: "success", text: "Category updated successfully!" })
        setEditingCategory(null)
        loadData()
        setTimeout(() => setSettingsMessage(null), 3000)
      } else {
        setSettingsMessage({ type: "error", text: data.error || "Failed to update category" })
        addApiError(`Update category: ${data.error}`)
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Unknown error"
      setSettingsMessage({ type: "error", text: "Failed to update category" })
      addApiError(`Update category: ${errorMsg}`)
    } finally {
      setActionLoading(null)
    }
  }

  const deleteCategory = async (categoryId: string) => {
    const category = categories.find((c) => c.id === categoryId)
    if (!category) return

    if (!confirm(`Are you sure you want to delete "${category.name}"? This action cannot be undone.`)) return

    setActionLoading(`delete-${categoryId}`)
    try {
      const response = await fetch("/api/admin/categories", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ categoryId }),
      })

      if (!response.ok) {
        throw new Error(`Delete category failed: ${response.status}`)
      }

      const data = await response.json()
      if (data.success) {
        setSettingsMessage({ type: "success", text: "Category deleted successfully!" })
        loadData()
        setTimeout(() => setSettingsMessage(null), 3000)
      } else {
        setSettingsMessage({ type: "error", text: data.error || "Failed to delete category" })
        addApiError(`Delete category: ${data.error}`)
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Unknown error"
      setSettingsMessage({ type: "error", text: "Failed to delete category" })
      addApiError(`Delete category: ${errorMsg}`)
    } finally {
      setActionLoading(null)
    }
  }

  // Post management functions
  const deletePost = async (postId: string) => {
    setConfirmDelete(postId)
  }

  const confirmDeletePost = async (postId: string) => {
    setActionLoading(`delete-${postId}`)
    try {
      const response = await fetch("/api/admin/posts", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId }),
      })

      if (!response.ok) {
        throw new Error(`Delete failed: ${response.status}`)
      }

      const data = await response.json()
      if (data.success) {
        setSettingsMessage({ type: "success", text: "Post deleted successfully!" })
        loadData()
        setTimeout(() => setSettingsMessage(null), 3000)
      } else {
        setSettingsMessage({ type: "error", text: data.error || "Failed to delete post" })
        addApiError(`Delete post: ${data.error}`)
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Unknown error"
      setSettingsMessage({ type: "error", text: "Failed to delete post" })
      addApiError(`Delete post: ${errorMsg}`)
    } finally {
      setActionLoading(null)
      setConfirmDelete(null)
    }
  }

  const cancelDeletePost = () => {
    setConfirmDelete(null)
  }

  const bulkDeletePosts = async () => {
    if (selectedPosts.length === 0) return
    
    if (!confirm(`Are you sure you want to delete ${selectedPosts.length} selected posts? This action cannot be undone.`)) return

    setActionLoading("bulk-delete")
    try {
      const response = await fetch("/api/admin/posts", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postIds: selectedPosts }),
      })

      if (!response.ok) {
        throw new Error(`Bulk delete failed: ${response.status}`)
      }

      const data = await response.json()
      if (data.success) {
        setSettingsMessage({ type: "success", text: `${data.deletedCount} posts deleted successfully!` })
        setSelectedPosts([])
        loadData()
        setTimeout(() => setSettingsMessage(null), 3000)
      } else {
        setSettingsMessage({ type: "error", text: data.error || "Failed to delete posts" })
        addApiError(`Bulk delete: ${data.error}`)
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Unknown error"
      setSettingsMessage({ type: "error", text: "Failed to delete posts" })
      addApiError(`Bulk delete: ${errorMsg}`)
    } finally {
      setActionLoading(null)
    }
  }

  const togglePostSelection = (postId: string) => {
    setSelectedPosts(prev => 
      prev.includes(postId) 
        ? prev.filter(id => id !== postId)
        : [...prev, postId]
    )
  }

  const selectAllPosts = () => {
    if (selectedPosts.length === posts.length) {
      setSelectedPosts([])
    } else {
      setSelectedPosts(posts.map(post => post.id))
    }
  }

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    } catch (error) {
      return "Invalid date"
    }
  }

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card>
          <CardContent className="p-8 text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-gray-600">Checking authentication...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Show access denied if not admin
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card>
          <CardContent className="p-8 text-center">
            <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
            <p className="text-gray-600 mb-4">You need admin privileges to access this page.</p>
            <div className="space-y-2">
              <Link href="/admin/login" className="block text-blue-600 hover:underline">
                Go to Admin Login
              </Link>
              <Button variant="outline" size="sm" onClick={handleManualAuthCheck}>
                Check Auth Status
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/admin/dashboard" className="flex items-center space-x-2 text-gray-600 hover:text-gray-900">
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Dashboard</span>
          </Link>
          <div className="h-6 w-px bg-gray-300" />
          <Link
            href="/forum"
            className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <MessageSquare className="h-4 w-4" />
            <span>Back to Forum</span>
          </Link>
          <div className="h-6 w-px bg-gray-300" />
          <div>
            <h1 className="text-3xl font-bold">Forum Administration</h1>
            <p className="text-gray-600">Manage your community forum</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleManualAuthCheck}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Check Auth
          </Button>
          <Link
            href="/admin/debug"
            className="flex items-center space-x-2 px-3 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
          >
            <Bug className="h-4 w-4" />
            <span>Debug Panel</span>
          </Link>
          <Badge variant="outline" className="px-3 py-1">
            <Shield className="h-4 w-4 mr-1" />
            Admin Access
          </Badge>
        </div>
      </div>

      {/* API Errors */}
      {apiErrors.length > 0 && (
        <Card className="border-red-500 bg-red-50">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-red-800 flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                API Errors Detected ({apiErrors.length})
              </CardTitle>
              <Button variant="outline" size="sm" onClick={clearApiErrors}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {apiErrors.map((error, index) => (
                <div key={index} className="text-sm text-red-700 bg-red-100 p-2 rounded">
                  {error}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Status Messages */}
      {settingsMessage && (
        <Card
          className={`border-l-4 ${settingsMessage.type === "success" ? "border-green-500 bg-green-50" : "border-red-500 bg-red-50"}`}
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              {settingsMessage.type === "success" ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-600" />
              )}
              <p className={`text-sm ${settingsMessage.type === "success" ? "text-green-800" : "text-red-800"}`}>
                {settingsMessage.text}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {dataLoading && (
        <Card>
          <CardContent className="p-8 text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-gray-600">Loading admin data...</p>
          </CardContent>
        </Card>
      )}

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
            <MessageSquare className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Array.isArray(posts) ? posts.length : 0}</div>
            <p className="text-xs text-gray-500">No posts this month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-gray-500">No new users this month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
            <Settings className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Array.isArray(categories) ? categories.length : 0}</div>
            <p className="text-xs text-gray-500">Discussion categories</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Today</CardTitle>
            <BarChart3 className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeToday}</div>
            <p className="text-xs text-gray-500">Users active today</p>
          </CardContent>
        </Card>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={(value) => {
          setActiveTab(value)
          // Update URL without page reload
          const url = new URL(window.location.href)
          url.searchParams.set("tab", value)
          window.history.replaceState({}, "", url.toString())
        }}
        className="space-y-4"
      >
        <TabsList>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="posts">Posts</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="categories" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">
              Manage Categories ({Array.isArray(categories) ? categories.length : 0})
            </h2>
            <Button onClick={() => setShowNewCategoryForm(true)} disabled={actionLoading === "create-category"}>
              <Plus className="h-4 w-4 mr-2" />
              {actionLoading === "create-category" ? "Creating..." : "New Category"}
            </Button>
          </div>

          {/* Edit Category Form */}
          {editingCategory && (
            <Card>
              <CardHeader>
                <CardTitle>Edit Category</CardTitle>
                <CardDescription>Update category information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Name *</label>
                    <Input
                      value={editingCategory.name}
                      onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Color</label>
                    <input
                      type="color"
                      className="w-full h-10 border rounded-lg"
                      value={editingCategory.color}
                      onChange={(e) => setEditingCategory({ ...editingCategory, color: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Description *</label>
                  <Textarea
                    rows={3}
                    value={editingCategory.description}
                    onChange={(e) => setEditingCategory({ ...editingCategory, description: e.target.value })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm font-medium">Private Category</span>
                    <p className="text-xs text-gray-500">Only visible to moderators and admins</p>
                  </div>
                  <Switch
                    checked={editingCategory.isPrivate}
                    onCheckedChange={(checked) => setEditingCategory({ ...editingCategory, isPrivate: checked })}
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={() => updateCategory(editingCategory.id, editingCategory)}
                    disabled={actionLoading?.startsWith(`update-${editingCategory.id}`)}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {actionLoading?.startsWith(`update-${editingCategory.id}`) ? "Saving..." : "Save Changes"}
                  </Button>
                  <Button variant="outline" onClick={() => setEditingCategory(null)}>
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {(!Array.isArray(categories) || categories.length === 0) && !dataLoading ? (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-gray-500 mb-4">No categories found. Create your first category to get started.</p>
                <Button onClick={() => setShowNewCategoryForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Category
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {Array.isArray(categories) &&
                categories.map((category) => (
                  <Card key={category.id} className="border-l-4" style={{ borderLeftColor: category.color }}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{category.name}</CardTitle>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setEditingCategory(category)}
                            disabled={actionLoading?.startsWith(`update-${category.id}`)}
                            title="Edit category"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => deleteCategory(category.id)}
                            disabled={actionLoading === `delete-${category.id}` || category.postCount > 0}
                            className="text-red-600 hover:text-red-700"
                            title={category.postCount > 0 ? "Cannot delete category with posts" : "Delete category"}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <CardDescription>{category.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span>{category.postCount || 0} posts</span>
                        <div className="flex gap-1">
                          {category.isPrivate && (
                            <Badge variant="secondary" className="text-xs">
                              <Lock className="h-3 w-3 mr-1" />
                              Private
                            </Badge>
                          )}
                          <Badge variant="outline" className="text-xs">
                            {category.icon}
                          </Badge>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500">Created: {formatDate(category.createdAt)}</p>
                    </CardContent>
                  </Card>
                ))}
            </div>
          )}

          {/* New Category Form */}
          {showNewCategoryForm && (
            <Card>
              <CardHeader>
                <Car\
