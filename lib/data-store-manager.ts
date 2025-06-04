import { persistentForumDataStore } from "./persistent-data-store"

// Global initialization state
let isInitializing = false
let isInitialized = false
let initializationError: Error | null = null
let initializationPromise: Promise<boolean> | null = null

/**
 * Ensures the data store is initialized before any operations
 * Returns true if initialization was successful
 */
export async function ensureDataStoreInitialized(): Promise<boolean> {
  // If already initialized, return immediately
  if (isInitialized) {
    return true
  }

  // If initialization is in progress, wait for it
  if (isInitializing && initializationPromise) {
    return initializationPromise
  }

  // Start initialization
  isInitializing = true
  initializationPromise = new Promise(async (resolve) => {
    try {
      console.log("🔄 Ensuring data store is initialized...")

      // Check if already initialized
      const alreadyInitialized = await persistentForumDataStore.isInitialized()

      if (alreadyInitialized) {
        console.log("✅ Data store already initialized")
        isInitialized = true
        resolve(true)
        return
      }

      // Initialize data store
      console.log("🔄 Initializing data store...")
      await persistentForumDataStore.initialize()

      console.log("✅ Data store initialized successfully")
      isInitialized = true
      resolve(true)
    } catch (error) {
      console.error("❌ Data store initialization failed:", error)
      initializationError = error instanceof Error ? error : new Error(String(error))
      resolve(false)
    } finally {
      isInitializing = false
    }
  })

  return initializationPromise
}

/**
 * Gets the current initialization status
 */
export function getDataStoreStatus() {
  return {
    isInitialized,
    isInitializing,
    error: initializationError ? initializationError.message : null,
  }
}

/**
 * Force reinitialization of the data store
 */
export async function reinitializeDataStore(): Promise<boolean> {
  isInitialized = false
  isInitializing = false
  initializationError = null
  initializationPromise = null

  try {
    console.log("🔄 Forcing data store reinitialization...")
    await persistentForumDataStore.forceReinitialize()
    console.log("✅ Data store reinitialized successfully")
    isInitialized = true
    return true
  } catch (error) {
    console.error("❌ Data store reinitialization failed:", error)
    initializationError = error instanceof Error ? error : new Error(String(error))
    return false
  }
}
