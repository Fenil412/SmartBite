import React from "react";
import Header from "./components/Header.jsx"; // Ensure this path is correct
import Footer from "./components/Footer.jsx"; // Ensure this path is correct
import { Outlet, useLocation } from "react-router-dom";

// Layout now accepts props to pass down to Header
function Layout({ openMobileMenu, navigate }) {
  const location = useLocation();

  const authRoutes = ["/signin", "/signup", "/verify-otp"];
  const isAuthRoute = authRoutes.includes(location.pathname);

  return (
    <div className="relative min-h-screen">
      {/* Pass openMobileMenu and navigate to Header */}
      {!isAuthRoute && <Header openMobileMenu={openMobileMenu} navigate={navigate} />}
      <main className="min-h-screen">
        <Outlet />
      </main>
      {!isAuthRoute && <Footer />}
    </div>
  );
}

export default Layout;