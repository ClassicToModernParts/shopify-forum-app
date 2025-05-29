// SMS Service for sending password reset codes
// This uses a mock implementation - in production you'd use Twilio, AWS SNS, etc.

interface SMSResult {
  success: boolean
  message: string
  messageId?: string
}

class SMSService {
  // Mock SMS sending - replace with real service like Twilio
  async sendSMS(phoneNumber: string, message: string): Promise<SMSResult> {
    try {
      // Validate phone number format
      const cleanPhone = this.cleanPhoneNumber(phoneNumber)
      if (!this.isValidPhoneNumber(cleanPhone)) {
        return {
          success: false,
          message: "Invalid phone number format",
        }
      }

      // In production, replace this with actual SMS service
      console.log(`SMS to ${cleanPhone}: ${message}`)

      // Simulate SMS sending delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // For demo purposes, we'll return success
      return {
        success: true,
        message: "SMS sent successfully",
        messageId: `sms_${Date.now()}_${Math.random().toString(36).substring(2)}`,
      }
    } catch (error) {
      console.error("SMS sending error:", error)
      return {
        success: false,
        message: "Failed to send SMS",
      }
    }
  }

  // Clean phone number (remove spaces, dashes, etc.)
  cleanPhoneNumber(phone: string): string {
    return phone.replace(/\D/g, "")
  }

  // Basic phone number validation
  isValidPhoneNumber(phone: string): boolean {
    // US phone number: 10 digits
    // International: 10-15 digits
    const cleaned = this.cleanPhoneNumber(phone)
    return /^\d{10,15}$/.test(cleaned)
  }

  // Format phone number for display
  formatPhoneNumber(phone: string): string {
    const cleaned = this.cleanPhoneNumber(phone)
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`
    }
    return phone
  }

  // Generate 6-digit verification code
  generateVerificationCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString()
  }
}

export const smsService = new SMSService()
