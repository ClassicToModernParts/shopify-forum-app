import UserNavigation from "@/components/UserNavigation"

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <UserNavigation currentPage="settings" showBreadcrumb={true} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* existing content */}
        <div>Settings Page Content</div>
      </div>
    </div>
  )
}
