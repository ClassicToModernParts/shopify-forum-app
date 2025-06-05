"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Calendar, MapPin, Clock, Car, Truck, Users, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import UserNavigation from "@/components/UserNavigation"

interface User {
  id: string
  username: string
  name?: string
  email: string
  role: "admin" | "user" | "moderator"
}

export default function CreateMeetContent() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    location: "",
    address: "",
    vehicleTypes: [] as string[],
    maxAttendees: "",
    contactInfo: "",
    requirements: "",
  })

  // Check authentication
  useEffect(() => {
    async function checkAuth() {
      try {
        const storedUser = localStorage.getItem("user")
        const storedToken = localStorage.getItem("authToken")

        if (storedUser && storedToken) {
          const parsedUser = JSON.parse(storedUser)
          setUser(parsedUser)
        } else {
          // Redirect to login with return URL
          router.push("/login?redirect=/meets/create")
          return
        }
      } catch (error) {
        console.error("Auth error:", error)
        router.push("/login?redirect=/meets/create")
      } finally {
        setAuthLoading(false)
      }
    }

    checkAuth()
  }, [router])

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    )
  }

  // Don't render if not authenticated
  if (!user) {
    return null
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleVehicleTypeChange = (type: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      vehicleTypes: checked ? [...prev.vehicleTypes, type] : prev.vehicleTypes.filter((t) => t !== type),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) {
      alert("Please log in to create a meet")
      router.push("/login?redirect=/meets/create")
      return
    }

    if (formData.vehicleTypes.length === 0) {
      alert("Please select at least one vehicle type")
      return
    }

    setLoading(true)

    try {
      const meetData = {
        ...formData,
        organizer: user.name || user.username,
        organizerEmail: user.email,
        organizerId: user.id,
        maxAttendees: formData.maxAttendees ? Number.parseInt(formData.maxAttendees) : undefined,
      }

      console.log("🔄 Creating meet:", meetData)

      // Get auth token for API call
      const authToken = localStorage.getItem("authToken")

      const response = await fetch("/api/meets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(meetData),
      })

      if (!response.ok) {
        if (response.status === 401) {
          alert("Your session has expired. Please log in again.")
          router.push("/login?redirect=/meets/create")
          return
        }

        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to create meet")
      }

      const newMeet = await response.json()
      console.log("✅ Meet created:", newMeet)

      alert("Meet created successfully!")
      router.push("/meets")
    } catch (error) {
      console.error("❌ Error creating meet:", error)
      alert(error instanceof Error ? error.message : "Failed to create meet")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <UserNavigation currentPage="meets" />
      <div className="container mx-auto py-4 px-4 sm:py-8">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center mb-6">
            <Button variant="ghost" onClick={() => router.push("/meets")} className="mr-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Meets
            </Button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Create New Meet</h1>
              <p className="text-gray-600 mt-1">Organize a car or truck meetup</p>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Meet Details</CardTitle>
              <p className="text-sm text-gray-600">
                Creating as: <span className="font-medium">{user.name || user.username}</span>
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Info */}
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title">Meet Title *</Label>
                    <Input
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      placeholder="e.g., Saturday Night Car Meet"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">Description *</Label>
                    <Textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="Describe your meet, what to expect, any special themes..."
                      rows={3}
                      required
                    />
                  </div>
                </div>

                {/* Date & Time */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="date">Date *</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="date"
                        name="date"
                        type="date"
                        value={formData.date}
                        onChange={handleInputChange}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="time">Time *</Label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="time"
                        name="time"
                        type="time"
                        value={formData.time}
                        onChange={handleInputChange}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Location */}
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="location">Location Name *</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="location"
                        name="location"
                        value={formData.location}
                        onChange={handleInputChange}
                        placeholder="e.g., Walmart Parking Lot, Downtown Plaza"
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="address">Full Address</Label>
                    <Input
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      placeholder="123 Main St, City, State 12345"
                    />
                  </div>
                </div>

                {/* Vehicle Types */}
                <div>
                  <Label className="text-base font-medium">Vehicle Types *</Label>
                  <p className="text-sm text-gray-600 mb-3">Select what types of vehicles are welcome</p>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="cars"
                        checked={formData.vehicleTypes.includes("Cars")}
                        onCheckedChange={(checked) => handleVehicleTypeChange("Cars", checked as boolean)}
                      />
                      <Label htmlFor="cars" className="flex items-center">
                        <Car className="h-4 w-4 mr-2" />
                        Cars
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="trucks"
                        checked={formData.vehicleTypes.includes("Trucks")}
                        onCheckedChange={(checked) => handleVehicleTypeChange("Trucks", checked as boolean)}
                      />
                      <Label htmlFor="trucks" className="flex items-center">
                        <Truck className="h-4 w-4 mr-2" />
                        Trucks
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="motorcycles"
                        checked={formData.vehicleTypes.includes("Motorcycles")}
                        onCheckedChange={(checked) => handleVehicleTypeChange("Motorcycles", checked as boolean)}
                      />
                      <Label htmlFor="motorcycles">Motorcycles</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="classics"
                        checked={formData.vehicleTypes.includes("Classic Cars")}
                        onCheckedChange={(checked) => handleVehicleTypeChange("Classic Cars", checked as boolean)}
                      />
                      <Label htmlFor="classics">Classic Cars</Label>
                    </div>
                  </div>
                </div>

                {/* Additional Details */}
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="maxAttendees">Max Attendees</Label>
                    <div className="relative">
                      <Users className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="maxAttendees"
                        name="maxAttendees"
                        type="number"
                        value={formData.maxAttendees}
                        onChange={handleInputChange}
                        placeholder="Leave empty for unlimited"
                        className="pl-10"
                        min="1"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="contactInfo">Contact Information</Label>
                    <Input
                      id="contactInfo"
                      name="contactInfo"
                      value={formData.contactInfo}
                      onChange={handleInputChange}
                      placeholder="Phone number, social media, etc."
                    />
                  </div>

                  <div>
                    <Label htmlFor="requirements">Requirements/Rules</Label>
                    <Textarea
                      id="requirements"
                      name="requirements"
                      value={formData.requirements}
                      onChange={handleInputChange}
                      placeholder="Any specific requirements, rules, or things to bring..."
                      rows={2}
                    />
                  </div>
                </div>

                {/* Submit */}
                <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-4 pt-6 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push("/meets")}
                    className="w-full sm:w-auto"
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={loading} className="w-full sm:w-auto">
                    {loading ? "Creating..." : "Create Meet"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
