"use client"

import { useState, useEffect } from "react"
import Link from "next/link"

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

export default function ForumPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      // Load categories
      const categoriesResponse = await fetch("/api/forum?type=categories&shop_id=demo")
      const categoriesData = await categoriesResponse.json()
      
      // Load posts
      const postsResponse = await fetch("/api/forum?type=posts&shop_id=demo")
      const postsData = await postsResponse.json()
      
      if (categoriesData.success) setCategories(categoriesData.data)
      if (postsData.success) setPosts(postsData.data)
    } catch (error) {
      console.error("Error loading data:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Community Forum</h1>
          <p>Loading forum data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Community Forum</h1>
        <Link href="/" className="px-4 py-2 text-blue-600 hover:text-blue-800">
          ← Back to Home
        </Link>
      </div>

      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <h2 className="font-semibold text-green-800">🎉 Forum is Working!</h2>
        <p className="text-green-700">API loaded {categories.length} categories and {posts.length} posts</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <h2 className="text-xl font-semibold mb-4">Categories ({categories.length})</h2>
          <div className="space-y-3">
            {categories.map((category) => (
              <div key={category.id} className="p-4 border rounded-lg bg-white hover:shadow-md transition-shadow">
                <h3 className="font-medium text-lg">{category.name}</h3>
                <p className="text-sm text-gray-600 mt-1">{category.description}</p>
                <div className="flex items-center justify-between mt-3 text-sm text-gray-500">
                  <span>{category.postCount} posts</span>
                  <span className="px-2 py-1 rounded text-xs" style={{backgroundColor: category.color + '20', color: category.color}}>
                    {category.icon}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">Recent Posts ({posts.length})</h2>
          <div className="space-y-3">
            {posts.map((post) => (
              <div key={post.id} className="p-4 border rounded-lg bg-white hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-medium text-lg">{post.title}</h3>
                  {post.isPinned && <span className="text-blue-500">📌</span>}
                </div>
                <p className="text-sm text-gray-600 mb-3">{post.content.substring(0, 150)}...</p>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>by {post.author}</span>
                  <div className="flex gap-3">
                    <span>💬 {post.replies}</span>
                    <span>👁️ {post.views}</span>
                    <span>❤️ {post.likes}</span>
                  </div>
                </div>
                {post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {post.tags.map((tag, index) => (
                      <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-800 mb-2">🚀 Forum Features</h3>
        <div className="grid md:grid-cols-2 gap-4 text-blue-700">
          <ul className="space-y-1">
            <li>• Browse categories and discussions</li>
            <li>• View posts with likes and replies</li>
            <li>• Search and filter content</li>
          </ul>
          <ul className="space-y-1">
            <li>• Create new posts and replies</li>
            <li>• Tag posts for organization</li>
            <li>• Real-time API integration</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
