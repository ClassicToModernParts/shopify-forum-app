// Simple in-memory data store for forum data
// In a real application, this would be a database

interface Post {
  id: string
  title: string
  content: string
  author: string
  categoryId: string
  createdAt: string
  updatedAt: string
}

interface User {
  id: string
  email: string
  name: string
  createdAt: string
  lastActive: string
}

interface Category {
  id: string
  name: string
  description: string
  createdAt: string
}

class ForumDataStore {
  private posts: Post[] = []
  private users: User[] = []
  private categories: Category[] = []

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

  updateUserActivity(userId: string) {
    const user = this.users.find((u) => u.id === userId)
    if (user) {
      user.lastActive = new Date().toISOString()
    }
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
      .map((post) => ({
        type: "post",
        title: post.title,
        author: post.author,
        timestamp: post.createdAt,
      }))

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
