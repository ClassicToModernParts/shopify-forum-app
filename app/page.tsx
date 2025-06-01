import Link from "next/link"
import { Button } from "@/components/ui/button"
import { MessageSquare, Users, Settings, Car } from "lucide-react"

export default function Home() {
  return (
    <div className="container mx-auto py-12">
      <section className="text-center mb-16">
        <h1 className="text-4xl font-bold mb-4">Connect with Your Community</h1>
        <p className="text-gray-600 text-lg">Discover and engage with local groups, events, and discussions.</p>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
          <div className="bg-blue-100 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
            <MessageSquare className="h-6 w-6 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Forums</h3>
          <p className="text-gray-600 mb-4">Join discussions, ask questions, and share your knowledge.</p>
          <Link href="/forums">
            <Button variant="outline" className="w-full">
              Explore Forums
            </Button>
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
          <div className="bg-purple-100 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
            <Users className="h-6 w-6 text-purple-600" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Groups</h3>
          <p className="text-gray-600 mb-4">Find or create groups based on your interests and hobbies.</p>
          <Link href="/groups">
            <Button variant="outline" className="w-full">
              Discover Groups
            </Button>
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
          <div className="bg-green-100 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
            <Car className="h-6 w-6 text-green-600" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Car & Truck Meets</h3>
          <p className="text-gray-600 mb-4">Organize and join local car and truck meets with fellow enthusiasts.</p>
          <Link href="/meets">
            <Button variant="outline" className="w-full">
              Browse Meets
            </Button>
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
          <div className="bg-yellow-100 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
            <Settings className="h-6 w-6 text-yellow-600" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Settings</h3>
          <p className="text-gray-600 mb-4">Customize your profile and manage your preferences.</p>
          <Link href="/settings">
            <Button variant="outline" className="w-full">
              Update Settings
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}
