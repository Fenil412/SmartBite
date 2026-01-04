import { useState } from 'react'
import { ChevronDown, ChevronUp, Check, Package } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import GroceryItemCard from './GroceryItemCard'

const CategorySection = ({ category, items, onTogglePurchased, onBulkToggle, disabled }) => {
  const [isExpanded, setIsExpanded] = useState(true)
  const [bulkSelecting, setBulkSelecting] = useState(false)
  
  const purchasedCount = items.filter(item => item.purchased).length
  const totalCount = items.length
  const allPurchased = purchasedCount === totalCount
  const somePurchased = purchasedCount > 0 && purchasedCount < totalCount

  const handleBulkToggle = async () => {
    setBulkSelecting(true)
    try {
      const targetState = !allPurchased
      const itemIds = items.map(item => item.id)
      await onBulkToggle(itemIds, targetState)
    } finally {
      setBulkSelecting(false)
    }
  }

  const getCategoryIcon = (categoryName) => {
    const icons = {
      'Produce': '🥬',
      'Dairy': '🥛',
      'Meat': '🥩',
      'Pantry': '🥫',
      'Frozen': '🧊',
      'Bakery': '🍞',
      'Beverages': '🥤',
      'Snacks': '🍿',
      'Condiments': '🍯',
      'Spices': '🌶️'
    }
    return icons[categoryName] || '📦'
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Category Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center space-x-3 text-left flex-1 hover:opacity-80 transition-opacity"
          >
            <span className="text-2xl">{getCategoryIcon(category)}</span>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                {category}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {purchasedCount} of {totalCount} items purchased
              </p>
            </div>
          </button>

          <div className="flex items-center space-x-2">
            {/* Bulk Select Button */}
            <button
              onClick={handleBulkToggle}
              disabled={disabled || bulkSelecting}
              className={`flex items-center space-x-1 px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                allPurchased
                  ? 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/20 dark:text-green-200'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200'
              } ${disabled || bulkSelecting ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                allPurchased
                  ? 'bg-green-500 border-green-500 text-white'
                  : somePurchased
                  ? 'bg-yellow-500 border-yellow-500 text-white'
                  : 'border-gray-300 dark:border-gray-600'
              }`}>
                {allPurchased && <Check className="h-3 w-3" />}
                {somePurchased && !allPurchased && <div className="w-2 h-2 bg-white rounded-full" />}
              </div>
              <span>{allPurchased ? 'Unmark All' : 'Mark All'}</span>
            </button>

            {/* Expand/Collapse Button */}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              {isExpanded ? (
                <ChevronUp className="h-5 w-5" />
              ) : (
                <ChevronDown className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-3">
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
            <span>Progress</span>
            <span>{Math.round((purchasedCount / totalCount) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(purchasedCount / totalCount) * 100}%` }}
              transition={{ duration: 0.5 }}
              className="bg-green-500 h-2 rounded-full"
            />
          </div>
        </div>
      </div>

      {/* Category Items */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="p-4 space-y-2">
              {items.map((item, index) => (
                <GroceryItemCard
                  key={item.id || index}
                  item={item}
                  onTogglePurchased={onTogglePurchased}
                  disabled={disabled}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default CategorySection