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

// Memory store as fallback
let memoryStore: ForumData = {
  posts: [],
  users: [],
  categories: [],
}

class ForumDataStore {
  private posts: Post[] = []
  private users: User[] = []
  private categories: Category[] = []
  private dataFile: string
  private isInitialized = false
  private useMemoryFallback = false

  constructor() {
    // Use absolute path for data file
    this.dataFile = path.join(process.cwd(), "data", "forum-data.json")
    this.initialize()
  }

  // Initialize the data store
  private async initialize() {
    try {
      await this.loadData()
      this.isInitialized = true
      console.log("ForumDataStore initialized successfully")
    } catch (error) {
      console.error("Failed to initialize ForumDataStore:", error)
      this.useMemoryFallback = true
      this.loadFromMemory()
      this.isInitialized = true
    }
  }

  // Load data from memory fallback
  private loadFromMemory() {
    console.log("Using memory fallback for data store")
    this.posts = [...memoryStore.posts]
    this.users = [...memoryStore.users]
    this.categories = [...memoryStore.categories]
  }

  // Save to memory fallback
  private saveToMemory() {
    memoryStore = {
      posts: [...this.posts],
      users: [...this.users],
      categories: [...this.categories],
    }
  }

  // Load data from file
  private async loadData() {
    try {
      // Ensure data directory exists
      const dataDir = path.dirname(this.dataFile)
      await fs.mkdir(dataDir, { recursive: true })
      console.log(`Data directory created/verified: ${dataDir}`)

      try {
        // Try to read existing data
        const data = await fs.readFile(this.dataFile, "utf-8")
        console.log(`Data file read successfully: ${this.dataFile}`)

        try {
          const parsedData: ForumData = JSON.parse(data)
          this.posts = parsedData.posts || []
          this.users = parsedData.users || []
          this.categories = parsedData.categories || []
          console.log(
            `Loaded ${this.users.length} users, ${this.posts.length} posts, ${this.categories.length} categories`,
          )
        } catch (parseError) {
          console.error("Error parsing data file:", parseError)
          // If file exists but is invalid, start with empty data
          this.posts = []
          this.users = []
          this.categories = []
          // Try to save valid empty data
          await this.saveData()
        }
      } catch (readError) {
        if ((readError as NodeJS.ErrnoException).code === "ENOENT") {
          console.log("Data file does not exist, creating new file")
          // File doesn't exist, start with empty data
          this.posts = []
          this.users = []
          this.categories = []
          // Create the file with empty data
          await this.saveData()
        } else {
          console.error("Error reading data file:", readError)
          throw readError
        }
      }
    } catch (error) {
      console.error("Failed to load data:", error)
      throw error
    }
  }

  // Save data to file
  private async saveData() {
    if (this.useMemoryFallback) {
      this.saveToMemory()
      return
    }

    try {
      const dataDir = path.dirname(this.dataFile)
      await fs.mkdir(dataDir, { recursive: true })

      const data: ForumData = {
        posts: this.posts,
        users: this.users,
        categories: this.categories,
      }

      await fs.writeFile(this.dataFile, JSON.stringify(data, null, 2))
      console.log(`Data saved successfully to ${this.dataFile}`)
    } catch (error) {
      console.error("Failed to save data:", error)
      // Fallback to memory-only operation
      this.useMemoryFallback = true
      this.saveToMemory()
    }
  }

  // Wait for initialization
  private async ensureInitialized() {
    if (!this.isInitialized) {
      console.log("Waiting for data store initialization...")
      await new Promise<void>((resolve) => {
        const checkInterval = setInterval(() => {
          if (this.isInitialized) {
            clearInterval(checkInterval)
            resolve()
          }
        }, 100)
      })
    }
  }

