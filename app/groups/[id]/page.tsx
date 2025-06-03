"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Users, MapPin, Calendar, MessageSquare, ArrowLeft, UserPlus, UserMinus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import UserNavigation from "@/components/UserNavigation"
import useUserAuth from "@/hooks/useUserAuth"

export default function GroupDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user, isAuthenticated } = useUserAuth()
  const [group, setGroup] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("about")

  useEffect(() => {
    // In a real app, this would fetch from an API
    // For now, we'll simulate loading group data
    const loadGroup = () => {
      // This would normally be an API call
      // For demo purposes, we'll create a mock group
      const mockGroup = {
        id: params.id,
        name: "Sample Group",
        description: "This is a sample group for demonstration purposes.",
        members: 1,
        category: "trucks",
        location: "Nationwide",
        requirements: "Must own a truck",
        createdAt: new Date().toISOString(),
        creator: "Group Creator",
        isJoined: false,
        membersList: [
          {
            id: 1,
            name: "Group Creator",
            joinedAt: new Date().toISOString(),
            role: "creator",
          },
        ],
        discussions: [],
        events: [],
      }

      setGroup(mockGroup)
      setLoading(false)
    }

    loadGroup()
  }, [params.id])

  const handleJoinGroup = () => {
    if (!isAuthenticated) {
      router.push("/login")
      return
    }

    setGroup((prev) => ({
      ...prev,
      isJoined: true,
      members: prev.members + 1,
      membersList: [
        ...prev.membersList,
        {
          id: Date.now(),
          name: user?.name || user?.email || "Anonymous",
          joinedAt: new Date().toISOString(),
          role: "member",
        },
      ],
    }))
  }

  const handleLeaveGroup = () => {
    setGroup((prev) => ({
      ...prev,
      isJoined: false,
      members: Math.max(1, prev.members - 1),
      membersList: prev.membersList.filter((member) => member.name !== (user?.name || user?.email)),
    }))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <UserNavigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <div className="h-64 bg-gray-200 rounded"></div>
              </div>
              <div className="h-96 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!group) {
    return (
      <div className="min-h-screen bg-gray-50">
        <UserNavigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Group Not Found</h1>
            <p className="text-gray-600 mb-6">The group you're looking for doesn't exist or has been removed.</p>
            <Button onClick={() => router.push("/groups")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Groups
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <UserNavigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" onClick={() => router.push("/groups")} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Groups
          </Button>

          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{group.name}</h1>
              <p className="text-gray-600 mb-4">{group.description}</p>

              <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span>{group.members} members</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span>{group.location}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>Created {new Date(group.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              {isAuthenticated ? (
                group.isJoined ? (
                  <Button variant="outline" onClick={handleLeaveGroup}>
                    <UserMinus className="h-4 w-4 mr-2" />
                    Leave Group
                  </Button>
                ) : (
                  <Button onClick={handleJoinGroup} className="bg-blue-600 hover:bg-blue-700">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Join Group
                  </Button>
                )
              ) : (
                <Button onClick={() => router.push("/login")} className="bg-blue-600 hover:bg-blue-700">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Login to Join
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="flex space-x-8">
            {[
              { id: "about", name: "About", icon: Users },
              { id: "members", name: "Members", icon: Users },
              { id: "discussions", name: "Discussions", icon: MessageSquare },
            ].map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.name}
                </button>
              )
            })}
          </nav>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {activeTab === "about" && (
              <Card>
                <CardHeader>
                  <CardTitle>About This Group</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Description</h4>
                    <p className="text-gray-600">{group.description}</p>
                  </div>

                  {group.requirements && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Requirements</h4>
                      <p className="text-gray-600">{group.requirements}</p>
                    </div>
                  )}

                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Category</h4>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 capitalize">
                      {group.category}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Location</h4>
                    <p className="text-gray-600">{group.location}</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === "members" && (
              <Card>
                <CardHeader>
                  <CardTitle>Members ({group.members})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {group.membersList.map((member) => (
                      <div key={member.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-medium">
                            {member.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{member.name}</p>
                            <p className="text-sm text-gray-500">
                              Joined {new Date(member.joinedAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        {member.role === "creator" && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">Creator</span>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === "discussions" && (
              <Card>
                <CardHeader>
                  <CardTitle>Discussions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No discussions yet</h3>
                    <p className="text-gray-600 mb-4">Be the first to start a discussion in this group!</p>
                    {group.isJoined && <Button className="bg-blue-600 hover:bg-blue-700">Start Discussion</Button>}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Group Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Members</span>
                  <span className="font-medium">{group.members}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Created</span>
                  <span className="font-medium">{new Date(group.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Category</span>
                  <span className="font-medium capitalize">{group.category}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Group Creator</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-medium">
                    {group.creator.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{group.creator}</p>
                    <p className="text-sm text-gray-500">Group Creator</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
