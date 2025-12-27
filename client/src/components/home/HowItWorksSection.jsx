import { motion } from 'framer-motion'
import { User, Brain, Calendar } from 'lucide-react'

const steps = [
  {
    icon: User,
    title: 'Enter Profile',
    description: 'Tell us about your body, goals, dietary preferences, and any health conditions.',
    color: 'from-blue-500 to-blue-600',
    bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    borderColor: 'border-blue-200 dark:border-blue-800'
  },
  {
    icon: Brain,
    title: 'AI Analysis',
    description: 'Our ML models analyze your data and find the perfect nutritional balance for you.',
    color: 'from-primary-500 to-primary-600',
    bgColor: 'bg-primary-50 dark:bg-primary-900/20',
    borderColor: 'border-primary-200 dark:border-primary-800'
  },
  {
    icon: Calendar,
    title: 'Smart Meal Plan',
    description: 'Get a personalized weekly plan with recipes, macros, and shopping lists.',
    color: 'from-secondary-500 to-secondary-600',
    bgColor: 'bg-secondary-50 dark:bg-secondary-900/20',
    borderColor: 'border-secondary-200 dark:border-secondary-800'
  }
]

const HowItWorksSection = () => {
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
            How It Works
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Three simple steps to transform your nutrition with AI-powered personalization
          </p>
        </motion.div>

        {/* Steps Grid */}
        <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
          {steps.map((step, index) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              viewport={{ once: true }}
              className="relative"
            >
              {/* Connection Line (Desktop) */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-16 left-full w-full h-0.5 bg-gradient-to-r from-gray-300 to-transparent dark:from-gray-600 z-0" />
              )}

              {/* Step Card */}
              <div className={`relative z-10 ${step.bgColor} ${step.borderColor} border-2 rounded-3xl p-8 text-center hover:shadow-xl transition-all duration-300 transform hover:scale-105`}>
                {/* Step Number */}
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className={`w-8 h-8 bg-gradient-to-r ${step.color} rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg`}>
                    {index + 1}
                  </div>
                </div>

                {/* Icon */}
                <div className={`w-16 h-16 bg-gradient-to-r ${step.color} rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg`}>
                  <step.icon className="h-8 w-8 text-white" />
                </div>

                {/* Content */}
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  {step.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <button className="bg-gradient-to-r from-primary-600 to-secondary-600 text-white px-8 py-4 rounded-2xl font-semibold text-lg hover:shadow-2xl hover:shadow-primary-500/25 transition-all duration-300 transform hover:scale-105">
            Start Your Journey
          </button>
        </motion.div>
      </div>
    </section>
  )
}

export default HowItWorksSection
