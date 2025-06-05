import { type NextRequest, NextResponse } from "next/server"
import { dataStore } from "@/lib/persistent-data-store"

export async function GET() {
  try {
    if (!(await dataStore.isInitialized())) {
      await dataStore.initialize()
    }

    const meets = await dataStore.getMeets()
    return NextResponse.json(meets)
  } catch (error) {
    console.error("Get meets error:", error)
    return NextResponse.json({ error: "Failed to fetch meets" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const meetData = await request.json()

    if (!meetData.title || !meetData.description || !meetData.date || !meetData.time || !meetData.location) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    if (!(await dataStore.isInitialized())) {
      await dataStore.initialize()
    }

    const meet = await dataStore.createMeet({
      ...meetData,
      status: "upcoming",
      vehicleTypes: meetData.vehicleTypes || [],
    })

    return NextResponse.json(meet)
  } catch (error) {
    console.error("Create meet error:", error)
    return NextResponse.json({ error: "Failed to create meet" }, { status: 500 })
  }
}
