"use client"

import { useState, useEffect } from "react"
import { Calendar, MapPin, Users, Plus, Clock, Car, Truck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import UserNavigation from "@/components/UserNavigation"
import { useRouter } from "next/navigation"

interface Meet {
  id: string
  title: string
  description: string
  organizer: string
  organizerEmail: string
  date: string
  time: string
  location: string
  address?: string
  vehicleTypes: string[]
  maxAttendees?: number
  contactInfo?: string
  requirements?: string
  status: string
  attendees: Array<{
    userId: string
    userName: string
    userEmail: string
    rsvpDate: string
    vehicleInfo?: string
  }>
  tags?: string[]
}

export default function Meets() {
  const [meets, setMeets] = useState<Meet[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [userInfo, setUserInfo] = useState({ email: "", name: "" })
  const [rsvpLoading, setRsvpLoading] = useState<string | null>(null)

  const router = useRouter()

  // Get user info from localStorage
  useEffect(() => {
    const userEmail = localStorage.getItem("userEmail")
    const userName = localStorage.getItem("userName")

    if (userEmail) {
      setUserInfo({
        email: userEmail,
        name: userName || "User",
      })
    }
  }, [])

  // Fetch meets
  useEffect(() => {
    const fetchMeets = async () => {
      try {
        setLoading(true)
        setError(null)

        console.log("🔄 Fetching meets...")
        const response = await fetch("/api/meets")

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()
        console.log("✅ Meets fetched:", data)

        // Handle both array response and object with data property
        const meetsArray = Array.isArray(data) ? data : data.data || []
        setMeets(meetsArray)
      } catch (e) {
        console.error("❌ Error fetching meets:", e)
        setError(e instanceof Error ? e.message : "Failed to load meets")
      } finally {
        setLoading(false)
      }
    }

    fetchMeets()
  }, [])

  const handleCreateMeet = () => {
    if (!userInfo.email) {
      alert("Please log in to create a meet")
      router.push("/login")
      return
    }
    router.push("/meets/create")
  }

  const handleRSVP = async (meetId: string) => {
    if (!userInfo.email) {
      alert("Please log in to RSVP")
      router.push("/login")
      return
    }

    try {
      setRsvpLoading(meetId)

      const response = await fetch(`/api/meets/${meetId}/rsvp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userEmail: userInfo.email }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to RSVP")
      }

      const updatedMeet = await response.json()

      // Update the meet in the list
      setMeets((prevMeets) => prevMeets.map((meet) => (meet.id === meetId ? updatedMeet : meet)))

      console.log("✅ RSVP successful")
    } catch (error) {
      console.error("❌ RSVP error:", error)
      alert(error instanceof Error ? error.message : "Failed to RSVP")
    } finally {
      setRsvpLoading(null)
    }
  }

  const handleCancelRSVP = async (meetId: string) => {
    if (!userInfo.email) {
      return
    }

    try {
      setRsvpLoading(meetId)

      const response = await fetch(`/api/meets/${meetId}/rsvp`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userEmail: userInfo.email }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to cancel RSVP")
      }

      const updatedMeet = await response.json()

      // Update the meet in the list
      setMeets((prevMeets) => prevMeets.map((meet) => (meet.id === meetId ? updatedMeet : meet)))

      console.log("✅ RSVP cancelled")
    } catch (error) {
      console.error("❌ Cancel RSVP error:", error)
      alert(error instanceof Error ? error.message : "Failed to cancel RSVP")
    } finally {
      setRsvpLoading(null)
    }
  }

  const isUserRSVPd = (meet: Meet) => {
    return meet.attendees.some((attendee) => attendee.userEmail === userInfo.email)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <UserNavigation currentPage="meets" />
        <div className="container mx-auto py-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3"></div>
            <span>Loading meets...</span>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <UserNavigation currentPage="meets" />
        <div className="container mx-auto py-8">
          <div className="text-center">
            <div className="text-red-600 mb-4">Error: {error}</div>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <UserNavigation currentPage="meets" />
      <div className="container mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Car & Truck Meets</h1>
            <p className="text-gray-600 mt-2">Find and join local automotive meetups</p>
            {userInfo.email && (
              <p className="text-sm text-blue-600 mt-1">
                Logged in as: {userInfo.name} ({userInfo.email})
              </p>
            )}
          </div>
          <Button onClick={handleCreateMeet} className="flex items-center">
            <Plus className="mr-2 h-4 w-4" />
            Create Meet
          </Button>
        </div>

        {meets.length === 0 ? (
          <div className="text-center py-12">
            <Car className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No meets yet</h3>
            <p className="text-gray-600 mb-4">Be the first to create a car or truck meet!</p>
            <Button onClick={handleCreateMeet}>Create First Meet</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {meets.map((meet) => (
              <Card key={meet.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-start justify-between">
                    <span className="text-lg">{meet.title}</span>
                    <div className="flex items-center text-sm text-gray-500">
                      {meet.vehicleTypes.includes("Cars") && <Car className="h-4 w-4 mr-1" />}
                      {meet.vehicleTypes.includes("Trucks") && <Truck className="h-4 w-4 mr-1" />}
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-gray-600 text-sm">{meet.description}</p>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center text-gray-700">
                      <Calendar className="mr-2 h-4 w-4" />
                      {new Date(meet.date).toLocaleDateString()}
                    </div>
                    <div className="flex items-center text-gray-700">
                      <Clock className="mr-2 h-4 w-4" />
                      {meet.time}
                    </div>
                    <div className="flex items-center text-gray-700">
                      <MapPin className="mr-2 h-4 w-4" />
                      {meet.location}
                    </div>
                    <div className="flex items-center text-gray-700">
                      <Users className="mr-2 h-4 w-4" />
                      {meet.attendees.length} attending
                      {meet.maxAttendees && ` (max ${meet.maxAttendees})`}
                    </div>
                  </div>

                  {meet.vehicleTypes.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {meet.vehicleTypes.map((type, index) => (
                        <span key={index} className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                          {type}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="pt-3 border-t">
                    {userInfo.email ? (
                      isUserRSVPd(meet) ? (
                        <Button
                          variant="outline"
                          onClick={() => handleCancelRSVP(meet.id)}
                          disabled={rsvpLoading === meet.id}
                          className="w-full"
                        >
                          {rsvpLoading === meet.id ? "Cancelling..." : "Cancel RSVP"}
                        </Button>
                      ) : (
                        <Button
                          onClick={() => handleRSVP(meet.id)}
                          disabled={rsvpLoading === meet.id}
                          className="w-full"
                        >
                          {rsvpLoading === meet.id ? "RSVP'ing..." : "RSVP"}
                        </Button>
                      )
                    ) : (
                      <Button variant="outline" onClick={() => router.push("/login")} className="w-full">
                        Login to RSVP
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
