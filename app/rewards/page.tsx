"use client"

import { useState, useEffect } from "react"
import { Award, Star, Gift, Trophy, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import UserNavigation from "@/components/UserNavigation"

export default function RewardsPage() {
  const [userInfo, setUserInfo] = useState({ email: "", name: "", username: "", id: "" })
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  const [userRewards, setUserRewards] = useState({
    points: 0,
    totalEarned: 0,
    redeemedCoupons: [],
    pointHistory: [],
  })
  const [leaderboard, setLeaderboard] = useState([])

  useEffect(() => {
    const checkAuth = async () => {
      try {
        setLoading(true)

        // Check for session cookie first
        const sessionCookie = document.cookie
          .split("; ")
          .find((row) => row.startsWith("session="))
          ?.split("=")[1]

        // Check for auth token in localStorage
        const authToken = localStorage.getItem("authToken")

        if (!sessionCookie && !authToken) {
          setIsAuthenticated(false)
          setLoading(false)
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
          setIsAuthenticated(true)
          setUserInfo({
            email: data.user.email || "",
            name: data.user.name || data.user.username || "User",
            username: data.user.username || "",
            id: data.user.id || "",
          })

          // Load user rewards
          loadUserRewards(data.user.id)
        } else {
          setIsAuthenticated(false)
        }
      } catch (error) {
        console.error("Auth check error:", error)
        setIsAuthenticated(false)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  const loadUserRewards = async (userId: string) => {
    try {
      // Load user rewards
      const rewardsResponse = await fetch(`/api/admin/rewards?type=user-rewards&user_id=${userId}`)
      if (rewardsResponse.ok) {
        const rewardsData = await rewardsResponse.json()
        if (rewardsData.success) {
          setUserRewards(rewardsData.data)
        }
      }

      // Load leaderboard
      const leaderboardResponse = await fetch("/api/admin/rewards?type=leaderboard&limit=10")
      if (leaderboardResponse.ok) {
        const leaderboardData = await leaderboardResponse.json()
        if (leaderboardData.success) {
          setLeaderboard(leaderboardData.data)
        }
      }
    } catch (error) {
      console.error("Error loading rewards:", error)
    }
  }

  const redeemCoupon = async (couponType: string) => {
    try {
      const response = await fetch("/api/admin/rewards", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "redeem-coupon",
          userId: userInfo.id,
          couponType,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setUserRewards(data.data)
        alert("Coupon redeemed successfully!")
      } else {
        alert(data.error || "Failed to redeem coupon")
      }
    } catch (error) {
      console.error("Error redeeming coupon:", error)
      alert("Failed to redeem coupon")
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <UserNavigation currentPage="rewards" showBreadcrumb={true} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading rewards...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50">
        <UserNavigation currentPage="rewards" showBreadcrumb={true} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <Award className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">Authentication Required</h2>
            <p className="text-gray-600 mb-4">Please log in to view your rewards.</p>
            <Button onClick={() => (window.location.href = "/login")}>Go to Login</Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <UserNavigation currentPage="rewards" showBreadcrumb={true} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Award className="h-8 w-8 text-yellow-600" />
            Rewards
          </h1>
          <p className="text-gray-600 mt-2">Earn points by participating in the community</p>
          <p className="text-sm text-green-600 mt-1">Welcome back, {userInfo.name}!</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* User Points */}
          <div className="lg:col-span-2 space-y-6">
            {/* Points Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-6 text-center">
                  <Star className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900">{userRewards.points}</div>
                  <div className="text-sm text-gray-600">Current Points</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <TrendingUp className="h-8 w-8 text-green-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900">{userRewards.totalEarned}</div>
                  <div className="text-sm text-gray-600">Total Earned</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <Gift className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900">{userRewards.redeemedCoupons?.length || 0}</div>
                  <div className="text-sm text-gray-600">Coupons Used</div>
                </CardContent>
              </Card>
            </div>

            {/* Available Coupons */}
            <Card>
              <CardHeader>
                <CardTitle>Available Rewards</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border rounded-lg p-4">
                    <h3 className="font-semibold">5% Off Coupon</h3>
                    <p className="text-sm text-gray-600 mb-2">Get 5% off your next purchase</p>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">100 points</span>
                      <Button size="sm" onClick={() => redeemCoupon("5off")} disabled={userRewards.points < 100}>
                        Redeem
                      </Button>
                    </div>
                  </div>
                  <div className="border rounded-lg p-4">
                    <h3 className="font-semibold">10% Off Coupon</h3>
                    <p className="text-sm text-gray-600 mb-2">Get 10% off your next purchase</p>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">200 points</span>
                      <Button size="sm" onClick={() => redeemCoupon("10off")} disabled={userRewards.points < 200}>
                        Redeem
                      </Button>
                    </div>
                  </div>
                  <div className="border rounded-lg p-4">
                    <h3 className="font-semibold">Free Shipping</h3>
                    <p className="text-sm text-gray-600 mb-2">Free shipping on your next order</p>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">150 points</span>
                      <Button
                        size="sm"
                        onClick={() => redeemCoupon("free-shipping")}
                        disabled={userRewards.points < 150}
                      >
                        Redeem
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* How to Earn Points */}
            <Card>
              <CardHeader>
                <CardTitle>How to Earn Points</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Create a forum post</span>
                    <span className="font-medium">+10 points</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Reply to a post</span>
                    <span className="font-medium">+5 points</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Receive a like on your post</span>
                    <span className="font-medium">+2 points</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Receive a like on your reply</span>
                    <span className="font-medium">+1 point</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Daily login</span>
                    <span className="font-medium">+1 point</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Leaderboard */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-yellow-500" />
                  Leaderboard
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {leaderboard.map((user, index) => (
                    <div key={user.userId} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                            index === 0
                              ? "bg-yellow-100 text-yellow-800"
                              : index === 1
                                ? "bg-gray-100 text-gray-800"
                                : index === 2
                                  ? "bg-orange-100 text-orange-800"
                                  : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {index + 1}
                        </div>
                        <div>
                          <div className="font-medium">{user.name}</div>
                          <div className="text-xs text-gray-500">@{user.username}</div>
                        </div>
                      </div>
                      <div className="text-sm font-medium">{user.totalEarned} pts</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
