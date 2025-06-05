import { NextResponse } from "next/server"
import { dataStore } from "@/lib/persistent-data-store"

export async function GET() {
  try {
    const status = await dataStore.getSystemStatus()

    console.log("🔍 System Status Check:")
    console.log("  - Initialized:", status.isInitialized)
    console.log("  - Storage Type:", status.storageType)
    console.log("  - Stats:", status.stats)

    return NextResponse.json({
      success: true,
      status,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("❌ Error checking system status:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to check system status",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
