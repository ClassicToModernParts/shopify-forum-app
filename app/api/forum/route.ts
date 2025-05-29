import { type NextRequest, NextResponse } from "next/server"
import { forumDataStore } from "./data-store"

export async function GET(request: NextRequest) {
  try {
    console.log("📥 Forum API GET request received:", request.url)
    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type")
    const shopId = searchParams.get("shop_id")
    const categoryId = searchParams.get("category_id")
    const postId = searchParams.get("post_id")

    console.log("🔍 Forum API params:", { type, shopId, categoryId, postId })

    if (!shopId) {
      return NextResponse.json({ success: false, error: "Shop ID is required", data: [] }, { status: 400 })
    }

    switch (type) {
      case "categories":
        console.log("📂 Getting categories")
        const categories = forumDataStore.getCategories()
        const posts = forumDataStore.getPosts()

        const categoriesWithCounts = categories.map((category) => {
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

        return NextResponse.json({
          success: true,
          data: categoriesWithCounts,
          message: "Categories retrieved successfully",
        })

      case "posts":
        console.log("📝 Getting posts")
        let allPosts = forumDataStore.getPosts()

        if (categoryId) {
          allPosts = allPosts.filter((post) => post.categoryId === categoryId)
        }

        const postsWithDefaults = allPosts.map((post) => ({
          ...post,
          replies: post.replies || 0,
          views: post.views || 0,
          likes: post.likes || 0,
          isPinned: post.isPinned || false,
          isLocked: post.isLocked || false,
          tags: post.tags || [],
          status: post.status || "active",
        }))

        return NextResponse.json({
          success: true,
          data: postsWithDefaults,
          message: "Posts retrieved successfully",
        })

      case "post":
        if (!postId) {
          return NextResponse.json({ success: false, error: "Post ID is required", data: null }, { status: 400 })
        }

        const post = forumDataStore.getPostById(postId)
        if (!post) {
          return NextResponse.json({ success: false, error: "Post not found", data: null }, { status: 404 })
        }

        // Increment view count
        forumDataStore.incrementPostViews(postId)
        const updatedPost = forumDataStore.getPostById(postId)

        return NextResponse.json({
          success: true,
          data: updatedPost,
          message: "Post retrieved successfully",
        })

      case "replies":
        if (!postId) {
          return NextResponse.json(
            { success: false, error: "Post ID is required for replies", data: [] },
            { status: 400 },
          )
        }

        const replies = forumDataStore.getRepliesByPostId(postId)
        return NextResponse.json({
          success: true,
          data: replies,
          message: "Replies retrieved successfully",
        })

      default:
        return NextResponse.json({ success: false, error: "Invalid request type", data: [] }, { status: 400 })
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

    const body = await request.json()
    console.log("📦 Request body:", body)

    const { type, shopId, ...data } = body

    if (!shopId) {
      return NextResponse.json({ success: false, error: "Shop ID is required" }, { status: 400 })
    }

    switch (type) {
      case "create_post":
        console.log("📝 Creating new post")
        const { title, content, author, authorEmail, categoryId, tags = [] } = data

        if (!title || !content || !author || !categoryId) {
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
            },
            { status: 400 },
          )
        }

        // Check if category exists
        const category = forumDataStore.getCategoryById(categoryId)
        if (!category) {
          const allCategories = forumDataStore.getCategories()
          return NextResponse.json(
            {
              success: false,
              error: `Category with ID ${categoryId} not found`,
              availableCategories: allCategories.map((c) => ({ id: c.id, name: c.name })),
            },
            { status: 404 },
          )
        }

        const newPost = forumDataStore.createPost({
          title,
          content,
          author,
          authorEmail,
          categoryId,
          tags,
        })

        if (!newPost) {
          throw new Error("Failed to create post")
        }

        console.log("✅ Post created successfully:", newPost)
        return NextResponse.json({
          success: true,
          data: newPost,
          message: "Post created successfully",
        })

      case "create_reply":
        console.log("💬 Creating new reply")
        const { postId, content: replyContent, author: replyAuthor, authorEmail: replyAuthorEmail } = data

        if (!postId || !replyContent || !replyAuthor) {
          return NextResponse.json(
            {
              success: false,
              error: "Post ID, content, and author are required",
              missingFields: {
                postId: !postId,
                content: !replyContent,
                author: !replyAuthor,
              },
            },
            { status: 400 },
          )
        }

        // Verify the post exists
        const targetPost = forumDataStore.getPostById(postId)
        if (!targetPost) {
          return NextResponse.json({ success: false, error: `Post with ID ${postId} not found` }, { status: 404 })
        }

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

      case "like_post":
        console.log("👍 Liking post:", data.postId)
        if (!data.postId) {
          return NextResponse.json({ success: false, error: "Post ID is required" }, { status: 400 })
        }

        const likeResult = forumDataStore.likePost(data.postId)
        if (!likeResult) {
          throw new Error(`Failed to like post ${data.postId}`)
        }

        return NextResponse.json({
          success: true,
          data: likeResult,
          message: "Post liked successfully",
        })

      case "like_reply":
        console.log("👍 Liking reply:", data.replyId)
        if (!data.replyId) {
          return NextResponse.json({ success: false, error: "Reply ID is required" }, { status: 400 })
        }

        const replyLikeResult = forumDataStore.likeReply(data.replyId)
        if (!replyLikeResult) {
          throw new Error(`Failed to like reply ${data.replyId}`)
        }

        return NextResponse.json({
          success: true,
          data: replyLikeResult,
          message: "Reply liked successfully",
        })

      case "create_category":
        console.log("📂 Creating new category")
        const { name, description, color = "#3B82F6", icon = "MessageSquare" } = data

        if (!name || !description) {
          return NextResponse.json({ success: false, error: "Name and description are required" }, { status: 400 })
        }

        const newCategory = forumDataStore.createCategory({
          name,
          description,
          color,
          icon,
        })

        return NextResponse.json({
          success: true,
          data: newCategory,
          message: "Category created successfully",
        })

      default:
        return NextResponse.json({ success: false, error: "Invalid request type" }, { status: 400 })
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
