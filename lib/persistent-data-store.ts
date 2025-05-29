import { kv } from "@vercel/kv"

interface Category {
  id: string
  name: string
  description: string
  color?: string
  icon?: string
  isPrivate?: boolean
  moderators?: string[]
  createdAt: string
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
  isPinned?: boolean
  isLocked?: boolean
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
  updatedAt: string
  likes: number
  parentReplyId?: string
  status?: string
}

class PersistentForumDataStore {
  private readonly CATEGORIES_KEY = "forum:categories"
  private readonly POSTS_KEY = "forum:posts"
  private readonly REPLIES_KEY = "forum:replies"
  private readonly INITIALIZED_KEY = "forum:initialized"

  async isInitialized(): Promise<boolean> {
    try {
      const initialized = await kv.get(this.INITIALIZED_KEY)
      return initialized === true
    } catch (error) {
      console.error("Error checking initialization:", error)
      return false
    }
  }

  async initialize(): Promise<void> {
    try {
      const isInit = await this.isInitialized()
      if (isInit) {
        console.log("✅ Forum already initialized")
        return
      }

      console.log("🔄 Initializing persistent forum data store...")

      // Create default categories
      const defaultCategories: Category[] = [
        {
          id: "general",
          name: "General Discussion",
          description: "General topics and discussions",
          color: "#3B82F6",
          icon: "MessageSquare",
          createdAt: new Date().toISOString(),
        },
        {
          id: "support",
          name: "Support & Help",
          description: "Get help and support from the community",
          color: "#10B981",
          icon: "HelpCircle",
          createdAt: new Date().toISOString(),
        },
        {
          id: "announcements",
          name: "Announcements",
          description: "Important updates and announcements",
          color: "#F59E0B",
          icon: "Megaphone",
          createdAt: new Date().toISOString(),
        },
      ]

      // Create sample posts
      const defaultPosts: Post[] = [
        {
          id: "post-1",
          title: "Welcome to the Community Forum!",
          content: "This is your first post in the community forum. Feel free to explore and start discussions!",
          author: "Admin",
          authorEmail: "admin@store.com",
          categoryId: "general",
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          updatedAt: new Date(Date.now() - 86400000).toISOString(),
          replies: 2,
          views: 15,
          likes: 3,
          isPinned: true,
          tags: ["welcome", "introduction"],
          status: "active",
        },
      ]

      // Create sample replies
      const defaultReplies: Reply[] = [
        {
          id: "reply-1",
          postId: "post-1",
          content: "Thank you for the warm welcome! I'm excited to be part of this community.",
          author: "New User",
          authorEmail: "newuser@example.com",
          createdAt: new Date(Date.now() - 21600000).toISOString(),
          updatedAt: new Date(Date.now() - 21600000).toISOString(),
          likes: 1,
          status: "active",
        },
      ]

      // Save to KV store
      await kv.set(this.CATEGORIES_KEY, defaultCategories)
      await kv.set(this.POSTS_KEY, defaultPosts)
      await kv.set(this.REPLIES_KEY, defaultReplies)
      await kv.set(this.INITIALIZED_KEY, true)

      console.log("✅ Persistent forum data store initialized")
    } catch (error) {
      console.error("❌ Error initializing persistent store:", error)
      throw error
    }
  }

  // Categories
  async getCategories(): Promise<Category[]> {
    try {
      await this.initialize()
      const categories = await kv.get<Category[]>(this.CATEGORIES_KEY)
      return categories || []
    } catch (error) {
      console.error("Error getting categories:", error)
      return []
    }
  }

  async getCategoryById(id: string): Promise<Category | null> {
    try {
      const categories = await this.getCategories()
      return categories.find((cat) => cat.id === id) || null
    } catch (error) {
      console.error("Error getting category by ID:", error)
      return null
    }
  }

  async createCategory(data: Omit<Category, "id" | "createdAt">): Promise<Category> {
    try {
      const categories = await this.getCategories()
      const category: Category = {
        id: `cat-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date().toISOString(),
        ...data,
      }

      categories.push(category)
      await kv.set(this.CATEGORIES_KEY, categories)

      console.log("✅ Category created and saved:", category)
      return category
    } catch (error) {
      console.error("Error creating category:", error)
      throw error
    }
  }

  async deleteCategory(categoryId: string): Promise<boolean> {
    try {
      const categories = await this.getCategories()
      const posts = await this.getPosts()

      // Check if category has posts
      const postsInCategory = posts.filter((post) => post.categoryId === categoryId && post.status === "active")
      if (postsInCategory.length > 0) {
        console.warn(`⚠️ Cannot delete category ${categoryId} - has ${postsInCategory.length} active posts`)
        return false
      }

      const updatedCategories = categories.filter((cat) => cat.id !== categoryId)
      await kv.set(this.CATEGORIES_KEY, updatedCategories)

      console.log(`✅ Category ${categoryId} deleted and saved`)
      return true
    } catch (error) {
      console.error("Error deleting category:", error)
      return false
    }
  }

  // Posts
  async getPosts(): Promise<Post[]> {
    try {
      await this.initialize()
      const posts = await kv.get<Post[]>(this.POSTS_KEY)
      return (posts || []).filter((post) => post.status === "active")
    } catch (error) {
      console.error("Error getting posts:", error)
      return []
    }
  }

  async getPostById(id: string): Promise<Post | null> {
    try {
      const posts = await kv.get<Post[]>(this.POSTS_KEY)
      return (posts || []).find((post) => post.id === id && post.status === "active") || null
    } catch (error) {
      console.error("Error getting post by ID:", error)
      return null
    }
  }

  async createPost(data: Omit<Post, "id" | "createdAt" | "updatedAt" | "replies" | "views" | "likes">): Promise<Post> {
    try {
      const posts = (await kv.get<Post[]>(this.POSTS_KEY)) || []
      const post: Post = {
        id: `post-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        replies: 0,
        views: 0,
        likes: 0,
        isPinned: false,
        isLocked: false,
        tags: data.tags || [],
        status: "active",
        ...data,
      }

      posts.push(post)
      await kv.set(this.POSTS_KEY, posts)

      console.log("✅ Post created and saved:", post)
      return post
    } catch (error) {
      console.error("Error creating post:", error)
      throw error
    }
  }

