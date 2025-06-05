import { kv } from "@vercel/kv"
import * as crypto from "crypto"

// Simple hash function for passwords
function hashPassword(password: string): string {
  return crypto
    .createHash("sha256")
    .update(password + "ctm_salt")
    .digest("hex")
}

interface User {
  id: string
  username: string
  email: string
  password: string
  name?: string
  role: "admin" | "user" | "moderator"
  createdAt: string
  lastActive?: string
  isActive: boolean
}

interface Category {
  id: string
  name: string
  description: string
  postCount: number
  createdAt: string
  color?: string
}

interface Post {
  id: string
  title: string
  content: string
  author: string
  authorEmail: string
  authorId: string
  categoryId: string
  createdAt: string
  updatedAt: string
  replies: number
  views: number
  likes: number
  isPinned?: boolean
  tags?: string[]
  status?: string
  likedBy?: string[]
}

interface Reply {
  id: string
  postId: string
  content: string
  author: string
  authorEmail: string
  authorId: string
  createdAt: string
  updatedAt: string
  likes: number
  likedBy?: string[]
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

class PersistentDataStore {
  private kvAvailable = false
  private memoryStore: Map<string, any> = new Map()
  private initPromise: Promise<boolean> | null = null

  constructor() {
    this.checkKVAvailability()
  }

  private async checkKVAvailability() {
    try {
      if (process.env.KV_URL && process.env.KV_REST_API_TOKEN) {
        await kv.ping()
        this.kvAvailable = true
        console.log("✅ Vercel KV is available")
      } else {
        console.log("⚠️ KV environment variables not found, using memory storage")
        this.kvAvailable = false
      }
    } catch (error) {
      console.log("⚠️ KV connection failed, using memory storage:", error)
      this.kvAvailable = false
    }
  }

  private async get(key: string): Promise<any> {
    if (this.kvAvailable) {
      try {
        return await kv.get(key)
      } catch (error) {
        console.error(`Error getting ${key} from KV:`, error)
        return this.memoryStore.get(key)
      }
    }
    return this.memoryStore.get(key)
  }

  private async set(key: string, value: any): Promise<void> {
    if (this.kvAvailable) {
      try {
        await kv.set(key, value)
      } catch (error) {
        console.error(`Error setting ${key} in KV:`, error)
        this.memoryStore.set(key, value)
      }
    } else {
      this.memoryStore.set(key, value)
    }
  }

  private async del(key: string): Promise<void> {
    if (this.kvAvailable) {
      try {
        await kv.del(key)
      } catch (error) {
        console.error(`Error deleting ${key} from KV:`, error)
        this.memoryStore.delete(key)
      }
    } else {
      this.memoryStore.delete(key)
    }
  }

  async isInitialized(): Promise<boolean> {
    try {
      const initialized = await this.get("system:initialized")
      return initialized === true
    } catch (error) {
      console.error("Error checking initialization status:", error)
      return false
    }
  }

  async initialize(): Promise<boolean> {
    // Prevent multiple simultaneous initializations
    if (this.initPromise) {
      return this.initPromise
    }

    this.initPromise = this._doInitialize()
    const result = await this.initPromise
    this.initPromise = null
    return result
  }

