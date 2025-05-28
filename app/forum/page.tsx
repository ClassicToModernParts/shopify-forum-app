"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Search, Plus, MessageSquare, Eye, Heart, Pin, Lock, Filter, ArrowLeft, Send, X } from "lucide-react"

interface Category {
  id: string
  name: string
  description: string
  postCount: number
  lastActivity: string
  color: string
  icon: string
  isPrivate: boolean
}

interface Post {
  id: string
  title: string
  content: string
  author: string
  authorEmail: string
  categoryId: string
  createdAt: string
  updatedAt: string
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
  authorEmail: string
  createdAt: string
  likes: number
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

  useEffect(() => {
    loadCategories()
    loadPosts()
  }, [])

  const loadCategories = async () => {
    try {
      const response = await fetch("/api/forum?type=categories&shop_id=demo")
      const data = await response.json()
      if (data.success) {
        setCategories(data.data)
      }
    } catch (error) {
      console.error("Error loading categories:", error)
    }
  }

  const loadPosts = async (categoryId?: string, search?: string, sort?: string) => {
    setLoading(true)
    try {
      let url = `/api/forum?type=posts&shop_id=demo`
      if (categoryId) url += `&category_id=${categoryId}`
      if (search) url += `&search=${encodeURIComponent(search)}`
      if (sort) url += `&sort_by=${sort}`

      const response = await fetch(url)
      const data = await response.json()
      if (data.success) {
        setPosts(data.data)
      }
    } catch (error) {
      console.error("Error loading posts:", error)
    } finally {
      setLoading(false)
    }
  }

  const loadReplies = async (postId: string) => {
    try {
      const response = await fetch(`/api/forum?type=replies&shop_id=demo&post_id=${postId}`)
      const data = await response.json()
      if (data.success) {
        setReplies(data.data)
      }
    } catch (error) {
      console.error("Error loading replies:", error)
    }
  }

  const handleCategoryClick = (categoryId: string) => {
    setSelectedCategory(categoryId)
    setSelectedPost(null)
    loadPosts(categoryId, searchQuery, sortBy)
  }

  const handlePostClick = async (post: Post) => {
    setSelectedPost(post)
    await loadReplies(post.id)

    // Increment view count
    try {
      await fetch(`/api/forum?type=post&shop_id=demo&post_id=${post.id}`)
    } catch (error) {
      console.error("Error incrementing view count:", error)
    }
  }

  const handleSearch = () => {
    loadPosts(selectedCategory || undefined, searchQuery, sortBy)
  }

  const handleSortChange = (newSort: string) => {
    setSortBy(newSort)
    loadPosts(selectedCategory || undefined, searchQuery, newSort)
  }

  const createPost = async () => {
    if (!newPost.title || !newPost.content || !newPost.author || !newPost.categoryId) {
      alert("Please fill in all required fields")
      return
    }

    try {
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

      const data = await response.json()
      if (data.success) {
        setNewPost({ title: "", content: "", author: "", categoryId: "", tags: "" })
        setShowNewPostModal(false)
        loadPosts(selectedCategory || undefined, searchQuery, sortBy)
        loadCategories()
      }
    } catch (error) {
      console.error("Error creating post:", error)
    }
  }

  const createReply = async () => {
    if (!newReply.content || !newReply.author || !selectedPost) {
      alert("Please fill in all required fields")
      return
    }

    try {
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

      const data = await response.json()
      if (data.success) {
        setNewReply({ content: "", author: "" })
        setShowReplyModal(false)
        loadReplies(selectedPost.id)
        loadPosts(selectedCategory || undefined, searchQuery, sortBy)
      }
    } catch (error) {
      console.error("Error creating reply:", error)
    }
  }

