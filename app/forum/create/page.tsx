"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import UserNavigation from "@/components/UserNavigation"

interface Category {
  id: string
  name: string
  description: string
}

interface User {
  id: string
  username: string
  name?: string
  email: string
  role: "admin" | "user" | "moderator"
}

export default function CreatePost() {
  const [categories, setCategories] = useState<Category[]>([])
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    categoryId: "",
    tags: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [user, setUser] = useState<User | null>(null)
  const [authLoading, setAuthLoading] = useState(true)

  const router = useRouter()

  // Check authentication
  useEffect(() => {
    const checkAuth = async () => {
      try {
        setAuthLoading(true)

        // Check localStorage first
        const storedUser = localStorage.getItem("user")
        const storedToken = localStorage.getItem("authToken")

        if (storedUser && storedToken) {
          const parsedUser = JSON.parse(storedUser)
          setUser(parsedUser)
        }

        // Verify with server
        const response = await fetch("/api/auth/user-info", {
          credentials: "include",
          headers: {
            Authorization: storedToken ? `Bearer ${storedToken}` : "",
          },
        })

        if (response.ok) {
          const data = await response.json()
          if (data.success && data.user) {
            setUser(data.user)
            localStorage.setItem("user", JSON.stringify(data.user))
            if (data.token) {
              localStorage.setItem("authToken", data.token)
            }
          } else {
            // Not authenticated
            localStorage.removeItem("user")
            localStorage.removeItem("authToken")
            setUser(null)
            router.push("/login?redirect=/forum/create")
          }
        } else {
          // Server error or not authenticated
          localStorage.removeItem("user")
          localStorage.removeItem("authToken")
          setUser(null)
          router.push("/login?redirect=/forum/create")
        }
      } catch (error) {
        console.error("Auth check error:", error)
        router.push("/login?redirect=/forum/create")
      } finally {
        setAuthLoading(false)
      }
    }

    checkAuth()
  }, [router])

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("/api/forum?type=categories")
        if (response.ok) {
          const data = await response.json()
          setCategories(data.success ? data.data : [])
        }
      } catch (error) {
        console.error("Error fetching categories:", error)
      }
    }

    if (user) {
      fetchCategories()
    }
  }, [user])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) {
      router.push("/login?redirect=/forum/create")
      return
    }

    if (!formData.title.trim() || !formData.content.trim() || !formData.categoryId) {
      setError("Please fill in all required fields")
      return
    }

    setLoading(true)
    setError("")

    try {
      const authToken = localStorage.getItem("authToken")
      const response = await fetch("/api/forum", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: authToken ? `Bearer ${authToken}` : "",
        },
        credentials: "include",
        body: JSON.stringify({
          type: "create_post",
          title: formData.title.trim(),
          content: formData.content.trim(),
          categoryId: formData.categoryId,
          author: user.name || user.username,
          authorEmail: user.email,
          authorId: user.id,
          tags: formData.tags
            .split(",")
            .map((tag) => tag.trim())
            .filter(Boolean),
        }),
      })

      const data = await response.json()

      if (data.success) {
        console.log("✅ Post created successfully")
        router.push("/forum")
      } else {
        setError(data.error || "Failed to create post")
      }
    } catch (error) {
      console.error("❌ Error creating post:", error)
      setError("An error occurred while creating the post")
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <UserNavigation currentPage="forum" />
        <div className="container mx-auto py-8 px-4 max-w-2xl">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Checking authentication...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <UserNavigation currentPage="forum" />
        <div className="container mx-auto py-8 px-4 max-w-2xl">
          <div className="text-center py-12">
            <p className="text-gray-600">Redirecting to login...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <UserNavigation currentPage="forum" />
      <div className="container mx-auto py-8 px-4 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Create New Post</CardTitle>
            <p className="text-sm text-gray-600">
              Posting as: {user.name || user.username} ({user.email})
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">{error}</div>
              )}

              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleChange("title", e.target.value)}
                  placeholder="Enter post title"
                  required
                />
              </div>

              <div>
                <Label htmlFor="category">Category *</Label>
                <Select value={formData.categoryId} onValueChange={(value) => handleChange("categoryId", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="content">Content *</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => handleChange("content", e.target.value)}
                  placeholder="Write your post content here..."
                  rows={8}
                  required
                />
              </div>

              <div>
                <Label htmlFor="tags">Tags (optional)</Label>
                <Input
                  id="tags"
                  value={formData.tags}
                  onChange={(e) => handleChange("tags", e.target.value)}
                  placeholder="Enter tags separated by commas (e.g., help, installation, troubleshooting)"
                />
                <p className="text-sm text-gray-500 mt-1">Separate multiple tags with commas</p>
              </div>

              <div className="flex gap-4">
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? "Creating..." : "Create Post"}
                </Button>
                <Button type="button" variant="outline" onClick={() => router.push("/forum")} disabled={loading}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
