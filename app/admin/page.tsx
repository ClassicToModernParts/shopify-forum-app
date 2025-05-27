export default function AdminPage() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">Admin Panel</h1>
      <p className="text-muted-foreground">Admin features coming soon!</p>
      <div className="mt-8 p-6 border rounded-lg">
        <h2 className="text-xl font-semibold mb-2">Quick Stats</h2>
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="p-4 bg-gray-100 rounded">
            <div className="text-2xl font-bold">127</div>
            <div className="text-sm text-gray-600">Total Posts</div>
          </div>
          <div className="p-4 bg-gray-100 rounded">
            <div className="text-2xl font-bold">45</div>
            <div className="text-sm text-gray-600">Total Users</div>
          </div>
        </div>
      </div>
    </div>
  )
}
