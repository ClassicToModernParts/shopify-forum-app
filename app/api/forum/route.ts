import { type NextRequest, NextResponse } from "next/server"
import { dataStore } from "@/lib/persistent-data-store"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const requestType = searchParams.get("type")

    console.log(`🔍 Forum API GET request: ${requestType}`)

    // Ensure data store is initialized
    try {
      if (!(await dataStore.isInitialized())) {
        console.log("🔄 Data store not initialized, initializing now...")
        await dataStore.initialize()
        console.log("✅ Data store initialized successfully")
      }
    } catch (initError) {
      console.error("❌ Failed to initialize data store:", initError)
      return NextResponse.json(
        {
          success: false,
          error: "Failed to initialize data store",
          details: initError instanceof Error ? initError.message : "Unknown error",
        },
        { status: 500 },
      )
    }

    if (requestType === "categories") {
      try {
        console.log("📋 Fetching categories...")
        const categories = await dataStore.getCategories()
        console.log(`📋 Retrieved ${categories?.length || 0} categories`)

        // Safely handle posts
        let posts = []
        try {
          posts = await dataStore.getPosts()
        } catch (postsError) {
          console.warn("⚠️ Error fetching posts for category metadata:", postsError)
        }

        // Safely map categories with metadata
        const categoriesWithMeta = (categories || []).map((category) => {
          try {
            const categoryPosts = posts.filter((post) => post.categoryId === category.id)
            const lastPost = categoryPosts.sort(
              (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
            )[0]

            return {
              ...category,
              postCount: categoryPosts.length,
              lastActivity: lastPost ? lastPost.updatedAt : category.createdAt,
            }
          } catch (error) {
            console.warn(`⚠️ Error processing metadata for category ${category.id}:`, error)
            return {
              ...category,
              postCount: 0,
              lastActivity: category.createdAt,
            }
          }
        })

        return NextResponse.json({
          success: true,
          data: categoriesWithMeta,
          message: "Categories retrieved successfully",
        })
      } catch (categoriesError) {
        console.error("❌ Error fetching categories:", categoriesError)
        return NextResponse.json(
          {
            success: false,
            error: "Failed to fetch categories",
            details: categoriesError instanceof Error ? categoriesError.message : "Unknown error",
          },
          { status: 500 },
        )
      }
    } else if (requestType === "posts") {
      try {
        const categoryId = searchParams.get("category_id")
        const search = searchParams.get("search")
        const sortBy = searchParams.get("sort_by") || "recent"

        let posts = await dataStore.getPosts()

        if (!Array.isArray(posts)) {
          console.warn("⚠️ Posts is not an array, defaulting to empty array")
          posts = []
        }

        // Filter by category if specified
        if (categoryId) {
          posts = posts.filter((post) => post.categoryId === categoryId)
        }

        // Filter by search query if specified
        if (search) {
          const searchLower = search.toLowerCase()
          posts = posts.filter(
            (post) =>
              post.title?.toLowerCase().includes(searchLower) || post.content?.toLowerCase().includes(searchLower),
          )
        }

        // Sort posts
        switch (sortBy) {
          case "popular":
            posts = posts.sort((a, b) => b.views + b.likes - (a.views + a.likes))
            break
          case "replies":
            posts = posts.sort((a, b) => b.replies - a.replies)
            break
          case "oldest":
            posts = posts.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
            break
          case "recent":
          default:
            posts = posts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        }

        return NextResponse.json({
          success: true,
          data: posts,
          message: "Posts retrieved successfully",
        })
      } catch (postsError) {
        console.error("❌ Error fetching posts:", postsError)
        return NextResponse.json(
          {
            success: false,
            error: "Failed to fetch posts",
            details: postsError instanceof Error ? postsError.message : "Unknown error",
          },
          { status: 500 },
        )
      }
    } else if (requestType === "post") {
      try {
        const postId = searchParams.get("post_id")

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

        const post = await dataStore.getPostById(postId)
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

        // Increment view count
        try {
          await dataStore.incrementPostViews(postId)
        } catch (viewError) {
          console.warn(`⚠️ Failed to increment view count for post ${postId}:`, viewError)
        }

        return NextResponse.json({
          success: true,
          data: post,
          message: "Post retrieved successfully",
        })
      } catch (postError) {
        console.error("❌ Error fetching post:", postError)
        return NextResponse.json(
          {
            success: false,
            error: "Failed to fetch post",
            details: postError instanceof Error ? postError.message : "Unknown error",
          },
          { status: 500 },
        )
      }
    } else if (requestType === "replies") {
      try {
        const postId = searchParams.get("post_id")

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

        const replies = await dataStore.getRepliesByPostId(postId)

        return NextResponse.json({
          success: true,
          data: replies || [],
          message: "Replies retrieved successfully",
        })
      } catch (repliesError) {
        console.error("❌ Error fetching replies:", repliesError)
        return NextResponse.json(
          {
            success: false,
            error: "Failed to fetch replies",
            details: repliesError instanceof Error ? repliesError.message : "Unknown error",
          },
          { status: 500 },
        )
      }
    } else {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid request type",
          data: null,
        },
        { status: 400 },
      )
    }
  } catch (error) {
    console.error("❌ Error in forum API:", error)
    return NextResponse.json(
      {
        success: false,
        error: `An error occurred: ${error instanceof Error ? error.message : "Unknown error"}`,
        stack: error instanceof Error ? error.stack : undefined,
        data: null,
      },
      { status: 500 },
    )
  }
}

