import React from "react";
import { ChefHat, LogIn } from "lucide-react";

export default function Sidebar({
  sidebarItems,
  activeSidebarItem,
  onItemClick,
  isDarkMode,
}) {
  return (
    <aside
      className={`hidden lg:flex w-64 ${
        isDarkMode
          ? "bg-gray-800 text-gray-100 border-gray-700"
          : "bg-white/95 backdrop-blur-xl border-r border-pink-100/50 shadow-lg"
      } p-6 flex-col fixed top-0 left-0 h-full z-50`}
    >
      <div className="flex items-center gap-3 mb-10">
        <div className="relative">
          <div className="w-12 h-12 bg-gradient-to-br from-pink-400 to-orange-400 rounded-2xl flex items-center justify-center shadow-lg">
            <ChefHat className="w-7 h-7 text-white" />
          </div>
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full animate-pulse"></div>
        </div>
        <div>
          <h3 className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-orange-500 bg-clip-text text-transparent">
            Smart Bite
          </h3>
          <p
            className={`${
              isDarkMode ? "text-gray-400" : "text-gray-500"
            } text-xs`}
          >
            AI Nutrition
          </p>
        </div>
      </div>

      <nav className="flex-1 space-y-4">
        {sidebarItems.map((item, index) => (
          <button
            key={index}
            className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-all duration-200
              ${
                activeSidebarItem === item.name
                  ? `${
                      isDarkMode
                        ? "bg-gray-700 text-pink-400 font-bold"
                        : "bg-gradient-to-r from-pink-100 to-orange-100 text-pink-700 font-bold shadow-md"
                    }`
                  : `${
                      isDarkMode
                        ? "text-gray-300 hover:bg-gray-700 hover:text-pink-400"
                        : "text-gray-600 hover:bg-pink-50 hover:text-pink-500"
                    } font-medium`
              }`}
            onClick={() => onItemClick(item.name)}
          >
            <item.icon className="w-5 h-5" />
            <span>{item.name}</span>
          </button>
        ))}
      </nav>

      {/* Sidebar Footer - User Profile/Logout */}
      <div
        className={`mt-auto pt-6 ${
          isDarkMode ? "border-gray-700" : "border-pink-100"
        } border-t`}
      >
        <button
          className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl ${
            isDarkMode
              ? "text-gray-300 hover:bg-gray-700 hover:text-pink-400"
              : "text-gray-600 hover:bg-pink-50 hover:text-pink-500"
          } transition-colors font-medium`}
        >
          <LogIn className="w-5 h-5" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
