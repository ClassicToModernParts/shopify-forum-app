import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CreditCard, Package, Shield } from "lucide-react"
import Link from "next/link"

const DashboardPage = () => {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-semibold mb-6">Admin Dashboard</h1>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Order Management */}
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">Order Management</h3>
                <p className="text-sm text-gray-600">View and manage orders</p>
              </div>
              <Link href="/admin/orders">
                <Button variant="outline" size="sm">
                  Manage
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Payment Management */}
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <CreditCard className="h-6 w-6 text-green-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">Payment Management</h3>
                <p className="text-sm text-gray-600">Review transactions and payouts</p>
              </div>
              <Link href="/admin/payments">
                <Button variant="outline" size="sm">
                  Manage
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Password Management */}
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-red-100 rounded-lg">
                <Shield className="h-6 w-6 text-red-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">Password Management</h3>
                <p className="text-sm text-gray-600">Reset user passwords</p>
              </div>
              <Link href="/admin/reset-password">
                <Button variant="outline" size="sm">
                  Manage
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default DashboardPage
