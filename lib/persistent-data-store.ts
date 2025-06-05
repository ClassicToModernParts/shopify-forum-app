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
  location: string
  maxMembers?: number
  requirements?: string
  creatorEmail: string
  creatorName: string
  createdAt: string
  updatedAt: string
  status: "active" | "deleted"
  members: {
    email: string
    name: string
    joinedAt: string
    role: "creator" | "member"
  }[]
}

interface RewardsSettings {
  pointsPerPost: number
  pointsPerReply: number
  pointsPerLike: number
  pointsPerReceivingLike: number
  pointsPerMeetCreation: number
  pointsPerMeetAttendance: number
  dailyPointsLimit: number
  coupons: {
    id: string
    name: string
    pointsRequired: number
    discountAmount: number
    discountType: "fixed" | "percentage"
    isActive: boolean
  }[]
  lastUpdated: string
}

interface UserRewards {
  userId: string
  totalPoints: number
  dailyPoints: number
  lastDailyReset: string
  pointsHistory: {
    id: string
    points: number
    reason: string
    actionType: string
    createdAt: string
  }[]
  redeemedCoupons: {
    id: string
    couponId: string
    couponName: string
    pointsSpent: number
    redeemedAt: string
    couponCode: string
  }[]
}

class PersistentDataStore {
  private readonly USERS_KEY = "ctm:users"
  private readonly MEETS_KEY = "ctm:meets"
  private readonly POSTS_KEY = "ctm:posts"
  private readonly CATEGORIES_KEY = "ctm:categories"
  private readonly REPLIES_KEY = "ctm:replies"
  private readonly GROUPS_KEY = "ctm:groups"
  private readonly REWARDS_SETTINGS_KEY = "ctm:rewards:settings"
  private readonly USER_REWARDS_KEY = "ctm:user:rewards"
  private readonly INIT_KEY = "ctm:initialized"

  private memoryStore: Map<string, any> = new Map()
  private useMemory = false
  private initialized = false

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

