import { motion } from 'framer-motion'
import { Link, useLocation } from 'react-router-dom'
import { ArrowRight, Sparkles, Shield, Zap, ShoppingCart } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import useMagneticEffect from '../../hooks/useMagneticEffect'
import useScrollReveal from '../../hooks/useScrollReveal'

const HeroSection = () => {
  const { isAuthenticated } = useAuth()
  const location = useLocation()
  const isDashboardView = location.pathname.startsWith('/dashboard/')
  const primaryButtonRef = useMagneticEffect(0.2)
  const secondaryButtonRef = useMagneticEffect(0.15)
  const heroContentRef = useScrollReveal({ direction: 'up', delay: 200 })
  const heroVisualRef = useScrollReveal({ direction: 'right', delay: 400 })

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5 dark:opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2322c55e' fill-opacity='0.4'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      {/* Floating Orbs */}
      <motion.div
        animate={{ 
          y: [0, -30, 0],
          x: [0, 15, 0],
          rotate: [0, 180, 360]
        }}
        transition={{ 
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute top-20 left-20 w-32 h-32 bg-gradient-to-r from-primary-400/20 to-secondary-400/20 rounded-full blur-xl"
      />
      
      <motion.div
        animate={{ 
          y: [0, 20, 0],
          x: [0, -10, 0],
          rotate: [360, 180, 0]
        }}
        transition={{ 
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2
        }}
        className="absolute bottom-32 right-32 w-24 h-24 bg-gradient-to-r from-secondary-400/20 to-primary-400/20 rounded-full blur-xl"
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div ref={heroContentRef} className="text-center lg:text-left">
            {/* Trust Indicators */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-wrap justify-center lg:justify-start gap-4 mb-8"
            >
              <div className="flex items-center space-x-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm px-4 py-2 rounded-full border border-primary-200 dark:border-primary-800 magnetic">
                <Sparkles className="h-4 w-4 text-primary-600" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">AI-Powered</span>
              </div>
              <div className="flex items-center space-x-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm px-4 py-2 rounded-full border border-secondary-200 dark:border-secondary-800 magnetic">
                <Shield className="h-4 w-4 text-secondary-600" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Science-Based</span>
              </div>
              <div className="flex items-center space-x-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm px-4 py-2 rounded-full border border-primary-200 dark:border-primary-800 magnetic">
                <Zap className="h-4 w-4 text-primary-600" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Personalized</span>
              </div>
            </motion.div>

            {/* Main Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="text-5xl lg:text-7xl font-bold text-gray-900 dark:text-white mb-6 leading-tight"
            >
              Smart nutrition,{' '}
              <span className="bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                personalized by AI
              </span>
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="text-xl lg:text-2xl text-gray-600 dark:text-gray-300 mb-10 leading-relaxed"
            >
              AI-driven meal plans tailored to your body, goals, and lifestyle. 
              Transform your nutrition with science-backed recommendations.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1 }}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
            >
              {isAuthenticated && isDashboardView ? (
                <>
                  <Link
                    to="/dashboard/meal-planner"
                    ref={primaryButtonRef}
                    className="group bg-gradient-to-r from-primary-600 to-secondary-600 text-white px-8 py-4 rounded-2xl font-semibold text-lg hover:shadow-2xl hover:shadow-primary-500/25 transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-2 ripple magnetic cursor-hover"
                  >
                    <span>Start Meal Planning</span>
                    <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  
                  <Link
                    to="/dashboard/grocery"
                    ref={secondaryButtonRef}
                    className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-8 py-4 rounded-2xl font-semibold text-lg border-2 border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-600 hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-2 magnetic cursor-hover"
                  >
                    <ShoppingCart className="h-5 w-5" />
                    <span>Smart Grocery</span>
                  </Link>
                </>
              ) : isAuthenticated ? (
                <>
                  <Link
                    to="/dashboard/analytics"
                    ref={primaryButtonRef}
                    className="group bg-gradient-to-r from-primary-600 to-secondary-600 text-white px-8 py-4 rounded-2xl font-semibold text-lg hover:shadow-2xl hover:shadow-primary-500/25 transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-2 ripple magnetic cursor-hover"
                  >
                    <span>Go to Dashboard</span>
                    <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  
                  <Link
                    to="/dashboard/meal-planner"
                    ref={secondaryButtonRef}
                    className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-8 py-4 rounded-2xl font-semibold text-lg border-2 border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-600 hover:shadow-xl transition-all duration-300 transform hover:scale-105 magnetic cursor-hover"
                  >
                    Plan Meals
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/signup"
                    ref={primaryButtonRef}
                    className="group bg-gradient-to-r from-primary-600 to-secondary-600 text-white px-8 py-4 rounded-2xl font-semibold text-lg hover:shadow-2xl hover:shadow-primary-500/25 transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-2 ripple magnetic cursor-hover"
                  >
                    <span>Get Started Free</span>
                    <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  
                  <Link
                    to="/login"
                    ref={secondaryButtonRef}
                    className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-8 py-4 rounded-2xl font-semibold text-lg border-2 border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-600 hover:shadow-xl transition-all duration-300 transform hover:scale-105 magnetic cursor-hover"
                  >
                    Sign In
                  </Link>
                </>
              )}
            </motion.div>
          </div>

          {/* Right Visual */}
          <div ref={heroVisualRef} className="relative">
            {/* Placeholder for 3D Visual or Image */}
            <div className="relative">
              {/* Main Visual Container */}
              <div className="relative w-full h-96 lg:h-[500px] bg-gradient-to-br from-primary-100 to-secondary-100 dark:from-primary-900/20 dark:to-secondary-900/20 rounded-3xl overflow-hidden border border-primary-200 dark:border-primary-800 magnetic">
                {/* Floating Cards Animation */}
                <motion.div
                  animate={{ 
                    y: [0, -10, 0],
                    rotate: [0, 2, 0]
                  }}
                  transition={{ 
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="absolute top-8 left-8 bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 cursor-hover"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center">
                      <span className="text-white font-bold">🥗</span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">Mediterranean Bowl</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">520 cal • 25g protein</p>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  animate={{ 
                    y: [0, 10, 0],
                    rotate: [0, -2, 0]
                  }}
                  transition={{ 
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 1
                  }}
                  className="absolute bottom-8 right-8 bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 cursor-hover"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-secondary-500 to-primary-500 rounded-xl flex items-center justify-center">
                      <span className="text-white font-bold">🍎</span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">Smart Snack</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">150 cal • Perfect timing</p>
                    </div>
                  </div>
                </motion.div>

                {/* Center AI Brain Illustration */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.div
                    animate={{ 
                      scale: [1, 1.05, 1],
                      opacity: [0.8, 1, 0.8]
                    }}
                    transition={{ 
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    className="w-32 h-32 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center shadow-2xl cursor-hover magnetic"
                  >
                    <span className="text-4xl">🧠</span>
                  </motion.div>
                </div>
              </div>

              {/* Decorative Elements */}
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-r from-primary-400 to-secondary-400 rounded-full opacity-20 blur-xl" />
              <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-gradient-to-r from-secondary-400 to-primary-400 rounded-full opacity-20 blur-xl" />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default HeroSection
