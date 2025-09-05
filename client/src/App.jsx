import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";

// Pages
import HomePage from "./pages/HomePage";
import SignInPage from "./pages/SignInPage";
import SignUpPage from "./pages/SignUpPage";
import UserProfilePage from "./pages/UserProfilePage";
import VerifyOtpPage from "./pages/VerifyOtpPage";
import NotFoundPage from "./pages/NotFoundPage";
import Layout from "./Layout.jsx";

// Protecting routes
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import AdminPage from "./pages/AdminPage";

// Context Providers
import { AdminProvider } from "./contexts/AdminContext";

// Dashboard Layout Pages
import Settings from "./pages/Settings/Settings";

function App() {
  const location = useLocation();

  return (
    <Routes location={location}>
      <Route path="/" element={<Layout />}>
        {/* Public Routes */}
        <Route path="" element={<HomePage />} />
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
    </Routes>
  );
}

export default App;
