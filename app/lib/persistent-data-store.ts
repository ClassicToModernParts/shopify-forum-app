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

interface RewardsSettings {
  pointsPerPost: number
  pointsPerReply: number
  pointsPerLike: number
  pointsPerReceivingLike: number
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

class PersistentForumDataStore {
  private readonly CATEGORIES_KEY = "forum:categories"
  private readonly POSTS_KEY = "forum:posts"
  private readonly REPLIES_KEY = "forum:replies"
  private readonly INITIALIZED_KEY = "forum:initialized"
  private readonly USERS_KEY = "forum:users"
  private readonly REWARDS_SETTINGS_KEY = "forum:rewards:settings"
  private readonly USER_REWARDS_KEY = "forum:user:rewards"

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
          description: "Share your CTM parts projects and builds",
          color: "#10B981",
          icon: "Camera",
          createdAt: new Date().toISOString(),
        },
        {
          id: "troubleshooting",
          name: "Troubleshooting",
          description: "Get help troubleshooting CTM parts issues",
          color: "#F59E0B",
          icon: "AlertTriangle",
          createdAt: new Date().toISOString(),
        },
        {
          id: "general",
          name: "General Discussion",
          description: "General topics and discussions about CTM parts",
          color: "#8B5CF6",
          icon: "MessageSquare",
          createdAt: new Date().toISOString(),
        },
      ]

      // Create sample posts
      const defaultPosts: Post[] = [
        {
          id: "post-1",
          title: "Welcome to CTM Parts Community!",
          content:
            "Welcome to the CTM Parts Community forum! This is your place to get help with installations, share your projects, troubleshoot issues, and connect with other CTM parts enthusiasts. Feel free to explore the different categories and start discussions!",
          author: "CTM Admin",
          authorEmail: "admin@store.com",
          categoryId: "general",
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          updatedAt: new Date(Date.now() - 86400000).toISOString(),
          replies: 3,
          views: 47,
          likes: 8,
          isPinned: true,
          tags: ["welcome", "introduction", "community"],
          status: "active",
        },
        {
          id: "post-2",
          title: "Installation Guide: Getting Started with CTM Parts",
          content:
            "Here's a comprehensive guide to help you get started with your first CTM parts installation. We'll cover the basic tools you need, preparation steps, and common tips for success.",
          author: "CTM Admin",
          authorEmail: "admin@store.com",
          categoryId: "installation-help",
          createdAt: new Date(Date.now() - 172800000).toISOString(),
          updatedAt: new Date(Date.now() - 172800000).toISOString(),
          replies: 12,
          views: 156,
          likes: 23,
          isPinned: true,
          tags: ["guide", "installation", "beginner"],
          status: "active",
        },
      ]

      // Create sample replies
      const defaultReplies: Reply[] = [
        {
          id: "reply-1",
          postId: "post-1",
          content:
            "Thank you for the warm welcome! I'm excited to be part of this community and learn from everyone's experiences.",
          author: "New Member",
          authorEmail: "newmember@example.com",
          createdAt: new Date(Date.now() - 21600000).toISOString(),
          updatedAt: new Date(Date.now() - 21600000).toISOString(),
          likes: 3,
          status: "active",
        },
        {
          id: "reply-2",
          postId: "post-1",
          content: "Great to have another member! Don't hesitate to ask questions - this community is very helpful.",
          author: "Experienced User",
          authorEmail: "experienced@example.com",
          createdAt: new Date(Date.now() - 18000000).toISOString(),
          updatedAt: new Date(Date.now() - 18000000).toISOString(),
          likes: 2,
          status: "active",
        },
        {
          id: "reply-3",
          postId: "post-2",
          content:
            "This guide was exactly what I needed! The step-by-step instructions made my first installation much easier.",
          author: "DIY Enthusiast",
          authorEmail: "diy@example.com",
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
          id: "demo-user-1",
          username: "new_member",
          name: "New Member",
          email: "newmember@example.com",
          password: "demo123",
          role: "user",
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          isActive: true,
          lastActive: new Date(Date.now() - 3600000).toISOString(),
        },
        {
          id: "demo-user-2",
          username: "experienced_user",
          name: "Experienced User",
          email: "experienced@example.com",
          password: "demo123",
          role: "user",
          createdAt: new Date(Date.now() - 2592000000).toISOString(),
          isActive: true,
          lastActive: new Date(Date.now() - 7200000).toISOString(),
        },
        {
          id: "demo-user-3",
          username: "diy_enthusiast",
          name: "DIY Enthusiast",
          email: "diy@example.com",
          password: "demo123",
          role: "user",
          createdAt: new Date(Date.now() - 1296000000).toISOString(),
          isActive: true,
          lastActive: new Date(Date.now() - 1800000).toISOString(),
        },
      ]

      // Create default rewards settings
      const defaultRewardsSettings: RewardsSettings = {
        pointsPerPost: 10,
        pointsPerReply: 5,
        pointsPerLike: 1,
        pointsPerReceivingLike: 2,
        dailyPointsLimit: 100,
        coupons: [
          {
            id: "coupon-5-off",
            name: "$5 Off Coupon",
            pointsRequired: 700,
            discountAmount: 5,
            discountType: "fixed",
            isActive: true,
          },
          {
            id: "coupon-10-off",
            name: "$10 Off Coupon",
            pointsRequired: 1400,
            discountAmount: 10,
            discountType: "fixed",
            isActive: true,
          },
        ],
        lastUpdated: new Date().toISOString(),
      }

      // Initialize user rewards for default users
      const defaultUserRewards: UserRewards[] = defaultUsers.map((user) => ({
        userId: user.id,
        totalPoints: 0,
        dailyPoints: 0,
        lastDailyReset: new Date().toISOString(),
        pointsHistory: [],
        redeemedCoupons: [],
      }))

      // Save to KV store
      await kv.set(this.CATEGORIES_KEY, defaultCategories)
      await kv.set(this.POSTS_KEY, defaultPosts)
      await kv.set(this.REPLIES_KEY, defaultReplies)
      await kv.set(this.USERS_KEY, defaultUsers)
      await kv.set(this.REWARDS_SETTINGS_KEY, defaultRewardsSettings)
      await kv.set(this.USER_REWARDS_KEY, defaultUserRewards)
      await kv.set(this.INITIALIZED_KEY, true)

      console.log("✅ Persistent forum data store initialized with CTM Parts content and rewards system")
    } catch (error) {
      console.error("❌ Error initializing persistent store:", error)
      throw error
    }
  }

  // Rewards System Methods
  async getRewardsSettings(): Promise<RewardsSettings> {
    try {
      await this.initialize()
      const settings = await kv.get<RewardsSettings>(this.REWARDS_SETTINGS_KEY)
      return (
        settings || {
          pointsPerPost: 10,
          pointsPerReply: 5,
          pointsPerLike: 1,
          pointsPerReceivingLike: 2,
          dailyPointsLimit: 100,
          coupons: [
            {
              id: "coupon-5-off",
              name: "$5 Off Coupon",
              pointsRequired: 700,
              discountAmount: 5,
              discountType: "fixed",
              isActive: true,
            },
            {
              id: "coupon-10-off",
              name: "$10 Off Coupon",
              pointsRequired: 1400,
              discountAmount: 10,
              discountType: "fixed",
              isActive: true,
            },
          ],
          lastUpdated: new Date().toISOString(),
        }
      )
    } catch (error) {
      console.error("Error getting rewards settings:", error)
      throw error
    }
  }

  async updateRewardsSettings(settings: Partial<RewardsSettings>): Promise<RewardsSettings> {
    try {
      const currentSettings = await this.getRewardsSettings()
      const updatedSettings: RewardsSettings = {
        ...currentSettings,
        ...settings,
        lastUpdated: new Date().toISOString(),
      }

      await kv.set(this.REWARDS_SETTINGS_KEY, updatedSettings)
      console.log("✅ Rewards settings updated successfully")
      return updatedSettings
    } catch (error) {
      console.error("Error updating rewards settings:", error)
      throw error
    }
  }

  async getUserRewards(userId: string): Promise<UserRewards | null> {
    try {
      const allRewards = (await kv.get<UserRewards[]>(this.USER_REWARDS_KEY)) || []
      let userRewards = allRewards.find((r) => r.userId === userId)

      if (!userRewards) {
        // Create new user rewards if doesn't exist
        userRewards = {
          userId,
          totalPoints: 0,
          dailyPoints: 0,
          lastDailyReset: new Date().toISOString(),
          pointsHistory: [],
          redeemedCoupons: [],
        }
        allRewards.push(userRewards)
        await kv.set(this.USER_REWARDS_KEY, allRewards)
      }

      // Check if daily reset is needed
      const lastReset = new Date(userRewards.lastDailyReset)
      const now = new Date()
      const isNewDay = now.toDateString() !== lastReset.toDateString()

      if (isNewDay) {
        userRewards.dailyPoints = 0
        userRewards.lastDailyReset = now.toISOString()

        const updatedRewards = allRewards.map((r) => (r.userId === userId ? userRewards! : r))
        await kv.set(this.USER_REWARDS_KEY, updatedRewards)
      }

      return userRewards
    } catch (error) {
      console.error("Error getting user rewards:", error)
      return null
    }
  }

  async getAllUserRewards(): Promise<UserRewards[]> {
    try {
      await this.initialize()
      const rewards = await kv.get<UserRewards[]>(this.USER_REWARDS_KEY)
      return rewards || []
    } catch (error) {
      console.error("Error getting all user rewards:", error)
      return []
    }
  }

  async awardPoints(userId: string, points: number, reason: string, actionType: string): Promise<UserRewards | null> {
    try {
      const settings = await this.getRewardsSettings()
      const userRewards = await this.getUserRewards(userId)

      if (!userRewards) {
        console.error("User rewards not found for user:", userId)
        return null
      }

      // Check daily limit
      if (userRewards.dailyPoints + points > settings.dailyPointsLimit) {
        const remainingPoints = Math.max(0, settings.dailyPointsLimit - userRewards.dailyPoints)
        if (remainingPoints === 0) {
          console.log(`User ${userId} has reached daily points limit`)
          return userRewards
        }
        points = remainingPoints
      }

      // Add points
      userRewards.totalPoints += points
      userRewards.dailyPoints += points

      // Add to history
      const historyEntry = {
        id: `history-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        points,
        reason,
        actionType,
        createdAt: new Date().toISOString(),
      }
      userRewards.pointsHistory.unshift(historyEntry)

      // Keep only last 50 history entries
      if (userRewards.pointsHistory.length > 50) {
        userRewards.pointsHistory = userRewards.pointsHistory.slice(0, 50)
      }

      // Update in storage
      const allRewards = await this.getAllUserRewards()
      const updatedRewards = allRewards.map((r) => (r.userId === userId ? userRewards : r))
      await kv.set(this.USER_REWARDS_KEY, updatedRewards)

      console.log(`✅ Awarded ${points} points to user ${userId} for ${reason}`)
      return userRewards
    } catch (error) {
      console.error("Error awarding points:", error)
      return null
    }
  }

  async redeemCoupon(userId: string, couponId: string): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const settings = await this.getRewardsSettings()
      const userRewards = await this.getUserRewards(userId)

      if (!userRewards) {
        return { success: false, error: "User rewards not found" }
      }

      const coupon = settings.coupons.find((c) => c.id === couponId && c.isActive)
      if (!coupon) {
        return { success: false, error: "Coupon not found or inactive" }
      }

      if (userRewards.totalPoints < coupon.pointsRequired) {
        return {
          success: false,
          error: `Insufficient points. Need ${coupon.pointsRequired}, have ${userRewards.totalPoints}`,
        }
      }

      // Deduct points
      userRewards.totalPoints -= coupon.pointsRequired

      // Generate coupon code
      const couponCode = `CTM${coupon.discountAmount}OFF${Date.now().toString().slice(-6)}`

      // Add to redeemed coupons
      const redeemedCoupon = {
        id: `redeemed-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        couponId: coupon.id,
        couponName: coupon.name,
        pointsSpent: coupon.pointsRequired,
        redeemedAt: new Date().toISOString(),
        couponCode,
      }
      userRewards.redeemedCoupons.unshift(redeemedCoupon)

      // Add to history
      const historyEntry = {
        id: `history-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        points: -coupon.pointsRequired,
        reason: `Redeemed ${coupon.name}`,
        actionType: "coupon_redemption",
        createdAt: new Date().toISOString(),
      }
      userRewards.pointsHistory.unshift(historyEntry)

      // Update in storage
      const allRewards = await this.getAllUserRewards()
      const updatedRewards = allRewards.map((r) => (r.userId === userId ? userRewards : r))
      await kv.set(this.USER_REWARDS_KEY, updatedRewards)

      console.log(`✅ User ${userId} redeemed ${coupon.name} for ${coupon.pointsRequired} points`)
      return {
        success: true,
        data: {
          couponCode,
          couponName: coupon.name,
          discountAmount: coupon.discountAmount,
          remainingPoints: userRewards.totalPoints,
        },
      }
    } catch (error) {
      console.error("Error redeeming coupon:", error)
      return { success: false, error: "Failed to redeem coupon" }
    }
  }

  async getRewardsLeaderboard(limit = 10): Promise<any[]> {
    try {
      const allRewards = await this.getAllUserRewards()
      const users = await this.getUsers()

      const leaderboard = allRewards
        .sort((a, b) => b.totalPoints - a.totalPoints)
        .slice(0, limit)
        .map((reward) => {
          const user = users.find((u) => u.id === reward.userId)
          return {
            userId: reward.userId,
            username: user?.username || "Unknown",
            name: user?.name || "Unknown User",
            totalPoints: reward.totalPoints,
            rank: 0, // Will be set below
          }
        })

      // Set ranks
      leaderboard.forEach((entry, index) => {
        entry.rank = index + 1
      })

      return leaderboard
    } catch (error) {
      console.error("Error getting rewards leaderboard:", error)
      return []
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

      // Award points for creating a post
      if (data.authorEmail) {
        const user = await this.getUserByEmail(data.authorEmail)
        if (user) {
          const settings = await this.getRewardsSettings()
          await this.awardPoints(user.id, settings.pointsPerPost, "Created a post", "post_creation")
        }
      }

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

  async incrementPostViews(postId: string): Promise<Post | null> {
    try {
      const posts = (await kv.get<Post[]>(this.POSTS_KEY)) || []
      const postIndex = posts.findIndex((p) => p.id === postId && p.status === "active")

      if (postIndex === -1) return null

      posts[postIndex].views = (posts[postIndex].views || 0) + 1
      posts[postIndex].updatedAt = new Date().toISOString()

      await kv.set(this.POSTS_KEY, posts)
      console.log(`👁️ Post ${postId} views incremented to ${posts[postIndex].views}`)

      return posts[postIndex]
    } catch (error) {
      console.error(`Error incrementing views for post ${postId}:`, error)
      return null
    }
  }

  async likePost(postId: string, userEmail?: string): Promise<{ likes: number } | null> {
    try {
      const posts = (await kv.get<Post[]>(this.POSTS_KEY)) || []
      const postIndex = posts.findIndex((p) => p.id === postId && p.status === "active")

      if (postIndex === -1) return null

      posts[postIndex].likes = (posts[postIndex].likes || 0) + 1
      posts[postIndex].updatedAt = new Date().toISOString()

      await kv.set(this.POSTS_KEY, posts)

      // Award points for liking and receiving likes
      if (userEmail) {
        const liker = await this.getUserByEmail(userEmail)
        const postAuthor = await this.getUserByEmail(posts[postIndex].authorEmail || "")
        const settings = await this.getRewardsSettings()

        if (liker) {
          await this.awardPoints(liker.id, settings.pointsPerLike, "Liked a post", "like_given")
        }

        if (postAuthor && postAuthor.email !== userEmail) {
          await this.awardPoints(
            postAuthor.id,
            settings.pointsPerReceivingLike,
            "Received a like on post",
            "like_received",
          )
        }
      }

      console.log(`👍 Post ${postId} likes incremented to ${posts[postIndex].likes}`)

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

      // Award points for creating a reply
      if (data.authorEmail) {
        const user = await this.getUserByEmail(data.authorEmail)
        if (user) {
          const settings = await this.getRewardsSettings()
          await this.awardPoints(user.id, settings.pointsPerReply, "Created a reply", "reply_creation")
        }
      }

      console.log("✅ Reply created and saved:", reply)
      return reply
    } catch (error) {
      console.error("Error creating reply:", error)
      throw error
    }
  }

  async likeReply(replyId: string, userEmail?: string): Promise<{ likes: number } | null> {
    try {
      const replies = (await kv.get<Reply[]>(this.REPLIES_KEY)) || []
      const replyIndex = replies.findIndex((r) => r.id === replyId && r.status === "active")

      if (replyIndex === -1) return null

      replies[replyIndex].likes = (replies[replyIndex].likes || 0) + 1
      replies[replyIndex].updatedAt = new Date().toISOString()

      await kv.set(this.REPLIES_KEY, replies)

      // Award points for liking and receiving likes
      if (userEmail) {
        const liker = await this.getUserByEmail(userEmail)
        const replyAuthor = await this.getUserByEmail(replies[replyIndex].authorEmail || "")
        const settings = await this.getRewardsSettings()

        if (liker) {
          await this.awardPoints(liker.id, settings.pointsPerLike, "Liked a reply", "like_given")
        }

        if (replyAuthor && replyAuthor.email !== userEmail) {
          await this.awardPoints(
            replyAuthor.id,
            settings.pointsPerReceivingLike,
            "Received a like on reply",
            "like_received",
          )
        }
      }

      console.log(`👍 Reply ${replyId} likes incremented to ${replies[replyIndex].likes}`)

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

      // Update post reply count
      const posts = (await kv.get<Post[]>(this.POSTS_KEY)) || []
      const postIndex = posts.findIndex((p) => p.id === reply.postId)

      if (postIndex !== -1 && posts[postIndex].replies > 0) {
        posts[postIndex].replies--
        posts[postIndex].updatedAt = new Date().toISOString()
        await kv.set(this.POSTS_KEY, posts)
      }

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

      // Initialize user rewards
      const userRewards: UserRewards = {
        userId: user.id,
        totalPoints: 0,
        dailyPoints: 0,
        lastDailyReset: new Date().toISOString(),
        pointsHistory: [],
        redeemedCoupons: [],
      }

      const allRewards = await this.getAllUserRewards()
      allRewards.push(userRewards)
      await kv.set(this.USER_REWARDS_KEY, allRewards)

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
      await kv.del(this.REWARDS_SETTINGS_KEY)
      await kv.del(this.USER_REWARDS_KEY)
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
      const rewardsSettings = (await kv.get<RewardsSettings>(this.REWARDS_SETTINGS_KEY)) || null
      const userRewards = (await kv.get<UserRewards[]>(this.USER_REWARDS_KEY)) || []
      const initialized = await kv.get(this.INITIALIZED_KEY)

      return {
        categories,
        posts,
        replies,
        users,
        rewardsSettings,
        userRewards,
        initialized,
      }
    } catch (error) {
      console.error("Error getting all data:", error)
      return {
        categories: [],
        posts: [],
        replies: [],
        users: [],
        rewardsSettings: null,
        userRewards: [],
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
