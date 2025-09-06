import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, ChefHat } from "lucide-react";

export default function SignUpPage() {
  const { register, loading } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    healthGoals: "",
    dietaryPreferences: [],
    allergies: [],
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const healthGoalsOptions = [
    "Weight Loss",
    "Muscle Gain",
    "Healthy Eating",
    "Improved Fitness",
    "Stress Reduction",
    "Better Sleep",
    "Boost Energy",
    "Manage Chronic Conditions"
  ];

  const dietaryPreferencesOptions = [
    "Vegetarian",
    "Vegan",
    "Keto",
    "Paleo",
    "Mediterranean",
    "Gluten-Free",
    "Dairy-Free",
    "Halal",
    "Kosher"
  ];

  const allergiesOptions = [
    "Peanuts",
    "Tree Nuts",
    "Milk",
    "Eggs",
    "Soy",
    "Wheat",
    "Fish",
    "Shellfish",
    "Sesame"
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError("");
  };

  const handleCheckboxChange = (e, type) => {
    const { value, checked } = e.target;
    setFormData((prev) => {
      const current = prev[type];
      if (checked) {
        return { ...prev, [type]: [...current, value] };
      } else {
        return { ...prev, [type]: current.filter((item) => item !== value) };
      }
    });
    setError("");
  };

  const handleSignInRedirect = () => {
    navigate("/signin");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    console.log("Registering with:", formData);

    const result = await register(formData);

    if (result.success) {
      setSuccess(
        result.message || "Registration successful! Redirecting to sign-in..."
      );
      setFormData({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        healthGoals: "",
        dietaryPreferences: [],
        allergies: [],
      });
      setTimeout(() => {
        navigate("/signin");
      }, 1500);
    } else {
      setError(result.message || "Registration failed. Please try again.");
    }
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
            Create your account to start your personalized health journey
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <p className="text-center text-sm font-medium text-red-500">
              {error}
            </p>
          )}
          {success && (
            <p className="text-center text-sm font-medium text-green-500">
              {success}
            </p>
          )}
          
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Full Name *
            </label>
            <input
              id="name"
              name="name"
              type="text"
              placeholder="Enter your full name"
              value={formData.name}
              onChange={handleInputChange}
              required
              className="mt-1 block w-full rounded-xl border border-pink-200/60 bg-white/80 px-4 py-2.5 text-gray-900 shadow-sm focus:border-pink-400 focus:ring-2 focus:ring-pink-200/40"
            />
          </div>
          
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Email *
            </label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleInputChange}
              required
              className="mt-1 block w-full rounded-xl border border-pink-200/60 bg-white/80 px-4 py-2.5 text-gray-900 shadow-sm focus:border-pink-400 focus:ring-2 focus:ring-pink-200/40"
            />
          </div>
          
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Password *
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Create a strong password"
                value={formData.password}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full rounded-xl border border-pink-200/60 bg-white/80 px-4 py-2.5 text-gray-900 shadow-sm focus:border-pink-400 focus:ring-2 focus:ring-pink-200/40"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-pink-600 transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>
          
          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Confirm Password *
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full rounded-xl border border-pink-200/60 bg-white/80 px-4 py-2.5 text-gray-900 shadow-sm focus:border-pink-400 focus:ring-2 focus:ring-pink-200/40"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-pink-600 transition-colors"
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          <div>
            <label
              htmlFor="healthGoals"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Your Primary Health Goal *
            </label>
            <select
              id="healthGoals"
              name="healthGoals"
              value={formData.healthGoals}
              onChange={handleInputChange}
              required
              className="mt-1 block w-full rounded-xl border border-pink-200/60 bg-white/80 px-4 py-2.5 text-gray-900 shadow-sm focus:border-pink-400 focus:ring-2 focus:ring-pink-200/40"
            >
              <option value="">Select a goal</option>
              {healthGoalsOptions.map((goal) => (
                <option key={goal} value={goal}>{goal}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Dietary Preferences (Optional)
            </label>
            <div className="grid grid-cols-2 gap-2 mt-1">
              {dietaryPreferencesOptions.map((pref) => (
                <div key={pref} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`diet-${pref}`}
                    name="dietaryPreferences"
                    value={pref}
                    checked={formData.dietaryPreferences.includes(pref)}
                    onChange={(e) => handleCheckboxChange(e, "dietaryPreferences")}
                    className="h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300 rounded"
                  />
                  <label htmlFor={`diet-${pref}`} className="ml-2 text-sm text-gray-700">
                    {pref}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Allergies (Optional)
            </label>
            <div className="grid grid-cols-2 gap-2 mt-1">
              {allergiesOptions.map((allergy) => (
                <div key={allergy} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`allergy-${allergy}`}
                    name="allergies"
                    value={allergy}
                    checked={formData.allergies.includes(allergy)}
                    onChange={(e) => handleCheckboxChange(e, "allergies")}
                    className="h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300 rounded"
                  />
                  <label htmlFor={`allergy-${allergy}`} className="ml-2 text-sm text-gray-700">
                    {allergy}
                  </label>
                </div>
              ))}
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
                Creating Account...
              </>
            ) : (
              "Create Account"
            )}
          </button>
        </form>

        <div className="mt-4 text-center">
          <p className="text-base text-gray-600 font-medium">
            Already have an account?{" "}
            <button
              onClick={handleSignInRedirect}
              className="font-semibold text-pink-600 hover:text-orange-600 transition-colors"
            >
              Sign In
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}