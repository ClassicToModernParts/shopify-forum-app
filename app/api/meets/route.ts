import { type NextRequest, NextResponse } from "next/server"
import { persistentForumDataStore } from "@/lib/persistent-data-store"

export async function GET(request: NextRequest) {
  try {
    console.log("🚗 Meets API: GET request received")

    // Initialize data store if needed
    const isInit = await persistentForumDataStore.isInitialized()
    if (!isInit) {
      console.log("🔄 Initializing data store for meets...")
      await persistentForumDataStore.initialize()
    }

    const meets = await persistentForumDataStore.getMeets()
    console.log(`📋 Returning ${meets.length} meets`)

    // Sort meets by date (upcoming first)
    const sortedMeets = meets.sort((a, b) => {
      const dateA = new Date(`${a.date}T${a.time}`)
      const dateB = new Date(`${b.date}T${b.time}`)
      return dateA.getTime() - dateB.getTime()
    })

    return NextResponse.json(sortedMeets)
  } catch (error) {
    console.error("❌ Error in meets API:", error)
    return NextResponse.json(
      { error: `Failed to fetch meets: ${error instanceof Error ? error.message : "Unknown error"}` },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log("🚗 Meets API: POST request received")

    const body = await request.json()
    console.log("📝 Meet creation data:", body)

    // Initialize data store if needed
    const isInit = await persistentForumDataStore.isInitialized()
    if (!isInit) {
      console.log("🔄 Initializing data store for meets...")
      await persistentForumDataStore.initialize()
    }

    // Validate required fields
    const { title, description, organizer, organizerEmail, date, time, location } = body

    if (!title || !description || !date || !time || !location || !organizerEmail) {
      return NextResponse.json(
        {
          error: "Missing required fields",
          required: ["title", "description", "date", "time", "location", "organizerEmail"],
        },
        { status: 400 },
      )
    }

    const meet = await persistentForumDataStore.createMeet({
      title,
      description,
      organizer: organizer || "Anonymous",
      organizerEmail,
      date,
      time,
      location,
      address: body.address || "",
      vehicleTypes: body.vehicleTypes || [],
      maxAttendees: body.maxAttendees ? Number.parseInt(body.maxAttendees) : undefined,
      contactInfo: body.contactInfo || "",
      requirements: body.requirements || "",
      status: "upcoming",
      tags: body.tags || [],
    })

    console.log("✅ Meet created successfully:", meet.id)
    return NextResponse.json(meet)
  } catch (error) {
    console.error("❌ Error creating meet:", error)
    return NextResponse.json(
      { error: `Failed to create meet: ${error instanceof Error ? error.message : "Unknown error"}` },
      { status: 500 },
    )
  }
}
