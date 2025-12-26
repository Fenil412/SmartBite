import { motion } from 'framer-motion'
import { Clock, Users, Star } from 'lucide-react'

const sampleMeals = [
  {
    id: 1,
    name: 'Mediterranean Quinoa Bowl',
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop&crop=center',
    calories: 520,
    protein: 25,
    carbs: 45,
    fats: 18,
    cookTime: '25 min',
    servings: 2,
    rating: 4.8,
    tags: ['High Protein', 'Mediterranean', 'Vegetarian']
  },
  {
    id: 2,
    name: 'Grilled Salmon with Asparagus',
    image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&h=300&fit=crop&crop=center',
    calories: 420,
    protein: 35,
    carbs: 12,
    fats: 22,
    cookTime: '20 min',
    servings: 1,
    rating: 4.9,
    tags: ['Keto Friendly', 'High Protein', 'Omega-3']
  },
  {
    id: 3,
    name: 'Chicken Buddha Bowl',
    image: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400&h=300&fit=crop&crop=center',
    calories: 480,
    protein: 30,
    carbs: 35,
    fats: 20,
    cookTime: '30 min',
    servings: 2,
    rating: 4.7,
    tags: ['Balanced', 'Meal Prep', 'Gluten Free']
  },
  {
    id: 4,
    name: 'Avocado Toast Power Bowl',
    image: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=400&h=300&fit=crop&crop=center',
    calories: 380,
    protein: 15,
    carbs: 28,
    fats: 24,
    cookTime: '10 min',
    servings: 1,
    rating: 4.6,
    tags: ['Quick', 'Healthy Fats', 'Breakfast']
  },
  {
    id: 5,
    name: 'Thai Curry Vegetables',
    image: 'https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=400&h=300&fit=crop&crop=center',
    calories: 320,
    protein: 12,
    carbs: 40,
    fats: 14,
    cookTime: '35 min',
    servings: 3,
    rating: 4.8,
    tags: ['Vegan', 'Spicy', 'Low Calorie']
  },
  {
    id: 6,
    name: 'Greek Yogurt Parfait',
    image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400&h=300&fit=crop&crop=center',
    calories: 280,
    protein: 20,
    carbs: 32,
    fats: 8,
    cookTime: '5 min',
    servings: 1,
    rating: 4.5,
    tags: ['High Protein', 'Quick', 'Probiotics']
  }
]

const SampleMealsSection = () => {
  return (
    <section className="py-20 bg-gray-50 dark:bg-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Sample Meal Recommendations
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Discover delicious, nutritionally balanced meals tailored to different dietary preferences and goals
          </p>
        </motion.div>

        {/* Meals Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {sampleMeals.map((meal, index) => (
            <motion.div
              key={meal.id}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group cursor-hover"
            >
              <div className="bg-white dark:bg-gray-900 rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 border border-gray-200 dark:border-gray-700">
                {/* Image */}
                <div className="relative overflow-hidden">
                  <img
                    src={meal.image}
                    alt={meal.name}
                    className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                    loading="lazy"
                  />
                  <div className="absolute top-4 right-4 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm px-3 py-1 rounded-full">
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{meal.rating}</span>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  {/* Title */}
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                    {meal.name}
                  </h3>

                  {/* Macros */}
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">{meal.calories}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Calories</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-secondary-600 dark:text-secondary-400">{meal.protein}g</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Protein</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{meal.carbs}g</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Carbs</div>
                    </div>
                  </div>

                  {/* Meta Info */}
                  <div className="flex items-center justify-between mb-4 text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4" />
                      <span>{meal.cookTime}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Users className="h-4 w-4" />
                      <span>{meal.servings} serving{meal.servings > 1 ? 's' : ''}</span>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2">
                    {meal.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 text-xs font-medium rounded-full border border-primary-200 dark:border-primary-800"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <button className="bg-gradient-to-r from-primary-600 to-secondary-600 text-white px-8 py-4 rounded-2xl font-semibold text-lg hover:shadow-2xl hover:shadow-primary-500/25 transition-all duration-300 transform hover:scale-105">
            Explore All Recipes
          </button>
        </motion.div>
      </div>
    </section>
  )
}

export default SampleMealsSection