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
  const [userInfo, setUserInfo] = useState({ email: "", name: "" })

  const router = useRouter()

  // Get user info and check authentication
  useEffect(() => {
    const userEmail = localStorage.getItem("userEmail")
    const userName = localStorage.getItem("userName")

    if (!userEmail) {
      alert("Please log in to create a post")
      router.push("/login")
      return
    }

    setUserInfo({
      email: userEmail,
      name: userName || "User",
    })
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

    fetchCategories()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!userInfo.email) {
      alert("Please log in to create a post")
      router.push("/login")
      return
    }

    if (!formData.title.trim() || !formData.content.trim() || !formData.categoryId) {
      setError("Please fill in all required fields")
      return
    }

    setLoading(true)
    setError("")

    try {
      const response = await fetch("/api/forum", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "create_post",
          title: formData.title.trim(),
          content: formData.content.trim(),
          categoryId: formData.categoryId,
          author: userInfo.name,
          authorEmail: userInfo.email,
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

  return (
    <div className="min-h-screen bg-gray-50">
      <UserNavigation currentPage="forum" />
      <div className="container mx-auto py-8 px-4 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Create New Post</CardTitle>
            {userInfo.email && (
              <p className="text-sm text-gray-600">
                Posting as: {userInfo.name} ({userInfo.email})
              </p>
            )}
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
