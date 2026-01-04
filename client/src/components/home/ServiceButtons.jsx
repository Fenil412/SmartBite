import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { 
  MessageCircle, 
  Sparkles, 
  Heart, 
  Zap,
  ChevronRight,
  X,
  Menu
} from 'lucide-react'

const ServiceButtons = () => {
  const navigate = useNavigate()
  const [isOpen, setIsOpen] = useState(false)

  const services = [
    {
      id: 'ai-chat',
      name: 'AI Chat',
      icon: MessageCircle,
      bgColor: 'bg-blue-500',
      route: '/dashboard/ai/chat'
    },
    {
      id: 'quick-plan',
      name: 'Quick Plan',
      icon: Sparkles,
      bgColor: 'bg-green-500',
      route: '/dashboard/meal-planner'
    },
    {
      id: 'favorites',
      name: 'Favorites',
      icon: Heart,
      bgColor: 'bg-red-500',
      route: '/dashboard/meals/my-meals'
    },
    {
      id: 'quick-tips',
      name: 'Quick Tips',
      icon: Zap,
      bgColor: 'bg-gradient-to-r from-yellow-500 to-orange-500',
      route: '/dashboard/feedback'
    }
  ]

  const handleServiceClick = (service) => {
    navigate(service.route)
    setIsOpen(false)
  }

  const toggleMenu = () => {
    setIsOpen(!isOpen)
  }

  return (
    <>
      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Main Container */}
      <div className="fixed bottom-8 right-8 z-50">
        {/* Service Buttons */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col space-y-4 mb-4"
            >
              {services.map((service, index) => {
                const IconComponent = service.icon
                return (
                  <motion.div
                    key={service.id}
                    initial={{ opacity: 0, scale: 0, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0, y: 20 }}
                    transition={{ 
                      delay: index * 0.1,
                      type: "spring",
                      stiffness: 300,
                      damping: 20
                    }}
                    className="relative"
                  >
                    <button
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        handleServiceClick(service)
                      }}
                      className={`${service.bgColor} text-white px-4 py-3 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center space-x-2 min-w-[160px] group`}
                    >
                      <IconComponent className="h-5 w-5" />
                      <span className="font-semibold text-base">{service.name}</span>
                      <motion.div
                        whileHover={{ scale: 1.2, rotate: 90 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </motion.div>
                    </button>
                  </motion.div>
                )
              })}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Toggle Button */}
        <motion.button
          onClick={toggleMenu}
          className="bg-gradient-to-r from-primary-600 to-secondary-600 text-white p-3 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <motion.div
            animate={{ rotate: isOpen ? 45 : 0 }}
            transition={{ duration: 0.2 }}
          >
            {isOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </motion.div>
        </motion.button>
      </div>
    </>
  )
}

export default ServiceButtons