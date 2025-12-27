// Browser storage utility for grocery data
// Since grocery data is not stored in MongoDB, we use browser storage

const STORAGE_PREFIX = 'smartbite_grocery_'

export const groceryStorage = {
  // Save grocery list data
  saveGroceryList: (mealPlanId, groceryData) => {
    try {
      const key = `${STORAGE_PREFIX}list_${mealPlanId}`
      localStorage.setItem(key, JSON.stringify({
        ...groceryData,
        lastUpdated: new Date().toISOString()
      }))
    } catch (error) {
      console.error('Failed to save grocery list:', error)
    }
  },

  // Get grocery list data
  getGroceryList: (mealPlanId) => {
    try {
      const key = `${STORAGE_PREFIX}list_${mealPlanId}`
      const data = localStorage.getItem(key)
      return data ? JSON.parse(data) : null
    } catch (error) {
      console.error('Failed to get grocery list:', error)
      return null
    }
  },

  // Save purchased items state
  savePurchasedItems: (mealPlanId, purchasedItems) => {
    try {
      const key = `${STORAGE_PREFIX}purchased_${mealPlanId}`
      localStorage.setItem(key, JSON.stringify({
        items: purchasedItems,
        lastUpdated: new Date().toISOString()
      }))
    } catch (error) {
      console.error('Failed to save purchased items:', error)
    }
  },

  // Get purchased items state
  getPurchasedItems: (mealPlanId) => {
    try {
      const key = `${STORAGE_PREFIX}purchased_${mealPlanId}`
      const data = localStorage.getItem(key)
      return data ? JSON.parse(data).items : []
    } catch (error) {
      console.error('Failed to get purchased items:', error)
      return []
    }
  },

  // Save pantry items
  savePantryItems: (pantryItems) => {
    try {
      const key = `${STORAGE_PREFIX}pantry`
      localStorage.setItem(key, JSON.stringify({
        items: pantryItems,
        lastUpdated: new Date().toISOString()
      }))
    } catch (error) {
      console.error('Failed to save pantry items:', error)
    }
  },

  // Get pantry items
  getPantryItems: () => {
    try {
      const key = `${STORAGE_PREFIX}pantry`
      const data = localStorage.getItem(key)
      return data ? JSON.parse(data).items : []
    } catch (error) {
      console.error('Failed to get pantry items:', error)
      return []
    }
  },

  // Save missing items
  saveMissingItems: (mealPlanId, missingItems) => {
    try {
      const key = `${STORAGE_PREFIX}missing_${mealPlanId}`
      localStorage.setItem(key, JSON.stringify({
        items: missingItems,
        lastUpdated: new Date().toISOString()
      }))
    } catch (error) {
      console.error('Failed to save missing items:', error)
    }
  },

  // Get missing items
  getMissingItems: (mealPlanId) => {
    try {
      const key = `${STORAGE_PREFIX}missing_${mealPlanId}`
      const data = localStorage.getItem(key)
      return data ? JSON.parse(data).items : []
    } catch (error) {
      console.error('Failed to get missing items:', error)
      return []
    }
  },

  // Clear all grocery data for a meal plan
  clearMealPlanData: (mealPlanId) => {
    try {
      const keys = [
        `${STORAGE_PREFIX}list_${mealPlanId}`,
        `${STORAGE_PREFIX}purchased_${mealPlanId}`,
        `${STORAGE_PREFIX}missing_${mealPlanId}`
      ]
      keys.forEach(key => localStorage.removeItem(key))
    } catch (error) {
      console.error('Failed to clear meal plan data:', error)
    }
  },

  // Clear all grocery data
  clearAllData: () => {
    try {
      const keys = Object.keys(localStorage).filter(key => 
        key.startsWith(STORAGE_PREFIX)
      )
      keys.forEach(key => localStorage.removeItem(key))
    } catch (error) {
      console.error('Failed to clear all grocery data:', error)
    }
  },

  // Get storage usage info
  getStorageInfo: () => {
    try {
      const keys = Object.keys(localStorage).filter(key => 
        key.startsWith(STORAGE_PREFIX)
      )
      const totalSize = keys.reduce((size, key) => {
        return size + (localStorage.getItem(key)?.length || 0)
      }, 0)
      
      return {
        keyCount: keys.length,
        totalSize: totalSize,
        formattedSize: `${(totalSize / 1024).toFixed(2)} KB`
      }
    } catch (error) {
      console.error('Failed to get storage info:', error)
      return { keyCount: 0, totalSize: 0, formattedSize: '0 KB' }
    }
  }
}