  const likePost = async (postId: string) => {
    try {
      await fetch("/api/forum", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "like_post",
          shopId: "demo",
          postId,
        }),
      })
      loadPosts(selectedCategory || undefined, searchQuery, sortBy)
      if (selectedPost && selectedPost.id === postId) {
        setSelectedPost({ ...selectedPost, likes: selectedPost.likes + 1 })
      }
    } catch (error) {
      console.error("Error liking post:", error)
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
                  onClick={() => setSelectedPost(null)}
                  className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
                >
                  <ArrowLeft className="h-5 w-5" />
                  <span>Back to Forum</span>
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

              {selectedPost.tags.length > 0 && (
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
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Post Reply
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

  // Main Forum View
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                  <MessageSquare className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Community Forum</h1>
                  <p className="text-sm text-gray-500">Connect • Share • Grow</p>
                </div>
              </Link>
            </div>
            <button
              onClick={() => setShowNewPostModal(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="h-4 w-4" />
              <span>New Post</span>
            </button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border p-6 sticky top-24">
              <h2 className="text-lg font-semibold mb-4">Categories</h2>
              <div className="space-y-2">
                <button
                  onClick={() => {
                    setSelectedCategory(null)
                    loadPosts(undefined, searchQuery, sortBy)
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                    !selectedCategory ? "bg-blue-100 text-blue-700" : "hover:bg-gray-100"
                  }`}
                >
                  All Categories
                </button>
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => handleCategoryClick(category.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                      selectedCategory === category.id ? "bg-blue-100 text-blue-700" : "hover:bg-gray-100"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: category.color }} />
                        <span className="font-medium">{category.name}</span>
                      </div>
                      <span className="text-sm text-gray-500">{category.postCount}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Search and Filters */}
            <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search discussions..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                      className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <button
                    onClick={handleSearch}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Search
                  </button>
                </div>
                <div className="flex items-center space-x-2">
                  <Filter className="h-4 w-4 text-gray-500" />
                  <select
                    value={sortBy}
                    onChange={(e) => handleSortChange(e.target.value)}
                    className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="recent">Most Recent</option>
                    <option value="popular">Most Popular</option>
                    <option value="replies">Most Replies</option>
                    <option value="oldest">Oldest First</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Filter indicator */}
            {selectedCategory && (
              <div className="flex items-center gap-2 mb-4">
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                  Filtered by: {getCategoryById(selectedCategory)?.name}
                </span>
                <button
                  onClick={() => {
                    setSelectedCategory(null)
                    loadPosts(undefined, searchQuery, sortBy)
                  }}
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  Clear filter
                </button>
              </div>
            )}

            {/* Posts */}
            {loading ? (
              <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-500">Loading posts...</p>
              </div>
            ) : posts.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
                <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">No posts found. Be the first to start a discussion!</p>
                <button
                  onClick={() => setShowNewPostModal(true)}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Create First Post
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {posts.map((post) => (
                  <div
                    key={post.id}
                    className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => handlePostClick(post)}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          {post.isPinned && <Pin className="h-4 w-4 text-blue-500" />}
                          {post.isLocked && <Lock className="h-4 w-4 text-red-500" />}
                          <span
                            className="px-2 py-1 rounded-full text-xs font-medium text-white"
                            style={{ backgroundColor: getCategoryById(post.categoryId)?.color }}
                          >
                            {getCategoryById(post.categoryId)?.name}
                          </span>
                          {post.isPinned && <span className="text-xs text-blue-600 font-medium">PINNED</span>}
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2 hover:text-blue-600">{post.title}</h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                          <span className="font-medium">{post.author}</span>
                          <span>•</span>
                          <span>{formatDate(post.createdAt)}</span>
                        </div>
                      </div>
                    </div>

                    <p className="text-gray-700 mb-4 line-clamp-2">{post.content}</p>

                    {post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-4">
                        {post.tags.slice(0, 3).map((tag, index) => (
                          <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                            #{tag}
                          </span>
                        ))}
                        {post.tags.length > 3 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-500 rounded text-xs">
                            +{post.tags.length - 3} more
                          </span>
                        )}
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-4 border-t">
                      <div className="flex items-center space-x-6 text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          <Heart className="h-4 w-4" />
                          <span>{post.likes}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <MessageSquare className="h-4 w-4" />
                          <span>{post.replies}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Eye className="h-4 w-4" />
                          <span>{post.views}</span>
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          likePost(post.id)
                        }}
                        className="flex items-center space-x-1 px-3 py-1 text-sm border rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <Heart className="h-4 w-4" />
                        <span>Like</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* New Post Modal */}
      {showNewPostModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Create New Post</h2>
              <button onClick={() => setShowNewPostModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-6 w-6" />
              </button>
            </div>

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
                  <option value="">Select a category...</option>
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
                  placeholder="Write your post content..."
                  rows={6}
                  value={newPost.content}
                  onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Tags (optional)</label>
                <input
                  type="text"
                  placeholder="Enter tags separated by commas..."
                  value={newPost.tags}
                  onChange={(e) => setNewPost({ ...newPost, tags: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">Example: support, troubleshooting, feature-request</p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={createPost}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Create Post
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
