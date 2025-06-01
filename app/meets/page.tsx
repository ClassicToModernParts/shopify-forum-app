"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, MapPin, Users, Car, Plus, Trash2, UserCheck, UserX } from "lucide-react"
import Link from "next/link"
import useUserAuth from "@/hooks/useUserAuth"

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
  createdAt: string
  updatedAt: string
  status: "upcoming" | "ongoing" | "completed" | "cancelled"
  attendees: {
    userId: string
    userName: string
    userEmail: string
    rsvpDate: string
    vehicleInfo?: string
  }[]
  tags?: string[]
}

export default function MeetsPage() {
  const [meets, setMeets] = useState<Meet[]>([])
  const [selectedMeet, setSelectedMeet] = useState<Meet | null>(null)
  const [loading, setLoading] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showRsvpModal, setShowRsvpModal] = useState(false)
  const [newMeet, setNewMeet] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    location: "",
    address: "",
    vehicleTypes: "",
    maxAttendees: "",
    contactInfo: "",
    requirements: "",
    tags: "",
  })
  const [rsvpInfo, setRsvpInfo] = useState({
    vehicleInfo: "",
  })

  const { user, isAuthenticated } = useUserAuth()

  useEffect(() => {
    loadMeets()
  }, [])

  const loadMeets = async () => {
    try {
      console.log("🔍 Loading meets...")
      const response = await fetch("/api/meets?type=list&shop_id=demo")
      console.log("📡 Meets API response status:", response.status)

      if (!response.ok) {
        throw new Error(`Meets API failed: ${response.status}`)
      }

      const data = await response.json()
      console.log("📊 Meets API response:", data)

      if (data.success) {
        console.log("✅ Meets loaded successfully")
        const meetsArray = Array.isArray(data.data) ? data.data : []
        setMeets(meetsArray)
      } else {
        console.error("❌ Meets API returned error:", data.error)
        setMeets([])
        setError("Failed to load meets. Please try again later.")
      }
    } catch (error) {
      console.error("❌ Error loading meets:", error)
      setMeets([])
      setError("Failed to load meets. Please try again later.")
    } finally {
      setIsLoading(false)
    }
  }

  const requireAuth = (action: string) => {
    if (!isAuthenticated) {
      setError(`Please log in to ${action}. You need an account to interact with meets.`)
      return false
    }
    return true
  }

  const createMeet = async () => {
    if (!requireAuth("create meets")) return

    try {
      console.log("📝 Creating new meet:", newMeet)

      if (!newMeet.title || !newMeet.description || !newMeet.date || !newMeet.time || !newMeet.location) {
        setError("Please fill in all required fields")
        return
      }

      setLoading(true)
      const response = await fetch("/api/meets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "create_meet",
          shopId: "demo",
          ...newMeet,
          organizer: user?.name || user?.email || "Anonymous",
          organizerEmail: user?.email || "",
          vehicleTypes: newMeet.vehicleTypes
            .split(",")
            .map((type) => type.trim())
            .filter(Boolean),
        }),
      })

      if (!response.ok) {
        throw new Error(`Create meet API failed: ${response.status}`)
      }

      const data = await response.json()
      console.log("📊 Create meet API response:", data)

      if (data.success) {
        console.log("✅ Meet created successfully:", data.data)
        setNewMeet({
          title: "",
          description: "",
          date: "",
          time: "",
          location: "",
          address: "",
          vehicleTypes: "",
          maxAttendees: "",
          contactInfo: "",
          requirements: "",
          tags: "",
        })
        setShowCreateModal(false)
        loadMeets()
        setError(null)
      } else {
        console.error("❌ Create meet API returned error:", data)
        setError(data.error || "Failed to create meet. Please try again.")
      }
    } catch (error) {
      console.error("❌ Error creating meet:", error)
      setError("Failed to create meet. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const rsvpToMeet = async (meet: Meet) => {
    if (!requireAuth("RSVP to meets")) return

    try {
      console.log("✋ RSVP'ing to meet:", meet.id)
      setLoading(true)

      const response = await fetch("/api/meets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "rsvp_meet",
          shopId: "demo",
          meetId: meet.id,
          userId: user?.id,
          userName: user?.name || user?.email || "Anonymous",
          userEmail: user?.email || "",
          vehicleInfo: rsvpInfo.vehicleInfo,
        }),
      })

      if (!response.ok) {
        throw new Error(`RSVP API failed: ${response.status}`)
      }

      const data = await response.json()
      if (data.success) {
        console.log("✅ RSVP successful")
        setRsvpInfo({ vehicleInfo: "" })
        setShowRsvpModal(false)
        loadMeets()
        setError(null)
      } else {
        console.error("❌ RSVP API returned error:", data.error)
        setError(data.error || "Failed to RSVP. Please try again.")
      }
    } catch (error) {
      console.error("❌ Error RSVP'ing:", error)
      setError("Failed to RSVP. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const cancelRsvp = async (meetId: string) => {
    if (!requireAuth("cancel RSVP")) return

    try {
      console.log("❌ Cancelling RSVP for meet:", meetId)
      setLoading(true)

      const response = await fetch("/api/meets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "cancel_rsvp",
          shopId: "demo",
          meetId,
          userId: user?.id,
        }),
      })

      if (!response.ok) {
        throw new Error(`Cancel RSVP API failed: ${response.status}`)
      }

      const data = await response.json()
      if (data.success) {
        console.log("✅ RSVP cancelled successfully")
        loadMeets()
        setError(null)
      } else {
        console.error("❌ Cancel RSVP API returned error:", data.error)
        setError(data.error || "Failed to cancel RSVP.")
      }
    } catch (error) {
      console.error("❌ Error cancelling RSVP:", error)
      setError("Failed to cancel RSVP. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const deleteMeet = async (meetId: string) => {
    if (!requireAuth("delete meets")) return

    try {
      console.log("🗑️ Deleting meet:", meetId)
      const response = await fetch("/api/meets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "delete_meet",
          shopId: "demo",
          meetId,
          userEmail: user?.email || "",
        }),
      })

      if (!response.ok) {
        throw new Error(`Delete meet API failed: ${response.status}`)
      }

      const data = await response.json()
      if (data.success) {
        console.log("✅ Meet deleted successfully")
        if (selectedMeet?.id === meetId) {
          setSelectedMeet(null)
        }
        loadMeets()
        setError(null)
      } else {
        console.error("❌ Delete meet API returned error:", data.error)
        setError(data.error || "Failed to delete meet.")
      }
    } catch (error) {
      console.error("❌ Error deleting meet:", error)
      setError("Failed to delete meet. Please try again.")
    }
  }

  const canManageMeet = (meet: Meet) => {
    return isAuthenticated && user && (user.email === meet.organizerEmail || user.email === "admin@store.com")
  }

  const hasUserRsvpd = (meet: Meet) => {
    return user && meet.attendees.some((attendee) => attendee.userId === user.id)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(":")
    const date = new Date()
    date.setHours(Number.parseInt(hours), Number.parseInt(minutes))
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
  }

  const isMeetFull = (meet: Meet) => {
    return meet.maxAttendees && meet.attendees.length >= meet.maxAttendees
  }

  const handleNewMeetClick = () => {
    if (!requireAuth("create meets")) return

    if (user) {
      setNewMeet((prev) => ({
        ...prev,
        contactInfo: user.email || "",
      }))
    }
    setShowCreateModal(true)
  }

  const handleRsvpClick = (meet: Meet) => {
    setSelectedMeet(meet)
    setShowRsvpModal(true)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading meets...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-3 sm:py-4">
            <div className="flex items-center space-x-2 sm:space-x-4">
              <div className="bg-green-600 p-1.5 sm:p-2 rounded-lg">
                <Car className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">Car & Truck Meets</h1>
                <p className="text-xs sm:text-sm text-gray-600 hidden sm:block">Connect • Meet • Drive</p>
              </div>
            </div>

            <div className="flex items-center space-x-2 sm:space-x-4">
              {isAuthenticated ? (
                <Button onClick={handleNewMeetClick} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Meet
                </Button>
              ) : (
                <div className="flex items-center space-x-2">
                  <Link href="/login">
                    <Button variant="outline" size="sm">
                      Login
                    </Button>
                  </Link>
                  <Link href="/register">
                    <Button size="sm">Sign Up</Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
        {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">{error}</div>}

        {selectedMeet ? (
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 space-y-3 sm:space-y-0">
                <button
                  onClick={() => setSelectedMeet(null)}
                  className="text-blue-600 hover:text-blue-800 font-medium text-sm sm:text-base self-start"
                >
                  ← Back to Meets
                </button>
                <div className="flex items-center space-x-2">
                  {isAuthenticated && !hasUserRsvpd(selectedMeet) && !isMeetFull(selectedMeet) && (
                    <Button onClick={() => handleRsvpClick(selectedMeet)} size="sm" className="text-sm">
                      <UserCheck className="h-4 w-4 mr-2" />
                      RSVP
                    </Button>
                  )}
                  {isAuthenticated && hasUserRsvpd(selectedMeet) && (
                    <Button onClick={() => cancelRsvp(selectedMeet.id)} variant="outline" size="sm" className="text-sm">
                      <UserX className="h-4 w-4 mr-2" />
                      Cancel RSVP
                    </Button>
                  )}
                  {canManageMeet(selectedMeet) && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteMeet(selectedMeet.id)}
                      className="text-red-600 hover:text-red-800 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>

              <div className="mb-6">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">{selectedMeet.title}</h1>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="font-medium text-gray-900">{formatDate(selectedMeet.date)}</p>
                      <p className="text-sm text-gray-500">Date</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Clock className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="font-medium text-gray-900">{formatTime(selectedMeet.time)}</p>
                      <p className="text-sm text-gray-500">Time</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <MapPin className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="font-medium text-gray-900">{selectedMeet.location}</p>
                      {selectedMeet.address && <p className="text-sm text-gray-500">{selectedMeet.address}</p>}
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Users className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="font-medium text-gray-900">
                        {selectedMeet.attendees.length}
                        {selectedMeet.maxAttendees && ` / ${selectedMeet.maxAttendees}`} attending
                      </p>
                      <p className="text-sm text-gray-500">Attendees</p>
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-2">Description</h3>
                  <p className="text-gray-700 whitespace-pre-wrap">{selectedMeet.description}</p>
                </div>

                {selectedMeet.vehicleTypes.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-2">Vehicle Types</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedMeet.vehicleTypes.map((type, index) => (
                        <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                          {type}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {selectedMeet.requirements && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-2">Requirements</h3>
                    <p className="text-gray-700">{selectedMeet.requirements}</p>
                  </div>
                )}

                {selectedMeet.contactInfo && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-2">Contact</h3>
                    <p className="text-gray-700">{selectedMeet.contactInfo}</p>
                  </div>
                )}

                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-2">Organizer</h3>
                  <p className="text-gray-700">{selectedMeet.organizer}</p>
                </div>

                {selectedMeet.attendees.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Attendees ({selectedMeet.attendees.length})</h3>
                    <div className="space-y-3">
                      {selectedMeet.attendees.map((attendee, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-900">{attendee.userName}</p>
                            {attendee.vehicleInfo && <p className="text-sm text-gray-600">{attendee.vehicleInfo}</p>}
                          </div>
                          <p className="text-xs text-gray-500">
                            RSVP'd {new Date(attendee.rsvpDate).toLocaleDateString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold">Upcoming Meets</h2>
                  <p className="text-gray-600">Join local car and truck enthusiasts</p>
                </div>
                {isAuthenticated && (
                  <Button onClick={handleNewMeetClick}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Meet
                  </Button>
                )}
              </div>

              {meets.length > 0 ? (
                <div className="space-y-4">
                  {meets.map((meet) => (
                    <div
                      key={meet.id}
                      className="border rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => setSelectedMeet(meet)}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between space-y-3 sm:space-y-0">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="font-semibold text-gray-900 text-lg">{meet.title}</h3>
                            {isMeetFull(meet) && (
                              <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">Full</span>
                            )}
                            {hasUserRsvpd(meet) && (
                              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">RSVP'd</span>
                            )}
                          </div>

                          <p className="text-gray-600 text-sm mb-3 line-clamp-2">{meet.description}</p>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm text-gray-500">
                            <div className="flex items-center space-x-2">
                              <Calendar className="h-4 w-4" />
                              <span>{formatDate(meet.date)}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Clock className="h-4 w-4" />
                              <span>{formatTime(meet.time)}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <MapPin className="h-4 w-4" />
                              <span>{meet.location}</span>
                            </div>
                          </div>

                          {meet.vehicleTypes.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-3">
                              {meet.vehicleTypes.slice(0, 3).map((type, index) => (
                                <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                                  {type}
                                </span>
                              ))}
                              {meet.vehicleTypes.length > 3 && (
                                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                                  +{meet.vehicleTypes.length - 3} more
                                </span>
                              )}
                            </div>
                          )}
                        </div>

                        <div className="text-right sm:ml-4">
                          <div className="flex items-center space-x-4 text-sm text-gray-500 mb-2">
                            <span>
                              {meet.attendees.length}
                              {meet.maxAttendees && `/${meet.maxAttendees}`} attending
                            </span>
                          </div>
                          <p className="text-xs text-gray-500">By {meet.organizer}</p>
                          {canManageMeet(meet) && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                deleteMeet(meet.id)
                              }}
                              className="text-red-600 hover:text-red-800 p-1 mt-2"
                              title="Delete meet"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Car className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No meets scheduled yet</h3>
                  <p className="text-gray-600 mb-4">Be the first to organize a car or truck meet!</p>
                  {isAuthenticated ? (
                    <Button onClick={handleNewMeetClick}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create First Meet
                    </Button>
                  ) : (
                    <div className="space-x-2">
                      <Link href="/login">
                        <Button variant="outline">Login</Button>
                      </Link>
                      <Link href="/register">
                        <Button>Sign Up</Button>
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Create Meet Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-3 sm:p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <div className="p-4 sm:p-6">
                <h3 className="text-lg font-semibold mb-4">Create New Meet</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                    <input
                      type="text"
                      value={newMeet.title}
                      onChange={(e) => setNewMeet({ ...newMeet, title: e.target.value })}
                      className="w-full px-3 py-3 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base sm:text-sm"
                      placeholder="Monthly Truck Meet"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                    <textarea
                      value={newMeet.description}
                      onChange={(e) => setNewMeet({ ...newMeet, description: e.target.value })}
                      rows={4}
                      className="w-full px-3 py-3 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base sm:text-sm resize-none"
                      placeholder="Describe your meet..."
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
                      <input
                        type="date"
                        value={newMeet.date}
                        onChange={(e) => setNewMeet({ ...newMeet, date: e.target.value })}
                        className="w-full px-3 py-3 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base sm:text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Time *</label>
                      <input
                        type="time"
                        value={newMeet.time}
                        onChange={(e) => setNewMeet({ ...newMeet, time: e.target.value })}
                        className="w-full px-3 py-3 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base sm:text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Location *</label>
                    <input
                      type="text"
                      value={newMeet.location}
                      onChange={(e) => setNewMeet({ ...newMeet, location: e.target.value })}
                      className="w-full px-3 py-3 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base sm:text-sm"
                      placeholder="Downtown Parking Lot"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                    <input
                      type="text"
                      value={newMeet.address}
                      onChange={(e) => setNewMeet({ ...newMeet, address: e.target.value })}
                      className="w-full px-3 py-3 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base sm:text-sm"
                      placeholder="123 Main St, City, State"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Types</label>
                    <input
                      type="text"
                      value={newMeet.vehicleTypes}
                      onChange={(e) => setNewMeet({ ...newMeet, vehicleTypes: e.target.value })}
                      className="w-full px-3 py-3 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base sm:text-sm"
                      placeholder="Trucks, Cars, SUVs (comma-separated)"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Max Attendees</label>
                    <input
                      type="number"
                      value={newMeet.maxAttendees}
                      onChange={(e) => setNewMeet({ ...newMeet, maxAttendees: e.target.value })}
                      className="w-full px-3 py-3 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base sm:text-sm"
                      placeholder="50"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Contact Info</label>
                    <input
                      type="text"
                      value={newMeet.contactInfo}
                      onChange={(e) => setNewMeet({ ...newMeet, contactInfo: e.target.value })}
                      className="w-full px-3 py-3 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base sm:text-sm"
                      placeholder="your@email.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Requirements</label>
                    <textarea
                      value={newMeet.requirements}
                      onChange={(e) => setNewMeet({ ...newMeet, requirements: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-3 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base sm:text-sm resize-none"
                      placeholder="Valid driver's license required..."
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 mt-6">
                  <Button variant="outline" onClick={() => setShowCreateModal(false)} className="w-full sm:w-auto">
                    Cancel
                  </Button>
                  <Button onClick={createMeet} disabled={loading} className="w-full sm:w-auto">
                    {loading ? "Creating..." : "Create Meet"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* RSVP Modal */}
        {showRsvpModal && selectedMeet && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-3 sm:p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
              <div className="p-4 sm:p-6">
                <h3 className="text-lg font-semibold mb-4">RSVP to: {selectedMeet.title}</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Info (Optional)</label>
                    <input
                      type="text"
                      value={rsvpInfo.vehicleInfo}
                      onChange={(e) => setRsvpInfo({ ...rsvpInfo, vehicleInfo: e.target.value })}
                      className="w-full px-3 py-3 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base sm:text-sm"
                      placeholder="2022 Ford F-150"
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 mt-6">
                  <Button variant="outline" onClick={() => setShowRsvpModal(false)} className="w-full sm:w-auto">
                    Cancel
                  </Button>
                  <Button onClick={() => rsvpToMeet(selectedMeet)} disabled={loading} className="w-full sm:w-auto">
                    {loading ? "RSVP'ing..." : "Confirm RSVP"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
