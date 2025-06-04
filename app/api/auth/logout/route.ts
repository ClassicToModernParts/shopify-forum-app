import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    console.log("🔐 Logout API: Request received")

    // Create response
    const response = NextResponse.json({
      success: true,
      message: "Logged out successfully",
    })

    // Clear session cookie
    response.cookies.set("session", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 0, // Expire immediately
      path: "/",
    })

    // Clear auth token cookie
    response.cookies.set("authToken", "", {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 0, // Expire immediately
      path: "/",
    })

    console.log("🍪 Logout API: Cookies cleared successfully")

    return response
  } catch (error) {
    console.error("❌ Logout API: Unexpected error:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Logout failed due to server error",
      },
      { status: 500 },
    )
  }
}
