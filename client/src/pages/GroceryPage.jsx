import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  ArrowLeft, 
  ShoppingCart, 
  DollarSign, 
  Package, 
  TrendingUp, 
  Store, 
  AlertCircle,
  CheckCircle,
  Clock,
  Target,
  Zap
} from 'lucide-react'
import { groceryService } from '../services/groceryService'
import { useToast } from '../contexts/ToastContext'
import CategorySection from '../components/grocery/CategorySection'
import PantryInput from '../components/grocery/PantryInput'
import LoadingSpinner from '../components/LoadingSpinner'

const GroceryPage = () => {
  const { mealPlanId } = useParams()
  const { success, error } = useToast()
  
  // State management
  const [loading, setLoading] = useState(true)
  const [groceryData, setGroceryData] = useState(null)
  const [summary, setSummary] = useState(null)
  const [costEstimate, setCostEstimate] = useState(null)
  const [missingItems, setMissingItems] = useState([])
  const [storeSuggestions, setStoreSuggestions] = useState([])
  const [budgetAlternatives, setBudgetAlternatives] = useState([])
  const [activeTab, setActiveTab] = useState('grocery-list')
  const [purchaseLoading, setPurchaseLoading] = useState(false)
  const [missingItemsLoading, setMissingItemsLoading] = useState(false)

  // Load initial data
  useEffect(() => {
    loadGroceryData()
  }, [mealPlanId])

  const loadGroceryData = async () => {
    try {
      setLoading(true)
      const [groceryRes, summaryRes, costRes, storeRes, budgetRes] = await Promise.all([
        groceryService.getGroceryList(mealPlanId),
        groceryService.getGrocerySummary(mealPlanId),
        groceryService.getCostEstimate(mealPlanId),
        groceryService.getStoreSuggestions(mealPlanId),
        groceryService.getBudgetAlternatives(mealPlanId)
      ])

      if (groceryRes.success) setGroceryData(groceryRes.data.list)
      if (summaryRes.success) setSummary(summaryRes.data)
      if (costRes.success) setCostEstimate(costRes.data)
      if (storeRes.success) setStoreSuggestions(storeRes.data.stores)
      if (budgetRes.success) setBudgetAlternatives(budgetRes.data.alternatives)
    } catch (err) {
      error(err.message || 'Failed to load grocery data')
    } finally {
      setLoading(false)
    }
  }

  // Handle item purchase toggle
  const handleTogglePurchased = async (itemId, purchased) => {
    try {
      setPurchaseLoading(true)
      
      // Optimistic update
      setGroceryData(prev => ({
        ...prev,
        categories: prev.categories.map(category => ({
          ...category,
          items: category.items.map(item => 
            item.id === itemId ? { ...item, purchased } : item
          )
        }))
      }))

      const response = await groceryService.markPurchased(mealPlanId, [{ id: itemId, purchased }])
      
      if (response.success) {
        success(purchased ? 'Item marked as purchased' : 'Item marked as not purchased')
        // Update summary
        setSummary(prev => ({
          ...prev,
          purchasedCount: purchased ? prev.purchasedCount + 1 : prev.purchasedCount - 1
        }))
      }
    } catch (err) {
      // Revert optimistic update on error
      setGroceryData(prev => ({
        ...prev,
        categories: prev.categories.map(category => ({
          ...category,
          items: category.items.map(item => 
            item.id === itemId ? { ...item, purchased: !purchased } : item
          )
        }))
      }))
      error(err.message || 'Failed to update item status')
    } finally {
      setPurchaseLoading(false)
    }
  }

  // Handle bulk purchase toggle
  const handleBulkToggle = async (itemIds, purchased) => {
    try {
      setPurchaseLoading(true)
      
      // Optimistic update
      setGroceryData(prev => ({
        ...prev,
        categories: prev.categories.map(category => ({
          ...category,
          items: category.items.map(item => 
            itemIds.includes(item.id) ? { ...item, purchased } : item
          )
        }))
      }))

      const items = itemIds.map(id => ({ id, purchased }))
      const response = await groceryService.markPurchased(mealPlanId, items)
      
      if (response.success) {
        success(`${itemIds.length} items ${purchased ? 'marked as purchased' : 'marked as not purchased'}`)
        // Update summary
        const change = purchased ? itemIds.length : -itemIds.length
        setSummary(prev => ({
          ...prev,
          purchasedCount: Math.max(0, prev.purchasedCount + change)
        }))
      }
    } catch (err) {
      // Revert optimistic update on error
      setGroceryData(prev => ({
        ...prev,
        categories: prev.categories.map(category => ({
          ...category,
          items: category.items.map(item => 
            itemIds.includes(item.id) ? { ...item, purchased: !purchased } : item
          )
        }))
      }))
      error(err.message || 'Failed to update items status')
    } finally {
      setPurchaseLoading(false)
    }
  }

  // Handle missing items check
  const handleFindMissingItems = async (pantryItems) => {
    try {
      setMissingItemsLoading(true)
      const response = await groceryService.getMissingItems(mealPlanId, pantryItems)
      
      if (response.success) {
        setMissingItems(response.data.missing)
        success(`Found ${response.data.missing.length} missing items`)
        setActiveTab('missing-items')
      }
    } catch (err) {
      error(err.message || 'Failed to find missing items')
    } finally {
      setMissingItemsLoading(false)
    }
  }

  const getBudgetColor = (level) => {
    switch (level) {
      case 'low': return 'text-green-600 bg-green-100 dark:bg-green-900/20 dark:text-green-200'
      case 'medium': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-200'
      case 'high': return 'text-red-600 bg-red-100 dark:bg-red-900/20 dark:text-red-200'
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20 dark:text-gray-200'
    }
  }

  const tabs = [
    { id: 'grocery-list', label: 'Grocery List', icon: ShoppingCart },
    { id: 'missing-items', label: 'Missing Items', icon: Package },
    { id: 'cost-estimate', label: 'Cost Estimate', icon: DollarSign },
    { id: 'alternatives', label: 'Budget Alternatives', icon: TrendingUp },
    { id: 'stores', label: 'Store Suggestions', icon: Store }
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" message="Loading grocery data..." />
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-8"
      >
        <div className="flex items-center space-x-4 mb-4">
          <Link
            to={`/dashboard/meal-planner/${mealPlanId}`}
            className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Meal Plan</span>
          </Link>
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Smart Grocery List
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          AI-generated grocery list from your meal plan with smart shopping features
        </p>
      </motion.div>

      {/* Summary Cards */}
      {summary && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                <Package className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {summary.totalItems}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Items</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {summary.purchasedCount}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Purchased</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg flex items-center justify-center">
                <Clock className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {summary.totalItems - summary.purchasedCount}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Pending</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  ${costEstimate?.totalCost?.toFixed(2) || '0.00'}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Est. Cost</p>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Tab Navigation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="mb-8"
      >
        <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1 overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md font-medium transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-white dark:bg-gray-700 text-primary-600 dark:text-primary-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </motion.div>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Grocery List Tab */}
        {activeTab === 'grocery-list' && groceryData && (
          <div className="space-y-6">
            {groceryData.categories?.map((category, index) => (
              <CategorySection
                key={category.name || index}
                category={category.name}
                items={category.items}
                onTogglePurchased={handleTogglePurchased}
                onBulkToggle={handleBulkToggle}
                disabled={purchaseLoading}
              />
            ))}
          </div>
        )}

        {/* Missing Items Tab */}
        {activeTab === 'missing-items' && (
          <div className="space-y-6">
            <PantryInput 
              onSubmit={handleFindMissingItems}
              loading={missingItemsLoading}
            />
            
            {missingItems.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-2 mb-4">
                  <AlertCircle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Missing Items ({missingItems.length})
                  </h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {missingItems.map((item, index) => (
                    <div
                      key={item.id || index}
                      className={`p-4 rounded-lg border-2 ${
                        item.priority === 'high'
                          ? 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20'
                          : item.priority === 'medium'
                          ? 'border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20'
                          : 'border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          {item.name}
                        </h4>
                        {item.priority && (
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            item.priority === 'high'
                              ? 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-200'
                              : item.priority === 'medium'
                              ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-200'
                              : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200'
                          }`}>
                            {item.priority}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {item.quantity} {item.unit}
                      </p>
                      {item.estimatedCost && (
                        <p className="text-sm font-medium text-gray-900 dark:text-white mt-1">
                          ~${item.estimatedCost.toFixed(2)}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Cost Estimate Tab */}
        {activeTab === 'cost-estimate' && costEstimate && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Weekly Cost Breakdown
                </h3>
                <div className="flex items-center space-x-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getBudgetColor(costEstimate.budgetLevel)}`}>
                    {costEstimate.budgetLevel} budget
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-4">
                    Total Cost: ${costEstimate.totalCost?.toFixed(2)}
                  </h4>
                  
                  {costEstimate.categoryBreakdown && (
                    <div className="space-y-3">
                      {Object.entries(costEstimate.categoryBreakdown).map(([category, cost]) => (
                        <div key={category} className="flex items-center justify-between">
                          <span className="text-gray-600 dark:text-gray-400">{category}</span>
                          <span className="font-medium text-gray-900 dark:text-white">
                            ${cost.toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-4">
                    Nutrition Coverage
                  </h4>
                  
                  {costEstimate.nutritionCoverage && (
                    <div className="space-y-3">
                      {Object.entries(costEstimate.nutritionCoverage).map(([nutrient, percentage]) => (
                        <div key={nutrient}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                              {nutrient}
                            </span>
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                              {percentage}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div
                              className="bg-primary-500 h-2 rounded-full transition-all duration-500"
                              style={{ width: `${Math.min(percentage, 100)}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Budget Alternatives Tab */}
        {activeTab === 'alternatives' && (
          <div className="space-y-6">
            {budgetAlternatives.length > 0 ? (
              budgetAlternatives.map((alternative, index) => (
                <div
                  key={alternative.id || index}
                  className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {alternative.originalItem} → {alternative.alternative}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 mt-1">
                        {alternative.reason}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-green-600 dark:text-green-400">
                        Save ${alternative.savings?.toFixed(2)}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {alternative.savingsPercentage}% less
                      </p>
                    </div>
                  </div>

                  {alternative.nutritionImpact && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-4">
                      <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                        Nutrition Impact
                      </h4>
                      <p className="text-sm text-blue-800 dark:text-blue-200">
                        {alternative.nutritionImpact}
                      </p>
                    </div>
                  )}

                  <button className="w-full px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors">
                    Replace with Alternative
                  </button>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <Target className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No budget alternatives available
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Your current grocery list is already optimized for your budget.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Store Suggestions Tab */}
        {activeTab === 'stores' && (
          <div className="space-y-6">
            {storeSuggestions.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {storeSuggestions.map((store, index) => (
                  <div
                    key={store.id || index}
                    className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700"
                  >
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/20 rounded-lg flex items-center justify-center">
                        <Store className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {store.name}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {store.type}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          Price Range
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getBudgetColor(store.priceRange)}`}>
                          {store.priceRange}
                        </span>
                      </div>
                      
                      {store.estimatedTotal && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            Est. Total
                          </span>
                          <span className="font-medium text-gray-900 dark:text-white">
                            ${store.estimatedTotal.toFixed(2)}
                          </span>
                        </div>
                      )}

                      {store.distance && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            Distance
                          </span>
                          <span className="text-sm text-gray-900 dark:text-white">
                            {store.distance}
                          </span>
                        </div>
                      )}
                    </div>

                    {store.specialOffers && store.specialOffers.length > 0 && (
                      <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 mb-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <Zap className="h-4 w-4 text-green-600 dark:text-green-400" />
                          <span className="text-sm font-medium text-green-900 dark:text-green-100">
                            Special Offers
                          </span>
                        </div>
                        <ul className="text-sm text-green-800 dark:text-green-200 space-y-1">
                          {store.specialOffers.map((offer, offerIndex) => (
                            <li key={offerIndex}>• {offer}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <button className="w-full px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors">
                      View Store Details
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Store className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No store suggestions available
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Store suggestions will appear here based on your location and preferences.
                </p>
              </div>
            )}
          </div>
        )}
      </motion.div>
    </div>
  )
}

export default GroceryPage