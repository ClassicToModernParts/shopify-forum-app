import { type NextRequest, NextResponse } from "next/server"
import { dataStore } from "@/lib/persistent-data-store"

export async function POST(request: NextRequest) {
  try {
    console.log("🔄 Initializing system without sample groups...")

    const body = await request.json().catch(() => ({}))
    const { force = false } = body

    let result: boolean

    if (force) {
      console.log("🔄 Force reinitializing system (clean)...")
      result = await dataStore.forceReinitialize({ includeSampleGroups: false })
    } else {
      result = await dataStore.initialize({ includeSampleGroups: false })
    }

    if (result) {
      const status = await dataStore.getSystemStatus()
      return NextResponse.json({
        success: true,
        message: "System initialized successfully (without sample groups)",
        status,
      })
    } else {
      return NextResponse.json(
        {
          success: false,
          error: "Failed to initialize system",
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("❌ Error initializing system (clean):", error)
    return NextResponse.json(
      {
        success: false,
        error: `Failed to initialize system: ${error instanceof Error ? error.message : "Unknown error"}`,
      },
      { status: 500 },
    )
  }
}
