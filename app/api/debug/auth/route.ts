import { NextResponse } from "next/server"
import { persistentForumDataStore } from "@/lib/persistent-data-store"

export async function GET() {
  try {
    console.log("🔍 Debug Auth: Checking system state")

    // Get all users
    const users = await persistentForumDataStore.getAllUsers()

    // Get system settings
    let rewardSettings
    try {
      rewardSettings = await persistentForumDataStore.getRewardSettings()
    } catch (error) {
      rewardSettings = { error: "Failed to get reward settings" }
    }

    const debugInfo = {
      timestamp: new Date().toISOString(),
      userCount: users.length,
      users: users.map((user) => ({
        id: user.id,
        username: user.username,
        name: user.name,
        role: user.role,
        hasPassword: !!user.password,
        passwordLength: user.password?.length || 0,
      })),
      systemInitialized: await persistentForumDataStore.isInitialized(),
      rewardSettings: rewardSettings,
    }

    console.log("🔍 Debug Auth: System state:", debugInfo)

    return NextResponse.json({
      success: true,
      debug: debugInfo,
    })
  } catch (error) {
    console.error("❌ Debug Auth: Error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
