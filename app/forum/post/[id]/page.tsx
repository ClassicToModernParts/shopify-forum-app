"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Eye, ThumbsUp, MessageSquare, Calendar, User, Tag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import UserNavigation from "@/components/UserNavigation"

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
  tags?: string[]
  status?: string
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

interface Category {
  id: string
  name: string
  color: string
}

export default function PostDetailPage() {
  const params = useParams()
  const router = useRouter()
  const postId = params.id as string

  const [post, setPost] = useState<Post | null>(null)
  const [replies, setReplies] = useState<Reply[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [userInfo, setUserInfo] = useState({ email: "", name: "" })
  const [replyContent, setReplyContent] = useState("")
  const [submittingReply, setSubmittingReply] = useState(false)

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

  // Fetch post data
  useEffect(() => {
    const fetchPostData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Fetch post
        const postResponse = await fetch(`/api/forum?type=post&post_id=${postId}`)
        if (!postResponse.ok) {
          throw new Error(`Failed to fetch post: ${postResponse.status}`)
        }

        const postData = await postResponse.json()
        if (!postData.success) {
          throw new Error(postData.error || "Failed to fetch post")
        }

        setPost(postData.data)

        // Fetch replies
        const repliesResponse = await fetch(`/api/forum?type=replies&post_id=${postId}`)
        if (repliesResponse.ok) {
          const repliesData = await repliesResponse.json()
          if (repliesData.success) {
            setReplies(repliesData.data || [])
          }
        }

        // Fetch categories
        const categoriesResponse = await fetch("/api/forum?type=categories")
        if (categoriesResponse.ok) {
          const categoriesData = await categoriesResponse.json()
          if (categoriesData.success) {
            setCategories(categoriesData.data || [])
          }
        }
      } catch (e) {
        console.error("❌ Error fetching post data:", e)
        setError(e instanceof Error ? e.message : "Failed to load post")
      } finally {
        setLoading(false)
      }
    }

    if (postId) {
      fetchPostData()
    }
  }, [postId])

  const handleLikePost = async () => {
    try {
      const response = await fetch("/api/forum", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "like_post",
          postId: postId,
          userEmail: userInfo.email,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success && post) {
          setPost({ ...post, likes: data.data.likes })
        }
      }
    } catch (error) {
      console.error("Error liking post:", error)
    }
  }

  const handleSubmitReply = async () => {
    if (!replyContent.trim()) return

    if (!userInfo.email) {
      alert("Please log in to reply")
      router.push("/login")
      return
    }

    try {
      setSubmittingReply(true)

      const response = await fetch("/api/forum", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "create_reply",
          postId: postId,
          content: replyContent,
          author: userInfo.name,
          authorEmail: userInfo.email,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setReplies([...replies, data.data])
          setReplyContent("")
          if (post) {
            setPost({ ...post, replies: post.replies + 1 })
          }
        }
      }
    } catch (error) {
      console.error("Error submitting reply:", error)
    } finally {
      setSubmittingReply(false)
    }
  }

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
            <span>Loading post...</span>
          </div>
        </div>
      </div>
    )
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-gray-50">
        <UserNavigation currentPage="forum" />
        <div className="container mx-auto py-8 px-4">
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error || "Post not found"}</AlertDescription>
          </Alert>
          <Button onClick={() => router.push("/forum")} variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Forum
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <UserNavigation currentPage="forum" />
      <div className="container mx-auto py-8 px-4">
        {/* Back Button */}
        <Button onClick={() => router.push("/forum")} variant="outline" className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Forum
        </Button>

        {/* Post Content */}
        <Card className="mb-6">
          <CardHeader>
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
            </div>
            <h1 className="text-3xl font-bold text-gray-900">{post.title}</h1>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <div className="flex items-center">
                <User className="h-4 w-4 mr-1" />
                {post.author}
              </div>
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                {new Date(post.createdAt).toLocaleDateString()}
              </div>
              <div className="flex items-center">
                <Eye className="h-4 w-4 mr-1" />
                {post.views} views
              </div>
              <div className="flex items-center">
                <MessageSquare className="h-4 w-4 mr-1" />
                {post.replies} replies
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="prose max-w-none mb-6">
              <p className="text-gray-700 whitespace-pre-wrap">{post.content}</p>
            </div>

            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {post.tags.map((tag, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    <Tag className="h-3 w-3 mr-1" />
                    {tag}
                  </Badge>
                ))}
              </div>
            )}

            <div className="flex items-center gap-4">
              <Button onClick={handleLikePost} variant="outline" size="sm">
                <ThumbsUp className="h-4 w-4 mr-2" />
                Like ({post.likes})
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Replies Section */}
        <Card className="mb-6">
          <CardHeader>
            <h2 className="text-xl font-semibold">Replies ({replies.length})</h2>
          </CardHeader>
          <CardContent>
            {replies.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No replies yet. Be the first to reply!</p>
            ) : (
              <div className="space-y-4">
                {replies.map((reply) => (
                  <div key={reply.id} className="border-l-4 border-blue-200 pl-4 py-2">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-medium text-gray-900">{reply.author}</span>
                      <span className="text-sm text-gray-500">{new Date(reply.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-gray-700 mb-2 whitespace-pre-wrap">{reply.content}</p>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm">
                        <ThumbsUp className="h-3 w-3 mr-1" />
                        {reply.likes}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Reply Form */}
        {userInfo.email ? (
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">Add a Reply</h3>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Textarea
                  placeholder="Write your reply..."
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  rows={4}
                />
                <Button onClick={handleSubmitReply} disabled={submittingReply || !replyContent.trim()}>
                  {submittingReply ? "Submitting..." : "Submit Reply"}
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-gray-600 mb-4">Please log in to reply to this post.</p>
              <Button onClick={() => router.push("/login")}>Log In</Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
