import { motion } from 'framer-motion'
import { 
  Target, 
  Calendar, 
  BarChart3, 
  Heart, 
  Utensils, 
  Zap 
} from 'lucide-react'

const features = [
  {
    icon: Target,
    title: 'Personalized Recommendations',
    description: 'AI analyzes your body composition, goals, and preferences to suggest perfect meals.',
    gradient: 'from-pink-500 to-rose-500'
  },
  {
    icon: Calendar,
    title: 'Weekly Diet Planner',
    description: 'Get complete weekly meal plans with recipes, prep instructions, and shopping lists.',
    gradient: 'from-primary-500 to-green-500'
  },
  {
    icon: BarChart3,
    title: 'Macro & Calorie Tracking',
    description: 'Automatically track your nutrition intake with detailed macro and micronutrient analysis.',
    gradient: 'from-blue-500 to-cyan-500'
  },
  {
    icon: Heart,
    title: 'Disease-Aware Nutrition',
    description: 'Specialized meal plans for diabetes, heart conditions, and other health requirements.',
    gradient: 'from-red-500 to-pink-500'
  },
  {
    icon: Utensils,
    title: 'Multi-Diet Support',
    description: 'Support for keto, vegan, Mediterranean, paleo, and other popular diet approaches.',
    gradient: 'from-secondary-500 to-teal-500'
  },
  {
    icon: Zap,
    title: 'Fast AI Response',
    description: 'Get instant meal suggestions and nutrition advice powered by advanced AI models.',
    gradient: 'from-yellow-500 to-orange-500'
  }
]

const FeaturesSection = () => {
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
            Powerful Features
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Everything you need to achieve your nutrition goals with AI-powered precision
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group"
            >
              <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 border border-gray-200 dark:border-gray-700">
                {/* Icon */}
                <div className={`w-16 h-16 bg-gradient-to-r ${feature.gradient} rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="h-8 w-8 text-white" />
                </div>

                {/* Content */}
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  {feature.description}
                </p>

                {/* Hover Effect */}
                <div className={`mt-6 h-1 bg-gradient-to-r ${feature.gradient} rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left`} />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="mt-20 grid grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {[
            { number: '10K+', label: 'Meal Recipes' },
            { number: '95%', label: 'User Satisfaction' },
            { number: '24/7', label: 'AI Support' },
            { number: '50+', label: 'Diet Types' }
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
                <div className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600 dark:text-gray-300 font-medium">
                  {stat.label}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

export default FeaturesSection