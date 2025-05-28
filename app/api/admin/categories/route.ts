import { type NextRequest, NextResponse } from "next/server"

// Mock database - in a real app, this would be your actual database
const categories = [
  {
    id: "1",
    name: "General Discussion",
    description: "General topics and discussions",
    postCount: 15,
    color: "#3B82F6",
    icon: "MessageSquare",
    isPrivate: false,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "2",
    name: "Product Support",
    description: "Get help with our products",
    postCount: 8,
    color: "#10B981",
    icon: "HelpCircle",
    isPrivate: false,
    createdAt: "2024-01-02T00:00:00Z",
    updatedAt: "2024-01-02T00:00:00Z",
  },
  {
    id: "3",
    name: "Feature Requests",
    description: "Suggest new features",
    postCount: 3,
    color: "#F59E0B",
    icon: "Lightbulb",
    isPrivate: false,
    createdAt: "2024-01-03T00:00:00Z",
    updatedAt: "2024-01-03T00:00:00Z",
  },
]

// GET - Fetch all categories
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const includePrivate = searchParams.get("include_private") === "true"

    // Filter categories based on privacy setting
    const filteredCategories = includePrivate ? categories : categories.filter((cat) => !cat.isPrivate)

    return NextResponse.json({
      success: true,
      data: filteredCategories,
      message: `Found ${filteredCategories.length} categories`,
    })
  } catch (error) {
    console.error("Error fetching categories:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch categories",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

// POST - Create new category
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description, color, icon, isPrivate } = body

    // Validation
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
    const existingCategory = categories.find((cat) => cat.name.toLowerCase() === name.toLowerCase())

    if (existingCategory) {
      return NextResponse.json(
        {
          success: false,
          error: "A category with this name already exists",
        },
        { status: 400 },
      )
    }

    // Create new category
    const newCategory = {
      id: (categories.length + 1).toString(),
      name: name.trim(),
      description: description.trim(),
      postCount: 0,
      color: color || "#3B82F6",
      icon: icon || "MessageSquare",
      isPrivate: Boolean(isPrivate),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    categories.push(newCategory)

    return NextResponse.json({
      success: true,
      data: newCategory,
      message: "Category created successfully",
    })
  } catch (error) {
    console.error("Error creating category:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create category",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

// PUT - Update existing category
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { categoryId, updates } = body

    if (!categoryId) {
      return NextResponse.json(
        {
          success: false,
          error: "Category ID is required",
        },
        { status: 400 },
      )
    }

    // Find category
    const categoryIndex = categories.findIndex((cat) => cat.id === categoryId)

    if (categoryIndex === -1) {
      return NextResponse.json(
        {
          success: false,
          error: "Category not found",
        },
        { status: 404 },
      )
    }

    // Check if new name conflicts with existing categories (excluding current one)
    if (updates.name) {
      const nameConflict = categories.find(
        (cat) => cat.id !== categoryId && cat.name.toLowerCase() === updates.name.toLowerCase(),
      )

      if (nameConflict) {
        return NextResponse.json(
          {
            success: false,
            error: "A category with this name already exists",
          },
          { status: 400 },
        )
      }
    }

    // Update category
    const updatedCategory = {
      ...categories[categoryIndex],
      ...updates,
      updatedAt: new Date().toISOString(),
    }

    categories[categoryIndex] = updatedCategory

    return NextResponse.json({
      success: true,
      data: updatedCategory,
      message: "Category updated successfully",
    })
  } catch (error) {
    console.error("Error updating category:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update category",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

// DELETE - Delete category
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json()
    const { categoryId } = body

    if (!categoryId) {
      return NextResponse.json(
        {
          success: false,
          error: "Category ID is required",
        },
        { status: 400 },
      )
    }

    // Find category
    const categoryIndex = categories.findIndex((cat) => cat.id === categoryId)

    if (categoryIndex === -1) {
      return NextResponse.json(
        {
          success: false,
          error: "Category not found",
        },
        { status: 404 },
      )
    }

    const category = categories[categoryIndex]

    // Check if category has posts
    if (category.postCount > 0) {
      return NextResponse.json(
        {
          success: false,
          error: `Cannot delete category with ${category.postCount} posts. Please move or delete the posts first.`,
        },
        { status: 400 },
      )
    }

    // Delete category
    const deletedCategory = categories.splice(categoryIndex, 1)[0]

    return NextResponse.json({
      success: true,
      data: deletedCategory,
      message: "Category deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting category:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete category",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
