import React from "react";
import {
  ChefHat,
  ShoppingCart,
  Home,
  Brain,
  Heart,
  Target,
  Users,
  Settings,
  LogIn,
  UserPlus,
  Menu,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { name: "Home", icon: Home, path: "/" },
    { name: "User Profile", icon: Users, path: "/profile" },
    { name: "Preferences", icon: Settings, path: "/preferences" },
    { name: "AI Meal Plans", icon: ChefHat, path: "/ai-meal-plans" }, // Example path
    { name: "Shopping List", icon: ShoppingCart, path: "/shopping-list" },
    { name: "Meal History", icon: Brain, path: "/meal-history" }, // Example path
    { name: "Nutrition Tracker", icon: Heart, path: "/nutrition-tracker" },
    { name: "AI Summary", icon: Target, path: "/ai-summary" }, // Example path
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl border-b border-pink-100/50 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between lg:justify-start lg:gap-8">
          {/* Logo and Mobile Menu Button */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-pink-400 to-orange-400 rounded-xl flex items-center justify-center shadow-lg">
              <ChefHat className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-lg font-bold bg-gradient-to-r from-pink-500 to-orange-500 bg-clip-text text-transparent">
              Smart Bite
            </h3>
            <button
              className="lg:hidden ml-4 p-2 rounded-md text-gray-600 hover:bg-pink-50 hover:text-pink-500"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex flex-1 space-x-4 xl:space-x-6">
            {navItems.map((item) => (
              <button
                key={item.name}
                onClick={() => navigate(item.path)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors duration-200 text-sm ${
                  isActive(item.path)
                    ? "bg-gradient-to-r from-pink-100 to-orange-100 text-pink-700 font-bold shadow-sm"
                    : "text-gray-600 hover:bg-pink-50 hover:text-pink-500 font-medium"
                }`}
              >
                <item.icon className="w-4 h-4" />
                <span>{item.name}</span>
              </button>
            ))}
          </nav>

          {/* Desktop Auth Buttons */}
          <div className="hidden lg:flex items-center gap-3 ml-auto">
            <button
              onClick={() => navigate("/signin")}
              className="px-4 py-2 text-gray-600 hover:text-pink-500 transition-colors font-medium rounded-xl hover:bg-pink-50"
            >
              <LogIn className="w-4 h-4 mr-1 inline" />
              Sign In
            </button>
            <button
              onClick={() => navigate("/signup")}
              className="px-6 py-2.5 bg-gradient-to-r from-pink-400 to-orange-400 text-white rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all duration-200"
            >
              <UserPlus className="w-4 h-4 mr-1 inline" />
              Start Free
            </button>
          </div>

          {/* Mobile Auth Buttons (visible on mobile only, originally from your mobile header) */}
          <div className="lg:hidden flex items-center gap-2">
            <button
              onClick={() => navigate("/signin")}
              className="px-3 py-1.5 text-gray-600 hover:text-pink-500 transition-colors font-medium rounded-lg hover:bg-pink-50 text-sm"
            >
              Sign In
            </button>
            <button
              onClick={() => navigate("/signup")}
              className="px-4 py-1.5 bg-gradient-to-r from-pink-400 to-orange-400 text-white rounded-lg font-semibold hover:shadow-lg hover:scale-105 transition-all duration-200 text-sm"
            >
              Start Free
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40" onClick={() => setIsMobileMenuOpen(false)}></div>
      )}
      {isMobileMenuOpen && (
        <nav className="lg:hidden fixed top-0 right-0 w-64 h-full bg-white/95 backdrop-blur-xl border-l border-pink-100/50 shadow-lg p-6 flex flex-col z-50 animate-slide-in-right">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold bg-gradient-to-r from-pink-500 to-orange-500 bg-clip-text text-transparent">
              Navigation
            </h3>
            <button
              className="p-2 rounded-md text-gray-600 hover:bg-pink-50 hover:text-pink-500"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <Menu className="w-6 h-6 transform rotate-90" /> {/* Can use X icon */}
            </button>
          </div>
          <ul className="space-y-4 flex-1">
            {navItems.map((item) => (
              <li key={item.name}>
                <button
                  onClick={() => {
                    navigate(item.path);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-all duration-200 ${
                    isActive(item.path)
                      ? "bg-gradient-to-r from-pink-100 to-orange-100 text-pink-700 font-bold shadow-md"
                      : "text-gray-600 hover:bg-pink-50 hover:text-pink-500 font-medium"
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </button>
              </li>
            ))}
          </ul>
          <div className="mt-auto pt-6 border-t border-pink-100">
            <button className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-gray-600 hover:bg-pink-50 hover:text-pink-500 transition-colors font-medium">
              <LogIn className="w-5 h-5" />
              Sign Out
            </button>
          </div>
        </nav>
      )}
    </header>
  );
}