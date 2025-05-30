import Link from "next/link"
import { Users, Shield, Wrench, PenToolIcon as Tool } from "lucide-react"
import AdminNavigation from "@/components/AdminNavigation"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-slate-200/60 sticky top-0 z-40">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <Tool className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">CTM Parts Community</h1>
                <p className="text-sm text-gray-500">Connect • Share • Build</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <AdminNavigation />
              <Link
                href="/forum"
                className="px-6 py-2.5 btn-primary text-white rounded-xl hover:bg-blue-700 transition-all font-medium shadow-lg"
              >
                Enter Forum
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-indigo-600/5"></div>
        <div className="container mx-auto px-6 text-center relative">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-6xl font-bold text-gray-900 mb-8 leading-tight">
              Welcome to
              <span className="gradient-text block mt-2">CTM Parts Community</span>
            </h1>
            <p className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed">
              Connect with fellow CTM Parts customers, share installation tips, get technical support, and discover the
              best solutions for your projects. Your expertise helps our community thrive.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/forum"
                className="px-8 py-4 btn-primary text-white rounded-xl transition-all font-medium text-lg shadow-xl"
              >
                Join the Discussion
              </Link>
              <Link
                href="/forum?category=support"
                className="px-8 py-4 border-2 border-blue-600 text-blue-600 rounded-xl hover:bg-blue-50 transition-all font-medium text-lg shadow-lg bg-white/80 backdrop-blur-sm"
              >
                Get Technical Support
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-white/60 backdrop-blur-sm">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-16">Why Join Our Community?</h2>
          <div className="grid md:grid-cols-3 gap-10">
            <div className="text-center p-8 feature-card card-hover bg-white rounded-2xl shadow-lg">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 feature-icon shadow-lg">
                <Users className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-2xl font-semibold mb-4 text-gray-900">Connect with Experts</h3>
              <p className="text-gray-600 leading-relaxed">
                Meet fellow CTM Parts customers, share installation experiences, and learn from seasoned professionals
                in our community.
              </p>
            </div>
            <div className="text-center p-8 feature-card card-hover bg-white rounded-2xl shadow-lg">
              <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6 feature-icon shadow-lg">
                <Shield className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-2xl font-semibold mb-4 text-gray-900">Technical Support</h3>
              <p className="text-gray-600 leading-relaxed">
                Get help with installations, troubleshooting, and product selection from our technical team and
                experienced users.
              </p>
            </div>
            <div className="text-center p-8 feature-card card-hover bg-white rounded-2xl shadow-lg">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 feature-icon shadow-lg">
                <Wrench className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-2xl font-semibold mb-4 text-gray-900">Share Your Projects</h3>
              <p className="text-gray-600 leading-relaxed">
                Showcase your builds, share tips and tricks, and inspire others with your CTM Parts projects and
                solutions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20 bg-gradient-to-r from-slate-50 to-blue-50">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Community by the Numbers</h2>
          <div className="grid md:grid-cols-4 gap-8">
            <div className="stat-card text-center card-hover">
              <div className="text-4xl font-bold text-blue-600 mb-3">847</div>
              <div className="text-gray-600 font-medium">Community Members</div>
            </div>
            <div className="stat-card text-center card-hover">
              <div className="text-4xl font-bold text-green-600 mb-3">312</div>
              <div className="text-gray-600 font-medium">Discussions</div>
            </div>
            <div className="stat-card text-center card-hover">
              <div className="text-4xl font-bold text-purple-600 mb-3">1,956</div>
              <div className="text-gray-600 font-medium">Helpful Replies</div>
            </div>
            <div className="stat-card text-center card-hover">
              <div className="text-4xl font-bold text-orange-600 mb-3">96%</div>
              <div className="text-gray-600 font-medium">Satisfaction Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-gradient-to-r from-blue-600 to-indigo-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="container mx-auto px-6 text-center relative">
          <h2 className="text-4xl font-bold text-white mb-8">Ready to Get Started?</h2>
          <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto leading-relaxed">
            Join our community today and become part of something bigger. Share your expertise, learn from others, and
            build amazing projects together.
          </p>
          <Link
            href="/forum"
            className="inline-block px-10 py-4 bg-white text-blue-600 rounded-xl hover:bg-gray-50 transition-all font-medium text-lg shadow-xl hover:shadow-2xl hover:scale-105"
          >
            Enter Community Forum →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-10">
            <div>
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                  <Tool className="h-6 w-6 text-white" />
                </div>
                <span className="font-bold text-lg">CTM Parts Community</span>
              </div>
              <p className="text-gray-400 leading-relaxed">Building connections, one project at a time.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-6 text-lg">Community</h4>
              <ul className="space-y-3 text-gray-400">
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
              <h4 className="font-semibold mb-6 text-lg">Support</h4>
              <ul className="space-y-3 text-gray-400">
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
              <h4 className="font-semibold mb-6 text-lg">Connect</h4>
              <ul className="space-y-3 text-gray-400">
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
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2024 CTM Parts Community. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
