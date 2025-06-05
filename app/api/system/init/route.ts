import { NextResponse } from "next/server"
import { dataStore } from "@/lib/persistent-data-store"

export async function GET() {
  try {
    console.log("🔄 System initialization check...")

    const isInitialized = await dataStore.isInitialized()
    console.log("📊 System initialized:", isInitialized)

    if (!isInitialized) {
      console.log("🔄 Initializing system...")
      await dataStore.initialize()
      console.log("✅ System initialized successfully")
    }

    // Get basic stats to verify initialization
    const categories = await dataStore.getCategories()
    const users = await dataStore.getUsers()

    return NextResponse.json({
      success: true,
      initialized: true,
      stats: {
        categories: categories?.length || 0,
        users: users?.length || 0,
      },
      message: isInitialized ? "System already initialized" : "System initialized successfully",
    })
  } catch (error) {
    console.error("❌ System initialization error:", error)
    return NextResponse.json(
      {
        success: false,
        initialized: false,
        error: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 },
    )
  }
}

export async function POST() {
  try {
    console.log("🔄 Forcing system reinitialization...")

    // Force reinitialization
    const success = await dataStore.forceReinitialize()
    console.log("✅ System reinitialized successfully")

    // Get basic stats to verify initialization
    const categories = await dataStore.getCategories()
    const users = await dataStore.getUsers()

    return NextResponse.json({
      success,
      initialized: success,
      stats: {
        categories: categories?.length || 0,
        users: users?.length || 0,
      },
      message: success ? "System reinitialized successfully" : "System reinitialization failed",
    })
  } catch (error) {
    console.error("❌ System reinitialization error:", error)
    return NextResponse.json(
      {
        success: false,
        initialized: false,
        error: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 },
    )
  }
}
