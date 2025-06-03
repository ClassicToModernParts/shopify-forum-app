"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

interface BackButtonProps {
  href?: string
  label?: string
  className?: string
}

export function BackButton({ href, label = "Back", className = "" }: BackButtonProps) {
  const router = useRouter()

  const handleBack = () => {
    if (href) {
      router.push(href)
    } else {
      router.back()
    }
  }

  return (
    <Button
      variant="ghost"
      onClick={handleBack}
      className={`text-gray-600 hover:text-gray-900 p-0 h-auto font-normal ${className}`}
    >
      <ArrowLeft className="h-4 w-4 mr-2" />
      {label}
    </Button>
  )
}
