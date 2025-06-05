import { type NextRequest, NextResponse } from "next/server"
import { persistentForumDataStore } from "../../../../../data/persistent-forum-data-store"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { userEmail } = await request.json()
    const meetId = params.id

    if (!userEmail) {
      return NextResponse.json({ error: "User email is required" }, { status: 400 })
    }

    // Get user info
    const user = await persistentForumDataStore.getUserByEmail(userEmail)
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const updatedMeet = await persistentForumDataStore.rsvpToMeet(meetId, userEmail, user.name)

    if (!updatedMeet) {
      return NextResponse.json({ error: "Failed to RSVP - meet not found or at capacity" }, { status: 400 })
    }

    return NextResponse.json(updatedMeet)
  } catch (error) {
    console.error("RSVP error:", error)
    return NextResponse.json({ error: "Failed to RSVP" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { userEmail } = await request.json()
    const meetId = params.id

    if (!userEmail) {
      return NextResponse.json({ error: "User email is required" }, { status: 400 })
    }

    const updatedMeet = await persistentForumDataStore.cancelRsvp(meetId, userEmail)

    if (!updatedMeet) {
      return NextResponse.json(
        { error: "Failed to cancel RSVP - meet not found or user not attending" },
        { status: 400 },
      )
    }

    return NextResponse.json(updatedMeet)
  } catch (error) {
    console.error("Cancel RSVP error:", error)
    return NextResponse.json({ error: "Failed to cancel RSVP" }, { status: 500 })
  }
}
