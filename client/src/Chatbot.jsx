import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Send, UtensilsCrossed, Bot, User, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

axios.defaults.withCredentials = false;

const TypingEffect = ({ text }) => {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < text.length) {
      const typingTimer = setTimeout(() => {
        setDisplayedText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, 15);
      return () => clearTimeout(typingTimer);
    }
  }, [currentIndex, text]);

  return (
    <div className="prose-sm prose-headings:my-2 prose-p:my-1 prose-ul:my-1 prose-ol:my-1">
      <ReactMarkdown>{displayedText}</ReactMarkdown>
    </div>
  );
};

export default function Chatbot({ darkMode }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [language, setLanguage] = useState('en-US');
  const chatEndRef = useRef(null);
  const navigate = useNavigate();
  const recognitionRef = useRef(null);
  const [completedMessages, setCompletedMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [currentTypingMessage, setCurrentTypingMessage] = useState('');

  const lightPinkBg = '#ffeaf2';
  const softPinkBg = '#fff0f5';
  const headerPinkBg = '#fde2eb';
  const accentPink = '#ff69b4';
  const lightAccentPink = '#ff99cc';
  const textDark = '#333333';
  const textMedium = '#555555';
  const borderLight = '#f8d9e5';
  const botBubbleBg = '#fefefe';

  useEffect(() => {
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

      recognitionRef.current.onend = () => setIsListening(false);
    }

    return () => recognitionRef.current?.abort();
  }, []);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:5000/api/chat/getMessages');
        if (response.data.success) {
          const updatedMessages = response.data.messages.map(message => {
            if (message.sender === 'bot' && message.text.includes("Hello! I'm your AI meal planner")) {
              return {
                ...message,
                text: language === 'en-US'
                  ? "Hello! I'm your AI meal planner..."
                  : "नमस्ते! मैं आपका AI भोजन योजनाकार हूं..."
              };
            }
            return message;
          });
          setMessages(updatedMessages);
          setCompletedMessages(updatedMessages);
        }
      } catch (error) {
        console.error('Error fetching messages:', error);
        const defaultMessage = {
          text: language === 'en-US'
            ? "Hello! I'm your AI meal planner..."
            : "नमस्ते! मैं आपका AI भोजन योजनाकार हूं...",
          sender: "bot"
        };
        setMessages([defaultMessage]);
        setCompletedMessages([defaultMessage]);
      }
    };

    fetchMessages();
  }, [language]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { text: input, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    setCompletedMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      await axios.post('http://127.0.0.1:5000/api/chat/saveMessage', { message: input, sender: 'user', language });
      const botResponse = await axios.post('http://127.0.0.1:5000/api/chat/generateResponse', { message: input, language });

      const botMessage = { text: botResponse.data.message, sender: 'bot' };
      setIsTyping(true);
      setCurrentTypingMessage(botMessage.text);
      setMessages(prev => [...prev, botMessage]);

      setTimeout(() => {
        setCompletedMessages(prev => [...prev, botMessage]);
        setIsTyping(false);
        setCurrentTypingMessage('');
      }, botMessage.text.length * 15 + 500);

      await axios.post('http://127.0.0.1:5000/api/chat/saveMessage', { message: botMessage.text, sender: 'bot', language });
    } catch (error) {
      console.error('Error during chat:', error);
      const errorMessage = {
        text: language === 'en-US'
          ? 'Sorry, I encountered an error while planning your meals.'
          : 'क्षमा करें, भोजन योजना बनाते समय मुझे एक त्रुटि मिली।',
        sender: 'bot',
        error: true
      };
      setMessages(prev => [...prev, errorMessage]);
      setCompletedMessages(prev => [...prev, errorMessage]);
    }
    setIsLoading(false);
  };

  return (
    <div className="p-8 mt-16 pt-8 transition-colors duration-500"
      style={{ backgroundColor: darkMode ? '#0f172a' : lightPinkBg }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto rounded-2xl overflow-hidden shadow-2xl flex flex-col h-[80vh] transition-all duration-300"
        style={{
          backgroundColor: darkMode ? '#1e293b' : softPinkBg,
          border: `1px solid ${darkMode ? '#334155' : borderLight}`
        }}
      >
        {/* Header */}
        <div className="p-4 flex justify-between items-center transition-colors duration-300"
          style={{
            backgroundColor: darkMode ? '#0f172a' : headerPinkBg,
            borderBottom: `1px solid ${darkMode ? '#334155' : borderLight}`
          }}>
          <motion.h3
            className="text-xl font-semibold flex items-center gap-2 transition-colors duration-300"
            style={{ color: darkMode ? '#93c5fd' : textDark }}
            whileHover={{ scale: 1.02 }}
          >
            <UtensilsCrossed style={{ color: darkMode ? 'orange' : accentPink }} size={20} />
            {language === 'en-US' ? 'AI Meal Planner' : 'AI भोजन योजनाकार'}
          </motion.h3>
          <div className="flex items-center space-x-3">
            <motion.select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              whileHover={{ scale: 1.05 }}
              className="rounded-lg px-3 py-1.5 text-sm focus:outline-none transition-colors duration-300"
              style={{
                backgroundColor: darkMode ? '#334155' : 'white',
                color: darkMode ? 'white' : textDark,
                border: `1px solid ${darkMode ? '#475569' : borderLight}`
              }}
            >
              <option value="en-US">English</option>
              <option value="hi-IN">हिंदी</option>
            </motion.select>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 transition-colors duration-300"
          style={{ backgroundColor: darkMode ? '#1e293b' : softPinkBg }}
          id="message-container">
          <AnimatePresence>
            {messages.map((message, index) => {
              const isCompleted = completedMessages.some(m =>
                m.text === message.text && m.sender === message.sender
              );

              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex ${message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'} items-start gap-2 max-w-[85%] md:max-w-[75%]`}>
                    <div className="w-8 h-8 rounded-full flex items-center justify-center mt-1 flex-shrink-0"
                      style={{ backgroundColor: message.sender === 'user' ? accentPink : lightAccentPink }}>
                      {message.sender === 'user'
                        ? <User size={14} className="text-white" />
                        : <Bot size={14} className="text-white" />}
                    </div>
                    <div className="rounded-2xl p-4 shadow-sm"
                      style={{
                        backgroundColor: message.sender === 'user' ? accentPink : botBubbleBg,
                        color: message.sender === 'user' ? 'white' : textDark,
                        border: message.error ? '1px solid red' : 'none'
                      }}
                    >
                      {message.sender === 'user' || isCompleted
                        ? <div className="prose-sm"><ReactMarkdown>{message.text}</ReactMarkdown></div>
                        : <TypingEffect text={message.text} />}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {/* Loading */}
          <AnimatePresence>
            {isLoading && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex justify-start">
                <div className="flex items-start gap-2">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center mt-1" style={{ backgroundColor: lightAccentPink }}>
                    <Bot size={14} className="text-white" />
                  </div>
                  <div className="rounded-2xl p-3 shadow-sm" style={{ backgroundColor: botBubbleBg, color: textMedium }}>
                    <div className="flex items-center gap-2">
                      <Loader2 className="animate-spin" size={16} style={{ color: accentPink }} />
                      <span>{language === 'en-US' ? 'Planning your meals...' : 'आपके भोजन की योजना बना रहा है...'}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <div ref={chatEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSubmit} className="p-4 transition-colors duration-300"
          style={{
            backgroundColor: darkMode ? '#0f172a' : headerPinkBg,
            borderTop: `1px solid ${darkMode ? '#334155' : borderLight}`
          }}>
          <div className="flex gap-2 items-center">
            <div className="relative flex-1">
              <motion.input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={language === 'en-US' ? "Ask about meal planning..." : "भोजन योजना..."}
                className="w-full rounded-full px-4 py-3 pr-12 focus:outline-none transition-colors duration-300"
                style={{
                  backgroundColor: darkMode ? '#334155' : 'white',
                  color: darkMode ? 'white' : textDark,
                  border: `1px solid ${darkMode ? '#475569' : borderLight}`
                }}
                whileFocus={{ scale: 1.01 }}
              />
              <motion.button
                type="button"
                onClick={toggleListening}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 rounded-full p-2 transition-colors duration-300"
                style={{
                  color: isListening ? '#ef4444' : (darkMode ? '#93c5fd' : accentPink),
                  backgroundColor: 'transparent'
                }}
              >
                {isListening ? <MicOff size={18} /> : <Mic size={18} />}
              </motion.button>
            </div>
            <motion.button type="submit" disabled={isLoading} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              className="rounded-full p-3 transition-all duration-300"
              style={{ backgroundColor: accentPink, color: 'white' }}>
              <Send size={20} />
            </motion.button>
          </div>
        </form>
      </motion.div>

      {/* Custom Scrollbar */}
      <style jsx="true">{`
        #message-container::-webkit-scrollbar { width: 6px; }
        #message-container::-webkit-scrollbar-track { background: transparent; }
        #message-container::-webkit-scrollbar-thumb {
          background: ${darkMode ? 'rgba(59, 130, 246, 0.3)' : 'rgba(255, 105, 180, 0.4)'};
          border-radius: 10px;
        }
        #message-container::-webkit-scrollbar-thumb:hover {
          background: ${darkMode ? 'rgba(59, 130, 246, 0.5)' : 'rgba(255, 105, 180, 0.6)'};
        }
      `}</style>
    </div>
  );
}