  // Posts
  async addPost(post: Omit<Post, "id" | "createdAt" | "updatedAt">) {
    await this.ensureInitialized()
    const newPost: Post = {
      ...post,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    this.posts.push(newPost)
    await this.saveData() // Save after adding
    return newPost
  }

  async getPosts() {
    await this.ensureInitialized()
    return this.posts
  }

  async getPostsByCategory(categoryId: string) {
    await this.ensureInitialized()
    return this.posts.filter((post) => post.categoryId === categoryId)
  }

  async getPostsByUser(userId: string) {
    await this.ensureInitialized()
    return this.posts.filter((post) => post.authorId === userId)
  }

  // Users
  async addUser(user: Omit<User, "id" | "createdAt" | "lastActive">) {
    await this.ensureInitialized()
    const newUser: User = {
      ...user,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      lastActive: new Date().toISOString(),
    }
    this.users.push(newUser)
    await this.saveData() // Save after adding
    console.log(`User added: ${newUser.username}, Total users: ${this.users.length}`)
    return newUser
  }

  async getUsers() {
    await this.ensureInitialized()
    return this.users
  }

  async getUserById(id: string) {
    await this.ensureInitialized()
    return this.users.find((u) => u.id === id)
  }

  async getUserByEmail(email: string) {
    await this.ensureInitialized()
    return this.users.find((u) => u.email === email)
  }

  async getUserByUsername(username: string) {
    await this.ensureInitialized()
    return this.users.find((u) => u.username === username)
  }

  async updateUserActivity(userId: string) {
    await this.ensureInitialized()
    const user = this.users.find((u) => u.id === userId)
    if (user) {
      user.lastActive = new Date().toISOString()
      await this.saveData() // Save after updating
    }
  }

  async updateUserPassword(userId: string, newPassword: string) {
    await this.ensureInitialized()
    const user = this.users.find((u) => u.id === userId)
    if (user) {
      user.password = newPassword
      await this.saveData() // Save after updating
      return true
    }
    return false
  }

  // Security Questions
  async updateSecurityQuestion(userId: string, question: string, answer: string) {
    await this.ensureInitialized()
    const user = this.users.find((u) => u.id === userId)
    if (user) {
      user.securityQuestion = question
      // Simple hash for security answer (case-insensitive)
      user.securityAnswer = this.simpleHash(answer.toLowerCase().trim())
      await this.saveData() // Save after updating
      return true
    }
    return false
  }

  async verifySecurityAnswer(userId: string, answer: string): Promise<boolean> {
    await this.ensureInitialized()
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
  async addCategory(category: Omit<Category, "id" | "createdAt">) {
    await this.ensureInitialized()
    const newCategory: Category = {
      ...category,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    }
    this.categories.push(newCategory)
    await this.saveData() // Save after adding
    return newCategory
  }

  async getCategories() {
    await this.ensureInitialized()
    return this.categories
  }

  async getCategoryById(id: string) {
    await this.ensureInitialized()
    return this.categories.find((c) => c.id === id)
  }

  async updateCategory(id: string, updates: Partial<Omit<Category, "id" | "createdAt">>) {
    await this.ensureInitialized()
    const categoryIndex = this.categories.findIndex((c) => c.id === id)
    if (categoryIndex !== -1) {
      this.categories[categoryIndex] = { ...this.categories[categoryIndex], ...updates }
      await this.saveData() // Save after updating
      return this.categories[categoryIndex]
    }
    return null
  }

  async deleteCategory(id: string) {
    await this.ensureInitialized()
    const categoryIndex = this.categories.findIndex((c) => c.id === id)
    if (categoryIndex !== -1) {
      this.categories.splice(categoryIndex, 1)
      await this.saveData() // Save after deleting
      return true
    }
    return false
  }

  // Statistics
  async getStats() {
    await this.ensureInitialized()
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
        posts: this.posts.filter((post) => post.categoryId === category.id).length,
      }))
      .sort((a, b) => b.posts - a.posts)
      .slice(0, 5)

    // Recent activity (last 10 posts)
    const recentActivity = this.posts
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 10)
      .map((post) => {
        const author = this.users.find((u) => u.id === post.authorId)
        const category = this.categories.find((c) => c.id === post.categoryId)
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

  // Debug info
  async getDebugInfo() {
    return {
      isInitialized: this.isInitialized,
      useMemoryFallback: this.useMemoryFallback,
      dataFile: this.dataFile,
      userCount: this.users.length,
      postCount: this.posts.length,
      categoryCount: this.categories.length,
      memoryStoreUserCount: memoryStore.users.length,
    }
  }
}

// Export a singleton instance
export const forumDataStore = new ForumDataStore()