// POST method remains the same
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type } = body

    console.log(`📝 Forum API POST request: ${type}`)

    // Ensure data store is initialized
    if (!(await dataStore.isInitialized())) {
      console.log("🔄 Data store not initialized, initializing now...")
      await dataStore.initialize()
    }

    // Rest of the POST method remains the same...
    // (keeping the existing implementation)

    if (type === "create_post") {
      const { title, content, author, authorEmail, categoryId, tags } = body

      // Validate required fields
      if (!title || !content || !categoryId) {
        return NextResponse.json(
          {
            success: false,
            error: "Missing required fields",
            missingFields: {
              title: !title,
              content: !content,
              categoryId: !categoryId,
            },
          },
          { status: 400 },
        )
      }

      // Check if category exists
      const category = await dataStore.getCategoryById(categoryId)
      if (!category) {
        const categories = await dataStore.getCategories()
        return NextResponse.json(
          {
            success: false,
            error: `Category not found: ${categoryId}`,
            availableCategories: categories,
          },
          { status: 404 },
        )
      }

      const post = await dataStore.createPost({
        title,
        content,
        author,
        authorEmail,
        categoryId,
        tags,
        status: "active",
      })

      return NextResponse.json({
        success: true,
        data: post,
        message: "Post created successfully",
      })
    } else if (type === "create_reply") {
      const { postId, content, author, authorEmail } = body

      if (!postId || !content) {
        return NextResponse.json(
          {
            success: false,
            error: "Post ID and content are required",
          },
          { status: 400 },
        )
      }

      // Check if post exists
      const post = await dataStore.getPostById(postId)
      if (!post) {
        return NextResponse.json(
          {
            success: false,
            error: `Post not found: ${postId}`,
          },
          { status: 404 },
        )
      }

      const reply = await dataStore.addReply({
        postId,
        content,
        author,
        authorEmail,
      })

      return NextResponse.json({
        success: true,
        data: reply,
        message: "Reply created successfully",
      })
    } else if (type === "like_post") {
      const { postId, userEmail } = body

      if (!postId) {
        return NextResponse.json(
          {
            success: false,
            error: "Post ID is required",
          },
          { status: 400 },
        )
      }

      const result = await dataStore.likePost(postId, userEmail)

      if (!result) {
        return NextResponse.json(
          {
            success: false,
            error: "Post not found",
          },
          { status: 404 },
        )
      }

      return NextResponse.json({
        success: true,
        data: result,
        message: "Post liked successfully",
      })
    } else if (type === "like_reply") {
      const { replyId, userEmail } = body

      if (!replyId) {
        return NextResponse.json(
          {
            success: false,
            error: "Reply ID is required",
          },
          { status: 400 },
        )
      }

      const result = await dataStore.likeReply(replyId, userEmail)

      if (!result) {
        return NextResponse.json(
          {
            success: false,
            error: "Reply not found",
          },
          { status: 404 },
        )
      }

      return NextResponse.json({
        success: true,
        data: result,
        message: "Reply liked successfully",
      })
    } else if (type === "delete_post") {
      const { postId, userEmail } = body

      if (!postId) {
        return NextResponse.json(
          {
            success: false,
            error: "Post ID is required",
          },
          { status: 400 },
        )
      }

      const result = await dataStore.deletePost(postId, userEmail || "")

      if (!result) {
        return NextResponse.json(
          {
            success: false,
            error: "Post not found or you don't have permission to delete it",
          },
          { status: 404 },
        )
      }

      return NextResponse.json({
        success: true,
        data: { deleted: true, postId },
        message: "Post deleted successfully",
      })
    } else if (type === "delete_reply") {
      const { replyId, userEmail } = body

      if (!replyId) {
        return NextResponse.json(
          {
            success: false,
            error: "Reply ID is required",
          },
          { status: 400 },
        )
      }

      const result = await dataStore.deleteReply(replyId, userEmail || "")

      if (!result) {
        return NextResponse.json(
          {
            success: false,
            error: "Reply not found or you don't have permission to delete it",
          },
          { status: 404 },
        )
      }

      return NextResponse.json({
        success: true,
        data: { deleted: true, replyId },
        message: "Reply deleted successfully",
      })
    } else {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid request type",
        },
        { status: 400 },
      )
    }
  } catch (error) {
    console.error("❌ Error in forum API POST:", error)
    return NextResponse.json(
      {
        success: false,
        error: `An error occurred: ${error instanceof Error ? error.message : "Unknown error"}`,
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 },
    )
  }
}
