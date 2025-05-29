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
  authorEmail?: string
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
  authorEmail?: string
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
  try {
    console.log("🔍 Getting real categories from data store")
    const categories = forumDataStore.getCategories()
    const posts = forumDataStore.getPosts()

    if (!Array.isArray(categories)) {
      console.error("❌ Categories is not an array:", categories)
      return []
    }

    if (!Array.isArray(posts)) {
      console.error("❌ Posts is not an array:", posts)
      return categories.map((category) => ({
        ...category,
        postCount: 0,
        lastActivity: category.createdAt || new Date().toISOString(),
        color: category.color || "#3B82F6",
        icon: category.icon || "MessageSquare",
        isPrivate: category.isPrivate || false,
        moderators: category.moderators || ["admin@store.com"],
      }))
    }

    return categories.map((category) => {
      const categoryPosts = posts.filter((post) => post.categoryId === category.id)
      const lastPost = categoryPosts.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )[0]

      return {
        id: category.id,
        name: category.name,
        description: category.description || "",
        postCount: categoryPosts.length,
        lastActivity: lastPost?.createdAt || category.createdAt || new Date().toISOString(),
        color: category.color || "#3B82F6",
        icon: category.icon || "MessageSquare",
        isPrivate: category.isPrivate || false,
        moderators: category.moderators || ["admin@store.com"],
      }
    })
  } catch (error) {
    console.error("❌ Error in getRealCategories:", error)
    return []
  }
}

function getRealPosts(): Post[] {
  try {
    console.log("🔍 Getting real posts from data store")
    const posts = forumDataStore.getPosts()

    if (!Array.isArray(posts)) {
      console.error("❌ Posts is not an array:", posts)
      return []
    }

    return posts.map((post) => ({
      ...post,
      replies: post.replies || 0,
      views: post.views || 0,
      likes: post.likes || 0,
      isPinned: post.isPinned || false,
      isLocked: post.isLocked || false,
      tags: post.tags || [],
      attachments: post.attachments || [],
      status: post.status || "active",
    }))
  } catch (error) {
    console.error("❌ Error in getRealPosts:", error)
    return []
  }
}

// Mock data for replies and users (these will be implemented later)
const mockReplies: Reply[] = []
const mockUsers: User[] = []

