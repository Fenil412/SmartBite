import React, { useState } from "react";
import { Routes, Route, useLocation, useNavigate } from "react-router-dom";
import {
  ChefHat,
  Sparkles,
  Home,
  PersonStanding,
  ShoppingCart,
  Book,
  Timer,
  Brain,
} from "lucide-react";

// Layout
import Layout from "./Layout.jsx";

// Pages
import HomePage from "./pages/HomePage";
import SignInPage from "./pages/SignInPage";
import SignUpPage from "./pages/SignUpPage";
import UserProfilePage from "./pages/UserProfilePage";
import ShoppingListPage from "./pages/ShoppingListPage";
import PreferencesPage from "./pages/PreferencesPage";
import NutritionTrackerPage from "./pages/NutritionTrackerPage";
import MealPlanningForm from "./components/MealPlanningForm.jsx";
import RuleFilteringForm from "./components/RuleFilteringForm.jsx";
import NutritionGoalForm from "./components/NutritionGoalForm.jsx";
import VarietyClusteringForm from "./components/VarietyClusteringForm.jsx";
import ContentFiltering from "./components/ContentFilteringForm.jsx";
import Dashboard from "./pages/Dashboard";
import VerifyOtpPage from "./pages/VerifyOtpPage";
import NotFoundPage from "./pages/NotFoundPage";
import Settings from "./pages/Settings/Settings";
// import MealHistoryPage from "./pages/MealHistoryPage"; // Commented out as in your original
// import AiMealPlansPage from "./pages/AiMealPlansPage"; // Commented out as in your original
// import AiSummaryPage from "./pages/AiSummaryPage"; // Commented out as in your original
import Chatbot from "./Chatbot.jsx";

// Auth & Admin Protection
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import AdminPage from "./pages/AdminPage";

// Context Providers
import { AdminProvider } from "./contexts/AdminContext";
import { UserPreferencesProvider } from "./contexts/UserPreferencesContext";

// Layout Components (assuming these are in the root components folder)
import Sidebar from "./components/Sidebar"; // This should be in components/layout based on previous discussion
import MobileMenu from "./components/MobileMenu"; // This should be in components/layout based on previous discussion

// Hooks
import { useMobileMenu } from "./hooks/useMobile";

function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeSidebarItem, setActiveSidebarItem] = useState("Home");

  const { isOpen: isMobileMenuOpen, openMenu, closeMenu } = useMobileMenu();

  const handleSidebarItemClick = (itemName) => {
    setActiveSidebarItem(itemName);
    closeMenu();

    switch (itemName) {
      case "Shopping List":
        navigate("/shopping-list");
        break;
      case "Nutrition Tracker":
        navigate("/nutrition-tracker");
        break;
      case "Nutrition Goals":
        navigate("/nutrition-goals");
        break;
      case "Meal Planning":
        navigate("/meal-planning");
        break;
      case "Rule Filtering":
        navigate("/rule-filtering");
        break;
      case "Variety Clustering":
        navigate("/variety-clustering");
        break;
      case "Content Filtering":
        navigate("/content-filtering");
        break;
      // Add cases for other sidebar items as needed
      case "Home":
        navigate("/"); // Ensure Home navigates to root
        break;
      case "User Profile":
        // This will typically require a userId, so you might need to adjust or navigate to a generic profile page first
        // For now, let's assume it might go to a default or user's own profile if logged in
        navigate("/profile/me"); // Placeholder for a dynamic user ID
        break;
      case "Preferences":
        navigate("/preference");
        break;
      // Add other specific navigations if your sidebar items directly map to distinct routes
      default:
        // If an item doesn't have a specific route, just close menu and update state
        break;
    }
  };

  const sidebarItems = [
    { name: "Home", icon: Home },
    { name: "User Profile", icon: PersonStanding },
    { name: "Preferences", icon: Sparkles },
    //{ name: "AI Meal Plans", icon: ChefHat }, // Commented out as in your original
    { name: "Shopping List", icon: ShoppingCart },
    //{ name: "Meal History", icon: Book }, // Commented out as in your original
    { name: "Nutrition Tracker", icon: Timer },
    //{ name: "AI Summary", icon: Brain }, // Commented out as in your original
    { name: "Meal Planning", icon: ChefHat },
    { name: "Rule Filtering", icon: Brain },
    { name: "Nutrition Goals", icon: Sparkles },
    { name: "Variety Clustering", icon: Sparkles },
    { name: "Content Filtering", icon: Sparkles },
  ];

  return (
    <UserPreferencesProvider>
      <div className="lg:flex">
        {/* Sidebar for large screens - ensure it's hidden on mobile */}
        <Sidebar
          sidebarItems={sidebarItems}
          activeSidebarItem={activeSidebarItem}
          onItemClick={handleSidebarItemClick}
          navigate={navigate}
          // Assuming isDarkMode will be passed here if you re-implement theme
        />

        {/* Main Routing Area */}
        <div className="flex-1 lg:ml-64">
          <Routes location={location}>
            <Route
              path="/"
              element={<Layout openMobileMenu={openMenu} navigate={navigate} />}
            >
              {/* Public Routes */}
              <Route index element={<HomePage />} />{" "}
              {/* Use index for default route */}
              <Route path="profile/:userId" element={<UserProfilePage />} />
              <Route path="signin" element={<SignInPage />} />
              <Route path="signup" element={<SignUpPage />} />
              <Route path="verify-otp" element={<VerifyOtpPage />} />
              {/* Protected Routes */}
              <Route
                path="settings"
                element={
                  <ProtectedRoute>
                    <Settings />
                  </ProtectedRoute>
                }
              />
              <Route
                path="dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="chatai"
                element={
                    <Chatbot />
                }
              />
              <Route
                path="preference"
                element={
                  <ProtectedRoute>
                    <PreferencesPage />
                  </ProtectedRoute>
                }
              />
              {/* Sidebar-linked pages */}
              <Route path="shopping-list" element={<ShoppingListPage />} />
              <Route
                path="nutrition-tracker"
                element={<NutritionTrackerPage />}
              />
              <Route path="meal-planning" element={<MealPlanningForm />} />
              <Route path="rule-filtering" element={<RuleFilteringForm />} />
              <Route path="nutrition-goals" element={<NutritionGoalForm />} />
              <Route path="variety-clustering" element={<VarietyClusteringForm />} />
              <Route path="content-filtering" element={<ContentFiltering />} />
              {/* <Route path="meal-history" element={<MealHistoryPage />} /> */}
              {/* <Route path="ai-meal-plans" element={<AiMealPlansPage />} /> */}
              {/* <Route path="ai-summary" element={<AiSummaryPage />} /> */}
              {/* Admin Route */}
              <Route
                path="admin"
                element={
                  <AdminRoute>
                    <AdminProvider>
                      <AdminPage />
                    </AdminProvider>
                  </AdminRoute>
                }
              />
            </Route>

            {/* 404 */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </div>
      </div>

      {/* Mobile Menu */}
      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={closeMenu}
        sidebarItems={sidebarItems.map((item) => ({
          ...item,
          onClick: () => handleSidebarItemClick(item.name),
        }))}
        isAuthenticated={false} // Adjust as per your auth state
        onLogout={() => {
          /* handle logout logic */
        }}
        // Assuming isDarkMode will be passed here if you re-implement theme
      />
    </UserPreferencesProvider>
  );
}

export default App;
