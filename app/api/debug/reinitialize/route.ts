import { NextResponse } from "next/server"
import { persistentForumDataStore } from "@/lib/persistent-data-store"

export async function POST() {
  try {
    console.log("🔄 Debug: Force reinitializing system")

    const result = await persistentForumDataStore.forceReinitializeWithHashedPasswords()

    if (result) {
      console.log("✅ Debug: System reinitialized successfully")
      return NextResponse.json({
        success: true,
        message: "System reinitialized with hashed passwords",
      })
    } else {
      return NextResponse.json(
        {
          success: false,
          message: "Failed to reinitialize system",
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("❌ Debug: Error reinitializing:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
