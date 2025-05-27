import { type NextRequest, NextResponse } from "next/server"

// Types for our forum data
interface Category {
  id: string
  name: string
  description: string
  postCount: number
  lastActivity: string
}

interface Post {
  id: string
  title: string
  content: string
  author: string
  categoryId: string
  createdAt: string
  replies: number
  views: number
}

// Mock data for demonstration
const mockCategories: Category[] = [
  {
    id: "1",
    name: "General Discussion",
    description: "General topics and discussions",
    postCount: 45,
    lastActivity: "2024-01-15T10:30:00Z",
  },
  {
    id: "2",
    name: "Product Support",
    description: "Get help with products and services",
    postCount: 23,
    lastActivity: "2024-01-15T09:15:00Z",
  },
]

const mockPosts: Post[] = [
  {
    id: "1",
    title: "Welcome to the Forum!",
    content: "This is the first post in our community forum.",
    author: "Admin",
    categoryId: "1",
    createdAt: "2024-01-10T12:00:00Z",
    replies: 5,
    views: 120,
  },
]

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type")
    const shopId = searchParams.get("shop_id")

    if (!shopId) {
      return NextResponse.json(
        {
          success: false,
          error: "Shop ID is required",
          data: [],
        },
        { status: 400 },
      )
    }

    switch (type) {
      case "categories":
        return NextResponse.json({
          success: true,
          data: mockCategories,
          message: "Categories retrieved successfully",
        })

      case "posts":
        return NextResponse.json({
          success: true,
          data: mockPosts,
          message: "Posts retrieved successfully",
        })

      default:
        return NextResponse.json(
          {
            success: false,
            error: "Invalid request type",
            data: [],
          },
          { status: 400 },
        )
    }
  } catch (error) {
    console.error("Forum API error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        data: [],
      },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, shopId } = body

    if (!shopId) {
      return NextResponse.json(
        {
          success: false,
          error: "Shop ID is required",
        },
        { status: 400 },
      )
    }

    return NextResponse.json({
      success: true,
      message: "Post created successfully",
    })
  } catch (error) {
    console.error("Forum API POST error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 },
    )
  }
}
