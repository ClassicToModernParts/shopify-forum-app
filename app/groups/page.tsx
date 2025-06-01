"use client"

import { useState } from "react"
import { Users, Plus, Search, MapPin, Car } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import UserNavigation from "@/components/UserNavigation"

export default function GroupsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")

  // Mock groups data
  const groups = [
    {
      id: 1,
      name: "Ford Truck Enthusiasts",
      description: "A community for Ford truck owners and enthusiasts",
      members: 156,
      category: "trucks",
      location: "Nationwide",
      image: "/placeholder.svg?height=200&width=300&text=Ford+Trucks",
      isJoined: false,
    },
    {
      id: 2,
      name: "Classic Car Restoration",
      description: "Share tips, tricks, and progress on classic car restoration projects",
      members: 89,
      category: "classic",
      location: "Nationwide",
      image: "/placeholder.svg?height=200&width=300&text=Classic+Cars",
      isJoined: true,
    },
    {
      id: 3,
      name: "Off-Road Adventures",
      description: "Plan off-road trips and share your adventures",
      members: 234,
      category: "offroad",
      location: "Western US",
      image: "/placeholder.svg?height=200&width=300&text=Off+Road",
      isJoined: false,
    },
    {
      id: 4,
      name: "Diesel Performance",
      description: "Everything about diesel performance modifications",
      members: 178,
      category: "performance",
      location: "Nationwide",
      image: "/placeholder.svg?height=200&width=300&text=Diesel+Performance",
      isJoined: true,
    },
  ]

  const categories = [
    { id: "all", name: "All Groups" },
    { id: "trucks", name: "Trucks" },
    { id: "cars", name: "Cars" },
    { id: "classic", name: "Classic" },
    { id: "performance", name: "Performance" },
    { id: "offroad", name: "Off-Road" },
  ]

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
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Create Group
            </Button>
          </div>
        </div>

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGroups.map((group) => (
            <Card key={group.id} className="hover:shadow-lg transition-shadow">
              <div className="aspect-video bg-gray-200 rounded-t-lg overflow-hidden">
                <img src={group.image || "/placeholder.svg"} alt={group.name} className="w-full h-full object-cover" />
              </div>
              <CardHeader>
                <CardTitle className="text-lg">{group.name}</CardTitle>
                <p className="text-gray-600 text-sm">{group.description}</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>{group.members} members</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      <span>{group.location}</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {group.isJoined ? (
                      <Button variant="outline" className="flex-1">
                        Joined
                      </Button>
                    ) : (
                      <Button className="flex-1 bg-blue-600 hover:bg-blue-700">Join Group</Button>
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

        {filteredGroups.length === 0 && (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No groups found</h3>
            <p className="text-gray-600">Try adjusting your search or create a new group to get started.</p>
          </div>
        )}

        {/* My Groups Section */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">My Groups</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {groups
              .filter((group) => group.isJoined)
              .map((group) => (
                <Card key={group.id} className="border-blue-200 bg-blue-50">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Car className="h-5 w-5 text-blue-600" />
                      {group.name}
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
                      <Button variant="outline" size="sm">
                        Leave
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </div>
      </div>
    </div>
  )
}
