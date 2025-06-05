// Re-export everything from the main persistent data store
export {
  persistentForumDataStore,
  dataStore,
  PersistentDataStore,
} from "../../../lib/persistent-data-store"

// Add the missing forumDataStore export (alias for persistentForumDataStore)
export { persistentForumDataStore as forumDataStore } from "../../../lib/persistent-data-store"

// Default export
import persistentDataStore from "../../../lib/persistent-data-store"
export default persistentDataStore
