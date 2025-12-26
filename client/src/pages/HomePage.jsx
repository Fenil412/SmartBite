import { motion } from 'framer-motion'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import HeroSection from '../components/home/HeroSection'
import HowItWorksSection from '../components/home/HowItWorksSection'
import FeaturesSection from '../components/home/FeaturesSection'
import AIEngineSection from '../components/home/AIEngineSection'
import SampleMealsSection from '../components/home/SampleMealsSection'
import UserGoalsSection from '../components/home/UserGoalsSection'
import CTASection from '../components/home/CTASection'
import Footer from '../components/Footer'

const HomePage = () => {
  const { isAuthenticated, loading } = useAuth()

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading SmartBite...</p>
        </div>
      </div>
    )
  }

  // If user is authenticated, redirect to dashboard
  if (isAuthenticated) {
    return <Navigate to="/dashboard/home" replace />
  }

  // Show public homepage with auth buttons
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen"
    >
      {/* Main Content - No Navigation Bar */}
      <div>
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

export default HomePage