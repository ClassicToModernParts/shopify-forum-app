export default function AdminTestPage() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold text-green-600">✅ Admin Route Works!</h1>
        <p className="text-gray-600 mt-2">If you can see this, the admin routing is working.</p>
        <div className="mt-4 space-y-2">
          <a href="/admin" className="block text-blue-600 hover:underline">
            → Go to Main Admin Panel
          </a>
          <a href="/admin/login" className="block text-blue-600 hover:underline">
            → Go to Admin Login
          </a>
          <a href="/forum" className="block text-blue-600 hover:underline">
            → Go to Forum
          </a>
        </div>
      </div>
    </div>
  )
}
