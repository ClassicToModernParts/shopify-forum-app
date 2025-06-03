import UserNavigation from "@/components/UserNavigation"
import { BackButton } from "@/components/BackButton"

const GroupDetailPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <UserNavigation currentPage="groups" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <BackButton href="/groups" label="Back to Groups" />
        </div>
        {/* existing content */}
      </div>
    </div>
  )
}

export default GroupDetailPage
