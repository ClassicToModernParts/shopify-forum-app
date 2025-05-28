"use client"

import Link from "next/link"
import { Shield } from 'lucide-react'

export function AdminLink() {
  return (
    <Link
      href="/admin/login"
      className="fixed bottom-4 right-4 w-12 h-12 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center shadow-lg transition-colors z-50"
      title="Admin Login"
    >
      <Shield className="h-6 w-6" />
    </Link>
  )
}
