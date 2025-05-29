import { NextResponse } from "next/server"
import fs from "fs"
import path from "path"
import os from "os"

export async function GET() {
  const dataDir = path.join(process.cwd(), "app", "data")
  const settingsPath = path.join(dataDir, "settings.json")

  const info = {
    environment: process.env.NODE_ENV || "unknown",
    platform: os.platform(),
    cwd: process.cwd(),
    dataDir: {
      path: dataDir,
      exists: false,
      writable: false,
    },
    settingsFile: {
      path: settingsPath,
      exists: false,
      size: null,
    },
    tempDirWritable: false,
  }

  // Check data directory
  try {
    info.dataDir.exists = fs.existsSync(dataDir)
    if (info.dataDir.exists) {
      try {
        fs.accessSync(dataDir, fs.constants.W_OK)
        info.dataDir.writable = true
      } catch (e) {
        // Not writable
      }
    }
  } catch (e) {
    // Error checking directory
  }

  // Check settings file
  try {
    info.settingsFile.exists = fs.existsSync(settingsPath)
    if (info.settingsFile.exists) {
      const stats = fs.statSync(settingsPath)
      info.settingsFile.size = stats.size
    }
  } catch (e) {
    // Error checking file
  }

  // Check if temp directory is writable
  try {
    const tempFile = path.join(os.tmpdir(), `test-${Date.now()}.txt`)
    fs.writeFileSync(tempFile, "test")
    fs.unlinkSync(tempFile)
    info.tempDirWritable = true
  } catch (e) {
    // Temp dir not writable
  }

  return NextResponse.json(info)
}
