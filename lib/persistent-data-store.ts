import { kv } from "@vercel/kv"
import * as crypto from "crypto"

// Simple hash function
function simpleHash(str: string): string {
  return crypto.createHash("sha256").update(str).digest("hex")
}

interface User {
  id: string
  username: string
  name: string
  email: string
  password: string
  role: "admin" | "user" | "moderator"
  isActive: boolean
  createdAt: string
  lastActive: string
  emailVerified?: boolean
  resetToken?: string
  resetTokenExpiry?: string
  securityQuestions?: Array<{
    question: string
    answer: string
  }>
}

interface Meet {
  id: string
  title: string
  description: string
  organizer: string
  organizerEmail: string
  date: string
  time: string
  location: string
  address?: string
  vehicleTypes: string[]
  maxAttendees?: number
  contactInfo?: string
  requirements?: string
  status: "upcoming" | "completed" | "cancelled"
  attendees: Array<{
    userId: string
    userName: string
    userEmail: string
    rsvpDate: string
  }>
  createdAt: string
  updatedAt: string
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
  status: "active" | "deleted"
}

interface Category {
  id: string
  name: string
  description: string
  color: string
  createdAt: string
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
  status: string
}

interface Group {
  id: string
  name: string
  description: string
  category: string
  location?: string
  maxMembers?: number
  requirements?: string
  creatorEmail: string
  creatorName: string
  members: Array<{
    email: string
    name: string
    joinedAt: string
  }>
  createdAt: string
  updatedAt: string
}

class PersistentDataStore {
  private readonly USERS_KEY = "ctm:users"
  private readonly MEETS_KEY = "ctm:meets"
  private readonly POSTS_KEY = "ctm:posts"
  private readonly CATEGORIES_KEY = "ctm:categories"
  private readonly REPLIES_KEY = "ctm:replies"
  private readonly GROUPS_KEY = "ctm:groups"
  private readonly INIT_KEY = "ctm:initialized"
  private readonly RESET_TOKENS_KEY = "ctm:reset_tokens"

  private memoryStore: Map<string, any> = new Map()
  private useMemory = false
  private initialized = false

  private data: { [key: string]: any } = {}

  private async getStore() {
    if (this.useMemory) {
      return {
        get: async (key: string) => this.memoryStore.get(key),
        set: async (key: string, value: any) => {
          this.memoryStore.set(key, value)
          console.log(`💾 Memory store: Set ${key}`)
        },
        del: async (key: string) => this.memoryStore.delete(key),
        ping: async () => "PONG",
      }
    }

    try {
      // Check if KV is available
      if (!process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN) {
        console.warn("⚠️ KV environment variables not found, using memory store")
        this.useMemory = true
        return this.getStore()
      }

      // Test KV connection
      await kv.ping()
      console.log("✅ KV connection successful")
      return kv
    } catch (error) {
      console.warn("⚠️ KV connection failed, using memory store:", error)
      this.useMemory = true
      return this.getStore()
    }
  }

  async isInitialized(): Promise<boolean> {
    try {
      if (this.initialized) return true

      const store = await this.getStore()
      const init = await store.get(this.INIT_KEY)
      this.initialized = init === true
      return this.initialized
    } catch (error) {
      console.error("Error checking initialization:", error)
      return false
    }
  }

