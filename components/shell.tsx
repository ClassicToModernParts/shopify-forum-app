import type React from "react"

interface ShellProps {
  children: React.ReactNode
  className?: string
}

export function Shell({ children, className = "" }: ShellProps) {
  return (
    <div className={`min-h-screen bg-gray-50 ${className}`}>
      <div className="container mx-auto px-4 py-8">{children}</div>
    </div>
  )
}
