import React from "react";
import Header from "./components/Header.jsx";
import Footer from "./components/Footer.jsx";
import { Outlet, useLocation } from "react-router-dom";

// Layout now accepts navItems for the Header
function Layout({ navItems }) {
  const location = useLocation();

  const authRoutes = ["/signin", "/signup", "/verify-otp"];
  const isAuthRoute = authRoutes.includes(location.pathname);

  return (
    <div className="relative min-h-screen">
      {!isAuthRoute && <Header navItems={navItems} />} {/* Pass navItems to Header */}
      <main className="min-h-screen pt-16"> {/* Add padding-top to account for fixed header */}
        <Outlet />
      </main>
      {!isAuthRoute && <Footer />}
    </div>
  );
}

export default Layout;