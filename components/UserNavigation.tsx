"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { MessageSquare, Trophy, Car, User, LogOut, Menu, X, Users, Home, ChevronRight } from "lucide-react"

interface UserNavigationProps {
  currentPage?: string
  showBreadcrumb?: boolean
}

export default function UserNavigation({ currentPage, showBreadcrumb = false }: UserNavigationProps) {
  const [user, setUser] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Check authentication status
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

        console.log("🔐 Auth check:", {
          sessionCookie: !!sessionCookie,
          authToken: !!authToken,
        })

        if (!sessionCookie && !authToken) {
          console.log("❌ No authentication found")
          setIsAuthenticated(false)
          setUser(null)
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
          console.log("✅ User authenticated:", data.user.email)
          setIsAuthenticated(true)
          setUser(data.user)
        } else {
          console.log("❌ Auth failed:", data.error)
          setIsAuthenticated(false)
          setUser(null)

          // Clear invalid tokens
          if (authToken) {
            localStorage.removeItem("authToken")
          }
        }
      } catch (error) {
        console.error("Auth check error:", error)
        setIsAuthenticated(false)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  const logout = async () => {
    try {
      // Clear local storage
      localStorage.removeItem("authToken")
      localStorage.removeItem("userEmail")
      localStorage.removeItem("userName")

      // Clear session cookie
      document.cookie = "session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"

      // Call logout API
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      })

      // Update state
      setIsAuthenticated(false)
      setUser(null)

      // Redirect to home
      window.location.href = "/"
    } catch (error) {
      console.error("Logout error:", error)
      // Force redirect even if API call fails
      window.location.href = "/"
    }
  }

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false)
  }

  const navigationItems = [
    { href: "/", label: "Home", icon: Home, color: "text-gray-600 hover:text-blue-600" },
    { href: "/forum", label: "Forum", icon: MessageSquare, color: "text-gray-600 hover:text-blue-600" },
    { href: "/meets", label: "Meets", icon: Car, color: "text-gray-600 hover:text-green-600" },
    { href: "/groups", label: "Groups", icon: Users, color: "text-gray-600 hover:text-purple-600" },
    { href: "/rewards", label: "Rewards", icon: Trophy, color: "text-gray-600 hover:text-yellow-600" },
  ]

  return (
    <nav className="bg-white shadow-sm border-b sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-3 sm:py-4">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 sm:space-x-3">
            <div className="bg-blue-600 p-1.5 sm:p-2 rounded-lg">
              <MessageSquare className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            </div>
            <span className="text-lg sm:text-xl font-bold text-gray-900">CTM Community</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navigationItems.map((item) => {
              const Icon = item.icon
              const isActive = currentPage === item.label.toLowerCase()
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                    isActive ? "bg-blue-100 text-blue-700 font-medium" : item.color
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              )
            })}
          </div>

          {/* Desktop User Menu */}
          <div className="hidden md:flex items-center space-x-4">
            {loading ? (
              <div className="flex items-center space-x-2 text-gray-500">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span className="text-sm">Loading...</span>
              </div>
            ) : isAuthenticated && user ? (
              <div className="flex items-center space-x-4">
                <Link
                  href="/profile"
                  className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors px-3 py-2 rounded-lg hover:bg-gray-50"
                >
                  <User className="h-4 w-4" />
                  <span>{user.name || user.username || user.email}</span>
                </Link>
                <Button variant="outline" size="sm" onClick={logout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </div>
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

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-2">
            {/* Mobile Login Status Indicator */}
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            ) : isAuthenticated && user ? (
              <div className="flex items-center space-x-1 text-green-600 bg-green-50 px-2 py-1 rounded-full">
                <User className="h-3 w-3" />
                <span className="text-xs font-medium">{user.name?.split(" ")[0] || user.username || "User"}</span>
              </div>
            ) : (
              <div className="flex items-center space-x-1 text-gray-500 bg-gray-50 px-2 py-1 rounded-full">
                <span className="text-xs">Not logged in</span>
              </div>
            )}

            <Button variant="ghost" size="sm" onClick={toggleMobileMenu}>
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Breadcrumb */}
        {showBreadcrumb && currentPage && (
          <div className="pb-3 border-t border-gray-100 pt-3">
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Link href="/" className="hover:text-blue-600 transition-colors">
                Home
              </Link>
              <ChevronRight className="h-4 w-4" />
              <span className="text-gray-900 font-medium capitalize">{currentPage}</span>
            </div>
          </div>
        )}

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t bg-white">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {/* Mobile Login Status */}
              {loading ? (
                <div className="flex items-center space-x-3 px-3 py-3 text-gray-500">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  <span>Checking login status...</span>
                </div>
              ) : isAuthenticated && user ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-2">
                  <div className="flex items-center space-x-2 text-green-700">
                    <User className="h-4 w-4" />
                    <span className="font-medium">Logged in as:</span>
                  </div>
                  <p className="text-sm text-green-600 mt-1">{user.name || user.username || user.email}</p>
                </div>
              ) : (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-2">
                  <div className="flex items-center space-x-2 text-gray-600">
                    <User className="h-4 w-4" />
                    <span className="font-medium">Not logged in</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">Log in to access all features</p>
                </div>
              )}

              {navigationItems.map((item) => {
                const Icon = item.icon
                const isActive = currentPage === item.label.toLowerCase()
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center space-x-3 px-3 py-3 rounded-md transition-colors ${
                      isActive ? "bg-blue-100 text-blue-700 font-medium" : "text-gray-600 hover:bg-gray-50"
                    }`}
                    onClick={closeMobileMenu}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                )
              })}

              {isAuthenticated && user ? (
                <>
                  <Link
                    href="/profile"
                    className="flex items-center space-x-3 px-3 py-3 rounded-md text-gray-600 hover:text-blue-600 hover:bg-gray-50"
                    onClick={closeMobileMenu}
                  >
                    <User className="h-5 w-5" />
                    <span className="font-medium">Profile</span>
                  </Link>
                  <button
                    onClick={() => {
                      logout()
                      closeMobileMenu()
                    }}
                    className="flex items-center space-x-3 px-3 py-3 rounded-md text-gray-600 hover:text-red-600 hover:bg-gray-50 w-full text-left"
                  >
                    <LogOut className="h-5 w-5" />
                    <span className="font-medium">Logout</span>
                  </button>
                </>
              ) : (
                <div className="px-3 py-2 space-y-2">
                  <Link href="/login" onClick={closeMobileMenu}>
                    <Button variant="outline" size="sm" className="w-full">
                      Login
                    </Button>
                  </Link>
                  <Link href="/register" onClick={closeMobileMenu}>
                    <Button size="sm" className="w-full">
                      Sign Up
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
