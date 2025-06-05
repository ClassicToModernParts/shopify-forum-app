import { type NextRequest, NextResponse } from "next/server"
import { dataStore } from "@/lib/persistent-data-store"

export async function GET(request: NextRequest) {
  try {
    console.log("🔍 Checking system initialization status...")

    const status = await dataStore.getSystemStatus()

    return NextResponse.json({
      success: true,
      status,
      message: status.isInitialized ? "System is initialized" : "System is not initialized",
    })
  } catch (error) {
    console.error("❌ Error checking system status:", error)
    return NextResponse.json(
      {
        success: false,
        error: `Failed to check system status: ${error instanceof Error ? error.message : "Unknown error"}`,
        status: {
          isInitialized: false,
          storageType: "unknown",
          stats: {
            users: 0,
            categories: 0,
            posts: 0,
            groups: 0,
            meets: 0,
          },
        },
      },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log("🔄 Initializing system...")

    const body = await request.json().catch(() => ({}))
    const { includeSampleGroups = false, force = false } = body

    let result: boolean

    if (force) {
      console.log("🔄 Force reinitializing system...")
      result = await dataStore.forceReinitialize({ includeSampleGroups })
    } else {
      result = await dataStore.initialize({ includeSampleGroups })
    }

    if (result) {
      const status = await dataStore.getSystemStatus()
      return NextResponse.json({
        success: true,
        message: "System initialized successfully",
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
    console.error("❌ Error initializing system:", error)
    return NextResponse.json(
      {
        success: false,
        error: `Failed to initialize system: ${error instanceof Error ? error.message : "Unknown error"}`,
      },
      { status: 500 },
    )
  }
}
