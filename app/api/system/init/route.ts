import { type NextRequest, NextResponse } from "next/server"
import { ensureDataStoreInitialized, getDataStoreStatus, reinitializeDataStore } from "@/lib/data-store-manager"

export async function GET(request: NextRequest) {
  try {
    // Get current status
    const status = getDataStoreStatus()

    return NextResponse.json({
      success: true,
      status,
    })
  } catch (error) {
    console.error("❌ System init API error:", error)
    return NextResponse.json(
      {
        success: false,
        error: `An error occurred: ${error instanceof Error ? error.message : "Unknown error"}`,
      },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const force = searchParams.get("force") === "true"

    if (force) {
      // Force reinitialization
      const success = await reinitializeDataStore()
      return NextResponse.json({
        success,
        message: success ? "System reinitialized successfully" : "System reinitialization failed",
        status: getDataStoreStatus(),
      })
    } else {
      // Normal initialization
      const success = await ensureDataStoreInitialized()
      return NextResponse.json({
        success,
        message: success ? "System initialized successfully" : "System initialization failed",
        status: getDataStoreStatus(),
      })
    }
  } catch (error) {
    console.error("❌ System init API error:", error)
    return NextResponse.json(
      {
        success: false,
        error: `An error occurred: ${error instanceof Error ? error.message : "Unknown error"}`,
      },
      { status: 500 },
    )
  }
}