  async initialize(): Promise<boolean> {
    try {
      console.log("🔄 Initializing data store...")

      if (await this.isInitialized()) {
        console.log("✅ Already initialized")
        return true
      }

      const store = await this.getStore()

      // Create default admin user with proper hashing
      const adminUser: User = {
        id: "admin-1",
        username: "admin",
        name: "Administrator",
        email: "admin@ctmparts.com",
        password: simpleHash("admin123"),
        role: "admin",
        isActive: true,
        createdAt: new Date().toISOString(),
        lastActive: new Date().toISOString(),
        emailVerified: true,
      }

      // Create demo user
      const demoUser: User = {
        id: "demo-1",
        username: "demo",
        name: "Demo User",
        email: "demo@example.com",
        password: simpleHash("demo123"),
        role: "user",
        isActive: true,
        createdAt: new Date().toISOString(),
        lastActive: new Date().toISOString(),
        emailVerified: true,
      }

      // Create default categories
      const categories: Category[] = [
        {
          id: "general",
          name: "General Discussion",
          description: "General topics and discussions about CTM parts",
          color: "#3B82F6",
          createdAt: new Date().toISOString(),
        },
        {
          id: "installation",
          name: "Installation Help",
          description: "Get help with installing CTM parts",
          color: "#10B981",
          createdAt: new Date().toISOString(),
        },
        {
          id: "showcase",
          name: "Project Showcase",
          description: "Show off your CTM parts projects",
          color: "#F59E0B",
          createdAt: new Date().toISOString(),
        },
        {
          id: "troubleshooting",
          name: "Troubleshooting",
          description: "Get help troubleshooting issues",
          color: "#EF4444",
          createdAt: new Date().toISOString(),
        },
      ]

      // Create sample posts
      const posts: Post[] = [
        {
          id: "post-1",
          title: "Welcome to CTM Parts Community!",
          content:
            "Welcome to our community forum! This is your place to get help, share projects, and connect with other CTM parts enthusiasts.",
          author: "Administrator",
          authorEmail: "admin@ctmparts.com",
          categoryId: "general",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          replies: 0,
          views: 0,
          likes: 0,
          status: "active",
        },
      ]

      // Create sample groups
      const groups: Group[] = [
        {
          id: "group-1",
          name: "Truck Enthusiasts",
          description: "A group for truck lovers to share ideas and modifications",
          category: "trucks",
          location: "National",
          creatorEmail: "admin@ctmparts.com",
          creatorName: "Administrator",
          members: [
            {
              email: "admin@ctmparts.com",
              name: "Administrator",
              joinedAt: new Date().toISOString(),
            },
          ],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "group-2",
          name: "Classic Car Restoration",
          description: "Discussing classic car restoration techniques and parts",
          category: "classic",
          location: "National",
          creatorEmail: "demo@example.com",
          creatorName: "Demo User",
          members: [
            {
              email: "demo@example.com",
              name: "Demo User",
              joinedAt: new Date().toISOString(),
            },
          ],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ]

      // Save all data
      await store.set(this.USERS_KEY, [adminUser, demoUser])
      await store.set(this.CATEGORIES_KEY, categories)
      await store.set(this.POSTS_KEY, posts)
      await store.set(this.MEETS_KEY, [])
      await store.set(this.REPLIES_KEY, [])
      await store.set(this.GROUPS_KEY, groups)
      await store.set(this.INIT_KEY, true)

      this.initialized = true

      console.log("✅ Data store initialized successfully")
      console.log("👤 Default users created:")
      console.log("   - admin / admin123 (Administrator)")
      console.log("   - demo / demo123 (Demo User)")

      if (this.useMemory) {
        console.log("⚠️ Using memory storage - data will be lost on restart")
      }

      return true
    } catch (error) {
      console.error("❌ Failed to initialize data store:", error)
      return false
    }
  }

  async forceReinitialize(): Promise<boolean> {
    try {
      await this.clearAllData()
      return await this.initialize()
    } catch (error) {
      console.error("Error reinitializing data store:", error)
      return false
    }
  }

  async clearAllData(): Promise<void> {
    try {
      const store = await this.getStore()
      await store.del(this.USERS_KEY)
      await store.del(this.MEETS_KEY)
      await store.del(this.POSTS_KEY)
      await store.del(this.CATEGORIES_KEY)
      await store.del(this.REPLIES_KEY)
      await store.del(this.GROUPS_KEY)
      await store.del(this.INIT_KEY)
      this.memoryStore.clear()
      this.initialized = false
      console.log("✅ All data cleared")
    } catch (error) {
      console.error("Error clearing data:", error)
    }
  }

  public set(key: string, value: any): void {
    this.data[key] = value
  }

  public get(key: string): any {
    return this.data[key]
  }

  public delete(key: string): void {
    delete this.data[key]
  }

  public clear(): void {
    this.data = {}
  }

  public has(key: string): boolean {
    return this.data.hasOwnProperty(key)
  }

  public getAll(): { [key: string]: any } {
    return { ...this.data } // Return a copy to prevent direct modification
  }

  // User methods
  async getUsers(): Promise<User[]> {
    try {
      await this.ensureInitialized()
      const store = await this.getStore()
      const users = await store.get(this.USERS_KEY)
      return users || []
    } catch (error) {
      console.error("Error getting users:", error)
      return []
    }
  }

  async getUserByEmail(email: string): Promise<User | null> {
    try {
      const users = await this.getUsers()
      const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase())
      return user || null
    } catch (error) {
      console.error("Error getting user by email:", error)
      return null
    }
  }

