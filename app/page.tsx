import Link from "next/link"
import { MessageSquare, Users, Zap, Shield } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <MessageSquare className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Community Hub</h1>
                <p className="text-sm text-gray-500">Connect • Share • Grow</p>
              </div>
            </div>
            <Link
              href="/forum"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Enter Forum
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20">
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Welcome to Our
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
              {" "}
              Community
            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Join thousands of customers sharing experiences, getting support, and building connections. Your voice
            matters in our growing community.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/forum"
              className="px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-lg"
            >
              Join the Discussion
            </Link>
            <Link
              href="/forum?category=support"
              className="px-8 py-4 border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium text-lg"
            >
              Get Support
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Why Join Our Community?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Connect with Others</h3>
              <p className="text-gray-600">
                Meet fellow customers, share experiences, and build lasting connections in our vibrant community.
              </p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Get Expert Support</h3>
              <p className="text-gray-600">
                Access help from our team and experienced community members whenever you need assistance.
              </p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Share Your Ideas</h3>
              <p className="text-gray-600">
                Suggest features, share feedback, and help shape the future of our products and services.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-blue-600 mb-2">1,200+</div>
              <div className="text-gray-600">Community Members</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-600 mb-2">450+</div>
              <div className="text-gray-600">Discussions</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-600 mb-2">2,800+</div>
              <div className="text-gray-600">Helpful Replies</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-orange-600 mb-2">98%</div>
              <div className="text-gray-600">Satisfaction Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-600">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">Ready to Get Started?</h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join our community today and become part of something bigger. Your journey starts with a single post.
          </p>
          <Link
            href="/forum"
            className="px-8 py-4 bg-white text-blue-600 rounded-lg hover:bg-gray-100 transition-colors font-medium text-lg"
          >
            Enter Community Forum →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <MessageSquare className="h-5 w-5 text-white" />
                </div>
                <span className="font-bold">Community Hub</span>
              </div>
              <p className="text-gray-400">Building connections, one conversation at a time.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Community</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/forum" className="hover:text-white">
                    Forum
                  </Link>
                </li>
                <li>
                  <Link href="/forum?category=support" className="hover:text-white">
                    Support
                  </Link>
                </li>
                <li>
                  <Link href="/forum?category=features" className="hover:text-white">
                    Feature Requests
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white">
                    Help Center
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Contact Us
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Guidelines
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Connect</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white">
                    Twitter
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    LinkedIn
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Newsletter
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Community Hub. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
