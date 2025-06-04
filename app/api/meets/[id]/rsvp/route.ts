import { type NextRequest, NextResponse } from "next/server"
import { persistentForumDataStore } from "@/lib/persistent-data-store"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    console.log("🎫 RSVP API: POST request for meet", params.id)

    const body = await request.json()
    const { userEmail } = body

    if (!userEmail) {
      return NextResponse.json({ error: "User email is required" }, { status: 400 })
    }

    // Initialize data store if needed
    const isInit = await persistentForumDataStore.isInitialized()
    if (!isInit) {
      await persistentForumDataStore.initialize()
    }

    // Get user info
    const user = await persistentForumDataStore.getUserByEmail(userEmail)
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const result = await persistentForumDataStore.rsvpToMeet(params.id, user.id, user.name || user.username, userEmail)

    if (!result) {
      return NextResponse.json({ error: "Failed to RSVP - meet not found or at capacity" }, { status: 400 })
    }

    console.log("✅ RSVP successful for meet", params.id)
    return NextResponse.json(result)
  } catch (error) {
    console.error("❌ Error in RSVP API:", error)
    return NextResponse.json(
      { error: `RSVP failed: ${error instanceof Error ? error.message : "Unknown error"}` },
      { status: 500 },
    )
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    console.log("🎫 Cancel RSVP API: DELETE request for meet", params.id)

    const body = await request.json()
    const { userEmail } = body

    if (!userEmail) {
      return NextResponse.json({ error: "User email is required" }, { status: 400 })
    }

    // Initialize data store if needed
    const isInit = await persistentForumDataStore.isInitialized()
    if (!isInit) {
      await persistentForumDataStore.initialize()
    }

    // Get user info
    const user = await persistentForumDataStore.getUserByEmail(userEmail)
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const result = await persistentForumDataStore.cancelRsvp(params.id, user.id)

    if (!result) {
      return NextResponse.json({ error: "Failed to cancel RSVP - meet not found or user not RSVP'd" }, { status: 400 })
    }

    console.log("✅ RSVP cancelled for meet", params.id)
    return NextResponse.json(result)
  } catch (error) {
    console.error("❌ Error in cancel RSVP API:", error)
    return NextResponse.json(
      { error: `Cancel RSVP failed: ${error instanceof Error ? error.message : "Unknown error"}` },
      { status: 500 },
    )
  }
}
