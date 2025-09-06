import React from "react";
import { Menu, LogIn, UserPlus, ChefHat } from "lucide-react";
// import ThemeToggle from "./ThemeToggle"; // Uncomment if you want ThemeToggle in the Header

// Header now receives openMobileMenu and navigate props
export default function Header({ openMobileMenu, navigate }) {
  // You might want to get isDarkMode from context or a prop if you re-implement theme here
  const isDarkMode = false; // Placeholder for theme state

  return (
    <>
      {/* Mobile Header - Only visible on mobile */}
      <header className={`lg:hidden fixed top-0 left-0 right-0 z-50 ${isDarkMode ? "bg-gray-800 text-gray-100 border-gray-700" : "bg-white/90 backdrop-blur-xl border-b border-pink-100/50 shadow-sm"}`}>
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={openMobileMenu} // This button opens the mobile menu
                className={`p-2 rounded-lg ${isDarkMode ? "hover:bg-gray-700" : "hover:bg-pink-50"} transition-colors touch-target`}
              >
                <Menu className={`h-6 w-6 ${isDarkMode ? "text-gray-100" : "text-gray-600"}`} />
              </button>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-pink-400 to-orange-400 rounded-xl flex items-center justify-center shadow-lg">
                  <ChefHat className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-bold bg-gradient-to-r from-pink-500 to-orange-500 bg-clip-text text-transparent">Smart Bite</h3>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {/* <ThemeToggle isDarkMode={isDarkMode} toggleDarkMode={() => {}} /> */} {/* Uncomment and pass actual toggle function */}
              <button
                onClick={() => navigate("/signin")} // Corrected navigation
                className={`px-3 py-1.5 ${isDarkMode ? "text-gray-300 hover:text-pink-400 hover:bg-gray-700" : "text-gray-600 hover:text-pink-500 hover:bg-pink-50"} transition-colors font-medium rounded-lg text-sm`}
              >
                Sign In
              </button>
              <button
                onClick={() => navigate("/signup")} // Corrected navigation
                className="px-4 py-1.5 bg-gradient-to-r from-pink-400 to-orange-400 text-white rounded-lg font-semibold hover:shadow-lg hover:scale-105 transition-all duration-200 text-sm"
              >
                Start Free
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Desktop Header - Only visible on large screens */}
      <header className={`hidden lg:block fixed top-0 right-0 w-[calc(100%-16rem)] z-50 ${isDarkMode ? "bg-gray-800 text-gray-100 border-gray-700" : "bg-white/90 backdrop-blur-xl border-b border-pink-100/50 shadow-sm"}`}>
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-end">
            <div className="flex items-center gap-3">
              {/* <ThemeToggle isDarkMode={isDarkMode} toggleDarkMode={() => {}} /> */} {/* Uncomment and pass actual toggle function */}
              <button
                onClick={() => navigate("/signin")} // Corrected navigation
                className={`px-4 py-2 ${isDarkMode ? "text-gray-300 hover:text-pink-400 hover:bg-gray-700" : "text-gray-600 hover:text-pink-500 hover:bg-pink-50"} transition-colors font-medium rounded-xl`}
              >
                <LogIn className="w-4 h-4 mr-1 inline" />
                Sign In
              </button>
              <button
                onClick={() => navigate("/signup")} // Corrected navigation
                className="px-6 py-2.5 bg-gradient-to-r from-pink-400 to-orange-400 text-white rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all duration-200"
              >
                <UserPlus className="w-4 h-4 mr-1 inline" />
                Start Free
              </button>
            </div>
          </div>
        </div>
      </header>
    </>
  );
}