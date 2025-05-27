import type { Metadata } from "next"
import { Inter } from 'next/font/google'
import "./globals.css"
import { AdminLink } from "@/components/admin-link"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Community Hub - Forum",
  description: "Community forum integration for Shopify stores",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        <AdminLink />
      </body>
    </html>
  )
}
