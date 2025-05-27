import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const shop = searchParams.get("shop")
  const accessToken = searchParams.get("access_token") // In real app, get from database

  if (!shop || !accessToken) {
    return NextResponse.json({ error: "Shop and access token required" }, { status: 400 })
  }

  try {
    // Fetch customers from Shopify
    const response = await fetch(`https://${shop}/admin/api/2023-10/customers.json`, {
      headers: {
        "X-Shopify-Access-Token": accessToken,
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error("Failed to fetch customers")
    }

    const data = await response.json()

    // Transform Shopify customers for forum use
    const forumUsers = data.customers.map((customer: any) => ({
      id: customer.id.toString(),
      email: customer.email,
      firstName: customer.first_name,
      lastName: customer.last_name,
      createdAt: customer.created_at,
      ordersCount: customer.orders_count,
      totalSpent: customer.total_spent,
    }))

    return NextResponse.json({
      success: true,
      data: forumUsers,
      message: "Customers synced successfully",
    })
  } catch (error) {
    console.error("Error fetching customers:", error)
    return NextResponse.json({ error: "Failed to fetch customers" }, { status: 500 })
  }
}
