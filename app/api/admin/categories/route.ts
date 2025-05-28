import { type NextRequest, NextResponse } from "next/server"

// Mock categories data store - in production, this would be your database
const mockCategories = [
  {
    id: "1",
    name: "General Discussion",
    description: "General topics and discussions about our products",
    postCount: 45,
    lastActivity: "2024-01-15T10:30:00Z",
    color: "#3B82F6",
    icon: "MessageSquare",
    isPrivate: false,
    moderators: ["admin@store.com"],
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-15T10:30:00Z",
  },
  {
    id: "2",
    name: "Product Support",
    description: "Get help with products and technical issues",
    postCount: 23,
    lastActivity: "2024-01-15T09:15:00Z",
    color: "#10B981",
    icon: "HelpCircle",
    isPrivate: false,
    moderators: ["support@store.com"],
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-15T09:15:00Z",
  },
  {
    id: "3",
    name: "Feature Requests",
    description: "Suggest new features and improvements",
    postCount: 12,
    lastActivity: "2024-01-14T16:45:00Z",
    color: "#8B5CF6",
    icon: "Lightbulb",
    isPrivate: false,
    moderators: ["admin@store.com"],
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-14T16:45:00Z",
  },
  {
    id: "4",
    name: "VIP Customers",
    description: "Exclusive discussions for VIP customers",
    postCount: 8,
    lastActivity: "2024-01-15T08:20:00Z",
    color: "#F59E0B",
    icon: "Crown",
    isPrivate: true,
    moderators: ["admin@store.com"],
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-15T08:20:00Z",
  },
  {
    id: "5",
    name: "hi",
    description: "fbbr",
    postCount: 0,
    lastActivity: "2024-01-20T12:00:00Z",
    color: "#3B82F6",
    icon: "MessageSquare",
    isPrivate: false,
    moderators: ["admin@store.com"],
    createdAt: "2024-01-20T12:00:00Z",
    updatedAt: "2024-01-20T12:00:00Z",
  },
]

// GET - Retrieve categories for admin management
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const includePrivate = url.searchParams.get("include_private") === "true"

    let filteredCategories = mockCategories

    // Filter out private categories if not requested
    if (!includePrivate) {
      filteredCategories = filteredCategories.filter((cat) => !cat.isPrivate)
    }

    return NextResponse.json({
      success: true,
      data: filteredCategories,
      total: filteredCategories.length,
      message: `Retrieved ${filteredCategories.length} categories`,
    })
  } catch (error) {
    console.error("Error fetching categories:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch categories" }, { status: 500 })
  }
}

// POST - Create new category
export async function POST(request: NextRequest) {
  try {
    const { name, description, color, icon, isPrivate } = await request.json()

    if (!name || !description) {
      return NextResponse.json(
        {
          success: false,
          error: "Name and description are required",
        },
        { status: 400 },
      )
    }

    // Check if category name already exists
    const existingCategory = mockCategories.find((cat) => cat.name.toLowerCase() === name.toLowerCase())

    if (existingCategory) {
      return NextResponse.json(
        {
          success: false,
          error: "A category with this name already exists",
        },
        { status: 400 },
      )
    }

    const newCategory = {
      id: String(mockCategories.length + 1),
      name: name.trim(),
      description: description.trim(),
      postCount: 0,
      lastActivity: new Date().toISOString(),
      color: color || "#3B82F6",
      icon: icon || "MessageSquare",
      isPrivate: isPrivate || false,
      moderators: ["admin@store.com"],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    mockCategories.push(newCategory)

    console.log(`Admin created new category: ${newCategory.name}`)

    return NextResponse.json({
      success: true,
      data: newCategory,
      message: "Category created successfully",
    })
  } catch (error) {
    console.error("Error creating category:", error)
    return NextResponse.json({ success: false, error: "Failed to create category" }, { status: 500 })
  }
}

// PUT - Update existing category
export async function PUT(request: NextRequest) {
  try {
    const { categoryId, updates } = await request.json()

    if (!categoryId) {
      return NextResponse.json({ success: false, error: "Category ID is required" }, { status: 400 })
    }

    const categoryIndex = mockCategories.findIndex((cat) => cat.id === categoryId)
    if (categoryIndex === -1) {
      return NextResponse.json({ success: false, error: "Category not found" }, { status: 404 })
    }

    const originalCategory = { ...mockCategories[categoryIndex] }

    // Update the category
    mockCategories[categoryIndex] = {
      ...mockCategories[categoryIndex],
      ...updates,
      updatedAt: new Date().toISOString(),
    }

    console.log(`Admin updated category: ${originalCategory.name} -> ${mockCategories[categoryIndex].name}`)

    return NextResponse.json({
      success: true,
      data: mockCategories[categoryIndex],
      originalData: originalCategory,
      message: "Category updated successfully",
    })
  } catch (error) {
    console.error("Error updating category:", error)
    return NextResponse.json({ success: false, error: "Failed to update category" }, { status: 500 })
  }
}

// DELETE - Delete category
export async function DELETE(request: NextRequest) {
  try {
    const { categoryId } = await request.json()

    if (!categoryId) {
      return NextResponse.json({ success: false, error: "Category ID is required" }, { status: 400 })
    }

    const categoryIndex = mockCategories.findIndex((cat) => cat.id === categoryId)
    if (categoryIndex === -1) {
      return NextResponse.json({ success: false, error: "Category not found" }, { status: 404 })
    }

    const categoryToDelete = mockCategories[categoryIndex]

    // Check if category has posts
    if (categoryToDelete.postCount > 0) {
      return NextResponse.json(
        {
          success: false,
          error: `Cannot delete category with ${categoryToDelete.postCount} posts. Please move or delete posts first.`,
        },
        { status: 400 },
      )
    }

    // Remove the category
    mockCategories.splice(categoryIndex, 1)

    console.log(`Admin deleted category: ${categoryToDelete.name}`)

    return NextResponse.json({
      success: true,
      deletedCategory: categoryToDelete,
      message: "Category deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting category:", error)
    return NextResponse.json({ success: false, error: "Failed to delete category" }, { status: 500 })
  }
}
