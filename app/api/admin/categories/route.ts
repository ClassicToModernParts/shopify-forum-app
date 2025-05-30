import { type NextRequest, NextResponse } from "next/server"
import { persistentForumDataStore } from "../../forum/persistent-store"

export async function GET(request: NextRequest) {
  try {
    console.log("🏷️ Admin Categories GET request")
    const { searchParams } = new URL(request.url)
    const includePrivate = searchParams.get("include_private") === "true"

    const categories = await persistentForumDataStore.getCategories()
    console.log("📊 Raw categories from store:", categories)

    // Ensure we return an array
    const categoriesArray = Array.isArray(categories) ? categories : []
    console.log("📋 Categories array to return:", categoriesArray)

    return NextResponse.json({
      success: true,
      data: categoriesArray,
      message: "Categories retrieved successfully",
    })
  } catch (error) {
    console.error("❌ Error fetching categories:", error)
    return NextResponse.json(
      {
        success: false,
        error: `Failed to fetch categories: ${error instanceof Error ? error.message : "Unknown error"}`,
        data: [], // Always return empty array on error
      },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log("🏷️ Admin Categories POST request")
    const body = await request.json()
    console.log("📝 Category creation data:", body)

    const { name, description, color, icon, isPrivate } = body

    if (!name) {
      return NextResponse.json(
        {
          success: false,
          error: "Category name is required",
          data: null,
        },
        { status: 400 },
      )
    }

    const newCategory = await persistentForumDataStore.createCategory({
      name,
      description: description || "",
      color: color || "#3B82F6",
      icon: icon || "MessageSquare",
      isPrivate: isPrivate || false,
    })

    console.log("✅ Created category:", newCategory)

    return NextResponse.json({
      success: true,
      data: newCategory,
      message: "Category created successfully",
    })
  } catch (error) {
    console.error("❌ Error creating category:", error)
    return NextResponse.json(
      {
        success: false,
        error: `Failed to create category: ${error instanceof Error ? error.message : "Unknown error"}`,
        data: null,
      },
      { status: 500 },
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    console.log("🏷️ Admin Categories PUT request")
    const body = await request.json()
    console.log("📝 Category update data:", body)

    const { categoryId, updates } = body

    if (!categoryId) {
      return NextResponse.json(
        {
          success: false,
          error: "Category ID is required",
          data: null,
        },
        { status: 400 },
      )
    }

    const updatedCategory = await persistentForumDataStore.updateCategory(categoryId, updates)

    if (!updatedCategory) {
      return NextResponse.json(
        {
          success: false,
          error: "Category not found",
          data: null,
        },
        { status: 404 },
      )
    }

    console.log("✅ Updated category:", updatedCategory)

    return NextResponse.json({
      success: true,
      data: updatedCategory,
      message: "Category updated successfully",
    })
  } catch (error) {
    console.error("❌ Error updating category:", error)
    return NextResponse.json(
      {
        success: false,
        error: `Failed to update category: ${error instanceof Error ? error.message : "Unknown error"}`,
        data: null,
      },
      { status: 500 },
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    console.log("🏷️ Admin Categories DELETE request")
    const body = await request.json()
    console.log("📝 Category delete data:", body)

    const { categoryId } = body

    if (!categoryId) {
      return NextResponse.json(
        {
          success: false,
          error: "Category ID is required",
          data: null,
        },
        { status: 400 },
      )
    }

    const deleted = await persistentForumDataStore.deleteCategory(categoryId)

    if (!deleted) {
      return NextResponse.json(
        {
          success: false,
          error: "Category not found or cannot be deleted",
          data: null,
        },
        { status: 404 },
      )
    }

    console.log("✅ Deleted category:", categoryId)

    return NextResponse.json({
      success: true,
      data: { deleted: true, categoryId },
      message: "Category deleted successfully",
    })
  } catch (error) {
    console.error("❌ Error deleting category:", error)
    return NextResponse.json(
      {
        success: false,
        error: `Failed to delete category: ${error instanceof Error ? error.message : "Unknown error"}`,
        data: null,
      },
      { status: 500 },
    )
  }
}
