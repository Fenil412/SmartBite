import { useState } from "react";
import { postData } from "../api"; // Assuming you have an api.js with postData

export default function MealPlanningForm() {
  const [form, setForm] = useState({
    gender: "Male",
    activity_level: "Moderately Active",
    dietary_preference: "Omnivore",
    disease: "Weight Gain",
    target_calories: 2000,
    target_protein: 70,
    target_carbs: 250,
    target_fat: 60,
    target_sugar: 100,
    target_sodium: 2000,
    target_fiber: 30,
    days: 7,
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      // Adjusted to send the form data as expected by your backend
      const payload = {
        gender: form.gender,
        activity_level: form.activity_level,
        dietary_preference: form.dietary_preference,
        disease: form.disease,
        target_calories: parseInt(form.target_calories),
        target_protein: parseInt(form.target_protein),
        target_carbs: parseInt(form.target_carbs),
        target_fat: parseInt(form.target_fat),
        target_sugar: parseInt(form.target_sugar),
        target_sodium: parseInt(form.target_sodium),
        target_fiber: parseInt(form.target_fiber),
        days: parseInt(form.days),
        // Add ages, height, weight if needed by your backend, they are in your backend output
        // For now, assuming these are derived or not strictly required for the initial post
        // If your backend needs these from frontend, uncomment and add to form state
        // ages: 25, 
        // height: 180,
        // weight: 80,
      };

      const res = await postData("/meal_planning/recommend", payload);
      setResult(res);
      console.log("Backend Response:", res); // Log the response for debugging
    } catch (err) {
      alert("Error generating meal plan: " + err.message);
      console.error("Meal planning error:", err);
    } finally {
      setLoading(false);
    }
  }

  const getFieldIcon = (key) => {
    const icons = {
      gender: "👤",
      activity_level: "🏃‍♂️",
      dietary_preference: "🥗",
      disease: "🏥",
      target_calories: "🔥",
      target_protein: "💪",
      target_carbs: "🍞",
      target_fat: "🥑",
      target_sugar: "🍯",
      target_sodium: "🧂",
      target_fiber: "🌾",
      days: "📅"
    };
    return icons[key] || "📋";
  };

  const getInputType = (key) => {
    const selectFields = ['gender', 'activity_level', 'dietary_preference', 'disease'];
    return selectFields.includes(key) ? 'select' : 'number';
  };

  const getSelectOptions = (key) => {
    const options = {
      gender: ["Male", "Female"],
      activity_level: [
        "Moderately Active",
        "Lightly Active",
        "Sedentary",
        "Very Active",
        "Extremely Active"
      ],
      dietary_preference: [
        "Omnivore",
        "Vegetarian",
        "Vegan",
        "Pescatarian"
      ],
      disease: [
        "Weight Gain",
        "Weight Gain, Hypertension, Heart Disease",
        "Weight Gain, Hypertension, Heart Disease, Kidney Disease",
        "Weight Gain, Kidney Disease",
        "Hypertension, Heart Disease, Kidney Disease",
        "Diabetes, Acne, Weight Gain, Hypertension, Heart Disease, Kidney Disease",
        "Diabetes, Acne, Hypertension, Kidney Disease",
        "Hypertension, Kidney Disease",
        "Diabetes, Acne, Weight Loss, Hypertension, Heart Disease, Kidney Disease",
        "Hypertension, Heart Disease",
        "Kidney Disease",
        "Diabetes, Acne, Weight Gain, Hypertension, Heart Disease",
        "Diabetes, Acne, Hypertension, Heart Disease"
      ]
    };
    return options[key] || [];
  };

  const getFieldDescription = (key) => {
    const descriptions = {
      gender: "Select your biological gender",
      activity_level: "Choose your daily activity level",
      dietary_preference: "Select your preferred eating style",
      disease: "Choose your health conditions (if any)",
      target_calories: "Daily calorie goal",
      target_protein: "Daily protein goal (grams)",
      target_carbs: "Daily carbohydrates goal (grams)",
      target_fat: "Daily fat goal (grams)",
      target_sugar: "Daily sugar limit (grams)",
      target_sodium: "Daily sodium limit (mg)",
      target_fiber: "Daily fiber goal (grams)",
      days: "Number of days for meal plan"
    };
    return descriptions[key] || "";
  };

  const renderSelectField = (key) => (
    <div className="relative">
      <select
        name={key}
        value={form[key]}
        onChange={handleChange}
        className="w-full border-2 border-pink-100 focus:border-pink-300 focus:ring-2 focus:ring-pink-100 p-4 rounded-xl bg-gradient-to-r from-gray-50 to-pink-50 transition-all duration-200 outline-none appearance-none cursor-pointer hover:shadow-md text-gray-700 font-medium"
      >
        {getSelectOptions(key).map(option => (
          <option key={option} value={option} className="bg-white py-2">
            {option}
          </option>
        ))}
      </select>
      <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
        <svg className="w-5 h-5 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  );

  const renderNumberField = (key) => (
    <input
      type="number"
      name={key}
      value={form[key]}
      onChange={handleChange}
      className="w-full border-2 border-pink-100 focus:border-pink-300 focus:ring-2 focus:ring-pink-100 p-4 rounded-xl bg-gradient-to-r from-gray-50 to-pink-50 transition-all duration-200 outline-none hover:shadow-md text-gray-700 font-medium"
      min="1"
      placeholder={`Enter ${key.replace(/_/g, " ").toLowerCase()}`}
    />
  );

  // Separate profile fields from nutritional targets
  const profileFields = ['gender', 'activity_level', 'dietary_preference', 'disease'];
  const nutritionalFields = ['target_calories', 'target_protein', 'target_carbs', 'target_fat', 'target_sugar', 'target_sodium', 'target_fiber'];
  const otherFields = ['days'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-orange-50 to-yellow-50 p-4 sm:p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-pink-500 to-orange-400 rounded-full mb-4">
            <span className="text-3xl">🍽️</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-pink-500 via-orange-400 to-yellow-500 bg-clip-text text-transparent mb-4">
            Smart Meal Planning
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Create your personalized meal plan based on your health profile and nutritional goals
          </p>
        </div>

        {/* Main Form Container */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8 mb-6 border border-white/20">
          <div className="space-y-8">
            
            {/* Profile Section */}
            <div className="bg-gradient-to-r from-pink-50 to-orange-50 rounded-2xl p-6 border border-pink-100">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <span className="mr-3 text-2xl">👤</span>
                Personal Profile
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {profileFields.map((key) => (
                  <div key={key} className="space-y-3">
                    <label className="flex items-center text-gray-700 font-semibold text-sm">
                      <span className="mr-2 text-lg">{getFieldIcon(key)}</span>
                      <div className="flex flex-col">
                        <span>{key.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}</span>
                        <span className="text-xs text-gray-500 font-normal">{getFieldDescription(key)}</span>
                      </div>
                    </label>
                    {renderSelectField(key)}
                  </div>
                ))}
              </div>
            </div>

            {/* Nutritional Targets Section */}
            <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-2xl p-6 border border-orange-100">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <span className="mr-3 text-2xl">📊</span>
                Nutritional Targets
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {nutritionalFields.map((key) => (
                  <div key={key} className="space-y-3">
                    <label className="flex items-center text-gray-700 font-semibold text-sm">
                      <span className="mr-2 text-lg">{getFieldIcon(key)}</span>
                      <div className="flex flex-col">
                        <span>{key.replace(/target_/, "").replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}</span>
                        <span className="text-xs text-gray-500 font-normal">{getFieldDescription(key)}</span>
                      </div>
                    </label>
                    {renderNumberField(key)}
                  </div>
                ))}
              </div>
            </div>

            {/* Plan Duration Section */}
            <div className="bg-gradient-to-r from-yellow-50 to-pink-50 rounded-2xl p-6 border border-yellow-100">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <span className="mr-3 text-2xl">⏰</span>
                Plan Duration
              </h3>
              <div className="max-w-xs">
                {otherFields.map((key) => (
                  <div key={key} className="space-y-3">
                    <label className="flex items-center text-gray-700 font-semibold text-sm">
                      <span className="mr-2 text-lg">{getFieldIcon(key)}</span>
                      <div className="flex flex-col">
                        <span>{key.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}</span>
                        <span className="text-xs text-gray-500 font-normal">{getFieldDescription(key)}</span>
                      </div>
                    </label>
                    {renderNumberField(key)}
                  </div>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                onClick={handleSubmit}
                className={`w-full px-8 py-5 rounded-xl font-bold text-white text-lg transition-all duration-300 transform ${
                  loading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-pink-500 via-orange-400 to-yellow-500 hover:from-pink-600 hover:via-orange-500 hover:to-yellow-600 hover:shadow-xl hover:-translate-y-2 active:translate-y-0 shadow-lg"
                }`}
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-7 w-7 border-3 border-white border-t-transparent mr-3"></div>
                    <div className="flex flex-col">
                      <span>Analyzing Your Profile...</span>
                      <span className="text-sm opacity-90">Creating personalized recommendations</span>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <span className="mr-2 text-xl">✨</span>
                    Generate My Smart Meal Plan
                    <span className="ml-2 text-xl">🍽️</span>
                  </div>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Results Section */}
        {result && (
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-white/20 mt-6">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-400 to-blue-500 rounded-full mb-4">
                <span className="text-2xl">🎉</span>
              </div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-green-500 to-blue-500 bg-clip-text text-transparent mb-3">
                Your Personalized Meal Plan
              </h2>
            </div>

            {/* Daily Meal Plans */}
            {result.weekly_plan && (
              <div className="space-y-6 mb-8">
                {result.weekly_plan.map((dayPlan) => (
                  <div key={dayPlan.day} className="bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 rounded-2xl p-6 border border-green-100 shadow-md">
                    <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                      <span className="mr-2 text-2xl">📅</span>
                      Day {dayPlan.day}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {dayPlan.meal["Breakfast Suggestion"] && (
                        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                          <p className="font-semibold text-gray-700">🌅 Breakfast:</p>
                          <p className="text-gray-600 text-sm">{dayPlan.meal["Breakfast Suggestion"]}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            ({dayPlan.meal["Breakfast Calories"]?.toFixed(0)} kcal, {dayPlan.meal["Breakfast Protein"]?.toFixed(0)}g protein)
                          </p>
                        </div>
                      )}
                      {dayPlan.meal["Lunch Suggestion"] && (
                        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                          <p className="font-semibold text-gray-700">☀️ Lunch:</p>
                          <p className="text-gray-600 text-sm">{dayPlan.meal["Lunch Suggestion"]}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            ({dayPlan.meal["Lunch Calories"]?.toFixed(0)} kcal, {dayPlan.meal["Lunch Protein"]?.toFixed(0)}g protein)
                          </p>
                        </div>
                      )}
                      {dayPlan.meal["Dinner Suggestion"] && (
                        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                          <p className="font-semibold text-gray-700">🌙 Dinner:</p>
                          <p className="text-gray-600 text-sm">{dayPlan.meal["Dinner Suggestion"]}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            ({dayPlan.meal["Dinner Calories"]?.toFixed(0)} kcal, {dayPlan.meal["Dinner Protein.1"]?.toFixed(0)}g protein)
                          </p>
                        </div>
                      )}
                      {dayPlan.meal["Snack Suggestion"] && (
                        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                          <p className="font-semibold text-gray-700">🍎 Snacks:</p>
                          <p className="text-gray-600 text-sm">{dayPlan.meal["Snack Suggestion"]}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            ({dayPlan.meal["Snacks Calories"]?.toFixed(0)} kcal)
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Weekly Nutritional Breakdown */}
            {result.weekly_totals && (
              <div className="bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 rounded-2xl p-8 border border-green-100">
                <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center justify-center">
                  <span className="mr-3 text-3xl">📊</span>
                  Weekly Nutritional Breakdown
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {Object.entries(result.weekly_totals).map(([key, value], index) => (
                    <div key={key} className="bg-white rounded-2xl p-6 text-center shadow-lg border border-white/50 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                      <div className="text-3xl font-bold bg-gradient-to-r from-green-500 to-blue-500 bg-clip-text text-transparent mb-2">
                        {typeof value === 'number' ? value.toLocaleString(undefined, { maximumFractionDigits: 0 }) : value}
                      </div>
                      <div className="text-sm text-gray-600 capitalize font-semibold">
                        {key.replace(/_/g, " ")}
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        {key === 'Calories' ? 'kcal' : key === 'Sodium' ? 'mg' : key === 'Cost' ? '$' : 'g'}
                      </div>
                      <div className={`w-full h-2 bg-gradient-to-r rounded-full mt-3 ${
                        index % 4 === 0 ? 'from-pink-200 to-pink-400' :
                        index % 4 === 1 ? 'from-blue-200 to-blue-400' :
                        index % 4 === 2 ? 'from-green-200 to-green-400' :
                        'from-purple-200 to-purple-400'
                      }`}></div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-8 text-center">
                  <p className="text-gray-600 text-sm bg-white/50 p-4 rounded-xl border border-white/30">
                    💡 <strong>Pro Tip:</strong> These totals are calculated based on your personal profile and health conditions. 
                    Always consult with a healthcare professional for personalized dietary advice.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}