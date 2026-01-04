import { useState, useEffect } from 'react'
import { Plus, X, Package } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { groceryService } from '../../services/groceryService'

const PantryInput = ({ onSubmit, loading }) => {
  const [pantryItems, setPantryItems] = useState([])
  const [inputValue, setInputValue] = useState('')

  // Load cached pantry items on mount
  useEffect(() => {
    const cachedItems = groceryService.getCachedPantryItems()
    if (cachedItems.length > 0) {
      setPantryItems(cachedItems)
    }
  }, [])

  const addItem = () => {
    if (inputValue.trim() && !pantryItems.includes(inputValue.trim())) {
      setPantryItems([...pantryItems, inputValue.trim()])
      setInputValue('')
    }
  }

  const removeItem = (itemToRemove) => {
    setPantryItems(pantryItems.filter(item => item !== itemToRemove))
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addItem()
    }
  }

  const handleSubmit = () => {
    onSubmit(pantryItems)
  }

  const commonItems = [
    'Salt', 'Pepper', 'Olive Oil', 'Garlic', 'Onions', 'Rice', 'Pasta', 
    'Flour', 'Sugar', 'Butter', 'Eggs', 'Milk', 'Bread', 'Tomatoes'
  ]

  const addCommonItem = (item) => {
    if (!pantryItems.includes(item)) {
      setPantryItems([...pantryItems, item])
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center space-x-2 mb-4">
        <Package className="h-5 w-5 text-primary-600 dark:text-primary-400" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          What's in your pantry?
        </h3>
      </div>
      
      <p className="text-gray-600 dark:text-gray-400 mb-4">
        Add items you already have to get a personalized missing items list
      </p>

      {/* Input Field */}
      <div className="flex space-x-2 mb-4">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Enter pantry item..."
          className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
        />
        <button
          onClick={addItem}
          disabled={!inputValue.trim()}
          className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      {/* Common Items */}
      <div className="mb-4">
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Quick add common items:
        </p>
        <div className="flex flex-wrap gap-2">
          {commonItems.map(item => (
            <button
              key={item}
              onClick={() => addCommonItem(item)}
              disabled={pantryItems.includes(item)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                pantryItems.includes(item)
                  ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-200 cursor-not-allowed'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      {/* Added Items */}
      {pantryItems.length > 0 && (
        <div className="mb-4">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Your pantry items ({pantryItems.length}):
          </p>
          <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
            <AnimatePresence>
              {pantryItems.map(item => (
                <motion.div
                  key={item}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="flex items-center space-x-1 bg-primary-100 text-primary-700 dark:bg-primary-900/20 dark:text-primary-200 px-3 py-1 rounded-full text-sm"
                >
                  <span>{item}</span>
                  <button
                    onClick={() => removeItem(item)}
                    className="text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-200"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Submit Button */}
      <button
        onClick={handleSubmit}
        disabled={loading || pantryItems.length === 0}
        className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            <span>Finding missing items...</span>
          </>
        ) : (
          <>
            <Package className="h-4 w-4" />
            <span>Find Missing Items ({pantryItems.length} pantry items)</span>
          </>
        )}
      </button>
    </div>
  )
}

export default PantryInput