import { NextResponse } from "next/server"
import { forumDataStore } from "@/app/api/forum/data-store"

export async function GET() {
  try {
    // Get all users to check if registration is working
    const users = await forumDataStore.getUsers()

    return NextResponse.json({
      success: true,
      message: "Registration test endpoint",
      userCount: users.length,
      // Don't return sensitive data like passwords
      users: users.map((user) => ({
        id: user.id,
        username: user.username,
        name: user.name,
        role: user.role,
        createdAt: user.createdAt,
      })),
    })
  } catch (error) {
    console.error("Registration test error:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Error testing registration",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
