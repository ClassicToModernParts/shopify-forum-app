import { type NextRequest, NextResponse } from "next/server"
import crypto from "crypto"

const SHOPIFY_API_KEY = process.env.SHOPIFY_API_KEY
const SHOPIFY_API_SECRET = process.env.SHOPIFY_API_SECRET
const SHOPIFY_SCOPES = "read_products,read_customers,write_script_tags"
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const shop = searchParams.get("shop")
  const code = searchParams.get("code")

  if (!shop) {
    return NextResponse.json({ error: "Shop parameter is required" }, { status: 400 })
  }

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

  return NextResponse.redirect(`${APP_URL}/shopify/dashboard?shop=${shop}`)
}
