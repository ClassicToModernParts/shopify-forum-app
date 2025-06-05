import { PersistentDataStore } from "../persistent-data-store"

// Create and export the persistent forum data store instance
export const persistentForumDataStore = new PersistentDataStore()

// Also export the class for type checking
export { PersistentDataStore }

// Export default for convenience
export default persistentForumDataStore
