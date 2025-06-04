import { type NextRequest, NextResponse } from "next/server"
import { persistentForumDataStore } from "@/lib/persistent-data-store"
import { ensureDataStoreInitialized } from "@/lib/data-store-manager"

export async function GET(request: NextRequest) {
  try {
    // Ensure data store is initialized before proceeding
    const initialized = await ensureDataStoreInitialized()
    if (!initialized) {
      return NextResponse.json(
        {
          success: false,
          error: "Data store initialization failed. Please try again later.",
          data: null,
        },
        { status: 500 },
      )
    }

    const { searchParams } = new URL(request.url)
    const requestType = searchParams.get("type")
    const shopId = searchParams.get("shop_id") || "demo"

    console.log(`👥 Groups API GET request: ${requestType} for shop ${shopId}`)

    if (requestType === "list" || !requestType) {
      const groups = await persistentForumDataStore.getGroups()
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

      const group = await persistentForumDataStore.getGroupById(groupId)
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
    console.error("❌ Error in groups API:", error)
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
    // Ensure data store is initialized before proceeding
    const initialized = await ensureDataStoreInitialized()
    if (!initialized) {
      return NextResponse.json(
        {
          success: false,
          error: "Data store initialization failed. Please try again later.",
        },
        { status: 500 },
      )
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
      const user = await persistentForumDataStore.getUserByEmail(userEmail)
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
        // Get user from token
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
        const user = await persistentForumDataStore.getUserByEmail(userEmail)
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

      const group = await persistentForumDataStore.createGroup({
        name,
        description,
        category: category || "general",
        location: location || "Not specified",
        maxMembers: maxMembers ? Number.parseInt(maxMembers) : null,
        requirements,
        creatorEmail,
        creatorName: creatorName || "Anonymous",
      })

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

      const result = await persistentForumDataStore.joinGroup(groupId, userEmail, userName)

      if (!result) {
        return NextResponse.json(
          {
            success: false,
            error: "Group not found, at capacity, or user already joined",
          },
          { status: 404 },
        )
      }

      return NextResponse.json({
        success: true,
        data: result,
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

      const result = await persistentForumDataStore.leaveGroup(groupId, userEmail)

      if (!result) {
        return NextResponse.json(
          {
            success: false,
            error: "Group not found or user not in group",
          },
          { status: 404 },
        )
      }

      return NextResponse.json({
        success: true,
        data: result,
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
