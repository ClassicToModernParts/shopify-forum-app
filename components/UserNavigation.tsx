"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import useUserAuth from "@/hooks/useUserAuth"

export default function UserNavigation() {
  const { user, isAuthenticated, isLoading, logout } = useUserAuth()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  // Close the menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (!target.closest("#user-menu") && isMenuOpen) {
        setIsMenuOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isMenuOpen])

  if (isLoading) {
    return (
      <div className="animate-pulse flex space-x-2">
        <div className="rounded-full bg-gray-200 h-8 w-8"></div>
        <div className="h-8 bg-gray-200 rounded w-24"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center space-x-3">
        <Link
          href="/login"
          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
        >
          Sign In
        </Link>
        <Link
          href="/register"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          Register
        </Link>
      </div>
    )
  }

  return (
    <div className="relative" id="user-menu">
      <button
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className="flex items-center space-x-1 sm:space-x-2 text-gray-700 hover:text-gray-900 focus:outline-none"
      >
        <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-medium">
          {user.name.charAt(0).toUpperCase()}
        </div>
        <span className="font-medium text-sm sm:text-base">{user.name}</span>
        <svg
          className={`h-5 w-5 text-gray-400 transition-transform ${isMenuOpen ? "transform rotate-180" : ""}`}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {isMenuOpen && (
        <div className="absolute right-0 mt-1 sm:mt-2 w-40 sm:w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
          <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="user-menu">
            <Link href="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" role="menuitem">
              Your Profile
            </Link>
            <Link
              href="/forum?filter=my-posts"
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              role="menuitem"
            >
              My Posts
            </Link>
            <Link
              href="/profile?tab=settings"
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              role="menuitem"
            >
              Settings
            </Link>
            <button
              onClick={logout}
              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              role="menuitem"
            >
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
