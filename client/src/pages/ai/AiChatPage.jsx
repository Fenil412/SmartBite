import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { flaskAiService } from '../../services/flaskAi.service'
import { 
  Send, 
  MessageSquare,
  AlertTriangle,
  Languages,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Copy,
  ThumbsUp,
  ThumbsDown,
  Sparkles,
  Bot,
  User,
  HelpCircle,
  ChevronUp,
  ChevronDown,
  Check,
  Heart,
  X
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const AiChatPage = () => {
  const { user } = useAuth()
  const [messages, setMessages] = useState([])
  const [inputMessage, setInputMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [language, setLanguage] = useState('en-US')
  const [isListening, setIsListening] = useState(false)
  const [recognition, setRecognition] = useState(null)
  const [showHelp, setShowHelp] = useState(false)
  const [messageStates, setMessageStates] = useState({}) // For copy/like/dislike states
  const [currentSpeech, setCurrentSpeech] = useState(null)
  const [speakingMessageId, setSpeakingMessageId] = useState(null)
  const messagesEndRef = useRef(null)
  const textareaRef = useRef(null)

  const languages = [
    { code: 'en-US', name: 'English', flag: '🇺🇸' },
    { code: 'hi-IN', name: 'हिंदी', flag: '🇮🇳' },
    { code: 'gu-IN', name: 'ગુજરાતી', flag: '🇮🇳' }
  ]

  const welcomeMessages = {
    'en-US': "Hello! I'm your SmartBite AI nutrition assistant. I can help you with food, nutrition, diet, and meal planning questions. What would you like to know?",
    'hi-IN': "नमस्ते! मैं आपका SmartBite AI पोषण सहायक हूँ। मैं आपको भोजन, पोषण, आहार और भोजन योजना के बारे में मदद कर सकता हूँ। आप क्या जानना चाहते हैं?",
    'gu-IN': "નમસ્તે! હું તમારો SmartBite AI પોષણ સહાયક છું। હું તમને ખોરાક, પોષણ, આહાર અને ભોજન આયોજન વિશે મદદ કરી શકું છું. તમે શું જાણવા માંગો છો?"
  }

  const helpContent = {
    'en-US': {
      title: "What I can help with:",
      items: [
        "🥗 Food nutrition and calorie information",
        "🍽️ Personalized meal planning and recipes",
        "💡 Dietary advice and healthy eating tips",
        "👨‍🍳 Cooking techniques and methods",
        "🥕 Ingredient information and substitutes",
        "🏃‍♂️ Nutrition for fitness and health goals",
        "🌱 Plant-based and special diet guidance",
        "⚖️ Weight management strategies"
      ],
      warning: "⚠️ What I cannot help with: Medical diagnosis, treatment recommendations, non-food topics, or personal medical advice."
    },
    'hi-IN': {
      title: "मैं इसमें आपकी मदद कर सकता हूँ:",
      items: [
        "🥗 भोजन पोषण और कैलोरी जानकारी",
        "🍽️ व्यक्तिगत भोजन योजना और व्यंजन",
        "💡 आहार सलाह और स्वस्थ खाने की युक्तियाँ",
        "👨‍🍳 खाना पकाने की तकनीक और विधियाँ",
        "🥕 सामग्री की जानकारी और विकल्प",
        "🏃‍♂️ फिटनेस और स्वास्थ्य लक्ष्यों के लिए पोषण",
        "🌱 पौधे-आधारित और विशेष आहार मार्गदर्शन",
        "⚖️ वजन प्रबंधन रणनीतियाँ"
      ],
      warning: "⚠️ मैं इसमें मदद नहीं कर सकता: चिकित्सा निदान, उपचार सिफारिशें, गैर-खाद्य विषय, या व्यक्तिगत चिकित्सा सलाह।"
    },
    'gu-IN': {
      title: "હું આમાં તમારી મદદ કરી શકું છું:",
      items: [
        "🥗 ખોરાકનું પોષણ અને કેલરી માહિતી",
        "🍽️ વ્યક્તિગત ભોજન આયોજન અને વાનગીઓ",
        "💡 આહાર સલાહ અને સ્વસ્થ ખાવાની ટિપ્સ",
        "👨‍🍳 રસોઈની તકનીકો અને પદ્ધતિઓ",
        "🥕 ઘટકોની માહિતી અને વિકલ્પો",
        "🏃‍♂️ ફિટનેસ અને આરોગ્ય લક્ષ્યો માટે પોષણ",
        "🌱 છોડ-આધારિત અને વિશેષ આહાર માર્ગદર્શન",
        "⚖️ વજન વ્યવસ્થાપન વ્યૂહરચનાઓ"
      ],
      warning: "⚠️ હું આમાં મદદ કરી શકતો નથી: તબીબી નિદાન, સારવાર ભલામણો, બિન-ખોરાક વિષયો, અથવા વ્યક્તિગત તબીબી સલાહ।"
    }
  }

  useEffect(() => {
    // Initialize speech recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      const recognitionInstance = new SpeechRecognition()
      
      recognitionInstance.continuous = false
      recognitionInstance.interimResults = false
      recognitionInstance.lang = language
      
      recognitionInstance.onstart = () => {
        setIsListening(true)
        setError(null)
      }
      
      recognitionInstance.onresult = (event) => {
        const transcript = event.results[0][0].transcript
        setInputMessage(transcript)
        setIsListening(false)
      }
      
      recognitionInstance.onerror = (event) => {
        console.error('Speech recognition error:', event.error)
        setError(`Speech recognition error: ${event.error}`)
        setIsListening(false)
      }
      
      recognitionInstance.onend = () => {
        setIsListening(false)
      }
      
      setRecognition(recognitionInstance)
    }
  }, [])

  useEffect(() => {
    // Update recognition language when language changes
    if (recognition) {
      recognition.lang = language
    }

    // Update welcome message when language changes
    setMessages([
      {
        id: 1,
        type: 'ai',
        content: welcomeMessages[language],
        timestamp: new Date()
      }
    ])
  }, [language, recognition])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const startListening = () => {
    if (recognition && !isListening) {
      try {
        recognition.start()
      } catch (error) {
        console.error('Error starting speech recognition:', error)
        setError('Could not start voice recognition. Please try again.')
      }
    }
  }

  const stopListening = () => {
    if (recognition && isListening) {
      recognition.stop()
    }
  }

  const toggleSpeech = (messageId, text) => {
    if ('speechSynthesis' in window) {
      if (speakingMessageId === messageId && currentSpeech) {
        // Stop current speech
        speechSynthesis.cancel()
        setSpeakingMessageId(null)
        setCurrentSpeech(null)
      } else {
        // Stop any ongoing speech and start new one
        speechSynthesis.cancel()
        
        const utterance = new SpeechSynthesisUtterance(text)
        utterance.lang = language
        utterance.rate = 0.9
        utterance.pitch = 1
        
        utterance.onstart = () => {
          setSpeakingMessageId(messageId)
          setCurrentSpeech(utterance)
        }
        
        utterance.onend = () => {
          setSpeakingMessageId(null)
          setCurrentSpeech(null)
        }
        
        utterance.onerror = () => {
          setSpeakingMessageId(null)
          setCurrentSpeech(null)
        }
        
        speechSynthesis.speak(utterance)
      }
    }
  }

  const copyToClipboard = (messageId, text) => {
    navigator.clipboard.writeText(text).then(() => {
      setMessageStates(prev => ({
        ...prev,
        [messageId]: { ...prev[messageId], copied: true }
      }))
      
      // Reset after 2 seconds
      setTimeout(() => {
        setMessageStates(prev => ({
          ...prev,
          [messageId]: { ...prev[messageId], copied: false }
        }))
      }, 2000)
    })
  }

  const handleFeedback = (messageId, type) => {
    setMessageStates(prev => ({
      ...prev,
      [messageId]: { 
        ...prev[messageId], 
        [type]: true,
        // Reset opposite feedback
        [type === 'liked' ? 'disliked' : 'liked']: false
      }
    }))
    
    // Reset after 3 seconds
    setTimeout(() => {
      setMessageStates(prev => ({
        ...prev,
        [messageId]: { ...prev[messageId], [type]: false }
      }))
    }, 3000)
  }

  const formatMessage = (content) => {
    // Convert **text** to bold formatting
    return content.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-gray-900 dark:text-white bg-yellow-100 dark:bg-yellow-900/30 px-1 rounded">$1</strong>')
  }

  const sendMessage = async () => {
    if (!inputMessage.trim() || loading) return

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputMessage.trim(),
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setLoading(true)
    setError(null)

    try {
      const response = await flaskAiService.generateChatResponse(
        user._id, 
        userMessage.content, 
        language
      )

      if (response.success) {
        const aiMessage = {
          id: Date.now() + 1,
          type: 'ai',
          content: response.message || 'I apologize, but I couldn\'t generate a response.',
          timestamp: new Date()
        }
        setMessages(prev => [...prev, aiMessage])
      } else {
        throw new Error(response.message || 'Failed to get AI response')
      }
    } catch (error) {
      console.error('Chat error:', error)
      setError(error.message || 'Failed to send message')
      
      // Add error message to chat
      const errorMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: 'I apologize, but I\'m having trouble responding right now. Please try again.',
        timestamp: new Date(),
        isError: true
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const formatTimestamp = (timestamp) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    }).format(timestamp)
  }

  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`
    }
  }

  useEffect(() => {
    adjustTextareaHeight()
  }, [inputMessage])

  return (
    <div className="flex flex-col h-screen max-w-full mx-auto bg-gray-50 dark:bg-gray-900">
      {/* Mobile-Optimized Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 sm:px-6 py-3 sm:py-4 shadow-sm">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
            <div className="p-1.5 sm:p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex-shrink-0">
              <Bot className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white truncate">
                AI Nutrition Assistant
              </h1>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">
                Ask me about food, nutrition, and meal planning
              </p>
            </div>
          </div>
          
          {/* Language Selector */}
          <div className="flex items-center space-x-2 flex-shrink-0">
            <Languages className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500" />
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              {languages.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.flag} {lang.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-4 sm:mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg"
        >
          <div className="flex items-center">
            <AlertTriangle className="h-4 w-4 text-red-500 mr-2 flex-shrink-0" />
            <span className="text-sm text-red-700">{error}</span>
          </div>
        </motion.div>
      )}

      {/* Chat Messages - Mobile Optimized */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full max-w-6xl mx-auto flex flex-col">
          <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6">
            <AnimatePresence>
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex items-start space-x-2 sm:space-x-3 max-w-[85%] sm:max-w-4xl ${message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                    {/* Avatar */}
                    <div className={`flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center ${
                      message.type === 'user' 
                        ? 'bg-gradient-to-r from-blue-500 to-blue-600' 
                        : message.isError
                        ? 'bg-red-500'
                        : 'bg-gradient-to-r from-purple-500 to-blue-500'
                    }`}>
                      {message.type === 'user' ? (
                        <User className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                      ) : (
                        <Bot className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                      )}
                    </div>

                    {/* Message Content */}
                    <div className={`flex-1 ${message.type === 'user' ? 'text-right' : 'text-left'}`}>
                      <div className={`inline-block px-4 sm:px-6 py-3 sm:py-4 rounded-2xl ${
                        message.type === 'user'
                          ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
                          : message.isError
                          ? 'bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-200 border border-red-200 dark:border-red-800'
                          : 'bg-white text-gray-900 dark:bg-gray-800 dark:text-white border border-gray-200 dark:border-gray-700 shadow-sm'
                      }`}>
                        <div 
                          className="whitespace-pre-wrap leading-relaxed text-sm sm:text-base"
                          dangerouslySetInnerHTML={{ __html: formatMessage(message.content) }}
                        />
                        
                        {/* Message Actions */}
                        {message.type === 'ai' && !message.isError && (
                          <div className="flex items-center justify-end space-x-1 sm:space-x-2 mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                            <button
                              onClick={() => toggleSpeech(message.id, message.content)}
                              className={`p-1.5 transition-colors ${
                                speakingMessageId === message.id 
                                  ? 'text-red-500 hover:text-red-600' 
                                  : 'text-gray-500 hover:text-blue-500'
                              }`}
                              title={speakingMessageId === message.id ? 'Stop speaking' : 'Read aloud'}
                            >
                              {speakingMessageId === message.id ? (
                                <VolumeX className="h-3 w-3 sm:h-4 sm:w-4" />
                              ) : (
                                <Volume2 className="h-3 w-3 sm:h-4 sm:w-4" />
                              )}
                            </button>
                            <button
                              onClick={() => copyToClipboard(message.id, message.content)}
                              className={`p-1.5 transition-colors ${
                                messageStates[message.id]?.copied 
                                  ? 'text-green-500' 
                                  : 'text-gray-500 hover:text-blue-500'
                              }`}
                              title="Copy message"
                            >
                              {messageStates[message.id]?.copied ? (
                                <Check className="h-3 w-3 sm:h-4 sm:w-4" />
                              ) : (
                                <Copy className="h-3 w-3 sm:h-4 sm:w-4" />
                              )}
                            </button>
                            <button
                              onClick={() => handleFeedback(message.id, 'liked')}
                              className={`p-1.5 transition-colors ${
                                messageStates[message.id]?.liked 
                                  ? 'text-green-500' 
                                  : 'text-gray-500 hover:text-green-500'
                              }`}
                              title="Helpful"
                            >
                              {messageStates[message.id]?.liked ? (
                                <Heart className="h-3 w-3 sm:h-4 sm:w-4 fill-current" />
                              ) : (
                                <ThumbsUp className="h-3 w-3 sm:h-4 sm:w-4" />
                              )}
                            </button>
                            <button
                              onClick={() => handleFeedback(message.id, 'disliked')}
                              className={`p-1.5 transition-colors ${
                                messageStates[message.id]?.disliked 
                                  ? 'text-red-500' 
                                  : 'text-gray-500 hover:text-red-500'
                              }`}
                              title="Not helpful"
                            >
                              {messageStates[message.id]?.disliked ? (
                                <X className="h-3 w-3 sm:h-4 sm:w-4" />
                              ) : (
                                <ThumbsDown className="h-3 w-3 sm:h-4 sm:w-4" />
                              )}
                            </button>
                          </div>
                        )}
                      </div>
                      
                      {/* Feedback Status */}
                      {(messageStates[message.id]?.copied || messageStates[message.id]?.liked || messageStates[message.id]?.disliked) && (
                        <motion.div
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`text-xs mt-1 ${message.type === 'user' ? 'text-right' : 'text-left'}`}
                        >
                          {messageStates[message.id]?.copied && (
                            <span className="text-green-600 dark:text-green-400">Copied!</span>
                          )}
                          {messageStates[message.id]?.liked && (
                            <span className="text-green-600 dark:text-green-400">Liked!</span>
                          )}
                          {messageStates[message.id]?.disliked && (
                            <span className="text-red-600 dark:text-red-400">Feedback noted</span>
                          )}
                        </motion.div>
                      )}
                      
                      <div className={`text-xs mt-2 text-gray-500 dark:text-gray-400 ${
                        message.type === 'user' ? 'text-right' : 'text-left'
                      }`}>
                        {formatTimestamp(message.timestamp)}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {loading && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-start"
              >
                <div className="flex items-start space-x-2 sm:space-x-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center">
                    <Bot className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                  </div>
                  <div className="bg-white dark:bg-gray-800 rounded-2xl px-4 sm:px-6 py-3 sm:py-4 border border-gray-200 dark:border-gray-700 shadow-sm">
                    <div className="flex items-center space-x-2">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                      <span className="text-sm text-gray-600 dark:text-gray-300">AI is thinking...</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Mobile-Optimized Input Area */}
          <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4 sm:p-6">
            <div className="flex items-end space-x-2 sm:space-x-4">
              <div className="flex-1 relative">
                <textarea
                  ref={textareaRef}
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask me about nutrition, recipes, meal planning..."
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 pr-10 sm:pr-12 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 transition-all text-sm sm:text-base"
                  rows="1"
                  disabled={loading}
                  style={{ minHeight: '40px' }}
                />
                
                {/* Microphone Button */}
                {recognition && (
                  <button
                    onClick={isListening ? stopListening : startListening}
                    disabled={loading}
                    className={`absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2 p-1.5 sm:p-2 rounded-lg transition-all ${
                      isListening 
                        ? 'bg-red-500 text-white animate-pulse' 
                        : 'text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20'
                    } disabled:opacity-50`}
                    title={isListening ? 'Stop listening' : 'Start voice input'}
                  >
                    {isListening ? <MicOff className="h-4 w-4 sm:h-5 sm:w-5" /> : <Mic className="h-4 w-4 sm:h-5 sm:w-5" />}
                  </button>
                )}
              </div>
              
              <button
                onClick={sendMessage}
                disabled={loading || !inputMessage.trim()}
                className="px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1 sm:space-x-2 transition-all shadow-lg hover:shadow-xl text-sm sm:text-base"
              >
                <Send className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="hidden sm:inline">Send</span>
              </button>
            </div>
            
            <div className="mt-2 sm:mt-3 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
              <span className="hidden sm:inline">Press Enter to send, Shift+Enter for new line</span>
              <span className="sm:hidden">Tap to send</span>
              <div className="flex items-center space-x-2 sm:space-x-4">
                {recognition && (
                  <span className="flex items-center space-x-1">
                    <Mic className="h-3 w-3" />
                    <span className="hidden sm:inline">Voice input available</span>
                    <span className="sm:hidden">Voice</span>
                  </span>
                )}
                
                {/* Help Button */}
                <button
                  onClick={() => setShowHelp(!showHelp)}
                  className="flex items-center space-x-1 text-blue-500 hover:text-blue-600 transition-colors"
                >
                  <HelpCircle className="h-3 w-3" />
                  <span className="hidden sm:inline">What can I help with?</span>
                  <span className="sm:hidden">Help</span>
                  {showHelp ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Expandable Help Section */}
      <AnimatePresence>
        {showHelp && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-t border-yellow-200 dark:border-yellow-800"
          >
            <div className="max-w-6xl mx-auto p-4 sm:p-6">
              <div className="flex items-start space-x-3">
                <MessageSquare className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-yellow-800 dark:text-yellow-200 min-w-0 flex-1">
                  <div className="font-semibold mb-3">{helpContent[language].title}</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-2 sm:gap-3 mb-4">
                    {helpContent[language].items.map((item, index) => (
                      <div key={index} className="flex items-start space-x-2">
                        <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                        <span className="text-xs sm:text-sm">{item}</span>
                      </div>
                    ))}
                  </div>
                  <div className="font-semibold text-red-700 dark:text-red-300 text-xs">
                    {helpContent[language].warning}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default AiChatPage