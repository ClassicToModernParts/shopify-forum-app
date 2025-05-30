"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Users,
  MessageSquare,
  BarChart3,
  Shield,
  Plus,
  Edit,
  Trash2,
  Pin,
  Lock,
  EyeOff,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  X,
  Bug,
  Save,
  Search,
  UserPlus,
  UserCheck,
  UserX,
  Crown,
  Star,
  Heart,
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

interface User {
  id: string
  username: string
  name: string
  email: string
  role: "admin" | "moderator" | "user"
  createdAt: string
  lastActive?: string
  isActive?: boolean
}

interface UserStats {
  totalUsers: number
  activeUsers: number
  inactiveUsers: number
  usersByRole: {
    admin: number
    moderator: number
    user: number
  }
  recentlyActive: number
  recentRegistrations: number
  engagementRate: number
  averagePostsPerUser: string
}

interface Coupon {
  id: string
  name: string
  pointsRequired: number
  discountAmount: number
  discountType: "fixed" | "percentage"
  isActive: boolean
}

interface RewardsSettings {
  pointsPerPost: number
  pointsPerReply: number
  pointsPerLike: number
  pointsPerReceivingLike: number
  dailyPointsLimit: number
  coupons: Coupon[]
}

export default function AdminPage() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const [activeTab, setActiveTab] = useState("categories")
  const [categories, setCategories] = useState<Category[]>([])
  const [posts, setPosts] = useState<Post[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [userStats, setUserStats] = useState<UserStats | null>(null)
  const [selectedPosts, setSelectedPosts] = useState<string[]>([])
  const [editingPost, setEditingPost] = useState<Post | null>(null)
  const [editForm, setEditForm] = useState({ title: "", content: "" })

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

  // User management state
  const [showNewUserForm, setShowNewUserForm] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [newUser, setNewUser] = useState({
    username: "",
    name: "",
    email: "",
    password: "",
    role: "user" as "user" | "moderator" | "admin",
  })
  const [userSearch, setUserSearch] = useState("")
  const [userRoleFilter, setUserRoleFilter] = useState<string>("")
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])

  const [settings, setSettings] = useState<ForumSettings>({
    general: {
      forumName: "CTM Parts Community",
      description: "Connect with other customers and get support",
      welcomeMessage: "Welcome to our community! Please read the guidelines before posting.",
      contactEmail: "support@ctmparts.com",
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

  // Rewards management state
  const [rewardsSettings, setRewardsSettings] = useState({
    pointsPerPost: 10,
    pointsPerReply: 5,
    pointsPerLike: 1,
    pointsPerReceivingLike: 2,
    dailyPointsLimit: 100,
    coupons: [
      {
        id: "coupon-5-off",
        name: "$5 Off Coupon",
        pointsRequired: 700,
        discountAmount: 5,
        discountType: "fixed" as "fixed" | "percentage",
        isActive: true,
      },
      {
        id: "coupon-10-off",
        name: "$10 Off Coupon",
        pointsRequired: 1400,
        discountAmount: 10,
        discountType: "fixed" as "fixed" | "percentage",
        isActive: true,
      },
    ],
  })
  const [showNewCouponForm, setShowNewCouponForm] = useState(false)
  const [newCoupon, setNewCoupon] = useState({
    name: "",
    pointsRequired: 0,
    discountAmount: 0,
    discountType: "fixed" as "fixed" | "percentage",
    isActive: true,
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
    if (tabParam && ["categories", "posts", "users", "settings", "rewards"].includes(tabParam)) {
      setActiveTab(tabParam)
    } else {
      setActiveTab("categories")
    }
  }, [searchParams])

  useEffect(() => {
    console.log("🏛️ Admin page effect triggered:")
    console.log("  - isAdmin:", isAdmin)
    console.log("  - loading:", loading)

    if (loading) {
      console.log("  ⏳ Still loading, waiting...")
      return
    }

    if (!isAdmin) {
      console.log("  🚫 Not admin, redirecting to login")
      router.push("/admin/login")
      return
    }

    console.log("  ✅ Admin confirmed, loading data")
    loadData()
    loadSettings()
  }, [isAdmin, loading, router])

  // Filter users based on search and role
  useEffect(() => {
    let filtered = users

    if (userSearch) {
      const searchLower = userSearch.toLowerCase()
      filtered = filtered.filter(
        (user) =>
          user.username.toLowerCase().includes(searchLower) ||
          user.name.toLowerCase().includes(searchLower) ||
          user.email.toLowerCase().includes(searchLower),
      )
    }

    if (userRoleFilter) {
      filtered = filtered.filter((user) => user.role === userRoleFilter)
    }

    setFilteredUsers(filtered)
  }, [users, userSearch, userRoleFilter])

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
      // Load categories
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

      // Load posts
      try {
        console.log("Loading posts...")
        const postsResponse = await fetch("/api/admin/posts")
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

      // Load users
      try {
        console.log("Loading users...")
        const usersResponse = await fetch("/api/admin/users")
        if (!usersResponse.ok) {
          throw new Error(`Users API failed: ${usersResponse.status}`)
        }
        const usersData = await usersResponse.json()
        console.log("Users response:", usersData)
        if (usersData.success && Array.isArray(usersData.data)) {
          setUsers(usersData.data)
        } else {
          console.warn("Users data is not an array:", usersData.data)
          setUsers([])
          addApiError(`Users: ${usersData.error || "Invalid data format"}`)
        }
      } catch (error) {
        console.error("Users error:", error)
        setUsers([])
        addApiError(`Users: ${error instanceof Error ? error.message : "Unknown error"}`)
      }

      // Load user stats
      try {
        console.log("Loading user stats...")
        const statsResponse = await fetch("/api/admin/users/stats")
        if (!statsResponse.ok) {
          throw new Error(`User stats API failed: ${statsResponse.status}`)
        }
        const statsData = await statsResponse.json()
        console.log("User stats response:", statsData)
        if (statsData.success) {
          setUserStats(statsData.data)
        } else {
          addApiError(`User Stats: ${statsData.error}`)
        }
      } catch (error) {
        console.error("User stats error:", error)
        addApiError(`User Stats: ${error instanceof Error ? error.message : "Unknown error"}`)
      }

      // Load general stats
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

      // Load rewards settings
      try {
        console.log("Loading rewards settings...")
        const rewardsResponse = await fetch("/api/admin/rewards?type=settings")
        if (!rewardsResponse.ok) {
          throw new Error(`Rewards API failed: ${rewardsResponse.status}`)
        }
        const rewardsData = await rewardsResponse.json()
        console.log("Rewards response:", rewardsData)
        if (rewardsData.success) {
          setRewardsSettings(rewardsData.data)
        } else {
          addApiError(`Rewards: ${rewardsData.error}`)
        }
      } catch (error) {
        console.error("Rewards error:", error)
        addApiError(`Rewards: ${error instanceof Error ? error.message : "Unknown error"}`)
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

  // User management functions
  const createUser = async () => {
    if (!newUser.username || !newUser.name || !newUser.email || !newUser.password) {
      setSettingsMessage({ type: "error", text: "Please fill in all required fields" })
      return
    }

    setActionLoading("create-user")
    try {
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUser),
      })

      if (!response.ok) {
        throw new Error(`Create user failed: ${response.status}`)
      }

      const data = await response.json()
      if (data.success) {
        setNewUser({ username: "", name: "", email: "", password: "", role: "user" })
        setShowNewUserForm(false)
        setSettingsMessage({ type: "success", text: "User created successfully!" })
        loadData()
        setTimeout(() => setSettingsMessage(null), 3000)
      } else {
        setSettingsMessage({ type: "error", text: data.error || "Failed to create user" })
        addApiError(`Create user: ${data.error}`)
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Unknown error"
      setSettingsMessage({ type: "error", text: "Failed to create user" })
      addApiError(`Create user: ${errorMsg}`)
    } finally {
      setActionLoading(null)
    }
  }

  const updateUser = async (userId: string, updates: Partial<User>) => {
    setActionLoading(`update-${userId}`)
    try {
      const response = await fetch("/api/admin/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, updates }),
      })

      if (!response.ok) {
        throw new Error(`Update user failed: ${response.status}`)
      }

      const data = await response.json()
      if (data.success) {
        setSettingsMessage({ type: "success", text: "User updated successfully!" })
        setEditingUser(null)
        loadData()
        setTimeout(() => setSettingsMessage(null), 3000)
      } else {
        setSettingsMessage({ type: "error", text: data.error || "Failed to update user" })
        addApiError(`Update user: ${data.error}`)
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Unknown error"
      setSettingsMessage({ type: "error", text: "Failed to update user" })
      addApiError(`Update user: ${errorMsg}`)
    } finally {
      setActionLoading(null)
    }
  }

  const deactivateUser = async (userId: string) => {
    const user = users.find((u) => u.id === userId)
    if (!user) return

    if (!confirm(`Are you sure you want to deactivate "${user.username}"?`)) return

    setActionLoading(`deactivate-${userId}`)
    try {
      const response = await fetch("/api/admin/users", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      })

      if (!response.ok) {
        throw new Error(`Deactivate user failed: ${response.status}`)
      }

      const data = await response.json()
      if (data.success) {
        setSettingsMessage({ type: "success", text: "User deactivated successfully!" })
        loadData()
        setTimeout(() => setSettingsMessage(null), 3000)
      } else {
        setSettingsMessage({ type: "error", text: data.error || "Failed to deactivate user" })
        addApiError(`Deactivate user: ${data.error}`)
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Unknown error"
      setSettingsMessage({ type: "error", text: "Failed to deactivate user" })
      addApiError(`Deactivate user: ${errorMsg}`)
    } finally {
      setActionLoading(null)
    }
  }

  const updateSettings = (section: string, key: string, value: any) => {
    setSettings((prev) => {
      const updatedSection = { ...prev[section as keyof ForumSettings], [key]: value }
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

    setApiErrors((prev) => prev.filter((error) => !error.includes("Delete category")))

    try {
      const response = await fetch("/api/admin/categories", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ categoryId }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: `HTTP ${response.status}` }))
        throw new Error(errorData.error || `HTTP ${response.status}`)
      }

      const data = await response.json()
      if (data.success) {
        setSettingsMessage({ type: "success", text: "Category deleted successfully!" })
        loadData()
        setTimeout(() => setSettingsMessage(null), 3000)
      } else {
        throw new Error(data.error || "API returned success: false")
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Unknown error"
      setSettingsMessage({ type: "error", text: "Failed to delete category" })
      addApiError("Delete category", error)
    } finally {
      setActionLoading(null)
    }
  }

  const deletePost = async (postId: string, forceDelete = false) => {
    if (!confirm("Are you sure you want to delete this post?")) return

    setActionLoading(`delete-${postId}`)
    try {
      const response = await fetch("/api/admin/posts", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId, forceDelete }),
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

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "admin":
        return <Crown className="h-4 w-4 text-yellow-600" />
      case "moderator":
        return <Star className="h-4 w-4 text-blue-600" />
      default:
        return <Users className="h-4 w-4 text-gray-600" />
    }
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-yellow-100 text-yellow-800"
      case "moderator":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const saveRewardsSettings = async () => {
    setActionLoading("save-rewards")
    try {
      const response = await fetch("/api/admin/rewards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "update-settings",
          settings: rewardsSettings,
        }),
      })

      if (!response.ok) {
        throw new Error(`Save rewards failed: ${response.status}`)
      }

      const data = await response.json()
      if (data.success) {
        setSettingsMessage({ type: "success", text: "Rewards settings saved successfully!" })
        setTimeout(() => setSettingsMessage(null), 3000)
      } else {
        setSettingsMessage({ type: "error", text: data.error || "Failed to save rewards settings" })
        addApiError(`Save rewards: ${data.error}`)
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Unknown error"
      setSettingsMessage({ type: "error", text: "Failed to save rewards settings" })
      addApiError(`Save rewards: ${errorMsg}`)
    } finally {
      setActionLoading(null)
    }
  }

  const addCoupon = () => {
    if (!newCoupon.name || newCoupon.pointsRequired <= 0 || newCoupon.discountAmount <= 0) {
      setSettingsMessage({ type: "error", text: "Please fill in all coupon fields with valid values" })
      return
    }

    const coupon = {
      id: `coupon-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ...newCoupon,
    }

    setRewardsSettings((prev) => ({
      ...prev,
      coupons: [...prev.coupons, coupon],
    }))

    setNewCoupon({
      name: "",
      pointsRequired: 0,
      discountAmount: 0,
      discountType: "fixed",
      isActive: true,
    })
    setShowNewCouponForm(false)
    setSettingsMessage({ type: "success", text: "Coupon added! Don't forget to save settings." })
    setTimeout(() => setSettingsMessage(null), 3000)
  }

  const removeCoupon = (couponId: string) => {
    setRewardsSettings((prev) => ({
      ...prev,
      coupons: prev.coupons.filter((c) => c.id !== couponId),
    }))
    setSettingsMessage({ type: "success", text: "Coupon removed! Don't forget to save settings." })
    setTimeout(() => setSettingsMessage(null), 3000)
  }

  const toggleCouponStatus = (couponId: string) => {
    setRewardsSettings((prev) => ({
      ...prev,
      coupons: prev.coupons.map((c) => (c.id === couponId ? { ...c, isActive: !c.isActive } : c)),
    }))
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
            <h1 className="text-3xl font-bold">CTM Parts Community Admin</h1>
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
            <p className="text-xs text-gray-500">Community discussions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userStats?.totalUsers || 0}</div>
            <p className="text-xs text-gray-500">{userStats?.activeUsers || 0} active users</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Array.isArray(categories) ? categories.length : 0}</div>
            <p className="text-xs text-gray-500">Discussion categories</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Engagement Rate</CardTitle>
            <BarChart3 className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userStats?.engagementRate || 0}%</div>
            <p className="text-xs text-gray-500">Users posting content</p>
          </CardContent>
        </Card>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={(value) => {
          setActiveTab(value)
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
          <TabsTrigger value="rewards">Rewards</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="categories" className="space-y-4">
          {/* Categories content remains the same */}
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">
              Manage Categories ({Array.isArray(categories) ? categories.length : 0})
            </h2>
            <Button onClick={() => setShowNewCategoryForm(true)} disabled={actionLoading === "create-category"}>
              <Plus className="h-4 w-4 mr-2" />
              {actionLoading === "create-category" ? "Creating..." : "New Category"}
            </Button>
          </div>

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
                            disabled={actionLoading === `delete-${category.id}`}
                            className="text-red-600 hover:text-red-700"
                            title="Delete category"
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
                <CardTitle>Create New Category</CardTitle>
                <CardDescription>Add a new discussion category to your forum</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Name *</label>
                    <Input
                      placeholder="Category name..."
                      value={newCategory.name}
                      onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Color</label>
                    <input
                      type="color"
                      className="w-full h-10 border rounded-lg"
                      value={newCategory.color}
                      onChange={(e) => setNewCategory({ ...newCategory, color: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Description *</label>
                  <Textarea
                    rows={3}
                    placeholder="Describe what this category is for..."
                    value={newCategory.description}
                    onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm font-medium">Private Category</span>
                    <p className="text-xs text-gray-500">Only visible to moderators and admins</p>
                  </div>
                  <Switch
                    checked={newCategory.isPrivate}
                    onCheckedChange={(checked) => setNewCategory({ ...newCategory, isPrivate: checked })}
                  />
                </div>

                <div className="flex gap-2">
                  <Button onClick={createCategory} disabled={actionLoading === "create-category"}>
                    {actionLoading === "create-category" ? "Creating..." : "Create Category"}
                  </Button>
                  <Button variant="outline" onClick={() => setShowNewCategoryForm(false)}>
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="posts" className="space-y-4">
          {/* Posts content remains the same as before */}
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Manage Posts ({Array.isArray(posts) ? posts.length : 0})</h2>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={loadData} disabled={dataLoading}>
                <RefreshCw className="h-4 w-4 mr-2" />
                {dataLoading ? "Refreshing..." : "Refresh"}
              </Button>
            </div>
          </div>

          {(!Array.isArray(posts) || posts.length === 0) && !dataLoading ? (
            <Card>
              <CardContent className="p-8 text-center">
                <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">No posts found.</p>
                <Button onClick={loadData} variant="outline">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Retry Loading
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {Array.isArray(posts) &&
                posts.map((post) => (
                  <Card key={post.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            {post.isPinned && <Pin className="h-4 w-4 text-blue-500" />}
                            {post.isLocked && <Lock className="h-4 w-4 text-red-500" />}
                            {post.status === "hidden" && <EyeOff className="h-4 w-4 text-gray-500" />}
                            <h3 className="font-medium">{post.title}</h3>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-500 mb-2">
                            <span>by {post.author}</span>
                            <span>{formatDate(post.createdAt)}</span>
                            <Badge variant="outline" className="text-xs">
                              {(Array.isArray(categories) && categories.find((c) => c.id === post.categoryId)?.name) ||
                                "Unknown Category"}
                            </Badge>
                            <Badge variant={post.status === "active" ? "default" : "secondary"} className="text-xs">
                              {post.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 line-clamp-2">{post.content}</p>
                          <div className="flex items-center gap-4 text-xs text-gray-500 mt-2">
                            <span>{post.replies || 0} replies</span>
                            <span>{post.views || 0} views</span>
                            <span>{post.likes || 0} likes</span>
                          </div>
                        </div>
                        <div className="flex gap-1 ml-4">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => deletePost(post.id)}
                            disabled={actionLoading === `delete-${post.id}`}
                            className="text-red-600 hover:text-red-700"
                            title="Delete post"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">User Management ({filteredUsers.length})</h2>
            <Button onClick={() => setShowNewUserForm(true)} disabled={actionLoading === "create-user"}>
              <UserPlus className="h-4 w-4 mr-2" />
              {actionLoading === "create-user" ? "Creating..." : "Add User"}
            </Button>
          </div>

          {/* User Stats */}
          {userStats && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                  <UserCheck className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{userStats.activeUsers}</div>
                  <p className="text-xs text-gray-500">Recently active</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Admins</CardTitle>
                  <Crown className="h-4 w-4 text-yellow-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-600">{userStats.usersByRole.admin}</div>
                  <p className="text-xs text-gray-500">Administrator accounts</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Moderators</CardTitle>
                  <Star className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">{userStats.usersByRole.moderator}</div>
                  <p className="text-xs text-gray-500">Moderator accounts</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">New This Week</CardTitle>
                  <UserPlus className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{userStats.recentRegistrations}</div>
                  <p className="text-xs text-gray-500">Recent registrations</p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* User Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
                    <Input
                      placeholder="Search users by username, name, or email..."
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={userRoleFilter} onValueChange={setUserRoleFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All roles</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="moderator">Moderator</SelectItem>
                    <SelectItem value="user">User</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Users List */}
          {filteredUsers.length === 0 && !dataLoading ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">No users found matching your criteria.</p>
                <Button
                  onClick={() => {
                    setUserSearch("")
                    setUserRoleFilter("")
                  }}
                  variant="outline"
                >
                  Clear Filters
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredUsers.map((user) => (
                <Card key={user.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                          <span className="text-lg font-semibold text-gray-600">
                            {user.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium">{user.name}</h3>
                            {getRoleIcon(user.role)}
                            <Badge className={`text-xs ${getRoleBadgeColor(user.role)}`}>{user.role}</Badge>
                            {user.isActive === false && (
                              <Badge variant="secondary" className="text-xs">
                                <UserX className="h-3 w-3 mr-1" />
                                Inactive
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-500">@{user.username}</p>
                          <p className="text-sm text-gray-500">{user.email}</p>
                          <div className="flex gap-4 text-xs text-gray-400 mt-1">
                            <span>Joined: {formatDate(user.createdAt)}</span>
                            {user.lastActive && <span>Last active: {formatDate(user.lastActive)}</span>}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingUser(user)}
                          disabled={actionLoading?.startsWith(`update-${user.id}`)}
                          title="Edit user"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        {user.isActive !== false && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => deactivateUser(user.id)}
                            disabled={actionLoading === `deactivate-${user.id}`}
                            className="text-red-600 hover:text-red-700"
                            title="Deactivate user"
                          >
                            <UserX className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Edit User Form */}
          {editingUser && (
            <Card>
              <CardHeader>
                <CardTitle>Edit User</CardTitle>
                <CardDescription>Update user information and permissions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Username *</label>
                    <Input
                      value={editingUser.username}
                      onChange={(e) => setEditingUser({ ...editingUser, username: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Name *</label>
                    <Input
                      value={editingUser.name}
                      onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Email *</label>
                    <Input
                      type="email"
                      value={editingUser.email}
                      onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Role *</label>
                    <Select
                      value={editingUser.role}
                      onValueChange={(value) =>
                        setEditingUser({ ...editingUser, role: value as "user" | "moderator" | "admin" })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">User</SelectItem>
                        <SelectItem value="moderator">Moderator</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={() => updateUser(editingUser.id, editingUser)}
                    disabled={actionLoading?.startsWith(`update-${editingUser.id}`)}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {actionLoading?.startsWith(`update-${editingUser.id}`) ? "Saving..." : "Save Changes"}
                  </Button>
                  <Button variant="outline" onClick={() => setEditingUser(null)}>
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* New User Form */}
          {showNewUserForm && (
            <Card>
              <CardHeader>
                <CardTitle>Add New User</CardTitle>
                <CardDescription>Create a new user account</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Username *</label>
                    <Input
                      placeholder="Enter username..."
                      value={newUser.username}
                      onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Full Name *</label>
                    <Input
                      placeholder="Enter full name..."
                      value={newUser.name}
                      onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Email *</label>
                    <Input
                      type="email"
                      placeholder="Enter email address..."
                      value={newUser.email}
                      onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Role *</label>
                    <Select
                      value={newUser.role}
                      onValueChange={(value) =>
                        setNewUser({ ...newUser, role: value as "user" | "moderator" | "admin" })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">User</SelectItem>
                        <SelectItem value="moderator">Moderator</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Password *</label>
                  <Input
                    type="password"
                    placeholder="Enter password..."
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  />
                  <p className="text-xs text-gray-500">Minimum 6 characters</p>
                </div>

                <div className="flex gap-2">
                  <Button onClick={createUser} disabled={actionLoading === "create-user"}>
                    <UserPlus className="h-4 w-4 mr-2" />
                    {actionLoading === "create-user" ? "Creating..." : "Create User"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowNewUserForm(false)
                      setNewUser({ username: "", name: "", email: "", password: "", role: "user" })
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="rewards" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Rewards System</h2>
            <Button onClick={saveRewardsSettings} disabled={actionLoading === "save-rewards"}>
              <Save className="h-4 w-4 mr-2" />
              {actionLoading === "save-rewards" ? "Saving..." : "Save Rewards Settings"}
            </Button>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Points Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Points Configuration</CardTitle>
                <CardDescription>Set how many points users earn for different actions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Points per Post</label>
                  <Input
                    type="number"
                    value={rewardsSettings.pointsPerPost}
                    onChange={(e) =>
                      setRewardsSettings((prev) => ({ ...prev, pointsPerPost: Number.parseInt(e.target.value) || 0 }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Points per Reply</label>
                  <Input
                    type="number"
                    value={rewardsSettings.pointsPerReply}
                    onChange={(e) =>
                      setRewardsSettings((prev) => ({ ...prev, pointsPerReply: Number.parseInt(e.target.value) || 0 }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Points per Like Given</label>
                  <Input
                    type="number"
                    value={rewardsSettings.pointsPerLike}
                    onChange={(e) =>
                      setRewardsSettings((prev) => ({ ...prev, pointsPerLike: Number.parseInt(e.target.value) || 0 }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Points per Like Received</label>
                  <Input
                    type="number"
                    value={rewardsSettings.pointsPerReceivingLike}
                    onChange={(e) =>
                      setRewardsSettings((prev) => ({
                        ...prev,
                        pointsPerReceivingLike: Number.parseInt(e.target.value) || 0,
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Daily Points Limit</label>
                  <Input
                    type="number"
                    value={rewardsSettings.dailyPointsLimit}
                    onChange={(e) =>
                      setRewardsSettings((prev) => ({
                        ...prev,
                        dailyPointsLimit: Number.parseInt(e.target.value) || 0,
                      }))
                    }
                  />
                </div>
              </CardContent>
            </Card>

            {/* Coupons Management */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Reward Coupons</CardTitle>
                    <CardDescription>Manage available coupons for redemption</CardDescription>
                  </div>
                  <Button size="sm" onClick={() => setShowNewCouponForm(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Coupon
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {rewardsSettings.coupons.map((coupon) => (
                    <div key={coupon.id} className="border rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{coupon.name}</h4>
                        <div className="flex items-center gap-2">
                          <Switch checked={coupon.isActive} onCheckedChange={() => toggleCouponStatus(coupon.id)} />
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => removeCoupon(coupon.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="text-sm text-gray-600">
                        <p>
                          ${coupon.discountAmount} off • {coupon.pointsRequired} points
                        </p>
                        <p>Status: {coupon.isActive ? "Active" : "Inactive"}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {showNewCouponForm && (
                  <div className="mt-4 p-4 border rounded-lg bg-gray-50">
                    <h4 className="font-medium mb-3">Add New Coupon</h4>
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Coupon Name</label>
                        <Input
                          placeholder="e.g., $15 Off Coupon"
                          value={newCoupon.name}
                          onChange={(e) => setNewCoupon((prev) => ({ ...prev, name: e.target.value }))}
                        />
                      </div>
                      <div className="grid gap-3 md:grid-cols-2">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Points Required</label>
                          <Input
                            type="number"
                            placeholder="2000"
                            value={newCoupon.pointsRequired || ""}
                            onChange={(e) =>
                              setNewCoupon((prev) => ({
                                ...prev,
                                pointsRequired: Number.parseInt(e.target.value) || 0,
                              }))
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Discount Amount ($)</label>
                          <Input
                            type="number"
                            placeholder="15"
                            value={newCoupon.discountAmount || ""}
                            onChange={(e) =>
                              setNewCoupon((prev) => ({
                                ...prev,
                                discountAmount: Number.parseInt(e.target.value) || 0,
                              }))
                            }
                          />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" onClick={addCoupon}>
                          Add Coupon
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setShowNewCouponForm(false)}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Rewards Preview */}
          <Card>
            <CardHeader>
              <CardTitle>Rewards Preview</CardTitle>
              <CardDescription>How the rewards system will work for users</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <MessageSquare className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-blue-600">{rewardsSettings.pointsPerPost}</div>
                  <p className="text-sm text-blue-600">Points per Post</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <MessageSquare className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-green-600">{rewardsSettings.pointsPerReply}</div>
                  <p className="text-sm text-green-600">Points per Reply</p>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <Heart className="h-8 w-8 text-red-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-red-600">{rewardsSettings.pointsPerLike}</div>
                  <p className="text-sm text-red-600">Points per Like</p>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <Star className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-yellow-600">{rewardsSettings.dailyPointsLimit}</div>
                  <p className="text-sm text-yellow-600">Daily Limit</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Forum Settings</h2>
            <div className="flex gap-2">
              <Button onClick={loadSettings} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Reload
              </Button>
              <Button onClick={saveSettings} disabled={settingsLoading}>
                {settingsLoading ? "Saving..." : "Save All Changes"}
              </Button>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* General Settings */}
            <Card>
              <CardHeader>
                <CardTitle>General Settings</CardTitle>
                <CardDescription>Configure basic forum settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Forum Name *</label>
                  <Input
                    value={settings.general.forumName}
                    onChange={(e) => updateSettings("general", "forumName", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Description</label>
                  <Textarea
                    rows={3}
                    value={settings.general.description}
                    onChange={(e) => updateSettings("general", "description", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Contact Email *</label>
                  <Input
                    type="email"
                    value={settings.general.contactEmail}
                    onChange={(e) => updateSettings("general", "contactEmail", e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Moderation Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Moderation</CardTitle>
                <CardDescription>Configure moderation and security settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm font-medium">Require approval for new posts</span>
                    <p className="text-xs text-gray-500">All posts need admin approval before being visible</p>
                  </div>
                  <Switch
                    checked={settings.moderation.requireApproval}
                    onCheckedChange={(checked) => updateSettings("moderation", "requireApproval", checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm font-medium">Enable automatic spam detection</span>
                    <p className="text-xs text-gray-500">Automatically flag potential spam posts</p>
                  </div>
                  <Switch
                    checked={settings.moderation.autoSpamDetection}
                    onCheckedChange={(checked) => updateSettings("moderation", "autoSpamDetection", checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {lastSaved && (
            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-4">
                <p className="text-sm text-green-800">
                  <CheckCircle className="h-4 w-4 inline mr-2" />
                  Settings last saved: {formatDate(lastSaved)}
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
