"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Home, MessageSquare, Calendar, Award, Settings, LogOut, Menu, X, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

interface UserNavigationProps {
  currentPage?: string
  showBreadcrumb?: boolean
}

export default function UserNavigation({ currentPage, showBreadcrumb = false }: UserNavigationProps) {
  const router = useRouter()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userName, setUserName] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        setLoading(true)

        // Check for auth token in localStorage
        const authToken = localStorage.getItem("authToken")
        const storedUserName = localStorage.getItem("userName")
        const storedUserEmail = localStorage.getItem("userEmail")

        console.log("🔐 Navigation auth check:", {
          authToken: !!authToken,
          storedUserName: !!storedUserName,
          storedUserEmail: !!storedUserEmail,
        })

        // If we have stored user info, use it immediately
        if (storedUserName && authToken) {
          setIsAuthenticated(true)
          setUserName(storedUserName)
        } else {
          setIsAuthenticated(false)
          setUserName("")
        }

        // If we have a token, verify with the server
        if (authToken) {
          const headers = {
            Authorization: `Bearer ${authToken}`,
          }

          const response = await fetch("/api/auth/user-info", {
            headers,
            credentials: "include",
          })

          const data = await response.json()

          if (data.success && data.user) {
            console.log("✅ User authenticated in navigation:", data.user.email)
            setIsAuthenticated(true)
            setUserName(data.user.name || data.user.username || "User")

            // Update localStorage with latest info
            localStorage.setItem("userEmail", data.user.email)
            localStorage.setItem("userName", data.user.name || data.user.username)
            localStorage.setItem("user", JSON.stringify(data.user))
          } else {
            console.log("❌ Auth failed in navigation:", data.error)
            setIsAuthenticated(false)
            setUserName("")

            // Clear invalid tokens
            if (authToken) {
              localStorage.removeItem("authToken")
              localStorage.removeItem("userEmail")
              localStorage.removeItem("userName")
              localStorage.removeItem("user")
            }
          }
        }
      } catch (error) {
        console.error("Auth check error in navigation:", error)
        setIsAuthenticated(false)
        setUserName("")
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  const handleLogout = async () => {
    try {
      // Call logout API
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      })

      // Clear local storage
      localStorage.removeItem("authToken")
      localStorage.removeItem("userEmail")
      localStorage.removeItem("userName")
      localStorage.removeItem("user")

      // Update state
      setIsAuthenticated(false)
      setUserName("")

      // Close menu if open
      setIsMenuOpen(false)

      // Redirect to home
      router.push("/")
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  const navItems = [
    { name: "Home", href: "/", icon: Home, active: currentPage === "home" },
    { name: "Forum", href: "/forum", icon: MessageSquare, active: currentPage === "forum" },
    { name: "Meets", href: "/meets", icon: Calendar, active: currentPage === "meets" },
    { name: "Rewards", href: "/rewards", icon: Award, active: currentPage === "rewards" },
    { name: "Settings", href: "/settings", icon: Settings, active: currentPage === "settings" },
  ]

  return (
    <div className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="flex items-center">
                <div className="bg-blue-600 p-1 rounded">
                  <MessageSquare className="h-6 w-6 text-white" />
                </div>
                <span className="ml-2 text-xl font-bold text-gray-900">CTM Community</span>
              </Link>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  item.active ? "bg-blue-100 text-blue-700" : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                <div className="flex items-center space-x-1">
                  <item.icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </div>
              </Link>
            ))}

            {loading ? (
              <div className="animate-pulse bg-gray-200 h-8 w-20 rounded"></div>
            ) : isAuthenticated ? (
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-600">Hi, {userName}</span>
                <Button variant="outline" size="sm" onClick={handleLogout} className="flex items-center">
                  <LogOut className="h-4 w-4 mr-1" />
                  Logout
                </Button>
              </div>
            ) : (
              <Link href="/login">
                <Button size="sm">Login</Button>
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
            >
              <span className="sr-only">{isMenuOpen ? "Close menu" : "Open menu"}</span>
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="pt-2 pb-3 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  item.active ? "bg-blue-100 text-blue-700" : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                <div className="flex items-center space-x-3">
                  <item.icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </div>
              </Link>
            ))}

            {loading ? (
              <div className="animate-pulse bg-gray-200 h-10 mx-3 rounded"></div>
            ) : isAuthenticated ? (
              <div className="px-3 py-2">
                <div className="text-sm text-gray-600 mb-2">Signed in as {userName}</div>
                <Button variant="outline" size="sm" onClick={handleLogout} className="flex items-center w-full">
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </div>
            ) : (
              <Link href="/login" className="block px-3 py-2" onClick={() => setIsMenuOpen(false)}>
                <Button size="sm" className="w-full">
                  Login
                </Button>
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Breadcrumb */}
      {showBreadcrumb && currentPage && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
          <div className="flex items-center text-sm text-gray-500">
            <Link href="/" className="hover:text-gray-700">
              Home
            </Link>
            <ChevronRight className="h-4 w-4 mx-1" />
            <span className="font-medium text-gray-900 capitalize">{currentPage}</span>
          </div>
        </div>
      )}
    </div>
  )
}
