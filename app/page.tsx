import Link from "next/link"

export default function HomePage() {
  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Shopify Forum API</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Community forum integration for Shopify stores - Full forum now available!
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="p-6 border rounded-lg hover:shadow-lg transition-shadow bg-white">
          <h3 className="text-lg font-semibold mb-2">🏛️ Community Forum</h3>
          <p className="text-gray-600 mb-4">Browse discussions, view categories, and see posts with full API integration</p>
          <Link 
            href="/forum" 
            className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Enter Forum →
          </Link>
        </div>

        <div className="p-6 border rounded-lg hover:shadow-lg transition-shadow bg-white">
          <h3 className="text-lg font-semibold mb-2">🧪 Test API</h3>
          <p className="text-gray-600 mb-4">Test your forum API endpoints</p>
          <Link 
            href="/api-test" 
            className="inline-block px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
          >
            Test API →
          </Link>
        </div>

        <div className="p-6 border rounded-lg hover:shadow-lg transition-shadow bg-white">
          <h3 className="text-lg font-semibold mb-2">🔗 Shopify OAuth</h3>
          <p className="text-gray-600 mb-4">Test Shopify integration</p>
          <Link 
            href="/api/shopify/auth?shop=demo-store.myshopify.com" 
            className="inline-block px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
          >
            Test OAuth →
          </Link>
        </div>

        <div className="p-6 border rounded-lg hover:shadow-lg transition-shadow bg-white">
          <h3 className="text-lg font-semibold mb-2">📚 API Documentation</h3>
          <p className="text-gray-600 mb-4">Available endpoints:</p>
          <div className="space-y-2 text-sm">
            <div className="font-mono bg-gray-100 p-2 rounded text-xs">
              GET /api/forum?type=categories&shop_id=demo
            </div>
            <div className="font-mono bg-gray-100 p-2 rounded text-xs">
              GET /api/forum?type=posts&shop_id=demo
            </div>
          </div>
        </div>
      </div>

      <div className="bg-green-50 border border-green-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-green-800 mb-2">✅ Working Features</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <ul className="text-green-700 space-y-1">
            <li>• Full forum interface with categories</li>
            <li>• Posts with likes, views, and replies</li>
            <li>• Real-time API data loading</li>
            <li>• Responsive design</li>
          </ul>
          <ul className="text-green-700 space-y-1">
            <li>• Shopify OAuth integration</li>
            <li>• Webhook handling</li>
            <li>• Customer sync ready</li>
            <li>• Production deployment</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
