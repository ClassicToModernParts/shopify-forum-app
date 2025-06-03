"use client"

import { useState, useEffect } from "react"
import { Calendar, MapPin, Users, Plus, Clock, Car, Truck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import UserNavigation from "@/components/UserNavigation"
import { useRouter } from "next/navigation"
import useAuth from "@/hooks/useAuth"

export default function Meets() {
  const [meets, setMeets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [rsvpMeetId, setRsvpMeetId] = useState(null)
  const [cancelRsvpMeetId, setCancelRsvpMeetId] = useState(null)

  const router = useRouter()
  const { isAdmin, loading: authLoading, token } = useAuth()
  const [userInfo, setUserInfo] = useState({ email: "", name: "" })

  useEffect(() => {
    const fetchMeets = async () => {
      try {
        const response = await fetch("/api/meets", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        })
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()
        setMeets(data)
      } catch (e) {
        setError(e)
      } finally {
        setLoading(false)
      }
    }

    fetchMeets()
  }, [token])

  useEffect(() => {
    if (rsvpMeetId) {
      handleRSVP(rsvpMeetId)
      setRsvpMeetId(null) // Reset after RSVP
    }
  }, [rsvpMeetId])

  useEffect(() => {
    if (cancelRsvpMeetId) {
      handleCancelRSVP(cancelRsvpMeetId)
      setCancelRsvpMeetId(null) // Reset after cancel RSVP
    }
  }, [cancelRsvpMeetId])

  // Get user info
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await fetch("/api/auth/user-info")
        const data = await response.json()

        if (data.success && data.user) {
          setUserInfo({
            email: data.user.email || "",
            name: data.user.name || data.user.username || "User",
          })
          console.log("✅ User info loaded:", data.user.email)
        } else {
          console.log("⚠️ No user info found")
        }
      } catch (error) {
        console.error("Error fetching user info:", error)
      }
    }

    if (!authLoading && token) {
      fetchUserInfo()
    }
  }, [authLoading, token])

  const handleCreateMeet = async () => {
    if (!userInfo.email) {
      // Check if we have a token but no user info yet
      if (token) {
        alert("Your user information is still loading. Please try again in a moment.")
        return
      }

      alert("Please log in to create a meet")
      router.push("/login")
      return
    }

    router.push("/meets/create")
  }

  const handleRSVP = async (meetId) => {
    if (!userInfo.email) {
      // Check if we have a token but no user info yet
      if (token) {
        alert("Your user information is still loading. Please try again in a moment.")
        return
      }

      alert("Please log in to create a meet")
      router.push("/login")
      return
    }

    try {
      const response = await fetch(`/api/meets/${meetId}/rsvp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userEmail: userInfo.email }),
      })

      if (!response.ok) {
        throw new Error(`Could not RSVP: ${response.status}`)
      }

      setMeets((prevMeets) =>
        prevMeets.map((meet) =>
          meet._id === meetId ? { ...meet, attendees: [...meet.attendees, userInfo.email] } : meet,
        ),
      )
    } catch (error) {
      console.error("RSVP error:", error)
      alert("Failed to RSVP. Please try again.")
    }
  }

  const handleCancelRSVP = async (meetId) => {
    if (!userInfo.email) {
      // Check if we have a token but no user info yet
      if (token) {
        alert("Your user information is still loading. Please try again in a moment.")
        return
      }

      alert("Please log in to create a meet")
      router.push("/login")
      return
    }

    try {
      const response = await fetch(`/api/meets/${meetId}/rsvp`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userEmail: userInfo.email }),
      })

      if (!response.ok) {
        throw new Error(`Could not cancel RSVP: ${response.status}`)
      }

      setMeets((prevMeets) =>
        prevMeets.map((meet) => ({
          ...meet,
          attendees: meet.attendees.filter((email) => email !== userInfo.email),
        })),
      )
    } catch (error) {
      console.error("Cancel RSVP error:", error)
      alert("Failed to cancel RSVP. Please try again.")
    }
  }

  if (loading || authLoading) {
    return <div>Loading meets...</div>
  }

  if (error) {
    return <div>Error: {error.message}</div>
  }

  return (
    <div className="container mx-auto py-8">
      <UserNavigation />
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Meets</h1>
          <p className="text-gray-600">Find local car and truck meets.</p>
          {userInfo.email && (
            <p className="text-sm text-blue-600 mt-1">
              Logged in as: {userInfo.name} ({userInfo.email})
            </p>
          )}
        </div>
        <Button onClick={handleCreateMeet}>
          <Plus className="mr-2 h-4 w-4" />
          Create Meet
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {meets.map((meet) => (
          <Card key={meet._id}>
            <CardHeader>
              <CardTitle>{meet.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-2">
                <MapPin className="mr-2 inline-block h-4 w-4" />
                {meet.location}
              </div>
              <div className="mb-2">
                <Calendar className="mr-2 inline-block h-4 w-4" />
                {new Date(meet.date).toLocaleDateString()}
              </div>
              <div className="mb-2">
                <Clock className="mr-2 inline-block h-4 w-4" />
                {meet.time}
              </div>
              <div className="mb-2">
                {meet.type === "car" ? (
                  <>
                    <Car className="mr-2 inline-block h-4 w-4" /> Car Meet
                  </>
                ) : (
                  <>
                    <Truck className="mr-2 inline-block h-4 w-4" /> Truck Meet
                  </>
                )}
              </div>
              <div>
                <Users className="mr-2 inline-block h-4 w-4" />
                Attendees: {meet.attendees.length}
              </div>
              <div className="mt-4 flex justify-between">
                {meet.attendees.includes(userInfo.email) ? (
                  <Button variant="destructive" onClick={() => setCancelRsvpMeetId(meet._id)}>
                    Cancel RSVP
                  </Button>
                ) : (
                  <Button onClick={() => setRsvpMeetId(meet._id)}>RSVP</Button>
                )}
                {isAdmin && (
                  <Button variant="secondary" onClick={() => router.push(`/meets/edit/${meet._id}`)}>
                    Edit
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
