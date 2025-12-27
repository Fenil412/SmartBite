import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import HeroSection from '../components/home/HeroSection'
import HowItWorksSection from '../components/home/HowItWorksSection'
import FeaturesSection from '../components/home/FeaturesSection'
import AIEngineSection from '../components/home/AIEngineSection'
import SampleMealsSection from '../components/home/SampleMealsSection'
import UserGoalsSection from '../components/home/UserGoalsSection'
import CTASection from '../components/home/CTASection'
import Footer from '../components/Footer'

const DashboardHomePage = () => {
  const { user } = useAuth()
  const [showWelcomeBanner, setShowWelcomeBanner] = useState(true)

  useEffect(() => {
    console.log('🏠 User navigated to Dashboard Home page')
    
    // Auto-dismiss banner after 10 seconds
    const timer = setTimeout(() => {
      setShowWelcomeBanner(false)
    }, 10000)

    return () => clearTimeout(timer)
  }, [])

  const handleCloseBanner = () => {
    setShowWelcomeBanner(false)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gray-50 dark:bg-gray-900"
    >
      {/* Welcome Banner for Authenticated Users */}
      <AnimatePresence>
        {showWelcomeBanner && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            transition={{ duration: 0.3 }}
            className="bg-gradient-to-r from-primary-600 to-secondary-600 text-white py-4 px-6 relative"
          >
            <div className="max-w-7xl mx-auto flex items-center justify-between">
              <p className="text-center text-lg flex-1">
                Welcome back, <span className="font-semibold">{user?.fullName || user?.name || 'User'}</span>! 
                Explore SmartBite's features and plan your perfect nutrition journey.
              </p>
              <button
                onClick={handleCloseBanner}
                className="ml-4 p-1 hover:bg-white/20 rounded-full transition-colors"
                aria-label="Close welcome banner"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="overflow-y-auto">
        <HeroSection />
        <HowItWorksSection />
        <FeaturesSection />
        <AIEngineSection />
        <SampleMealsSection />
        <UserGoalsSection />
        <CTASection />
        <Footer />
      </div>
    </motion.div>
  )
}

export default DashboardHomePage
