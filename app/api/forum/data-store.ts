// Simple in-memory data store for forum data
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

class ForumDataStore {
  private categories: Category[] = []
  private posts: Post[] = []
  private replies: Reply[] = []
  private initialized = false

  constructor() {
    this.initializeIfEmpty()
  }

  private initializeIfEmpty() {
    if (this.initialized) return

    console.log("🔄 Initializing forum data store...")

    // Create default categories
    this.categories = [
      {
        id: "general",
        name: "General Discussion",
        description: "General topics and discussions",
        color: "#3B82F6",
        icon: "MessageSquare",
        createdAt: new Date().toISOString(),
      },
      {
        id: "support",
        name: "Support & Help",
        description: "Get help and support from the community",
        color: "#10B981",
        icon: "HelpCircle",
        createdAt: new Date().toISOString(),
      },
      {
        id: "announcements",
        name: "Announcements",
        description: "Important updates and announcements",
        color: "#F59E0B",
        icon: "Megaphone",
        createdAt: new Date().toISOString(),
      },
    ]

    // Create sample posts
    this.posts = [
      {
        id: "post-1",
        title: "Welcome to the Community Forum!",
        content: "This is your first post in the community forum. Feel free to explore and start discussions!",
        author: "Admin",
        authorEmail: "admin@store.com",
        categoryId: "general",
        createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
        updatedAt: new Date(Date.now() - 86400000).toISOString(),
        replies: 2,
        views: 15,
        likes: 3,
        isPinned: true,
        tags: ["welcome", "introduction"],
        status: "active",
      },
      {
        id: "post-2",
        title: "How to use the forum effectively",
        content:
          "Here are some tips on how to make the most of our community forum. Remember to be respectful and helpful!",
        author: "Moderator",
        authorEmail: "mod@store.com",
        categoryId: "support",
        createdAt: new Date(Date.now() - 43200000).toISOString(), // 12 hours ago
        updatedAt: new Date(Date.now() - 43200000).toISOString(),
        replies: 1,
        views: 8,
        likes: 2,
        tags: ["tips", "guidelines"],
        status: "active",
      },
    ]

    // Create sample replies
    this.replies = [
      {
        id: "reply-1",
        postId: "post-1",
        content: "Thank you for the warm welcome! I'm excited to be part of this community.",
        author: "New User",
        authorEmail: "newuser@example.com",
        createdAt: new Date(Date.now() - 21600000).toISOString(), // 6 hours ago
        updatedAt: new Date(Date.now() - 21600000).toISOString(),
        likes: 1,
        status: "active",
      },
      {
        id: "reply-2",
        postId: "post-1",
        content: "Great to have you here! Don't hesitate to ask questions if you need help.",
        author: "Community Helper",
        authorEmail: "helper@example.com",
        createdAt: new Date(Date.now() - 10800000).toISOString(), // 3 hours ago
        updatedAt: new Date(Date.now() - 10800000).toISOString(),
        likes: 2,
        status: "active",
      },
      {
        id: "reply-3",
        postId: "post-2",
        content: "These are really helpful tips! Thanks for sharing.",
        author: "Active User",
        authorEmail: "active@example.com",
        createdAt: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
        updatedAt: new Date(Date.now() - 7200000).toISOString(),
        likes: 0,
        status: "active",
      },
    ]

    this.initialized = true
    console.log("✅ Forum data store initialized with sample data")
    console.log(
      `📊 Initialized with ${this.categories.length} categories, ${this.posts.length} posts, ${this.replies.length} replies`,
    )
  }

  // Categories
  getCategories(): Category[] {
    this.initializeIfEmpty()
    return [...this.categories]
  }

  getCategoryById(id: string): Category | null {
    this.initializeIfEmpty()
    return this.categories.find((cat) => cat.id === id) || null
  }

