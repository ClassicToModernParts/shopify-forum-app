import { type NextRequest, NextResponse } from "next/server"
import { forumDataStore } from "./data-store"

// Enhanced types for our forum data
interface Category {
  id: string
  name: string
  description: string
  postCount: number
  lastActivity: string
  color: string
  icon: string
  isPrivate: boolean
  moderators: string[]
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
  attachments: string[]
  status: "active" | "hidden" | "deleted"
}

interface Reply {
  id: string
  postId: string
  content: string
  author: string
  authorEmail: string
  createdAt: string
  updatedAt: string
  likes: number
  parentReplyId?: string
  attachments: string[]
  status: "active" | "hidden" | "deleted"
}

interface User {
  id: string
  email: string
  name: string
  avatar: string
  role: "customer" | "moderator" | "admin"
  joinDate: string
  postCount: number
  reputation: number
  badges: string[]
  isOnline: boolean
  lastSeen: string
}

// Get real data from the data store
function getRealCategories(): Category[] {
  const categories = forumDataStore.getCategories()
  const posts = forumDataStore.getPosts()

  return categories.map((category) => {
    const categoryPosts = posts.filter((post) => post.categoryId === category.id)
    const lastPost = categoryPosts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0]

    return {
      id: category.id,
      name: category.name,
      description: category.description,
      postCount: categoryPosts.length,
      lastActivity: lastPost?.createdAt || category.createdAt,
      color: "#3B82F6", // Default color, can be customized later
      icon: "MessageSquare",
      isPrivate: false,
      moderators: ["admin@store.com"],
    }
  })
}

function getRealPosts(): Post[] {
  return forumDataStore.getPosts().map((post) => ({
    ...post,
    replies: 0, // TODO: Implement replies counting
    views: 0, // TODO: Implement view tracking
    likes: 0, // TODO: Implement likes tracking
    isPinned: false,
    isLocked: false,
    tags: [],
    attachments: [],
    status: "active" as const,
  }))
}

