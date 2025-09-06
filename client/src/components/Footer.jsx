import React from "react";
import { ChefHat } from "lucide-react";

export default function Footer({ isDarkMode }) {
  return (
    <footer className={`${isDarkMode ? "bg-gray-800 text-gray-300 border-gray-700" : "bg-white text-gray-800 border-pink-100"} py-14 border-t`}>
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-4 gap-10">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-pink-400 to-orange-400 rounded-xl flex items-center justify-center shadow-lg">
                <ChefHat className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-black">Smart Bite</h3>
                <p className={`${isDarkMode ? "text-gray-400" : "text-gray-500"} text-xs font-medium`}>AI Nutrition</p>
              </div>
            </div>
            <p className={`${isDarkMode ? "text-gray-400" : "text-gray-600"} font-medium text-sm`}>
              Intelligent nutrition planning for a healthier, happier you. Powered by cutting-edge AI technology.
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="text-lg font-bold">Product</h4>
            <div className="space-y-2">
              {['Features', 'Pricing', 'API', 'Integrations'].map(item => (
                <button key={item} className={`block ${isDarkMode ? "text-gray-400 hover:text-pink-400" : "text-gray-600 hover:text-pink-500"} transition-colors font-medium text-sm`}>{item}</button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-lg font-bold">Company</h4>
            <div className="space-y-2">
              {['About Us', 'Careers', 'Blog', 'Press'].map(item => (
                <button key={item} className={`block ${isDarkMode ? "text-gray-400 hover:text-pink-400" : "text-gray-600 hover:text-pink-500"} transition-colors font-medium text-sm`}>{item}</button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-lg font-bold">Support</h4>
            <div className="space-y-2">
              {['Help Center', 'Contact Us', 'Privacy Policy', 'Terms of Service'].map(item => (
                <button key={item} className={`block ${isDarkMode ? "text-gray-400 hover:text-pink-400" : "text-gray-600 hover:text-pink-500"} transition-colors font-medium text-sm`}>{item}</button>
              ))}
            </div>
          </div>
        </div>

        <div className={`border-t ${isDarkMode ? "border-gray-700" : "border-pink-200"} mt-10 pt-7 text-center`}>
          <p className={`${isDarkMode ? "text-gray-400" : "text-gray-600"} font-medium text-sm`}>© 2025 Smart Bite. All rights reserved. Made with ❤️ for healthier living.</p>
        </div>
      </div>
    </footer>
  );
}