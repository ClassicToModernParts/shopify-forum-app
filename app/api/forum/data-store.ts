import { promises as fs } from "fs"
import path from "path"

// Simple file-based data store for forum data
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
  email?: string
  username: string
  name: string
  password: string
  phone?: string
  securityQuestion?: string
  securityAnswer?: string
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

interface ForumData {
  posts: Post[]
  users: User[]
  categories: Category[]
}

class ForumDataStore {
  private posts: Post[] = []
  private users: User[] = []
  private categories: Category[] = []
  private dataFile = path.join(process.cwd(), "data", "forum-data.json")

  constructor() {
    this.loadData()
  }

  // Load data from file
  private async loadData() {
    try {
      // Ensure data directory exists
      const dataDir = path.dirname(this.dataFile)
      await fs.mkdir(dataDir, { recursive: true })

      // Try to read existing data
      const data = await fs.readFile(this.dataFile, "utf-8")
      const parsedData: ForumData = JSON.parse(data)

      this.posts = parsedData.posts || []
      this.users = parsedData.users || []
      this.categories = parsedData.categories || []

      console.log(`Loaded ${this.users.length} users, ${this.posts.length} posts, ${this.categories.length} categories`)
    } catch (error) {
      // File doesn't exist or is invalid, start with empty data
      console.log("No existing data found, starting with empty store")
      this.posts = []
      this.users = []
      this.categories = []
    }
  }

  // Save data to file
  private async saveData() {
    try {
      const dataDir = path.dirname(this.dataFile)
      await fs.mkdir(dataDir, { recursive: true })

      const data: ForumData = {
        posts: this.posts,
        users: this.users,
        categories: this.categories,
      }

      await fs.writeFile(this.dataFile, JSON.stringify(data, null, 2))
      console.log("Data saved successfully")
    } catch (error) {
      console.error("Failed to save data:", error)
      // Fallback to memory-only operation
    }
  }

  // Posts
  addPost(post: Omit<Post, "id" | "createdAt" | "updatedAt">) {
    const newPost: Post = {
      ...post,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    this.posts.push(newPost)
    this.saveData() // Save after adding
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
    this.saveData() // Save after adding
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

  getUserByUsername(username: string) {
    return this.users.find((u) => u.username === username)
  }

  updateUserActivity(userId: string) {
    const user = this.users.find((u) => u.id === userId)
    if (user) {
      user.lastActive = new Date().toISOString()
      this.saveData() // Save after updating
    }
  }

  updateUserPassword(userId: string, newPassword: string) {
    const user = this.users.find((u) => u.id === userId)
    if (user) {
      user.password = newPassword
      this.saveData() // Save after updating
      return true
    }
    return false
  }

  // Security Questions
  updateSecurityQuestion(userId: string, question: string, answer: string) {
    const user = this.users.find((u) => u.id === userId)
    if (user) {
      user.securityQuestion = question
      // Simple hash for security answer (case-insensitive)
      user.securityAnswer = this.simpleHash(answer.toLowerCase().trim())
      this.saveData() // Save after updating
      return true
    }
    return false
  }

  verifySecurityAnswer(userId: string, answer: string): boolean {
    const user = this.users.find((u) => u.id === userId)
    if (!user || !user.securityAnswer) {
      return false
    }
    const hashedAnswer = this.simpleHash(answer.toLowerCase().trim())
    return user.securityAnswer === hashedAnswer
  }

  // Simple hash function
  private simpleHash(text: string): string {
    let hash = 0
    for (let i = 0; i < text.length; i++) {
      const char = text.charCodeAt(i)
      hash = (hash << 5) - hash + char
      hash = hash & hash // Convert to 32bit integer
    }
    return hash.toString()
  }

  // Categories
  addCategory(category: Omit<Category, "id" | "createdAt">) {
    const newCategory: Category = {
      ...category,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    }
    this.categories.push(newCategory)
    this.saveData() // Save after adding
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
      this.saveData() // Save after updating
      return this.categories[categoryIndex]
    }
    return null
  }

  deleteCategory(id: string) {
    const categoryIndex = this.categories.findIndex((c) => c.id === id)
    if (categoryIndex !== -1) {
      this.categories.splice(categoryIndex, 1)
      this.saveData() // Save after deleting
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
