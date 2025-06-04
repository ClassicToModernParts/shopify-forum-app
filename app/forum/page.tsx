"use client"

import { useState, useEffect } from "react"
import { Filter, Plus, RefreshCw, MessageSquare, Eye, ThumbsUp, Calendar } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import UserNavigation from "@/components/UserNavigation"
import { useRouter } from "next/navigation"

interface Category {
  id: string
  name: string
  description: string
  color?: string
  postCount?: number
  lastActivity?: string
}

interface Post {
  id: string
  title: string
  content: string
  author: string
  authorEmail?: string
  categoryId: string
  createdAt: string
  updatedAt: string
  replies: number
  views: number
  likes: number
  isPinned?: boolean
  tags?: string[]
  status?: string
}

export default function ForumPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("")
  const [userInfo, setUserInfo] = useState({ email: "", name: "" })

  const router = useRouter()

  // Get user info from localStorage
  useEffect(() => {
    const userEmail = localStorage.getItem("userEmail")
    const userName = localStorage.getItem("userName")

    if (userEmail) {
      setUserInfo({
        email: userEmail,
        name: userName || "User",
      })
    }
  }, [])

  // Fetch categories and posts
  useEffect(() => {
    const fetchForumData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Fetch categories
        const categoriesResponse = await fetch("/api/forum?type=categories")
        if (!categoriesResponse.ok) {
          throw new Error("Failed to fetch categories")
        }
        const categoriesData = await categoriesResponse.json()
        setCategories(categoriesData.success ? categoriesData.data : [])

        // Fetch posts
        const postsResponse = await fetch("/api/forum?type=posts")
        if (!postsResponse.ok) {
          throw new Error("Failed to fetch posts")
        }
        const postsData = await postsResponse.json()
        setPosts(postsData.success ? postsData.data : [])
      } catch (e) {
        console.error("❌ Error fetching forum data:", e)
        setError(e instanceof Error ? e.message : "Failed to load forum data")
      } finally {
        setLoading(false)
      }
    }

    fetchForumData()
  }, [])

  const handleCreatePost = () => {
    if (!userInfo.email) {
      alert("Please log in to create a post")
      router.push("/login")
      return
    }
    router.push("/forum/create")
  }

  const filteredPosts = posts.filter((post) => {
    const matchesSearch =
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.content.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = !selectedCategory || post.categoryId === selectedCategory
    return matchesSearch && matchesCategory
  })

  const getCategoryName = (categoryId: string) => {
    const category = categories.find((c) => c.id === categoryId)
    return category?.name || "Unknown Category"
  }

  const getCategoryColor = (categoryId: string) => {
    const category = categories.find((c) => c.id === categoryId)
    return category?.color || "#6B7280"
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <UserNavigation currentPage="forum" />
        <div className="container mx-auto py-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3"></div>
            <span>Loading forum...</span>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <UserNavigation currentPage="forum" />
        <div className="container mx-auto py-8">
          <div className="text-center">
            <div className="text-red-600 mb-4">Error: {error}</div>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <UserNavigation currentPage="forum" />
      <div className="container mx-auto py-8 px-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Community Forum</h1>
            <p className="text-gray-600 mt-2">Share knowledge, ask questions, and connect with the community</p>
            {userInfo.email && (
              <p className="text-sm text-blue-600 mt-1">
                Logged in as: {userInfo.name} ({userInfo.email})
              </p>
            )}
          </div>
          <Button onClick={handleCreatePost} className="flex items-center">
            <Plus className="mr-2 h-4 w-4" />
            Create Post
          </Button>
        </div>

        {/* Categories */}
        {categories.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Categories</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {categories.map((category) => (
                <Card
                  key={category.id}
                  className="hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => setSelectedCategory(selectedCategory === category.id ? "" : category.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center mb-2">
                      <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: category.color }}></div>
                      <h3 className="font-medium">{category.name}</h3>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{category.description}</p>
                    <div className="text-xs text-gray-500">{category.postCount || 0} posts</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <Input
              placeholder="Search posts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
            <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Selected Category Filter */}
        {selectedCategory && (
          <div className="mb-4">
            <Badge variant="secondary" className="mr-2">
              Filtered by: {getCategoryName(selectedCategory)}
              <button onClick={() => setSelectedCategory("")} className="ml-2 text-gray-500 hover:text-gray-700">
                ×
              </button>
            </Badge>
          </div>
        )}

        {/* Posts */}
        <div className="space-y-4">
          {filteredPosts.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm || selectedCategory ? "No posts found" : "No posts yet"}
              </h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || selectedCategory
                  ? "Try adjusting your search or filter criteria"
                  : "Be the first to start a discussion!"}
              </p>
              {!searchTerm && !selectedCategory && <Button onClick={handleCreatePost}>Create First Post</Button>}
            </div>
          ) : (
            filteredPosts.map((post) => (
              <Card key={post.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge
                          variant="secondary"
                          style={{
                            backgroundColor: getCategoryColor(post.categoryId) + "20",
                            color: getCategoryColor(post.categoryId),
                          }}
                        >
                          {getCategoryName(post.categoryId)}
                        </Badge>
                        {post.isPinned && <Badge variant="outline">Pinned</Badge>}
                      </div>

                      <Link href={`/forum/post/${post.id}`}>
                        <h3 className="text-lg font-semibold text-gray-900 hover:text-blue-600 cursor-pointer mb-2">
                          {post.title}
                        </h3>
                      </Link>

                      <p className="text-gray-600 mb-3 line-clamp-2">{post.content.substring(0, 200)}...</p>

                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center gap-4">
                          <span>By {post.author}</span>
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            {new Date(post.createdAt).toLocaleDateString()}
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="flex items-center">
                            <MessageSquare className="h-4 w-4 mr-1" />
                            {post.replies}
                          </div>
                          <div className="flex items-center">
                            <Eye className="h-4 w-4 mr-1" />
                            {post.views}
                          </div>
                          <div className="flex items-center">
                            <ThumbsUp className="h-4 w-4 mr-1" />
                            {post.likes}
                          </div>
                        </div>
                      </div>

                      {post.tags && post.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-3">
                          {post.tags.map((tag, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