  async getUserWithSecurityQuestions(username: string): Promise<User | null> {
    try {
      const users = await this.getUsers()
      const user = users.find((u) => u.username.toLowerCase() === username.toLowerCase())
      return user || null
    } catch (error) {
      console.error("Error getting user with security questions:", error)
      return null
    }
  }

  async verifySecurityAnswers(
    username: string,
    answers: Array<{ question: string; answer: string }>,
  ): Promise<boolean> {
    try {
      const user = await this.getUserWithSecurityQuestions(username)
      if (!user || !user.securityQuestions) {
        return false
      }

      // Hash the provided answers for comparison
      const hashedAnswers = answers.map((a) => ({
        question: a.question,
        answer: crypto.createHash("sha256").update(a.answer.toLowerCase().trim()).digest("hex"),
      }))

      // Check if all answers match
      for (const providedAnswer of hashedAnswers) {
        const matchingQuestion = user.securityQuestions.find((sq) => sq.question === providedAnswer.question)
        if (!matchingQuestion || matchingQuestion.answer !== providedAnswer.answer) {
          return false
        }
      }

      return true
    } catch (error) {
      console.error("Error verifying security answers:", error)
      return false
    }
  }

  // Category methods
  async getCategories(): Promise<Category[]> {
    try {
      await this.ensureInitialized()
      const store = await this.getStore()
      const categories = await store.get(this.CATEGORIES_KEY)
      return categories || []
    } catch (error) {
      console.error("Error getting categories:", error)
      return []
    }
  }

  // Post methods
  async getPosts(): Promise<Post[]> {
    try {
      await this.ensureInitialized()
      const store = await this.getStore()
      const posts = await store.get(this.POSTS_KEY)
      return ((posts || []) as Post[]).filter((p) => p.status === "active")
    } catch (error) {
      console.error("Error getting posts:", error)
      return []
    }
  }

  async deletePost(postId: string, userEmail: string): Promise<boolean> {
    try {
      const store = await this.getStore()
      const posts = await this.getPosts()
      const postIndex = posts.findIndex((p) => p.id === postId)

      if (postIndex === -1) return false

      // Check if user has permission (post author or admin)
      const post = posts[postIndex]
      if (post.authorEmail !== userEmail) {
        // Check if user is admin
        const user = await this.getUserByEmail(userEmail)
        if (!user || user.role !== "admin") {
          return false
        }
      }

      posts[postIndex].status = "deleted"
      await store.set(this.POSTS_KEY, posts)

      console.log("✅ Post deleted:", postId)
      return true
    } catch (error) {
      console.error("Error deleting post:", error)
      return false
    }
  }

  // Reply methods
  async getRepliesByPostId(postId: string): Promise<Reply[]> {
    try {
      await this.ensureInitialized()
      const store = await this.getStore()
      const replies = await store.get(this.REPLIES_KEY)

      // If no postId provided, return all replies
      if (!postId) {
        return ((replies || []) as Reply[]).filter((r) => r.status === "active")
      }

      return ((replies || []) as Reply[]).filter((r) => r.postId === postId && r.status === "active")
    } catch (error) {
      console.error("Error getting replies:", error)
      return []
    }
  }

  async deleteReply(replyId: string, userEmail: string): Promise<boolean> {
    try {
      const store = await this.getStore()
      const replies = (await store.get(this.REPLIES_KEY)) || []
      const replyIndex = replies.findIndex((r: Reply) => r.id === replyId)

      if (replyIndex === -1) return false

      // Check if user has permission (reply author or admin)
      const reply = replies[replyIndex]
      if (reply.authorEmail !== userEmail) {
        // Check if user is admin
        const user = await this.getUserByEmail(userEmail)
        if (!user || user.role !== "admin") {
          return false
        }
      }

      replies[replyIndex].status = "deleted"
      await store.set(this.REPLIES_KEY, replies)

      console.log("✅ Reply deleted:", replyId)
      return true
    } catch (error) {
      console.error("Error deleting reply:", error)
      return false
    }
  }

