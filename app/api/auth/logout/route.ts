import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    console.log("🚪 Logout API: Processing logout")

    const response = NextResponse.json({
      success: true,
      message: "Logged out successfully",
    })

    // Clear session cookies
    response.cookies.set("session", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 0,
      path: "/",
    })

    response.cookies.set("authToken", "", {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 0,
      path: "/",
    })

    console.log("✅ Logout API: Logout successful")
    return response
  } catch (error) {
    console.error("❌ Logout API: Error:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Logout failed",
      },
      { status: 500 },
    )
  }
}
