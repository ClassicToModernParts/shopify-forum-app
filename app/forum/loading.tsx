export default function ForumLoading() {
  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Forum</h1>
        <div className="animate-pulse bg-gray-200 h-10 w-32 rounded"></div>
      </div>

      <div className="grid gap-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="border rounded-lg p-4 animate-pulse">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-gray-200 h-10 w-10 rounded-full"></div>
              <div>
                <div className="bg-gray-200 h-4 w-32 rounded mb-2"></div>
                <div className="bg-gray-200 h-3 w-24 rounded"></div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="bg-gray-200 h-4 w-full rounded"></div>
              <div className="bg-gray-200 h-4 w-3/4 rounded"></div>
            </div>
            <div className="flex justify-between mt-4">
              <div className="bg-gray-200 h-6 w-20 rounded"></div>
              <div className="bg-gray-200 h-6 w-20 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
