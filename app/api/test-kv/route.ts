import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Test if KV is available
    const { kv } = await import("@vercel/kv")

    // Try to set and get a test value
    await kv.set("test-key", "KV is working!")
    const testValue = await kv.get("test-key")

    return NextResponse.json({
      success: true,
      message: "Vercel KV is working!",
      testValue,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        message: "Vercel KV is not set up or not working",
      },
      { status: 500 },
    )
  }
}
