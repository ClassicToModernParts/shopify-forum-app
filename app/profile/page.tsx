import UserNavigation from "@/components/UserNavigation"

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <UserNavigation currentPage="profile" showBreadcrumb={true} />
      <div className="container mx-auto py-10">
        <h1 className="text-3xl font-semibold mb-5">Profile</h1>
        {/* Profile content goes here */}
        <p>This is the profile page.</p>
      </div>
    </div>
  )
}
