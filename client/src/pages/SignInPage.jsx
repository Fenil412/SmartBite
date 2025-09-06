import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, ChefHat, Facebook, Mail } from "lucide-react";

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
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-pink-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8 rounded-3xl bg-white/70 p-6 sm:p-10 shadow-2xl backdrop-blur-lg border border-pink-200/50 animate-fade-in">
        <div className="text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-pink-400 to-orange-400 rounded-2xl flex items-center justify-center shadow-lg">
              <ChefHat className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
            </div>
            <h2 className="text-3xl sm:text-5xl font-black bg-gradient-to-r from-pink-500 to-orange-500 bg-clip-text text-transparent leading-tight">Smart Bite</h2>
          </div>
          <p className="mt-2 text-lg sm:text-xl text-gray-700 font-medium">
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
  );
}