"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Loader2, MessageSquare, Users, Eye } from "lucide-react"

interface Category {
  id: string
  name: string
  description: string
  postCount: number
  lastActivity: string
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
}

export default function TestForumPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const testAPI = async (endpoint: string, description: string) => {
    setLoading(true)
    try {
      const response = await fetch(endpoint)
      const data = await response.json()
      console.log(`${description}:`, data)

      if (endpoint.includes("type=categories")) {
        setCategories(data.data || [])
      } else if (endpoint.includes("type=posts")) {
        setPosts(data.data || [])
      }
    } catch (error) {
      console.error(`Error testing ${description}:`, error)
    } finally {
      setLoading(false)
    }
  }

  const loadCategories = () => {
    testAPI("/api/forum?type=categories&shop_id=123", "Categories")
  }

  const loadPosts = (categoryId?: string) => {
    const url = categoryId
      ? `/api/forum?type=posts&shop_id=123&category_id=${categoryId}`
      : "/api/forum?type=posts&shop_id=123"
    testAPI(url, "Posts")
    setSelectedCategory(categoryId || null)
  }

  const createTestPost = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/forum", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "create_post",
          shopId: "123",
          title: "Test Post from UI",
          content: "This is a test post created from the test interface.",
          author: "TestUser",
          categoryId: "1",
        }),
      })
      const data = await response.json()
      console.log("Create post result:", data)

      if (data.success) {
        // Reload posts to show the new one
        loadPosts(selectedCategory || undefined)
      }
    } catch (error) {
      console.error("Error creating post:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCategories()
    loadPosts()
  }, [])

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Forum API Test Interface</h1>
        <p className="text-muted-foreground">Test your forum API endpoints and see the results</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Button onClick={loadCategories} disabled={loading} className="h-auto p-4 flex flex-col items-center gap-2">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Users className="h-4 w-4" />}
          Load Categories
        </Button>

        <Button
          onClick={() => loadPosts()}
          disabled={loading}
          variant="outline"
          className="h-auto p-4 flex flex-col items-center gap-2"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <MessageSquare className="h-4 w-4" />}
          Load All Posts
        </Button>

        <Button
          onClick={createTestPost}
          disabled={loading}
          variant="secondary"
          className="h-auto p-4 flex flex-col items-center gap-2"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <MessageSquare className="h-4 w-4" />}
          Create Test Post
        </Button>

        <Button
          onClick={() => testAPI("/api/forum?type=replies&shop_id=123&post_id=1", "Replies")}
          disabled={loading}
          variant="outline"
          className="h-auto p-4 flex flex-col items-center gap-2"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Eye className="h-4 w-4" />}
          Load Replies
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Categories</CardTitle>
            <CardDescription>Forum categories loaded from the API</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {categories.length === 0 ? (
              <p className="text-muted-foreground text-sm">No categories loaded yet</p>
            ) : (
              categories.map((category) => (
                <div
                  key={category.id}
                  className="p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => loadPosts(category.id)}
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">{category.name}</h3>
                    <Badge variant="secondary">{category.postCount} posts</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{category.description}</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Last activity: {new Date(category.lastActivity).toLocaleDateString()}
                  </p>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Posts</CardTitle>
            <CardDescription>
              {selectedCategory ? `Posts in category ${selectedCategory}` : "All forum posts"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {posts.length === 0 ? (
              <p className="text-muted-foreground text-sm">No posts loaded yet</p>
            ) : (
              posts.map((post) => (
                <div key={post.id} className="p-3 border rounded-lg">
                  <div className="flex items-start justify-between">
                    <h3 className="font-medium">{post.title}</h3>
                    <Badge variant="outline" className="text-xs">
                      Category {post.categoryId}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{post.content}</p>
                  <Separator className="my-2" />
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>By {post.author}</span>
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <MessageSquare className="h-3 w-3" />
                        {post.replies}
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        {post.views}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{new Date(post.createdAt).toLocaleDateString()}</p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>API Test Results</CardTitle>
          <CardDescription>Check your browser console for detailed API responses</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <p>
              <strong>Available endpoints:</strong>
            </p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>GET /api/forum?type=categories&shop_id=123</li>
              <li>GET /api/forum?type=posts&shop_id=123</li>
              <li>GET /api/forum?type=posts&shop_id=123&category_id=1</li>
              <li>GET /api/forum?type=post&shop_id=123&post_id=1</li>
              <li>GET /api/forum?type=replies&shop_id=123&post_id=1</li>
              <li>POST /api/forum (with JSON body for creating posts/replies)</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
