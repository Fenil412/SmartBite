import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, X, Sparkles, Heart, Zap } from 'lucide-react'
import useMagneticEffect from '../hooks/useMagneticEffect'

const FloatingActionButton = () => {
  const [isOpen, setIsOpen] = useState(false)
  const mainButtonRef = useMagneticEffect(0.3)

  const actions = [
    {
      icon: MessageCircle,
      label: 'AI Chat',
      color: 'from-blue-500 to-blue-600',
      action: () => console.log('AI Chat clicked')
    },
    {
      icon: Sparkles,
      label: 'Quick Plan',
      color: 'from-primary-500 to-primary-600',
      action: () => console.log('Quick Plan clicked')
    },
    {
      icon: Heart,
      label: 'Favorites',
      color: 'from-red-500 to-red-600',
      action: () => console.log('Favorites clicked')
    },
    {
      icon: Zap,
      label: 'Quick Tips',
      color: 'from-yellow-500 to-yellow-600',
      action: () => console.log('Quick Tips clicked')
    }
  ]

  return (
    <div className="fixed bottom-8 right-8 z-50">
      {/* Action Buttons */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute bottom-20 right-0 flex flex-col gap-3"
          >
            {actions.map((action, index) => (
              <motion.button
                key={action.label}
                initial={{ scale: 0, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0, y: 20 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => {
                  action.action()
                  setIsOpen(false)
                }}
                className={`group flex items-center space-x-3 bg-gradient-to-r ${action.color} text-white px-4 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 cursor-hover magnetic`}
              >
                <action.icon className="h-5 w-5" />
                <span className="text-sm font-medium whitespace-nowrap">{action.label}</span>
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main FAB */}
      <motion.button
        ref={mainButtonRef}
        onClick={() => setIsOpen(!isOpen)}
        className="w-16 h-16 bg-gradient-to-r from-primary-600 to-secondary-600 text-white rounded-full shadow-lg hover:shadow-2xl transition-all duration-300 flex items-center justify-center cursor-hover magnetic"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <X className="h-6 w-6" />
            </motion.div>
          ) : (
            <motion.div
              key="menu"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Sparkles className="h-6 w-6" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  )
}

export default FloatingActionButton