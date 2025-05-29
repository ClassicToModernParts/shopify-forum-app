import { NextResponse } from "next/server"

export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      message: "API is healthy",
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || "development",
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Health check failed",
        error: (error as Error).message,
      },
      { status: 500 },
    )
  }
}
