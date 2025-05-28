import { type NextRequest, NextResponse } from "next/server"
import { writeFile, readFile } from "fs/promises"
import path from "path"

// In production, you'd store this in a secure database
const CREDENTIALS_FILE = path.join(process.cwd(), "admin-credentials.json")

interface AdminCredentials {
  username: string
  password: string
  lastUpdated: string
}

// Default credentials
const DEFAULT_CREDENTIALS: AdminCredentials = {
  username: "admin",
  password: "admin123",
  lastUpdated: new Date().toISOString(),
}

async function getCredentials(): Promise<AdminCredentials> {
  try {
    const data = await readFile(CREDENTIALS_FILE, "utf-8")
    return JSON.parse(data)
  } catch (error) {
    // File doesn't exist, return defaults
    return DEFAULT_CREDENTIALS
  }
}

async function saveCredentials(credentials: AdminCredentials): Promise<void> {
  try {
    await writeFile(CREDENTIALS_FILE, JSON.stringify(credentials, null, 2))
  } catch (error) {
    console.error("Error saving credentials:", error)
    throw new Error("Failed to save credentials")
  }
}

export async function POST(request: NextRequest) {
  try {
    const { currentPassword, newUsername, newPassword } = await request.json()

    if (!currentPassword || !newUsername || !newPassword) {
      return NextResponse.json(
        {
          success: false,
          error: "All fields are required",
        },
        { status: 400 },
      )
    }

    // Get current credentials
    const currentCredentials = await getCredentials()

    // Verify current password
    if (currentPassword !== currentCredentials.password) {
      return NextResponse.json(
        {
          success: false,
          error: "Current password is incorrect",
        },
        { status: 401 },
      )
    }

    // Validate new password
    if (newPassword.length < 6) {
      return NextResponse.json(
        {
          success: false,
          error: "New password must be at least 6 characters",
        },
        { status: 400 },
      )
    }

    // Save new credentials
    const newCredentials: AdminCredentials = {
      username: newUsername.trim(),
      password: newPassword,
      lastUpdated: new Date().toISOString(),
    }

    await saveCredentials(newCredentials)

    return NextResponse.json({
      success: true,
      message: "Credentials updated successfully",
    })
  } catch (error) {
    console.error("Error changing credentials:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update credentials",
      },
      { status: 500 },
    )
  }
}
