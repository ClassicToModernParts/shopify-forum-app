import { type NextRequest, NextResponse } from "next/server"
import fs from "fs"
import path from "path"
import { getSettings, updateSettings as updateMemorySettings } from "./memory-store"

// Define the path to store settings
// Use a relative path that's guaranteed to be writable
const DATA_DIR = path.join(process.cwd(), "app", "data")
const SETTINGS_FILE_PATH = path.join(DATA_DIR, "settings.json")

// Flag to track if we're using file system or memory
let usingFileSystem = true

// Ensure the data directory exists
const ensureDataDir = () => {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true })
      console.log(`Created data directory at ${DATA_DIR}`)
    }
    return true
  } catch (error) {
    console.error(`Failed to create data directory: ${error}`)
    usingFileSystem = false
    return false
  }
}

// Load settings from file or use defaults
const loadSettings = () => {
  try {
    if (ensureDataDir() && fs.existsSync(SETTINGS_FILE_PATH)) {
      const data = fs.readFileSync(SETTINGS_FILE_PATH, "utf8")
      const settings = JSON.parse(data)
      console.log("Loaded settings from file")
      return settings
    }
  } catch (error) {
    console.error(`Error loading settings file: ${error}`)
    usingFileSystem = false
  }

  // Fall back to memory store
  console.log("Using memory store for settings")
  return getSettings()
}

// Save settings to file or memory
const saveSettings = (settings: any) => {
  try {
    if (usingFileSystem && ensureDataDir()) {
      fs.writeFileSync(SETTINGS_FILE_PATH, JSON.stringify(settings, null, 2))
      console.log(`Settings saved to ${SETTINGS_FILE_PATH}`)
      return { success: true }
    } else {
      // Fall back to memory store
      updateMemorySettings(settings)
      console.log("Settings saved to memory store")
      return { success: true }
    }
  } catch (error) {
    console.error(`Error saving settings to file: ${error}`)

    // Try memory store as fallback
    try {
      updateMemorySettings(settings)
      console.log("Settings saved to memory store after file system failure")
      return { success: true }
    } catch (memError) {
      console.error(`Error saving to memory store: ${memError}`)
      return { success: false, error: `Failed to save settings: ${error}` }
    }
  }
}

// Current settings
let currentSettings = loadSettings()

export async function GET() {
  return NextResponse.json({
    success: true,
    data: currentSettings,
    message: "Settings retrieved successfully",
    storageType: usingFileSystem ? "file" : "memory",
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

    // Save to file or memory for persistence
    const saveResult = saveSettings(currentSettings)

    if (!saveResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: saveResult.error || "Failed to save settings",
        },
        { status: 500 },
      )
    }

    return NextResponse.json({
      success: true,
      message: "Settings saved successfully",
      data: currentSettings,
      storageType: usingFileSystem ? "file" : "memory",
    })
  } catch (error) {
    console.error("Error in POST settings:", error)
    return NextResponse.json(
      {
        success: false,
        error: `Failed to save settings: ${error instanceof Error ? error.message : String(error)}`,
      },
      { status: 500 },
    )
  }
}
