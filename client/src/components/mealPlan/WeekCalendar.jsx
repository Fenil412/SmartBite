import { motion } from 'framer-motion'
import MealCard from './MealCard'

const WeekCalendar = ({ plan, onStatusUpdate }) => {
  const dayNames = {
    monday: 'Monday',
    tuesday: 'Tuesday', 
    wednesday: 'Wednesday',
    thursday: 'Thursday',
    friday: 'Friday',
    saturday: 'Saturday',
    sunday: 'Sunday'
  }

  const mealTypeOrder = ['breakfast', 'lunch', 'dinner', 'snack']

  const getDateForDay = (dayName, weekStartDate) => {
    const dayIndex = Object.keys(dayNames).indexOf(dayName)
    const date = new Date(weekStartDate)
    date.setDate(date.getDate() + dayIndex)
    return date
  }

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    })
  }

  const groupMealsByType = (meals) => {
    const grouped = {}
    mealTypeOrder.forEach(type => {
      grouped[type] = meals.find(meal => meal.mealType === type) || null
    })
    return grouped
  }

  return (
    <div className="space-y-6">
      {plan.days.map((day, dayIndex) => {
        const dayDate = getDateForDay(day.day, plan.weekStartDate)
        const groupedMeals = groupMealsByType(day.meals)
        
        return (
          <motion.div
            key={day.day}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: dayIndex * 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden"
          >
            {/* Day Header */}
            <div className="bg-gray-50 dark:bg-gray-700 px-6 py-4 border-b border-gray-200 dark:border-gray-600">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {dayNames[day.day]}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {formatDate(dayDate)}
                  </p>
                </div>
                
                <div className="text-right">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {day.meals.length} meals planned
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-500">
                    {day.meals.filter(m => m.adherence.status === 'eaten').length} completed
                  </div>
                </div>
              </div>
            </div>

            {/* Meals Grid */}
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {mealTypeOrder.map(mealType => {
                  const meal = groupedMeals[mealType]
                  
                  return (
                    <div key={mealType} className="space-y-2">
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
                        {mealType}
                      </h4>
                      
                      {meal ? (
                        <MealCard
                          meal={meal}
                          day={day.day}
                          planId={plan._id}
                          onStatusUpdate={onStatusUpdate}
                        />
                      ) : (
                        <div className="bg-gray-50 dark:bg-gray-700 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 p-4 text-center">
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            No {mealType} planned
                          </p>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}

export default WeekCalendar