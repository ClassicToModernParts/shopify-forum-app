"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MessageSquare, Users, Clock, Plus, Eye, Heart, Pin, Lock, ArrowLeft, Send, X } from "lucide-react"
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
    loadCategories()
    loadPosts()
    loadForumStats()
  }, [])

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
      // Use default values instead of showing error
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
      if (!response.ok) {
        throw new Error(`Categories API failed: ${response.status}`)
      }
      const data = await response.json()
      if (data.success) {
        console.log("✅ Categories loaded:", data.data)
        setCategories(Array.isArray(data.data) ? data.data : [])
      } else {
        console.error("❌ Categories API returned error:", data.error)
        setError("Failed to load categories. Please try again later.")
      }
    } catch (error) {
      console.error("❌ Error loading categories:", error)
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
      if (data.success) {
        console.log("✅ Posts loaded:", data.data)
        const loadedPosts = Array.isArray(data.data) ? data.data : []
        setPosts(loadedPosts)

        if (categoryId) {
          setCategoryPosts(loadedPosts)
          const category = categories.find((c) => c.id === categoryId)
          if (category) {
            setCurrentCategoryName(category.name)
          }
        }
      } else {
        console.error("❌ Posts API returned error:", data.error)
        setError("Failed to load posts. Please try again later.")
      }
    } catch (error) {
      console.error("❌ Error loading posts:", error)
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
      if (data.success) {
        console.log("✅ Replies loaded:", data.data)
        setReplies(Array.isArray(data.data) ? data.data : [])
      } else {
        console.error("❌ Replies API returned error:", data.error)
      }
    } catch (error) {
      console.error("❌ Error loading replies:", error)
    }
  }

  const handleCategoryClick = (categoryId: string) => {
    console.log("🔍 Category clicked:", categoryId)
    setSelectedCategory(categoryId)
    setSelectedPost(null)
    setShowCategoryPosts(true)

    // Find the category name
    const category = categories.find((c) => c.id === categoryId)
    if (category) {
      setCurrentCategoryName(category.name)
    }

    loadPosts(categoryId, searchQuery, sortBy)
  }

  const handlePostClick = async (post: Post) => {
    console.log("🔍 Post clicked:", post.id)
    setSelectedPost(post)
    await loadReplies(post.id)

    // Increment view count
    try {
      await fetch(`/api/forum?type=post&shop_id=demo&post_id=${post.id}`)
    } catch (error) {
      console.error("❌ Error incrementing view count:", error)
    }
  }

  const handleSearch = () => {
    console.log("🔍 Search triggered:", searchQuery)
    loadPosts(selectedCategory || undefined, searchQuery, sortBy)
  }

  const handleSortChange = (newSort: string) => {
    console.log("🔄 Sort changed:", newSort)
    setSortBy(newSort)
    loadPosts(selectedCategory || undefined, searchQuery, newSort)
  }

  const createPost = async () => {
    try {
      console.log("📝 Creating new post:", newPost)

      if (!newPost.title || !newPost.content || !newPost.author || !newPost.categoryId) {
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

        // If we're viewing a category, reload that category's posts
        if (showCategoryPosts && selectedCategory) {
          loadPosts(selectedCategory, searchQuery, sortBy)
        } else {
          loadPosts(undefined, searchQuery, sortBy)
        }

        loadCategories()
        loadForumStats() // Refresh stats after creating post
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
    try {
      console.log("💬 Creating new reply:", newReply)

      if (!newReply.content || !newReply.author || !selectedPost) {
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
          author: newReply.author,
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
        console.log("✅ Post liked successfully")
        loadPosts(selectedCategory || undefined, searchQuery, sortBy)
        if (selectedPost && selectedPost.id === postId) {
          setSelectedPost({ ...selectedPost, likes: selectedPost.likes + 1 })
        }
      } else {
        console.error("❌ Like post API returned error:", data.error)
      }
    } catch (error) {
      console.error("❌ Error liking post:", error)
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
    console.log("📝 New post button clicked")
    // Set default author if user is logged in
    if (user) {
      setNewPost((prev) => ({
        ...prev,
        author: user.name || user.email || "",
      }))
    }

    // Set default category if one is selected
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

  // Single Post View
  if (selectedPost) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b sticky top-0 z-10">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => {
                    setSelectedPost(null)
                    if (showCategoryPosts) {
                      loadPosts(selectedCategory || undefined, searchQuery, sortBy)
                    }
                  }}
                  className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
                >
                  <ArrowLeft className="h-5 w-5" />
                  <span>Back to {showCategoryPosts ? currentCategoryName : "Forum"}</span>
                </button>
                <div className="h-6 w-px bg-gray-300" />
                <Link href="/" className="text-gray-600 hover:text-gray-900">
                  Home
                </Link>
              </div>
              <button
                onClick={() => setShowReplyModal(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Send className="h-4 w-4" />
                <span>Reply</span>
              </button>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-6 py-8">
          <div className="max-w-4xl mx-auto">
            {/* Post Content */}
            <div className="bg-white rounded-lg shadow-sm border p-8 mb-6">
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-4">
                    {selectedPost.isPinned && <Pin className="h-5 w-5 text-blue-500" />}
                    {selectedPost.isLocked && <Lock className="h-5 w-5 text-red-500" />}
                    <span
                      className="px-3 py-1 rounded-full text-sm font-medium text-white"
                      style={{ backgroundColor: getCategoryById(selectedPost.categoryId)?.color }}
                    >
                      {getCategoryById(selectedPost.categoryId)?.name}
                    </span>
                  </div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-4">{selectedPost.title}</h1>
                  <div className="flex items-center space-x-4 text-sm text-gray-500 mb-6">
                    <span className="font-medium">{selectedPost.author}</span>
                    <span>•</span>
                    <span>{formatDate(selectedPost.createdAt)}</span>
                    <span>•</span>
                    <div className="flex items-center space-x-1">
                      <Eye className="h-4 w-4" />
                      <span>{selectedPost.views}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="prose max-w-none mb-6">
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{selectedPost.content}</p>
              </div>

              {selectedPost.tags && selectedPost.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {selectedPost.tags.map((tag, index) => (
                    <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              <div className="flex items-center justify-between pt-6 border-t">
                <div className="flex items-center space-x-6">
                  <button
                    onClick={() => likePost(selectedPost.id)}
                    className="flex items-center space-x-2 text-gray-600 hover:text-red-500 transition-colors"
                  >
                    <Heart className="h-5 w-5" />
                    <span>{selectedPost.likes}</span>
                  </button>
                  <div className="flex items-center space-x-2 text-gray-600">
                    <MessageSquare className="h-5 w-5" />
                    <span>{replies.length} replies</span>
                  </div>
                </div>
                <button
                  onClick={() => setShowReplyModal(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Reply to Post
                </button>
              </div>
            </div>

            {/* Replies */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900">Replies ({replies.length})</h2>

              {replies.length === 0 ? (
                <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
                  <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">No replies yet. Be the first to respond!</p>
                  <button
                    onClick={() => setShowReplyModal(true)}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Add Reply
                  </button>
                </div>
              ) : (
                replies.map((reply) => (
                  <div key={reply.id} className="bg-white rounded-lg shadow-sm border p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-medium text-sm">
                          {reply.author.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <span className="font-medium text-gray-900">{reply.author}</span>
                          <div className="text-sm text-gray-500">{formatDate(reply.createdAt)}</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 text-gray-500">
                        <Heart className="h-4 w-4" />
                        <span>{reply.likes}</span>
                      </div>
                    </div>
                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{reply.content}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Reply Modal */}
        {showReplyModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Reply to Post</h2>
                <button onClick={() => setShowReplyModal(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="h-6 w-6" />
                </button>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">{error}</div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Your Name *</label>
                  <input
                    type="text"
                    placeholder="Enter your name..."
                    value={newReply.author}
                    onChange={(e) => setNewReply({ ...newReply, author: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Your Reply *</label>
                  <textarea
                    placeholder="Write your reply..."
                    rows={6}
                    value={newReply.content}
                    onChange={(e) => setNewReply({ ...newReply, content: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={createReply}
                    disabled={loading}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {loading ? "Posting..." : "Post Reply"}
                  </button>
                  <button
                    onClick={() => setShowReplyModal(false)}
                    className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  // Category Posts View
  if (showCategoryPosts) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center space-x-4">
                <button
                  onClick={handleBackToCategories}
                  className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
                >
                  <ArrowLeft className="h-5 w-5" />
                  <span>Back to Categories</span>
                </button>
                <div className="h-6 w-px bg-gray-300" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{currentCategoryName}</h1>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <Button onClick={handleNewPostClick}>
                  <Plus className="h-4 w-4 mr-2" />
                  New Post
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">{error}</div>}

          {/* Posts List */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">Posts in {currentCategoryName}</h2>

              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-gray-600">Loading posts...</p>
                </div>
              ) : categoryPosts.length > 0 ? (
                <div className="space-y-4">
                  {categoryPosts.map((post) => (
                    <div
                      key={post.id}
                      className="border rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => handlePostClick(post)}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-lg text-gray-900">{post.title}</h3>
                          <p className="text-gray-600 line-clamp-2 mt-1">{post.content}</p>
                          <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                            <span>{post.author}</span>
                            <span>•</span>
                            <span>{formatDate(post.createdAt)}</span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end space-y-2">
                          <div className="flex items-center space-x-3 text-gray-500">
                            <div className="flex items-center space-x-1">
                              <MessageSquare className="h-4 w-4" />
                              <span>{post.replies}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Eye className="h-4 w-4" />
                              <span>{post.views}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Heart className="h-4 w-4" />
                              <span>{post.likes}</span>
                            </div>
                          </div>
                          {post.tags && post.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 justify-end">
                              {post.tags.slice(0, 2).map((tag, index) => (
                                <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                                  #{tag}
                                </span>
                              ))}
                              {post.tags.length > 2 && (
                                <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs">
                                  +{post.tags.length - 2}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No posts in this category yet</h3>
                  <p className="text-gray-600 mb-4">Be the first to start a conversation!</p>
                  <Button onClick={handleNewPostClick}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create First Post
                  </Button>
                </div>
              )}
            </div>
          </div>
        </main>

        {/* New Post Modal */}
        {showNewPostModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-3xl">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Create New Post</h2>
                <button onClick={() => setShowNewPostModal(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="h-6 w-6" />
                </button>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">{error}</div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Title *</label>
                  <input
                    type="text"
                    placeholder="Enter post title..."
                    value={newPost.title}
                    onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Category *</label>
                  <select
                    value={newPost.categoryId}
                    onChange={(e) => setNewPost({ ...newPost, categoryId: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select a category</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Your Name *</label>
                  <input
                    type="text"
                    placeholder="Enter your name..."
                    value={newPost.author}
                    onChange={(e) => setNewPost({ ...newPost, author: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Content *</label>
                  <textarea
                    placeholder="Write your post..."
                    rows={8}
                    value={newPost.content}
                    onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Tags (comma separated)</label>
                  <input
                    type="text"
                    placeholder="tag1, tag2, tag3..."
                    value={newPost.tags}
                    onChange={(e) => setNewPost({ ...newPost, tags: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={createPost}
                    disabled={loading}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {loading ? "Creating..." : "Create Post"}
                  </button>
                  <button
                    onClick={() => setShowNewPostModal(false)}
                    className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  // Main Forum View (Categories)
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
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

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">{error}</div>}

        {/* Forum Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <MessageSquare className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Posts</p>
                  <p className="text-2xl font-bold text-gray-900">{forumData.totalPosts}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold text-gray-900">{forumData.totalUsers}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Online Now</p>
                  <p className="text-2xl font-bold text-gray-900">{forumData.onlineUsers}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Categories Section */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-2xl font-bold">Categories</CardTitle>
                <CardDescription>Browse topics and join the conversation</CardDescription>
              </div>
              <Button onClick={handleNewPostClick}>
                <Plus className="h-4 w-4 mr-2" />
                New Post
              </Button>
            </div>
          </CardHeader>
          <CardContent>
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
                      <Badge variant="secondary">{category.postCount}</Badge>
                      <p className="text-xs text-gray-500 mt-1">{formatDate(category.lastActivity)}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No categories yet</h3>
                <p className="text-gray-600 mb-4">Be the first to start a conversation!</p>
                {!isAuthenticated && (
                  <div className="space-x-2">
                    <Link href="/login">
                      <Button variant="outline">Login</Button>
                    </Link>
                    <Link href="/register">
                      <Button>Sign Up to Post</Button>
                    </Link>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* New Post Modal */}
        {showNewPostModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-3xl">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Create New Post</h2>
                <button onClick={() => setShowNewPostModal(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="h-6 w-6" />
                </button>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">{error}</div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Title *</label>
                  <input
                    type="text"
                    placeholder="Enter post title..."
                    value={newPost.title}
                    onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Category *</label>
                  <select
                    value={newPost.categoryId}
                    onChange={(e) => setNewPost({ ...newPost, categoryId: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select a category</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Your Name *</label>
                  <input
                    type="text"
                    placeholder="Enter your name..."
                    value={newPost.author}
                    onChange={(e) => setNewPost({ ...newPost, author: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Content *</label>
                  <textarea
                    placeholder="Write your post..."
                    rows={8}
                    value={newPost.content}
                    onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Tags (comma separated)</label>
                  <input
                    type="text"
                    placeholder="tag1, tag2, tag3..."
                    value={newPost.tags}
                    onChange={(e) => setNewPost({ ...newPost, tags: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={createPost}
                    disabled={loading}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {loading ? "Creating..." : "Create Post"}
                  </button>
                  <button
                    onClick={() => setShowNewPostModal(false)}
                    className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
