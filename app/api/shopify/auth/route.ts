import { type NextRequest, NextResponse } from "next/server"
import crypto from "crypto"

// Shopify app credentials (add these to your environment variables)
const SHOPIFY_API_KEY = process.env.SHOPIFY_API_KEY
const SHOPIFY_API_SECRET = process.env.SHOPIFY_API_SECRET
const SHOPIFY_SCOPES = "read_products,read_customers,write_script_tags"
const APP_URL = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const shop = searchParams.get("shop")
  const code = searchParams.get("code")
  const hmac = searchParams.get("hmac")
  const state = searchParams.get("state")

  if (!shop) {
    return NextResponse.json({ error: "Shop parameter is required" }, { status: 400 })
  }

  // If no code, redirect to Shopify OAuth
  if (!code) {
    const nonce = crypto.randomBytes(16).toString("hex")
    const installUrl =
      `https://${shop}/admin/oauth/authorize?` +
      `client_id=${SHOPIFY_API_KEY}&` +
      `scope=${SHOPIFY_SCOPES}&` +
      `redirect_uri=${APP_URL}/api/shopify/auth&` +
      `state=${nonce}`

    return NextResponse.redirect(installUrl)
  }

  // Verify the request
  if (!verifyShopifyWebhook(searchParams.toString(), hmac)) {
    return NextResponse.json({ error: "Invalid request" }, { status: 401 })
  }

  try {
    // Exchange code for access token
    const tokenResponse = await fetch(`https://${shop}/admin/oauth/access_token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        client_id: SHOPIFY_API_KEY,
        client_secret: SHOPIFY_API_SECRET,
        code,
      }),
    })

    const tokenData = await tokenResponse.json()

    if (!tokenResponse.ok) {
      throw new Error(tokenData.error || "Failed to get access token")
    }

    // Store the access token (in a real app, save to database)
    console.log("Access token received for shop:", shop)
    console.log("Token:", tokenData.access_token)

    // Redirect to the app's main page
    return NextResponse.redirect(`${APP_URL}/shopify/dashboard?shop=${shop}`)
  } catch (error) {
    console.error("OAuth error:", error)
    return NextResponse.json({ error: "Authentication failed" }, { status: 500 })
  }
}

function verifyShopifyWebhook(queryString: string, hmac: string | null): boolean {
  if (!hmac || !SHOPIFY_API_SECRET) return false

  const params = new URLSearchParams(queryString)
  params.delete("hmac")
  params.delete("signature")

  const sortedParams = Array.from(params.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join("&")

  const calculatedHmac = crypto.createHmac("sha256", SHOPIFY_API_SECRET).update(sortedParams).digest("hex")

  return crypto.timingSafeEqual(Buffer.from(calculatedHmac), Buffer.from(hmac))
}
