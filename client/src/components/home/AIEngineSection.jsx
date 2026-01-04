import { motion } from 'framer-motion'
import { Brain, Database, Shield, TrendingUp } from 'lucide-react'

const aiFeatures = [
  {
    icon: Database,
    title: 'Content-Based Filtering',
    description: 'Advanced algorithms analyze ingredients, nutrition profiles, and meal similarities to find perfect matches for your preferences.',
    color: 'text-blue-600 dark:text-blue-400'
  },
  {
    icon: TrendingUp,
    title: 'ML Optimization Models',
    description: 'Machine learning models continuously optimize meal recommendations based on your feedback and nutritional outcomes.',
    color: 'text-primary-600 dark:text-primary-400'
  },
  {
    icon: Shield,
    title: 'Health Condition Constraints',
    description: 'Specialized algorithms ensure all recommendations comply with your medical dietary restrictions and health goals.',
    color: 'text-red-600 dark:text-red-400'
  },
  {
    icon: Brain,
    title: 'Continuous Learning',
    description: 'Our AI learns from your choices, preferences, and results to provide increasingly personalized recommendations.',
    color: 'text-secondary-600 dark:text-secondary-400'
  }
]

const AIEngineSection = () => {
  return (
    <section className="py-20 bg-white dark:bg-gray-900 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5 dark:opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%2322c55e' fill-opacity='0.3'%3E%3Cpath d='M20 20c0-5.5-4.5-10-10-10s-10 4.5-10 10 4.5 10 10 10 10-4.5 10-10zm10 0c0-5.5-4.5-10-10-10s-10 4.5-10 10 4.5 10 10 10 10-4.5 10-10z'/%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <div className="mb-8">
              <div className="inline-flex items-center space-x-2 bg-primary-50 dark:bg-primary-900/20 px-4 py-2 rounded-full border border-primary-200 dark:border-primary-800 mb-6">
                <Brain className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                <span className="text-primary-700 dark:text-primary-300 font-medium">AI Engine</span>
              </div>
              
              <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6">
                Powered by Advanced{' '}
                <span className="bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                  AI Technology
                </span>
              </h2>
              
              <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
                Our cutting-edge AI engine combines multiple machine learning models, 
                nutritional science, and personalization algorithms to deliver the most 
                accurate and effective meal recommendations.
              </p>
            </div>

            {/* AI Features List */}
            <div className="space-y-6">
              {aiFeatures.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="flex items-start space-x-4 group"
                >
                  <div className={`flex-shrink-0 w-12 h-12 rounded-xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className={`h-6 w-6 ${feature.color}`} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right Visual */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            className="relative"
          >
            {/* AI Brain Visualization */}
            <div className="relative">
              {/* Main Brain Container */}
              <div className="relative w-full h-96 bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-primary-900/20 dark:to-secondary-900/20 rounded-3xl overflow-hidden border border-primary-200 dark:border-primary-800">
                {/* Neural Network Pattern */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.div
                    animate={{ 
                      rotate: 360,
                    }}
                    transition={{ 
                      duration: 20,
                      repeat: Infinity,
                      ease: "linear"
                    }}
                    className="w-64 h-64 relative"
                  >
                    {/* Neural Nodes */}
                    {[...Array(8)].map((_, i) => (
                      <motion.div
                        key={i}
                        animate={{
                          scale: [1, 1.2, 1],
                          opacity: [0.6, 1, 0.6]
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          delay: i * 0.25,
                          ease: "easeInOut"
                        }}
                        className="absolute w-4 h-4 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full"
                        style={{
                          top: `${50 + 40 * Math.sin((i * Math.PI * 2) / 8)}%`,
                          left: `${50 + 40 * Math.cos((i * Math.PI * 2) / 8)}%`,
                          transform: 'translate(-50%, -50%)'
                        }}
                      />
                    ))}
                    
                    {/* Center Brain */}
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                      <motion.div
                        animate={{ 
                          scale: [1, 1.1, 1],
                          rotate: [0, 5, -5, 0]
                        }}
                        transition={{ 
                          duration: 3,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                        className="w-20 h-20 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-full flex items-center justify-center shadow-2xl"
                      >
                        <Brain className="h-10 w-10 text-white" />
                      </motion.div>
                    </div>
                  </motion.div>
                </div>

                {/* Floating Data Points */}
                <motion.div
                  animate={{ 
                    y: [0, -20, 0],
                    x: [0, 10, 0]
                  }}
                  transition={{ 
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="absolute top-8 left-8 bg-white dark:bg-gray-800 p-3 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700"
                >
                  <div className="text-xs font-medium text-gray-900 dark:text-white">Protein: 25g</div>
                  <div className="text-xs text-primary-600 dark:text-primary-400">Optimized ✓</div>
                </motion.div>

                <motion.div
                  animate={{ 
                    y: [0, 15, 0],
                    x: [0, -10, 0]
                  }}
                  transition={{ 
                    duration: 3.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 1
                  }}
                  className="absolute bottom-8 right-8 bg-white dark:bg-gray-800 p-3 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700"
                >
                  <div className="text-xs font-medium text-gray-900 dark:text-white">Calories: 520</div>
                  <div className="text-xs text-secondary-600 dark:text-secondary-400">Perfect Match</div>
                </motion.div>
              </div>

              {/* Decorative Elements */}
              <div className="absolute -top-6 -right-6 w-32 h-32 bg-gradient-to-r from-primary-400 to-secondary-400 rounded-full opacity-20 blur-2xl" />
              <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-gradient-to-r from-secondary-400 to-primary-400 rounded-full opacity-20 blur-2xl" />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

export default AIEngineSection
