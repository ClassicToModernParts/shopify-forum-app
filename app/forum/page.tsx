"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { MessageSquare, Users, Clock, Plus, LogIn } from "lucide-react"
import Link from "next/link"
import useUserAuth from "@/hooks/useUserAuth"

interface Category {
  id: string
  name: string
  description: string
  postCount: number
  lastActivity: string
  color: string
  icon?: string
  isPrivate?: boolean
}

interface Post {
  id: string
  title: string
  content: string
  author: string
  authorEmail?: string
  categoryId: string
  createdAt: string
  updatedAt?: string
  replies: number
  views: number
  likes: number
  isPinned: boolean
  isLocked: boolean
  tags: string[]
  status: string
}

interface Reply {
  id: string
  postId: string
  content: string
  author: string
  authorEmail?: string
  createdAt: string
  likes: number
}

interface ForumData {
  totalPosts: number
  totalUsers: number
  totalCategories: number
  onlineUsers: number
}

export default function ForumPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [posts, setPosts] = useState<Post[]>([])
  const [replies, setReplies] = useState<Reply[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedPost, setSelectedPost] = useState<Post | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState("recent")
  const [loading, setLoading] = useState(false)
  const [showNewPostModal, setShowNewPostModal] = useState(false)
  const [showReplyModal, setShowReplyModal] = useState(false)
  const [newPost, setNewPost] = useState({
    title: "",
    content: "",
    author: "",
    categoryId: "",
    tags: "",
  })
  const [newReply, setNewReply] = useState({
    content: "",
    author: "",
  })
  const [forumData, setForumData] = useState<ForumData>({
    totalPosts: 0,
    totalUsers: 0,
    totalCategories: 0,
    onlineUsers: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const { user, isAuthenticated, logout } = useUserAuth()
  const [error, setError] = useState<string | null>(null)
  const [categoryPosts, setCategoryPosts] = useState<Post[]>([])
  const [showCategoryPosts, setShowCategoryPosts] = useState(false)
  const [currentCategoryName, setCurrentCategoryName] = useState("")

  useEffect(() => {
    checkSystemInitialization()
    loadCategories()
    loadPosts()
    loadForumStats()
  }, [])

  const checkSystemInitialization = async () => {
    try {
      console.log("🔍 Checking system initialization...")
      const response = await fetch("/api/admin/init-system")

      if (response.ok) {
        const data = await response.json()
        console.log("📊 System status:", data)

        if (!data.isInitialized) {
          console.log("⚠️ System not initialized - consider visiting /admin/init-system")
        }
      }
    } catch (error) {
      console.error("❌ Error checking system initialization:", error)
    }
  }

  const loadForumStats = async () => {
    try {
      console.log("📊 Loading forum stats...")
      const response = await fetch("/api/forum/stats")

      if (!response.ok) {
        console.warn(`⚠️ Stats API returned ${response.status}, using defaults`)
        setForumData({
          totalPosts: 0,
          totalUsers: 0,
          totalCategories: 0,
          onlineUsers: 0,
        })
        return
      }

      const result = await response.json()
      console.log("📊 Stats API response:", result)

      if (result.success && result.data) {
        setForumData({
          totalPosts: result.data.totalPosts || 0,
          totalUsers: result.data.totalUsers || 0,
          totalCategories: result.data.totalCategories || 0,
          onlineUsers: result.data.onlineUsers || result.data.activeToday || 0,
        })
        console.log("✅ Forum stats loaded successfully")
      } else {
        console.warn("⚠️ Stats API returned invalid data, using defaults")
        setForumData({
          totalPosts: 0,
          totalUsers: 0,
          totalCategories: 0,
          onlineUsers: 0,
        })
      }
    } catch (error) {
      console.error("❌ Error loading forum stats:", error)
      setForumData({
        totalPosts: 0,
        totalUsers: 0,
        totalCategories: 0,
        onlineUsers: 0,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const loadCategories = async () => {
    try {
      console.log("🔍 Loading categories...")
      const response = await fetch("/api/forum?type=categories&shop_id=demo")
      console.log("📡 Categories API response status:", response.status)

      if (!response.ok) {
        throw new Error(`Categories API failed: ${response.status}`)
      }

      const data = await response.json()
      console.log("📊 Categories API full response:", data)

      if (data.success) {
        console.log("✅ Categories loaded successfully")
        console.log("📂 Categories data:", data.data)
        console.log("📊 Categories count:", Array.isArray(data.data) ? data.data.length : "Not an array")

        // Ensure data.data is an array
        const categoriesArray = Array.isArray(data.data) ? data.data : []
        setCategories(categoriesArray)

        if (categoriesArray.length === 0) {
          console.log("⚠️ No categories found - system may need initialization")
        }
      } else {
        console.error("❌ Categories API returned error:", data.error)
        setCategories([]) // Set empty array on error
        setError("Failed to load categories. Please try again later.")
      }
    } catch (error) {
      console.error("❌ Error loading categories:", error)
      setCategories([]) // Set empty array on error
      setError("Failed to load categories. Please try again later.")
    }
  }

  const loadPosts = async (categoryId?: string, search?: string, sort?: string) => {
    setLoading(true)
    try {
      console.log("🔍 Loading posts...", { categoryId, search, sort })
      let url = `/api/forum?type=posts&shop_id=demo`
      if (categoryId) url += `&category_id=${categoryId}`
      if (search) url += `&search=${encodeURIComponent(search)}`
      if (sort) url += `&sort_by=${sort}`

      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`Posts API failed: ${response.status}`)
      }

      const data = await response.json()
      console.log("📊 Posts API response:", data)

      if (data.success) {
        console.log("✅ Posts loaded:", data.data)
        // Ensure data.data is an array
        const postsArray = Array.isArray(data.data) ? data.data : []
        setPosts(postsArray)

        if (categoryId) {
          setCategoryPosts(postsArray)
          const category = categories.find((c) => c.id === categoryId)
          if (category) {
            setCurrentCategoryName(category.name)
          }
        }
      } else {
        console.error("❌ Posts API returned error:", data.error)
        setPosts([]) // Set empty array on error
        setCategoryPosts([]) // Set empty array on error
        setError("Failed to load posts. Please try again later.")
      }
    } catch (error) {
      console.error("❌ Error loading posts:", error)
      setPosts([]) // Set empty array on error
      setCategoryPosts([]) // Set empty array on error
      setError("Failed to load posts. Please try again later.")
    } finally {
      setLoading(false)
    }
  }

  const loadReplies = async (postId: string) => {
    try {
      console.log("🔍 Loading replies for post:", postId)
      const response = await fetch(`/api/forum?type=replies&shop_id=demo&post_id=${postId}`)
      if (!response.ok) {
        throw new Error(`Replies API failed: ${response.status}`)
      }

      const data = await response.json()
      console.log("📊 Replies API response:", data)

      if (data.success) {
        console.log("✅ Replies loaded:", data.data)
        // Ensure data.data is an array
        const repliesArray = Array.isArray(data.data) ? data.data : []
        setReplies(repliesArray)
      } else {
        console.error("❌ Replies API returned error:", data.error)
        setReplies([]) // Set empty array on error
      }
    } catch (error) {
      console.error("❌ Error loading replies:", error)
      setReplies([]) // Set empty array on error
    }
  }

  const handlePostClick = async (post: Post) => {
    console.log("🔍 Post clicked:", post.id)
    setSelectedPost(post)

    try {
      const viewResponse = await fetch(`/api/forum?type=post&shop_id=demo&post_id=${post.id}`)
      if (viewResponse.ok) {
        const viewData = await viewResponse.json()
        if (viewData.success && viewData.data) {
          setSelectedPost((prev) => (prev ? { ...prev, views: viewData.data.views } : null))
        }
      }
      await loadReplies(post.id)
    } catch (error) {
      console.error("❌ Error handling post click:", error)
    }
  }

  const requireAuth = (action: string) => {
    if (!isAuthenticated) {
      setError(`Please log in to ${action}. You need an account to interact with the forum.`)
      return false
    }
    return true
  }

  const createPost = async () => {
    if (!requireAuth("create posts")) return

    try {
      console.log("📝 Creating new post:", newPost)

      if (!newPost.title || !newPost.content || !newPost.categoryId) {
        setError("Please fill in all required fields")
        return
      }

      setLoading(true)
      const response = await fetch("/api/forum", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "create_post",
          shopId: "demo",
          ...newPost,
          author: user?.name || user?.email || "Anonymous",
          authorEmail: user?.email || "",
          tags: newPost.tags
            .split(",")
            .map((tag) => tag.trim())
            .filter(Boolean),
        }),
      })

      if (!response.ok) {
        throw new Error(`Create post API failed: ${response.status}`)
      }

      const data = await response.json()
      if (data.success) {
        console.log("✅ Post created successfully:", data.data)
        setNewPost({ title: "", content: "", author: "", categoryId: "", tags: "" })
        setShowNewPostModal(false)

        if (showCategoryPosts && selectedCategory) {
          loadPosts(selectedCategory, searchQuery, sortBy)
        } else {
          loadPosts(undefined, searchQuery, sortBy)
        }

        loadCategories()
        loadForumStats()
        setError(null)
      } else {
        console.error("❌ Create post API returned error:", data.error)
        setError(data.error || "Failed to create post. Please try again.")
      }
    } catch (error) {
      console.error("❌ Error creating post:", error)
      setError("Failed to create post. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const createReply = async () => {
    if (!requireAuth("reply to posts")) return

    try {
      console.log("💬 Creating new reply:", newReply)

      if (!newReply.content || !selectedPost) {
        setError("Please fill in all required fields")
        return
      }

      setLoading(true)
      const response = await fetch("/api/forum", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "create_reply",
          shopId: "demo",
          postId: selectedPost.id,
          content: newReply.content,
          author: user?.name || user?.email || "Anonymous",
          authorEmail: user?.email || "",
        }),
      })

      if (!response.ok) {
        throw new Error(`Create reply API failed: ${response.status}`)
      }

      const data = await response.json()
      if (data.success) {
        console.log("✅ Reply created successfully:", data.data)
        setNewReply({ content: "", author: "" })
        setShowReplyModal(false)
        loadReplies(selectedPost.id)
        loadPosts(selectedCategory || undefined, searchQuery, sortBy)
        setError(null)
      } else {
        console.error("❌ Create reply API returned error:", data.error)
        setError(data.error || "Failed to create reply. Please try again.")
      }
    } catch (error) {
      console.error("❌ Error creating reply:", error)
      setError("Failed to create reply. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const likePost = async (postId: string) => {
    if (!requireAuth("like posts")) return

    try {
      console.log("👍 Liking post:", postId)
      const response = await fetch("/api/forum", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "like_post",
          shopId: "demo",
          postId,
        }),
      })

      if (!response.ok) {
        throw new Error(`Like post API failed: ${response.status}`)
      }

      const data = await response.json()
      if (data.success) {
        console.log("✅ Post liked successfully:", data.data)
        setPosts((prevPosts) => prevPosts.map((p) => (p.id === postId ? { ...p, likes: data.data.likes } : p)))
        setCategoryPosts((prevPosts) => prevPosts.map((p) => (p.id === postId ? { ...p, likes: data.data.likes } : p)))
        if (selectedPost && selectedPost.id === postId) {
          setSelectedPost({ ...selectedPost, likes: data.data.likes })
        }
      } else {
        console.error("❌ Like post API returned error:", data.error)
      }
    } catch (error) {
      console.error("❌ Error liking post:", error)
    }
  }

  const likeReply = async (replyId: string) => {
    if (!requireAuth("like replies")) return

    try {
      console.log("👍 Liking reply:", replyId)
      const response = await fetch("/api/forum", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "like_reply",
          shopId: "demo",
          replyId,
        }),
      })

      if (!response.ok) {
        throw new Error(`Like reply API failed: ${response.status}`)
      }

      const data = await response.json()
      if (data.success) {
        console.log("✅ Reply liked successfully:", data.data)
        setReplies((prevReplies) => prevReplies.map((r) => (r.id === replyId ? { ...r, likes: data.data.likes } : r)))
      } else {
        console.error("❌ Like reply API returned error:", data.error)
      }
    } catch (error) {
      console.error("❌ Error liking reply:", error)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 1) return "Just now"
    if (diffInHours < 24) return `${diffInHours}h ago`
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`
    return date.toLocaleDateString()
  }

  const getCategoryById = (id: string) => categories.find((c) => c.id === id)

  const handleNewPostClick = () => {
    if (!requireAuth("create posts")) return

    console.log("📝 New post button clicked")
    if (user) {
      setNewPost((prev) => ({
        ...prev,
        author: user.name || user.email || "",
      }))
    }

    if (selectedCategory) {
      setNewPost((prev) => ({
        ...prev,
        categoryId: selectedCategory,
      }))
    } else if (categories.length > 0) {
      setNewPost((prev) => ({
        ...prev,
        categoryId: categories[0].id,
      }))
    }

    setShowNewPostModal(true)
  }

  const handleBackToCategories = () => {
    setShowCategoryPosts(false)
    setSelectedCategory(null)
    setCategoryPosts([])
  }

  const handleCategoryClick = (categoryId: string) => {
    console.log("🔍 Category clicked:", categoryId)
    setSelectedCategory(categoryId)
    setSelectedPost(null)
    setShowCategoryPosts(true)

    const category = categories.find((c) => c.id === categoryId)
    if (category) {
      setCurrentCategoryName(category.name)
    }

    loadPosts(categoryId, searchQuery, sortBy)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading forum...</p>
        </div>
      </div>
    )
  }

  // Rest of the component remains the same as the previous implementation...
  // [Include all the JSX return statements from the previous working version]

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="bg-blue-600 p-2 rounded-lg">
                <MessageSquare className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Community Forum</h1>
                <p className="text-gray-600">Connect • Share • Grow</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {isAuthenticated && user ? (
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-600">Welcome, {user.name}!</span>
                  <Button variant="outline" onClick={logout}>
                    Logout
                  </Button>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Link href="/login">
                    <Button variant="outline">Login</Button>
                  </Link>
                  <Link href="/register">
                    <Button>Sign Up</Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">{error}</div>}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <MessageSquare className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Posts</p>
                <p className="text-2xl font-bold text-gray-900">{forumData.totalPosts}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{forumData.totalUsers}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Online Now</p>
                <p className="text-2xl font-bold text-gray-900">{forumData.onlineUsers}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold">Categories</h2>
                <p className="text-gray-600">Browse topics and join the conversation</p>
              </div>
              {isAuthenticated ? (
                <Button onClick={handleNewPostClick}>
                  <Plus className="h-4 w-4 mr-2" />
                  New Post
                </Button>
              ) : (
                <Link href="/login">
                  <Button>
                    <LogIn className="h-4 w-4 mr-2" />
                    Login to Post
                  </Button>
                </Link>
              )}
            </div>

            {categories && categories.length > 0 ? (
              <div className="space-y-4">
                {categories.map((category) => (
                  <div
                    key={category.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => handleCategoryClick(category.id)}
                  >
                    <div className="flex items-center space-x-4">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: category.color || "#3B82F6" }}
                      ></div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{category.name}</h3>
                        <p className="text-sm text-gray-600">{category.description}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {category.postCount}
                      </span>
                      <p className="text-xs text-gray-500 mt-1">{formatDate(category.lastActivity)}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No categories yet</h3>

                {!isAuthenticated ? (
                  <>
                    <p className="text-gray-600 mb-4">Create an account to join the conversation!</p>
                    <div className="space-x-2">
                      <Link href="/login">
                        <Button variant="outline">Login</Button>
                      </Link>
                      <Link href="/register">
                        <Button>Sign Up</Button>
                      </Link>
                    </div>
                  </>
                ) : (
                  <>
                    <p className="text-gray-600 mb-4">The forum appears to be empty. This might mean:</p>
                    <ul className="text-sm text-gray-500 mb-4 space-y-1">
                      <li>• The system needs to be initialized</li>
                      <li>• Categories haven't been created yet</li>
                      <li>• There was a recent deployment</li>
                    </ul>
                    <div className="space-x-2">
                      <Link href="/admin/init-system">
                        <Button>Check System Status</Button>
                      </Link>
                      <button
                        onClick={() => {
                          loadCategories()
                          loadForumStats()
                        }}
                        className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                      >
                        Refresh
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