  private async _doInitialize(): Promise<boolean> {
    try {
      console.log("🔄 Initializing persistent data store...")

      // Check if already initialized
      if (await this.isInitialized()) {
        console.log("✅ System already initialized")
        return true
      }

      // Create default categories
      const defaultCategories: Category[] = [
        {
          id: "general",
          name: "General Discussion",
          description: "General automotive discussions",
          postCount: 0,
          createdAt: new Date().toISOString(),
          color: "#6B7280",
        },
        {
          id: "trucks",
          name: "Trucks",
          description: "Truck discussions and modifications",
          postCount: 0,
          createdAt: new Date().toISOString(),
          color: "#DC2626",
        },
        {
          id: "cars",
          name: "Cars",
          description: "Car discussions and modifications",
          postCount: 0,
          createdAt: new Date().toISOString(),
          color: "#2563EB",
        },
        {
          id: "maintenance",
          name: "Maintenance & Repair",
          description: "Vehicle maintenance and repair discussions",
          postCount: 0,
          createdAt: new Date().toISOString(),
          color: "#059669",
        },
      ]

      await this.set("forum:categories", defaultCategories)

      // Create default users with hashed passwords
      const defaultUsers: User[] = [
        {
          id: "admin",
          username: "admin",
          email: "admin@example.com",
          password: hashPassword("admin123"),
          name: "Administrator",
          role: "admin",
          createdAt: new Date().toISOString(),
          isActive: true,
        },
        {
          id: "demo",
          username: "demo",
          email: "demo@example.com",
          password: hashPassword("demo123"),
          name: "Demo User",
          role: "user",
          createdAt: new Date().toISOString(),
          isActive: true,
        },
      ]

      await this.set("forum:users", defaultUsers)

      // Initialize empty collections
      await this.set("forum:posts", [])
      await this.set("forum:replies", [])
      await this.set("forum:meets", [])

      // Mark as initialized
      await this.set("system:initialized", true)
      await this.set("system:initialized_at", new Date().toISOString())

      console.log("✅ Persistent data store initialized successfully")
      console.log("👤 Default users created:")
      console.log("   - admin / admin123 (Administrator)")
      console.log("   - demo / demo123 (Demo User)")

      return true
    } catch (error) {
      console.error("❌ Error initializing persistent data store:", error)
      return false
    }
  }

  async forceReinitialize(): Promise<boolean> {
    try {
      console.log("🔄 Force reinitializing persistent data store...")

      // Clear all data
      await this.del("system:initialized")
      await this.del("forum:categories")
      await this.del("forum:users")
      await this.del("forum:posts")
      await this.del("forum:replies")
      await this.del("forum:meets")

      // Clear memory store as well
      this.memoryStore.clear()

      // Reinitialize
      return await this.initialize()
    } catch (error) {
      console.error("❌ Error force reinitializing:", error)
      return false
    }
  }

  // User management
  async getUsers(): Promise<User[]> {
    try {
      await this.ensureInitialized()
      const users = await this.get("forum:users")
      return users || []
    } catch (error) {
      console.error("Error getting users:", error)
      return []
    }
  }

  async createUser(userData: Omit<User, "id" | "createdAt">): Promise<User | null> {
    try {
      await this.ensureInitialized()
      const users = await this.getUsers()

      // Check if username or email already exists
      const existingUser = users.find(
        (user) =>
          user.username.toLowerCase() === userData.username.toLowerCase() ||
          user.email.toLowerCase() === userData.email.toLowerCase(),
      )

      if (existingUser) {
        console.error("User with this username or email already exists")
        return null
      }

      // Hash the password
      const hashedPassword = hashPassword(userData.password)

      const newUser: User = {
        ...userData,
        password: hashedPassword,
        id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date().toISOString(),
      }

      users.push(newUser)
      await this.set("forum:users", users)
      console.log("✅ User created:", newUser.username)
      return newUser
    } catch (error) {
      console.error("Error creating user:", error)
      return null
    }
  }

  async getUserByUsername(username: string): Promise<User | null> {
    try {
      const users = await this.getUsers()
      return users.find((user) => user.username.toLowerCase() === username.toLowerCase()) || null
    } catch (error) {
      console.error("Error getting user by username:", error)
      return null
    }
  }

