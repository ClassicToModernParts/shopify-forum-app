"use client"

import { useState, useEffect } from "react"
import Link from "next/link"

export default function ForumPage() {
  const [posts, setPosts] = useState([])
  const [newPostTitle, setNewPostTitle] = useState("")
  const [newPostBody, setNewPostBody] = useState("")

  // Check if system needs initialization
  useEffect(() => {
    const checkInitialization = async () => {
      try {
        const response = await fetch("/api/admin/init-system")
        const data = await response.json()

        if (!data.isInitialized) {
          console.log("ℹ️ System not initialized, consider running initialization")
        }
      } catch (error) {
        console.error("Error checking initialization:", error)
      }
    }

    checkInitialization()
  }, [])

  useEffect(() => {
    const fetchPosts = async () => {
      const response = await fetch("/api/forum")
      const data = await response.json()
      setPosts(data)
    }

    fetchPosts()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()

    const response = await fetch("/api/forum", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ title: newPostTitle, content: newPostBody }),
    })

    if (response.ok) {
      // Refresh posts after successful submission
      const newPostsResponse = await fetch("/api/forum")
      const newPostsData = await newPostsResponse.json()
      setPosts(newPostsData)

      // Clear the form
      setNewPostTitle("")
      setNewPostBody("")
    } else {
      console.error("Failed to create post")
    }
  }

  return (
    <div>
      <h1>Forum</h1>
      <form onSubmit={handleSubmit}>
        <input type="text" placeholder="Title" value={newPostTitle} onChange={(e) => setNewPostTitle(e.target.value)} />
        <textarea placeholder="Body" value={newPostBody} onChange={(e) => setNewPostBody(e.target.value)} />
        <button type="submit">Create Post</button>
      </form>
      <ul>
        {posts.map((post) => (
          <li key={post.id}>
            <Link href={`/forum/${post.id}`}>{post.title}</Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
