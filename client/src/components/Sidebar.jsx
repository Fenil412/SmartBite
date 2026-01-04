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
  BarChart3,
  UtensilsCrossed,
  ChefHat,
  Sliders,
  MessageSquare,
  Bell,
  Sparkles,
  ShoppingCart,
  Apple,
  ChevronDown,
  ChevronRight,
  Shield,
  // AI Icons
  Bot,
  Heart,
  AlertTriangle,
  FileText,
  Clock
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'
import { useNotifications } from '../contexts/NotificationContext'
import useThemeStore from '../store/themeStore'
import { useState, useEffect } from 'react'

const navigation = [
  { name: 'Home', href: '/dashboard/home', icon: Home },
  { name: 'Dashboard', href: '/dashboard/analytics', icon: BarChart3 },
  { name: 'AI Dashboard', href: '/dashboard/ai', icon: Brain },
  { name: 'Meal Planner', href: '/dashboard/meal-planner', icon: Calendar },
  { name: 'Browse Meals', href: '/dashboard/meals', icon: UtensilsCrossed, end: true },
  { name: 'Smart Grocery', href: '/dashboard/grocery', icon: ShoppingCart },
  { name: 'Profile', href: '/dashboard/profile', icon: User },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
]

// Secondary Navigation - Additional Features
const secondaryNavigation = [
  { 
    name: 'More', 
    icon: History, 
    subItems: [
      { name: 'My Meals', href: '/dashboard/meals/my-meals', icon: ChefHat },
      { name: 'Notifications', href: '/dashboard/notifications', icon: Bell },
      { name: 'History', href: '/dashboard/history', icon: History },
      { name: 'About', href: '/dashboard/about', icon: Apple },
      { name: 'Constraints', href: '/dashboard/constraints', icon: Sliders },
      { name: 'Feedback', href: '/dashboard/feedback', icon: MessageSquare },
    ]
  }
]