  async likeReply(replyId: string, userEmail?: string): Promise<{ likes: number } | null> {
    try {
      const store = await this.getStore()
      const replies = (await store.get(this.REPLIES_KEY)) || []
      const replyIndex = replies.findIndex((r: Reply) => r.id === replyId)

      if (replyIndex === -1) return null

      replies[replyIndex].likes = (replies[replyIndex].likes || 0) + 1
      await store.set(this.REPLIES_KEY, replies)

      console.log("✅ Reply liked:", replyId)
      return { likes: replies[replyIndex].likes }
    } catch (error) {
      console.error("Error liking reply:", error)
      return null
    }
  }

  async getPostById(id: string): Promise<Post | null> {
    try {
      const posts = await this.getPosts()
      return posts.find((p) => p.id === id) || null
    } catch (error) {
      console.error("Error getting post by ID:", error)
      return null
    }
  }

  async getCategoryById(id: string): Promise<Category | null> {
    try {
      const categories = await this.getCategories()
      return categories.find((c) => c.id === id) || null
    } catch (error) {
      console.error("Error getting category by ID:", error)
      return null
    }
  }

  async incrementPostViews(postId: string): Promise<Post | null> {
    try {
      const store = await this.getStore()
      const posts = await store.get(this.POSTS_KEY)
      const allPosts = posts || []
      const postIndex = allPosts.findIndex((p: Post) => p.id === postId)

      if (postIndex === -1) return null

      allPosts[postIndex].views = (allPosts[postIndex].views || 0) + 1
      await store.set(this.POSTS_KEY, allPosts)
      return allPosts[postIndex]
    } catch (error) {
      console.error("Error incrementing post views:", error)
      return null
    }
  }

  async likePost(postId: string, userEmail?: string): Promise<{ likes: number } | null> {
    try {
      const store = await this.getStore()
      const posts = await store.get(this.POSTS_KEY)
      const allPosts = posts || []
      const postIndex = allPosts.findIndex((p: Post) => p.id === postId)

      if (postIndex === -1) return null

      allPosts[postIndex].likes = (allPosts[postIndex].likes || 0) + 1
      await store.set(this.POSTS_KEY, allPosts)
      return { likes: allPosts[postIndex].likes }
    } catch (error) {
      console.error("Error liking post:", error)
      return null
    }
  }

  async createPost(
    postData: Omit<Post, "id" | "createdAt" | "updatedAt" | "replies" | "views" | "likes" | "status">,
  ): Promise<Post> {
    try {
      const store = await this.getStore()
      const posts = await store.get(this.POSTS_KEY)
      const allPosts = posts || []

      const post: Post = {
        ...postData,
        id: `post-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        replies: 0,
        views: 0,
        likes: 0,
        status: "active",
      }

      allPosts.push(post)
      await store.set(this.POSTS_KEY, allPosts)

      console.log("✅ Post created:", post.title)
      return post
    } catch (error) {
      console.error("Error creating post:", error)
      throw error
    }
  }

  async addReply(replyData: Omit<Reply, "id" | "createdAt" | "updatedAt" | "likes" | "status">): Promise<Reply> {
    try {
      const store = await this.getStore()
      const replies = (await store.get(this.REPLIES_KEY)) || []

      const reply: Reply = {
        ...replyData,
        id: `reply-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        likes: 0,
        status: "active",
      }

      replies.push(reply)
      await store.set(this.REPLIES_KEY, replies)

      // Update post reply count
      const posts = await store.get(this.POSTS_KEY)
      const allPosts = posts || []
      const postIndex = allPosts.findIndex((p: Post) => p.id === replyData.postId)
      if (postIndex !== -1) {
        allPosts[postIndex].replies++
        await store.set(this.POSTS_KEY, allPosts)
      }

      console.log("✅ Reply added to post:", replyData.postId)
      return reply
    } catch (error) {
      console.error("Error adding reply:", error)
      throw error
    }
  }

  async getUserByUsername(username: string): Promise<User | null> {
    try {
      const users = await this.getUsers()
      const user = users.find((u) => u.username.toLowerCase() === username.toLowerCase())
      console.log(`🔍 Looking for user '${username}':`, user ? "Found" : "Not found")
      return user || null
    } catch (error) {
      console.error("Error getting user by username:", error)
      return null
    }
  }

  async getUserById(id: string): Promise<User | null> {
    try {
      const users = await this.getUsers()
      return users.find((u) => u.id === id) || null
    } catch (error) {
      console.error("Error getting user by ID:", error)
      return null
    }
  }

