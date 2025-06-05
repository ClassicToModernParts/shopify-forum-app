import { type NextRequest, NextResponse } from "next/server"
import { dataStore } from "@/lib/persistent-data-store"

export async function GET(request: NextRequest) {
  try {
    console.log("📋 Groups API GET request started")

    const { searchParams } = new URL(request.url)
    const requestType = searchParams.get("type")
    const shopId = searchParams.get("shop_id") || "demo"

    console.log(`👥 Groups API GET request: ${requestType} for shop ${shopId}`)

    // Ensure system is initialized
    const isInitialized = await dataStore.isInitialized()
    if (!isInitialized) {
      console.log("⚠️ System not initialized, initializing now...")
      const initResult = await dataStore.initialize({ includeSampleGroups: false })
      if (!initResult) {
        return NextResponse.json(
          {
            success: false,
            error: "Failed to initialize system",
            data: null,
          },
          { status: 500 },
        )
      }
    }

    if (requestType === "list" || !requestType) {
      const groups = await dataStore.getGroups()
      console.log(`📋 Returning ${groups.length} groups`)

      // Sort groups by creation date (newest first)
      const sortedGroups = groups.sort((a, b) => {
        const dateA = new Date(a.createdAt)
        const dateB = new Date(b.createdAt)
        return dateB.getTime() - dateA.getTime()
      })

      return NextResponse.json({
        success: true,
        data: sortedGroups,
        message: "Groups retrieved successfully",
      })
    } else if (requestType === "group") {
      const groupId = searchParams.get("group_id")

      if (!groupId) {
        return NextResponse.json(
          {
            success: false,
            error: "Group ID is required",
            data: null,
          },
          { status: 400 },
        )
      }

      const group = await dataStore.getGroupById(groupId)
      if (!group) {
        return NextResponse.json(
          {
            success: false,
            error: "Group not found",
            data: null,
          },
          { status: 404 },
        )
      }

      return NextResponse.json({
        success: true,
        data: group,
        message: "Group retrieved successfully",
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
    console.error("❌ Error in groups API GET:", error)
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
    console.log("📝 Groups API POST request started")

    // Ensure system is initialized
    const isInitialized = await dataStore.isInitialized()
    if (!isInitialized) {
      console.log("⚠️ System not initialized, initializing now...")
      const initResult = await dataStore.initialize({ includeSampleGroups: false })
      if (!initResult) {
        return NextResponse.json(
          {
            success: false,
            error: "Failed to initialize system",
          },
          { status: 500 },
        )
      }
    }

    const body = await request.json()
    const { type, shopId } = body

    console.log(`📝 Groups API POST request: ${type} for shop ${shopId}`)

    // Get auth token
    const authHeader = request.headers.get("authorization")
    const token = authHeader?.split(" ")[1]

    // Check authentication for all operations
    if (!token) {
      console.log("⚠️ No auth token provided for groups API POST")

      // Try to get user from session cookie as fallback
      const sessionCookie = request.cookies.get("session")
      const userEmail = sessionCookie?.value

      if (!userEmail) {
        return NextResponse.json(
          {
            success: false,
            error: "Authentication required",
          },
          { status: 401 },
        )
      }

      // Verify user exists
      const user = await dataStore.getUserByEmail(userEmail)
      if (!user) {
        return NextResponse.json(
          {
            success: false,
            error: "User not found",
          },
          { status: 401 },
        )
      }

      // Continue with the user from cookie
      console.log("✅ User authenticated via session cookie:", userEmail)
    } else {
      // Verify token
      try {
        // Simple token verification - in production you'd use proper JWT
        const tokenData = JSON.parse(Buffer.from(token.split(".")[1], "base64").toString())
        const userEmail = tokenData.email

        if (!userEmail) {
          return NextResponse.json(
            {
              success: false,
              error: "Invalid token format - no email found",
            },
            { status: 401 },
          )
        }

        // Verify user exists
        const user = await dataStore.getUserByEmail(userEmail)
        if (!user) {
          return NextResponse.json(
            {
              success: false,
              error: "User not found with token email",
            },
            { status: 401 },
          )
        }

        console.log("✅ User authenticated via token:", userEmail)
      } catch (error) {
        console.error("Error verifying token:", error)
        return NextResponse.json(
          {
            success: false,
            error: "Invalid authentication token",
          },
          { status: 401 },
        )
      }
    }

    if (type === "create_group") {
      const { name, description, category, location, maxMembers, requirements, creatorEmail, creatorName } = body

      // Validate required fields
      if (!name || !description || !creatorEmail) {
        return NextResponse.json(
          {
            success: false,
            error: "Missing required fields",
            missingFields: {
              name: !name,
              description: !description,
              creatorEmail: !creatorEmail,
            },
          },
          { status: 400 },
        )
      }

      const group = await dataStore.createGroup({
        name,
        description,
        category: category || "general",
        location: location || "Not specified",
        maxMembers: maxMembers ? Number.parseInt(maxMembers) : undefined,
        requirements,
        creatorEmail,
        creatorName: creatorName || "Anonymous",
      })

      if (!group) {
        return NextResponse.json(
          {
            success: false,
            error: "Failed to create group",
          },
          { status: 500 },
        )
      }

      return NextResponse.json({
        success: true,
        data: group,
        message: "Group created successfully",
      })
    } else if (type === "join_group") {
      const { groupId, userEmail, userName } = body

      if (!groupId || !userEmail || !userName) {
        return NextResponse.json(
          {
            success: false,
            error: "Group ID, user email, and name are required",
          },
          { status: 400 },
        )
      }

      // Get the group
      const group = await dataStore.getGroupById(groupId)
      if (!group) {
        return NextResponse.json(
          {
            success: false,
            error: "Group not found",
          },
          { status: 404 },
        )
      }

      // Check if user is already a member
      if (group.members.some((member) => member.email === userEmail)) {
        return NextResponse.json({
          success: true,
          data: group,
          message: "User is already a member of this group",
        })
      }

      // Check if group is at capacity
      if (group.maxMembers && group.members.length >= group.maxMembers) {
        return NextResponse.json(
          {
            success: false,
            error: "Group is at maximum capacity",
          },
          { status: 400 },
        )
      }

      // Add user to group
      const updatedGroup = await dataStore.updateGroup(groupId, {
        members: [
          ...group.members,
          {
            email: userEmail,
            name: userName,
            joinedAt: new Date().toISOString(),
            role: "member",
          },
        ],
      })

      if (!updatedGroup) {
        return NextResponse.json(
          {
            success: false,
            error: "Failed to join group",
          },
          { status: 500 },
        )
      }

      return NextResponse.json({
        success: true,
        data: updatedGroup,
        message: "Successfully joined group",
      })
    } else if (type === "leave_group") {
      const { groupId, userEmail } = body

      if (!groupId || !userEmail) {
        return NextResponse.json(
          {
            success: false,
            error: "Group ID and user email are required",
          },
          { status: 400 },
        )
      }

      // Get the group
      const group = await dataStore.getGroupById(groupId)
      if (!group) {
        return NextResponse.json(
          {
            success: false,
            error: "Group not found",
          },
          { status: 404 },
        )
      }

      // Check if user is a member
      if (!group.members.some((member) => member.email === userEmail)) {
        return NextResponse.json(
          {
            success: false,
            error: "User is not a member of this group",
          },
          { status: 400 },
        )
      }

      // Check if user is the creator (cannot leave if creator)
      if (group.creatorEmail === userEmail) {
        return NextResponse.json(
          {
            success: false,
            error: "Group creator cannot leave the group",
          },
          { status: 400 },
        )
      }

      // Remove user from group
      const updatedGroup = await dataStore.updateGroup(groupId, {
        members: group.members.filter((member) => member.email !== userEmail),
      })

      if (!updatedGroup) {
        return NextResponse.json(
          {
            success: false,
            error: "Failed to leave group",
          },
          { status: 500 },
        )
      }

      return NextResponse.json({
        success: true,
        data: updatedGroup,
        message: "Successfully left group",
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
    console.error("❌ Error in groups API POST:", error)
    return NextResponse.json(
      {
        success: false,
        error: `An error occurred: ${error instanceof Error ? error.message : "Unknown error"}`,
      },
      { status: 500 },
    )
  }
}
