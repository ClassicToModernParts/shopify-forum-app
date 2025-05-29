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
        replies: 0,
        views: 5,
        likes: 2,
        isPinned: true,
        tags: ["welcome", "introduction"],
        status: "active",
      },
    ]

    this.initialized = true
    console.log("✅ Forum data store initialized with sample data")
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

  // Posts
  getPosts(): Post[] {
    this.initializeIfEmpty()
    return [...this.posts]
  }

  getPostById(id: string): Post | null {
    this.initializeIfEmpty()
    return this.posts.find((post) => post.id === id) || null
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

  incrementPostViews(postId: string): boolean {
    this.initializeIfEmpty()
    const post = this.posts.find((p) => p.id === postId)
    if (post) {
      post.views = (post.views || 0) + 1
      post.updatedAt = new Date().toISOString()
      return true
    }
    return false
  }

  likePost(postId: string): { likes: number } | null {
    this.initializeIfEmpty()
    const post = this.posts.find((p) => p.id === postId)
    if (post) {
      post.likes = (post.likes || 0) + 1
      post.updatedAt = new Date().toISOString()
      return { likes: post.likes }
    }
    return null
  }

  // Replies
  getRepliesByPostId(postId: string): Reply[] {
    this.initializeIfEmpty()
    return this.replies.filter((reply) => reply.postId === postId)
  }

  addReply(data: Omit<Reply, "id" | "createdAt" | "updatedAt" | "likes">): Reply {
    this.initializeIfEmpty()
    const reply: Reply = {
      id: `reply-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      likes: 0,
      status: "active",
      ...data,
    }
    this.replies.push(reply)

    // Increment reply count on the post
    const post = this.posts.find((p) => p.id === data.postId)
    if (post) {
      post.replies = (post.replies || 0) + 1
      post.updatedAt = new Date().toISOString()
    }

    console.log("✅ Reply created:", reply)
    return reply
  }

  likeReply(replyId: string): { likes: number } | null {
    this.initializeIfEmpty()
    const reply = this.replies.find((r) => r.id === replyId)
    if (reply) {
      reply.likes = (reply.likes || 0) + 1
      reply.updatedAt = new Date().toISOString()
      return { likes: reply.likes }
    }
    return null
  }

  // Debug methods
  getStats() {
    this.initializeIfEmpty()
    return {
      totalCategories: this.categories.length,
      totalPosts: this.posts.length,
      totalReplies: this.replies.length,
      totalUsers: 1, // Mock for now
      onlineUsers: 1, // Mock for now
    }
  }

  getAllData() {
    this.initializeIfEmpty()
    return {
      categories: this.categories,
      posts: this.posts,
      replies: this.replies,
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
}

// Export singleton instance
export const forumDataStore = new ForumDataStore()
