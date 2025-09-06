import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";

// Pages
import HomePage from "./pages/HomePage";
import SignInPage from "./pages/SignInPage";
import SignUpPage from "./pages/SignUpPage";
import UserProfilePage from "./pages/UserProfilePage";
import ShoppingListPage from "./pages/ShoppingListPage";
import PreferencesPage from "./pages/PreferencesPage";
import NutritionTrackerPage from "./pages/NutritionTrackerPage";
import Dashboard from "./pages/Dashboard";
import VerifyOtpPage from "./pages/VerifyOtpPage";
import NotFoundPage from "./pages/NotFoundPage";
import Layout from "./Layout.jsx";

// Protecting routes
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import AdminPage from "./pages/AdminPage";

// Context Providers
import { AdminProvider } from "./contexts/AdminContext";
import { UserPreferencesProvider } from "./contexts/UserPreferencesContext";

// Dashboard Layout Pages
import Settings from "./pages/Settings/Settings";
import Chatbot from "./Chatbot";

function App() {
  const location = useLocation();

  return (
    <UserPreferencesProvider>
      {" "}
      {/* Wrap the entire application or the main routes */}
      <Routes location={location}>
        <Route path="/" element={<Layout />}>
          {/* Public Routes */}
          <Route path="" element={<HomePage />} />
          {/* UserProfilePage is now under UserPreferencesProvider */}
          <Route path="/profile/:userId" element={<UserProfilePage />} />

          {/* Authentication Routes */}
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

          <Route
            path="/chatai"
            element={
              <ProtectedRoute>
                <Chatbot />
              </ProtectedRoute>
            }
          />
          <Route
            path="/preference"
            element={
              <ProtectedRoute>
                <PreferencesPage />
              </ProtectedRoute>
            }
          ></Route>

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

        {/* 404 Fallback */}
        <Route path="*" element={<NotFoundPage />} />
        <Route path="/shopping-list" element={<ShoppingListPage />} />
        <Route path="/nutrition-tracker" element={<NutritionTrackerPage />} />
      </Routes>
    </UserPreferencesProvider>
  );
}

export default App;