  async initialize(): Promise<void> {
    try {
      console.log("🔄 Initializing data store...")

      if (await this.isInitialized()) {
        console.log("✅ Already initialized")
        return
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

      // Create sample meet
      const meets: Meet[] = [
        {
          id: "meet-1",
          title: "Monthly CTM Parts Meetup",
          description:
            "Join us for our monthly meetup to discuss CTM parts, share experiences, and network with fellow enthusiasts!",
          organizer: "Administrator",
          organizerEmail: "admin@ctmparts.com",
          date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
          time: "18:00",
          location: "Community Center",
          address: "123 Main St, Anytown USA",
          vehicleTypes: ["Cars", "Trucks", "Motorcycles"],
          maxAttendees: 50,
          contactInfo: "admin@ctmparts.com",
          requirements: "Bring your enthusiasm for CTM parts!",
          status: "upcoming",
          attendees: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ]

      // Default rewards settings
      const rewardsSettings: RewardsSettings = {
        pointsPerPost: 10,
        pointsPerReply: 5,
        pointsPerLike: 1,
        pointsPerReceivingLike: 2,
        pointsPerMeetCreation: 25,
        pointsPerMeetAttendance: 15,
        dailyPointsLimit: 100,
        coupons: [
          {
            id: "coupon-5",
            name: "$5 Off Any Purchase",
            pointsRequired: 500,
            discountAmount: 5,
            discountType: "fixed",
            isActive: true,
          },
          {
            id: "coupon-10",
            name: "$10 Off Orders Over $50",
            pointsRequired: 1000,
            discountAmount: 10,
            discountType: "fixed",
            isActive: true,
          },
        ],
        lastUpdated: new Date().toISOString(),
      }

      // Save all data
      await store.set(this.USERS_KEY, [adminUser, demoUser])
      await store.set(this.CATEGORIES_KEY, categories)
      await store.set(this.POSTS_KEY, posts)
      await store.set(this.MEETS_KEY, meets)
      await store.set(this.REPLIES_KEY, [])
      await store.set(this.GROUPS_KEY, [])
      await store.set(this.REWARDS_SETTINGS_KEY, rewardsSettings)
      await store.set(this.USER_REWARDS_KEY, [])
      await store.set(this.INIT_KEY, true)

      this.initialized = true

      console.log("✅ Data store initialized successfully")
      console.log("👤 Default users created:")
      console.log("   - admin / admin123 (Administrator)")
      console.log("   - demo / demo123 (Demo User)")

      if (this.useMemory) {
        console.log("⚠️ Using memory storage - data will be lost on restart")
      }
    } catch (error) {
      console.error("❌ Failed to initialize data store:", error)
      throw error
    }
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

  // Password reset token methods
  async storePasswordResetToken(userId: string, token: string, expiry: string): Promise<boolean> {
    try {
      console.log("🎫 Storing password reset token for user:", userId)
      const users = await this.getUsers()
      const userIndex = users.findIndex((u) => u.id === userId)

      if (userIndex === -1) {
        console.warn(`User not found for token storage: ${userId}`)
        return false
      }

      users[userIndex].resetToken = token
      users[userIndex].resetTokenExpiry = expiry

      const store = await this.getStore()
      await store.set(this.USERS_KEY, users)

      console.log("✅ Password reset token stored successfully")
      return true
    } catch (error) {
      console.error("Error storing password reset token:", error)
      return false
    }
  }

  async getUserByResetToken(token: string): Promise<User | null> {
    try {
      console.log("🔍 Looking up user by reset token")
      const users = await this.getUsers()
      const user = users.find((u) => u.resetToken === token)

      if (!user) {
        console.log("❌ No user found with reset token")
        return null
      }

      // Check if token is expired
      if (user.resetTokenExpiry && new Date(user.resetTokenExpiry) < new Date()) {
        console.log("❌ Reset token has expired")
        return null
      }

      console.log("✅ Valid reset token found for user:", user.username)
      return user
    } catch (error) {
      console.error("Error getting user by reset token:", error)
      return null
    }
  }

  async clearPasswordResetToken(userId: string): Promise<boolean> {
    try {
      console.log("🧹 Clearing password reset token for user:", userId)
      const users = await this.getUsers()
      const userIndex = users.findIndex((u) => u.id === userId)

      if (userIndex === -1) {
        console.warn(`User not found for token clearing: ${userId}`)
        return false
      }

      users[userIndex].resetToken = undefined
      users[userIndex].resetTokenExpiry = undefined

      const store = await this.getStore()
      await store.set(this.USERS_KEY, users)

      console.log("✅ Password reset token cleared successfully")
      return true
    } catch (error) {
      console.error("Error clearing password reset token:", error)
      return false
    }
  }

  async updatePassword(userId: string, newPasswordHash: string): Promise<boolean> {
    try {
      console.log("🔐 Updating password for user:", userId)
      const users = await this.getUsers()
      const userIndex = users.findIndex((u) => u.id === userId)

      if (userIndex === -1) {
        console.warn(`User not found for password update: ${userId}`)
        return false
      }

      users[userIndex].password = newPasswordHash
      users[userIndex].resetToken = undefined
      users[userIndex].resetTokenExpiry = undefined

      const store = await this.getStore()
      await store.set(this.USERS_KEY, users)

      console.log("✅ Password updated successfully")
      return true
    } catch (error) {
      console.error("Error updating password:", error)
      return false
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

  async createMeet(meetData: Omit<Meet, "id" | "createdAt" | "updatedAt" | "attendees">): Promise<Meet> {
    try {
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

  async rsvpToMeet(meetId: string, userId: string, userName: string, userEmail: string): Promise<Meet | null> {
    try {
      const store = await this.getStore()
      const meets = await this.getMeets()
      const meetIndex = meets.findIndex((m) => m.id === meetId)

      if (meetIndex === -1) return null

      const meet = meets[meetIndex]

      // Check if already RSVP'd
      if (meet.attendees.some((a) => a.userId === userId)) {
        return meet
      }

      // Check capacity
      if (meet.maxAttendees && meet.attendees.length >= meet.maxAttendees) {
        return null
      }

      meet.attendees.push({
        userId,
        userName,
        userEmail,
        rsvpDate: new Date().toISOString(),
      })

      meet.updatedAt = new Date().toISOString()
      meets[meetIndex] = meet
      await store.set(this.MEETS_KEY, meets)

      console.log("✅ RSVP added:", userName, "to", meet.title)
      return meet
    } catch (error) {
      console.error("Error adding RSVP:", error)
      return null
    }
  }

  async cancelRsvp(meetId: string, userId: string): Promise<Meet | null> {
    try {
      const store = await this.getStore()
      const meets = await this.getMeets()
      const meetIndex = meets.findIndex((m) => m.id === meetId)

      if (meetIndex === -1) return null

      const meet = meets[meetIndex]
      meet.attendees = meet.attendees.filter((a) => a.userId !== userId)
      meet.updatedAt = new Date().toISOString()

      meets[meetIndex] = meet
      await store.set(this.MEETS_KEY, meets)

      console.log("✅ RSVP cancelled for meet:", meet.title)
      return meet
    } catch (error) {
      console.error("Error cancelling RSVP:", error)
      return null
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

  async getCategoryById(id: string): Promise<Category | null> {
    try {
      const categories = await this.getCategories()
      return categories.find((c) => c.id === id) || null
    } catch (error) {
      console.error("Error getting category by ID:", error)
      return null
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

  async getPostById(id: string): Promise<Post | null> {
    try {
      const posts = await this.getPosts()
      return posts.find((p) => p.id === id) || null
    } catch (error) {
      console.error("Error getting post by ID:", error)
      return null
    }
  }

  async createPost(
    postData: Omit<Post, "id" | "createdAt" | "updatedAt" | "replies" | "views" | "likes">,
  ): Promise<Post> {
    try {
      const store = await this.getStore()
      const posts = await this.getPosts()

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

      posts.push(post)
      await store.set(this.POSTS_KEY, posts)

      console.log("✅ Post created:", post.title)
      return post
    } catch (error) {
      console.error("Error creating post:", error)
      throw error
    }
  }

  async incrementPostViews(postId: string): Promise<Post | null> {
    try {
      const store = await this.getStore()
      const posts = await this.getPosts()
      const postIndex = posts.findIndex((p) => p.id === postId)

      if (postIndex === -1) return null

      posts[postIndex].views = (posts[postIndex].views || 0) + 1
      await store.set(this.POSTS_KEY, posts)
      return posts[postIndex]
    } catch (error) {
      console.error("Error incrementing post views:", error)
      return null
    }
  }

  async likePost(postId: string, userEmail?: string): Promise<{ likes: number } | null> {
    try {
      const store = await this.getStore()
      const posts = await this.getPosts()
      const postIndex = posts.findIndex((p) => p.id === postId)

      if (postIndex === -1) return null

      posts[postIndex].likes = (posts[postIndex].likes || 0) + 1
      await store.set(this.POSTS_KEY, posts)
      return { likes: posts[postIndex].likes }
    } catch (error) {
      console.error("Error liking post:", error)
      return null
    }
  }

  // Reply methods
  async getRepliesByPostId(postId: string): Promise<Reply[]> {
    try {
      await this.ensureInitialized()
      const store = await this.getStore()
      const replies = await store.get(this.REPLIES_KEY)
      return ((replies || []) as Reply[]).filter((r) => r.postId === postId && r.status === "active")
    } catch (error) {
      console.error("Error getting replies:", error)
      return []
    }
  }

  async addReply(replyData: Omit<Reply, "id" | "createdAt" | "updatedAt" | "likes">): Promise<Reply> {
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
      const posts = await this.getPosts()
      const postIndex = posts.findIndex((p) => p.id === replyData.postId)
      if (postIndex !== -1) {
        posts[postIndex].replies++
        await store.set(this.POSTS_KEY, posts)
      }

      console.log("✅ Reply added to post:", replyData.postId)
      return reply
    } catch (error) {
      console.error("Error adding reply:", error)
      throw error
    }
  }

  // Group methods
  async getGroups(): Promise<Group[]> {
    try {
      await this.ensureInitialized()
      const store = await this.getStore()
      const groups = await store.get(this.GROUPS_KEY)
      return ((groups || []) as Group[]).filter((g) => g.status === "active")
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

  async createGroup(groupData: Omit<Group, "id" | "createdAt" | "updatedAt" | "members">): Promise<Group> {
    try {
      const store = await this.getStore()
      const groups = await this.getGroups()

      const group: Group = {
        ...groupData,
        id: `group-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        members: [
          {
            email: groupData.creatorEmail,
            name: groupData.creatorName,
            joinedAt: new Date().toISOString(),
            role: "creator",
          },
        ],
        status: "active",
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

  // Rewards methods
  async getRewardsSettings(): Promise<RewardsSettings> {
    try {
      await this.ensureInitialized()
      const store = await this.getStore()
      let settings = await store.get(this.REWARDS_SETTINGS_KEY)

      if (!settings) {
        settings = {
          pointsPerPost: 10,
          pointsPerReply: 5,
          pointsPerLike: 1,
          pointsPerReceivingLike: 2,
          pointsPerMeetCreation: 25,
          pointsPerMeetAttendance: 15,
          dailyPointsLimit: 100,
          coupons: [],
          lastUpdated: new Date().toISOString(),
        }
        await store.set(this.REWARDS_SETTINGS_KEY, settings)
      }

      return settings
    } catch (error) {
      console.error("Error getting rewards settings:", error)
      throw error
    }
  }

  async getUserRewards(userId: string): Promise<UserRewards | null> {
    try {
      await this.ensureInitialized()
      const store = await this.getStore()
      const allRewards = (await store.get(this.USER_REWARDS_KEY)) || []
      let userRewards = allRewards.find((r: UserRewards) => r.userId === userId)

      if (!userRewards) {
        userRewards = {
          userId,
          totalPoints: 0,
          dailyPoints: 0,
          lastDailyReset: new Date().toISOString(),
          pointsHistory: [],
          redeemedCoupons: [],
        }
        allRewards.push(userRewards)
        await store.set(this.USER_REWARDS_KEY, allRewards)
      }

      return userRewards
    } catch (error) {
      console.error("Error getting user rewards:", error)
      return null
    }
  }

  // Stats
  async getStats() {
    try {
      const categories = await this.getCategories()
      const posts = await this.getPosts()
      const meets = await this.getMeets()
      const users = await this.getUsers()
      const groups = await this.getGroups()

      return {
        totalCategories: categories.length,
        totalPosts: posts.length,
        totalReplies: 0,
        totalUsers: users.length,
        totalMeets: meets.length,
        totalGroups: groups.length,
        upcomingMeets: meets.filter((m) => m.status === "upcoming").length,
        activeToday: Math.ceil(users.length * 0.3),
        onlineUsers: Math.ceil(users.length * 0.1),
      }
    } catch (error) {
      console.error("Error getting stats:", error)
      return {
        totalCategories: 0,
        totalPosts: 0,
        totalReplies: 0,
        totalUsers: 0,
        totalMeets: 0,
        totalGroups: 0,
        upcomingMeets: 0,
        activeToday: 0,
        onlineUsers: 0,
      }
    }
  }

  // Utility methods
  private async ensureInitialized(): Promise<void> {
    if (!(await this.isInitialized())) {
      await this.initialize()
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
      await store.del(this.REWARDS_SETTINGS_KEY)
      await store.del(this.USER_REWARDS_KEY)
      await store.del(this.INIT_KEY)
      this.memoryStore.clear()
      this.initialized = false
      console.log("✅ All data cleared")
    } catch (error) {
      console.error("Error clearing data:", error)
    }
  }

  async forceReinitialize(): Promise<void> {
    await this.clearAllData()
    await this.initialize()
  }
}

// Create the instance
const persistentDataStoreInstance = new PersistentDataStore()

// Export both names for compatibility
export const persistentForumDataStore = persistentDataStoreInstance
export const dataStore = persistentDataStoreInstance

// Default export
export default persistentDataStoreInstance
