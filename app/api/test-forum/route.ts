import { NextResponse } from "next/server"

export async function GET() {
  return NextResponse.json({
    message: "Forum API is working!",
    timestamp: new Date().toISOString(),
    endpoints: {
      categories: "/api/forum?type=categories&shop_id=123",
      posts: "/api/forum?type=posts&shop_id=123",
      postsByCategory: "/api/forum?type=posts&shop_id=123&category_id=1",
      singlePost: "/api/forum?type=post&shop_id=123&post_id=1",
      replies: "/api/forum?type=replies&shop_id=123&post_id=1",
    },
  })
}
