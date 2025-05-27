import { type NextRequest, NextResponse } from "next/server"

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

// Enhanced mock data
const mockCategories: Category[] = [
  {
    id: "1",
    name: "General Discussion",
    description: "General topics and discussions about our products",
    postCount: 45,
    lastActivity: "2024-01-15T10:30:00Z",
    color: "#3B82F6",
    icon: "MessageSquare",
    isPrivate: false,
    moderators: ["admin@store.com"],
  },
  {
    id: "2",
    name: "Product Support",
    description: "Get help with products and technical issues",
    postCount: 23,
    lastActivity: "2024-01-15T09:15:00Z",
    color: "#10B981",
    icon: "HelpCircle",
    isPrivate: false,
    moderators: ["support@store.com"],
  },
  {
    id: "3",
    name: "Feature Requests",
    description: "Suggest new features and improvements",
    postCount: 12,
    lastActivity: "2024-01-14T16:45:00Z",
    color: "#8B5CF6",
    icon: "Lightbulb",
    isPrivate: false,
    moderators: ["admin@store.com"],
  },
  {
    id: "4",
    name: "VIP Customers",
    description: "Exclusive discussions for VIP customers",
    postCount: 8,
    lastActivity: "2024-01-15T08:20:00Z",
    color: "#F59E0B",
    icon: "Crown",
    isPrivate: true,
    moderators: ["admin@store.com"],
  },
]

const mockPosts: Post[] = [
  {
    id: "1",
    title: "Welcome to Our Community Forum! 🎉",
    content:
      "We're excited to launch our new community forum where you can connect with other customers, get support, and share your experiences with our products.",
    author: "Store Admin",
    authorEmail: "admin@store.com",
    categoryId: "1",
    createdAt: "2024-01-10T12:00:00Z",
    updatedAt: "2024-01-10T12:00:00Z",
    replies: 12,
    views: 245,
    likes: 18,
    isPinned: true,
    isLocked: false,
    tags: ["announcement", "welcome"],
    attachments: [],
    status: "active",
  },
  {
    id: "2",
    title: "How to care for your new product",
    content: "Here are some tips for maintaining your product to ensure it lasts for years to come...",
    author: "Sarah Johnson",
    authorEmail: "sarah@example.com",
    categoryId: "2",
    createdAt: "2024-01-12T14:30:00Z",
    updatedAt: "2024-01-12T14:30:00Z",
    replies: 5,
    views: 89,
    likes: 7,
    isPinned: false,
    isLocked: false,
    tags: ["care", "maintenance", "tips"],
    attachments: ["care-guide.pdf"],
    status: "active",
  },
  {
    id: "3",
    title: "Product not working as expected",
    content: "I received my order yesterday but I'm having trouble with setup. Can someone help?",
    author: "Mike Chen",
    authorEmail: "mike@example.com",
    categoryId: "2",
    createdAt: "2024-01-13T09:15:00Z",
    updatedAt: "2024-01-13T09:15:00Z",
    replies: 3,
    views: 34,
    likes: 2,
    isPinned: false,
    isLocked: false,
    tags: ["help", "setup", "troubleshooting"],
    attachments: ["error-screenshot.png"],
    status: "active",
  },
]

const mockReplies: Reply[] = [
  {
    id: "1",
    postId: "1",
    content: "Thanks for creating this forum! Looking forward to connecting with other customers.",
    author: "Emma Wilson",
    authorEmail: "emma@example.com",
    createdAt: "2024-01-10T13:00:00Z",
    updatedAt: "2024-01-10T13:00:00Z",
    likes: 5,
    attachments: [],
    status: "active",
  },
  {
    id: "2",
    postId: "2",
    content: "Great tips! I've been following these and my product still looks brand new after 6 months.",
    author: "David Lee",
    authorEmail: "david@example.com",
    createdAt: "2024-01-12T16:45:00Z",
    updatedAt: "2024-01-12T16:45:00Z",
    likes: 3,
    attachments: [],
    status: "active",
  },
]

