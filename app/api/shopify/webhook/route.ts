import { type NextRequest, NextResponse } from "next/server"
import crypto from "crypto"

const SHOPIFY_WEBHOOK_SECRET = process.env.SHOPIFY_WEBHOOK_SECRET

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const hmac = request.headers.get("x-shopify-hmac-sha256")

    // Verify webhook authenticity
    if (!verifyWebhook(body, hmac)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const data = JSON.parse(body)
    const topic = request.headers.get("x-shopify-topic")

    console.log("Received webhook:", topic, data)

    switch (topic) {
      case "app/uninstalled":
        // Handle app uninstallation
        await handleAppUninstall(data)
        break

      case "customers/create":
        // Sync new customer to forum
        await syncCustomerToForum(data)
        break

      case "orders/create":
        // Handle new order (maybe create forum post)
        await handleNewOrder(data)
        break

      default:
        console.log("Unhandled webhook topic:", topic)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Webhook error:", error)
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 })
  }
}

function verifyWebhook(body: string, hmac: string | null): boolean {
  if (!hmac || !SHOPIFY_WEBHOOK_SECRET) return false

  const calculatedHmac = crypto.createHmac("sha256", SHOPIFY_WEBHOOK_SECRET).update(body, "utf8").digest("base64")

  return crypto.timingSafeEqual(Buffer.from(calculatedHmac), Buffer.from(hmac))
}

async function handleAppUninstall(data: any) {
  // Clean up app data when uninstalled
  console.log("App uninstalled for shop:", data.domain)
  // TODO: Remove shop data from database
}

async function syncCustomerToForum(customer: any) {
  // Create forum user when new Shopify customer is created
  console.log("New customer:", customer.email)
  // TODO: Create forum user account
}

async function handleNewOrder(order: any) {
  // Maybe create a forum post for new orders or product reviews
  console.log("New order:", order.id)
  // TODO: Implement order-related forum functionality
}
