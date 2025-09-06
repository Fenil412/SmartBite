import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { X, ChefHat, Home, Users, Settings, ShoppingCart, Brain, Heart, Target, Book, Timer, LogIn, UserPlus } from "lucide-react";

const MobileMenu = ({ isOpen, onClose, sidebarItems = [], user, isAuthenticated, isAdmin, onLogout }) => {
  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isOpen && !event.target.closest('.mobile-menu-container')) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="lg:hidden fixed inset-0 z-50 mobile-menu-container">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm mobile-backdrop-fade-in"
        onClick={onClose}
      ></div>
      
      {/* Mobile Menu Panel */}
      <div className="absolute top-0 left-0 h-full w-80 max-w-[85vw] bg-white shadow-2xl mobile-menu-slide-in">
        <div className="flex flex-col h-full">
          {/* Mobile Menu Header */}
          <div className="flex items-center justify-between p-6 border-b border-pink-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-pink-400 to-orange-400 rounded-xl flex items-center justify-center shadow-lg">
                <ChefHat className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold bg-gradient-to-r from-pink-500 to-orange-500 bg-clip-text text-transparent">Smart Bite</h3>
                <p className="text-xs text-gray-500">AI Nutrition</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-pink-50 transition-colors touch-target"
            >
              <X className="h-6 w-6 text-gray-600" />
            </button>
          </div>

          {/* Mobile Menu Content */}
          <div className="flex-1 overflow-y-auto p-6 smooth-scroll">
            <nav className="space-y-2">
              {sidebarItems.map((item, index) => (
                <button
                  key={index}
                  className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-gray-600 hover:bg-pink-50 hover:text-pink-500 transition-all duration-200 font-medium touch-target"
                  onClick={() => {
                    onClose();
                    if (item.onClick) {
                      item.onClick();
                    }
                  }}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </button>
              ))}
            </nav>

            {/* User Info Section */}
            {isAuthenticated && user && (
              <div className="mt-8 pt-6 border-t border-pink-100">
                <div className="px-4 py-3 bg-gradient-to-r from-pink-50 to-orange-50 rounded-xl">
                  <p className="text-sm font-medium text-gray-900">
                    Welcome back!
                  </p>
                  <p className="text-lg font-bold text-pink-600">
                    {user.username || "User"}
                  </p>
                </div>
                <button
                  className="w-full mt-4 flex items-center justify-center gap-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-red-50 hover:text-red-600 transition-all duration-200 font-medium border border-gray-200 touch-target"
                  onClick={() => {
                    onLogout();
                    onClose();
                  }}
                >
                  <X className="w-5 h-5" />
                  Logout
                </button>
              </div>
            )}

            {/* Auth Section for non-authenticated users */}
            {!isAuthenticated && (
              <div className="mt-8 pt-6 border-t border-pink-100">
                <Link 
                  to="/signin"
                  onClick={onClose}
                  className="block"
                >
                  <button className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl text-gray-600 hover:bg-pink-50 hover:text-pink-500 transition-colors font-medium touch-target">
                    <LogIn className="w-5 h-5" />
                    Sign In
                  </button>
                </Link>
                <Link 
                  to="/signup" 
                  onClick={onClose}
                  className="block mt-3"
                >
                  <button className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-pink-400 to-orange-400 text-white font-semibold hover:shadow-lg hover:scale-105 transition-all duration-200 touch-target">
                    <UserPlus className="w-5 h-5" />
                    Start Free
                  </button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileMenu;
