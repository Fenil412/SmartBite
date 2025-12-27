import api from './api.js'
import { groceryStorage } from '../utils/groceryStorage.js'

export const groceryService = {
  // Get grocery list for a meal plan
  getGroceryList: async (mealPlanId) => {
    const response = await api.get(`/meal-plans/${mealPlanId}/grocery-list`)
    
    // Merge with stored purchased state
    if (response.success && response.data.list) {
      const purchasedItems = groceryStorage.getPurchasedItems(mealPlanId)
      const purchasedSet = new Set(purchasedItems)
      
      // Update items with purchased state
      if (response.data.list.categories) {
        response.data.list.categories = response.data.list.categories.map(category => ({
          ...category,
          items: category.items.map(item => ({
            ...item,
            purchased: purchasedSet.has(item.id)
          }))
        }))
      }
      
      // Save to storage
      groceryStorage.saveGroceryList(mealPlanId, response.data.list)
    }
    
    return response
  },

  // Get cost estimate for a meal plan
  getCostEstimate: async (mealPlanId) => {
    return await api.get(`/meal-plans/${mealPlanId}/cost-estimate`)
  },

  // Get missing items based on pantry
  getMissingItems: async (mealPlanId, pantryItems) => {
    // Save pantry items to storage
    groceryStorage.savePantryItems(pantryItems)
    
    const response = await api.post(`/meal-plans/${mealPlanId}/missing-items`, {
      pantryItems
    })
    
    // Save missing items to storage
    if (response.success && response.data.missing) {
      groceryStorage.saveMissingItems(mealPlanId, response.data.missing)
    }
    
    return response
  },

  // Get grocery summary
  getGrocerySummary: async (mealPlanId) => {
    const response = await api.get(`/meal-plans/${mealPlanId}/grocery-summary`)
    
    // Adjust summary with local purchased state
    if (response.success && response.data) {
      const purchasedItems = groceryStorage.getPurchasedItems(mealPlanId)
      response.data.purchasedCount = purchasedItems.length
    }
    
    return response
  },

  // Mark items as purchased (local storage only)
  markPurchased: async (mealPlanId, items) => {
    try {
      // Get current purchased items
      const currentPurchased = groceryStorage.getPurchasedItems(mealPlanId)
      const purchasedSet = new Set(currentPurchased)
      
      // Update purchased state
      items.forEach(item => {
        if (item.purchased) {
          purchasedSet.add(item.id)
        } else {
          purchasedSet.delete(item.id)
        }
      })
      
      // Save updated state
      groceryStorage.savePurchasedItems(mealPlanId, Array.from(purchasedSet))
      
      // Return success response
      return {
        success: true,
        data: {
          message: `${items.length} items updated`,
          updatedItems: items
        }
      }
    } catch (error) {
      throw new Error('Failed to update purchased items: ' + error.message)
    }
  },

  // Get store suggestions
  getStoreSuggestions: async (mealPlanId) => {
    return await api.get(`/meal-plans/${mealPlanId}/store-suggestions`)
  },

  // Get budget alternatives
  getBudgetAlternatives: async (mealPlanId) => {
    return await api.get(`/meal-plans/${mealPlanId}/budget-alternatives`)
  },

  // Get cached pantry items
  getCachedPantryItems: () => {
    return groceryStorage.getPantryItems()
  },

  // Get cached missing items
  getCachedMissingItems: (mealPlanId) => {
    return groceryStorage.getMissingItems(mealPlanId)
  },

  // Clear cached data for meal plan
  clearCachedData: (mealPlanId) => {
    groceryStorage.clearMealPlanData(mealPlanId)
  }
}