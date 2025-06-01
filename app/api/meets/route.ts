import { type NextRequest, NextResponse } from "next/server"
import { persistentForumDataStore } from "@/lib/persistent-data-store"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const requestType = searchParams.get("type")
    const shopId = searchParams.get("shop_id") || "demo"

    console.log(`🚗 Meets API GET request: ${requestType} for shop ${shopId}`)

    if (requestType === "list" || !requestType) {
      const meets = await persistentForumDataStore.getMeets()
      console.log(`📋 Returning ${meets.length} meets`)

      // Sort meets by date (upcoming first)
      const sortedMeets = meets.sort((a, b) => {
        const dateA = new Date(`${a.date}T${a.time}`)
        const dateB = new Date(`${b.date}T${b.time}`)
        return dateA.getTime() - dateB.getTime()
      })

      return NextResponse.json({
        success: true,
        data: sortedMeets,
        message: "Meets retrieved successfully",
      })
    } else if (requestType === "meet") {
      const meetId = searchParams.get("meet_id")

      if (!meetId) {
        return NextResponse.json(
          {
            success: false,
            error: "Meet ID is required",
            data: null,
          },
          { status: 400 },
        )
      }

      const meet = await persistentForumDataStore.getMeetById(meetId)
      if (!meet) {
        return NextResponse.json(
          {
            success: false,
            error: "Meet not found",
            data: null,
          },
          { status: 404 },
        )
      }

      return NextResponse.json({
        success: true,
        data: meet,
        message: "Meet retrieved successfully",
      })
    } else {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid request type",
          data: null,
        },
        { status: 400 },
      )
    }
  } catch (error) {
    console.error("❌ Error in meets API:", error)
    return NextResponse.json(
      {
        success: false,
        error: `An error occurred: ${error instanceof Error ? error.message : "Unknown error"}`,
        data: null,
      },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, shopId } = body

    console.log(`📝 Meets API POST request: ${type} for shop ${shopId}`)

    if (type === "create_meet") {
      const {
        title,
        description,
        organizer,
        organizerEmail,
        date,
        time,
        location,
        address,
        vehicleTypes,
        maxAttendees,
        contactInfo,
        requirements,
        tags,
      } = body

      // Validate required fields
      if (!title || !description || !date || !time || !location || !organizerEmail) {
        return NextResponse.json(
          {
            success: false,
            error: "Missing required fields",
            missingFields: {
              title: !title,
              description: !description,
              date: !date,
              time: !time,
              location: !location,
              organizerEmail: !organizerEmail,
            },
          },
          { status: 400 },
        )
      }

      const meet = await persistentForumDataStore.createMeet({
        title,
        description,
        organizer,
        organizerEmail,
        date,
        time,
        location,
        address,
        vehicleTypes: vehicleTypes || [],
        maxAttendees: maxAttendees ? Number.parseInt(maxAttendees) : undefined,
        contactInfo,
        requirements,
        status: "upcoming",
        tags: tags
          ? tags
              .split(",")
              .map((tag: string) => tag.trim())
              .filter(Boolean)
          : [],
      })

      return NextResponse.json({
        success: true,
        data: meet,
        message: "Meet created successfully",
      })
    } else if (type === "rsvp_meet") {
      const { meetId, userId, userName, userEmail, vehicleInfo } = body

      if (!meetId || !userId || !userName || !userEmail) {
        return NextResponse.json(
          {
            success: false,
            error: "Meet ID, user ID, name, and email are required",
          },
          { status: 400 },
        )
      }

      const result = await persistentForumDataStore.rsvpToMeet(meetId, userId, userName, userEmail, vehicleInfo)

      if (!result) {
        return NextResponse.json(
          {
            success: false,
            error: "Meet not found or at capacity",
          },
          { status: 404 },
        )
      }

      return NextResponse.json({
        success: true,
        data: result,
        message: "RSVP successful",
      })
    } else if (type === "cancel_rsvp") {
      const { meetId, userId } = body

      if (!meetId || !userId) {
        return NextResponse.json(
          {
            success: false,
            error: "Meet ID and user ID are required",
          },
          { status: 400 },
        )
      }

      const result = await persistentForumDataStore.cancelRsvp(meetId, userId)

      if (!result) {
        return NextResponse.json(
          {
            success: false,
            error: "Meet not found or user has not RSVP'd",
          },
          { status: 404 },
        )
      }

      return NextResponse.json({
        success: true,
        data: result,
        message: "RSVP cancelled successfully",
      })
    } else if (type === "update_meet") {
      const { meetId, userEmail, ...updates } = body

      if (!meetId || !userEmail) {
        return NextResponse.json(
          {
            success: false,
            error: "Meet ID and user email are required",
          },
          { status: 400 },
        )
      }

      // Check if user is the organizer or admin
      const meet = await persistentForumDataStore.getMeetById(meetId)
      if (!meet) {
        return NextResponse.json(
          {
            success: false,
            error: "Meet not found",
          },
          { status: 404 },
        )
      }

      if (meet.organizerEmail !== userEmail && userEmail !== "admin@store.com") {
        return NextResponse.json(
          {
            success: false,
            error: "Not authorized to update this meet",
          },
          { status: 403 },
        )
      }

      const result = await persistentForumDataStore.updateMeet(meetId, updates)

      if (!result) {
        return NextResponse.json(
          {
            success: false,
            error: "Failed to update meet",
          },
          { status: 500 },
        )
      }

      return NextResponse.json({
        success: true,
        data: result,
        message: "Meet updated successfully",
      })
    } else if (type === "delete_meet") {
      const { meetId, userEmail } = body

      if (!meetId || !userEmail) {
        return NextResponse.json(
          {
            success: false,
            error: "Meet ID and user email are required",
          },
          { status: 400 },
        )
      }

      const result = await persistentForumDataStore.deleteMeet(meetId, userEmail)

      if (!result) {
        return NextResponse.json(
          {
            success: false,
            error: "Meet not found or you don't have permission to delete it",
          },
          { status: 404 },
        )
      }

      return NextResponse.json({
        success: true,
        data: { deleted: true, meetId },
        message: "Meet cancelled successfully",
      })
    } else {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid request type",
        },
        { status: 400 },
      )
    }
  } catch (error) {
    console.error("❌ Error in meets API POST:", error)
    return NextResponse.json(
      {
        success: false,
        error: `An error occurred: ${error instanceof Error ? error.message : "Unknown error"}`,
      },
      { status: 500 },
    )
  }
}