  async addUser(userData: Omit<User, "id" | "createdAt" | "lastActive">): Promise<User> {
    try {
      await this.ensureInitialized()
      const store = await this.getStore()
      const users = await this.getUsers()

      const user: User = {
        ...userData,
        id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date().toISOString(),
        lastActive: new Date().toISOString(),
      }

      users.push(user)
      await store.set(this.USERS_KEY, users)

      console.log("✅ User created:", user.username)
      return user
    } catch (error) {
      console.error("Error creating user:", error)
      throw error
    }
  }

  async updateUser(userId: string, updates: Partial<User>): Promise<User | null> {
    try {
      const store = await this.getStore()
      const users = await this.getUsers()
      const index = users.findIndex((u) => u.id === userId)

      if (index === -1) {
        console.warn(`User not found: ${userId}`)
        return null
      }

      users[index] = { ...users[index], ...updates }
      await store.set(this.USERS_KEY, users)

      console.log("✅ User updated:", users[index].username)
      return users[index]
    } catch (error) {
      console.error("Error updating user:", error)
      return null
    }
  }

  async storePasswordResetToken(userId: string, token: string, expiry: string): Promise<boolean> {
    try {
      const store = await this.getStore()
      const tokens = (await store.get(this.RESET_TOKENS_KEY)) || {}

      tokens[token] = {
        userId,
        expiry,
        createdAt: new Date().toISOString(),
      }

      await store.set(this.RESET_TOKENS_KEY, tokens)
      console.log("✅ Password reset token stored for user:", userId)
      return true
    } catch (error) {
      console.error("Error storing password reset token:", error)
      return false
    }
  }

  async verifyPasswordResetToken(token: string): Promise<{ userId: string } | null> {
    try {
      const store = await this.getStore()
      const tokens = (await store.get(this.RESET_TOKENS_KEY)) || {}
      const tokenData = tokens[token]

      if (!tokenData) {
        console.log("❌ Reset token not found:", token)
        return null
      }

      // Check if token has expired
      const expiry = new Date(tokenData.expiry)
      const now = new Date()

      if (now > expiry) {
        console.log("❌ Reset token expired:", token)
        // Clean up expired token
        delete tokens[token]
        await store.set(this.RESET_TOKENS_KEY, tokens)
        return null
      }

      console.log("✅ Reset token verified for user:", tokenData.userId)
      return { userId: tokenData.userId }
    } catch (error) {
      console.error("Error verifying password reset token:", error)
      return null
    }
  }

  async invalidatePasswordResetToken(token: string): Promise<boolean> {
    try {
      const store = await this.getStore()
      const tokens = (await store.get(this.RESET_TOKENS_KEY)) || {}

      if (tokens[token]) {
        delete tokens[token]
        await store.set(this.RESET_TOKENS_KEY, tokens)
        console.log("✅ Password reset token invalidated:", token)
        return true
      }

      return false
    } catch (error) {
      console.error("Error invalidating password reset token:", error)
      return false
    }
  }

  // Stats methods
  async getStats(): Promise<any> {
    try {
      await this.ensureInitialized()

      const users = await this.getUsers()
      const posts = await this.getPosts()
      const categories = await this.getCategories()
      const replies = await this.getRepliesByPostId("") // Get all replies

      // Calculate stats
      const now = new Date()
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)

      // Active users today (users with lastActive today)
      const activeToday = users.filter((user) => {
        const lastActive = new Date(user.lastActive)
        return lastActive >= today
      }).length

      // Posts this month
      const postsThisMonth = posts.filter((post) => {
        const postDate = new Date(post.createdAt)
        return postDate >= thisMonth
      }).length

      // New users this month
      const newUsersThisMonth = users.filter((user) => {
        const userDate = new Date(user.createdAt)
        return userDate >= thisMonth
      }).length

      // Top categories by post count
      const categoryStats = categories
        .map((category) => {
          const categoryPosts = posts.filter((post) => post.categoryId === category.id)
          return {
            id: category.id,
            name: category.name,
            posts: categoryPosts.length,
          }
        })
        .sort((a, b) => b.posts - a.posts)
        .slice(0, 5)

      // Recent activity (last 10 posts)
      const recentActivity = posts
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 10)
        .map((post) => ({
          id: post.id,
          type: "post",
          title: post.title,
          author: post.author,
          timestamp: post.createdAt,
          categoryId: post.categoryId,
        }))

