import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Send, Clock, UtensilsCrossed, Bot, User, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

// Configure axios defaults for CORS
axios.defaults.withCredentials = false;

// Typing effect component for AI responses
const TypingEffect = ({ text }) => {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  
  useEffect(() => {
    if (currentIndex < text.length) {
      const typingTimer = setTimeout(() => {
        setDisplayedText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, 15); // adjust speed here
      
      return () => clearTimeout(typingTimer);
    }
  }, [currentIndex, text]);
  
  return (
    <div className="prose-sm prose-headings:my-2 prose-p:my-1 prose-ul:my-1 prose-ol:my-1">
      <ReactMarkdown>{displayedText}</ReactMarkdown>
    </div>
  );
};

export default function MealPlannerChatbot({ darkMode }) {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [language, setLanguage] = useState('en-US'); // Default to English
    const chatEndRef = useRef(null);
    const navigate = useNavigate();
    const recognitionRef = useRef(null);
    const [completedMessages, setCompletedMessages] = useState([]);
    const [isTyping, setIsTyping] = useState(false);
    const [currentTypingMessage, setCurrentTypingMessage] = useState('');

    useEffect(() => {
        // Initialize speech recognition
        if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = false;
            recognitionRef.current.interimResults = false;
            
            recognitionRef.current.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                setInput(transcript);
                setIsListening(false);
            };
            
            recognitionRef.current.onerror = (event) => {
                console.error('Speech recognition error', event.error);
                setIsListening(false);
            };
            
            recognitionRef.current.onend = () => {
                setIsListening(false);
            };
        }

        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.abort();
            }
        };
    }, []);

    useEffect(() => {
        const fetchMessages = async () => {
            try {
                const response = await axios.get('http://127.0.0.1:5000/api/chat/getMessages');
                if (response.data.success) {
                    // Update the welcome message based on current language
                    const updatedMessages = response.data.messages.map(message => {
                        if (message.sender === 'bot' && message.text.includes("Hello! I'm your AI meal planner")) {
                            return {
                                ...message,
                                text: language === 'en-US' 
                                    ? "Hello! I'm your AI meal planner. I can help you create personalized meal plans, generate shopping lists, and provide nutrition advice based on your dietary preferences and health goals. What would you like to plan today?" 
                                    : "नमस्ते! मैं आपका AI भोजन योजनाकार हूं। मैं आपकी आहार प्राथमिकताओं और स्वास्थ्य लक्ष्यों के आधार पर व्यक्तिगत भोजन योजना, शॉपिंग सूची, और पोषण सलाह प्रदान कर सकता हूं। आज आप क्या योजना बनाना चाहते हैं?"
                            };
                        }
                        return message;
                    });
                    setMessages(updatedMessages);
                    setCompletedMessages(updatedMessages);
                }
            } catch (error) {
                console.error('Error fetching messages:', error);
                // Set default message in case of error
                const defaultMessage = { 
                    text: language === 'en-US' 
                        ? "Hello! I'm your AI meal planner. I can help you create personalized meal plans, generate shopping lists, and provide nutrition advice based on your dietary preferences and health goals. What would you like to plan today?" 
                        : "नमस्ते! मैं आपका AI भोजन योजनाकार हूं। मैं आपकी आहार प्राथमिकताओं और स्वास्थ्य लक्ष्यों के आधार पर व्यक्तिगत भोजन योजना, शॉपिंग सूची, और पोषण सलाह प्रदान कर सकता हूं। आज आप क्या योजना बनाना चाहते हैं?", 
                    sender: "bot" 
                };
                setMessages([defaultMessage]);
                setCompletedMessages([defaultMessage]);
            }
        };

        fetchMessages();
    }, [language]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const toggleListening = () => {
        if (isListening) {
            recognitionRef.current.stop();
            setIsListening(false);
        } else {
            try {
                recognitionRef.current.lang = language;
                recognitionRef.current.start();
                setIsListening(true);
            } catch (error) {
                console.error('Speech recognition error:', error);
            }
        }
    };

    const handleLanguageChange = (e) => {
        setLanguage(e.target.value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMessage = { text: input, sender: 'user' };
        setMessages(prev => [...prev, userMessage]);
        setCompletedMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            await axios.post('http://127.0.0.1:5000/api/chat/saveMessage', 
                { message: input, sender: 'user', language }
            );
            
            const botResponse = await axios.post('http://127.0.0.1:5000/api/chat/generateResponse', 
                { message: input, language }
            );
            
            const botMessage = { text: botResponse.data.message, sender: 'bot' };
            
            // Start typing effect
            setIsTyping(true);
            setCurrentTypingMessage(botMessage.text);
            
            // Add the message to the visible messages (will be shown with typing effect)
            setMessages(prev => [...prev, botMessage]);
            
            // After typing is complete, the effect will add to completedMessages
            setTimeout(() => {
                setCompletedMessages(prev => [...prev, botMessage]);
                setIsTyping(false);
                setCurrentTypingMessage('');
            }, botMessage.text.length * 15 + 500); // approximate typing time plus a buffer

            await axios.post('http://127.0.0.1:5000/api/chat/saveMessage', 
                { message: botMessage.text, sender: 'bot', language }
            );
        } catch (error) {
            console.error('Error during chat:', error);
            const errorMessage = { 
                text: language === 'en-US' 
                    ? 'Sorry, I encountered an error while planning your meals. Please try again.'
                    : 'क्षमा करें, भोजन योजना बनाते समय मुझे एक त्रुटि मिली। कृपया पुनः प्रयास करें।',
                sender: 'bot',
                error: true
            };
            setMessages(prev => [...prev, errorMessage]);
            setCompletedMessages(prev => [...prev, errorMessage]);
        }
        setIsLoading(false);
    };

    return (
        <div className={`p-8 mt-16 top-0 pt-8 transition-colors duration-500 ${
            darkMode 
                ? 'bg-[#0f172a]' 
                : 'bg-[#f0f9ff]'
        }`}>
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className={`max-w-4xl mt-18 mx-auto rounded-2xl overflow-hidden shadow-2xl flex flex-col h-[80vh] transition-all duration-300 ${
                    darkMode 
                        ? 'bg-[#1e293b] border border-[#334155]' 
                        : 'bg-white border border-[#e2e8f0]'
                }`}
            >
                {/* Header */}
                <div className={`p-4 flex justify-between items-center transition-colors duration-300 ${
                    darkMode 
                        ? 'bg-[#0f172a] border-b border-[#334155]' 
                        : 'bg-[#f8fafc] border-b border-[#e2e8f0]'
                }`}>
                    <motion.h3 
                        className={`text-xl font-semibold flex items-center gap-2 transition-colors duration-300 ${
                            darkMode ? 'text-[#93c5fd]' : 'text-[#0f172a]'
                        }`}
                        whileHover={{ scale: 1.02 }}
                    >
                        <UtensilsCrossed className={`${darkMode ? 'text-orange-400' : 'text-orange-600'}`} size={20} />
                        {language === 'en-US' ? 'AI Meal Planner' : 'AI भोजन योजनाकार'}
                    </motion.h3>
                    <div className="flex items-center space-x-3">
                        <motion.select 
                            value={language} 
                            onChange={handleLanguageChange}
                            whileHover={{ scale: 1.05 }}
                            className={`rounded-lg px-3 py-1.5 text-sm focus:outline-none transition-colors duration-300 ${
                                darkMode 
                                    ? 'bg-[#334155] text-white border border-[#475569]' 
                                    : 'bg-[#f1f5f9] text-[#334155] border border-[#e2e8f0]'
                            }`}
                        >
                            <option value="en-US">English</option>
                            <option value="hi-IN">हिंदी</option>
                        </motion.select>
                        {/* History button removed */}
                    </div>
                </div>

                {/* Messages */}
                <div className={`flex-1 overflow-y-auto p-4 md:p-6 space-y-4 transition-colors duration-300 ${
                    darkMode ? 'bg-[#1e293b]' : 'bg-white'
                }`} id="message-container">
                    <AnimatePresence>
                        {messages.map((message, index) => {
                            const isCompleted = completedMessages.some(m => 
                                m.text === message.text && m.sender === message.sender
                            );
                            const isLastBotMessage = index === messages.length - 1 && message.sender === 'bot' && !isCompleted;
                            
                            return (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    transition={{ duration: 0.3, delay: index * 0.05 }}
                                    className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div className={`flex ${message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'} items-start gap-2 max-w-[85%] md:max-w-[75%]`}>
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center mt-1 flex-shrink-0 ${
                                            message.sender === 'user'
                                                ? darkMode ? 'bg-[#3b82f6]' : 'bg-[#2563eb]'
                                                : darkMode ? 'bg-[#475569]' : 'bg-[#64748b]'
                                        }`}>
                                            {message.sender === 'user' 
                                                ? <User size={14} className="text-white" /> 
                                                : <Bot size={14} className="text-white" />
                                            }
                                        </div>
                                        <div
                                            className={`rounded-2xl p-4 shadow-sm ${
                                                message.sender === 'user'
                                                    ? darkMode 
                                                        ? 'bg-[#3b82f6] text-white' 
                                                        : 'bg-[#2563eb] text-white'
                                                    : darkMode 
                                                        ? 'bg-[#334155] text-gray-100'
                                                        : 'bg-[#f1f5f9] text-[#334155]'
                                            } ${message.error ? '!bg-red-500 text-white' : ''}`}
                                        >
                                            {message.sender === 'user' || isCompleted ? (
                                                <div className="prose-sm prose-headings:my-2 prose-p:my-1 prose-ul:my-1 prose-ol:my-1">
                                                    <ReactMarkdown>{message.text}</ReactMarkdown>
                                                </div>
                                            ) : (
                                                <TypingEffect text={message.text} />
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                    
                    <AnimatePresence>
                        {isLoading && (
                            <motion.div 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="flex justify-start"
                            >
                                <div className="flex items-start gap-2">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center mt-1 ${
                                        darkMode ? 'bg-[#475569]' : 'bg-[#64748b]'
                                    }`}>
                                        <Bot size={14} className="text-white" />
                                    </div>
                                    <div className={`rounded-2xl p-3 shadow-sm ${
                                        darkMode ? 'bg-[#334155] text-[#93c5fd]' : 'bg-[#f1f5f9] text-[#334155]'
                                    }`}>
                                        <div className="flex items-center gap-2">
                                            <Loader2 className="animate-spin" size={16} />
                                            <span>
                                                {language === 'en-US' ? 'Planning your meals...' : 'आपके भोजन की योजना बना रहा है...'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                    <div ref={chatEndRef} />
                </div>

                {/* Input */}
                <form onSubmit={handleSubmit} className={`p-4 transition-colors duration-300 ${
                    darkMode 
                        ? 'bg-[#0f172a] border-t border-[#334155]' 
                        : 'bg-[#f8fafc] border-t border-[#e2e8f0]'
                }`}>
                    <div className="flex gap-2 items-center">
                        <div className="relative flex-1">
                            <motion.input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder={language === 'en-US' ? "Ask about meal planning, nutrition, or dietary preferences..." : "भोजन योजना, पोषण, या आहार प्राथमिकताओं के बारे में पूछें..."}
                                className={`w-full rounded-full px-4 py-3 pr-12 focus:outline-none transition-colors duration-300 ${
                                    darkMode
                                        ? 'bg-[#334155] text-white border border-[#475569] focus:border-[#3b82f6]'
                                        : 'bg-[#f1f5f9] text-[#334155] border border-[#e2e8f0] focus:border-[#2563eb]'
                                }`}
                                whileFocus={{ scale: 1.01 }}
                            />
                            <motion.button
                                type="button"
                                onClick={toggleListening}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                className={`absolute right-3 top-1/2 transform -translate-y-1/2 rounded-full p-2 transition-colors duration-300
                                    ${isListening 
                                        ? 'text-red-500'  
                                        : darkMode 
                                            ? 'text-[#93c5fd] hover:bg-[#475569]' 
                                            : 'text-[#0369a1] hover:bg-[#e2e8f0]'
                                    }`}
                            >
                                {isListening ? <MicOff size={18} /> : <Mic size={18} />}
                            </motion.button>
                        </div>
                        <motion.button
                            type="submit"
                            disabled={isLoading}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className={`rounded-full p-3 transition-all duration-300 ${
                                darkMode
                                    ? 'bg-[#3b82f6] hover:bg-[#2563eb] text-white'
                                    : 'bg-[#2563eb] hover:bg-[#1d4ed8] text-white'
                            } ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                            <Send size={20} />
                        </motion.button>
                    </div>
                </form>
            </motion.div>
            
            {/* Applied custom scrollbar styling for the message container */}
            <style jsx="true">{`
                #message-container::-webkit-scrollbar {
                    width: 6px;
                }
                #message-container::-webkit-scrollbar-track {
                    background: transparent;
                }
                #message-container::-webkit-scrollbar-thumb {
                    background: ${darkMode ? 'rgba(59, 130, 246, 0.3)' : 'rgba(37, 99, 235, 0.2)'};
                    border-radius: 10px;
                }
                #message-container::-webkit-scrollbar-thumb:hover {
                    background: ${darkMode ? 'rgba(59, 130, 246, 0.5)' : 'rgba(37, 99, 235, 0.3)'};
                }
            `}</style>
        </div>
    );
}