import { type NextRequest, NextResponse } from "next/server"
import { persistentForumDataStore } from "@/lib/persistent-data-store"

// Simple hash function for passwords (in production, use proper hashing)
function simpleHash(password: string): string {
  let hash = 0
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash // Convert to 32bit integer
  }
  return hash.toString()
}

export async function GET(request: NextRequest) {
  try {
    console.log("🔍 Admin users API: GET request")

    const { searchParams } = new URL(request.url)
    const includeInactive = searchParams.get("include_inactive") === "true"
    const search = searchParams.get("search")
    const role = searchParams.get("role")

    let users = await persistentForumDataStore.getUsers()

    // Filter inactive users if not requested
    if (!includeInactive) {
      users = users.filter((user) => user.isActive !== false)
    }

    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase()
      users = users.filter(
        (user) =>
          user.username.toLowerCase().includes(searchLower) ||
          user.name.toLowerCase().includes(searchLower) ||
          user.email.toLowerCase().includes(searchLower),
      )
    }

    // Apply role filter
    if (role) {
      users = users.filter((user) => user.role === role)
    }

    // Remove password from response
    const safeUsers = users.map(({ password, ...user }) => user)

    console.log(`✅ Found ${safeUsers.length} users`)

    return NextResponse.json({
      success: true,
      data: safeUsers,
      count: safeUsers.length,
    })
  } catch (error) {
    console.error("❌ Error fetching users:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch users",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log("➕ Admin users API: POST request")

    const body = await request.json()
    const { username, name, email, password, role = "user" } = body

    // Validate required fields
    if (!username || !name || !email || !password) {
      return NextResponse.json(
        { success: false, error: "Username, name, email, and password are required" },
        { status: 400 },
      )
    }

    // Validate role
    if (!["user", "moderator", "admin"].includes(role)) {
      return NextResponse.json(
        { success: false, error: "Invalid role. Must be user, moderator, or admin" },
        { status: 400 },
      )
    }

    // Check if username already exists
    const existingUsername = await persistentForumDataStore.getUserByUsername(username)
    if (existingUsername) {
      return NextResponse.json({ success: false, error: "Username already exists" }, { status: 409 })
    }

    // Check if email already exists
    const existingEmail = await persistentForumDataStore.getUserByEmail(email)
    if (existingEmail) {
      return NextResponse.json({ success: false, error: "Email already exists" }, { status: 409 })
    }

    // Hash password
    const hashedPassword = simpleHash(password)

    // Create user
    const newUser = await persistentForumDataStore.addUser({
      username,
      name,
      email,
      password: hashedPassword,
      role: role as "user" | "moderator" | "admin",
    })

    // Remove password from response
    const { password: _, ...safeUser } = newUser

    console.log(`✅ User created: ${username}`)

    return NextResponse.json({
      success: true,
      data: safeUser,
      message: "User created successfully",
    })
  } catch (error) {
    console.error("❌ Error creating user:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create user",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    console.log("✏️ Admin users API: PUT request")

    const body = await request.json()
    const { userId, updates } = body

    if (!userId) {
      return NextResponse.json({ success: false, error: "User ID is required" }, { status: 400 })
    }

    // Hash password if provided
    if (updates.password) {
      updates.password = simpleHash(updates.password)
    }

    // Validate role if provided
    if (updates.role && !["user", "moderator", "admin"].includes(updates.role)) {
      return NextResponse.json(
        { success: false, error: "Invalid role. Must be user, moderator, or admin" },
        { status: 400 },
      )
    }

    // Check if new username/email conflicts with existing users
    if (updates.username) {
      const existingUsername = await persistentForumDataStore.getUserByUsername(updates.username)
      if (existingUsername && existingUsername.id !== userId) {
        return NextResponse.json({ success: false, error: "Username already exists" }, { status: 409 })
      }
    }

    if (updates.email) {
      const existingEmail = await persistentForumDataStore.getUserByEmail(updates.email)
      if (existingEmail && existingEmail.id !== userId) {
        return NextResponse.json({ success: false, error: "Email already exists" }, { status: 409 })
      }
    }

    const updatedUser = await persistentForumDataStore.updateUser(userId, updates)

    if (!updatedUser) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 })
    }

    // Remove password from response
    const { password: _, ...safeUser } = updatedUser

    console.log(`✅ User updated: ${userId}`)

    return NextResponse.json({
      success: true,
      data: safeUser,
      message: "User updated successfully",
    })
  } catch (error) {
    console.error("❌ Error updating user:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update user",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    console.log("🗑️ Admin users API: DELETE request")

    const body = await request.json()
    const { userId, hardDelete = false } = body

    if (!userId) {
      return NextResponse.json({ success: false, error: "User ID is required" }, { status: 400 })
    }

    if (hardDelete) {
      // Hard delete: remove user completely (not implemented for safety)
      return NextResponse.json({ success: false, error: "Hard delete not implemented for safety" }, { status: 501 })
    } else {
      // Soft delete: deactivate user
      const updatedUser = await persistentForumDataStore.updateUser(userId, {
        isActive: false,
        lastActive: new Date().toISOString(),
      })

      if (!updatedUser) {
        return NextResponse.json({ success: false, error: "User not found" }, { status: 404 })
      }

      console.log(`✅ User deactivated: ${userId}`)

      return NextResponse.json({
        success: true,
        message: "User deactivated successfully",
      })
    }
  } catch (error) {
    console.error("❌ Error deleting user:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete user",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