      const stats = {
        totalPosts: posts.length,
        totalUsers: users.length,
        totalCategories: categories.length,
        activeToday,
        postsThisMonth,
        newUsersThisMonth,
        topCategories: categoryStats,
        recentActivity,
        onlineUsers: activeToday, // Alias for compatibility
      }

      console.log("📊 Generated stats:", stats)
      return stats
    } catch (error) {
      console.error("Error generating stats:", error)
      return {
        totalPosts: 0,
        totalUsers: 0,
        totalCategories: 0,
        activeToday: 0,
        postsThisMonth: 0,
        newUsersThisMonth: 0,
        topCategories: [],
        recentActivity: [],
        onlineUsers: 0,
      }
    }
  }

  // Group methods
  async getGroups(): Promise<Group[]> {
    try {
      await this.ensureInitialized()
      const store = await this.getStore()
      const groups = await store.get(this.GROUPS_KEY)
      return groups || []
    } catch (error) {
      console.error("Error getting groups:", error)
      return []
    }
  }

  async getGroupById(id: string): Promise<Group | null> {
    try {
      const groups = await this.getGroups()
      return groups.find((g) => g.id === id) || null
    } catch (error) {
      console.error("Error getting group by ID:", error)
      return null
    }
  }

  async createGroup(groupData: Omit<Group, "id" | "members" | "createdAt" | "updatedAt">): Promise<Group> {
    try {
      await this.ensureInitialized()
      const store = await this.getStore()
      const groups = await this.getGroups()

      const group: Group = {
        ...groupData,
        id: `group-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        members: [
          {
            email: groupData.creatorEmail,
            name: groupData.creatorName,
            joinedAt: new Date().toISOString(),
          },
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      groups.push(group)
      await store.set(this.GROUPS_KEY, groups)

      console.log("✅ Group created:", group.name)
      return group
    } catch (error) {
      console.error("Error creating group:", error)
      throw error
    }
  }

  async joinGroup(groupId: string, userEmail: string, userName: string): Promise<Group | null> {
    try {
      const store = await this.getStore()
      const groups = await this.getGroups()
      const groupIndex = groups.findIndex((g) => g.id === groupId)

      if (groupIndex === -1) {
        console.warn(`Group not found: ${groupId}`)
        return null
      }

      const group = groups[groupIndex]

      // Check if user is already a member
      if (group.members.some((m) => m.email === userEmail)) {
        console.warn(`User ${userEmail} is already a member of group ${groupId}`)
        return group
      }

      // Check if group is at capacity
      if (group.maxMembers && group.members.length >= group.maxMembers) {
        console.warn(`Group ${groupId} is at capacity`)
        return null
      }

      // Add user to group
      group.members.push({
        email: userEmail,
        name: userName,
        joinedAt: new Date().toISOString(),
      })

      group.updatedAt = new Date().toISOString()
      groups[groupIndex] = group
      await store.set(this.GROUPS_KEY, groups)

      console.log(`✅ User ${userEmail} joined group ${group.name}`)
      return group
    } catch (error) {
      console.error("Error joining group:", error)
      return null
    }
  }

  async leaveGroup(groupId: string, userEmail: string): Promise<Group | null> {
    try {
      const store = await this.getStore()
      const groups = await this.getGroups()
      const groupIndex = groups.findIndex((g) => g.id === groupId)

      if (groupIndex === -1) {
        console.warn(`Group not found: ${groupId}`)
        return null
      }

      const group = groups[groupIndex]

      // Check if user is a member
      const memberIndex = group.members.findIndex((m) => m.email === userEmail)
      if (memberIndex === -1) {
        console.warn(`User ${userEmail} is not a member of group ${groupId}`)
        return null
      }

      // Check if user is the creator (cannot leave if creator)
      if (group.creatorEmail === userEmail) {
        console.warn(`Creator ${userEmail} cannot leave group ${groupId}`)
        return null
      }

      // Remove user from group
      group.members.splice(memberIndex, 1)
      group.updatedAt = new Date().toISOString()
      groups[groupIndex] = group
      await store.set(this.GROUPS_KEY, groups)

      console.log(`✅ User ${userEmail} left group ${group.name}`)
      return group
    } catch (error) {
      console.error("Error leaving group:", error)
      return null
    }
  }

  // Meet methods
  async getMeets(): Promise<Meet[]> {
    try {
      await this.ensureInitialized()
      const store = await this.getStore()
      const meets = await store.get(this.MEETS_KEY)
      return meets || []
    } catch (error) {
      console.error("Error getting meets:", error)
      return []
    }
  }

  async getMeetById(id: string): Promise<Meet | null> {
    try {
      const meets = await this.getMeets()
      return meets.find((m) => m.id === id) || null
    } catch (error) {
      console.error("Error getting meet by ID:", error)
      return null
    }
  }

  async createMeet(meetData: Omit<Meet, "id" | "attendees" | "createdAt" | "updatedAt">): Promise<Meet> {
    try {
      await this.ensureInitialized()
      const store = await this.getStore()
      const meets = await this.getMeets()

      const meet: Meet = {
        ...meetData,
        id: `meet-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        attendees: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      meets.push(meet)
      await store.set(this.MEETS_KEY, meets)

      console.log("✅ Meet created:", meet.title)
      return meet
    } catch (error) {
      console.error("Error creating meet:", error)
      throw error
    }
  }

  async rsvpToMeet(meetId: string, userEmail: string, userName: string): Promise<Meet | null> {
    try {
      const store = await this.getStore()
      const meets = await this.getMeets()
      const meetIndex = meets.findIndex((m) => m.id === meetId)

      if (meetIndex === -1) {
        console.warn(`Meet not found: ${meetId}`)
        return null
      }

      const meet = meets[meetIndex]

      // Check if user is already attending
      if (meet.attendees.some((a) => a.userEmail === userEmail)) {
        console.warn(`User ${userEmail} is already attending meet ${meetId}`)
        return meet
      }

      // Check if meet is at capacity
      if (meet.maxAttendees && meet.attendees.length >= meet.maxAttendees) {
        console.warn(`Meet ${meetId} is at capacity`)
        return null
      }

      // Add user to attendees
      meet.attendees.push({
        userId: `user-${userEmail}`,
        userName: userName,
        userEmail: userEmail,
        rsvpDate: new Date().toISOString(),
      })

      meet.updatedAt = new Date().toISOString()
      meets[meetIndex] = meet
      await store.set(this.MEETS_KEY, meets)

      console.log(`✅ User ${userEmail} RSVP'd to meet ${meet.title}`)
      return meet
    } catch (error) {
      console.error("Error RSVP'ing to meet:", error)
      return null
    }
  }

  async cancelRsvp(meetId: string, userEmail: string): Promise<Meet | null> {
    try {
      const store = await this.getStore()
      const meets = await this.getMeets()
      const meetIndex = meets.findIndex((m) => m.id === meetId)

      if (meetIndex === -1) {
        console.warn(`Meet not found: ${meetId}`)
        return null
      }

      const meet = meets[meetIndex]

      // Check if user is attending
      const attendeeIndex = meet.attendees.findIndex((a) => a.userEmail === userEmail)
      if (attendeeIndex === -1) {
        console.warn(`User ${userEmail} is not attending meet ${meetId}`)
        return null
      }

      // Remove user from attendees
      meet.attendees.splice(attendeeIndex, 1)
      meet.updatedAt = new Date().toISOString()
      meets[meetIndex] = meet
      await store.set(this.MEETS_KEY, meets)

      console.log(`✅ User ${userEmail} cancelled RSVP for meet ${meet.title}`)
      return meet
    } catch (error) {
      console.error("Error cancelling RSVP:", error)
      return null
    }
  }

  // Rewards methods
  async getRewardsSettings(): Promise<any> {
    try {
      await this.ensureInitialized()
      const store = await this.getStore()
      const settings = await store.get("ctm:rewards_settings")

      // Default settings if none exist
      const defaultSettings = {
        pointValues: {
          postCreated: 10,
          replyCreated: 5,
          postLiked: 2,
          replyLiked: 1,
          dailyLogin: 1,
        },
        coupons: {
          "5off": { points: 100, discount: 5, type: "percentage" },
          "10off": { points: 200, discount: 10, type: "percentage" },
          "free-shipping": { points: 150, discount: 0, type: "free_shipping" },
        },
      }

      return settings || defaultSettings
    } catch (error) {
      console.error("Error getting rewards settings:", error)
      return {}
    }
  }

  async updateRewardsSettings(settings: any): Promise<any> {
    try {
      const store = await this.getStore()
      await store.set("ctm:rewards_settings", settings)
      console.log("✅ Rewards settings updated")
      return settings
    } catch (error) {
      console.error("Error updating rewards settings:", error)
      throw error
    }
  }

  async getUserRewards(userId: string): Promise<any> {
    try {
      await this.ensureInitialized()
      const store = await this.getStore()
      const userRewards = await store.get(`ctm:user_rewards:${userId}`)

      const defaultRewards = {
        userId,
        points: 0,
        totalEarned: 0,
        redeemedCoupons: [],
        pointHistory: [],
      }

      return userRewards || defaultRewards
    } catch (error) {
      console.error("Error getting user rewards:", error)
      return { userId, points: 0, totalEarned: 0, redeemedCoupons: [], pointHistory: [] }
    }
  }

  async awardPoints(userId: string, points: number, reason: string, actionType?: string): Promise<any> {
    try {
      const store = await this.getStore()
      const userRewards = await this.getUserRewards(userId)

      userRewards.points += points
      userRewards.totalEarned += points
      userRewards.pointHistory.push({
        points,
        reason,
        actionType,
        timestamp: new Date().toISOString(),
      })

      await store.set(`ctm:user_rewards:${userId}`, userRewards)
      console.log(`✅ Awarded ${points} points to user ${userId} for ${reason}`)
      return userRewards
    } catch (error) {
      console.error("Error awarding points:", error)
      throw error
    }
  }

  async redeemCoupon(userId: string, couponType: string): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const store = await this.getStore()
      const userRewards = await this.getUserRewards(userId)
      const settings = await this.getRewardsSettings()

      const coupon = settings.coupons[couponType]
      if (!coupon) {
        return { success: false, error: "Coupon not found" }
      }

      if (userRewards.points < coupon.points) {
        return { success: false, error: "Insufficient points" }
      }

      // Deduct points
      userRewards.points -= coupon.points
      userRewards.redeemedCoupons.push({
        couponType,
        pointsCost: coupon.points,
        redeemedAt: new Date().toISOString(),
      })

      await store.set(`ctm:user_rewards:${userId}`, userRewards)
      console.log(`✅ User ${userId} redeemed coupon ${couponType}`)

      return { success: true, data: userRewards }
    } catch (error) {
      console.error("Error redeeming coupon:", error)
      return { success: false, error: "Failed to redeem coupon" }
    }
  }

  async getRewardsLeaderboard(limit = 10): Promise<any[]> {
    try {
      await this.ensureInitialized()
      const store = await this.getStore()
      const users = await this.getUsers()

      const leaderboard = []
      for (const user of users) {
        const rewards = await this.getUserRewards(user.id)
        leaderboard.push({
          userId: user.id,
          username: user.username,
          name: user.name,
          points: rewards.points,
          totalEarned: rewards.totalEarned,
        })
      }

      return leaderboard.sort((a, b) => b.totalEarned - a.totalEarned).slice(0, limit)
    } catch (error) {
      console.error("Error getting rewards leaderboard:", error)
      return []
    }
  }

  async getAllUserRewards(): Promise<any[]> {
    try {
      const users = await this.getUsers()
      const allRewards = []

      for (const user of users) {
        const rewards = await this.getUserRewards(user.id)
        allRewards.push({
          ...rewards,
          username: user.username,
          name: user.name,
        })
      }

      return allRewards
    } catch (error) {
      console.error("Error getting all user rewards:", error)
      return []
    }
  }

  // Utility methods
  private async ensureInitialized(): Promise<void> {
    if (!(await this.isInitialized())) {
      await this.initialize()
    }
  }

  // Add this method to the PersistentDataStore class
  async storeUserToken(userId: string, token: string): Promise<boolean> {
    try {
      const store = await this.getStore()
      const tokens = (await store.get("ctm:user_tokens")) || {}

      tokens[userId] = {
        token,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
      }

      await store.set("ctm:user_tokens", tokens)
      console.log("✅ Auth token stored for user:", userId)
      return true
    } catch (error) {
      console.error("Error storing user token:", error)
      return false
    }
  }

  // Add any other methods needed for your application
}

// Create the instance
const persistentDataStoreInstance = new PersistentDataStore()

// Export all the different names that might be used
export const persistentForumDataStore = persistentDataStoreInstance
export const dataStore = persistentDataStoreInstance
export const forumDataStore = persistentDataStoreInstance // Add this export
export { PersistentDataStore } // Export the class itself

// Default export
export default persistentDataStoreInstance
