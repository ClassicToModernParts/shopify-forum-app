import Link from "next/link"
import { Users, Shield, Wrench, PenToolIcon as Tool } from "lucide-react"
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
              <Link
                href="/forum"
                className="px-4 sm:px-6 py-2 sm:py-2.5 btn-primary text-white rounded-xl hover:bg-blue-700 transition-all font-medium shadow-lg text-sm sm:text-base"
              >
                Enter Forum
              </Link>
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
              best solutions for your projects. Your expertise helps our community thrive.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4">
              <Link
                href="/forum"
                className="px-6 sm:px-8 py-3 sm:py-4 btn-primary text-white rounded-xl transition-all font-medium text-base sm:text-lg shadow-xl"
              >
                Join the Discussion
              </Link>
              <Link
                href="/forum?category=support"
                className="px-6 sm:px-8 py-3 sm:py-4 border-2 border-blue-600 text-blue-600 rounded-xl hover:bg-blue-50 transition-all font-medium text-base sm:text-lg shadow-lg bg-white/80 backdrop-blur-sm"
              >
                Get Technical Support
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-12 sm:py-20 bg-white/60 backdrop-blur-sm">
        <div className="container mx-auto px-4 sm:px-6">
          <h2 className="text-2xl sm:text-4xl font-bold text-center text-gray-900 mb-8 sm:mb-16">
            Why Join Our Community?
          </h2>
          <div className="grid gap-6 sm:gap-10 md:grid-cols-3">
            <div className="text-center p-6 sm:p-8 feature-card card-hover bg-white rounded-2xl shadow-lg">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 feature-icon shadow-lg">
                <Users className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
              </div>
              <h3 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4 text-gray-900">Connect with Experts</h3>
              <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
                Meet fellow CTM Parts customers, share installation experiences, and learn from seasoned professionals
                in our community.
              </p>
            </div>
            <div className="text-center p-6 sm:p-8 feature-card card-hover bg-white rounded-2xl shadow-lg">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 feature-icon shadow-lg">
                <Shield className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
              </div>
              <h3 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4 text-gray-900">Technical Support</h3>
              <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
                Get help with installations, troubleshooting, and product selection from our technical team and
                experienced users.
              </p>
            </div>
            <div className="text-center p-6 sm:p-8 feature-card card-hover bg-white rounded-2xl shadow-lg">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 feature-icon shadow-lg">
                <Wrench className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
              </div>
              <h3 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4 text-gray-900">Share Your Projects</h3>
              <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
                Showcase your builds, share tips and tricks, and inspire others with your CTM Parts projects and
                solutions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 sm:py-20 bg-gradient-to-r from-slate-50 to-blue-50">
        <div className="container mx-auto px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-900 mb-8 sm:mb-12">
            Community by the Numbers
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8">
            <div className="stat-card text-center card-hover">
              <div className="text-2xl sm:text-4xl font-bold text-blue-600 mb-2 sm:mb-3">847</div>
              <div className="text-gray-600 font-medium text-sm sm:text-base">Community Members</div>
            </div>
            <div className="stat-card text-center card-hover">
              <div className="text-2xl sm:text-4xl font-bold text-green-600 mb-2 sm:mb-3">312</div>
              <div className="text-gray-600 font-medium text-sm sm:text-base">Discussions</div>
            </div>
            <div className="stat-card text-center card-hover">
              <div className="text-2xl sm:text-4xl font-bold text-purple-600 mb-2 sm:mb-3">1,956</div>
              <div className="text-gray-600 font-medium text-sm sm:text-base">Helpful Replies</div>
            </div>
            <div className="stat-card text-center card-hover">
              <div className="text-2xl sm:text-4xl font-bold text-orange-600 mb-2 sm:mb-3">96%</div>
              <div className="text-gray-600 font-medium text-sm sm:text-base">Satisfaction Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 sm:py-24 bg-gradient-to-r from-blue-600 to-indigo-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="container mx-auto px-4 sm:px-6 text-center relative">
          <h2 className="text-2xl sm:text-4xl font-bold text-white mb-6 sm:mb-8">Ready to Get Started?</h2>
          <p className="text-lg sm:text-xl text-blue-100 mb-8 sm:mb-10 max-w-2xl mx-auto leading-relaxed">
            Join our community today and become part of something bigger. Share your expertise, learn from others, and
            build amazing projects together.
          </p>
          <Link
            href="/forum"
            className="inline-block px-8 sm:px-10 py-3 sm:py-4 bg-white text-blue-600 rounded-xl hover:bg-gray-50 transition-all font-medium text-base sm:text-lg shadow-xl hover:shadow-2xl hover:scale-105"
          >
            Enter Community Forum →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 sm:py-16">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid gap-8 sm:gap-10 md:grid-cols-4">
            <div>
              <div className="flex items-center space-x-3 mb-4 sm:mb-6">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                  <Tool className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
                <span className="font-bold text-base sm:text-lg">CTM Parts Community</span>
              </div>
              <p className="text-gray-400 leading-relaxed text-sm sm:text-base">
                Building connections, one project at a time.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4 sm:mb-6 text-base sm:text-lg">Community</h4>
              <ul className="space-y-2 sm:space-y-3 text-gray-400 text-sm sm:text-base">
                <li>
                  <Link href="/forum" className="hover:text-white transition-colors">
                    Forum
                  </Link>
                </li>
                <li>
                  <Link href="/forum?category=support" className="hover:text-white transition-colors">
                    Technical Support
                  </Link>
                </li>
                <li>
                  <Link href="/forum?category=projects" className="hover:text-white transition-colors">
                    Project Showcase
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 sm:mb-6 text-base sm:text-lg">Support</h4>
              <ul className="space-y-2 sm:space-y-3 text-gray-400 text-sm sm:text-base">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Installation Guides
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Contact Support
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Community Guidelines
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 sm:mb-6 text-base sm:text-lg">Connect</h4>
              <ul className="space-y-2 sm:space-y-3 text-gray-400 text-sm sm:text-base">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Newsletter
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Product Updates
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Technical Blog
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 sm:mt-12 pt-6 sm:pt-8 text-center text-gray-400 text-sm sm:text-base">
            <p>&copy; 2024 CTM Parts Community. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