  async deletePost(postId: string, userEmail: string): Promise<boolean> {
    try {
      const posts = (await kv.get<Post[]>(this.POSTS_KEY)) || []
      const postIndex = posts.findIndex((p) => p.id === postId)

      if (postIndex === -1) {
        console.warn(`⚠️ Post not found for deletion: ${postId}`)
        return false
      }

      const post = posts[postIndex]

      // Check permissions
      if (post.authorEmail !== userEmail && userEmail !== "admin@store.com") {
        console.warn(`⚠️ User ${userEmail} not authorized to delete post ${postId}`)
        return false
      }

      // Soft delete
      posts[postIndex].status = "deleted"
      posts[postIndex].updatedAt = new Date().toISOString()

      // Also delete replies
      const replies = (await kv.get<Reply[]>(this.REPLIES_KEY)) || []
      const updatedReplies = replies.map((reply) =>
        reply.postId === postId ? { ...reply, status: "deleted", updatedAt: new Date().toISOString() } : reply,
      )

      await kv.set(this.POSTS_KEY, posts)
      await kv.set(this.REPLIES_KEY, updatedReplies)

      console.log(`✅ Post ${postId} deleted and saved`)
      return true
    } catch (error) {
      console.error("Error deleting post:", error)
      return false
    }
  }

  // Replies
  async getRepliesByPostId(postId: string): Promise<Reply[]> {
    try {
      await this.initialize()
      const replies = await kv.get<Reply[]>(this.REPLIES_KEY)
      return (replies || []).filter((reply) => reply.postId === postId && reply.status === "active")
    } catch (error) {
      console.error("Error getting replies:", error)
      return []
    }
  }

  async addReply(data: Omit<Reply, "id" | "createdAt" | "updatedAt" | "likes">): Promise<Reply> {
    try {
      const replies = (await kv.get<Reply[]>(this.REPLIES_KEY)) || []
      const posts = (await kv.get<Post[]>(this.POSTS_KEY)) || []

      const reply: Reply = {
        id: `reply-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        likes: 0,
        status: "active",
        ...data,
      }

      replies.push(reply)

      // Update post reply count
      const postIndex = posts.findIndex((p) => p.id === data.postId)
      if (postIndex !== -1) {
        posts[postIndex].replies = (posts[postIndex].replies || 0) + 1
        posts[postIndex].updatedAt = new Date().toISOString()
      }

      await kv.set(this.REPLIES_KEY, replies)
      await kv.set(this.POSTS_KEY, posts)

      console.log("✅ Reply created and saved:", reply)
      return reply
    } catch (error) {
      console.error("Error creating reply:", error)
      throw error
    }
  }

  // Stats
  async getStats() {
    try {
      const categories = await this.getCategories()
      const posts = await this.getPosts()
      const replies = (await kv.get<Reply[]>(this.REPLIES_KEY)) || []
      const activeReplies = replies.filter((r) => r.status === "active")

      return {
        totalCategories: categories.length,
        totalPosts: posts.length,
        totalReplies: activeReplies.length,
        totalUsers: 3,
        activeToday: 2,
        onlineUsers: 1,
      }
    } catch (error) {
      console.error("Error getting stats:", error)
      return {
        totalCategories: 0,
        totalPosts: 0,
        totalReplies: 0,
        totalUsers: 0,
        activeToday: 0,
        onlineUsers: 0,
      }
    }
  }

  // Clear all data
  async clearAllData(): Promise<boolean> {
    try {
      await kv.del(this.CATEGORIES_KEY)
      await kv.del(this.POSTS_KEY)
      await kv.del(this.REPLIES_KEY)
      await kv.del(this.INITIALIZED_KEY)

      console.log("✅ All forum data cleared from persistent storage")
      return true
    } catch (error) {
      console.error("Error clearing data:", error)
      return false
    }
  }
}

// Export singleton instance
export const persistentForumDataStore = new PersistentForumDataStore()