export async function GET(request: NextRequest) {
  try {
    console.log("📥 Forum API GET request received:", request.url)
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

    console.log("🔍 Forum API params:", { type, shopId, categoryId, postId, userId, search, sortBy, page, limit })

    if (!shopId) {
      console.warn("⚠️ Missing shop_id parameter")
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
        console.log("📂 Getting categories")
        const realCategories = getRealCategories()
        console.log(`📊 Found ${realCategories.length} categories`)
        return NextResponse.json({
          success: true,
          data: realCategories,
          message: "Categories retrieved successfully",
        })

      case "posts":
        console.log("📝 Getting posts")
        let filteredPosts = getRealPosts()
        console.log(`📊 Found ${filteredPosts.length} posts total`)

        // Filter by category
        if (categoryId) {
          console.log(`🔍 Filtering by category: ${categoryId}`)
          filteredPosts = filteredPosts.filter((post) => post.categoryId === categoryId)
          console.log(`📊 Found ${filteredPosts.length} posts in category`)
        }

        // Search functionality
        if (search) {
          console.log(`🔍 Searching for: ${search}`)
          const searchLower = search.toLowerCase()
          filteredPosts = filteredPosts.filter(
            (post) =>
              post.title.toLowerCase().includes(searchLower) ||
              post.content.toLowerCase().includes(searchLower) ||
              (Array.isArray(post.tags) && post.tags.some((tag) => tag.toLowerCase().includes(searchLower))),
          )
          console.log(`📊 Found ${filteredPosts.length} posts matching search`)
        }

        // Sort posts
        console.log(`🔄 Sorting posts by: ${sortBy}`)
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
            filteredPosts.sort(
              (a, b) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime(),
            )
        }

        // Pagination
        const startIndex = (page - 1) * limit
        const paginatedPosts = filteredPosts.slice(startIndex, startIndex + limit)
        console.log(`📊 Returning ${paginatedPosts.length} posts (page ${page}, limit ${limit})`)

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
          console.warn("⚠️ Missing post_id parameter")
          return NextResponse.json(
            {
              success: false,
              error: "Post ID is required",
              data: null,
            },
            { status: 400 },
          )
        }
        console.log(`🔍 Getting post: ${postId}`)
        const posts = getRealPosts()
        const post = posts.find((p) => p.id === postId)
        if (!post) {
          console.warn(`⚠️ Post not found: ${postId}`)
          return NextResponse.json(
            {
              success: false,
              error: "Post not found",
              data: null,
            },
            { status: 404 },
          )
        }

        // Increment view count using the data store method
        forumDataStore.incrementPostViews(postId)
        console.log(`👁️ Incremented view count for post ${postId}`)

        return NextResponse.json({
          success: true,
          data: post,
          message: "Post retrieved successfully",
        })

      case "replies":
        if (!postId) {
          console.warn("⚠️ Missing post_id parameter for replies")
          return NextResponse.json(
            {
              success: false,
              error: "Post ID is required for replies",
              data: [],
            },
            { status: 400 },
          )
        }
        console.log(`🔍 Getting replies for post: ${postId}`)
        const postReplies = forumDataStore.getRepliesByPostId(postId)
        console.log(`📊 Found ${postReplies.length} replies`)
        return NextResponse.json({
          success: true,
          data: postReplies,
          message: "Replies retrieved successfully",
        })

      case "users":
        console.log("👥 Getting users")
        return NextResponse.json({
          success: true,
          data: mockUsers,
          message: "Users retrieved successfully",
        })

      case "user":
        if (!userId) {
          console.warn("⚠️ Missing user_id parameter")
          return NextResponse.json(
            {
              success: false,
              error: "User ID is required",
              data: null,
            },
            { status: 400 },
          )
        }
        console.log(`🔍 Getting user: ${userId}`)
        const user = mockUsers.find((u) => u.id === userId)
        if (!user) {
          console.warn(`⚠️ User not found: ${userId}`)
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
        console.log("🔥 Getting trending posts")
        const allPosts = getRealPosts()
        const trendingPosts = allPosts
          .filter((post) => post.status === "active")
          .sort((a, b) => {
            const aScore = a.likes * 2 + a.replies * 1.5 + a.views * 0.1
            const bScore = b.likes * 2 + b.replies * 1.5 + b.views * 0.1
            return bScore - aScore
          })
          .slice(0, 5)
        console.log(`📊 Found ${trendingPosts.length} trending posts`)

        return NextResponse.json({
          success: true,
          data: trendingPosts,
          message: "Trending posts retrieved successfully",
        })

      default:
        console.warn(`⚠️ Invalid request type: ${type}`)
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
    console.error("❌ Forum API error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
        data: [],
      },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log("📤 Forum API POST request received")

    // Parse the request body
    let body
    try {
      body = await request.json()
      console.log("📦 Request body:", body)
    } catch (error) {
      console.error("❌ Error parsing request body:", error)
      return NextResponse.json(
        {
          success: false,
          error: "Invalid request body",
        },
        { status: 400 },
      )
    }

    const { type, shopId, ...data } = body

    if (!shopId) {
      console.warn("⚠️ Missing shopId in request body")
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
        console.log("📝 Creating new post")
        const { title, content, author, authorEmail, categoryId, tags = [] } = data

        // Enhanced validation with detailed logging
        console.log("🔍 Post creation data:", { title, content, author, categoryId, tags })

        if (!title || !content || !author || !categoryId) {
          console.warn("⚠️ Missing required fields for post creation:", {
            title: !!title,
            content: !!content,
            author: !!author,
            categoryId: !!categoryId,
          })
          return NextResponse.json(
            {
              success: false,
              error: "Title, content, author, and categoryId are required",
              missingFields: {
                title: !title,
                content: !content,
                author: !author,
                categoryId: !categoryId,
              },
              receivedData: { title, content, author, categoryId },
            },
            { status: 400 },
          )
        }

        // Check if category exists with better error handling
        try {
          const category = forumDataStore.getCategoryById(categoryId)
          console.log("🔍 Category lookup result:", category ? "Found" : "Not found")

          if (!category) {
            console.warn(`⚠️ Category not found: ${categoryId}`)
            // Let's also check what categories exist
            const allCategories = forumDataStore.getCategories()
            console.log(
              "📂 Available categories:",
              allCategories.map((c) => ({ id: c.id, name: c.name })),
            )

            return NextResponse.json(
              {
                success: false,
                error: `Category with ID ${categoryId} not found`,
                availableCategories: allCategories.map((c) => ({ id: c.id, name: c.name })),
              },
              { status: 404 },
            )
          }

          console.log("🔍 Creating post with validated data:", { title, content, author, categoryId })
          const newPost = forumDataStore.createPost({
            title,
            content,
            author,
            authorEmail,
            categoryId,
            tags,
          })

          if (!newPost) {
            throw new Error("createPost returned null/undefined")
          }

          console.log("✅ Post created successfully:", newPost)
          return NextResponse.json({
            success: true,
            data: newPost,
            message: "Post created successfully",
          })
        } catch (error) {
          console.error("❌ Error creating post:", error)
          console.error("❌ Error stack:", error instanceof Error ? error.stack : "No stack trace")
          return NextResponse.json(
            {
              success: false,
              error: "Failed to create post",
              message: error instanceof Error ? error.message : "Unknown error",
              details: error instanceof Error ? error.stack : "No details available",
            },
            { status: 500 },
          )
        }

      case "create_reply":
        console.log("💬 Creating new reply")
        const { postId, content: replyContent, author: replyAuthor, authorEmail: replyAuthorEmail } = data
        if (!postId || !replyContent || !replyAuthor) {
          console.warn("⚠️ Missing required fields for reply creation")
          return NextResponse.json(
            {
              success: false,
              error: "Post ID, content, and author are required",
            },
            { status: 400 },
          )
        }

        try {
          const newReply = forumDataStore.addReply({
            postId,
            content: replyContent,
            author: replyAuthor,
            authorEmail: replyAuthorEmail,
          })

          if (!newReply) {
            throw new Error("Failed to create reply")
          }

          console.log("✅ Reply created successfully:", newReply)
          return NextResponse.json({
            success: true,
            data: newReply,
            message: "Reply created successfully",
          })
        } catch (error) {
          console.error("❌ Error creating reply:", error)
          return NextResponse.json(
            {
              success: false,
              error: "Failed to create reply",
              message: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 },
          )
        }

      case "like_post":
        console.log("👍 Liking post:", data.postId)
        if (!data.postId) {
          console.warn("⚠️ Missing postId for like operation")
          return NextResponse.json(
            {
              success: false,
              error: "Post ID is required",
            },
            { status: 400 },
          )
        }

        try {
          const result = forumDataStore.likePost(data.postId)
          if (!result) {
            throw new Error(`Failed to like post ${data.postId}`)
          }

          console.log("✅ Post liked successfully:", result)
          return NextResponse.json({
            success: true,
            data: result,
            message: "Post liked successfully",
          })
        } catch (error) {
          console.error("❌ Error liking post:", error)
          return NextResponse.json(
            {
              success: false,
              error: "Failed to like post",
              message: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 },
          )
        }

      case "pin_post":
        // TODO: Implement pinning in data store
        console.log("📌 Post pinned (mock implementation)")
        return NextResponse.json({
          success: true,
          data: { isPinned: true },
          message: "Post pinned successfully",
        })

      case "create_category":
        console.log("📂 Creating new category")
        const { name, description, color = "#3B82F6", icon = "MessageSquare" } = data
        if (!name || !description) {
          console.warn("⚠️ Missing required fields for category creation")
          return NextResponse.json(
            {
              success: false,
              error: "Name and description are required",
            },
            { status: 400 },
          )
        }

        try {
          console.log("🔍 Creating category with data:", { name, description, color, icon })
          const newCategory = forumDataStore.createCategory({
            name,
            description,
            color,
            icon,
          })

          console.log("✅ Category created successfully:", newCategory)
          return NextResponse.json({
            success: true,
            data: newCategory,
            message: "Category created successfully",
          })
        } catch (error) {
          console.error("❌ Error creating category:", error)
          return NextResponse.json(
            {
              success: false,
              error: "Failed to create category",
              message: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 },
          )
        }

      case "like_reply":
        console.log("👍 Liking reply:", data.replyId)
        if (!data.replyId) {
          console.warn("⚠️ Missing replyId for like operation")
          return NextResponse.json(
            {
              success: false,
              error: "Reply ID is required",
            },
            { status: 400 },
          )
        }

        try {
          const result = forumDataStore.likeReply(data.replyId)
          if (!result) {
            throw new Error(`Failed to like reply ${data.replyId}`)
          }

          console.log("✅ Reply liked successfully:", result)
          return NextResponse.json({
            success: true,
            data: result,
            message: "Reply liked successfully",
          })
        } catch (error) {
          console.error("❌ Error liking reply:", error)
          return NextResponse.json(
            {
              success: false,
              error: "Failed to like reply",
              message: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 },
          )
        }

      default:
        console.warn(`⚠️ Invalid request type: ${type}`)
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
    console.error("❌ Forum API POST error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
