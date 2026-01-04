import { useState } from 'react'
import { Check, Package, ShoppingCart } from 'lucide-react'
import { motion } from 'framer-motion'

const GroceryItemCard = ({ item, onTogglePurchased, disabled }) => {
  const [isOptimistic, setIsOptimistic] = useState(false)

  const handleToggle = async () => {
    if (disabled) return
    
    setIsOptimistic(true)
    try {
      await onTogglePurchased(item.id, !item.purchased)
    } finally {
      setIsOptimistic(false)
    }
  }

  const isPurchased = isOptimistic ? !item.purchased : item.purchased

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex items-center space-x-3 p-3 rounded-lg border transition-all duration-200 ${
        isPurchased
          ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
          : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
      }`}
    >
      <button
        onClick={handleToggle}
        disabled={disabled || isOptimistic}
        className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-200 ${
          isPurchased
            ? 'bg-green-500 border-green-500 text-white'
            : 'border-gray-300 dark:border-gray-600 hover:border-green-500'
        } ${disabled || isOptimistic ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        {isPurchased && <Check className="h-3 w-3" />}
      </button>

      <div className="flex-1 min-w-0">
        <div className="flex items-center space-x-2">
          <Package className="h-4 w-4 text-gray-400 flex-shrink-0" />
          <span className={`font-medium ${
            isPurchased 
              ? 'text-green-700 dark:text-green-300 line-through' 
              : 'text-gray-900 dark:text-white'
          }`}>
            {item.name}
          </span>
        </div>
        
        <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500 dark:text-gray-400">
          <span>{item.quantity} {item.unit}</span>
          {item.category && (
            <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-xs">
              {item.category}
            </span>
          )}
          {item.estimatedCost && (
            <span className="font-medium">${item.estimatedCost.toFixed(2)}</span>
          )}
        </div>
      </div>

      {item.priority && (
        <div className={`px-2 py-1 rounded-full text-xs font-medium ${
          item.priority === 'high' 
            ? 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-200'
            : item.priority === 'medium'
            ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-200'
            : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200'
        }`}>
          {item.priority}
        </div>
      )}
    </motion.div>
  )
}

export default GroceryItemCard