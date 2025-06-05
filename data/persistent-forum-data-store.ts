// Re-export everything from the main persistent data store
export {
  persistentForumDataStore,
  dataStore,
  forumDataStore,
  PersistentDataStore,
} from "../lib/persistent-data-store"

// Default export
import persistentDataStore from "../lib/persistent-data-store"
export default persistentDataStore
