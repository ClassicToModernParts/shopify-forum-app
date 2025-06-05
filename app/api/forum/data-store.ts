// Re-export from the main data store for backward compatibility
import persistentDataStoreInstance, { PersistentDataStore, persistentForumDataStore } from "@/lib/persistent-data-store"

// Export all the required named exports
export { PersistentDataStore, persistentForumDataStore }

// Add the missing forumDataStore export (alias for persistentForumDataStore)
export { persistentForumDataStore as forumDataStore }

// Export the main instance as default
export default persistentDataStoreInstance

// Also export the main instance with different names for compatibility
export { persistentDataStoreInstance as dataStore }
export { persistentDataStoreInstance as persistentDataStore }
