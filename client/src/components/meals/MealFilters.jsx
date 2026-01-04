import { Filter, X } from 'lucide-react'

const MealFilters = ({ filters, onFilterChange, onClearFilters }) => {
  const cuisineOptions = [
    'Italian', 'Chinese', 'Indian', 'Mexican', 'Thai', 'Japanese', 
    'Mediterranean', 'American', 'French', 'Korean', 'Vietnamese'
  ]

  const mealTypeOptions = [
    { value: 'breakfast', label: 'Breakfast' },
    { value: 'lunch', label: 'Lunch' },
    { value: 'dinner', label: 'Dinner' },
    { value: 'snack', label: 'Snack' }
  ]

  const costLevelOptions = [
    { value: 'low', label: 'Low Cost' },
    { value: 'medium', label: 'Medium Cost' },
    { value: 'high', label: 'High Cost' }
  ]

  const hasActiveFilters = Object.values(filters).some(value => 
    value !== '' && value !== undefined && value !== false
  )

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Filter className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Filters</h3>
        </div>
        
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="flex items-center space-x-1 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <X className="h-4 w-4" />
            <span>Clear All</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Cuisine Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Cuisine
          </label>
          <select
            value={filters.cuisine || ''}
            onChange={(e) => onFilterChange('cuisine', e.target.value)}
            className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">All Cuisines</option>
            {cuisineOptions.map(cuisine => (
              <option key={cuisine} value={cuisine}>{cuisine}</option>
            ))}
          </select>
        </div>

        {/* Meal Type Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Meal Type
          </label>
          <select
            value={filters.mealType || ''}
            onChange={(e) => onFilterChange('mealType', e.target.value)}
            className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">All Types</option>
            {mealTypeOptions.map(type => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>
        </div>

        {/* Cost Level Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Cost Level
          </label>
          <select
            value={filters.costLevel || ''}
            onChange={(e) => onFilterChange('costLevel', e.target.value)}
            className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">All Costs</option>
            {costLevelOptions.map(cost => (
              <option key={cost.value} value={cost.value}>{cost.label}</option>
            ))}
          </select>
        </div>

        {/* Vegetarian Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Diet
          </label>
          <select
            value={filters.vegetarian === true ? 'true' : filters.vegetarian === false ? 'false' : ''}
            onChange={(e) => {
              const value = e.target.value
              onFilterChange('vegetarian', value === '' ? undefined : value === 'true')
            }}
            className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">All Diets</option>
            <option value="true">Vegetarian Only</option>
            <option value="false">Non-Vegetarian</option>
          </select>
        </div>
      </div>
    </div>
  )
}

export default MealFilters