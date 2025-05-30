"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Star,
  Gift,
  Trophy,
  Coins,
  MessageSquare,
  Heart,
  Calendar,
  Award,
  ArrowLeft,
  RefreshCw,
  CheckCircle,
  AlertCircle,
} from "lucide-react"
import Link from "next/link"
import useUserAuth from "@/hooks/useUserAuth"

interface UserRewards {
  userId: string
  totalPoints: number
  dailyPoints: number
  lastDailyReset: string
  pointsHistory: {
    id: string
    points: number
    reason: string
    actionType: string
    createdAt: string
  }[]
  redeemedCoupons: {
    id: string
    couponId: string
    couponName: string
    pointsSpent: number
    redeemedAt: string
    couponCode: string
  }[]
}

interface RewardsSettings {
  pointsPerPost: number
  pointsPerReply: number
  pointsPerLike: number
  pointsPerReceivingLike: number
  dailyPointsLimit: number
  coupons: {
    id: string
    name: string
    pointsRequired: number
    discountAmount: number
    discountType: "fixed" | "percentage"
    isActive: boolean
  }[]
}

interface LeaderboardEntry {
  userId: string
  username: string
  name: string
  totalPoints: number
  rank: number
}

export default function RewardsPage() {
  const { user, isAuthenticated, isLoading } = useUserAuth()
  const [userRewards, setUserRewards] = useState<UserRewards | null>(null)
  const [rewardsSettings, setRewardsSettings] = useState<RewardsSettings | null>(null)
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      loadRewardsData()
    } else if (!isLoading && !isAuthenticated) {
      setLoading(false)
    }
  }, [isAuthenticated, isLoading, user])

  const loadRewardsData = async () => {
    setLoading(true)
    try {
      // Load user rewards
      if (user) {
        const userRewardsResponse = await fetch(`/api/admin/rewards?type=user-rewards&user_id=${user.id}`)
        if (userRewardsResponse.ok) {
          const userRewardsData = await userRewardsResponse.json()
          if (userRewardsData.success) {
            setUserRewards(userRewardsData.data)
          }
        }
      }

      // Load rewards settings
      const settingsResponse = await fetch("/api/admin/rewards?type=settings")
      if (settingsResponse.ok) {
        const settingsData = await settingsResponse.json()
        if (settingsData.success) {
          setRewardsSettings(settingsData.data)
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
      console.error("Error loading rewards data:", error)
    } finally {
      setLoading(false)
    }
  }

  const redeemCoupon = async (couponId: string) => {
    if (!user) return

    setActionLoading(couponId)
    try {
      const response = await fetch("/api/admin/rewards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "redeem-coupon",
          userId: user.id,
          couponType: couponId,
        }),
      })

      const data = await response.json()
      if (data.success) {
        setMessage({
          type: "success",
          text: `Coupon redeemed! Your code is: ${data.data.couponCode}`,
        })
        loadRewardsData() // Refresh data
        setTimeout(() => setMessage(null), 10000) // Show for 10 seconds
      } else {
        setMessage({ type: "error", text: data.error || "Failed to redeem coupon" })
        setTimeout(() => setMessage(null), 5000)
      }
    } catch (error) {
      setMessage({ type: "error", text: "Failed to redeem coupon" })
      setTimeout(() => setMessage(null), 5000)
    } finally {
      setActionLoading(null)
    }
  }

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    } catch (error) {
      return "Invalid date"
    }
  }

  const getActionIcon = (actionType: string) => {
    switch (actionType) {
      case "post_creation":
        return <MessageSquare className="h-4 w-4 text-blue-600" />
      case "reply_creation":
        return <MessageSquare className="h-4 w-4 text-green-600" />
      case "like_given":
      case "like_received":
        return <Heart className="h-4 w-4 text-red-600" />
      case "coupon_redemption":
        return <Gift className="h-4 w-4 text-purple-600" />
      default:
        return <Star className="h-4 w-4 text-gray-600" />
    }
  }

  const dailyProgress =
    userRewards && rewardsSettings ? (userRewards.dailyPoints / rewardsSettings.dailyPointsLimit) * 100 : 0

  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading rewards...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <Gift className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Login Required</h2>
            <p className="text-gray-600 mb-4">You need to be logged in to view your rewards.</p>
            <div className="space-y-2">
              <Link href="/login" className="block">
                <Button className="w-full">Login</Button>
              </Link>
              <Link href="/register" className="block">
                <Button variant="outline" className="w-full">
                  Sign Up
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-center py-4 gap-3 sm:gap-4">
            <div className="flex items-center space-x-4">
              <Link href="/forum" className="flex items-center space-x-2 text-gray-600 hover:text-gray-900">
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Forum</span>
              </Link>
              <div className="h-6 w-px bg-gray-300" />
              <div className="flex items-center space-x-3">
                <div className="bg-yellow-500 p-2 rounded-lg">
                  <Trophy className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Rewards Center</h1>
                  <p className="text-gray-600">Earn points and redeem rewards</p>
                </div>
              </div>
            </div>
            <Button variant="outline" onClick={loadRewardsData} disabled={loading}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Status Messages */}
        {message && (
          <Card
            className={`mb-6 border-l-4 ${
              message.type === "success" ? "border-green-500 bg-green-50" : "border-red-500 bg-red-50"
            }`}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                {message.type === "success" ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-red-600" />
                )}
                <p className={`text-sm ${message.type === "success" ? "text-green-800" : "text-red-800"}`}>
                  {message.text}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Points Overview */}
          <div className="lg:col-span-2 space-y-6">
            {/* Current Points */}
            <Card>
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="flex items-center gap-2">
                  <Coins className="h-5 w-5 text-yellow-600" />
                  Your Points
                </CardTitle>
                <CardDescription>Earn points by participating in the community</CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-3xl font-bold text-blue-600">{userRewards?.totalPoints || 0}</div>
                    <p className="text-sm text-blue-600">Total Points</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-3xl font-bold text-green-600">{userRewards?.dailyPoints || 0}</div>
                    <p className="text-sm text-green-600">Today's Points</p>
                  </div>
                </div>

                {rewardsSettings && (
                  <div className="mt-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span>Daily Progress</span>
                      <span>
                        {userRewards?.dailyPoints || 0} / {rewardsSettings.dailyPointsLimit}
                      </span>
                    </div>
                    <Progress value={dailyProgress} className="h-2" />
                    <p className="text-xs text-gray-500 mt-1">
                      {rewardsSettings.dailyPointsLimit - (userRewards?.dailyPoints || 0)} points remaining today
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* How to Earn Points */}
            {rewardsSettings && (
              <Card>
                <CardHeader className="p-4 sm:p-6">
                  <CardTitle className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-yellow-600" />
                    How to Earn Points
                  </CardTitle>
                  <CardDescription>Ways to earn points in the community</CardDescription>
                </CardHeader>
                <CardContent className="p-4 sm:p-6">
                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <MessageSquare className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="font-medium">Create a Post</p>
                        <p className="text-sm text-gray-600">{rewardsSettings.pointsPerPost} points</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <MessageSquare className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="font-medium">Reply to Post</p>
                        <p className="text-sm text-gray-600">{rewardsSettings.pointsPerReply} points</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <Heart className="h-5 w-5 text-red-600" />
                      <div>
                        <p className="font-medium">Like Content</p>
                        <p className="text-sm text-gray-600">{rewardsSettings.pointsPerLike} points</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <Heart className="h-5 w-5 text-pink-600" />
                      <div>
                        <p className="font-medium">Receive Likes</p>
                        <p className="text-sm text-gray-600">{rewardsSettings.pointsPerReceivingLike} points</p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      <strong>Daily Limit:</strong> You can earn up to {rewardsSettings.dailyPointsLimit} points per
                      day.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Recent Activity */}
            <Card>
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-blue-600" />
                  Recent Activity
                </CardTitle>
                <CardDescription>Your latest point-earning activities</CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                {userRewards?.pointsHistory && userRewards.pointsHistory.length > 0 ? (
                  <div className="space-y-3">
                    {userRewards.pointsHistory.slice(0, 10).map((activity) => (
                      <div key={activity.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          {getActionIcon(activity.actionType)}
                          <div>
                            <p className="font-medium">{activity.reason}</p>
                            <p className="text-sm text-gray-500">{formatDate(activity.createdAt)}</p>
                          </div>
                        </div>
                        <Badge variant={activity.points > 0 ? "default" : "secondary"}>
                          {activity.points > 0 ? "+" : ""}
                          {activity.points} pts
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Star className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No activity yet. Start participating to earn points!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Available Rewards */}
            <Card>
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="flex items-center gap-2">
                  <Gift className="h-5 w-5 text-purple-600" />
                  Available Rewards
                </CardTitle>
                <CardDescription>Redeem your points for coupons</CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                {rewardsSettings?.coupons && rewardsSettings.coupons.length > 0 ? (
                  <div className="space-y-4">
                    {rewardsSettings.coupons
                      .filter((coupon) => coupon.isActive)
                      .map((coupon) => {
                        const canRedeem = (userRewards?.totalPoints || 0) >= coupon.pointsRequired
                        return (
                          <div key={coupon.id} className="border rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                              <h3 className="font-medium">{coupon.name}</h3>
                              <Badge variant={canRedeem ? "default" : "secondary"}>{coupon.pointsRequired} pts</Badge>
                            </div>
                            <p className="text-sm text-gray-600 mb-3">
                              Save ${coupon.discountAmount} on your next order
                            </p>
                            <Button
                              size="sm"
                              className="w-full"
                              disabled={!canRedeem || actionLoading === coupon.id}
                              onClick={() => redeemCoupon(coupon.id)}
                            >
                              {actionLoading === coupon.id
                                ? "Redeeming..."
                                : canRedeem
                                  ? "Redeem"
                                  : "Not enough points"}
                            </Button>
                          </div>
                        )
                      })}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Gift className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No rewards available at the moment.</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Leaderboard */}
            <Card>
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-yellow-600" />
                  Leaderboard
                </CardTitle>
                <CardDescription>Top community contributors</CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                {leaderboard.length > 0 ? (
                  <div className="space-y-3">
                    {leaderboard.map((entry) => (
                      <div key={entry.userId} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                              entry.rank === 1
                                ? "bg-yellow-500 text-white"
                                : entry.rank === 2
                                  ? "bg-gray-400 text-white"
                                  : entry.rank === 3
                                    ? "bg-orange-500 text-white"
                                    : "bg-gray-200 text-gray-600"
                            }`}
                          >
                            {entry.rank}
                          </div>
                          <div>
                            <p className="font-medium">{entry.name}</p>
                            <p className="text-sm text-gray-500">@{entry.username}</p>
                          </div>
                        </div>
                        <Badge variant="outline">{entry.totalPoints} pts</Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No leaderboard data available.</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Redeemed Coupons */}
            {userRewards?.redeemedCoupons && userRewards.redeemedCoupons.length > 0 && (
              <Card>
                <CardHeader className="p-4 sm:p-6">
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-green-600" />
                    Your Coupons
                  </CardTitle>
                  <CardDescription>Recently redeemed coupons</CardDescription>
                </CardHeader>
                <CardContent className="p-4 sm:p-6">
                  <div className="space-y-3">
                    {userRewards.redeemedCoupons.slice(0, 5).map((coupon) => (
                      <div key={coupon.id} className="border rounded-lg p-3 bg-green-50">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-medium text-green-800">{coupon.couponName}</h4>
                          <Badge variant="outline" className="text-green-700">
                            {coupon.couponCode}
                          </Badge>
                        </div>
                        <p className="text-sm text-green-600">
                          Redeemed {formatDate(coupon.redeemedAt)} • {coupon.pointsSpent} points
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