// AI Features Navigation
const aiNavigation = [
  { name: 'AI Chat', href: '/dashboard/ai/chat', icon: Bot, description: 'Chat with AI nutritionist' },
  { name: 'Meal Analysis', href: '/dashboard/ai/meal-analysis', icon: BarChart3, description: 'Analyze meal nutrition' },
  { name: 'Weekly Planner', href: '/dashboard/ai/weekly-plan', icon: Calendar, description: 'Generate weekly meal plans' },
  { name: 'Health Risk Report', href: '/dashboard/ai/health-risk', icon: AlertTriangle, description: 'Assess health risks' },
  { name: 'Weekly Summary', href: '/dashboard/ai/weekly-summary', icon: FileText, description: 'Summarize meal plans' },
  { name: 'Nutrition Impact', href: '/dashboard/ai/nutrition-impact', icon: Heart, description: 'Analyze nutrition impact' },
  { name: 'AI History', href: '/dashboard/ai/history', icon: Clock, description: 'View AI interactions' },
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
  const { unreadCount } = useNotifications()
  const navigate = useNavigate()
  const [isCollapsed] = useState(true) // Start collapsed
  const [isHovering, setIsHovering] = useState(false)
  const [expandedSection, setExpandedSection] = useState(null)
  const [activeTooltip, setActiveTooltip] = useState(null)
  const [isMobile, setIsMobile] = useState(false)
  const [isTablet, setIsTablet] = useState(false)

  // Enhanced device detection
  useEffect(() => {
    const checkDevice = () => {
      const width = window.innerWidth
      setIsMobile(width <= 640) // Mobile: show names instead of icons
      setIsTablet(width > 640 && width <= 1024) // Tablet: show tooltips
    }
    
    checkDevice()
    window.addEventListener('resize', checkDevice)
    return () => window.removeEventListener('resize', checkDevice)
  }, [])

  const handleLogout = async () => {
    try {
      await logout()
      success('Logged out successfully')
      navigate('/')
    } catch (error) {
      // Logout error - continue anyway
    }
  }

  // Show sidebar on hover when collapsed (desktop only)
  const shouldShowExpanded = !isCollapsed || isHovering || isMobile

  const handleMouseEnter = () => {
    if (isCollapsed && !isMobile) {
      setIsHovering(true)
    }
  }

  const handleMouseLeave = () => {
    if (isCollapsed && !isMobile) {
      setIsHovering(false)
      setActiveTooltip(null)
    }
  }

  // Handle tooltip for tablet only
  const handleTooltipToggle = (itemName) => {
    if (isTablet && !shouldShowExpanded) {
      setActiveTooltip(activeTooltip === itemName ? null : itemName)
      // Auto-hide tooltip after 2 seconds
      setTimeout(() => {
        setActiveTooltip(null)
      }, 2000)
    }
  }

  // Enhanced tooltip component (only for tablet)
  const TooltipWrapper = ({ children, tooltip, itemName, className = "" }) => {
    const isActive = activeTooltip === itemName
    
    // Only show tooltips on tablet when sidebar is collapsed
    if (!isTablet || shouldShowExpanded) {
      return <div className={className}>{children}</div>
    }
    
    return (
      <div 
        className={`sidebar-tooltip ${className} ${isActive ? 'tooltip-active' : ''}`}
        data-tooltip={tooltip}
        onClick={() => handleTooltipToggle(itemName)}
        onTouchStart={() => handleTooltipToggle(itemName)}
      >
        {children}
      </div>
    )
  }

  return (
    <>
      {/* Mobile/Tablet Overlay */}
      {isMobile && shouldShowExpanded && (
        <div 
          className="sidebar-overlay sidebar-overlay-open"
          onClick={onClose}
        />
      )}
      
      <div 
        className={`sidebar-mobile-enhanced flex flex-col bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 h-full transition-all duration-300 ease-in-out ${
          shouldShowExpanded ? 'w-70' : isMobile ? 'w-full' : 'w-20'
        } ${isMobile && shouldShowExpanded ? 'sidebar-open' : ''}`}
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
                  onClose && onClose()
                }}
              >
                <img 
                  src="/logo.svg" 
                  alt="SmartBite Logo" 
                  className="w-10 h-10 object-contain"
                  onError={(e) => {
                    // Fallback to gradient background if logo fails to load
                    e.target.style.display = 'none';
                    e.target.nextElementSibling.style.display = 'flex';
                  }}
                />
                <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center" style={{display: 'none'}}>
                  <span className="text-white font-bold text-lg">S</span>
                </div>
                <div>
                  <h1 className="font-bold text-xl text-gray-900 dark:text-white">SmartBite</h1>
                  <p className="text-xs text-gray-500 dark:text-gray-400">AI-Powered Nutrition</p>
                </div>
              </NavLink>
            </motion.div>
          ) : (
            <TooltipWrapper 
              tooltip="SmartBite - Go to Home" 
              itemName="home-logo"
              className="w-12 h-12 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center hover:scale-105 transition-transform"
            >
              <NavLink 
                to="/dashboard/home"
                className="w-full h-full flex items-center justify-center"
              >
                <img 
                  src="/logo.svg" 
                  alt="SmartBite Logo" 
                  className="w-8 h-8 object-contain"
                  onError={(e) => {
                    // Fallback to text if logo fails to load
                    e.target.style.display = 'none';
                    e.target.nextElementSibling.style.display = 'inline';
                  }}
                />
                <span className="text-white font-bold text-xl" style={{display: 'none'}}>S</span>
              </NavLink>
            </TooltipWrapper>
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
          <TooltipWrapper 
            tooltip={`${user.fullName || user.name || 'User'} - ${user.email}`} 
            itemName="user-profile"
            className="w-10 h-10 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center hover:scale-105 transition-transform"
          >
            {user.avatar?.url ? (
              <img
                src={user.avatar.url}
                alt="Profile"
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <User className="h-5 w-5 text-white" />
            )}
          </TooltipWrapper>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-2 py-6 space-y-1 overflow-y-auto">
        {/* Main Navigation */}
        {navigation.map((item, index) => (
          // Mobile: Always show names, Desktop/Tablet: Show based on expansion
          isMobile ? (
            <NavLink
              key={item.name}
              to={item.href}
              end={item.end}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center px-4 py-4 text-base font-medium rounded-xl transition-all duration-200 group relative ${
                  isActive
                    ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 border border-primary-200 dark:border-primary-800'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-white'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon
                    className={`h-6 w-6 mr-4 transition-colors ${
                      isActive
                        ? 'text-primary-600 dark:text-primary-400'
                        : 'text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300'
                    }`}
                  />
                  <span className="truncate text-base font-medium">
                    {item.name}
                  </span>
                  {isActive && (
                    <div className="ml-auto w-2 h-2 bg-primary-500 rounded-full" />
                  )}
                </>
              )}
            </NavLink>
          ) : !shouldShowExpanded ? (
            <TooltipWrapper 
              key={item.name}
              tooltip={item.name} 
              itemName={`nav-${item.name.toLowerCase()}`}
            >
              <NavLink
                to={item.href}
                end={item.end}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center justify-center px-2 py-3 text-sm font-medium rounded-xl transition-all duration-200 group relative ${
                    isActive
                      ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 border border-primary-200 dark:border-primary-800'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-white'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div className="relative">
                      <item.icon
                        className={`h-5 w-5 transition-colors ${
                          isActive
                            ? 'text-primary-600 dark:text-primary-400'
                            : 'text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300'
                        }`}
                      />
                    </div>
                    {isActive && (
                      <div className="absolute right-1 top-1/2 transform -translate-y-1/2 w-1 h-6 bg-primary-500 rounded-full" />
                    )}
                  </>
                )}
              </NavLink>
            </TooltipWrapper>
          ) : (
            <NavLink
              key={item.name}
              to={item.href}
              end={item.end}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center px-3 py-3 text-sm font-medium rounded-xl transition-all duration-200 group relative ${
                  isActive
                    ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 border border-primary-200 dark:border-primary-800'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-white'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className="relative">
                    <item.icon
                      className={`h-5 w-5 mr-3 transition-colors ${
                        isActive
                          ? 'text-primary-600 dark:text-primary-400'
                          : 'text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300'
                      }`}
                    />
                  </div>
                  <AnimatePresence>
                    <motion.span
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ duration: 0.2, delay: index * 0.02 }}
                      className="truncate"
                    >
                      {item.name}
                    </motion.span>
                  </AnimatePresence>
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="ml-auto w-2 h-2 bg-primary-500 rounded-full"
                      initial={false}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    />
                  )}
                </>
              )}
            </NavLink>
          )
        ))}

        {/* Secondary Navigation - More Section */}
        {shouldShowExpanded && secondaryNavigation.map((section) => (
          <div key={section.name} className="pt-2">
            <button
              onClick={() => setExpandedSection(expandedSection === section.name ? null : section.name)}
              className="w-full flex items-center px-3 py-3 text-sm font-medium rounded-xl transition-all duration-200 group text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-white"
            >
              <section.icon className="h-5 w-5 mr-3 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300" />
              <span className="truncate flex-1 text-left">{section.name}</span>
              {expandedSection === section.name ? (
                <ChevronDown className="h-4 w-4 text-gray-400" />
              ) : (
                <ChevronRight className="h-4 w-4 text-gray-400" />
              )}
            </button>
            
            <AnimatePresence>
              {expandedSection === section.name && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="ml-6 mt-1 space-y-1 border-l border-gray-200 dark:border-gray-700 pl-3"
                >
                  {section.subItems.map((subItem, subIndex) => (
                    <NavLink
                      key={subItem.name}
                      to={subItem.href}
                      onClick={onClose}
                      className={({ isActive }) =>
                        `flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 group ${
                          isActive
                            ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-white'
                        }`
                      }
                    >
                      {({ isActive }) => (
                        <>
                          <div className="relative">
                            <subItem.icon
                              className={`h-4 w-4 mr-3 transition-colors ${
                                isActive
                                  ? 'text-primary-600 dark:text-primary-400'
                                  : 'text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300'
                              }`}
                            />
                            {/* Notification Badge for Notifications */}
                            {subItem.name === 'Notifications' && unreadCount > 0 && (
                              <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                                {unreadCount > 99 ? '99+' : unreadCount}
                              </div>
                            )}
                          </div>
                          <motion.span
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            transition={{ duration: 0.2, delay: subIndex * 0.02 }}
                            className="truncate"
                          >
                            {subItem.name}
                          </motion.span>
                          {isActive && (
                            <motion.div
                              layoutId="activeSubTab"
                              className="ml-auto w-2 h-2 bg-primary-500 rounded-full"
                              initial={false}
                              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                            />
                          )}
                        </>
                      )}
                    </NavLink>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}

        {/* Collapsed More Section - Show as single icon */}
        {!shouldShowExpanded && (
          <div className="pt-2">
            <TooltipWrapper 
              tooltip="More Options" 
              itemName="more-options"
              className="w-full flex items-center justify-center px-2 py-3 text-sm font-medium rounded-xl transition-all duration-200 group text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-white"
            >
              <button onClick={() => setExpandedSection('More')}>
                <History className="h-5 w-5 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300" />
              </button>
            </TooltipWrapper>
          </div>
        )}

        {/* AI Features Section */}
        {shouldShowExpanded && (
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              className="pt-6"
            >
              <div className="px-3 mb-3">
                <div className="flex items-center space-x-2">
                  <Brain className="h-4 w-4 text-purple-500" />
                  <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    AI Features
                  </h3>
                </div>
              </div>
              
              {aiNavigation.map((item, index) => (
                <NavLink
                  key={item.name}
                  to={item.href}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 group relative ${
                      isActive
                        ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-purple-50 dark:hover:bg-purple-900/10 hover:text-purple-700 dark:hover:text-purple-300'
                    }`
                  }
                  title={item.description}
                >
                  {({ isActive }) => (
                    <>
                      <item.icon
                        className={`h-4 w-4 mr-3 transition-colors ${
                          isActive
                            ? 'text-purple-600 dark:text-purple-400'
                            : 'text-gray-400 group-hover:text-purple-500 dark:group-hover:text-purple-400'
                        }`}
                      />
                      <motion.span
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ duration: 0.2, delay: index * 0.03 }}
                        className="truncate"
                      >
                        {item.name}
                      </motion.span>
                      {isActive && (
                        <motion.div
                          layoutId="activeAiTab"
                          className="ml-auto w-2 h-2 bg-purple-500 rounded-full"
                          initial={false}
                          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                        />
                      )}
                    </>
                  )}
                </NavLink>
              ))}
            </motion.div>
          </AnimatePresence>
        )}

        {/* Collapsed AI Quick Access */}
        {!shouldShowExpanded && (
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <TooltipWrapper 
              tooltip="AI Chat - Quick Access" 
              itemName="ai-chat-quick"
            >
              <NavLink
                to="/dashboard/ai/chat"
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center justify-center px-2 py-3 text-sm font-medium rounded-xl transition-all duration-200 group ${
                    isActive
                      ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-purple-50 dark:hover:bg-purple-900/10 hover:text-purple-700 dark:hover:text-purple-300'
                  }`
                }
              >
                <Brain className="h-5 w-5" />
              </NavLink>
            </TooltipWrapper>
          </div>
        )}

        {/* Admin Section - Only show for admin users */}
        {user?.roles?.includes('admin') || user?.roles?.includes('super_admin') ? (
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            {shouldShowExpanded && (
              <div className="mb-3">
                <h3 className="px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Administration
                </h3>
              </div>
            )}
            
            {!shouldShowExpanded ? (
              <TooltipWrapper 
                tooltip="Admin Dashboard" 
                itemName="admin-dashboard"
              >
                <NavLink
                  to="/dashboard/admin"
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center justify-center px-2 py-3 text-sm font-medium rounded-xl transition-all duration-200 group ${
                      isActive
                        ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-900/10 hover:text-red-700 dark:hover:text-red-300'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Shield
                        className={`h-5 w-5 transition-colors ${
                          isActive
                            ? 'text-red-600 dark:text-red-400'
                            : 'text-gray-400 group-hover:text-red-500 dark:group-hover:text-red-400'
                        }`}
                      />
                    </>
                  )}
                </NavLink>
              </TooltipWrapper>
            ) : (
              <NavLink
                to="/dashboard/admin"
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center px-3 py-3 text-sm font-medium rounded-xl transition-all duration-200 group ${
                    isActive
                      ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-900/10 hover:text-red-700 dark:hover:text-red-300'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Shield
                      className={`h-5 w-5 mr-3 transition-colors ${
                        isActive
                          ? 'text-red-600 dark:text-red-400'
                          : 'text-gray-400 group-hover:text-red-500 dark:group-hover:text-red-400'
                      }`}
                    />
                    <AnimatePresence>
                      <motion.span
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ duration: 0.2 }}
                        className="truncate"
                      >
                        Admin Dashboard
                      </motion.span>
                    </AnimatePresence>
                    {isActive && (
                      <motion.div
                        layoutId="activeAdminTab"
                        className="ml-auto w-2 h-2 bg-red-500 rounded-full"
                        initial={false}
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      />
                    )}
                  </>
                )}
              </NavLink>
            )}
          </div>
        ) : null}
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
          !shouldShowExpanded ? (
            <TooltipWrapper 
              tooltip="Sign Out" 
              itemName="sign-out"
              className="w-full flex items-center justify-center px-2 py-3 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
            >
              <button onClick={handleLogout}>
                <LogOut className="h-5 w-5" />
              </button>
            </TooltipWrapper>
          ) : (
            <button
              onClick={handleLogout}
              className="w-full flex items-center space-x-3 px-3 py-3 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
            >
              <LogOut className="h-5 w-5" />
              <AnimatePresence>
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  Sign Out
                </motion.span>
              </AnimatePresence>
            </button>
          )
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
    </>
  )
}

export default Sidebar