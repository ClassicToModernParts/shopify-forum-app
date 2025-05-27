export default function AnalyticsPage() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">Forum Analytics</h1>
      <p className="text-muted-foreground">Analytics dashboard coming soon!</p>
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        <div className="p-6 border rounded-lg">
          <h3 className="font-semibold">Total Views</h3>
          <div className="text-2xl font-bold mt-2">12,543</div>
        </div>
        <div className="p-6 border rounded-lg">
          <h3 className="font-semibold">Active Users</h3>
          <div className="text-2xl font-bold mt-2">45</div>
        </div>
        <div className="p-6 border rounded-lg">
          <h3 className="font-semibold">Engagement Rate</h3>
          <div className="text-2xl font-bold mt-2">68%</div>
        </div>
      </div>
    </div>
  )
}
