import { type NextRequest, NextResponse } from "next/server"
import { forumDataStore } from "../../forum/data-store"

export async function GET() {
  try {
    const categories = forumDataStore.getCategories()

    return NextResponse.json({
      success: true,
      data: categories,
      message: "Categories retrieved successfully",
    })
  } catch (error) {
    console.error("Error fetching categories:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch categories" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description } = body

    if (!name) {
      return NextResponse.json({ success: false, error: "Category name is required" }, { status: 400 })
    }

    const newCategory = forumDataStore.addCategory({
      name,
      description: description || "",
    })

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

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, name, description } = body

    if (!id || !name) {
      return NextResponse.json({ success: false, error: "Category ID and name are required" }, { status: 400 })
    }

    const updatedCategory = forumDataStore.updateCategory(id, {
      name,
      description: description || "",
    })

    if (!updatedCategory) {
      return NextResponse.json({ success: false, error: "Category not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: updatedCategory,
      message: "Category updated successfully",
    })
  } catch (error) {
    console.error("Error updating category:", error)
    return NextResponse.json({ success: false, error: "Failed to update category" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ success: false, error: "Category ID is required" }, { status: 400 })
    }

    const deleted = forumDataStore.deleteCategory(id)

    if (!deleted) {
      return NextResponse.json({ success: false, error: "Category not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: "Category deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting category:", error)
    return NextResponse.json({ success: false, error: "Failed to delete category" }, { status: 500 })
  }
}