// Mock data for replies and users (these will be implemented later)
const mockReplies: Reply[] = []
const mockUsers: User[] = []

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type")
    const shopId = searchParams.get("shop_id")
    const categoryId = searchParams.get("category_id")
    const postId = searchParams.get("post_id")
    const userId = searchParams.get("user_id")
    const search = searchParams.get("search")
    const sortBy = searchParams.get("sort_by") || "recent"
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")

    if (!shopId) {
      return NextResponse.json(
        {
          success: false,
          error: "Shop ID is required",
          data: [],
        },
        { status: 400 },
      )
    }

    switch (type) {
      case "categories":
        const realCategories = getRealCategories()
        return NextResponse.json({
          success: true,
          data: realCategories,
          message: "Categories retrieved successfully",
        })

      case "posts":
        let filteredPosts = getRealPosts()

        // Filter by category
        if (categoryId) {
          filteredPosts = filteredPosts.filter((post) => post.categoryId === categoryId)
        }

        // Search functionality
        if (search) {
          const searchLower = search.toLowerCase()
          filteredPosts = filteredPosts.filter(
            (post) =>
              post.title.toLowerCase().includes(searchLower) ||
              post.content.toLowerCase().includes(searchLower) ||
              post.tags.some((tag) => tag.toLowerCase().includes(searchLower)),
          )
        }

        // Sort posts
        switch (sortBy) {
          case "popular":
            filteredPosts.sort((a, b) => b.likes + b.views - (a.likes + a.views))
            break
          case "replies":
            filteredPosts.sort((a, b) => b.replies - a.replies)
            break
          case "oldest":
            filteredPosts.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
            break
          default: // recent
            filteredPosts.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
        }

        // Pagination
        const startIndex = (page - 1) * limit
        const paginatedPosts = filteredPosts.slice(startIndex, startIndex + limit)

        return NextResponse.json({
          success: true,
          data: paginatedPosts,
          pagination: {
            page,
            limit,
            total: filteredPosts.length,
            totalPages: Math.ceil(filteredPosts.length / limit),
          },
          message: "Posts retrieved successfully",
        })

      case "post":
        if (!postId) {
          return NextResponse.json(
            {
              success: false,
              error: "Post ID is required",
              data: null,
            },
            { status: 400 },
          )
        }
        const posts = getRealPosts()
        const post = posts.find((p) => p.id === postId)
        if (!post) {
          return NextResponse.json(
            {
              success: false,
              error: "Post not found",
              data: null,
            },
            { status: 404 },
          )
        }

        // Increment view count (in real app, track unique views)
        post.views += 1

        return NextResponse.json({
          success: true,
          data: post,
          message: "Post retrieved successfully",
        })

      case "replies":
        if (!postId) {
          return NextResponse.json(
            {
              success: false,
              error: "Post ID is required for replies",
              data: [],
            },
            { status: 400 },
          )
        }
        const postReplies = mockReplies.filter((reply) => reply.postId === postId)
        return NextResponse.json({
          success: true,
          data: postReplies,
          message: "Replies retrieved successfully",
        })

      case "users":
        return NextResponse.json({
          success: true,
          data: mockUsers,
          message: "Users retrieved successfully",
        })

      case "user":
        if (!userId) {
          return NextResponse.json(
            {
              success: false,
              error: "User ID is required",
              data: null,
            },
            { status: 400 },
          )
        }
        const user = mockUsers.find((u) => u.id === userId)
        if (!user) {
          return NextResponse.json(
            {
              success: false,
              error: "User not found",
              data: null,
            },
            { status: 404 },
          )
        }
        return NextResponse.json({
          success: true,
          data: user,
          message: "User retrieved successfully",
        })

      case "trending":
        const allPosts = getRealPosts()
        const trendingPosts = allPosts
          .filter((post) => post.status === "active")
          .sort((a, b) => {
            const aScore = a.likes * 2 + a.replies * 1.5 + a.views * 0.1
            const bScore = b.likes * 2 + b.replies * 1.5 + a.views * 0.1
            return bScore - aScore
          })
          .slice(0, 5)

        return NextResponse.json({
          success: true,
          data: trendingPosts,
          message: "Trending posts retrieved successfully",
        })

      default:
        return NextResponse.json(
          {
            success: false,
            error: "Invalid request type. Available types: categories, posts, post, replies, users, user, trending",
            data: [],
          },
          { status: 400 },
        )
    }
  } catch (error) {
    console.error("Forum API error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        data: [],
      },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, shopId, ...data } = body

    if (!shopId) {
      return NextResponse.json(
        {
          success: false,
          error: "Shop ID is required",
        },
        { status: 400 },
      )
    }

    switch (type) {
      case "create_post":
        const { title, content, author, authorEmail, categoryId, tags = [] } = data
        if (!title || !content || !author || !categoryId) {
          return NextResponse.json(
            {
              success: false,
              error: "Title, content, author, and categoryId are required",
            },
            { status: 400 },
          )
        }

        const newPost = forumDataStore.addPost({
          title,
          content,
          author,
          categoryId,
        })

        return NextResponse.json({
          success: true,
          data: newPost,
          message: "Post created successfully",
        })

      case "create_reply":
        const { postId, content: replyContent, author: replyAuthor, authorEmail: replyAuthorEmail } = data
        if (!postId || !replyContent || !replyAuthor) {
          return NextResponse.json(
            {
              success: false,
              error: "Post ID, content, and author are required",
            },
            { status: 400 },
          )
        }

        // TODO: Implement replies in data store
        return NextResponse.json({
          success: true,
          data: { id: "temp", content: replyContent, author: replyAuthor },
          message: "Reply created successfully",
        })

      case "like_post":
        // TODO: Implement likes in data store
        return NextResponse.json({
          success: true,
          data: { likes: 1 },
          message: "Post liked successfully",
        })

      case "pin_post":
        // TODO: Implement pinning in data store
        return NextResponse.json({
          success: true,
          data: { isPinned: true },
          message: "Post pinned successfully",
        })

      case "create_category":
        const { name, description, color = "#3B82F6", icon = "MessageSquare" } = data
        if (!name || !description) {
          return NextResponse.json(
            {
              success: false,
              error: "Name and description are required",
            },
            { status: 400 },
          )
        }

        const newCategory = forumDataStore.addCategory({
          name,
          description,
        })

        return NextResponse.json({
          success: true,
          data: newCategory,
          message: "Category created successfully",
        })

      default:
        return NextResponse.json(
          {
            success: false,
            error:
              "Invalid request type. Available types: create_post, create_reply, like_post, pin_post, create_category",
          },
          { status: 400 },
        )
    }
  } catch (error) {
    console.error("Forum API POST error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 },
    )
  }
}
