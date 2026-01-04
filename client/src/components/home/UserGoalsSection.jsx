import { motion } from 'framer-motion'
import { TrendingDown, TrendingUp, Target, Heart } from 'lucide-react'

const goals = [
  {
    id: 'fat-loss',
    icon: TrendingDown,
    title: 'Fat Loss',
    description: 'Sustainable weight loss with balanced nutrition and calorie optimization.',
    features: ['Calorie deficit planning', 'High protein meals', 'Metabolic boost foods', 'Portion control'],
    gradient: 'from-red-500 to-pink-500',
    bgGradient: 'from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20',
    borderColor: 'border-red-200 dark:border-red-800',
    stats: { users: '45%', avgLoss: '2-3 lbs/week' }
  },
  {
    id: 'muscle-gain',
    icon: TrendingUp,
    title: 'Muscle Gain',
    description: 'Build lean muscle with optimized protein intake and nutrient timing.',
    features: ['High protein focus', 'Pre/post workout meals', 'Calorie surplus planning', 'Recovery nutrition'],
    gradient: 'from-primary-500 to-green-500',
    bgGradient: 'from-primary-50 to-green-50 dark:from-primary-900/20 dark:to-green-900/20',
    borderColor: 'border-primary-200 dark:border-primary-800',
    stats: { users: '35%', avgGain: '1-2 lbs/month' }
  },
  {
    id: 'maintenance',
    icon: Target,
    title: 'Maintenance',
    description: 'Maintain your current weight with balanced, sustainable nutrition.',
    features: ['Balanced macros', 'Flexible meal options', 'Lifestyle integration', 'Long-term habits'],
    gradient: 'from-blue-500 to-cyan-500',
    bgGradient: 'from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20',
    borderColor: 'border-blue-200 dark:border-blue-800',
    stats: { users: '25%', satisfaction: '95%' }
  },
  {
    id: 'medical',
    icon: Heart,
    title: 'Medical Diets',
    description: 'Specialized nutrition for diabetes, heart health, and other conditions.',
    features: ['Medical compliance', 'Doctor approved', 'Condition-specific', 'Safety first'],
    gradient: 'from-secondary-500 to-teal-500',
    bgGradient: 'from-secondary-50 to-teal-50 dark:from-secondary-900/20 dark:to-teal-900/20',
    borderColor: 'border-secondary-200 dark:border-secondary-800',
    stats: { users: '15%', compliance: '98%' }
  }
]

const UserGoalsSection = () => {
  return (
    <section className="py-20 bg-white dark:bg-gray-900">
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
            Choose Your Goal
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Whether you want to lose weight, build muscle, maintain your current physique, 
            or manage a health condition, we have the perfect plan for you
          </p>
        </motion.div>

        {/* Goals Grid */}
        <div className="grid md:grid-cols-2 gap-8">
          {goals.map((goal, index) => (
            <motion.div
              key={goal.id}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group cursor-hover"
            >
              <div className={`relative bg-gradient-to-br ${goal.bgGradient} rounded-3xl p-8 border-2 ${goal.borderColor} hover:shadow-2xl transition-all duration-300 transform hover:scale-105 overflow-hidden`}>
                {/* Background Pattern */}
                <div className="absolute top-0 right-0 w-32 h-32 opacity-10">
                  <div className={`w-full h-full bg-gradient-to-br ${goal.gradient} rounded-full blur-2xl`} />
                </div>

                {/* Header */}
                <div className="relative z-10 flex items-start justify-between mb-6">
                  <div className="flex items-center space-x-4">
                    <div className={`w-16 h-16 bg-gradient-to-r ${goal.gradient} rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      <goal.icon className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        {goal.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300">
                        {goal.description}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Features */}
                <div className="relative z-10 mb-6">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Key Features:</h4>
                  <div className="grid grid-cols-2 gap-3">
                    {goal.features.map((feature) => (
                      <div key={feature} className="flex items-center space-x-2">
                        <div className={`w-2 h-2 bg-gradient-to-r ${goal.gradient} rounded-full`} />
                        <span className="text-sm text-gray-700 dark:text-gray-300">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Stats */}
                <div className="relative z-10 flex items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
                  <div className="text-center">
                    <div className="text-lg font-bold text-gray-900 dark:text-white">
                      {Object.values(goal.stats)[0]}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {Object.keys(goal.stats)[0].replace(/([A-Z])/g, ' $1').toLowerCase()}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-gray-900 dark:text-white">
                      {Object.values(goal.stats)[1]}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {Object.keys(goal.stats)[1].replace(/([A-Z])/g, ' $1').toLowerCase()}
                    </div>
                  </div>
                  <button className={`px-6 py-2 bg-gradient-to-r ${goal.gradient} text-white rounded-xl font-medium hover:shadow-lg transition-all duration-300 transform hover:scale-105`}>
                    Choose Plan
                  </button>
                </div>

                {/* Hover Effect */}
                <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${goal.gradient} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left`} />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Medical Disclaimer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="mt-12 p-6 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-2xl"
        >
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center mt-0.5">
              <span className="text-white text-sm font-bold">!</span>
            </div>
            <div>
              <h4 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
                Medical Disclaimer
              </h4>
              <p className="text-yellow-700 dark:text-yellow-300 text-sm leading-relaxed">
                SmartBite provides nutritional guidance and meal planning suggestions. 
                This is not medical advice. Always consult with healthcare professionals 
                before making significant dietary changes, especially if you have medical conditions.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default UserGoalsSection
