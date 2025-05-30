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

interface User {
  id: string
  username: string
  name: string
  email: string
  password: string
  role: "admin" | "user" | "moderator"
  createdAt: string
  lastActive?: string
  isActive?: boolean
}

class PersistentForumDataStore {
  private readonly CATEGORIES_KEY = "forum:categories"
  private readonly POSTS_KEY = "forum:posts"
  private readonly REPLIES_KEY = "forum:replies"
  private readonly INITIALIZED_KEY = "forum:initialized"
  private readonly USERS_KEY = "forum:users"

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

      // Create CTM Parts specific categories
      const defaultCategories: Category[] = [
        {
          id: "installation-help",
          name: "Installation Help",
          description: "Get help with installing CTM parts and components",
          color: "#3B82F6",
          icon: "Wrench",
          createdAt: new Date().toISOString(),
        },
        {
          id: "project-showcase",
          name: "Project Showcase",
          description: "Share your completed projects using CTM parts",
          color: "#10B981",
          icon: "Star",
          createdAt: new Date().toISOString(),
        },
        {
          id: "troubleshooting",
          name: "Troubleshooting",
          description: "Get help solving issues with CTM parts",
          color: "#F59E0B",
          icon: "AlertCircle",
          createdAt: new Date().toISOString(),
        },
        {
          id: "general",
          name: "General Discussion",
          description: "General topics and community discussions",
          color: "#8B5CF6",
          icon: "MessageSquare",
          createdAt: new Date().toISOString(),
        },
      ]

      // Create CTM Parts specific sample posts
      const defaultPosts: Post[] = [
        {
          id: "post-1",
          title: "Welcome to CTM Parts Community!",
          content:
            "Welcome to the CTM Parts Community forum! This is your place to get help with installations, share project showcases, troubleshoot issues, and connect with other CTM parts users. Feel free to explore and start discussions!",
          author: "CTM Admin",
          authorEmail: "admin@store.com",
          categoryId: "general",
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          updatedAt: new Date(Date.now() - 86400000).toISOString(),
          replies: 3,
          views: 45,
          likes: 8,
          isPinned: true,
          tags: ["welcome", "introduction", "community"],
          status: "active",
        },
        {
          id: "post-2",
          title: "Installation Guide: CTM-X Series Setup",
          content:
            "Here's a comprehensive guide for installing CTM-X series parts. Follow these steps for optimal performance and reliability.",
          author: "TechExpert",
          authorEmail: "tech@example.com",
          categoryId: "installation-help",
          createdAt: new Date(Date.now() - 172800000).toISOString(),
          updatedAt: new Date(Date.now() - 172800000).toISOString(),
          replies: 5,
          views: 89,
          likes: 12,
          isPinned: false,
          tags: ["installation", "ctm-x", "guide"],
          status: "active",
        },
        {
          id: "post-3",
          title: "My Custom Build with CTM Parts",
          content:
            "Just finished my latest project using CTM parts. Here are some photos and details about the build process.",
          author: "BuilderPro",
          authorEmail: "builder@example.com",
          categoryId: "project-showcase",
          createdAt: new Date(Date.now() - 259200000).toISOString(),
          updatedAt: new Date(Date.now() - 259200000).toISOString(),
          replies: 7,
          views: 156,
          likes: 23,
          isPinned: false,
          tags: ["showcase", "custom", "build"],
          status: "active",
        },
      ]

      // Create sample replies
      const defaultReplies: Reply[] = [
        {
          id: "reply-1",
          postId: "post-1",
          content: "Thank you for the warm welcome! I'm excited to be part of the CTM Parts community.",
          author: "NewMember",
          authorEmail: "newmember@example.com",
          createdAt: new Date(Date.now() - 64800000).toISOString(),
          updatedAt: new Date(Date.now() - 64800000).toISOString(),
          likes: 3,
          status: "active",
        },
        {
          id: "reply-2",
          postId: "post-1",
          content: "Great to see the community growing! Looking forward to sharing my projects.",
          author: "ProjectMaker",
          authorEmail: "maker@example.com",
          createdAt: new Date(Date.now() - 43200000).toISOString(),
          updatedAt: new Date(Date.now() - 43200000).toISOString(),
          likes: 2,
          status: "active",
        },
        {
          id: "reply-3",
          postId: "post-2",
          content: "This guide was exactly what I needed! Installation went smoothly.",
          author: "HappyCustomer",
          authorEmail: "customer@example.com",
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          updatedAt: new Date(Date.now() - 86400000).toISOString(),
          likes: 5,
          status: "active",
        },
      ]

