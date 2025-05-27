"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import {
  MessageSquare,
  Eye,
  Heart,
  Pin,
  Search,
  Plus,
  TrendingUp,
  Clock,
  ThumbsUp,
  Reply,
  Crown,
  HelpCircle,
  Lightbulb,
} from "lucide-react"

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

const iconMap: { [key: string]: any } = {
  MessageSquare,
  HelpCircle,
  Lightbulb,
  Crown,
}

export default function ForumPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [posts, setPosts] = useState<Post[]>([])
  const [trendingPosts, setTrendingPosts] = useState<Post[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState("recent")
  const [loading, setLoading] = useState(false)
  const [showNewPostForm, setShowNewPostForm] = useState(false)
  const [newPost, setNewPost] = useState({
    title: "",
    content: "",
    author: "",
    categoryId: "",
    tags: "",
  })

  useEffect(() => {
    loadCategories()
    loadPosts()
    loadTrendingPosts()
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

  const loadTrendingPosts = async () => {
    try {
      const response = await fetch("/api/forum?type=trending&shop_id=demo")
      const data = await response.json()
      if (data.success) {
        setTrendingPosts(data.data)
      }
    } catch (error) {
      console.error("Error loading trending posts:", error)
    }
  }

  const handleCategoryClick = (categoryId: string) => {
    setSelectedCategory(categoryId)
    loadPosts(categoryId, searchQuery, sortBy)
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
        setShowNewPostForm(false)
        loadPosts(selectedCategory || undefined, searchQuery, sortBy)
        loadCategories() // Refresh to update post counts
      }
    } catch (error) {
      console.error("Error creating post:", error)
    }
  }

  const likePost = async (postId: string) => {
    try {
      const response = await fetch("/api/forum", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "like_post",
          shopId: "demo",
          postId,
        }),
      })

      if (response.ok) {
        loadPosts(selectedCategory || undefined, searchQuery, sortBy)
      }
    } catch (error) {
      console.error("Error liking post:", error)
    }
  }

  const getCategoryIcon = (iconName: string) => {
    const IconComponent = iconMap[iconName] || MessageSquare
    return <IconComponent className="h-5 w-5" />
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Community Forum</h1>
          <p className="text-muted-foreground">Connect with other customers and get support</p>
        </div>
        <Button onClick={() => setShowNewPostForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Post
        </Button>
      </div>

      <Tabs defaultValue="categories" className="space-y-4">
        <TabsList>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="recent">Recent Posts</TabsTrigger>
          <TabsTrigger value="trending">Trending</TabsTrigger>
        </TabsList>

        <TabsContent value="categories" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => {
              const IconComponent = iconMap[category.icon] || MessageSquare
              return (
                <Card
                  key={category.id}
                  className="cursor-pointer hover:shadow-lg transition-all duration-200 border-l-4"
                  style={{ borderLeftColor: category.color }}
                  onClick={() => handleCategoryClick(category.id)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg" style={{ backgroundColor: `${category.color}20` }}>
                        <IconComponent className="h-5 w-5" style={{ color: category.color }} />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-lg flex items-center gap-2">
                          {category.name}
                          {category.isPrivate && <Crown className="h-4 w-4 text-yellow-500" />}
                        </CardTitle>
                        <CardDescription className="text-sm">{category.description}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <MessageSquare className="h-4 w-4" />
                        {category.postCount} posts
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {formatDate(category.lastActivity)}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        <TabsContent value="recent" className="space-y-4">
          <div className="flex gap-4 items-center">
            <div className="flex-1 flex gap-2">
              <Input
                placeholder="Search posts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
              />
              <Button onClick={handleSearch} variant="outline">
                <Search className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex gap-2">
              <Button
                variant={sortBy === "recent" ? "default" : "outline"}
                size="sm"
                onClick={() => handleSortChange("recent")}
              >
                Recent
              </Button>
              <Button
                variant={sortBy === "popular" ? "default" : "outline"}
                size="sm"
                onClick={() => handleSortChange("popular")}
              >
                Popular
              </Button>
              <Button
                variant={sortBy === "replies" ? "default" : "outline"}
                size="sm"
                onClick={() => handleSortChange("replies")}
              >
                Most Replies
              </Button>
            </div>
          </div>

          {selectedCategory && (
            <div className="flex items-center gap-2">
              <Badge variant="outline">Filtered by: {categories.find((c) => c.id === selectedCategory)?.name}</Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedCategory(null)
                  loadPosts(undefined, searchQuery, sortBy)
                }}
              >
                Clear filter
              </Button>
            </div>
          )}

          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-8">Loading posts...</div>
            ) : posts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No posts found. Be the first to start a discussion!
              </div>
            ) : (
              posts.map((post) => (
                <Card key={post.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {post.isPinned && <Pin className="h-4 w-4 text-blue-500" />}
                          <CardTitle className="text-lg">{post.title}</CardTitle>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={`/placeholder.svg?height=24&width=24&query=${post.author}`} />
                              <AvatarFallback>{post.author.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <span>{post.author}</span>
                          </div>
                          <span>{formatDate(post.createdAt)}</span>
                          <Badge variant="outline" className="text-xs">
                            {categories.find((c) => c.id === post.categoryId)?.name}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm line-clamp-3">{post.content}</p>

                    {post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {post.tags.map((tag, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            #{tag}
                          </Badge>
                        ))}
                      </div>
                    )}

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <MessageSquare className="h-4 w-4" />
                          {post.replies}
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye className="h-4 w-4" />
                          {post.views}
                        </span>
                        <span className="flex items-center gap-1">
                          <Heart className="h-4 w-4" />
                          {post.likes}
                        </span>
                      </div>

                      <div className="flex gap-2">
                        <Button size="sm" variant="ghost" onClick={() => likePost(post.id)}>
                          <ThumbsUp className="h-4 w-4 mr-1" />
                          Like
                        </Button>
                        <Button size="sm" variant="ghost">
                          <Reply className="h-4 w-4 mr-1" />
                          Reply
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="trending" className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-5 w-5 text-orange-500" />
            <h2 className="text-xl font-semibold">Trending Discussions</h2>
          </div>

          <div className="space-y-4">
            {trendingPosts.map((post, index) => (
              <Card key={post.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-gradient-to-r from-orange-400 to-red-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        {index + 1}
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium mb-1">{post.title}</h3>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Heart className="h-3 w-3" />
                          {post.likes}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageSquare className="h-3 w-3" />
                          {post.replies}
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          {post.views}
                        </span>
                        <span>by {post.author}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* New Post Modal */}
      {showNewPostForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>Create New Post</CardTitle>
              <CardDescription>Share your thoughts with the community</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Title *</label>
                <Input
                  placeholder="Enter post title..."
                  value={newPost.title}
                  onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Category *</label>
                <select
                  className="w-full p-2 border rounded-md"
                  value={newPost.categoryId}
                  onChange={(e) => setNewPost({ ...newPost, categoryId: e.target.value })}
                >
                  <option value="">Select a category...</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Your Name *</label>
                <Input
                  placeholder="Enter your name..."
                  value={newPost.author}
                  onChange={(e) => setNewPost({ ...newPost, author: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Content *</label>
                <Textarea
                  placeholder="Write your post content..."
                  rows={6}
                  value={newPost.content}
                  onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Tags (optional)</label>
                <Input
                  placeholder="Enter tags separated by commas..."
                  value={newPost.tags}
                  onChange={(e) => setNewPost({ ...newPost, tags: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">Example: support, troubleshooting, feature-request</p>
              </div>

              <div className="flex gap-2 pt-4">
                <Button onClick={createPost} className="flex-1">
                  Create Post
                </Button>
                <Button variant="outline" onClick={() => setShowNewPostForm(false)} className="flex-1">
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
