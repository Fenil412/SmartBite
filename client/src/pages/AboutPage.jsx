import { 
  Users, 
  Target, 
  Brain, 
  Shield, 
  Zap, 
  Database,
  MessageSquare,
  BarChart3,
  ShoppingCart,
  Clock,
  CheckCircle,
  ArrowRight,
  Sparkles,
  Star,
  Rocket
} from 'lucide-react'
import { motion, useScroll, useTransform, useInView } from 'framer-motion'
import { useRef, useState, useEffect } from 'react'

const AboutPage = () => {
  const containerRef = useRef(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  })
  
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [isHovering, setIsHovering] = useState(false)

  // Parallax transforms
  const y = useTransform(scrollYProgress, [0, 1], [0, -50])
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0])

  // Mouse tracking for 3D effects
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: (e.clientY / window.innerHeight) * 2 - 1
      })
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  // Floating animation component
  const FloatingElement = ({ children, delay = 0, duration = 3 }) => (
    <motion.div
      animate={{
        y: [0, -10, 0],
        rotate: [0, 1, -1, 0],
      }}
      transition={{
        duration,
        repeat: Infinity,
        delay,
        ease: "easeInOut"
      }}
    >
      {children}
    </motion.div>
  )

  // 3D Card component with hover effects
  const Card3D = ({ children, className = "", delay = 0 }) => {
    const cardRef = useRef(null)
    const isInView = useInView(cardRef, { once: true, margin: "-100px" })
    
    return (
      <motion.div
        ref={cardRef}
        initial={{ opacity: 0, y: 50, rotateX: -15 }}
        animate={isInView ? { opacity: 1, y: 0, rotateX: 0 } : {}}
        transition={{ duration: 0.8, delay }}
        whileHover={{ 
          scale: 1.02,
          rotateY: 5,
          rotateX: 5,
          z: 50,
          transition: { duration: 0.3 }
        }}
        className={`transform-gpu perspective-1000 ${className}`}
        style={{
          transformStyle: 'preserve-3d',
        }}
      >
        <div className="relative transform-gpu transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/20">
          {children}
        </div>
      </motion.div>
    )
  }

  // Animated counter component
  const AnimatedCounter = ({ end, duration = 2 }) => {
    const [count, setCount] = useState(0)
    const countRef = useRef(null)
    const isInView = useInView(countRef)

    useEffect(() => {
      if (isInView) {
        let startTime
        const animate = (currentTime) => {
          if (!startTime) startTime = currentTime
          const progress = Math.min((currentTime - startTime) / (duration * 1000), 1)
          setCount(Math.floor(progress * end))
          if (progress < 1) requestAnimationFrame(animate)
        }
        requestAnimationFrame(animate)
      }
    }, [isInView, end, duration])

    return <span ref={countRef}>{count}</span>
  }

  return (
    <div ref={containerRef} className="min-h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 pointer-events-none">
        <motion.div
          animate={{
            rotate: 360,
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute top-20 right-20 w-32 h-32 bg-gradient-to-r from-blue-400/10 to-purple-400/10 rounded-full blur-xl"
        />
        <motion.div
          animate={{
            rotate: -360,
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute bottom-20 left-20 w-24 h-24 bg-gradient-to-r from-green-400/10 to-blue-400/10 rounded-full blur-xl"
        />
      </div>

      {/* Hero Header with 3D Effects */}
      <motion.div 
        className="relative bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 overflow-hidden"
        style={{ y, opacity }}
      >
        {/* Animated Background */}
        <div className="absolute inset-0 z-0">
          <motion.img 
            src="https://images.unsplash.com/photo-1490645935967-10de6ba17061?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2053&q=80"
            alt="Fresh healthy ingredients"
            className="w-full h-full object-cover opacity-10 dark:opacity-5"
            animate={{
              scale: [1, 1.05, 1],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div 
            className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 dark:from-blue-900/40 dark:to-purple-900/40"
            animate={{
              background: [
                "linear-gradient(45deg, rgba(59, 130, 246, 0.2), rgba(147, 51, 234, 0.2))",
                "linear-gradient(135deg, rgba(147, 51, 234, 0.2), rgba(59, 130, 246, 0.2))",
                "linear-gradient(45deg, rgba(59, 130, 246, 0.2), rgba(147, 51, 234, 0.2))"
              ]
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </div>
        
        <div className="relative z-10 max-w-4xl mx-auto px-6 py-16">
          <motion.div 
            className="text-center"
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            <motion.div
              className="inline-flex items-center space-x-2 mb-6"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <FloatingElement delay={0}>
                <Sparkles className="h-8 w-8 text-blue-500" />
              </FloatingElement>
              <motion.h1 
                className="text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-clip-text text-transparent"
                animate={{
                  backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                style={{
                  backgroundSize: "200% 200%"
                }}
              >
                About SmartBite
              </motion.h1>
              <FloatingElement delay={0.5}>
                <Star className="h-8 w-8 text-purple-500" />
              </FloatingElement>
            </motion.div>
            
            <motion.p 
              className="text-2xl text-gray-600 dark:text-gray-400 mb-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
            >
              AI-powered nutrition planning that adapts to your real life
            </motion.p>
            
            <motion.div 
              className="flex justify-center"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.8, duration: 0.6 }}
              whileHover={{ scale: 1.05, rotateY: 5 }}
              style={{
                transformStyle: 'preserve-3d',
              }}
            >
              <div className="relative group">
                <motion.img 
                  src="https://images.unsplash.com/photo-1512621776951-a57141f2eefd?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
                  alt="Healthy meal planning"
                  className="w-64 h-40 object-cover rounded-lg shadow-2xl transition-all duration-500 group-hover:shadow-blue-500/25"
                  whileHover={{ 
                    rotateX: 5,
                    rotateY: 5,
                    scale: 1.02
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-blue-500/20 to-transparent rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>

      <div className="max-w-4xl mx-auto px-6 py-12 space-y-16">
        
        {/* Section 1: Introduction with 3D Cards */}
        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
        >
          <motion.div 
            className="flex items-center mb-6"
            initial={{ x: -50, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <motion.div
              whileHover={{ rotate: 360, scale: 1.2 }}
              transition={{ duration: 0.5 }}
            >
              <Target className="h-8 w-8 text-blue-600 mr-3" />
            </motion.div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Why SmartBite Exists
            </h2>
          </motion.div>
          
          <div className="prose prose-lg max-w-none text-gray-700 dark:text-gray-300">
            <motion.p 
              className="mb-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              Generic diet plans don't work for everyone. A meal plan that works for someone with a full kitchen and 2 hours to cook won't work for a student with just a microwave and 15 minutes between classes.
            </motion.p>
            
            <motion.p 
              className="mb-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              SmartBite was built to solve this problem through data-driven personalization. Instead of assuming what works for you, we learn from your actual preferences, constraints, and feedback to create nutrition plans that fit your real life.
            </motion.p>
            
            <div className="grid md:grid-cols-2 gap-6 mt-8">
              <Card3D delay={0.2}>
                <motion.div 
                  className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-6 rounded-lg border border-blue-200 dark:border-blue-800"
                  whileHover={{ 
                    boxShadow: "0 20px 40px rgba(59, 130, 246, 0.3)",
                    borderColor: "rgba(59, 130, 246, 0.5)"
                  }}
                  transition={{ duration: 0.3 }}
                >
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                    <motion.span
                      className="mr-2 text-2xl"
                      animate={{ rotate: [0, -10, 10, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      ⚠️
                    </motion.span>
                    The Problem
                  </h3>
                  <ul className="space-y-2 text-sm">
                    {[
                      "Busy lifestyles with limited cooking time",
                      "Different health and fitness goals", 
                      "Dietary restrictions and preferences",
                      "Budget and kitchen equipment constraints",
                      "One-size-fits-all solutions that don't adapt"
                    ].map((item, index) => (
                      <motion.li
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 * index, duration: 0.4 }}
                        whileHover={{ x: 5, color: "#2563eb" }}
                      >
                        • {item}
                      </motion.li>
                    ))}
                  </ul>
                </motion.div>
              </Card3D>
              
              <Card3D delay={0.4}>
                <motion.div 
                  className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-6 rounded-lg border border-green-200 dark:border-green-800"
                  whileHover={{ 
                    boxShadow: "0 20px 40px rgba(34, 197, 94, 0.3)",
                    borderColor: "rgba(34, 197, 94, 0.5)"
                  }}
                  transition={{ duration: 0.3 }}
                >
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                    <motion.span
                      className="mr-2 text-2xl"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      ✅
                    </motion.span>
                    Our Approach
                  </h3>
                  <ul className="space-y-2 text-sm">
                    {[
                      "Learn from your actual preferences",
                      "Respect your time and equipment limits",
                      "Adapt based on your feedback", 
                      "Consider your budget and grocery access",
                      "Improve recommendations over time"
                    ].map((item, index) => (
                      <motion.li
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 * index, duration: 0.4 }}
                        whileHover={{ x: 5, color: "#16a34a" }}
                      >
                        • {item}
                      </motion.li>
                    ))}
                  </ul>
                </motion.div>
              </Card3D>
            </div>
            
            {/* Problem Illustration with 3D hover */}
            <motion.div 
              className="mt-12 text-center"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.6, duration: 0.8 }}
            >
              <motion.div
                className="relative group cursor-pointer"
                whileHover={{ 
                  scale: 1.02,
                  rotateY: 5,
                  rotateX: 5,
                }}
                style={{ transformStyle: 'preserve-3d' }}
              >
                <img 
                  src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
                  alt="Busy lifestyle cooking challenges"
                  className="w-full max-w-2xl mx-auto h-64 object-cover rounded-lg shadow-2xl transition-all duration-500 group-hover:shadow-blue-500/25"
                />
                <motion.div 
                  className="absolute inset-0 bg-gradient-to-t from-blue-600/30 to-transparent rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  initial={{ opacity: 0 }}
                  whileHover={{ opacity: 1 }}
                />
                <motion.div
                  className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  whileHover={{ scale: 1.1 }}
                >
                  <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg p-4">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      Real challenges need smart solutions
                    </p>
                  </div>
                </motion.div>
              </motion.div>
              <motion.p 
                className="text-sm text-gray-500 dark:text-gray-400 mt-2"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.8, duration: 0.6 }}
              >
                Real life cooking challenges: limited time, space, and resources
              </motion.p>
            </motion.div>
          </div>
        </motion.section>

        {/* Section 2: What Makes SmartBite Different with Interactive Elements */}
        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
        >
          <motion.div 
            className="flex items-center mb-6"
            initial={{ x: -50, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <motion.div
              whileHover={{ 
                rotate: [0, -10, 10, 0],
                scale: 1.2,
                filter: "drop-shadow(0 0 20px rgba(147, 51, 234, 0.5))"
              }}
              transition={{ duration: 0.5 }}
            >
              <Zap className="h-8 w-8 text-purple-600 mr-3" />
            </motion.div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              What Makes SmartBite Different
            </h2>
          </motion.div>
          
          <div className="grid md:grid-cols-2 gap-8">
            <Card3D delay={0.2}>
              <motion.div
                className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg"
                whileHover={{ 
                  boxShadow: "0 25px 50px rgba(0, 0, 0, 0.15)",
                  borderColor: "rgba(59, 130, 246, 0.5)"
                }}
              >
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <motion.span
                    animate={{ rotate: 360 }}
                    transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                    className="mr-2"
                  >
                    🎯
                  </motion.span>
                  Personalization Through Data
                </h3>
                <ul className="space-y-3 text-gray-700 dark:text-gray-300">
                  {[
                    { icon: CheckCircle, text: "User Profile: Age, activity level, dietary goals", color: "text-green-500" },
                    { icon: CheckCircle, text: "Preferences: Cuisine types, ingredients you love or avoid", color: "text-blue-500" },
                    { icon: CheckCircle, text: "Constraints: Cooking time, available appliances, budget", color: "text-purple-500" },
                    { icon: CheckCircle, text: "Feedback: What you actually liked and made", color: "text-orange-500" },
                    { icon: CheckCircle, text: "History: Patterns in your eating and cooking habits", color: "text-pink-500" }
                  ].map((item, index) => (
                    <motion.li
                      key={index}
                      className="flex items-start"
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.1 * index, duration: 0.4 }}
                      whileHover={{ x: 10, scale: 1.02 }}
                    >
                      <motion.div
                        whileHover={{ rotate: 360, scale: 1.2 }}
                        transition={{ duration: 0.3 }}
                      >
                        <item.icon className={`h-5 w-5 ${item.color} mr-2 mt-0.5 flex-shrink-0`} />
                      </motion.div>
                      <span><strong>{item.text.split(':')[0]}:</strong> {item.text.split(':')[1]}</span>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            </Card3D>
            
            <Card3D delay={0.4}>
              <motion.div
                className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg"
                whileHover={{ 
                  boxShadow: "0 25px 50px rgba(0, 0, 0, 0.15)",
                  borderColor: "rgba(147, 51, 234, 0.5)"
                }}
              >
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <motion.span
                    animate={{ 
                      scale: [1, 1.2, 1],
                      rotate: [0, 180, 360]
                    }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="mr-2"
                  >
                    🤖
                  </motion.span>
                  AI-Powered Intelligence
                </h3>
                <ul className="space-y-3 text-gray-700 dark:text-gray-300">
                  {[
                    { icon: BarChart3, text: "Meal Analysis: Nutritional breakdown and health insights", color: "text-blue-500" },
                    { icon: Target, text: "Weekly Optimization: Balanced meal plans that fit your schedule", color: "text-green-500" },
                    { icon: ShoppingCart, text: "Grocery Planning: Smart shopping lists with budget awareness", color: "text-purple-500" },
                    { icon: Shield, text: "Health Risk Detection: Non-medical nutritional guidance", color: "text-red-500" },
                    { icon: MessageSquare, text: "AI Chat: Get explanations and ask nutrition questions", color: "text-indigo-500" }
                  ].map((item, index) => (
                    <motion.li
                      key={index}
                      className="flex items-start"
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.1 * index, duration: 0.4 }}
                      whileHover={{ x: 10, scale: 1.02 }}
                    >
                      <motion.div
                        whileHover={{ 
                          rotate: 360, 
                          scale: 1.2,
                          filter: "drop-shadow(0 0 10px currentColor)"
                        }}
                        transition={{ duration: 0.3 }}
                      >
                        <item.icon className={`h-5 w-5 ${item.color} mr-2 mt-0.5 flex-shrink-0`} />
                      </motion.div>
                      <span><strong>{item.text.split(':')[0]}:</strong> {item.text.split(':')[1]}</span>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            </Card3D>
          </div>
        </motion.section>

        {/* Section 3: How Our Technology Works with 3D Architecture */}
        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
        >
          <motion.div 
            className="flex items-center mb-6"
            initial={{ x: -50, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <motion.div
              whileHover={{ 
                rotateY: 360,
                scale: 1.2,
                filter: "drop-shadow(0 0 20px rgba(99, 102, 241, 0.5))"
              }}
              transition={{ duration: 0.8 }}
              style={{ transformStyle: 'preserve-3d' }}
            >
              <Brain className="h-8 w-8 text-indigo-600 mr-3" />
            </motion.div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              How Our Technology Works
            </h2>
          </motion.div>
          
          <Card3D delay={0.2}>
            <motion.div 
              className="bg-gradient-to-br from-white via-gray-50 to-white dark:from-gray-800 dark:via-gray-900 dark:to-gray-800 rounded-xl p-8 border border-gray-200 dark:border-gray-700 shadow-2xl"
              whileHover={{ 
                boxShadow: "0 30px 60px rgba(0, 0, 0, 0.2)",
                borderColor: "rgba(99, 102, 241, 0.5)"
              }}
              style={{
                background: "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)",
                backdropFilter: "blur(10px)"
              }}
            >
              <motion.p 
                className="text-gray-700 dark:text-gray-300 mb-8"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2, duration: 0.6 }}
              >
                SmartBite uses a dual-backend architecture designed for both reliability and intelligent personalization:
              </motion.p>
              
              <div className="grid md:grid-cols-2 gap-8 mb-8">
                <motion.div
                  className="relative"
                  initial={{ opacity: 0, rotateY: -90 }}
                  whileInView={{ opacity: 1, rotateY: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4, duration: 0.8 }}
                  whileHover={{ 
                    rotateY: 5,
                    scale: 1.02,
                    z: 50
                  }}
                  style={{ transformStyle: 'preserve-3d' }}
                >
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-6 rounded-lg border border-blue-200 dark:border-blue-800 shadow-lg">
                    <div className="flex items-center mb-4">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                      >
                        <Database className="h-6 w-6 text-blue-600 mr-2" />
                      </motion.div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Node.js Backend
                      </h3>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      Handles core platform operations:
                    </p>
                    <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                      {[
                        "User authentication and profiles",
                        "Meal database and constraints", 
                        "Feedback collection and storage",
                        "Grocery lists and history tracking",
                        "Data security and user privacy"
                      ].map((item, index) => (
                        <motion.li
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: 0.6 + (0.1 * index), duration: 0.4 }}
                          whileHover={{ x: 5, color: "#2563eb" }}
                        >
                          • {item}
                        </motion.li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
                
                <motion.div
                  className="relative"
                  initial={{ opacity: 0, rotateY: 90 }}
                  whileInView={{ opacity: 1, rotateY: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.6, duration: 0.8 }}
                  whileHover={{ 
                    rotateY: -5,
                    scale: 1.02,
                    z: 50
                  }}
                  style={{ transformStyle: 'preserve-3d' }}
                >
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 p-6 rounded-lg border border-purple-200 dark:border-purple-800 shadow-lg">
                    <div className="flex items-center mb-4">
                      <motion.div
                        animate={{ 
                          scale: [1, 1.2, 1],
                          rotate: [0, 180, 360]
                        }}
                        transition={{ duration: 4, repeat: Infinity }}
                      >
                        <Brain className="h-6 w-6 text-purple-600 mr-2" />
                      </motion.div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Flask AI Backend
                      </h3>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      Powers intelligent recommendations:
                    </p>
                    <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                      {[
                        "Machine learning models for ranking",
                        "Meal plan optimization algorithms",
                        "Similarity search and embeddings", 
                        "AI explanations and reasoning",
                        "Conversational nutrition assistant"
                      ].map((item, index) => (
                        <motion.li
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: 0.8 + (0.1 * index), duration: 0.4 }}
                          whileHover={{ x: 5, color: "#7c3aed" }}
                        >
                          • {item}
                        </motion.li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              </div>
              
              <motion.div 
                className="bg-gradient-to-r from-gray-50 via-white to-gray-50 dark:from-gray-700 dark:via-gray-800 dark:to-gray-700 p-6 rounded-lg border border-gray-200 dark:border-gray-600 shadow-inner"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 1, duration: 0.6 }}
              >
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <motion.span
                    animate={{ rotate: 360 }}
                    transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
                    className="mr-2"
                  >
                    🔒
                  </motion.span>
                  Secure Data Flow
                </h3>
                <div className="flex items-center justify-between text-sm text-gray-700 dark:text-gray-300 mb-4">
                  {[
                    { label: "User Data", color: "bg-blue-100 dark:bg-blue-900/30", delay: 0 },
                    { label: "Node.js Sync", color: "bg-green-100 dark:bg-green-900/30", delay: 0.2 },
                    { label: "AI Processing", color: "bg-purple-100 dark:bg-purple-900/30", delay: 0.4 },
                    { label: "Smart Recommendations", color: "bg-orange-100 dark:bg-orange-900/30", delay: 0.6 }
                  ].map((step, index) => (
                    <motion.div key={index} className="flex items-center">
                      <motion.span 
                        className={`${step.color} px-3 py-2 rounded-lg font-medium`}
                        initial={{ opacity: 0, scale: 0.8 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 1.2 + step.delay, duration: 0.4 }}
                        whileHover={{ 
                          scale: 1.1,
                          boxShadow: "0 5px 15px rgba(0,0,0,0.2)"
                        }}
                      >
                        {step.label}
                      </motion.span>
                      {index < 3 && (
                        <motion.div
                          initial={{ opacity: 0, x: -10 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: 1.4 + step.delay, duration: 0.4 }}
                        >
                          <ArrowRight className="h-4 w-4 text-gray-400 mx-2" />
                        </motion.div>
                      )}
                    </motion.div>
                  ))}
                </div>
                <motion.p 
                  className="text-xs text-gray-600 dark:text-gray-400"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 1.8, duration: 0.6 }}
                >
                  The AI never directly accesses your database. All user data is securely synced through our Node.js backend, ensuring privacy while enabling personalization.
                </motion.p>
              </motion.div>
              
              {/* Technology Illustration with advanced hover */}
              <motion.div 
                className="mt-8 text-center"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 2, duration: 0.8 }}
              >
                <motion.div
                  className="relative group cursor-pointer"
                  whileHover={{ 
                    scale: 1.02,
                    rotateY: 3,
                    rotateX: 3,
                  }}
                  style={{ transformStyle: 'preserve-3d' }}
                >
                  <img 
                    src="https://images.unsplash.com/photo-1518186285589-2f7649de83e0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2074&q=80"
                    alt="AI and technology concept"
                    className="w-full max-w-3xl mx-auto h-48 object-cover rounded-lg shadow-2xl transition-all duration-500 group-hover:shadow-indigo-500/25"
                  />
                  <motion.div 
                    className="absolute inset-0 bg-gradient-to-t from-indigo-600/40 to-transparent rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    initial={{ opacity: 0 }}
                    whileHover={{ opacity: 1 }}
                  />
                  <motion.div
                    className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    whileHover={{ scale: 1.1 }}
                  >
                    <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-lg p-4">
                      <p className="text-sm font-medium text-gray-900 dark:text-white flex items-center">
                        <Rocket className="h-4 w-4 mr-2" />
                        Powered by Advanced AI
                      </p>
                    </div>
                  </motion.div>
                </motion.div>
                <motion.p 
                  className="text-sm text-gray-500 dark:text-gray-400 mt-2"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 2.2, duration: 0.6 }}
                >
                  Advanced AI technology working behind the scenes to personalize your nutrition experience
                </motion.p>
              </motion.div>
            </motion.div>
          </Card3D>
        </motion.section>

        {/* Remaining sections with enhanced animations... */}
        {/* Section 4: Responsible AI & Trust */}
        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
        >
          <motion.div 
            className="flex items-center mb-6"
            initial={{ x: -50, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <motion.div
              whileHover={{ 
                rotate: [0, -10, 10, 0],
                scale: 1.2,
                filter: "drop-shadow(0 0 20px rgba(34, 197, 94, 0.5))"
              }}
              transition={{ duration: 0.5 }}
            >
              <Shield className="h-8 w-8 text-green-600 mr-3" />
            </motion.div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Responsible AI & Trust
            </h2>
          </motion.div>
          
          <Card3D delay={0.2}>
            <motion.div 
              className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6 mb-6"
              whileHover={{ 
                boxShadow: "0 20px 40px rgba(245, 158, 11, 0.3)",
                borderColor: "rgba(245, 158, 11, 0.5)"
              }}
            >
              <div className="flex items-start">
                <motion.div
                  animate={{ 
                    rotate: [0, 10, -10, 0],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  <Shield className="h-6 w-6 text-yellow-600 mr-3 mt-1 flex-shrink-0" />
                </motion.div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                    Important: SmartBite is not a medical service
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 text-sm">
                    Our AI provides nutritional guidance and meal suggestions, not medical diagnosis or treatment. Always consult healthcare professionals for medical advice.
                  </p>
                </div>
              </div>
            </motion.div>
          </Card3D>
          
          <div className="grid md:grid-cols-2 gap-6">
            <Card3D delay={0.4}>
              <motion.div 
                className="space-y-4 bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700"
                whileHover={{ boxShadow: "0 15px 30px rgba(0, 0, 0, 0.1)" }}
              >
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                  <motion.span
                    animate={{ opacity: [1, 0.5, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="mr-2"
                  >
                    🔍
                  </motion.span>
                  Transparent AI Decisions
                </h3>
                <ul className="space-y-2 text-gray-700 dark:text-gray-300 text-sm">
                  {[
                    "AI explanations for meal recommendations",
                    "Clear reasoning behind nutrition insights",
                    "Feedback directly improves future suggestions",
                    "No black-box algorithms"
                  ].map((item, index) => (
                    <motion.li
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.1 * index, duration: 0.4 }}
                      whileHover={{ x: 5, color: "#059669" }}
                    >
                      • {item}
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            </Card3D>
            
            <Card3D delay={0.6}>
              <motion.div 
                className="space-y-4 bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700"
                whileHover={{ boxShadow: "0 15px 30px rgba(0, 0, 0, 0.1)" }}
              >
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                  <motion.span
                    animate={{ rotate: 360 }}
                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                    className="mr-2"
                  >
                    🔐
                  </motion.span>
                  Data Control
                </h3>
                <ul className="space-y-2 text-gray-700 dark:text-gray-300 text-sm">
                  {[
                    "Your data stays in our secure backend",
                    "AI learns from patterns, not personal details",
                    "You control what information to share",
                    "Continuous improvement through your feedback"
                  ].map((item, index) => (
                    <motion.li
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.1 * index, duration: 0.4 }}
                      whileHover={{ x: 5, color: "#0d9488" }}
                    >
                      • {item}
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            </Card3D>
          </div>
        </motion.section>

        {/* Section 5: Who SmartBite is For with animated user cards */}
        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
        >
          <motion.div 
            className="flex items-center mb-6"
            initial={{ x: -50, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <motion.div
              whileHover={{ 
                scale: 1.2,
                rotate: 360,
                filter: "drop-shadow(0 0 20px rgba(249, 115, 22, 0.5))"
              }}
              transition={{ duration: 0.5 }}
            >
              <Users className="h-8 w-8 text-orange-600 mr-3" />
            </motion.div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Who SmartBite is For
            </h2>
          </motion.div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: "Students", description: "Limited time, budget, and kitchen equipment but need proper nutrition", icon: "🎓", color: "from-blue-400 to-blue-600" },
              { title: "Working Professionals", description: "Busy schedules requiring quick, healthy meal solutions", icon: "💼", color: "from-green-400 to-green-600" },
              { title: "Fitness Enthusiasts", description: "Specific nutritional goals and macro tracking needs", icon: "💪", color: "from-red-400 to-red-600" },
              { title: "Dietary Restrictions", description: "Vegetarian, vegan, gluten-free, or other specific requirements", icon: "🥗", color: "from-emerald-400 to-emerald-600" },
              { title: "Budget-Conscious Eaters", description: "Want healthy meals without breaking the bank", icon: "💰", color: "from-yellow-400 to-yellow-600" },
              { title: "Clarity Seekers", description: "Tired of confusing diet advice and want straightforward guidance", icon: "🎯", color: "from-purple-400 to-purple-600" }
            ].map((user, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50, rotateX: -15 }}
                whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 * index, duration: 0.6 }}
                whileHover={{ 
                  scale: 1.05,
                  rotateY: 5,
                  z: 50,
                  boxShadow: "0 25px 50px rgba(0, 0, 0, 0.15)"
                }}
                className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg cursor-pointer group"
                style={{ transformStyle: 'preserve-3d' }}
              >
                <motion.div 
                  className="text-4xl mb-4 flex justify-center"
                  whileHover={{ 
                    scale: 1.2,
                    rotate: 360
                  }}
                  transition={{ duration: 0.5 }}
                >
                  {user.icon}
                </motion.div>
                <div className={`w-full h-1 bg-gradient-to-r ${user.color} rounded-full mb-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2 text-center group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:bg-clip-text group-hover:from-blue-600 group-hover:to-purple-600 transition-all duration-300">
                  {user.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                  {user.description}
                </p>
              </motion.div>
            ))}
          </div>
          
          {/* Diverse Users Illustration with advanced effects */}
          <motion.div 
            className="mt-12 text-center"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.8, duration: 0.8 }}
          >
            <motion.div
              className="relative group cursor-pointer"
              whileHover={{ 
                scale: 1.02,
                rotateY: 2,
                rotateX: 2,
              }}
              style={{ transformStyle: 'preserve-3d' }}
            >
              <img 
                src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2132&q=80"
                alt="Diverse group of people with different lifestyles"
                className="w-full max-w-4xl mx-auto h-64 object-cover rounded-lg shadow-2xl transition-all duration-500 group-hover:shadow-orange-500/25"
              />
              <motion.div 
                className="absolute inset-0 bg-gradient-to-t from-orange-600/40 to-transparent rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 1 }}
              />
            </motion.div>
            <motion.p 
              className="text-sm text-gray-500 dark:text-gray-400 mt-2"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 1, duration: 0.6 }}
            >
              SmartBite adapts to diverse lifestyles, preferences, and constraints
            </motion.p>
          </motion.div>
        </motion.section>

        {/* Final sections with similar enhancements... */}
        {/* Section 8: Closing Statement with spectacular finale */}
        <motion.section 
          className="text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
        >
          <Card3D delay={0.2}>
            <motion.div 
              className="bg-gradient-to-br from-white via-blue-50 to-purple-50 dark:from-gray-800 dark:via-blue-900/20 dark:to-purple-900/20 rounded-xl p-12 border border-gray-200 dark:border-gray-700 shadow-2xl relative overflow-hidden"
              whileHover={{ 
                boxShadow: "0 40px 80px rgba(0, 0, 0, 0.2)",
                scale: 1.02
              }}
            >
              {/* Animated background elements */}
              <motion.div
                className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-xl"
                animate={{
                  x: [0, 100, 0],
                  y: [0, 50, 0],
                  scale: [1, 1.2, 1]
                }}
                transition={{ duration: 8, repeat: Infinity }}
              />
              <motion.div
                className="absolute bottom-0 right-0 w-24 h-24 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-full blur-xl"
                animate={{
                  x: [0, -80, 0],
                  y: [0, -30, 0],
                  scale: [1, 1.3, 1]
                }}
                transition={{ duration: 6, repeat: Infinity }}
              />
              
              <motion.h2 
                className="text-4xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-clip-text text-transparent relative z-10"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2, duration: 0.8 }}
                animate={{
                  backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                }}
                style={{
                  backgroundSize: "200% 200%"
                }}
              >
                SmartBite is built to help people eat smarter, not harder.
              </motion.h2>
              
              <motion.p 
                className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-8 relative z-10"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4, duration: 0.8 }}
              >
                We believe nutrition should adapt to your life, not the other way around. 
                Through data-driven personalization and transparent AI, we're making healthy eating accessible and practical for everyone.
              </motion.p>
              
              {/* Final Inspiration Image with spectacular effects */}
              <motion.div 
                className="mt-8 relative z-10"
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.6, duration: 0.8 }}
              >
                <motion.div
                  className="relative group cursor-pointer"
                  whileHover={{ 
                    scale: 1.05,
                    rotateY: 5,
                    rotateX: 5,
                  }}
                  style={{ transformStyle: 'preserve-3d' }}
                >
                  <img 
                    src="https://images.unsplash.com/photo-1498837167922-ddd27525d352?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
                    alt="Fresh healthy meal with vegetables and grains"
                    className="w-full max-w-3xl mx-auto h-64 object-cover rounded-lg shadow-2xl transition-all duration-500 group-hover:shadow-blue-500/30"
                  />
                  <motion.div 
                    className="absolute inset-0 bg-gradient-to-t from-blue-600/50 via-purple-600/30 to-transparent rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    initial={{ opacity: 0 }}
                    whileHover={{ opacity: 1 }}
                  />
                  <motion.div
                    className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    whileHover={{ scale: 1.1 }}
                  >
                    <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-lg p-6 text-center">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        className="inline-block mb-2"
                      >
                        <Sparkles className="h-8 w-8 text-blue-600" />
                      </motion.div>
                      <p className="text-lg font-bold text-gray-900 dark:text-white">
                        Your Journey Starts Here
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Smart nutrition for a better tomorrow
                      </p>
                    </div>
                  </motion.div>
                </motion.div>
                <motion.p 
                  className="text-sm text-gray-500 dark:text-gray-400 mt-4"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.8, duration: 0.6 }}
                >
                  Smart nutrition planning for a healthier, more balanced lifestyle
                </motion.p>
              </motion.div>
            </motion.div>
          </Card3D>
        </motion.section>
      </div>
    </div>
  )
}

export default AboutPage