      // Create default users
      const defaultUsers: User[] = [
        {
          id: "admin-user",
          username: "ctm_admin",
          name: "CTM Administrator",
          email: "admin@store.com",
          password: "admin123", // Should be hashed in production
          role: "admin",
          createdAt: new Date().toISOString(),
          isActive: true,
          lastActive: new Date().toISOString(),
        },
        {
          id: "tech-expert",
          username: "tech_expert",
          name: "Technical Expert",
          email: "tech@example.com",
          password: "tech123",
          role: "moderator",
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          isActive: true,
          lastActive: new Date(Date.now() - 3600000).toISOString(),
        },
        {
          id: "builder-pro",
          username: "builder_pro",
          name: "Builder Pro",
          email: "builder@example.com",
          password: "builder123",
          role: "user",
          createdAt: new Date(Date.now() - 172800000).toISOString(),
          isActive: true,
          lastActive: new Date(Date.now() - 7200000).toISOString(),
        },
        {
          id: "new-member",
          username: "new_member",
          name: "New Member",
          email: "newmember@example.com",
          password: "member123",
          role: "user",
          createdAt: new Date(Date.now() - 259200000).toISOString(),
          isActive: true,
          lastActive: new Date(Date.now() - 1800000).toISOString(),
        },
      ]

      // Save to KV store
      await kv.set(this.CATEGORIES_KEY, defaultCategories)
      await kv.set(this.POSTS_KEY, defaultPosts)
      await kv.set(this.REPLIES_KEY, defaultReplies)
      await kv.set(this.USERS_KEY, defaultUsers)
      await kv.set(this.INITIALIZED_KEY, true)

      console.log("✅ CTM Parts Community forum initialized successfully")
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

  async updateCategory(categoryId: string, updates: Partial<Category>): Promise<Category | null> {
    try {
      const categories = await this.getCategories()
      const categoryIndex = categories.findIndex((cat) => cat.id === categoryId)

      if (categoryIndex === -1) {
        console.warn(`⚠️ Category not found for update: ${categoryId}`)
        return null
      }

      categories[categoryIndex] = { ...categories[categoryIndex], ...updates }
      await kv.set(this.CATEGORIES_KEY, categories)

      console.log(`✅ Category ${categoryId} updated successfully`)
      return categories[categoryIndex]
    } catch (error) {
      console.error(`Error updating category ${categoryId}:`, error)
      return null
    }
  }

  async deleteCategory(categoryId: string): Promise<boolean> {
    try {
      const categories = await this.getCategories()
      const updatedCategories = categories.filter((cat) => cat.id !== categoryId)
      await kv.set(this.CATEGORIES_KEY, updatedCategories)

      console.log(`✅ Category ${categoryId} deleted from persistent store`)
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

      await kv.set(this.POSTS_KEY, posts)
      console.log(`✅ Post ${postId} deleted and saved`)
      return true
    } catch (error) {
      console.error("Error deleting post:", error)
      return false
    }
  }

  async incrementPostViews(postId: string): Promise<Post | null> {
    try {
      const posts = (await kv.get<Post[]>(this.POSTS_KEY)) || []
      const postIndex = posts.findIndex((p) => p.id === postId && p.status === "active")

      if (postIndex === -1) return null

      posts[postIndex].views = (posts[postIndex].views || 0) + 1
      posts[postIndex].updatedAt = new Date().toISOString()

      await kv.set(this.POSTS_KEY, posts)
      return posts[postIndex]
    } catch (error) {
      console.error(`Error incrementing views for post ${postId}:`, error)
      return null
    }
  }

