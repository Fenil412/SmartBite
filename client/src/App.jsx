import React from "react"; // No more useState for activeSidebarItem or mobile menu
import { Routes, Route, useLocation } from "react-router-dom"; // useNavigate will now be managed by Header internally
import {
  ChefHat,
  Sparkles,
  Home,
  PersonStanding,
  ShoppingCart,
  Book,
  Timer,
  Brain,
  Lightbulb,
  Settings as SettingsIcon,
  Key,
  LogIn,
  UserPlus,
} from "lucide-react"; // Import all icons needed for Header navigation

// Layout
import Layout from "./Layout.jsx";

// Pages
import HomePage from "./pages/HomePage";
import SignInPage from "./pages/SignInPage";
import SignUpPage from "./pages/SignUpPage";
import UserProfile from "./components/UserProfile";
import ShoppingListPage from "./pages/ShoppingListPage";
import PreferencesPage from "./pages/PreferencesPage";
import NutritionTrackerPage from "./pages/NutritionTrackerPage";
import Dashboard from "./pages/Dashboard";
import VerifyOtpPage from "./pages/VerifyOtpPage";
import NotFoundPage from "./pages/NotFoundPage";
import Settings from "./pages/Settings/Settings";
import Chatbot from "./Chatbot.jsx";

// Prediction Sub-Pages
import MealPlanningForm from "./components/MealPlanningForm.jsx";
import RuleFilteringForm from "./components/RuleFilteringForm.jsx";
import NutritionGoalForm from "./components/NutritionGoalForm.jsx";
import VarietyClusteringForm from "./components/VarietyClusteringForm.jsx";
import ContentFiltering from "./components/ContentFilteringForm.jsx";

// Auth & Admin Protection
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import AdminPage from "./pages/AdminPage";

// Context Providers
import { AdminProvider } from "./contexts/AdminContext";
import { UserPreferencesProvider } from "./contexts/UserPreferencesContext";

// Removed: Sidebar, MobileMenu imports
// Removed: useMobileMenu hook import

function App() {
  const location = useLocation();

  // Navigation items structure for the Header
  const navItems = [
    { name: "Home", icon: Home, route: "/" },
    { name: "User Profile", icon: PersonStanding, route: "/profile/me" },
    { name: "Preferences", icon: Sparkles, route: "/preference" },
    { name: "Shopping List", icon: ShoppingCart, route: "/shopping-list" },
    { name: "Nutrition Tracker", icon: Timer, route: "/nutrition-tracker" },
    { name: "AI Summary", icon: Brain, route: "/ai-summary" },
    {
      name: "Prediction",
      icon: Lightbulb,
      children: [
        {
          name: "Meal Planning",
          icon: ChefHat,
          route: "/prediction/meal-planning",
        },
        {
          name: "Rule Filtering",
          icon: Brain,
          route: "/prediction/rule-filtering",
        },
        {
          name: "Nutrition Goals",
          icon: Sparkles,
          route: "/prediction/nutrition-goals",
        },
        {
          name: "Variety Clustering",
          icon: Sparkles,
          route: "/prediction/variety-clustering",
        },
        {
          name: "Content Filtering",
          icon: Sparkles,
          route: "/prediction/content-filtering",
        },
      ],
    },
    { name: "Settings", icon: SettingsIcon, route: "/settings" },
    { name: "Admin Page", icon: Key, route: "/admin", adminOnly: true },
  ];

  return (
    console.log("Frontend API URL:", import.meta.env.VITE_API_URL),
    <UserPreferencesProvider>
      <div className="relative min-h-screen">
        <Routes location={location}>
          <Route path="/" element={<Layout navItems={navItems} />}>
            {" "}
            {/* Pass navItems to Layout */}
            {/* Public Routes */}
            <Route index element={<HomePage />} />
            <Route path="/profile/:userId" element={<UserProfile />} />
            <Route path="/signin" element={<SignInPage />} />
            <Route path="/signup" element={<SignUpPage />} />
            <Route path="/verify-otp" element={<VerifyOtpPage />} />
            {/* Protected Routes */}
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            {/* <Route
              path="/chatai"
              element={
                  <Chatbot />
              }
            /> */}
            <Route
              path="/preference"
              element={
                <ProtectedRoute>
                  <PreferencesPage />
                </ProtectedRoute>
              }
            />
            <Route path="/ai-summary" element={<Chatbot />} />
            {/* Direct Navigation Pages */}
            <Route path="/shopping-list" element={<ShoppingListPage />} />
            <Route
              path="/nutrition-tracker"
              element={<NutritionTrackerPage />}
            />
            {/* Prediction Sub-pages (Protected) */}
            <Route
              path="/prediction/meal-planning"
              element={
                <ProtectedRoute>
                  <MealPlanningForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/prediction/rule-filtering"
              element={
                <ProtectedRoute>
                  <RuleFilteringForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/prediction/nutrition-goals"
              element={
                <ProtectedRoute>
                  <NutritionGoalForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/prediction/variety-clustering"
              element={
                <ProtectedRoute>
                  <VarietyClusteringForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/prediction/content-filtering"
              element={
                <ProtectedRoute>
                  <ContentFiltering />
                </ProtectedRoute>
              }
            />
            {/* Admin Route */}
            <Route
              path="/admin"
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
    </UserPreferencesProvider>
  );
}

export default App;
