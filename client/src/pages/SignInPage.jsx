import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, ChefHat, LogIn, UserPlus, Home, ShoppingCart, Target, Zap, Calendar, Heart, Brain, CheckCircle, Star, ArrowRight, Play, Users, Clock, TrendingUp, Sparkles, Award, Shield, Settings } from "lucide-react";
import { Facebook, Mail } from "lucide-react";

export default function SignInPage() {
  const { login, loading } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    username: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loginMethod, setLoginMethod] = useState("email");
  const navigate = useNavigate();
  const [activeSidebarItem, setActiveSidebarItem] = useState("Home"); // Default to "Home"

  const sidebarItems = [
    { name: "Home", icon: Home },
    { name: "Meal Plans", icon: ChefHat },
    { name: "Shopping List", icon: ShoppingCart },
    { name: "AI Insights", icon: Brain },
    { name: "Health Sync", icon: Heart },
    { name: "Goals", icon: Target },
    { name: "Community", icon: Users },
    { name: "Preferences", icon: Settings },
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError("");
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (loginMethod === "email" && !formData.email) {
      setError("Please enter your email.");
      return;
    } else if (loginMethod === "username" && !formData.username) {
      setError("Please enter your username.");
      return;
    }
    if (!formData.password) {
      setError("Please enter your password.");
      return;
    }

    const loginData = { password: formData.password };
    if (loginMethod === "email") loginData.email = formData.email;
    else loginData.username = formData.username;

    const result = await login(loginData);
    if (result.success) {
      if (result.requiresOtp) {
        setSuccess("OTP sent to your email.");
        navigate("/verify-otp");
      } else {
        setSuccess("Login successful.");
        navigate("/dashboard");
      }
    } else {
      setError(result.message);
    }
  };

  const handleSocialLogin = (provider) => {
    console.log(`Logging in with ${provider}`);
    setError(`Social login with ${provider} is not yet implemented.`);
  };

  const handleSignupRedirect = () => {
    navigate("/signup");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-pink-50 to-blue-50 flex">
      {/* Vertical Sidebar */}
      <aside className="w-64 bg-white/95 backdrop-blur-xl border-r border-pink-100/50 shadow-lg p-6 flex flex-col fixed top-0 left-0 h-full z-50">
        <div className="flex items-center gap-3 mb-10">
          <div className="relative">
            <div className="w-12 h-12 bg-gradient-to-br from-pink-400 to-orange-400 rounded-2xl flex items-center justify-center shadow-lg">
              <ChefHat className="w-7 h-7 text-white" />
            </div>
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full animate-pulse"></div>
          </div>
          <div>
            <h3 className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-orange-500 bg-clip-text text-transparent">Smart Bite</h3>
            <p className="text-xs text-gray-500">AI Nutrition</p>
          </div>
        </div>

        <nav className="flex-1 space-y-4">
          {sidebarItems.map((item, index) => (
            <button
              key={index}
              className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-all duration-200
                ${activeSidebarItem === item.name
                  ? "bg-gradient-to-r from-pink-100 to-orange-100 text-pink-700 font-bold shadow-md"
                  : "text-gray-600 hover:bg-pink-50 hover:text-pink-500 font-medium"
                }`}
              onClick={() => {
                setActiveSidebarItem(item.name);
                // Optional: navigate to relevant page if this isn't just a sign-in context
                if (item.name === "Home") navigate("/");
                // Add other navigation logic as needed
              }}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.name}</span>
            </button>
          ))}
        </nav>

        {/* Sidebar Footer - User Profile/Logout */}
        <div className="mt-auto pt-6 border-t border-pink-100">
          <button className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-gray-600 hover:bg-pink-50 hover:text-pink-500 transition-colors font-medium">
            <LogIn className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 ml-64"> {/* Margin-left to offset sidebar */}
        {/* Light Header (adjusted for main content area) */}
        <header className="fixed top-0 right-0 w-[calc(100%-16rem)] z-50 bg-white/90 backdrop-blur-xl border-b border-pink-100/50 shadow-sm">
          <div className="container mx-auto px-4">
            <div className="flex h-16 items-center justify-end"> {/* Adjusted to justify-end */}
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => navigate("/signin")} // Connected to SignInPage
                  className="px-4 py-2 text-gray-600 hover:text-pink-500 transition-colors font-medium rounded-xl hover:bg-pink-50"
                >
                  <LogIn className="w-4 h-4 mr-1 inline" />
                  Sign In
                </button>
                <button 
                  onClick={() => navigate("/signup")} // Connected to SignUpPage
                  className="px-6 py-2.5 bg-gradient-to-r from-pink-400 to-orange-400 text-white rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all duration-200"
                >
                  <UserPlus className="w-4 h-4 mr-1 inline" />
                  Start Free
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Sign In Page Content */}
        <div className="flex min-h-screen items-center justify-center pt-16 p-4"> {/* Added pt-16 for header offset */}
          <div className="w-full max-w-md space-y-8 rounded-3xl bg-white/70 p-10 shadow-2xl backdrop-blur-lg border border-pink-200/50 animate-fade-in">
            <div className="text-center">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="w-14 h-14 bg-gradient-to-br from-pink-400 to-orange-400 rounded-2xl flex items-center justify-center shadow-lg">
                  <ChefHat className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-5xl font-black bg-gradient-to-r from-pink-500 to-orange-500 bg-clip-text text-transparent leading-tight">Smart Bite</h2>
              </div>
              <p className="mt-2 text-xl text-gray-700 font-medium">
                Sign in to continue your health journey
              </p>
            </div>
            <form onSubmit={handleLogin} className="space-y-6">
              {error && <p className="text-center text-sm font-medium text-red-500">{error}</p>}
              {success && <p className="text-center text-sm font-medium text-green-500">{success}</p>}
              
              <div className="flex space-x-3 bg-pink-50 rounded-xl p-1 border border-pink-100">
                <button
                  type="button"
                  onClick={() => setLoginMethod("email")}
                  className={`flex-1 rounded-lg px-4 py-2 text-sm font-semibold transition-all duration-300 ${
                    loginMethod === "email"
                      ? "bg-gradient-to-r from-pink-400 to-orange-400 text-white shadow-md"
                      : "text-gray-700 hover:bg-pink-100"
                  }`}
                >
                  Email
                </button>
                <button
                  type="button"
                  onClick={() => setLoginMethod("username")}
                  className={`flex-1 rounded-lg px-4 py-2 text-sm font-semibold transition-all duration-300 ${
                    loginMethod === "username"
                      ? "bg-gradient-to-r from-pink-400 to-orange-400 text-white shadow-md"
                      : "text-gray-700 hover:bg-pink-100"
                  }`}
                >
                  Username
                </button>
              </div>

              {loginMethod === "email" ? (
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full rounded-xl border border-pink-200/60 bg-white/80 px-4 py-2.5 text-gray-900 shadow-sm focus:border-pink-400 focus:ring-2 focus:ring-pink-200/40"
                    placeholder="you@example.com"
                  />
                </div>
              ) : (
                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                    Username
                  </label>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    value={formData.username}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full rounded-xl border border-pink-200/60 bg-white/80 px-4 py-2.5 text-gray-900 shadow-sm focus:border-pink-400 focus:ring-2 focus:ring-pink-200/40"
                    placeholder="yourusername"
                  />
                </div>
              )}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full rounded-xl border border-pink-200/60 bg-white/80 px-4 py-2.5 text-gray-900 shadow-sm focus:border-pink-400 focus:ring-2 focus:ring-pink-200/40"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-pink-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-gradient-to-r from-pink-500 to-orange-500 px-4 py-3 text-lg font-semibold text-white shadow-lg transition-all duration-300 hover:scale-[1.02] hover:from-pink-600 hover:to-orange-600 disabled:cursor-not-allowed disabled:opacity-50 flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing In...
                  </>
                ) : (
                  "Sign In"
                )}
              </button>
            </form>
            <div className="relative flex items-center justify-center">
              <span className="absolute bg-white/70 px-3 text-sm text-gray-500">OR</span>
              <div className="w-full border-t border-pink-200"></div>
            </div>
            <div className="flex flex-col space-y-3">
              <button
                onClick={() => handleSocialLogin("Google")}
                className="w-full rounded-xl bg-white border border-pink-200 px-4 py-2.5 text-base font-semibold text-gray-700 shadow-sm transition-transform hover:scale-[1.02] hover:bg-pink-50 flex items-center justify-center"
              >
                <Mail className="mr-2 h-5 w-5 text-red-500" /> Sign In with Google
              </button>
              <button
                onClick={() => handleSocialLogin("Facebook")}
                className="w-full rounded-xl bg-blue-600 px-4 py-2.5 text-base font-semibold text-white shadow-sm transition-transform hover:scale-[1.02] hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 flex items-center justify-center"
              >
                <Facebook className="mr-2 h-5 w-5" /> Sign In with Facebook
              </button>
            </div>

            <div className="mt-4 text-center">
              <p className="text-base text-gray-600 font-medium">
                Don't have an account?{" "}
                <button
                  onClick={handleSignupRedirect}
                  className="font-semibold text-pink-600 hover:text-orange-600 transition-colors"
                >
                  Sign Up
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}