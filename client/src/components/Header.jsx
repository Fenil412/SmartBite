import React, { useState } from "react";
import { Menu, LogIn, UserPlus, ChefHat, X } from "lucide-react"; // X for close icon
import { useNavigate, NavLink } from "react-router-dom"; // Use NavLink for active styling
import { useAuth } from "../contexts/AuthContext";
import { useAdmin } from "../contexts/AdminContext"; // Assuming AdminContext is available to check admin status

export default function Header({ navItems }) {
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAuth();
  //const { isAdmin } = useAdmin(); // Get admin status
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLeftMenuOpen, setIsLeftMenuOpen] = useState(false); // New state for the left menu
  const [activePredictionDropdown, setActivePredictionDropdown] = useState(false);

  const isDarkMode = false; // Placeholder for theme state

  const handleLogout = async () => {
    if (window.confirm("Are you sure you want to logout?")) {
      await logout();
      navigate("/signin"); // Redirect to signin after logout
    }
  };

  // Filter nav items based on authentication and admin status
  const getFilteredNavItems = (items) => {
    return items.filter(item => {
      // If item has children, filter its children recursively
      if (item.children) {
        item.children = getFilteredNavItems(item.children);
        return item.children.length > 0 || !item.route; // Keep parent if children exist or if it's just a category
      }
      // If it's an admin-only route, show only if admin
      //if (item.adminOnly && !isAdmin) return false;
      // You can add more logic here for protected routes if needed,
      // but ProtectedRoute handles it at the router level.
      return true;
    });
  };

  const filteredNavItems = getFilteredNavItems(navItems);

  // Close left menu and prediction dropdown when navigating
  const handleNavigation = (route) => {
    setIsLeftMenuOpen(false);
    setActivePredictionDropdown(false);
    navigate(route);
  };

  return (
    <>
      {/* Desktop Header - Always visible */}
      <header className={`fixed top-0 left-0 right-0 z-50 ${isDarkMode ? "bg-gray-800 text-gray-100 border-gray-700" : "bg-white/90 backdrop-blur-xl border-b border-pink-100/50 shadow-sm"}`}>
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            {/* New Left Menu Button for Desktop */}
            <div className="hidden lg:flex items-center gap-3"> {/* Hidden on mobile, visible on large screens */}
              <button
                onClick={() => setIsLeftMenuOpen(true)}
                className={`p-2 rounded-lg ${isDarkMode ? "hover:bg-gray-700" : "hover:bg-pink-50"} transition-colors touch-target`}
                aria-label="Open navigation menu"
              >
                <Menu className={`h-6 w-6 ${isDarkMode ? "text-gray-100" : "text-gray-600"}`} />
              </button>
            </div>

            <div className="flex items-center gap-3">
              {/* Logo and App Name */}
              <button
                onClick={() => navigate("/")}
                className="flex items-center gap-2"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-pink-400 to-orange-400 rounded-xl flex items-center justify-center shadow-lg">
                  <ChefHat className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-bold bg-gradient-to-r from-pink-500 to-orange-500 bg-clip-text text-transparent">Smart Bite</h3>
              </button>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-6 ml-auto">
              {filteredNavItems.map((item, index) => (
                item.children ? (
                  // Dropdown for Prediction
                  <div key={index} className="relative">
                    <button
                      onClick={() => setActivePredictionDropdown(!activePredictionDropdown)}
                      className={`flex items-center gap-1 px-3 py-2 rounded-lg transition-colors
                        ${isDarkMode ? "text-gray-300 hover:text-pink-400 hover:bg-gray-700" : "text-gray-600 hover:text-pink-500 hover:bg-pink-50"}
                        ${activePredictionDropdown ? (isDarkMode ? "text-pink-400 bg-gray-700" : "text-pink-500 bg-pink-50") : ""}
                      `}
                    >
                      <item.icon className="w-4 h-4" />
                      {item.name}
                      <svg className={`ml-1 w-4 h-4 transition-transform ${activePredictionDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                    </button>
                    {activePredictionDropdown && (
                      <div className={`absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1
                        ${isDarkMode ? "bg-gray-800 border border-gray-700" : "bg-white border border-gray-200"}
                        origin-top-right ring-1 ring-black ring-opacity-5 focus:outline-none`}
                      >
                        {item.children.map((child, childIndex) => (
                          <NavLink
                            key={childIndex}
                            to={child.route}
                            onClick={() => {
                              setActivePredictionDropdown(false);
                              navigate(child.route);
                            }}
                            className={({ isActive }) =>
                              `block px-4 py-2 text-sm transition-colors flex items-center gap-2
                                ${isDarkMode ? "text-gray-300 hover:bg-gray-700 hover:text-pink-400" : "text-gray-700 hover:bg-pink-50 hover:text-pink-500"}
                                ${isActive ? (isDarkMode ? "bg-gray-700 text-pink-400 font-medium" : "bg-pink-50 text-pink-500 font-medium") : ""}`
                            }
                          >
                            <child.icon className="w-4 h-4" />
                            {child.name}
                          </NavLink>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  // Regular NavLink
                  <NavLink
                    key={index}
                    to={item.route}
                    className={({ isActive }) =>
                      `flex items-center gap-1 px-3 py-2 rounded-lg transition-colors
                        ${isDarkMode ? "text-gray-300 hover:text-pink-400 hover:bg-gray-700" : "text-gray-600 hover:text-pink-500 hover:bg-pink-50"}
                        ${isActive ? (isDarkMode ? "text-pink-400 bg-gray-700 font-medium" : "text-pink-500 bg-pink-50 font-medium") : ""}`
                    }
                  >
                    <item.icon className="w-4 h-4" />
                    {item.name}
                  </NavLink>
                )
              ))}
            </nav>

            {/* Auth Buttons for Desktop */}
            <div className="hidden lg:flex items-center gap-3 ml-6">
              {isAuthenticated ? (
                <button
                  onClick={handleLogout}
                  className={`px-4 py-2 ${isDarkMode ? "text-gray-300 hover:text-pink-400 hover:bg-gray-700" : "text-gray-600 hover:text-pink-500 hover:bg-pink-50"} transition-colors font-medium rounded-xl`}
                >
                  <LogIn className="w-4 h-4 mr-1 inline" />
                  Log Out
                </button>
              ) : (
                <>
                  <button
                    onClick={() => navigate("/signin")}
                    className={`px-4 py-2 ${isDarkMode ? "text-gray-300 hover:text-pink-400 hover:bg-gray-700" : "text-gray-600 hover:text-pink-500 hover:bg-pink-50"} transition-colors font-medium rounded-xl`}
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
                </>
              )}
            </div>

            {/* Mobile Menu Button - Only visible on mobile */}
            <div className="lg:hidden flex items-center gap-2">
              {isAuthenticated ? (
                <button
                  onClick={handleLogout}
                  className={`px-3 py-1.5 ${isDarkMode ? "text-gray-300 hover:text-pink-400 hover:bg-gray-700" : "text-gray-600 hover:text-pink-500 hover:bg-pink-50"} transition-colors font-medium rounded-lg text-sm`}
                >
                  Log Out
                </button>
              ) : (
                <>
                  <button
                    onClick={() => navigate("/signin")}
                    className={`px-3 py-1.5 ${isDarkMode ? "text-gray-300 hover:text-pink-400 hover:bg-gray-700" : "text-gray-600 hover:text-pink-500 hover:bg-pink-50"} transition-colors font-medium rounded-lg text-sm`}
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => navigate("/signup")}
                    className="px-4 py-1.5 bg-gradient-to-r from-pink-400 to-orange-400 text-white rounded-lg font-semibold hover:shadow-lg hover:scale-105 transition-all duration-200 text-sm"
                  >
                    Start Free
                  </button>
                </>
              )}
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className={`p-2 rounded-lg ${isDarkMode ? "hover:bg-gray-700" : "hover:bg-pink-50"} transition-colors touch-target`}
              >
                <Menu className={`h-6 w-6 ${isDarkMode ? "text-gray-100" : "text-gray-600"}`} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Left-Side Desktop Menu Overlay */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 z-50 transform lg:block hidden ${ // Only show on lg and up
          isLeftMenuOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300 ease-in-out`}
        onClick={() => setIsLeftMenuOpen(false)} // Close on overlay click
      >
        <div
          className={`w-64 h-full ${
            isDarkMode ? "bg-gray-900 text-gray-100" : "bg-white text-gray-800"
          } shadow-xl p-6 overflow-y-auto`}
          onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside menu
        >
          <div className="flex justify-between items-center mb-10">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-pink-400 to-orange-400 rounded-xl flex items-center justify-center shadow-lg">
                <ChefHat className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold bg-gradient-to-r from-pink-500 to-orange-500 bg-clip-text text-transparent">Smart Bite</h3>
            </div>
            <button
              onClick={() => setIsLeftMenuOpen(false)}
              className={`p-2 rounded-lg ${isDarkMode ? "hover:bg-gray-700" : "hover:bg-pink-50"} transition-colors`}
            >
              <X className={`h-6 w-6 ${isDarkMode ? "text-gray-100" : "text-gray-600"}`} />
            </button>
          </div>

          <nav className="space-y-4">
            {filteredNavItems.map((item, index) => (
              item.children ? (
                // Left Menu dropdown for Prediction
                <div key={index}>
                  <button
                    onClick={() => setActivePredictionDropdown(!activePredictionDropdown)}
                    className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-all duration-200
                      ${isDarkMode ? "text-gray-300 hover:bg-gray-700 hover:text-pink-400" : "text-gray-600 hover:bg-pink-50 hover:text-pink-500"}
                      ${activePredictionDropdown ? (isDarkMode ? "text-pink-400 bg-gray-700 font-medium" : "text-pink-500 bg-pink-50 font-medium") : ""}`
                    }
                  >
                    <item.icon className="w-5 h-5" />
                    <span>{item.name}</span>
                    <svg className={`ml-auto w-4 h-4 transition-transform ${activePredictionDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                  </button>
                  {activePredictionDropdown && (
                    <div className="pl-6 pt-2 space-y-2">
                      {item.children.map((child, childIndex) => (
                        <NavLink
                          key={childIndex}
                          to={child.route}
                          onClick={() => {
                            setIsLeftMenuOpen(false); // Close left menu
                            setActivePredictionDropdown(false); // Close dropdown
                            navigate(child.route);
                          }}
                          className={({ isActive }) =>
                            `block px-4 py-2 rounded-lg text-sm transition-colors flex items-center gap-2
                              ${isDarkMode ? "text-gray-300 hover:bg-gray-700 hover:text-pink-400" : "text-gray-700 hover:bg-pink-50 hover:text-pink-500"}
                              ${isActive ? (isDarkMode ? "bg-gray-700 text-pink-400 font-medium" : "bg-pink-50 text-pink-500 font-medium") : ""}`
                          }
                        >
                          <child.icon className="w-4 h-4" />
                          {child.name}
                        </NavLink>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                // Regular left menu NavLink
                <NavLink
                  key={index}
                  to={item.route}
                  onClick={() => {
                    setIsLeftMenuOpen(false); // Close left menu on item click
                    navigate(item.route);
                  }}
                  className={({ isActive }) =>
                    `flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-all duration-200
                      ${isDarkMode ? "text-gray-300 hover:bg-gray-700 hover:text-pink-400" : "text-gray-600 hover:bg-pink-50 hover:text-pink-500"}
                      ${isActive ? (isDarkMode ? "bg-gray-700 text-pink-400 font-medium" : "bg-pink-50 text-pink-500 font-medium") : ""}`
                  }
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </NavLink>
              )
            ))}
          </nav>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 z-50 transform ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300 ease-in-out lg:hidden`}
        onClick={() => setIsMobileMenuOpen(false)} // Close on overlay click
      >
        <div
          className={`w-64 h-full ${
            isDarkMode ? "bg-gray-900 text-gray-100" : "bg-white text-gray-800"
          } shadow-xl p-6 overflow-y-auto`}
          onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside menu
        >
          <div className="flex justify-between items-center mb-10">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-pink-400 to-orange-400 rounded-xl flex items-center justify-center shadow-lg">
                <ChefHat className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold bg-gradient-to-r from-pink-500 to-orange-500 bg-clip-text text-transparent">Smart Bite</h3>
            </div>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className={`p-2 rounded-lg ${isDarkMode ? "hover:bg-gray-700" : "hover:bg-pink-50"} transition-colors`}
            >
              <X className={`h-6 w-6 ${isDarkMode ? "text-gray-100" : "text-gray-600"}`} />
            </button>
          </div>

          <nav className="space-y-4">
            {filteredNavItems.map((item, index) => (
              item.children ? (
                // Mobile dropdown for Prediction
                <div key={index}>
                  <button
                    onClick={() => setActivePredictionDropdown(!activePredictionDropdown)}
                    className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-all duration-200
                      ${isDarkMode ? "text-gray-300 hover:bg-gray-700 hover:text-pink-400" : "text-gray-600 hover:bg-pink-50 hover:text-pink-500"}
                      ${activePredictionDropdown ? (isDarkMode ? "text-pink-400 bg-gray-700 font-medium" : "text-pink-500 bg-pink-50 font-medium") : ""}`
                    }
                  >
                    <item.icon className="w-5 h-5" />
                    <span>{item.name}</span>
                    <svg className={`ml-auto w-4 h-4 transition-transform ${activePredictionDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                  </button>
                  {activePredictionDropdown && (
                    <div className="pl-6 pt-2 space-y-2">
                      {item.children.map((child, childIndex) => (
                        <NavLink
                          key={childIndex}
                          to={child.route}
                          onClick={() => {
                            setIsMobileMenuOpen(false);
                            setActivePredictionDropdown(false);
                            navigate(child.route);
                          }}
                          className={({ isActive }) =>
                            `block px-4 py-2 rounded-lg text-sm transition-colors flex items-center gap-2
                              ${isDarkMode ? "text-gray-300 hover:bg-gray-700 hover:text-pink-400" : "text-gray-700 hover:bg-pink-50 hover:text-pink-500"}
                              ${isActive ? (isDarkMode ? "bg-gray-700 text-pink-400 font-medium" : "bg-pink-50 text-pink-500 font-medium") : ""}`
                          }
                        >
                          <child.icon className="w-4 h-4" />
                          {child.name}
                        </NavLink>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                // Regular mobile NavLink
                <NavLink
                  key={index}
                  to={item.route}
                  onClick={() => {
                    setIsMobileMenuOpen(false); // Close menu on item click
                    navigate(item.route);
                  }}
                  className={({ isActive }) =>
                    `flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-all duration-200
                      ${isDarkMode ? "text-gray-300 hover:bg-gray-700 hover:text-pink-400" : "text-gray-600 hover:bg-pink-50 hover:text-pink-500"}
                      ${isActive ? (isDarkMode ? "bg-gray-700 text-pink-400 font-medium" : "bg-pink-50 text-pink-500 font-medium") : ""}`
                  }
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </NavLink>
              )
            ))}
          </nav>
        </div>
      </div>
    </>
  );
}