  async likePost(postId: string): Promise<{ likes: number } | null> {
    try {
      const posts = (await kv.get<Post[]>(this.POSTS_KEY)) || []
      const postIndex = posts.findIndex((p) => p.id === postId && p.status === "active")

      if (postIndex === -1) return null

      posts[postIndex].likes = (posts[postIndex].likes || 0) + 1
      posts[postIndex].updatedAt = new Date().toISOString()

      await kv.set(this.POSTS_KEY, posts)
      return { likes: posts[postIndex].likes }
    } catch (error) {
      console.error(`Error liking post ${postId}:`, error)
      return null
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

  async likeReply(replyId: string): Promise<{ likes: number } | null> {
    try {
      const replies = (await kv.get<Reply[]>(this.REPLIES_KEY)) || []
      const replyIndex = replies.findIndex((r) => r.id === replyId && r.status === "active")

      if (replyIndex === -1) return null

      replies[replyIndex].likes = (replies[replyIndex].likes || 0) + 1
      replies[replyIndex].updatedAt = new Date().toISOString()

      await kv.set(this.REPLIES_KEY, replies)
      return { likes: replies[replyIndex].likes }
    } catch (error) {
      console.error(`Error liking reply ${replyId}:`, error)
      return null
    }
  }

  async deleteReply(replyId: string, userEmail: string): Promise<boolean> {
    try {
      const replies = (await kv.get<Reply[]>(this.REPLIES_KEY)) || []
      const replyIndex = replies.findIndex((r) => r.id === replyId)

      if (replyIndex === -1) {
        console.warn(`⚠️ Reply not found for deletion: ${replyId}`)
        return false
      }

      const reply = replies[replyIndex]

      // Check permissions
      if (reply.authorEmail !== userEmail && userEmail !== "admin@store.com") {
        console.warn(`⚠️ User ${userEmail} not authorized to delete reply ${replyId}`)
        return false
      }

      // Soft delete
      replies[replyIndex].status = "deleted"
      replies[replyIndex].updatedAt = new Date().toISOString()

      await kv.set(this.REPLIES_KEY, replies)
      console.log(`✅ Reply ${replyId} deleted and saved`)
      return true
    } catch (error) {
      console.error(`Error deleting reply ${replyId}:`, error)
      return false
    }
  }

  // Users
  async getUsers(): Promise<User[]> {
    try {
      await this.initialize()
      const users = await kv.get<User[]>(this.USERS_KEY)
      return users || []
    } catch (error) {
      console.error("Error getting users:", error)
      return []
    }
  }

  async getUserById(id: string): Promise<User | null> {
    try {
      const users = await this.getUsers()
      return users.find((user) => user.id === id) || null
    } catch (error) {
      console.error("Error getting user by ID:", error)
      return null
    }
  }

  async getUserByEmail(email: string): Promise<User | null> {
    try {
      const users = await this.getUsers()
      return users.find((user) => user.email === email) || null
    } catch (error) {
      console.error("Error getting user by email:", error)
      return null
    }
  }

  async getUserByUsername(username: string): Promise<User | null> {
    try {
      const users = await this.getUsers()
      return users.find((user) => user.username === username) || null
    } catch (error) {
      console.error("Error getting user by username:", error)
      return null
    }
  }

  async addUser(data: Omit<User, "id" | "createdAt">): Promise<User> {
    try {
      const users = await this.getUsers()
      const user: User = {
        id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date().toISOString(),
        isActive: true,
        ...data,
      }

      users.push(user)
      await kv.set(this.USERS_KEY, users)

      console.log("✅ User created and saved:", user.email)
      return user
    } catch (error) {
      console.error("Error creating user:", error)
      throw error
    }
  }

  async updateUser(userId: string, updates: Partial<User>): Promise<User | null> {
    try {
      const users = await this.getUsers()
      const userIndex = users.findIndex((user) => user.id === userId)

      if (userIndex === -1) {
        console.warn(`⚠️ User not found for update: ${userId}`)
        return null
      }

      users[userIndex] = { ...users[userIndex], ...updates }
      await kv.set(this.USERS_KEY, users)

      console.log(`✅ User ${userId} updated successfully`)
      return users[userIndex]
    } catch (error) {
      console.error(`Error updating user ${userId}:`, error)
      return null
    }
  }

  // Stats
  async getStats() {
    try {
      const categories = await this.getCategories()
      const posts = await this.getPosts()
      const replies = (await kv.get<Reply[]>(this.REPLIES_KEY)) || []
      const users = await this.getUsers()
      const activeReplies = replies.filter((r) => r.status === "active")

      return {
        totalCategories: categories.length,
        totalPosts: posts.length,
        totalReplies: activeReplies.length,
        totalUsers: users.length,
        activeToday: Math.ceil(users.length * 0.3), // 30% of users active today
        onlineUsers: Math.ceil(users.length * 0.1), // 10% of users online now
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
      await kv.del(this.USERS_KEY)
      await kv.del(this.INITIALIZED_KEY)

      console.log("✅ All forum data cleared from persistent storage")
      return true
    } catch (error) {
      console.error("Error clearing data:", error)
      return false
    }
  }

  // For debugging - get all data including deleted items
  async getAllDataWithDeleted() {
    try {
      const categories = (await kv.get<Category[]>(this.CATEGORIES_KEY)) || []
      const posts = (await kv.get<Post[]>(this.POSTS_KEY)) || []
      const replies = (await kv.get<Reply[]>(this.REPLIES_KEY)) || []
      const users = (await kv.get<User[]>(this.USERS_KEY)) || []
      const initialized = await kv.get(this.INITIALIZED_KEY)

      return {
        categories,
        posts,
        replies,
        users,
        initialized,
      }
    } catch (error) {
      console.error("Error getting all data:", error)
      return {
        categories: [],
        posts: [],
        replies: [],
        users: [],
        initialized: false,
      }
    }
  }

  // Force reinitialization
  async forceReinitialize(): Promise<boolean> {
    try {
      await kv.del(this.INITIALIZED_KEY)
      await this.initialize()
      return true
    } catch (error) {
      console.error("Error reinitializing:", error)
      return false
    }
  }
}

// Export singleton instance
export const persistentForumDataStore = new PersistentForumDataStore()
