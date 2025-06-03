"use client"

import { useState, useEffect } from "react"
import { Users, Plus, Search, MapPin, Car } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import UserNavigation from "@/components/UserNavigation"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function GroupsPage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [groups, setGroups] = useState([])
  const [userGroups, setUserGroups] = useState([])
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const [authLoading, setAuthLoading] = useState(true)
  const [userInfo, setUserInfo] = useState({ email: "", name: "" })
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [newGroup, setNewGroup] = useState({
    name: "",
    description: "",
    category: "trucks",
    location: "",
    maxMembers: "",
    requirements: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const categories = [
    { id: "all", name: "All Groups" },
    { id: "trucks", name: "Trucks" },
    { id: "cars", name: "Cars" },
    { id: "classic", name: "Classic" },
    { id: "performance", name: "Performance" },
    { id: "offroad", name: "Off-Road" },
  ]

  // Check authentication and get user info
  useEffect(() => {
    const checkAuthAndLoadUser = async () => {
      try {
        setAuthLoading(true)

        // Check for session cookie first
        const sessionCookie = document.cookie
          .split("; ")
          .find((row) => row.startsWith("session="))
          ?.split("=")[1]

        // Check for auth token in localStorage
        const authToken = localStorage.getItem("authToken")

        console.log("🔐 Groups page auth check:", {
          sessionCookie: !!sessionCookie,
          authToken: !!authToken,
        })

        if (!sessionCookie && !authToken) {
          console.log("❌ No authentication found")
          setIsAuthenticated(false)
          setUserInfo({ email: "", name: "" })
          setAuthLoading(false)
          return
        }

        // Try to get user info
        const headers = {}
        if (authToken) {
          headers["Authorization"] = `Bearer ${authToken}`
        }

        const response = await fetch("/api/auth/user-info", {
          headers,
          credentials: "include",
        })

        const data = await response.json()

        if (data.success && data.user) {
          console.log("✅ User authenticated on groups page:", data.user.email)
          setIsAuthenticated(true)
          setUserInfo({
            email: data.user.email || "",
            name: data.user.name || data.user.username || "User",
          })
        } else {
          console.log("❌ Auth failed on groups page:", data.error)
          setIsAuthenticated(false)
          setUserInfo({ email: "", name: "" })

          // Clear invalid tokens
          if (authToken) {
            localStorage.removeItem("authToken")
          }
        }
      } catch (error) {
        console.error("Auth check error on groups page:", error)
        setIsAuthenticated(false)
        setUserInfo({ email: "", name: "" })
      } finally {
        setAuthLoading(false)
      }
    }

    checkAuthAndLoadUser()
  }, [])

  // Load groups from API
  useEffect(() => {
    if (!authLoading) {
      loadGroups()
    }
  }, [authLoading, userInfo.email])

  const loadGroups = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/groups")
      const data = await response.json()

      if (data.success) {
        setGroups(data.data || [])
        // Filter user's groups
        if (userInfo.email) {
          const userJoinedGroups = (data.data || []).filter((group) =>
            group.members?.some((member) => member.email === userInfo.email),
          )
          setUserGroups(userJoinedGroups)
        }
      }
    } catch (error) {
      console.error("Error loading groups:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateGroup = async (e) => {
    e.preventDefault()

    // Prevent double submission
    if (isSubmitting) return

    setIsSubmitting(true)

    if (!newGroup.name || !newGroup.description) {
      alert("Please fill in all required fields")
      setIsSubmitting(false)
      return
    }

    try {
      if (!isAuthenticated) {
        alert("You need to be logged in to create a group")
        router.push("/login")
        setIsSubmitting(false)
        return
      }

      if (!userInfo.email) {
        alert("Your user information is not available. Please log in again.")
        router.push("/login")
        setIsSubmitting(false)
        return
      }

      const authToken = localStorage.getItem("authToken")
      const headers = {
        "Content-Type": "application/json",
      }

      if (authToken) {
        headers["Authorization"] = `Bearer ${authToken}`
      }

      const response = await fetch("/api/groups", {
        method: "POST",
        headers,
        credentials: "include",
        body: JSON.stringify({
          type: "create_group",
          name: newGroup.name,
          description: newGroup.description,
          category: newGroup.category,
          location: newGroup.location || "Not specified",
          maxMembers: newGroup.maxMembers ? Number.parseInt(newGroup.maxMembers) : null,
          requirements: newGroup.requirements,
          creatorEmail: userInfo.email,
          creatorName: userInfo.name,
        }),
      })

      const data = await response.json()

      if (data.success) {
        // Reset form
        setNewGroup({
          name: "",
          description: "",
          category: "trucks",
          location: "",
          maxMembers: "",
          requirements: "",
        })
        setShowCreateForm(false)

        // Reload groups to get the updated list
        await loadGroups()

        alert("Group created successfully!")
      } else {
        alert(data.error || "Failed to create group")
      }
    } catch (error) {
      console.error("Error creating group:", error)
      alert("Failed to create group: " + (error.message || "Unknown error"))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleJoinGroup = async (groupId) => {
    try {
      if (!isAuthenticated) {
        alert("You need to be logged in to join a group")
        router.push("/login")
        return
      }

      if (!userInfo.email) {
        alert("Your user information is not available. Please log in again.")
        router.push("/login")
        return
      }

      const authToken = localStorage.getItem("authToken")
      const headers = {
        "Content-Type": "application/json",
      }

      if (authToken) {
        headers["Authorization"] = `Bearer ${authToken}`
      }

      const response = await fetch("/api/groups", {
        method: "POST",
        headers,
        credentials: "include",
        body: JSON.stringify({
          type: "join_group",
          groupId,
          userEmail: userInfo.email,
          userName: userInfo.name,
        }),
      })

      const data = await response.json()

      if (data.success) {
        await loadGroups()
        alert("Successfully joined the group!")
      } else {
        alert(data.error || "Failed to join group")
      }
    } catch (error) {
      console.error("Error joining group:", error)
      alert("Failed to join group")
    }
  }

  const handleLeaveGroup = async (groupId) => {
    try {
      if (!isAuthenticated) {
        alert("You need to be logged in to leave a group")
        router.push("/login")
        return
      }

      if (!userInfo.email) {
        alert("Your user information is not available. Please log in again.")
        router.push("/login")
        return
      }

      const authToken = localStorage.getItem("authToken")
      const headers = {
        "Content-Type": "application/json",
      }

      if (authToken) {
        headers["Authorization"] = `Bearer ${authToken}`
      }

      const response = await fetch("/api/groups", {
        method: "POST",
        headers,
        credentials: "include",
        body: JSON.stringify({
          type: "leave_group",
          groupId,
          userEmail: userInfo.email,
        }),
      })

      const data = await response.json()

      if (data.success) {
        await loadGroups()
        alert("Successfully left the group!")
      } else {
        alert(data.error || "Failed to leave group")
      }
    } catch (error) {
      console.error("Error leaving group:", error)
      alert("Failed to leave group")
    }
  }

  const handleViewGroup = (groupId) => {
    router.push(`/groups/${groupId}`)
  }

  const isUserInGroup = (group) => {
    return group.members?.some((member) => member.email === userInfo.email)
  }

  const isUserCreator = (group) => {
    return group.creatorEmail === userInfo.email
  }

  const filteredGroups = groups.filter((group) => {
    const matchesSearch =
      group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      group.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "all" || group.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <UserNavigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">{authLoading ? "Checking authentication..." : "Loading groups..."}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <UserNavigation currentPage="groups" showBreadcrumb={true} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Users className="h-8 w-8 text-blue-600" />
                Groups
              </h1>
              <p className="text-gray-600 mt-2">Join communities of like-minded automotive enthusiasts</p>
              {isAuthenticated && userInfo.email ? (
                <p className="text-sm text-green-600 mt-1">
                  ✅ Logged in as: {userInfo.name} ({userInfo.email})
                </p>
              ) : (
                <p className="text-sm text-red-600 mt-1">
                  <Link href="/login" className="underline">
                    Log in
                  </Link>{" "}
                  to create or join groups
                </p>
              )}
            </div>
            <Button
              onClick={() => {
                if (!isAuthenticated) {
                  alert("You need to be logged in to create a group")
                  router.push("/login")
                  return
                }
                setShowCreateForm(!showCreateForm)
              }}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Group
            </Button>
          </div>
        </div>

        {/* Create Group Form */}
        {showCreateForm && (
          <Card className="mb-8 border-blue-200">
            <CardHeader>
              <CardTitle>Create New Group</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateGroup} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Group Name *</label>
                    <input
                      type="text"
                      value={newGroup.name}
                      onChange={(e) => setNewGroup((prev) => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter group name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <select
                      value={newGroup.category}
                      onChange={(e) => setNewGroup((prev) => ({ ...prev, category: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {categories.slice(1).map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                  <textarea
                    value={newGroup.description}
                    onChange={(e) => setNewGroup((prev) => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                    placeholder="Describe your group"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                    <input
                      type="text"
                      value={newGroup.location}
                      onChange={(e) => setNewGroup((prev) => ({ ...prev, location: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="City, State or Region"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Max Members (optional)</label>
                    <input
                      type="number"
                      value={newGroup.maxMembers}
                      onChange={(e) => setNewGroup((prev) => ({ ...prev, maxMembers: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Leave blank for unlimited"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Requirements (optional)</label>
                  <input
                    type="text"
                    value={newGroup.requirements}
                    onChange={(e) => setNewGroup((prev) => ({ ...prev, requirements: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Any requirements to join"
                  />
                </div>

                <div className="flex gap-3">
                  <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={isSubmitting}>
                    {isSubmitting ? "Creating..." : "Create Group"}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setShowCreateForm(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search groups..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === category.id
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-300"
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* Groups Grid */}
        {filteredGroups.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {filteredGroups.map((group) => (
              <Card key={group.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center justify-between">
                    <span>{group.name}</span>
                    {isUserCreator(group) && (
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">Creator</span>
                    )}
                  </CardTitle>
                  <p className="text-gray-600 text-sm">{group.description}</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <span>
                          {group.members?.length || 0} member{(group.members?.length || 0) !== 1 ? "s" : ""}
                          {group.maxMembers && ` / ${group.maxMembers}`}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        <span>{group.location}</span>
                      </div>
                    </div>

                    {group.requirements && (
                      <p className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                        <strong>Requirements:</strong> {group.requirements}
                      </p>
                    )}

                    <div className="flex gap-2">
                      {isUserInGroup(group) ? (
                        <Button
                          variant="outline"
                          className="flex-1"
                          onClick={() => handleLeaveGroup(group.id)}
                          disabled={isUserCreator(group)}
                        >
                          {isUserCreator(group) ? "Creator" : "Leave"}
                        </Button>
                      ) : (
                        <Button
                          className="flex-1 bg-blue-600 hover:bg-blue-700"
                          onClick={() => handleJoinGroup(group.id)}
                          disabled={group.maxMembers && (group.members?.length || 0) >= group.maxMembers}
                        >
                          {group.maxMembers && (group.members?.length || 0) >= group.maxMembers ? "Full" : "Join Group"}
                        </Button>
                      )}
                      <Button variant="outline" size="sm" onClick={() => handleViewGroup(group.id)}>
                        View
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 mb-12">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm || selectedCategory !== "all" ? "No groups found" : "No groups yet"}
            </h3>
            <p className="text-gray-600">
              {searchTerm || selectedCategory !== "all"
                ? "Try adjusting your search or create a new group to get started."
                : "Be the first to create a group for your automotive community!"}
            </p>
          </div>
        )}

        {/* My Groups Section */}
        {userGroups.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">My Groups</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userGroups.map((group) => (
                <Card key={group.id} className="border-blue-200 bg-blue-50">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Car className="h-5 w-5 text-blue-600" />
                      {group.name}
                      {isUserCreator(group) && (
                        <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded-full ml-auto">Creator</span>
                      )}
                    </CardTitle>
                    <p className="text-gray-600 text-sm">{group.description}</p>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
                      <span>{group.members?.length || 0} members</span>
                      <span>{group.location}</span>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" className="flex-1" onClick={() => handleViewGroup(group.id)}>
                        View Group
                      </Button>
                      {!isUserCreator(group) && (
                        <Button variant="outline" size="sm" onClick={() => handleLeaveGroup(group.id)}>
                          Leave
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
