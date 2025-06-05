import { NextResponse } from "next/server"
import { dataStore } from "@/lib/persistent-data-store"

export async function POST() {
  try {
    console.log("🔄 System Initialize: Starting initialization...")

    const success = await dataStore.initialize()

    if (success) {
      const status = await dataStore.getSystemStatus()
      console.log("✅ System Initialize: Success")
      console.log("  - Storage Type:", status.storageType)
      console.log("  - Users:", status.stats.users)
      console.log("  - Categories:", status.stats.categories)

      return NextResponse.json({
        success: true,
        message: "System initialized successfully",
        status,
      })
    } else {
      console.log("❌ System Initialize: Failed")
      return NextResponse.json(
        {
          success: false,
          error: "Failed to initialize system",
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("❌ System Initialize: Error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Initialization error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
