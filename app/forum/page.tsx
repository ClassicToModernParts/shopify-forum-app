"use client"

import { useState, useEffect } from "react"

interface Category {
  id: string
  name: string
  description: string
  postCount: number
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
}

export default function ForumPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [posts, setPosts] = useState<Post[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

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

  const loadPosts = async (categoryId?: string) => {
    setLoading(true)
    try {
      let url = `/api/forum?type=posts&shop_id=demo`
      if (categoryId) url += `&category_id=${categoryId}`

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

  const handleCategoryClick = (categoryId: string) => {
    setSelectedCategory(categoryId)
    loadPosts(categoryId)
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
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Community Forum</h1>
        <p className="text-gray-600">Connect with other customers and get support</p>
      </div>

      {/* Categories */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Categories</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <div
              key={category.id}
              className="p-4 border rounded-lg cursor-pointer hover:shadow-lg transition-shadow bg-white"
              onClick={() => handleCategoryClick(category.id)}
            >
              <h3 className="font-medium text-lg">{category.name}</h3>
              <p className="text-gray-600 text-sm mt-1">{category.description}</p>
              <div className="mt-3 text-sm text-gray-500">
                {category.postCount} posts
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Posts */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            {selectedCategory ? `Posts in Category` : "Recent Posts"}
          </h2>
          {selectedCategory && (
            <button
              onClick={() => {
                setSelectedCategory(null)
                loadPosts()
              }}
              className="px-4 py-2 text-sm bg-gray-100 rounded hover:bg-gray-200"
            >
              Show All Posts
            </button>
          )}
        </div>

        {loading ? (
          <div className="text-center py-8">Loading posts...</div>
        ) : posts.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No posts found. Be the first to start a discussion!
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <div key={post.id} className="p-4 border rounded-lg bg-white hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-medium text-lg">{post.title}</h3>
                    <p className="text-gray-600 text-sm mt-1 line-clamp-2">{post.content}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-500 mt-3">
                      <span>by {post.author}</span>
                      <span>{formatDate(post.createdAt)}</span>
                      <span>{post.replies} replies</span>
                      <span>{post.views} views</span>
                      <span>{post.likes} likes</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
