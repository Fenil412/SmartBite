import { NavLink, useNavigate } from 'react-router-dom'
import { 
  Home, 
  Calendar, 
  Brain, 
  Target, 
  History, 
  User, 
  Settings,
  X,
  Sun,
  Moon,
  Monitor,
  LogOut,
  BarChart3
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'
import useThemeStore from '../store/themeStore'
import { useState } from 'react'

const navigation = [
  { name: 'Home', href: '/dashboard/home', icon: Home },
  { name: 'Dashboard', href: '/dashboard/analytics', icon: BarChart3 },
  { name: 'Meal Planner', href: '/dashboard/meal-planner', icon: Calendar },
  { name: 'AI Recommendations', href: '/dashboard/ai-recommendations', icon: Brain },
  { name: 'Goals', href: '/dashboard/goals', icon: Target },
  { name: 'History', href: '/dashboard/history', icon: History },
  { name: 'Profile', href: '/dashboard/profile', icon: User },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
]

const ThemeToggle = () => {
  const { theme, setTheme } = useThemeStore()

  const themes = [
    { value: 'light', icon: Sun, label: 'Light' },
    { value: 'dark', icon: Moon, label: 'Dark' },
    { value: 'system', icon: Monitor, label: 'System' },
  ]

  return (
    <div className="flex items-center space-x-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
      {themes.map(({ value, icon: Icon, label }) => (
        <button
          key={value}
          onClick={() => setTheme(value)}
          className={`p-2 rounded-md transition-all duration-200 ${
            theme === value
              ? 'bg-white dark:bg-gray-700 text-primary-600 dark:text-primary-400 shadow-sm'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
          title={label}
        >
          <Icon className="h-4 w-4" />
        </button>
      ))}
    </div>
  )
}

const Sidebar = ({ onClose }) => {
  const { user, logout } = useAuth()
  const { success } = useToast()
  const navigate = useNavigate()
  const [isCollapsed] = useState(true) // Start collapsed, remove setIsCollapsed since it's not used
  const [isHovering, setIsHovering] = useState(false)

  const handleLogout = async () => {
    try {
      await logout()
      success('Logged out successfully')
      navigate('/')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  // Show sidebar on hover when collapsed
  const shouldShowExpanded = !isCollapsed || isHovering

  const handleMouseEnter = () => {
    if (isCollapsed) {
      setIsHovering(true)
      console.log('🖱️ Sidebar hover: expanding')
    }
  }

  const handleMouseLeave = () => {
    if (isCollapsed) {
      setIsHovering(false)
      console.log('🖱️ Sidebar hover: collapsing')
    }
  }

  return (
    <div 
      className={`flex flex-col bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 h-full transition-all duration-300 ease-in-out ${
        shouldShowExpanded ? 'w-70' : 'w-20'
      }`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Header */}
      <div className="flex items-center justify-center p-6 border-b border-gray-200 dark:border-gray-700">
        <AnimatePresence>
          {shouldShowExpanded ? (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="w-full"
            >
              <NavLink 
                to="/dashboard/home" 
                className="flex items-center space-x-3 hover:opacity-80 transition-opacity"
                onClick={() => {
                  console.log('🏠 SmartBite logo clicked - navigating to Dashboard Home')
                  onClose && onClose()
                }}
              >
                <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-lg">S</span>
                </div>
                <div>
                  <h1 className="font-bold text-xl text-gray-900 dark:text-white">SmartBite</h1>
                  <p className="text-xs text-gray-500 dark:text-gray-400">AI-Powered Nutrition</p>
                </div>
              </NavLink>
            </motion.div>
          ) : (
            <NavLink 
              to="/dashboard/home"
              className="w-12 h-12 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center hover:scale-105 transition-transform"
              title="SmartBite - Go to Home"
            >
              <span className="text-white font-bold text-xl">S</span>
            </NavLink>
          )}
        </AnimatePresence>

        {/* Mobile Close Button */}
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-6 right-6 p-2 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* User Info */}
      {user && shouldShowExpanded && (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2, delay: 0.1 }}
            className="p-4 border-b border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center">
                {user.avatar?.url ? (
                  <img
                    src={user.avatar.url}
                    alt="Profile"
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <User className="h-5 w-5 text-white" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {user.fullName || user.name || 'User'}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {user.email}
                </p>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      )}

      {/* Collapsed User Avatar */}
      {user && !shouldShowExpanded && (
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-center">
          <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center hover:scale-105 transition-transform">
            {user.avatar?.url ? (
              <img
                src={user.avatar.url}
                alt="Profile"
                className="w-10 h-10 rounded-full object-cover"
                title={user.fullName || user.name || 'User Profile'}
              />
            ) : (
              <User className="h-5 w-5 text-white" title="User Profile" />
            )}
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-2 py-6 space-y-1">
        {navigation.map((item, index) => (
          <NavLink
            key={item.name}
            to={item.href}
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center px-3 py-3 text-sm font-medium rounded-xl transition-all duration-200 group relative ${
                isActive
                  ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 border border-primary-200 dark:border-primary-800'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-white'
              } ${!shouldShowExpanded ? 'justify-center px-2' : ''}`
            }
            title={!shouldShowExpanded ? item.name : ''}
          >
            {({ isActive }) => (
              <>
                <item.icon
                  className={`h-5 w-5 transition-colors ${
                    isActive
                      ? 'text-primary-600 dark:text-primary-400'
                      : 'text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300'
                  } ${!shouldShowExpanded ? '' : 'mr-3'}`}
                />
                <AnimatePresence>
                  {shouldShowExpanded && (
                    <motion.span
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ duration: 0.2, delay: index * 0.02 }}
                      className="truncate"
                    >
                      {item.name}
                    </motion.span>
                  )}
                </AnimatePresence>
                {isActive && shouldShowExpanded && (
                  <motion.div
                    layoutId="activeTab"
                    className="ml-auto w-2 h-2 bg-primary-500 rounded-full"
                    initial={false}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}
                {isActive && !shouldShowExpanded && (
                  <div className="absolute right-1 top-1/2 transform -translate-y-1/2 w-1 h-6 bg-primary-500 rounded-full" />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-4">
        {/* Theme Toggle */}
        {shouldShowExpanded && (
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.2 }}
            >
              <ThemeToggle />
            </motion.div>
          </AnimatePresence>
        )}

        {/* Logout Button */}
        {user && (
          <button
            onClick={handleLogout}
            className={`w-full flex items-center space-x-3 px-3 py-3 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors ${
              !shouldShowExpanded ? 'justify-center px-2' : ''
            }`}
            title={!shouldShowExpanded ? 'Sign Out' : ''}
          >
            <LogOut className="h-5 w-5" />
            <AnimatePresence>
              {shouldShowExpanded && (
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  Sign Out
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        )}

        {/* Copyright */}
        {shouldShowExpanded && (
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.2, delay: 0.1 }}
              className="text-xs text-gray-500 dark:text-gray-400 text-center"
            >
              <p>© 2024 SmartBite</p>
              <p className="mt-1">AI-Powered • Science-Based</p>
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>
  )
}

export default Sidebar