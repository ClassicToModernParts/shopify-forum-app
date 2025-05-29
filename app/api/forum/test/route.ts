import { NextResponse } from "next/server"

export async function GET() {
  return NextResponse.json({
    success: true,
    message: "Forum API is working!",
    timestamp: new Date().toISOString(),
  })
}

export async function POST() {
  return NextResponse.json({
    success: true,
    message: "Forum API POST is working!",
    timestamp: new Date().toISOString(),
  })
}
