import { type NextRequest, NextResponse } from "next/server"
import { persistentForumDataStore } from "@/lib/persistent-data-store"
import { ensureDataStoreInitialized } from "@/lib/data-store-manager"

export async function GET(request: NextRequest) {
  try {
    // Ensure data store is initialized
    const initialized = await ensureDataStoreInitialized()
    if (!initialized) {
      return NextResponse.json(
        {
          success: false,
          error: "Data store initialization failed. Please initialize the system first.",
        },
        { status: 500 },
      )
    }

    // Get all data
    const data = await persistentForumDataStore.getAllDataWithDeleted()

    return NextResponse.json({
      success: true,
      data,
    })
  } catch (error) {
    console.error("❌ Debug data store API error:", error)
    return NextResponse.json(
      {
        success: false,
        error: `An error occurred: ${error instanceof Error ? error.message : "Unknown error"}`,
      },
      { status: 500 },
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Clear all data
    const success = await persistentForumDataStore.clearAllData()

    return NextResponse.json({
      success,
      message: success ? "All data cleared successfully" : "Failed to clear data",
    })
  } catch (error) {
    console.error("❌ Debug data store DELETE API error:", error)
    return NextResponse.json(
      {
        success: false,
        error: `An error occurred: ${error instanceof Error ? error.message : "Unknown error"}`,
      },
      { status: 500 },
    )
  }
}
