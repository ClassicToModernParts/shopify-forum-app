import { type NextRequest, NextResponse } from "next/server"
import { persistentForumDataStore } from "@/lib/persistent-data-store"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type")
    const shopId = searchParams.get("shop_id")

    console.log(`📡 Forum API GET request - Type: ${type}, Shop: ${shopId}`)

    if (!shopId) {
      return NextResponse.json({ success: false, error: "shop_id is required" }, { status: 400 })
    }

    switch (type) {
      case "categories": {
        console.log("🔍 Fetching categories...")
        const categories = await persistentForumDataStore.getCategories()

        // Add post counts and last activity
        const posts = await persistentForumDataStore.getPosts()
        const categoriesWithStats = categories.map((category) => {
          const categoryPosts = posts.filter((post) => post.categoryId === category.id)
          const lastPost = categoryPosts.sort(
            (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
          )[0]

          return {
            ...category,
            postCount: categoryPosts.length,
            lastActivity: lastPost ? lastPost.updatedAt : category.createdAt,
          }
        })

        console.log(`✅ Found ${categoriesWithStats.length} categories`)
        return NextResponse.json({
          success: true,
          data: categoriesWithStats,
        })
      }

      case "posts": {
        console.log("🔍 Fetching posts...")
        const categoryId = searchParams.get("category_id")
        const search = searchParams.get("search")
        const sortBy = searchParams.get("sort_by") || "recent"

        let posts = await persistentForumDataStore.getPosts()

        // Filter by category
        if (categoryId) {
          posts = posts.filter((post) => post.categoryId === categoryId)
        }

        // Filter by search
        if (search) {
          const searchLower = search.toLowerCase()
          posts = posts.filter(
            (post) =>
              post.title.toLowerCase().includes(searchLower) ||
              post.content.toLowerCase().includes(searchLower) ||
              post.tags?.some((tag) => tag.toLowerCase().includes(searchLower)),
          )
        }

        // Sort posts
        switch (sortBy) {
          case "popular":
            posts.sort((a, b) => (b.likes || 0) - (a.likes || 0))
            break
          case "replies":
            posts.sort((a, b) => (b.replies || 0) - (a.replies || 0))
            break
          case "oldest":
            posts.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
            break
          case "recent":
          default:
            posts.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
            break
        }

        console.log(`✅ Found ${posts.length} posts`)
        return NextResponse.json({
          success: true,
          data: posts,
        })
      }

      case "post": {
        const postId = searchParams.get("post_id")
        if (!postId) {
          return NextResponse.json({ success: false, error: "post_id is required" }, { status: 400 })
        }

        console.log(`🔍 Fetching post: ${postId}`)
        const post = await persistentForumDataStore.getPostById(postId)

        if (!post) {
          return NextResponse.json({ success: false, error: "Post not found" }, { status: 404 })
        }

        // Increment view count (you might want to add view tracking logic here)

        console.log(`✅ Found post: ${post.title}`)
        return NextResponse.json({
          success: true,
          data: post,
        })
      }

      case "replies": {
        const postId = searchParams.get("post_id")
        if (!postId) {
          return NextResponse.json({ success: false, error: "post_id is required" }, { status: 400 })
        }

        console.log(`🔍 Fetching replies for post: ${postId}`)
        const replies = await persistentForumDataStore.getRepliesByPostId(postId)

        console.log(`✅ Found ${replies.length} replies`)
        return NextResponse.json({
          success: true,
          data: replies,
        })
      }

      default:
        return NextResponse.json({ success: false, error: "Invalid type parameter" }, { status: 400 })
    }
  } catch (error) {
    console.error("❌ Forum API GET error:", error)
    return NextResponse.json(
      {
        success: false,
        error: `Server error: ${error instanceof Error ? error.message : "Unknown error"}`,
      },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, shopId } = body

    console.log(`📡 Forum API POST request - Type: ${type}, Shop: ${shopId}`)

    if (!shopId) {
      return NextResponse.json({ success: false, error: "shopId is required" }, { status: 400 })
    }

    switch (type) {
      case "create_post": {
        const { title, content, author, authorEmail, categoryId, tags } = body

        if (!title || !content || !author || !categoryId) {
          return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 })
        }

        console.log("📝 Creating new post...")
        const post = await persistentForumDataStore.createPost({
          title,
          content,
          author,
          authorEmail,
          categoryId,
          tags: tags || [],
        })

        console.log("✅ Post created successfully")
        return NextResponse.json({
          success: true,
          data: post,
        })
      }

      case "create_reply": {
        const { postId, content, author, authorEmail } = body

        if (!postId || !content || !author) {
          return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 })
        }

        console.log("💬 Creating new reply...")
        const reply = await persistentForumDataStore.addReply({
          postId,
          content,
          author,
          authorEmail,
        })

        console.log("✅ Reply created successfully")
        return NextResponse.json({
          success: true,
          data: reply,
        })
      }

      case "delete_post": {
        const { postId, userEmail } = body

        if (!postId || !userEmail) {
          return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 })
        }

        console.log(`🗑️ Deleting post: ${postId}`)
        const success = await persistentForumDataStore.deletePost(postId, userEmail)

        if (!success) {
          return NextResponse.json({ success: false, error: "Failed to delete post" }, { status: 400 })
        }

        console.log("✅ Post deleted successfully")
        return NextResponse.json({
          success: true,
          message: "Post deleted successfully",
        })
      }

      default:
        return NextResponse.json({ success: false, error: "Invalid type parameter" }, { status: 400 })
    }
  } catch (error) {
    console.error("❌ Forum API POST error:", error)
    return NextResponse.json(
      {
        success: false,
        error: `Server error: ${error instanceof Error ? error.message : "Unknown error"}`,
      },
      { status: 500 },
    )
  }
}
