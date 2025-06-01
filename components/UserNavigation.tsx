"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { MessageSquare, Trophy, Car, User, LogOut, Menu, X } from "lucide-react"
import useUserAuth from "@/hooks/useUserAuth"

export default function UserNavigation() {
  const { user, isAuthenticated, logout } = useUserAuth()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false)
  }

  return (
    <nav className="bg-white shadow-sm border-b">
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
          <div className="hidden md:flex items-center space-x-6">
            <Link
              href="/forum"
              className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors"
            >
              <MessageSquare className="h-4 w-4" />
              <span>Forum</span>
            </Link>
            <Link
              href="/meets"
              className="flex items-center space-x-2 text-gray-600 hover:text-green-600 transition-colors"
            >
              <Car className="h-4 w-4" />
              <span>Meets</span>
            </Link>
            <Link
              href="/rewards"
              className="flex items-center space-x-2 text-gray-600 hover:text-yellow-600 transition-colors"
            >
              <Trophy className="h-4 w-4" />
              <span>Rewards</span>
            </Link>
          </div>

          {/* Desktop User Menu */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated && user ? (
              <div className="flex items-center space-x-4">
                <Link
                  href="/profile"
                  className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors"
                >
                  <User className="h-4 w-4" />
                  <span>{user.name || user.email}</span>
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
          <div className="md:hidden">
            <Button variant="ghost" size="sm" onClick={toggleMobileMenu}>
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t bg-white">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <Link
                href="/forum"
                className="flex items-center space-x-3 px-3 py-2 rounded-md text-gray-600 hover:text-blue-600 hover:bg-gray-50"
                onClick={closeMobileMenu}
              >
                <MessageSquare className="h-5 w-5" />
                <span>Forum</span>
              </Link>
              <Link
                href="/meets"
                className="flex items-center space-x-3 px-3 py-2 rounded-md text-gray-600 hover:text-green-600 hover:bg-gray-50"
                onClick={closeMobileMenu}
              >
                <Car className="h-5 w-5" />
                <span>Meets</span>
              </Link>
              <Link
                href="/rewards"
                className="flex items-center space-x-3 px-3 py-2 rounded-md text-gray-600 hover:text-yellow-600 hover:bg-gray-50"
                onClick={closeMobileMenu}
              >
                <Trophy className="h-5 w-5" />
                <span>Rewards</span>
              </Link>

              {isAuthenticated && user ? (
                <>
                  <Link
                    href="/profile"
                    className="flex items-center space-x-3 px-3 py-2 rounded-md text-gray-600 hover:text-blue-600 hover:bg-gray-50"
                    onClick={closeMobileMenu}
                  >
                    <User className="h-5 w-5" />
                    <span>{user.name || user.email}</span>
                  </Link>
                  <button
                    onClick={() => {
                      logout()
                      closeMobileMenu()
                    }}
                    className="flex items-center space-x-3 px-3 py-2 rounded-md text-gray-600 hover:text-red-600 hover:bg-gray-50 w-full text-left"
                  >
                    <LogOut className="h-5 w-5" />
                    <span>Logout</span>
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
