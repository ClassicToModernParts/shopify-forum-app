// app/api/forum/data-store.ts

interface Category {
  id: string
  name: string
}

class DataStore {
  private categories: Category[] = []

  constructor() {
    this.categories = [
      { id: "1", name: "General Discussion" },
      { id: "2", name: "Introductions" },
      { id: "3", name: "Help & Support" },
    ]
  }

  getCategories(): Category[] {
    console.log("🗂️ DataStore getCategories called")
    console.log("📊 Current categories:", this.categories)

    // Ensure we always return an array
    const categoriesArray = Array.isArray(this.categories) ? this.categories : []
    console.log("📋 Returning categories array:", categoriesArray)

    return categoriesArray
  }

  addCategory(category: Category): void {
    this.categories.push(category)
  }
}

const dataStore = new DataStore()

export default dataStore
