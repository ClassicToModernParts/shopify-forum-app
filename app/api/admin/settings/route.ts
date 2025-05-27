import { type NextRequest, NextResponse } from "next/server"

interface ForumSettings {
  general: {
    forumName: string
    description: string
    welcomeMessage: string
    contactEmail: string
  }
  moderation: {
    requireApproval: boolean
    autoSpamDetection: boolean
    allowAnonymous: boolean
    enableReporting: boolean
    maxPostLength: number
  }
  appearance: {
    primaryColor: string
    accentColor: string
    darkMode: boolean
    customCSS: string
  }
  notifications: {
    emailNotifications: boolean
    newPostNotifications: boolean
    moderationAlerts: boolean
  }
  lastUpdated: string
}

let currentSettings: ForumSettings = {
  general: {
    forumName: "Community Forum",
    description: "Connect with other customers and get support",
    welcomeMessage: "Welcome to our community! Please read the guidelines before posting.",
    contactEmail: "support@yourstore.com",
  },
  moderation: {
    requireApproval: false,
    autoSpamDetection: true,
    allowAnonymous: false,
    enableReporting: true,
    maxPostLength: 5000,
  },
  appearance: {
    primaryColor: "#3B82F6",
    accentColor: "#10B981",
    darkMode: false,
    customCSS: "",
  },
  notifications: {
    emailNotifications: true,
    newPostNotifications: true,
    moderationAlerts: true,
  },
  lastUpdated: new Date().toISOString(),
}

export async function GET(request: NextRequest) {
  try {
    return NextResponse.json({
      success: true,
      data: currentSettings,
      message: "Settings retrieved successfully",
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Failed to retrieve settings",
      },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { settings } = body

    if (!settings) {
      return NextResponse.json(
        {
          success: false,
          error: "Settings data is required",
        },
        { status: 400 },
      )
    }

    if (!settings.general?.forumName || !settings.general?.contactEmail) {
      return NextResponse.json(
        {
          success: false,
          error: "Forum name and contact email are required",
        },
        { status: 400 },
      )
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(settings.general.contactEmail)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid email format",
        },
        { status: 400 },
      )
    }

    if (settings.moderation?.maxPostLength && settings.moderation.maxPostLength < 100) {
      return NextResponse.json(
        {
          success: false,
          error: "Maximum post length must be at least 100 characters",
        },
        { status: 400 },
      )
    }

    currentSettings = {
      ...settings,
      lastUpdated: new Date().toISOString(),
    }

    return NextResponse.json({
      success: true,
      message: "Settings saved successfully",
      data: currentSettings,
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Failed to save settings",
      },
      { status: 500 },
    )
  }
}