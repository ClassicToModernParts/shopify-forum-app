import { NextResponse } from "next/server"

export async function POST() {
  try {
    console.log("🚪 Logout API: Processing logout")

    const response = NextResponse.json({
      success: true,
      message: "Logged out successfully",
    })

    // Clear all auth cookies
    const cookieOptions = {
      httpOnly: false,
      secure: false,
      sameSite: "lax" as const,
      maxAge: 0,
      path: "/",
    }

    response.cookies.set("authToken", "", cookieOptions)
    response.cookies.set("userId", "", cookieOptions)
    response.cookies.set("userEmail", "", cookieOptions)
    response.cookies.set("userName", "", cookieOptions)
    response.cookies.set("userRole", "", cookieOptions)

    console.log("✅ Logout API: Cookies cleared")
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
