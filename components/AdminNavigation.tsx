"use client"

import Link from "next/link"
import { Shield, LogOut } from 'lucide-react'
import { useAuth } from "@/hooks/useAuth"
import { useRouter } from "next/navigation"

interface AdminNavigationProps {
  variant?: "button" | "link"
  className?: string
}

export function AdminNavigation({ variant = "button", className = "" }: AdminNavigationProps) {
  const { isAdmin, logout } = useAuth()
  const router = useRouter()

  const handleLogout = () => {
    logout()
    router.push("/admin/login")
  }

  if (!isAdmin) {
    return (
      <Link
        href="/admin/login"
        className={`flex items-center space-x-2 px-3 py-2 border border-red-600 text-red-600 rounded-lg hover:bg-red-50 transition-colors ${className}`}
      >
        <Shield className="h-4 w-4" />
        <span>Admin</span>
      </Link>
    )
  }

  if (variant === "link") {
    return (
      <div className="flex items-center space-x-2">
        <Link
          href="/admin/dashboard"
          className={`flex items-center space-x-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors ${className}`}
        >
          <Shield className="h-4 w-4" />
          <span>Admin Dashboard</span>
        </Link>
        <button
          onClick={handleLogout}
          className="flex items-center space-x-1 px-2 py-2 text-gray-600 hover:text-gray-900 transition-colors"
          title="Logout"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    )
  }

  return (
    <Link
      href="/admin/dashboard"
      className={`flex items-center space-x-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors ${className}`}
    >
      <Shield className="h-4 w-4" />
      <span>Admin Dashboard</span>
    </Link>
  )
}

export default AdminNavigation
