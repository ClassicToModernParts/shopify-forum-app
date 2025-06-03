import { Search, Filter, Plus, RefreshCw, Car } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Post } from "@/components/post"
import UserNavigation from "@/components/UserNavigation"

const posts = [
  {
    id: 1,
    title: "Looking for advice on engine swaps",
    author: "john.doe",
    date: "2023-10-26",
    replies: 12,
    views: 123,
  },
  {
    id: 2,
    title: "Best aftermarket exhaust systems?",
    author: "jane.smith",
    date: "2023-10-25",
    replies: 5,
    views: 78,
  },
  {
    id: 3,
    title: "Tips for restoring a classic car",
    author: "peter.jones",
    date: "2023-10-24",
    replies: 20,
    views: 256,
  },
]

export default function ForumPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <UserNavigation currentPage="forum" showBreadcrumb={true} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="font-semibold text-lg">Forum</h1>
            <Button size="sm" variant="outline">
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Post
          </Button>
        </div>
        <Separator className="my-4" />
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Input placeholder="Search posts..." size="sm" className="max-w-sm" />
            <Button variant="outline" size="sm">
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Newest</DropdownMenuItem>
                <DropdownMenuItem>Popular</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Unread</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Link href="/meets">
              <Button variant="outline" size="sm" className="hidden sm:flex items-center">
                <Car className="h-4 w-4 mr-2" />
                Car & Truck Meets
              </Button>
            </Link>
          </div>
        </div>
        <div className="mt-4 space-y-4">
          {posts.map((post) => (
            <Post
              key={post.id}
              title={post.title}
              author={post.author}
              date={post.date}
              replies={post.replies}
              views={post.views}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
