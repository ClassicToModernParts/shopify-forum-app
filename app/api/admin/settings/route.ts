import { type NextRequest, NextResponse } from "next/server"
import fs from "fs"
import path from "path"

// Define the path to store settings
const SETTINGS_FILE_PATH = path.join(process.cwd(), "data", "settings.json")

// Ensure the data directory exists
const ensureDataDir = () => {
  const dataDir = path.join(process.cwd(), "data")
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true })
  }
}

// Default settings
const defaultSettings = {
  general: {
    forumName: "Community Forum",
    description: "Connect with other customers and get support",
    welcomeMessage: "Welcome to our community!",
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

// Load settings from file or use defaults
const loadSettings = () => {
  try {
    ensureDataDir()
    if (fs.existsSync(SETTINGS_FILE_PATH)) {
      const data = fs.readFileSync(SETTINGS_FILE_PATH, "utf8")
      return JSON.parse(data)
    }
    return defaultSettings
  } catch (error) {
    console.error("Error loading settings:", error)
    return defaultSettings
  }
}

// Save settings to file
const saveSettings = (settings: any) => {
  try {
    ensureDataDir()
    fs.writeFileSync(SETTINGS_FILE_PATH, JSON.stringify(settings, null, 2))
    return true
  } catch (error) {
    console.error("Error saving settings:", error)
    return false
  }
}

// Current settings
let currentSettings = loadSettings()

export async function GET() {
  return NextResponse.json({
    success: true,
    data: currentSettings,
    message: "Settings retrieved successfully",
  })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { settings } = body

    if (!settings) {
      return NextResponse.json({ success: false, error: "Settings data is required" }, { status: 400 })
    }

    // Update current settings with new values
    currentSettings = {
      ...settings,
      lastUpdated: new Date().toISOString(),
    }

    // Save to file for persistence
    const saved = saveSettings(currentSettings)

    if (!saved) {
      return NextResponse.json({ success: false, error: "Failed to save settings to file" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "Settings saved successfully",
      data: currentSettings,
    })
  } catch (error) {
    console.error("Error in POST settings:", error)
    return NextResponse.json({ success: false, error: "Failed to save settings" }, { status: 500 })
  }
}
