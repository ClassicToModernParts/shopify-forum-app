import Link from "next/link"
import { Shield, PenToolIcon as Tool, MessageSquare, Car, Trophy } from "lucide-react"
import AdminNavigation from "@/components/AdminNavigation"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-slate-200/60 sticky top-0 z-40">
        <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <Tool className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-gray-900">CTM Parts Community</h1>
                <p className="text-xs sm:text-sm text-gray-500">Connect • Share • Build</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <div className="hidden sm:block">
                <AdminNavigation />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-12 sm:py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-indigo-600/5"></div>
        <div className="container mx-auto px-4 sm:px-6 text-center relative">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl sm:text-6xl font-bold text-gray-900 mb-6 sm:mb-8 leading-tight">
              Welcome to
              <span className="gradient-text block mt-1 sm:mt-2">CTM Parts Community</span>
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 mb-8 sm:mb-10 max-w-3xl mx-auto leading-relaxed px-4">
              Connect with fellow CTM Parts customers, share installation tips, get technical support, and discover the
              best solutions for your projects.
            </p>
          </div>
        </div>
      </section>

      {/* Main Navigation Cards */}
      <section className="py-12 sm:py-20 bg-white/60 backdrop-blur-sm">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid gap-6 sm:gap-8 md:grid-cols-2 max-w-4xl mx-auto">
            {/* Forum Card */}
            <Link href="/forum" className="group">
              <div className="text-center p-6 sm:p-8 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-105 border border-gray-100">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-lg group-hover:shadow-xl transition-shadow">
                  <MessageSquare className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
                </div>
                <h3 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4 text-gray-900">Forum</h3>
                <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
                  Join discussions, ask questions, and share your knowledge with the community.
                </p>
              </div>
            </Link>

            {/* Car & Truck Meets Card */}
            <Link href="/meets" className="group">
              <div className="text-center p-6 sm:p-8 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-105 border border-gray-100">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-lg group-hover:shadow-xl transition-shadow">
                  <Car className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
                </div>
                <h3 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4 text-gray-900">Car & Truck Meets</h3>
                <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
                  Organize and join local car and truck meets with fellow enthusiasts.
                </p>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Secondary Features */}
      <section className="py-12 sm:py-20 bg-gradient-to-r from-slate-50 to-blue-50">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid gap-6 sm:gap-8 md:grid-cols-2 max-w-3xl mx-auto">
            {/* Rewards Card */}
            <Link href="/rewards" className="group">
              <div className="text-center p-6 sm:p-8 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-105 border border-gray-100">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:shadow-xl transition-shadow">
                  <Trophy className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3 text-gray-900">Rewards</h3>
                <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
                  Earn points and redeem rewards for participating in the community.
                </p>
              </div>
            </Link>

            {/* Profile Card */}
            <Link href="/profile" className="group">
              <div className="text-center p-6 sm:p-8 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-105 border border-gray-100">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:shadow-xl transition-shadow">
                  <Shield className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3 text-gray-900">Profile</h3>
                <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
                  Manage your profile, settings, and view your community activity.
                </p>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 sm:py-16">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-4 sm:mb-6">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                <Tool className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              <span className="font-bold text-base sm:text-lg">CTM Parts Community</span>
            </div>
            <p className="text-gray-400 leading-relaxed text-sm sm:text-base mb-6">
              Building connections, one project at a time.
            </p>
            <div className="border-t border-gray-800 pt-6 sm:pt-8 text-center text-gray-400 text-sm sm:text-base">
              <p>&copy; 2024 CTM Parts Community. All rights reserved.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