  createCategory(data: Omit<Category, "id" | "createdAt">): Category {
    this.initializeIfEmpty()
    const category: Category = {
      id: `cat-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      ...data,
    }
    this.categories.push(category)
    console.log("✅ Category created:", category)
    return category
  }

  updateCategory(categoryId: string, updates: Partial<Category>): Category | null {
    this.initializeIfEmpty()
    const categoryIndex = this.categories.findIndex((cat) => cat.id === categoryId)
    if (categoryIndex === -1) {
      console.warn(`⚠️ Category not found for update: ${categoryId}`)
      return null
    }

    // Update the category
    this.categories[categoryIndex] = { ...this.categories[categoryIndex], ...updates }
    console.log(`✅ Category ${categoryId} updated successfully`)
    return this.categories[categoryIndex]
  }

  deleteCategory(categoryId: string): boolean {
    this.initializeIfEmpty()
    const categoryIndex = this.categories.findIndex((cat) => cat.id === categoryId)
    if (categoryIndex === -1) {
      console.warn(`⚠️ Category not found for deletion: ${categoryId}`)
      return false
    }

    // Check if category has posts
    const postsInCategory = this.posts.filter((post) => post.categoryId === categoryId && post.status === "active")
    if (postsInCategory.length > 0) {
      console.warn(`⚠️ Cannot delete category ${categoryId} - has ${postsInCategory.length} active posts`)
      return false
    }

    // Remove the category
    this.categories.splice(categoryIndex, 1)
    console.log(`✅ Category ${categoryId} deleted successfully`)
    return true
  }

  // Posts
  getPosts(): Post[] {
    this.initializeIfEmpty()
    return [...this.posts].filter((post) => post.status === "active")
  }

  getPostById(id: string): Post | null {
    this.initializeIfEmpty()
    return this.posts.find((post) => post.id === id && post.status === "active") || null
  }

  createPost(data: Omit<Post, "id" | "createdAt" | "updatedAt" | "replies" | "views" | "likes">): Post {
    this.initializeIfEmpty()
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
    this.posts.push(post)
    console.log("✅ Post created:", post)
    return post
  }

  deletePost(postId: string, userEmail: string): boolean {
    this.initializeIfEmpty()
    const postIndex = this.posts.findIndex((p) => p.id === postId)
    if (postIndex === -1) {
      console.warn(`⚠️ Post not found for deletion: ${postId}`)
      return false
    }

    const post = this.posts[postIndex]

    // Check if user owns the post or is admin
    if (post.authorEmail !== userEmail && userEmail !== "admin@store.com") {
      console.warn(`⚠️ User ${userEmail} not authorized to delete post ${postId}`)
      return false
    }

    // Soft delete - mark as deleted instead of removing
    post.status = "deleted"
    post.updatedAt = new Date().toISOString()

    // Also soft delete all replies to this post
    this.replies.forEach((reply) => {
      if (reply.postId === postId) {
        reply.status = "deleted"
        reply.updatedAt = new Date().toISOString()
      }
    })

    console.log(`✅ Post ${postId} deleted by ${userEmail}`)
    return true
  }

  incrementPostViews(postId: string): boolean {
    this.initializeIfEmpty()
    const post = this.posts.find((p) => p.id === postId && p.status === "active")
    if (post) {
      post.views = (post.views || 0) + 1
      post.updatedAt = new Date().toISOString()
      console.log(`👁️ Post ${postId} views incremented to ${post.views}`)
      return true
    }
    return false
  }

  likePost(postId: string): { likes: number } | null {
    this.initializeIfEmpty()
    const post = this.posts.find((p) => p.id === postId && p.status === "active")
    if (post) {
      post.likes = (post.likes || 0) + 1
      post.updatedAt = new Date().toISOString()
      console.log(`👍 Post ${postId} likes incremented to ${post.likes}`)
      return { likes: post.likes }
    }
    return null
  }

  // Replies
  getRepliesByPostId(postId: string): Reply[] {
    this.initializeIfEmpty()
    const replies = this.replies.filter((reply) => reply.postId === postId && reply.status === "active")
    console.log(`💬 Found ${replies.length} active replies for post ${postId}`)
    return replies
  }

  addReply(data: Omit<Reply, "id" | "createdAt" | "updatedAt" | "likes">): Reply {
    this.initializeIfEmpty()

    console.log("💬 Adding reply with data:", data)

    const reply: Reply = {
      id: `reply-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      likes: 0,
      status: "active",
      ...data,
    }

    // Add to replies array
    this.replies.push(reply)
    console.log("✅ Reply added to array. Total replies:", this.replies.length)

    // Increment reply count on the post
    const post = this.posts.find((p) => p.id === data.postId)
    if (post) {
      post.replies = (post.replies || 0) + 1
      post.updatedAt = new Date().toISOString()
      console.log(`📈 Post ${data.postId} reply count updated to ${post.replies}`)
    } else {
      console.warn(`⚠️ Post ${data.postId} not found when adding reply`)
    }

    console.log("✅ Reply created successfully:", reply)
    return reply
  }