const mockUsers: User[] = [
  {
    id: "1",
    email: "admin@store.com",
    name: "Store Admin",
    avatar: "/placeholder.svg?height=40&width=40&query=admin",
    role: "admin",
    joinDate: "2024-01-01T00:00:00Z",
    postCount: 15,
    reputation: 500,
    badges: ["founder", "helpful"],
    isOnline: true,
    lastSeen: "2024-01-15T10:30:00Z",
  },
  {
    id: "2",
    email: "sarah@example.com",
    name: "Sarah Johnson",
    avatar: "/placeholder.svg?height=40&width=40&query=woman",
    role: "customer",
    joinDate: "2024-01-05T00:00:00Z",
    postCount: 8,
    reputation: 120,
    badges: ["helpful"],
    isOnline: false,
    lastSeen: "2024-01-14T18:20:00Z",
  },
]

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
        return NextResponse.json({
          success: true,
          data: mockCategories,
          message: "Categories retrieved successfully",
        })

      case "posts":
        let filteredPosts = [...mockPosts]

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
        const post = mockPosts.find((p) => p.id === postId)
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
        const trendingPosts = mockPosts
          .filter((post) => post.status === "active")
          .sort((a, b) => {
            const aScore = a.likes * 2 + a.replies * 1.5 + a.views * 0.1
            const bScore = b.likes * 2 + b.replies * 1.5 + b.views * 0.1
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

        const newPost: Post = {
          id: String(mockPosts.length + 1),
          title,
          content,
          author,
          authorEmail: authorEmail || `${author.toLowerCase().replace(" ", "")}@example.com`,
          categoryId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          replies: 0,
          views: 0,
          likes: 0,
          isPinned: false,
          isLocked: false,
          tags: Array.isArray(tags) ? tags : [],
          attachments: [],
          status: "active",
        }

        mockPosts.push(newPost)

        // Update category post count
        const category = mockCategories.find((c) => c.id === categoryId)
        if (category) {
          category.postCount += 1
          category.lastActivity = newPost.createdAt
        }

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

        const newReply: Reply = {
          id: String(mockReplies.length + 1),
          postId,
          content: replyContent,
          author: replyAuthor,
          authorEmail: replyAuthorEmail || `${replyAuthor.toLowerCase().replace(" ", "")}@example.com`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          likes: 0,
          attachments: [],
          status: "active",
        }

        mockReplies.push(newReply)

        // Update post reply count and last activity
        const targetPost = mockPosts.find((p) => p.id === postId)
        if (targetPost) {
          targetPost.replies += 1
          targetPost.updatedAt = newReply.createdAt
        }

        return NextResponse.json({
          success: true,
          data: newReply,
          message: "Reply created successfully",
        })

      case "like_post":
        const { postId: likePostId } = data
        const postToLike = mockPosts.find((p) => p.id === likePostId)
        if (postToLike) {
          postToLike.likes += 1
          return NextResponse.json({
            success: true,
            data: { likes: postToLike.likes },
            message: "Post liked successfully",
          })
        }
        return NextResponse.json(
          {
            success: false,
            error: "Post not found",
          },
          { status: 404 },
        )

      case "pin_post":
        const { postId: pinPostId } = data
        const postToPin = mockPosts.find((p) => p.id === pinPostId)
        if (postToPin) {
          postToPin.isPinned = !postToPin.isPinned
          return NextResponse.json({
            success: true,
            data: { isPinned: postToPin.isPinned },
            message: `Post ${postToPin.isPinned ? "pinned" : "unpinned"} successfully`,
          })
        }
        return NextResponse.json(
          {
            success: false,
            error: "Post not found",
          },
          { status: 404 },
        )

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

        const newCategory: Category = {
          id: String(mockCategories.length + 1),
          name,
          description,
          postCount: 0,
          lastActivity: new Date().toISOString(),
          color,
          icon,
          isPrivate: false,
          moderators: ["admin@store.com"],
        }

        mockCategories.push(newCategory)

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
