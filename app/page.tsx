import Link from "next/link"

export default function HomePage() {
  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Shopify Forum API</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Community forum integration for Shopify stores
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="p-6 border rounded-lg hover:shadow-lg transition-shadow">
          <h3 className="text-lg font-semibold mb-2">Test API</h3>
          <p className="text-gray-600 mb-4">Test your forum API endpoints</p>
          <Link 
            href="/api-test" 
            className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Test API
          </Link>
        </div>

        <div className="p-6 border rounded-lg hover:shadow-lg transition-shadow">
          <h3 className="text-lg font-semibold mb-2">API Documentation</h3>
          <p className="text-gray-600 mb-4">View available endpoints</p>
          <div className="space-y-2 text-sm">
            <div className="font-mono bg-gray-100 p-2 rounded">
              GET /api/forum?type=categories&shop_id=demo
            </div>
            <div className="font-mono bg-gray-100 p-2 rounded">
              GET /api/forum?type=posts&shop_id=demo
            </div>
            <div className="font-mono bg-gray-100 p-2 rounded">
              POST /api/forum (create posts/replies)
            </div>
          </div>
        </div>
      </div>

      <div className="bg-green-50 border border-green-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-green-800 mb-2">✅ What's Working</h3>
        <ul className="text-green-700 space-y-1">
          <li>• Forum API endpoints</li>
          <li>• Categories and posts management</li>
          <li>• Shopify OAuth integration</li>
          <li>• Database-ready structure</li>
        </ul>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-800 mb-2">🚀 Next Steps</h3>
        <ol className="text-blue-700 space-y-1 list-decimal list-inside">
          <li>Deploy this working version to Vercel</li>
          <li>Add your Shopify app credentials</li>
          <li>Test the OAuth flow</li>
          <li>Add database integration</li>
          <li>Build the frontend interface</li>
        </ol>
      </div>
    </div>
  )
}