  deleteReply(replyId: string, userEmail: string): boolean {
    this.initializeIfEmpty()
    const reply = this.replies.find((r) => r.id === replyId)
    if (!reply) {
      console.warn(`⚠️ Reply not found for deletion: ${replyId}`)
      return false
    }

    // Check if user owns the reply or is admin
    if (reply.authorEmail !== userEmail && userEmail !== "admin@store.com") {
      console.warn(`⚠️ User ${userEmail} not authorized to delete reply ${replyId}`)
      return false
    }

    // Soft delete - mark as deleted
    reply.status = "deleted"
    reply.updatedAt = new Date().toISOString()

    // Decrement reply count on the post
    const post = this.posts.find((p) => p.id === reply.postId)
    if (post && post.replies > 0) {
      post.replies = post.replies - 1
      post.updatedAt = new Date().toISOString()
    }

    console.log(`✅ Reply ${replyId} deleted by ${userEmail}`)
    return true
  }

  likeReply(replyId: string): { likes: number } | null {
    this.initializeIfEmpty()
    const reply = this.replies.find((r) => r.id === replyId && reply.status === "active")
    if (reply) {
      reply.likes = (reply.likes || 0) + 1
      reply.updatedAt = new Date().toISOString()
      console.log(`👍 Reply ${replyId} likes incremented to ${reply.likes}`)
      return { likes: reply.likes }
    }
    return null
  }

  // Debug methods
  getStats() {
    this.initializeIfEmpty()
    const activePosts = this.posts.filter((p) => p.status === "active")
    const activeReplies = this.replies.filter((r) => r.status === "active")

    return {
      totalCategories: this.categories.length,
      totalPosts: activePosts.length,
      totalReplies: activeReplies.length,
      totalUsers: 3, // Mock for now
      activeToday: 2, // Mock for now
      onlineUsers: 1, // Mock for now
    }
  }

  getAllData() {
    this.initializeIfEmpty()
    return {
      categories: this.categories,
      posts: this.posts.filter((p) => p.status === "active"),
      replies: this.replies.filter((r) => r.status === "active"),
      stats: this.getStats(),
    }
  }

  reset() {
    this.categories = []
    this.posts = []
    this.replies = []
    this.initialized = false
    console.log("🔄 Forum data store reset")
  }

  // Debug method to see all data including deleted
  getAllDataWithDeleted() {
    this.initializeIfEmpty()
    return {
      categories: this.categories,
      posts: this.posts,
      replies: this.replies,
      stats: this.getStats(),
    }
  }

  // Admin-specific methods (bypass normal permissions)
  adminDeletePost(postId: string): boolean {
    this.initializeIfEmpty()
    const postIndex = this.posts.findIndex((p) => p.id === postId)
    if (postIndex === -1) {
      console.warn(`⚠️ Post not found for admin deletion: ${postId}`)
      return false
    }

    const post = this.posts[postIndex]

    // Admin can delete any post - soft delete
    post.status = "deleted"
    post.updatedAt = new Date().toISOString()

    // Also soft delete all replies to this post
    this.replies.forEach((reply) => {
      if (reply.postId === postId) {
        reply.status = "deleted"
        reply.updatedAt = new Date().toISOString()
      }
    })

    console.log(`✅ Post ${postId} deleted by admin`)
    return true
  }

  adminDeleteReply(replyId: string): boolean {
    this.initializeIfEmpty()
    const reply = this.replies.find((r) => r.id === replyId)
    if (!reply) {
      console.warn(`⚠️ Reply not found for admin deletion: ${replyId}`)
      return false
    }

    // Admin can delete any reply - soft delete
    reply.status = "deleted"
    reply.updatedAt = new Date().toISOString()

    // Decrement reply count on the post
    const post = this.posts.find((p) => p.id === reply.postId)
    if (post && post.replies > 0) {
      post.replies = post.replies - 1
      post.updatedAt = new Date().toISOString()
    }

    console.log(`✅ Reply ${replyId} deleted by admin`)
    return true
  }

  clearSampleData(): boolean {
    this.initializeIfEmpty()

    // Mark all sample posts as deleted instead of removing them
    let deletedCount = 0
    this.posts.forEach((post) => {
      if (post.status === "active") {
        post.status = "deleted"
        post.updatedAt = new Date().toISOString()
        deletedCount++
      }
    })

    // Mark all replies as deleted
    this.replies.forEach((reply) => {
      if (reply.status === "active") {
        reply.status = "deleted"
        reply.updatedAt = new Date().toISOString()
      }
    })

    console.log(`✅ Cleared ${deletedCount} posts and all replies`)
    return true
  }
}

// Export singleton instance
export const forumDataStore = new ForumDataStore()
