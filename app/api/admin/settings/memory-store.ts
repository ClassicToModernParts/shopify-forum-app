// In-memory settings store as a fallback
let memorySettings = {
  general: {
    forumName: "Community Forum",
    description: "Connect with other customers and get support",
    welcomeMessage: "Welcome to our community!",
    contactEmail: "support@yourstore.com",
  },
  moderation: {
    requireApproval: false,
    autoSpamDetection: true,
    allowAnonymous: false,
    enableReporting: true,
    maxPostLength: 5000,
  },
  appearance: {
    primaryColor: "#3B82F6",
    accentColor: "#10B981",
    darkMode: false,
    customCSS: "",
  },
  notifications: {
    emailNotifications: true,
    newPostNotifications: true,
    moderationAlerts: true,
  },
  lastUpdated: new Date().toISOString(),
}

export function getSettings() {
  return memorySettings
}

export function updateSettings(newSettings: any) {
  memorySettings = {
    ...newSettings,
    lastUpdated: new Date().toISOString(),
  }
  return memorySettings
}