  async getUserByEmail(email: string): Promise<User | null> {
    try {
      const users = await this.getUsers()
      return users.find((user) => user.email.toLowerCase() === email.toLowerCase()) || null
    } catch (error) {
      console.error("Error getting user by email:", error)
      return null
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

  async verifyPassword(username: string, password: string): Promise<User | null> {
    try {
      const user = await this.getUserByUsername(username)
      if (!user) {
        return null
      }

      const hashedPassword = hashPassword(password)
      if (user.password === hashedPassword) {
        // Update last active
        await this.updateUser(user.id, { lastActive: new Date().toISOString() })
        return user
      }

      return null
    } catch (error) {
      console.error("Error verifying password:", error)
      return null
    }
  }

  async updateUser(userId: string, updates: Partial<User>): Promise<User | null> {
    try {
      const users = await this.getUsers()
      const userIndex = users.findIndex((user) => user.id === userId)

      if (userIndex === -1) {
        return null
      }

      users[userIndex] = { ...users[userIndex], ...updates }
      await this.set("forum:users", users)
      return users[userIndex]
    } catch (error) {
      console.error("Error updating user:", error)
      return null
    }
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<boolean> {
    try {
      const user = await this.getUserById(userId)
      if (!user) {
        return false
      }

      // Verify current password
      const hashedCurrentPassword = hashPassword(currentPassword)
      if (user.password !== hashedCurrentPassword) {
        return false
      }

      // Hash new password and update
      const hashedNewPassword = hashPassword(newPassword)
      const updated = await this.updateUser(userId, { password: hashedNewPassword })
      return updated !== null
    } catch (error) {
      console.error("Error changing password:", error)
      return false
    }
  }

  // Category management
  async getCategories(): Promise<Category[]> {
    try {
      await this.ensureInitialized()
      const categories = await this.get("forum:categories")
      return categories || []
    } catch (error) {
      console.error("Error getting categories:", error)
      return []
    }
  }

  async getCategoryById(categoryId: string): Promise<Category | null> {
    try {
      const categories = await this.getCategories()
      return categories.find((category) => category.id === categoryId) || null
    } catch (error) {
      console.error("Error getting category by ID:", error)
      return null
    }
  }

  // Post management
  async getPosts(): Promise<Post[]> {
    try {
      await this.ensureInitialized()
      const posts = await this.get("forum:posts")
      return posts || []
    } catch (error) {
      console.error("Error getting posts:", error)
      return []
    }
  }

  async getPostById(postId: string): Promise<Post | null> {
    try {
      const posts = await this.getPosts()
      return posts.find((post) => post.id === postId) || null
    } catch (error) {
      console.error("Error getting post by ID:", error)
      return null
    }
  }

  async getPostsByUserId(userId: string): Promise<Post[]> {
    try {
      const posts = await this.getPosts()
      return posts.filter((post) => post.authorId === userId)
    } catch (error) {
      console.error("Error getting posts by user ID:", error)
      return []
    }
  }

  async createPost(postData: {
    title: string
    content: string
    author: string
    authorEmail: string
    authorId: string
    categoryId: string
    tags?: string[]
    status?: string
  }): Promise<Post | null> {
    try {
      await this.ensureInitialized()
      const posts = await this.getPosts()
      const newPost: Post = {
        ...postData,
        id: `post-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        replies: 0,
        views: 0,
        likes: 0,
        likedBy: [],
        status: postData.status || "active",
      }

      posts.push(newPost)
      await this.set("forum:posts", posts)
      return newPost
    } catch (error) {
      console.error("Error creating post:", error)
      return null
    }
  }

  async incrementPostViews(postId: string): Promise<boolean> {
    try {
      const posts = await this.getPosts()
      const postIndex = posts.findIndex((post) => post.id === postId)

      if (postIndex === -1) {
        return false
      }

      posts[postIndex].views = (posts[postIndex].views || 0) + 1
      await this.set("forum:posts", posts)
      return true
    } catch (error) {
      console.error("Error incrementing post views:", error)
      return false
    }
  }

  async likePost(postId: string, userEmail: string): Promise<Post | null> {
    try {
      const posts = await this.getPosts()
      const postIndex = posts.findIndex((post) => post.id === postId)

      if (postIndex === -1) {
        return null
      }

      const post = posts[postIndex]
      if (!post.likedBy) {
        post.likedBy = []
      }

      // Toggle like
      if (post.likedBy.includes(userEmail)) {
        post.likedBy = post.likedBy.filter((email) => email !== userEmail)
        post.likes = Math.max(0, (post.likes || 0) - 1)
      } else {
        post.likedBy.push(userEmail)
        post.likes = (post.likes || 0) + 1
      }

      posts[postIndex] = post
      await this.set("forum:posts", posts)
      return post
    } catch (error) {
      console.error("Error liking post:", error)
      return null
    }
  }

  async deletePost(postId: string, userEmail: string): Promise<boolean> {
    try {
      const posts = await this.getPosts()
      const postIndex = posts.findIndex((post) => post.id === postId)

      if (postIndex === -1) {
        return false
      }

      const post = posts[postIndex]

      // Check if user owns the post or is admin
      const user = await this.getUserByEmail(userEmail)
      if (post.authorEmail !== userEmail && user?.role !== "admin") {
        return false
      }

      // Remove the post
      posts.splice(postIndex, 1)
      await this.set("forum:posts", posts)

      // Also remove associated replies
      const replies = await this.getReplies()
      const filteredReplies = replies.filter((reply) => reply.postId !== postId)
      await this.set("forum:replies", filteredReplies)

      return true
    } catch (error) {
      console.error("Error deleting post:", error)
      return false
    }
  }

  // Reply management
  async getReplies(): Promise<Reply[]> {
    try {
      await this.ensureInitialized()
      const replies = await this.get("forum:replies")
      return replies || []
    } catch (error) {
      console.error("Error getting replies:", error)
      return []
    }
  }

  async getRepliesByPostId(postId: string): Promise<Reply[]> {
    try {
      const replies = await this.getReplies()
      return replies.filter((reply) => reply.postId === postId)
    } catch (error) {
      console.error("Error getting replies by post ID:", error)
      return []
    }
  }

  async addReply(replyData: {
    postId: string
    content: string
    author: string
    authorEmail: string
    authorId?: string
  }): Promise<Reply | null> {
    try {
      await this.ensureInitialized()
      const replies = await this.getReplies()
      const posts = await this.getPosts()

      const newReply: Reply = {
        ...replyData,
        authorId: replyData.authorId || `user-${replyData.authorEmail}`,
        id: `reply-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        likes: 0,
        likedBy: [],
      }

      replies.push(newReply)
      await this.set("forum:replies", replies)

      // Update post reply count
      const postIndex = posts.findIndex((post) => post.id === replyData.postId)
      if (postIndex !== -1) {
        posts[postIndex].replies = (posts[postIndex].replies || 0) + 1
        await this.set("forum:posts", posts)
      }

      return newReply
    } catch (error) {
      console.error("Error adding reply:", error)
      return null
    }
  }

  async likeReply(replyId: string, userEmail: string): Promise<Reply | null> {
    try {
      const replies = await this.getReplies()
      const replyIndex = replies.findIndex((reply) => reply.id === replyId)

      if (replyIndex === -1) {
        return null
      }

      const reply = replies[replyIndex]
      if (!reply.likedBy) {
        reply.likedBy = []
      }

      // Toggle like
      if (reply.likedBy.includes(userEmail)) {
        reply.likedBy = reply.likedBy.filter((email) => email !== userEmail)
        reply.likes = Math.max(0, (reply.likes || 0) - 1)
      } else {
        reply.likedBy.push(userEmail)
        reply.likes = (reply.likes || 0) + 1
      }

      replies[replyIndex] = reply
      await this.set("forum:replies", replies)
      return reply
    } catch (error) {
      console.error("Error liking reply:", error)
      return null
    }
  }

  async deleteReply(replyId: string, userEmail: string): Promise<boolean> {
    try {
      const replies = await this.getReplies()
      const replyIndex = replies.findIndex((reply) => reply.id === replyId)

      if (replyIndex === -1) {
        return false
      }

      const reply = replies[replyIndex]

      // Check if user owns the reply or is admin
      const user = await this.getUserByEmail(userEmail)
      if (reply.authorEmail !== userEmail && user?.role !== "admin") {
        return false
      }

      // Remove the reply
      const postId = reply.postId
      replies.splice(replyIndex, 1)
      await this.set("forum:replies", replies)

      // Update post reply count
      const posts = await this.getPosts()
      const postIndex = posts.findIndex((post) => post.id === postId)
      if (postIndex !== -1) {
        posts[postIndex].replies = Math.max(0, (posts[postIndex].replies || 0) - 1)
        await this.set("forum:posts", posts)
      }

      return true
    } catch (error) {
      console.error("Error deleting reply:", error)
      return false
    }
  }

  // Meet management
  async getMeets(): Promise<Meet[]> {
    try {
      await this.ensureInitialized()
      const meets = await this.get("forum:meets")
      return meets || []
    } catch (error) {
      console.error("Error getting meets:", error)
      return []
    }
  }

  async createMeet(meetData: Omit<Meet, "id" | "createdAt" | "updatedAt" | "attendees">): Promise<Meet | null> {
    try {
      await this.ensureInitialized()
      const meets = await this.getMeets()
      const newMeet: Meet = {
        ...meetData,
        id: `meet-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        attendees: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      meets.push(newMeet)
      await this.set("forum:meets", meets)
      return newMeet
    } catch (error) {
      console.error("Error creating meet:", error)
      return null
    }
  }

  async getMeetById(meetId: string): Promise<Meet | null> {
    try {
      const meets = await this.getMeets()
      return meets.find((meet) => meet.id === meetId) || null
    } catch (error) {
      console.error("Error getting meet by ID:", error)
      return null
    }
  }

  async rsvpToMeet(meetId: string, userEmail: string, userName: string): Promise<Meet | null> {
    try {
      const meets = await this.getMeets()
      const meetIndex = meets.findIndex((meet) => meet.id === meetId)

      if (meetIndex === -1) {
        return null
      }

      const meet = meets[meetIndex]

      // Check if user already RSVP'd
      if (meet.attendees.some((attendee) => attendee.userEmail === userEmail)) {
        return meet
      }

      // Add user to attendees
      meet.attendees.push({
        userId: `user-${userEmail}`,
        userName,
        userEmail,
        rsvpDate: new Date().toISOString(),
      })

      meet.updatedAt = new Date().toISOString()
      meets[meetIndex] = meet
      await this.set("forum:meets", meets)

      return meet
    } catch (error) {
      console.error("Error RSVP'ing to meet:", error)
      return null
    }
  }

  async cancelRsvp(meetId: string, userEmail: string): Promise<Meet | null> {
    try {
      const meets = await this.getMeets()
      const meetIndex = meets.findIndex((meet) => meet.id === meetId)

      if (meetIndex === -1) {
        return null
      }

      const meet = meets[meetIndex]
      const attendeeIndex = meet.attendees.findIndex((attendee) => attendee.userEmail === userEmail)

      if (attendeeIndex === -1) {
        return meet
      }

      // Remove user from attendees
      meet.attendees.splice(attendeeIndex, 1)
      meet.updatedAt = new Date().toISOString()
      meets[meetIndex] = meet
      await this.set("forum:meets", meets)

      return meet
    } catch (error) {
      console.error("Error cancelling RSVP:", error)
      return null
    }
  }

  // System status
  async getSystemStatus(): Promise<{
    isInitialized: boolean
    initializedAt?: string
    storageType: "kv" | "memory"
    stats: {
      users: number
      categories: number
      posts: number
      replies: number
      meets: number
    }
  }> {
    try {
      const isInitialized = await this.isInitialized()
      const initializedAt = await this.get("system:initialized_at")

      const users = await this.getUsers()
      const categories = await this.getCategories()
      const posts = await this.getPosts()
      const replies = await this.getReplies()
      const meets = await this.getMeets()

      return {
        isInitialized,
        initializedAt,
        storageType: this.kvAvailable ? "kv" : "memory",
        stats: {
          users: users.length,
          categories: categories.length,
          posts: posts.length,
          replies: replies.length,
          meets: meets.length,
        },
      }
    } catch (error) {
      console.error("Error getting system status:", error)
      return {
        isInitialized: false,
        storageType: this.kvAvailable ? "kv" : "memory",
        stats: {
          users: 0,
          categories: 0,
          posts: 0,
          replies: 0,
          meets: 0,
        },
      }
    }
  }

  // Utility methods
  private async ensureInitialized(): Promise<void> {
    if (!(await this.isInitialized())) {
      await this.initialize()
    }
  }
}

// Create a single instance
const persistentDataStoreInstance = new PersistentDataStore()

// Export with all the required names for backward compatibility
export const dataStore = persistentDataStoreInstance
export const persistentForumDataStore = persistentDataStoreInstance
export { PersistentDataStore }

// Default export for backward compatibility
export default persistentDataStoreInstance
