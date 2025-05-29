// This is a mock implementation of the forum data store
// In a real application, this would be replaced with a database

class ForumDataStore {
  private categories: any[] = []
  private posts: any[] = []
  private users: any[] = []
  private settings: any = {}
  private replies: any[] = []
  private initialized = false

  constructor() {
    console.log("🔧 ForumDataStore: Initializing...")
    this.initializeDefaultData()
    this.autoInitializeIfEmpty()
  }

  private async autoInitializeIfEmpty() {
    try {
      setTimeout(async () => {
        if (!this.initialized && this.users.length === 0 && this.categories.length === 0) {
          console.log("🔄 Auto-initializing empty system...")
          await this.createDefaultAdmin()
          this.createDefaultCategories()
          this.initialized = true
        }
      }, 1000)
    } catch (error) {
      console.error("❌ Auto-initialization error:", error)
    }
  }

  private async createDefaultAdmin() {
    try {
      const adminUser = await this.addUser({
        username: "admin",
        name: "System Administrator",
        password: this.simpleHash("admin123"),
        role: "admin",
      })
      console.log("✅ Default admin user created:", adminUser.username)
    } catch (error) {
      console.error("❌ Failed to create default admin:", error)
    }
  }

  private createDefaultCategories() {
    try {
      const defaultCategories = [
        {
          name: "General Discussion",
          description: "General topics and conversations",
          color: "#3B82F6",
          icon: "MessageSquare",
        },
        {
          name: "Help & Support",
          description: "Get help with your questions",
          color: "#10B981",
          icon: "HelpCircle",
        },
      ]

      for (const categoryData of defaultCategories) {
        try {
          const category = this.createCategory(categoryData)
          console.log("✅ Default category created:", category.name)
        } catch (error) {
          console.error("❌ Failed to create default category:", error)
        }
      }
    } catch (error) {
      console.error("❌ Failed to create default categories:", error)
    }
  }

  private initializeDefaultData() {
    this.categories = []
    this.posts = []
    this.users = []
    this.replies = []

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
    try {
      console.log(`🔍 Getting category by ID: ${id}`)
      if (!Array.isArray(this.categories)) {
        console.warn("⚠️ Categories is not an array, resetting to default")
        this.categories = []
        return null
      }

      const category = this.categories.find((cat) => cat.id === id)
      console.log(`🔍 Category found:`, category ? "Yes" : "No")
      return category || null
    } catch (error) {
      console.error(`❌ Error getting category by ID ${id}:`, error)
      return null
    }
  }

