"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { RefreshCw, CheckCircle, AlertCircle } from "lucide-react"

interface InitializeSystemButtonProps {
  variant?: "default" | "clean"
  onSuccess?: () => void
}

export default function InitializeSystemButton({ variant = "default", onSuccess }: InitializeSystemButtonProps) {
  const [isInitializing, setIsInitializing] = useState(false)
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle")
  const [message, setMessage] = useState("")

  const handleInitialize = async () => {
    setIsInitializing(true)
    setStatus("idle")
    setMessage("")

    try {
      const endpoint = variant === "clean" ? "/api/system/init-clean" : "/api/system/init"
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          includeSampleGroups: variant !== "clean",
          force: false,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setStatus("success")
        setMessage(data.message || "System initialized successfully!")

        // Call onSuccess callback if provided
        if (onSuccess) {
          onSuccess()
        }

        // Reload the page after a short delay
        setTimeout(() => {
          window.location.reload()
        }, 2000)
      } else {
        setStatus("error")
        setMessage(data.error || "Failed to initialize system")
      }
    } catch (error) {
      console.error("Error initializing system:", error)
      setStatus("error")
      setMessage("Failed to initialize system: " + (error instanceof Error ? error.message : "Unknown error"))
    } finally {
      setIsInitializing(false)
    }
  }

  const getButtonText = () => {
    if (isInitializing) return "Initializing..."
    if (variant === "clean") return "Initialize System (Clean)"
    return "Initialize System"
  }

  const getButtonIcon = () => {
    if (isInitializing) return <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
    if (status === "success") return <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
    if (status === "error") return <AlertCircle className="h-4 w-4 mr-2 text-red-600" />
    return <RefreshCw className="h-4 w-4 mr-2" />
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <Button
        onClick={handleInitialize}
        disabled={isInitializing}
        className={`${
          status === "success"
            ? "bg-green-600 hover:bg-green-700"
            : status === "error"
              ? "bg-red-600 hover:bg-red-700"
              : "bg-blue-600 hover:bg-blue-700"
        }`}
      >
        {getButtonIcon()}
        {getButtonText()}
      </Button>

      {message && (
        <div
          className={`text-sm text-center p-3 rounded-md ${
            status === "success"
              ? "bg-green-50 text-green-700 border border-green-200"
              : status === "error"
                ? "bg-red-50 text-red-700 border border-red-200"
                : "bg-blue-50 text-blue-700 border border-blue-200"
          }`}
        >
          {message}
        </div>
      )}
    </div>
  )
}
