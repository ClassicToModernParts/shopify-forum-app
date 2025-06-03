import UserNavigation from "@/components/UserNavigation"

export default function RewardsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <UserNavigation currentPage="rewards" showBreadcrumb={true} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* existing content */}
        <div>Rewards Page Content</div>
      </div>
    </div>
  )
}