  createCategory(categoryData: any) {
    try {
      console.log("📝 Creating new category:", categoryData)

      // Validate required fields
      if (!categoryData.name || !categoryData.description) {
        throw new Error("Category name and description are required")
      }

      const newCategory = {
        id: `cat-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        name: categoryData.name,
        description: categoryData.description,
        color: categoryData.color || "#3B82F6",
        icon: categoryData.icon || "MessageSquare",
        isPrivate: categoryData.isPrivate || false,
        moderators: categoryData.moderators || ["admin@store.com"],
        postCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      if (!Array.isArray(this.categories)) {
        console.warn("⚠️ Categories is not an array, resetting to default")
        this.categories = []
      }

      this.categories.push(newCategory)
      console.log(`✅ Category created with ID: ${newCategory.id}`)
      return newCategory
    } catch (error) {
      console.error("❌ Error creating category:", error)
      throw error
    }
  }

  updateCategory(id: string, updates: any) {
    try {
      console.log(`🔄 Updating category ${id}:`, updates)

      if (!Array.isArray(this.categories)) {
        console.warn("⚠️ Categories is not an array, resetting to default")
        this.categories = []
        return null
      }

      const index = this.categories.findIndex((cat) => cat.id === id)
      if (index === -1) {
        console.warn(`⚠️ Category not found: ${id}`)
        return null
      }

      this.categories[index] = {
        ...this.categories[index],
        ...updates,
        updatedAt: new Date().toISOString(),
      }

      console.log(`✅ Category ${id} updated successfully`)
      return this.categories[index]
    } catch (error) {
      console.error(`❌ Error updating category ${id}:`, error)
      return null
    }
  }

  deleteCategory(id: string) {
    try {
      console.log(`🗑️ Deleting category: ${id}`)

      if (!Array.isArray(this.categories)) {
        console.warn("⚠️ Categories is not an array, resetting to default")
        this.categories = []
        return false
      }

      const index = this.categories.findIndex((cat) => cat.id === id)
      if (index === -1) {
        console.warn(`⚠️ Category not found: ${id}`)
        return false
      }

      if (!Array.isArray(this.posts)) {
        console.warn("⚠️ Posts is not an array, resetting to default")
        this.posts = []
      }

      const hasPosts = this.posts.some((post) => post.categoryId === id)
      if (hasPosts) {
        console.warn(`⚠️ Cannot delete category ${id} because it has posts`)
        return false
      }

      this.categories.splice(index, 1)
      console.log(`✅ Category ${id} deleted successfully`)
      return true
    } catch (error) {
      console.error(`❌ Error deleting category ${id}:`, error)
      return false
    }
  }

  // Post methods
  getPosts() {
    try {
      console.log("📝 Getting all posts")

      if (!Array.isArray(this.posts)) {
        console.warn("⚠️ Posts is not an array, resetting to default")
        this.posts = []
      }

      console.log(`📊 Returning ${this.posts.length} posts`)
      return this.posts
    } catch (error) {
      console.error("❌ Error in getPosts:", error)
      return []
    }
  }

  getPostById(id: string) {
    try {
      console.log(`🔍 Getting post by ID: ${id}`)

      if (!Array.isArray(this.posts)) {
        console.warn("⚠️ Posts is not an array, resetting to default")
        this.posts = []
        return null
      }

      const post = this.posts.find((post) => post.id === id)
      console.log(`🔍 Post found:`, post ? "Yes" : "No")
      return post || null
    } catch (error) {
      console.error(`❌ Error getting post by ID ${id}:`, error)
      return null
    }
  }

  createPost(postData: any) {
    try {
      console.log("📝 Creating new post:", postData)

      // Validate required fields
      if (!postData.title || !postData.content || !postData.author || !postData.categoryId) {
        const missing = []
        if (!postData.title) missing.push("title")
        if (!postData.content) missing.push("content")
        if (!postData.author) missing.push("author")
        if (!postData.categoryId) missing.push("categoryId")
        throw new Error(`Missing required fields: ${missing.join(", ")}`)
      }

      // Verify category exists
      const category = this.getCategoryById(postData.categoryId)
      if (!category) {
        throw new Error(`Category with ID ${postData.categoryId} not found`)
      }

      // Ensure tags is an array
      const tags = Array.isArray(postData.tags)
        ? postData.tags
        : typeof postData.tags === "string"
          ? postData.tags
              .split(",")
              .map((t) => t.trim())
              .filter(Boolean)
          : []

      const newPost = {
        id: `post-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        title: postData.title,
        content: postData.content,
        author: postData.author,
        authorEmail: postData.authorEmail || "",
        categoryId: postData.categoryId,
        tags,
        replies: 0,
        views: 0,
        likes: 0,
        isPinned: false,
        isLocked: false,
        status: "active",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      if (!Array.isArray(this.posts)) {
        console.warn("⚠️ Posts is not an array, resetting to default")
        this.posts = []
      }

      this.posts.push(newPost)
      console.log(`✅ Post created with ID: ${newPost.id}`)

      // Update category post count
      if (!Array.isArray(this.categories)) {
        console.warn("⚠️ Categories is not an array, resetting to default")
        this.categories = []
      }

      const categoryIndex = this.categories.findIndex((cat) => cat.id === postData.categoryId)
      if (categoryIndex !== -1) {
        this.categories[categoryIndex].postCount = (this.categories[categoryIndex].postCount || 0) + 1
        this.categories[categoryIndex].lastActivity = newPost.createdAt
        console.log(
          `📊 Updated post count for category ${postData.categoryId} to ${this.categories[categoryIndex].postCount}`,
        )
      } else {
        console.warn(`⚠️ Category not found for post count update: ${postData.categoryId}`)
      }

      return newPost
    } catch (error) {
      console.error("❌ Error creating post:", error)
      throw error
    }
  }

  updatePost(id: string, updates: any) {
    try {
      console.log(`🔄 Updating post ${id}:`, updates)

      if (!Array.isArray(this.posts)) {
        console.warn("⚠️ Posts is not an array, resetting to default")
        this.posts = []
        return null
      }

      const index = this.posts.findIndex((post) => post.id === id)
      if (index === -1) {
        console.warn(`⚠️ Post not found: ${id}`)
        return null
      }

      this.posts[index] = {
        ...this.posts[index],
        ...updates,
        updatedAt: new Date().toISOString(),
      }

      console.log(`✅ Post ${id} updated successfully`)
      return this.posts[index]
    } catch (error) {
      console.error(`❌ Error updating post ${id}:`, error)
      return null
    }
  }

  deletePost(id: string) {
    try {
      console.log(`🗑️ Deleting post: ${id}`)

      if (!Array.isArray(this.posts)) {
        console.warn("⚠️ Posts is not an array, resetting to default")
        this.posts = []
        return false
      }

      const index = this.posts.findIndex((post) => post.id === id)
      if (index === -1) {
        console.warn(`⚠️ Post not found: ${id}`)
        return false
      }

      const categoryId = this.posts[index].categoryId
      this.posts.splice(index, 1)
      console.log(`✅ Post ${id} deleted successfully`)

      if (!Array.isArray(this.categories)) {
        console.warn("⚠️ Categories is not an array, resetting to default")
        this.categories = []
      }

      const categoryIndex = this.categories.findIndex((cat) => cat.id === categoryId)
      if (categoryIndex !== -1 && this.categories[categoryIndex].postCount > 0) {
        this.categories[categoryIndex].postCount--
        console.log(`📊 Updated post count for category ${categoryId} to ${this.categories[categoryIndex].postCount}`)
      } else {
        console.warn(`⚠️ Category not found for post count update: ${categoryId}`)
      }

      return true
    } catch (error) {
      console.error(`❌ Error deleting post ${id}:`, error)
      return false
    }
  }

  // Settings methods
  getSettings() {
    try {
      console.log("⚙️ Getting settings")
      return this.settings || {}
    } catch (error) {
      console.error("❌ Error getting settings:", error)
      return {}
    }
  }

  updateSettings(updates: any) {
    try {
      console.log("🔄 Updating settings:", updates)
      this.settings = {
        ...this.settings,
        ...updates,
        lastUpdated: new Date().toISOString(),
      }
      console.log("✅ Settings updated successfully")
      return this.settings
    } catch (error) {
      console.error("❌ Error updating settings:", error)
      return this.settings
    }
  }

  // User methods
  async addUser(user: Omit<any, "id" | "createdAt" | "lastActive">) {
    try {
      console.log("👤 DataStore: Adding new user:", user.username)

      const newUser = {
        ...user,
        id: `user-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        createdAt: new Date().toISOString(),
        lastActive: new Date().toISOString(),
      }

      if (!Array.isArray(this.users)) {
        console.warn("⚠️ Users is not an array, resetting to default")
        this.users = []
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

      if (!Array.isArray(this.users)) {
        console.warn("⚠️ Users is not an array, resetting to default")
        this.users = []
        return null
      }

      const user = this.users.find((u) => u.id === id)
      console.log(`🔍 DataStore: User found:`, user ? "Yes" : "No")
      return user || null
    } catch (error) {
      console.error("❌ DataStore: Error getting user by ID:", error)
      return null
    }
  }

  async getUserByUsername(username: string) {
    try {
      console.log(`🔍 DataStore: Looking for user with username: ${username}`)

      if (!Array.isArray(this.users)) {
        console.warn("⚠️ Users is not an array, resetting to default")
        this.users = []
        return null
      }

      const user = this.users.find((u) => u.username === username)
      console.log(`🔍 DataStore: User found:`, user ? "Yes" : "No")
      return user || null
    } catch (error) {
      console.error("❌ DataStore: Error getting user by username:", error)
      return null
    }
  }

  async updateUserActivity(userId: string) {
    try {
      console.log(`🔄 DataStore: Updating activity for user: ${userId}`)

      if (!Array.isArray(this.users)) {
        console.warn("⚠️ Users is not an array, resetting to default")
        this.users = []
        return
      }

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

      if (!Array.isArray(this.users)) {
        console.warn("⚠️ Users is not an array, resetting to default")
        this.users = []
        return false
      }

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
      hash = hash & hash
    }
    return hash.toString()
  }

  // Stats methods
  getStats() {
    try {
      console.log("📊 Calculating forum stats")

      if (!Array.isArray(this.categories)) this.categories = []
      if (!Array.isArray(this.posts)) this.posts = []
      if (!Array.isArray(this.users)) this.users = []

      const totalPosts = this.posts.length
      const totalUsers = this.users.length
      const totalCategories = this.categories.length
      const activeToday = Math.min(totalUsers, 3)
      const postsThisMonth = Math.floor(totalPosts * 0.7)
      const newUsersThisMonth = Math.floor(totalUsers * 0.3)

      const topCategories = this.categories
        .map((cat) => ({
          id: cat.id,
          name: cat.name,
          posts: cat.postCount || 0,
        }))
        .sort((a, b) => b.posts - a.posts)
        .slice(0, 3)

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

  incrementPostViews(postId: string) {
    try {
      console.log(`👁️ Incrementing views for post: ${postId}`)

      if (!Array.isArray(this.posts)) {
        console.warn("⚠️ Posts is not an array, resetting to default")
        this.posts = []
        return false
      }

      const postIndex = this.posts.findIndex((post) => post.id === postId)
      if (postIndex === -1) {
        console.warn(`⚠️ Post not found for view increment: ${postId}`)
        return false
      }

      this.posts[postIndex].views = (this.posts[postIndex].views || 0) + 1
      console.log(`✅ Views for post ${postId} incremented to ${this.posts[postIndex].views}`)
      return true
    } catch (error) {
      console.error(`❌ Error incrementing post views for ${postId}:`, error)
      return false
    }
  }

  likePost(postId: string) {
    try {
      console.log(`❤️ Liking post: ${postId}`)

      if (!Array.isArray(this.posts)) {
        console.warn("⚠️ Posts is not an array, resetting to default")
        this.posts = []
        return null
      }

      const postIndex = this.posts.findIndex((post) => post.id === postId)
      if (postIndex === -1) {
        console.warn(`⚠️ Post not found for liking: ${postId}`)
        return null
      }

      this.posts[postIndex].likes = (this.posts[postIndex].likes || 0) + 1
      console.log(`✅ Likes for post ${postId} incremented to ${this.posts[postIndex].likes}`)
      return {
        likes: this.posts[postIndex].likes,
      }
    } catch (error) {
      console.error(`❌ Error liking post ${postId}:`, error)
      return null
    }
  }

  addReply(replyData: any) {
    try {
      console.log(`💬 Adding reply to post: ${replyData.postId}`)

      if (!Array.isArray(this.posts)) {
        console.warn("⚠️ Posts is not an array, resetting to default")
        this.posts = []
        return null
      }

      const postIndex = this.posts.findIndex((post) => post.id === replyData.postId)
      if (postIndex === -1) {
        console.warn(`⚠️ Post not found for reply: ${replyData.postId}`)
        return null
      }

      if (!Array.isArray(this.replies)) {
        this.replies = []
      }

      const newReply = {
        id: `reply-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        postId: replyData.postId,
        content: replyData.content,
        author: replyData.author,
        authorEmail: replyData.authorEmail || "",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        likes: 0,
        status: "active",
      }

      this.replies.push(newReply)
      this.posts[postIndex].replies = (this.posts[postIndex].replies || 0) + 1
      this.posts[postIndex].updatedAt = new Date().toISOString()

      console.log(`✅ Reply added to post ${replyData.postId}, new reply count: ${this.posts[postIndex].replies}`)
      return newReply
    } catch (error) {
      console.error(`❌ Error adding reply to post:`, error)
      return null
    }
  }

  getRepliesByPostId(postId: string) {
    try {
      console.log(`🔍 Getting replies for post: ${postId}`)

      if (!Array.isArray(this.replies)) {
        console.log(`ℹ️ No replies array, initializing empty array`)
        this.replies = []
        return []
      }

      const postReplies = this.replies.filter((reply) => reply.postId === postId && reply.status === "active")
      console.log(`📊 Found ${postReplies.length} replies for post ${postId}`)
      return postReplies
    } catch (error) {
      console.error(`❌ Error getting replies for post ${postId}:`, error)
      return []
    }
  }

  likeReply(replyId: string) {
    try {
      console.log(`❤️ Liking reply: ${replyId}`)

      if (!Array.isArray(this.replies)) {
        console.warn("⚠️ Replies is not an array, resetting to default")
        this.replies = []
        return null
      }

      const replyIndex = this.replies.findIndex((reply) => reply.id === replyId)
      if (replyIndex === -1) {
        console.warn(`⚠️ Reply not found for liking: ${replyId}`)
        return null
      }

      this.replies[replyIndex].likes = (this.replies[replyIndex].likes || 0) + 1
      console.log(`✅ Likes for reply ${replyId} incremented to ${this.replies[replyIndex].likes}`)
      return {
        likes: this.replies[replyIndex].likes,
      }
    } catch (error) {
      console.error(`❌ Error liking reply ${replyId}:`, error)
      return null
    }
  }
}

// Create a singleton instance
export const forumDataStore = new ForumDataStore()
