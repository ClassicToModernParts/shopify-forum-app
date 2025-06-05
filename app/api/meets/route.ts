import { type NextRequest, NextResponse } from "next/server"
import { dataStore } from "@/lib/persistent-data-store"
import { cookies } from "next/headers"

// Helper function to get user from request
async function getUserFromRequest(request: NextRequest) {
  // Try to get user from Authorization header
  const authHeader = request.headers.get("authorization")
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.substring(7)
    // For now, we'll get user ID from localStorage token
    // In a real app, you'd decode the JWT token
    try {
      const payload = JSON.parse(Buffer.from(token.split(".")[1], "base64").toString())
      return await dataStore.getUserById(payload.sub)
    } catch (error) {
      console.error("Error decoding token:", error)
    }
  }

  // Try to get user from cookies
  const userSession = cookies().get("user-session")?.value
  if (userSession) {
    return await dataStore.getUserById(userSession)
  }

  return null
}

export async function GET() {
  try {
    if (!(await dataStore.isInitialized())) {
      await dataStore.initialize()
    }

    const meets = await dataStore.getMeets()
    return NextResponse.json(meets)
  } catch (error) {
    console.error("Get meets error:", error)
    return NextResponse.json({ error: "Failed to fetch meets" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const meetData = await request.json()

    if (!meetData.title || !meetData.description || !meetData.date || !meetData.time || !meetData.location) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    if (!(await dataStore.isInitialized())) {
      await dataStore.initialize()
    }

    const meet = await dataStore.createMeet({
      ...meetData,
      organizerId: user.id,
      organizer: user.name || user.username,
      organizerEmail: user.email,
      status: "upcoming",
      vehicleTypes: meetData.vehicleTypes || [],
      createdAt: new Date().toISOString(),
      attendees: [],
    })

    console.log("✅ Meet created successfully:", meet.id)
    return NextResponse.json(meet)
  } catch (error) {
    console.error("Create meet error:", error)
    return NextResponse.json({ error: "Failed to create meet" }, { status: 500 })
  }
}
