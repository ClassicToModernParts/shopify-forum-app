import { type NextRequest, NextResponse } from "next/server"
import { persistentForumDataStore } from "@/lib/persistent-data-store"

export async function GET(request: NextRequest) {
  try {
    // Get token from Authorization header
    const authHeader = request.headers.get("authorization")
    const token = authHeader?.split(" ")[1]

    // Check if we have a token
    if (!token) {
      return NextResponse.json(
        {
          success: false,
          error: "No authentication token provided",
        },
        { status: 401 },
      )
    }

    // Get user from session cookie
    const sessionCookie = request.cookies.get("session")
    const userEmail = sessionCookie?.value

    if (!userEmail) {
      return NextResponse.json(
        {
          success: false,
          error: "No user session found",
        },
        { status: 401 },
      )
    }

    // Get user from data store
    const user = await persistentForumDataStore.getUserByEmail(userEmail)

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: "User not found",
        },
        { status: 404 },
      )
    }

    // Return user info (excluding password)
    const { password, ...userInfo } = user

    return NextResponse.json({
      success: true,
      user: userInfo,
    })
  } catch (error) {
    console.error("Error in user-info API:", error)
    return NextResponse.json(
      {
        success: false,
        error: `An error occurred: ${error instanceof Error ? error.message : "Unknown error"}`,
      },
      { status: 500 },
    )
  }
}
