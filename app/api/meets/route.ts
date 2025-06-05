import { type NextRequest, NextResponse } from "next/server"
import { dataStore } from "@/lib/persistent-data-store"
import { cookies } from "next/headers"

// Helper function to get user from request
async function getUserFromRequest(request: NextRequest) {
  try {
    // Try to get user from Authorization header
    const authHeader = request.headers.get("authorization")
    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.substring(7)
      // For now, we'll get user from cookies since we're using simple tokens
    }

    // Try to get user from cookies
    const userSession = cookies().get("user-session")?.value
    const userEmail = cookies().get("user-email")?.value

    console.log("🔍 Meets API: Checking auth - Session:", !!userSession, "Email:", !!userEmail)

    if (userSession) {
      const user = await dataStore.getUserById(userSession)
      console.log("👤 Meets API: Found user:", user?.username)
      return user
    }

    if (userEmail) {
      const user = await dataStore.getUserByEmail(userEmail)
      console.log("👤 Meets API: Found user by email:", user?.username)
      return user
    }

    console.log("❌ Meets API: No user found")
    return null
  } catch (error) {
    console.error("❌ Meets API: Error getting user:", error)
    return null
  }
}

export async function GET() {
  try {
    console.log("📋 Meets API: Getting all meets")

    // Ensure data store is initialized
    if (!(await dataStore.isInitialized())) {
      console.log("⚠️ Meets API: Initializing data store...")
      await dataStore.initialize()
    }

    const meets = await dataStore.getMeets()
    console.log("✅ Meets API: Retrieved", meets.length, "meets")

    return NextResponse.json(meets)
  } catch (error) {
    console.error("❌ Meets API: Get meets error:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch meets",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log("📝 Meets API: Creating new meet")

    // Check authentication
    const user = await getUserFromRequest(request)
    if (!user) {
      console.log("❌ Meets API: Authentication required")
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    console.log("✅ Meets API: User authenticated:", user.username)

    const meetData = await request.json()
    console.log("📋 Meets API: Meet data received:", {
      title: meetData.title,
      date: meetData.date,
      location: meetData.location,
    })

    // Validate required fields
    if (!meetData.title || !meetData.description || !meetData.date || !meetData.time || !meetData.location) {
      console.log("❌ Meets API: Missing required fields")
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Ensure data store is initialized
    if (!(await dataStore.isInitialized())) {
      console.log("⚠️ Meets API: Initializing data store...")
      await dataStore.initialize()
    }

    // Create the meet
    const meet = await dataStore.createMeet({
      title: meetData.title,
      description: meetData.description,
      date: meetData.date,
      time: meetData.time,
      location: meetData.location,
      address: meetData.address || "",
      vehicleTypes: meetData.vehicleTypes || [],
      maxAttendees: meetData.maxAttendees ? Number.parseInt(meetData.maxAttendees) : undefined,
      contactInfo: meetData.contactInfo || "",
      requirements: meetData.requirements || "",
      organizer: user.name || user.username,
      organizerEmail: user.email,
      status: "upcoming",
    })

    if (!meet) {
      console.log("❌ Meets API: Failed to create meet")
      return NextResponse.json({ error: "Failed to create meet" }, { status: 500 })
    }

    console.log("✅ Meets API: Meet created successfully:", meet.id)
    return NextResponse.json(meet)
  } catch (error) {
    console.error("❌ Meets API: Create meet error:", error)
    return NextResponse.json(
      {
        error: "Failed to create meet",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
