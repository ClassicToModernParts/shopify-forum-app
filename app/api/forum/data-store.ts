// Simple in-memory data store for forum data
// In a real application, this would be a database

interface Post {
  id: string
  title: string
  content: string
  authorId: string
  categoryId: string
  createdAt: string
  updatedAt: string
}

interface User {
  id: string
  email: string
  username: string
  name: string
  password: string
  phone?: string
  role: "admin" | "user"
  createdAt: string
  lastActive: string
}

interface Category {
  id: string
  name: string
  description: string
  color?: string
  createdAt: string
}

interface PasswordResetToken {
  userId: string
  token: string
  type: "email" | "sms"
  createdAt: string
  expiresAt: string
}

interface SMSVerificationCode {
  userId: string
  code: string
  phone: string
  createdAt: string
  expiresAt: string
  attempts: number
}

class ForumDataStore {
  private posts: Post[] = []
  private users: User[] = []
  private categories: Category[] = []
  private passwordResetTokens: PasswordResetToken[] = []
  private smsVerificationCodes: SMSVerificationCode[] = []

  // Posts
  addPost(post: Omit<Post, "id" | "createdAt" | "updatedAt">) {
    const newPost: Post = {
      ...post,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    this.posts.push(newPost)
    return newPost
  }

  getPosts() {
    return this.posts
  }

  getPostsByCategory(categoryId: string) {
    return this.posts.filter((post) => post.categoryId === categoryId)
  }

  getPostsByUser(userId: string) {
    return this.posts.filter((post) => post.authorId === userId)
  }

  // Users
  addUser(user: Omit<User, "id" | "createdAt" | "lastActive">) {
    const newUser: User = {
      ...user,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      lastActive: new Date().toISOString(),
    }
    this.users.push(newUser)
    return newUser
  }

  getUsers() {
    return this.users
  }

  getUserById(id: string) {
    return this.users.find((u) => u.id === id)
  }

  getUserByEmail(email: string) {
    return this.users.find((u) => u.email === email)
  }

  getUserByPhone(phone: string) {
    const cleanPhone = phone.replace(/\D/g, "")
    return this.users.find((u) => u.phone?.replace(/\D/g, "") === cleanPhone)
  }

  getUserByUsername(username: string) {
    return this.users.find((u) => u.username === username)
  }

  updateUserActivity(userId: string) {
    const user = this.users.find((u) => u.id === userId)
    if (user) {
      user.lastActive = new Date().toISOString()
    }
  }

  updateUserPassword(userId: string, newPassword: string) {
    const user = this.users.find((u) => u.id === userId)
    if (user) {
      user.password = newPassword
      return true
    }
    return false
  }

  // SMS Verification Codes
  setSMSVerificationCode(userId: string, code: string, phone: string) {
    // Remove existing codes for this user
    this.smsVerificationCodes = this.smsVerificationCodes.filter((c) => c.userId !== userId)

    const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
    this.smsVerificationCodes.push({
      userId,
      code,
      phone,
      createdAt: new Date().toISOString(),
      expiresAt: expiresAt.toISOString(),
      attempts: 0,
    })
  }

  verifySMSCode(code: string, phone: string): User | null {
    const cleanPhone = phone.replace(/\D/g, "")
    const verification = this.smsVerificationCodes.find(
      (v) => v.code === code && v.phone.replace(/\D/g, "") === cleanPhone,
    )

    if (!verification) {
      return null
    }

    // Check if expired
    if (new Date() > new Date(verification.expiresAt)) {
      return null
    }

    // Check attempts (max 3)
    if (verification.attempts >= 3) {
      return null
    }

    // Increment attempts
    verification.attempts++

    // If code matches, return user and remove verification
    const user = this.getUserById(verification.userId)
    if (user) {
      this.smsVerificationCodes = this.smsVerificationCodes.filter((v) => v.userId !== verification.userId)
    }

    return user
  }

  // Password Reset Tokens
  setPasswordResetToken(userId: string, token: string, type: "email" | "sms" = "email") {
    // Remove existing tokens for this user
    this.passwordResetTokens = this.passwordResetTokens.filter((t) => t.userId !== userId)

    const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hour
    this.passwordResetTokens.push({
      userId,
      token,
      type,
      createdAt: new Date().toISOString(),
      expiresAt: expiresAt.toISOString(),
    })
  }

  getUserByResetToken(token: string): User | null {
    const resetToken = this.passwordResetTokens.find((t) => t.token === token)
    if (!resetToken) {
      return null
    }

    // Check if expired
    if (new Date() > new Date(resetToken.expiresAt)) {
      return null
    }

    return this.getUserById(resetToken.userId)
  }

  clearPasswordResetToken(userId: string) {
    this.passwordResetTokens = this.passwordResetTokens.filter((t) => t.userId !== userId)
  }

  // Categories
  addCategory(category: Omit<Category, "id" | "createdAt">) {
    const newCategory: Category = {
      ...category,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    }
    this.categories.push(newCategory)
    return newCategory
  }

  getCategories() {
    return this.categories
  }

  getCategoryById(id: string) {
    return this.categories.find((c) => c.id === id)
  }

  updateCategory(id: string, updates: Partial<Omit<Category, "id" | "createdAt">>) {
    const categoryIndex = this.categories.findIndex((c) => c.id === id)
    if (categoryIndex !== -1) {
      this.categories[categoryIndex] = { ...this.categories[categoryIndex], ...updates }
      return this.categories[categoryIndex]
    }
    return null
  }

  deleteCategory(id: string) {
    const categoryIndex = this.categories.findIndex((c) => c.id === id)
    if (categoryIndex !== -1) {
      this.categories.splice(categoryIndex, 1)
      return true
    }
    return false
  }

  // Statistics
  getStats() {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    const activeToday = this.users.filter((user) => new Date(user.lastActive) >= today).length

    const postsThisMonth = this.posts.filter((post) => new Date(post.createdAt) >= thisMonth).length

    const newUsersThisMonth = this.users.filter((user) => new Date(user.createdAt) >= thisMonth).length

    // Top categories by post count
    const categoryPostCounts = this.categories
      .map((category) => ({
        name: category.name,
        posts: this.getPostsByCategory(category.id).length,
      }))
      .sort((a, b) => b.posts - a.posts)
      .slice(0, 5)

    // Recent activity (last 10 posts)
    const recentActivity = this.posts
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 10)
      .map((post) => {
        const author = this.getUserById(post.authorId)
        const category = this.getCategoryById(post.categoryId)
        return {
          type: "post",
          title: post.title,
          author: author?.name || "Unknown",
          category: category?.name || "Unknown",
          timestamp: post.createdAt,
        }
      })

    return {
      totalPosts: this.posts.length,
      totalUsers: this.users.length,
      totalCategories: this.categories.length,
      activeToday,
      postsThisMonth,
      newUsersThisMonth,
      topCategories: categoryPostCounts,
      recentActivity,
    }
  }
}

// Export a singleton instance
export const forumDataStore = new ForumDataStore()
