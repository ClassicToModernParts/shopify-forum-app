import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  return NextResponse.json({
    success: true,
    message: "Admin settings API is working!",
    timestamp: new Date().toISOString(),
    endpoints: {
      get: "/api/admin/settings (GET)",
      save: "/api/admin/settings (POST)",
    },
  })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    return NextResponse.json({
      success: true,
      message: "Test POST successful",
      receivedData: body,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: "Test POST failed",
      details: error instanceof Error ? error.message : "Unknown error",
    })
  }
}
