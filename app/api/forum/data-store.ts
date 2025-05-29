// This is a mock implementation of the forum data store
// In a real application, this would be replaced with a database

class ForumDataStore {
  private categories: any[] = []
  private posts: any[] = []
  private users: any[] = []
  private settings: any = {}

  constructor() {
    // Initialize with some default data
    this.initializeDefaultData()
  }

  private initializeDefaultData() {
    // Default categories
    this.categories = [
      {
        id: "cat-1",
        name: "General Discussion",
        description: "General topics related to our products",
        postCount: 5,
        color: "#3B82F6",
        icon: "MessageSquare",
        isPrivate: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "cat-2",
        name: "Product Support",
        description: "Get help with our products",
        postCount: 3,
        color: "#10B981",
        icon: "HelpCircle",
        isPrivate: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "cat-3",
        name: "Feature Requests",
        description: "Suggest new features for our products",
        postCount: 2,
        color: "#F59E0B",
        icon: "Lightbulb",
        isPrivate: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ]

    // Default posts
    this.posts = [
      {
        id: "post-1",
        title: "Welcome to our community forum!",
        content: "This is the first post in our community forum. Feel free to introduce yourself!",
        author: "Admin",
        categoryId: "cat-1",
        createdAt: new Date().toISOString(),
        replies: 2,
        views: 120,
        likes: 15,
        isPinned: true,
        isLocked: false,
        status: "active",
      },
      {
        id: "post-2",
        title: "How to get started with our product",
        content: "Here are some tips to get started with our product...",
        author: "Support Team",
        categoryId: "cat-2",
        createdAt: new Date().toISOString(),
        replies: 5,
        views: 85,
        likes: 10,
        isPinned: false,
        isLocked: false,
        status: "active",
      },
    ]

    // Default users
    this.users = [
      {
        id: "user-1",
        name: "Admin User",
        email: "admin@example.com",
        role: "admin",
        createdAt: new Date().toISOString(),
      },
      {
        id: "user-2",
        name: "Regular User",
        email: "user@example.com",
        role: "user",
        createdAt: new Date().toISOString(),
      },
    ]

    // Default settings
    this.settings = {
      general: {
        forumName: "Community Forum",
        description: "Connect with other customers and get support",
        welcomeMessage: "Welcome to our community! Please read the guidelines before posting.",
        contactEmail: "support@yourstore.com",
      },
      moderation: {
        requireApproval: false,
        autoSpamDetection: true,
        allowAnonymous: false,
        enableReporting: true,
        maxPostLength: 5000,
      },
      appearance: {
        primaryColor: "#3B82F6",
        accentColor: "#10B981",
        darkMode: false,
        customCSS: "",
      },
      notifications: {
        emailNotifications: true,
        newPostNotifications: true,
        moderationAlerts: true,
      },
      lastUpdated: new Date().toISOString(),
    }
  }

  // Category methods
  getCategories(includePrivate = false) {
    try {
      console.log("📂 Getting categories, includePrivate:", includePrivate)
      console.log("📂 Current categories:", this.categories)

      if (!Array.isArray(this.categories)) {
        console.warn("⚠️ Categories is not an array, resetting to default")
        this.categories = []
      }

      return includePrivate ? this.categories : this.categories.filter((cat) => !cat.isPrivate)
    } catch (error) {
      console.error("❌ Error in getCategories:", error)
      return []
    }
  }

  getCategoryById(id: string) {
    return this.categories.find((cat) => cat.id === id)
  }

  createCategory(categoryData: any) {
    const newCategory = {
      id: `cat-${Date.now()}`,
      ...categoryData,
      postCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    this.categories.push(newCategory)
    return newCategory
  }

  updateCategory(id: string, updates: any) {
    const index = this.categories.findIndex((cat) => cat.id === id)
    if (index === -1) return null

    this.categories[index] = {
      ...this.categories[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    }

    return this.categories[index]
  }

  deleteCategory(id: string) {
    const index = this.categories.findIndex((cat) => cat.id === id)
    if (index === -1) return false

    // Check if category has posts
    const hasPosts = this.posts.some((post) => post.categoryId === id)
    if (hasPosts) return false

    this.categories.splice(index, 1)
    return true
  }

  // Post methods
  getPosts() {
    try {
      if (!Array.isArray(this.posts)) {
        console.warn("⚠️ Posts is not an array, resetting to default")
        this.posts = []
      }
      return this.posts
    } catch (error) {
      console.error("❌ Error in getPosts:", error)
      return []
    }
  }

  getPostById(id: string) {
    return this.posts.find((post) => post.id === id)
  }

  createPost(postData: any) {
    const newPost = {
      id: `post-${Date.now()}`,
      ...postData,
      replies: 0,
      views: 0,
      likes: 0,
      isPinned: false,
      isLocked: false,
      status: "active",
      createdAt: new Date().toISOString(),
    }
    this.posts.push(newPost)

    // Update category post count
    const categoryIndex = this.categories.findIndex((cat) => cat.id === postData.categoryId)
    if (categoryIndex !== -1) {
      this.categories[categoryIndex].postCount = (this.categories[categoryIndex].postCount || 0) + 1
    }

    return newPost
  }

  updatePost(id: string, updates: any) {
    const index = this.posts.findIndex((post) => post.id === id)
    if (index === -1) return null

    this.posts[index] = {
      ...this.posts[index],
      ...updates,
    }

    return this.posts[index]
  }

  deletePost(id: string) {
    const index = this.posts.findIndex((post) => post.id === id)
    if (index === -1) return false

    const categoryId = this.posts[index].categoryId

    // Delete the post
    this.posts.splice(index, 1)

    // Update category post count
    const categoryIndex = this.categories.findIndex((cat) => cat.id === categoryId)
    if (categoryIndex !== -1 && this.categories[categoryIndex].postCount > 0) {
      this.categories[categoryIndex].postCount--
    }

    return true
  }

  // Settings methods
  getSettings() {
    return this.settings
  }

  updateSettings(updates: any) {
    this.settings = {
      ...this.settings,
      ...updates,
      lastUpdated: new Date().toISOString(),
    }
    return this.settings
  }

  // User methods
  async addUser(user: Omit<any, "id" | "createdAt" | "lastActive">) {
    try {
      console.log("👤 DataStore: Adding new user:", user.username)

      const newUser = {
        ...user,
        id: `user-${Date.now()}`,
        createdAt: new Date().toISOString(),
        lastActive: new Date().toISOString(),
      }

      this.users.push(newUser)
      console.log(`✅ DataStore: User ${user.username} added successfully with ID ${newUser.id}`)
      console.log(`📊 DataStore: Total users now: ${this.users.length}`)

      return newUser
    } catch (error) {
      console.error("❌ DataStore: Error adding user:", error)
      throw error
    }
  }

  async getUsers() {
    try {
      console.log("👥 DataStore: Getting all users")
      if (!Array.isArray(this.users)) {
        console.warn("⚠️ Users is not an array, resetting to default")
        this.users = []
      }
      console.log(`📊 DataStore: Returning ${this.users.length} users`)
      return this.users
    } catch (error) {
      console.error("❌ DataStore: Error getting users:", error)
      return []
    }
  }

  async getUserById(id: string) {
    try {
      console.log(`🔍 DataStore: Looking for user with ID: ${id}`)
      const user = this.users.find((u) => u.id === id)
      console.log(`🔍 DataStore: User found:`, user ? "Yes" : "No")
      return user
    } catch (error) {
      console.error("❌ DataStore: Error getting user by ID:", error)
      return null
    }
  }

  async getUserByUsername(username: string) {
    try {
      console.log(`🔍 DataStore: Looking for user with username: ${username}`)
      const user = this.users.find((u) => u.username === username)
      console.log(`🔍 DataStore: User found:`, user ? "Yes" : "No")
      return user
    } catch (error) {
      console.error("❌ DataStore: Error getting user by username:", error)
      return null
    }
  }

  async updateUserActivity(userId: string) {
    try {
      console.log(`🔄 DataStore: Updating activity for user: ${userId}`)
      const user = this.users.find((u) => u.id === userId)
      if (user) {
        user.lastActive = new Date().toISOString()
        console.log(`✅ DataStore: Activity updated for user: ${userId}`)
      } else {
        console.log(`❌ DataStore: User not found for activity update: ${userId}`)
      }
    } catch (error) {
      console.error("❌ DataStore: Error updating user activity:", error)
    }
  }

  async updateSecurityQuestion(userId: string, question: string, answer: string) {
    try {
      console.log(`🔒 DataStore: Updating security question for user: ${userId}`)
      const user = this.users.find((u) => u.id === userId)
      if (user) {
        user.securityQuestion = question
        user.securityAnswer = this.simpleHash(answer.toLowerCase().trim())
        console.log(`✅ DataStore: Security question updated for user: ${userId}`)
        return true
      } else {
        console.log(`❌ DataStore: User not found for security question update: ${userId}`)
        return false
      }
    } catch (error) {
      console.error("❌ DataStore: Error updating security question:", error)
      return false
    }
  }

  private simpleHash(text: string): string {
    let hash = 0
    for (let i = 0; i < text.length; i++) {
      const char = text.charCodeAt(i)
      hash = (hash << 5) - hash + char
      hash = hash & hash // Convert to 32bit integer
    }
    return hash.toString()
  }

  // Stats methods
  getStats() {
    try {
      console.log("📊 Calculating forum stats")

      // Ensure arrays exist
      if (!Array.isArray(this.categories)) this.categories = []
      if (!Array.isArray(this.posts)) this.posts = []
      if (!Array.isArray(this.users)) this.users = []

      // Calculate basic stats
      const totalPosts = this.posts.length
      const totalUsers = this.users.length
      const totalCategories = this.categories.length

      // Calculate active users (mock data)
      const activeToday = Math.min(totalUsers, 3)

      // Calculate monthly stats (mock data)
      const postsThisMonth = Math.floor(totalPosts * 0.7)
      const newUsersThisMonth = Math.floor(totalUsers * 0.3)

      // Get top categories
      const topCategories = this.categories
        .map((cat) => ({
          id: cat.id,
          name: cat.name,
          posts: cat.postCount || 0,
        }))
        .sort((a, b) => b.posts - a.posts)
        .slice(0, 3)

      // Get recent activity (mock data)
      const recentActivity = this.posts.slice(0, 5).map((post) => ({
        id: post.id,
        type: "post",
        title: post.title,
        author: post.author,
        timestamp: post.createdAt,
      }))

      return {
        totalPosts,
        totalUsers,
        totalCategories,
        activeToday,
        postsThisMonth,
        newUsersThisMonth,
        topCategories,
        recentActivity,
      }
    } catch (error) {
      console.error("❌ Error calculating stats:", error)
      return {
        totalPosts: 0,
        totalUsers: 0,
        totalCategories: 0,
        activeToday: 0,
        postsThisMonth: 0,
        newUsersThisMonth: 0,
        topCategories: [],
        recentActivity: [],
      }
    }
  }
}

// Create a singleton instance
export const forumDataStore = new ForumDataStore()
