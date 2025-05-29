import { NextResponse } from "next/server"
import { forumDataStore } from "../../forum/data-store"

export async function GET() {
  try {
    // Get a safe copy of the data store state
    const state = {
      categories: forumDataStore.getCategories(true),
      posts: forumDataStore.getPosts(),
      users: await forumDataStore.getUsers(),
      settings: forumDataStore.getSettings(),
    }

    return NextResponse.json({
      success: true,
      data: state,
      message: "Data store state retrieved successfully",
    })
  } catch (error) {
    console.error("❌ Error getting data store state:", error)
    return NextResponse.json(
      {
        success: false,
        error: `Failed to get data store state: ${error instanceof Error ? error.message : "Unknown error"}`,
      },
      { status: 500 },
    )
  }
}
