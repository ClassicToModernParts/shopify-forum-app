import { type NextRequest, NextResponse } from "next/server"
import { persistentForumDataStore } from "@/lib/persistent-data-store"

export async function GET(request: NextRequest) {
  try {
    // Get token from Authorization header
    const authHeader = request.headers.get("authorization")
    const token = authHeader?.split(" ")[1]

    // Check if we have a token
    if (!token) {
      console.log("⚠️ No auth token provided in user-info request")

      // Try to get user from session cookie as fallback
      const sessionCookie = request.cookies.get("session")
      const userEmail = sessionCookie?.value

      if (!userEmail) {
        return NextResponse.json(
          {
            success: false,
            error: "No authentication token or session found",
          },
          { status: 401 },
        )
      }

      // Get user from data store using cookie
      const user = await persistentForumDataStore.getUserByEmail(userEmail)

      if (!user) {
        return NextResponse.json(
          {
            success: false,
            error: "User not found from session cookie",
          },
          { status: 404 },
        )
      }

      // Return user info (excluding password)
      const { password, ...userInfo } = user

      return NextResponse.json({
        success: true,
        user: userInfo,
        message: "User found via session cookie",
      })
    }

    // Verify token
    try {
      // Get user from token
      const tokenData = JSON.parse(Buffer.from(token.split(".")[1], "base64").toString())
      const userEmail = tokenData.email

      if (!userEmail) {
        return NextResponse.json(
          {
            success: false,
            error: "Invalid token format - no email found",
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
            error: "User not found with token email",
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
      console.error("Error verifying token:", error)
      return NextResponse.json(
        {
          success: false,
          error: "Invalid authentication token",
        },
        { status: 401 },
      )
    }
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
