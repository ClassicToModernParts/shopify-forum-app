"use client"

import { useState } from "react"
import { Users, Plus, Search, MapPin, Car } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import UserNavigation from "@/components/UserNavigation"

export default function GroupsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [groups, setGroups] = useState([])
  const [userGroups, setUserGroups] = useState([])
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newGroup, setNewGroup] = useState({
    name: "",
    description: "",
    category: "trucks",
    location: "",
    maxMembers: "",
    requirements: "",
  })

  const categories = [
    { id: "all", name: "All Groups" },
    { id: "trucks", name: "Trucks" },
    { id: "cars", name: "Cars" },
    { id: "classic", name: "Classic" },
    { id: "performance", name: "Performance" },
    { id: "offroad", name: "Off-Road" },
  ]

  const handleCreateGroup = async (e) => {
    e.preventDefault()

    if (!newGroup.name || !newGroup.description) {
      alert("Please fill in all required fields")
      return
    }

    const group = {
      id: Date.now(),
      name: newGroup.name,
      description: newGroup.description,
      members: 1, // Creator is first member
      category: newGroup.category,
      location: newGroup.location || "Not specified",
      maxMembers: newGroup.maxMembers ? Number.parseInt(newGroup.maxMembers) : null,
      requirements: newGroup.requirements,
      createdAt: new Date().toISOString(),
      isJoined: true, // Creator automatically joins
      creator: true,
    }

    // Add new group to the TOP of the list
    setGroups((prev) => [group, ...prev])
    setUserGroups((prev) => [group, ...prev])

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
  }

  const handleJoinGroup = (groupId) => {
    setGroups((prev) =>
      prev.map((group) => (group.id === groupId ? { ...group, members: group.members + 1, isJoined: true } : group)),
    )

    const groupToJoin = groups.find((g) => g.id === groupId)
    if (groupToJoin) {
      setUserGroups((prev) => [{ ...groupToJoin, isJoined: true }, ...prev])
    }
  }

  const handleLeaveGroup = (groupId) => {
    setGroups((prev) =>
      prev.map((group) =>
        group.id === groupId ? { ...group, members: Math.max(1, group.members - 1), isJoined: false } : group,
      ),
    )

    setUserGroups((prev) => prev.filter((group) => group.id !== groupId))
  }

  const filteredGroups = groups.filter((group) => {
    const matchesSearch =
      group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      group.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "all" || group.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <UserNavigation />

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
            </div>
            <Button onClick={() => setShowCreateForm(!showCreateForm)} className="bg-blue-600 hover:bg-blue-700">
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
                  <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                    Create Group
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
                    {group.creator && (
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
                          {group.members} member{group.members !== 1 ? "s" : ""}
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
                      {group.isJoined ? (
                        <Button
                          variant="outline"
                          className="flex-1"
                          onClick={() => handleLeaveGroup(group.id)}
                          disabled={group.creator}
                        >
                          {group.creator ? "Creator" : "Leave"}
                        </Button>
                      ) : (
                        <Button
                          className="flex-1 bg-blue-600 hover:bg-blue-700"
                          onClick={() => handleJoinGroup(group.id)}
                          disabled={group.maxMembers && group.members >= group.maxMembers}
                        >
                          {group.maxMembers && group.members >= group.maxMembers ? "Full" : "Join Group"}
                        </Button>
                      )}
                      <Button variant="outline" size="sm">
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
                      {group.creator && (
                        <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded-full ml-auto">Creator</span>
                      )}
                    </CardTitle>
                    <p className="text-gray-600 text-sm">{group.description}</p>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
                      <span>{group.members} members</span>
                      <span>{group.location}</span>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" className="flex-1">
                        View Group
                      </Button>
                      {!group.creator && (
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
