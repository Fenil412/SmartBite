// src/pages/PreferencesPage.jsx
import React, { useState, useEffect } from "react";
import {
  ChefHat,
  ShoppingCart,
  Target,
  Brain,
  Heart,
  Users,
  Home,
  Settings,
  LogIn,
  Utensils,
  Leaf,
  Egg,
  Milk,
  Nut,
  Wheat,
  Scale,
  Dumbbell,
  Zap,
  CheckCircle,
  ArrowRight,
} from "lucide-react";
import { useUserPreferences } from "../contexts/UserPreferencesContext"; // Import the hook

export default function PreferencesPage() {
  const { userPreferences, updatePreferences } = useUserPreferences(); // Use the context

  const [dietaryType, setDietaryType] = useState(userPreferences.dietaryType || "");
  const [allergies, setAllergies] = useState(userPreferences.allergies || []);
  const [healthGoals, setHealthGoals] = useState(userPreferences.healthGoals || []);
  const [targetCalories, setTargetCalories] = useState(userPreferences.targetCalories || "");
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);

  // Sync internal state with context on initial load or context changes
  useEffect(() => {
    setDietaryType(userPreferences.dietaryType || "");
    setAllergies(userPreferences.allergies || []);
    setHealthGoals(userPreferences.healthGoals || []);
    setTargetCalories(userPreferences.targetCalories || "");
  }, [userPreferences]);

  const dietaryOptions = [
    { label: "Vegetarian", value: "Vegetarian", icon: Leaf }, // Changed value to match UserProfilePage options
    { label: "Vegan", value: "Vegan", icon: Leaf },           // Changed value
    { label: "Keto", value: "Keto", icon: Zap },               // Changed value
    { label: "Mediterranean", value: "Mediterranean", icon: Heart }, // Added Mediterranean for a better fit
    { label: "Custom", value: "Custom", icon: Utensils },
  ];

  const allergyOptions = [
    { label: "Gluten", value: "Gluten", icon: Wheat },
    { label: "Peanuts", value: "Peanuts", icon: Nut }, // Changed to peanuts to align with UserProfilePage
    { label: "Dairy", value: "Dairy-Free", icon: Milk }, // Changed to Dairy-Free
    { label: "Eggs", value: "Eggs", icon: Egg },
    { label: "Soy", value: "Soy", icon: Nut }, // Added Soy
  ];

  const healthGoalOptions = [
    { label: "Weight Loss", value: "Weight Loss", icon: Scale },
    { label: "Muscle Gain", value: "Muscle Gain", icon: Dumbbell },
    { label: "Healthy Eating", value: "Healthy Eating", icon: CheckCircle },
    { label: "Boost Energy", value: "Boost Energy", icon: Zap },
  ];


  const handleAllergyChange = (allergy) => {
    setAllergies((prev) =>
      prev.includes(allergy)
        ? prev.filter((item) => item !== allergy)
        : [...prev, allergy]
    );
  };

  const handleHealthGoalChange = (goal) => {
    setHealthGoals((prev) =>
      prev.includes(goal)
        ? prev.filter((item) => item !== goal)
        : [...prev, goal]
    );
  };

  const handleSavePreferences = () => {
    const preferencesToSave = {
      dietaryType: dietaryType, // This will be handled differently in UserProfile
      dietaryPreferences: dietaryType === "Custom" ? [] : [dietaryType], // Convert single dietaryType to array for UserProfile
      allergies: allergies,
      healthGoals: healthGoals.length > 0 ? healthGoals[0] : "", // UserProfile expects a single healthGoal string
      targetCalories: parseInt(targetCalories) || "",
    };
    
    // Call the updatePreferences function from context
    updatePreferences(preferencesToSave);
    
    setShowSaveSuccess(true);
    setTimeout(() => setShowSaveSuccess(false), 3000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-pink-50 to-blue-50 flex">
      <div className="flex-1">
        <section className="relative pt-24 pb-20 lg:pt-32 lg:pb-32 overflow-hidden px-4">
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-100/50 via-pink-100/50 to-blue-100/50"></div>
            <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-gradient-to-r from-pink-200/40 to-orange-200/40 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-blue-200/30 to-purple-200/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
          </div>

          <div className="container mx-auto px-4 relative max-w-4xl">
            <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-8 lg:p-12 shadow-xl border border-pink-200/50 space-y-10">
              <div className="text-center space-y-4">
                <h1 className="text-5xl font-black bg-gradient-to-r from-pink-500 to-orange-500 bg-clip-text text-transparent">
                  Your Nutrition Preferences
                </h1>
                <p className="text-xl text-gray-600 font-medium">
                  Help us tailor your perfect meal plan by telling us more about your needs.
                </p>
              </div>

              {/* Dietary Type Selection */}
              <div>
                <h3 className="text-2xl font-bold text-gray-800 mb-5 flex items-center gap-3">
                  <Leaf className="w-6 h-6 text-green-500" />
                  Select Dietary Type
                </h3>
                <div className="grid md:grid-cols-3 gap-4">
                  {dietaryOptions.map((option) => (
                    <button
                      key={option.value}
                      className={`flex items-center justify-center gap-3 px-6 py-4 rounded-xl border-2 transition-all duration-200
                        ${
                          dietaryType === option.value
                            ? "bg-gradient-to-r from-pink-100 to-orange-100 border-pink-300 text-pink-700 font-bold shadow-md"
                            : "bg-white/60 border-pink-100 text-gray-600 hover:bg-pink-50 hover:text-pink-500 font-medium"
                        }`}
                      onClick={() => setDietaryType(option.value)}
                    >
                      <option.icon className="w-5 h-5" />
                      <span>{option.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Allergies Selection */}
              <div>
                <h3 className="text-2xl font-bold text-gray-800 mb-5 flex items-center gap-3">
                  <Nut className="w-6 h-6 text-yellow-500" />
                  Select Allergies (Optional)
                </h3>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {allergyOptions.map((option) => (
                    <button
                      key={option.value}
                      className={`flex items-center justify-center gap-3 px-6 py-4 rounded-xl border-2 transition-all duration-200
                        ${
                          allergies.includes(option.value)
                            ? "bg-gradient-to-r from-blue-100 to-purple-100 border-blue-300 text-blue-700 font-bold shadow-md"
                            : "bg-white/60 border-pink-100 text-gray-600 hover:bg-blue-50 hover:text-blue-500 font-medium"
                        }`}
                      onClick={() => handleAllergyChange(option.value)}
                    >
                      <option.icon className="w-5 h-5" />
                      <span>{option.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Health Goal Selection - MODIFIED FOR MULTIPLE SELECTION */}
              <div>
                <h3 className="text-2xl font-bold text-gray-800 mb-5 flex items-center gap-3">
                  <Target className="w-6 h-6 text-orange-500" />
                  Select Health Goals (Multiple allowed)
                </h3>
                <div className="grid md:grid-cols-3 gap-4">
                  {healthGoalOptions.map((option) => (
                    <button
                      key={option.value}
                      className={`flex items-center justify-center gap-3 px-6 py-4 rounded-xl border-2 transition-all duration-200
                        ${
                          // Check if the healthGoals array includes the current option's value
                          healthGoals.includes(option.value) 
                            ? "bg-gradient-to-r from-orange-100 to-yellow-100 border  font-bold shadow-md"
                            : "bg-white/60 border-pink-100  hover:bg-orange-50 hover:text-orange-500 font-medium"
                        }`}
                      // Use the new handleHealthGoalChange function
                      onClick={() => handleHealthGoalChange(option.value)} 
                    >
                      <option.icon className="w-5 h-5" />
                      <span>{option.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Target Calories Input */}
              <div>
                <h3 className="text-2xl font-bold text-gray-800 mb-5 flex items-center gap-3">
                  <Zap className="w-6 h-6 text-purple-500" />
                  Target Calories (per day)
                </h3>
                <input
                  type="number"
                  placeholder="e.g., 2000"
                  value={targetCalories}border-orange-300
                  onChange={(e) => setTargetCalories(e.target.value)}
                  className="w-full p-4 rounded-xl border-2 border-pink-200 focus:border-pink-400 focus:ring-pink-400 focus:ring-opacity-50 transition-all duration-200 text-lg font-medium text-gray-700 placeholder-gray-400 bg-pink-50/50"
                  min="1000"
                  max="5000"
                />
              </div>

              {/* Save Button */}
              <div className="text-center pt-6">
                <button
                  onClick={handleSavePreferences}
                  className="group px-10 py-5 bg-gradient-to-r from-pink-400 to-orange-400 text-white rounded-3xl font-bold text-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 flex items-center justify-center mx-auto"
                >
                  <CheckCircle className="w-6 h-6 mr-3 group-hover:animate-bounce" />
                  Save Preferences
                  <ArrowRight className="w-6 h-6 ml-3 group-hover:translate-x-1 transition-transform" />
                </button>
                {showSaveSuccess && (
                  <p className="mt-4 text-green-600 font-semibold text-lg flex items-center justify-center gap-2 animate-fade-in">
                    <CheckCircle className="w-5 h-5" /> Preferences saved successfully!
                  </p>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}