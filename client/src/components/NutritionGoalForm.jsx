import { useState } from "react";
import { postData } from "../api";

export default function NutritionGoalForm() {
  const [form, setForm] = useState({
    dietary_preference: "Omnivore",
    activity_level: "Moderately Active", // Changed to match backend example
    age: 30,
    height: 170,
    weight: 70,
    disease: "",
    days: 7,
    target_calories: "",
    target_protein: "",
    target_carbs: "",
    target_fat: "",
    target_sugar: 150,
    target_sodium: 25,
    target_fiber: 25,
  });
  const [currentStep, setCurrentStep] = useState(0);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false); // Not used in this version but kept

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit() {
    setLoading(true);
    try {
      const payload = {
        ...form,
        age: Number(form.age),
        height: Number(form.height),
        weight: Number(form.weight),
        days: Number(form.days),
        // Ensure that if these are empty strings, they are sent as undefined or not included
        target_calories: form.target_calories ? Number(form.target_calories) : undefined,
        target_protein: form.target_protein ? Number(form.target_protein) : undefined,
        target_carbs: form.target_carbs ? Number(form.target_carbs) : undefined,
        target_fat: form.target_fat ? Number(form.target_fat) : undefined,
        target_sugar: Number(form.target_sugar),
        target_sodium: Number(form.target_sodium),
        target_fiber: Number(form.target_fiber),
      };
      
      // Remove empty string fields that are not optional number fields
      // This ensures 'disease' if empty, is not sent
      Object.keys(payload).forEach(key => {
        if (payload[key] === "" && key !== 'disease') { // Keep disease if it's an empty string for the select box's default
          delete payload[key];
        }
        if (key === 'disease' && payload[key] === '') { // Explicitly handle disease if it's empty string
          delete payload[key];
        }
      });

      console.log("Sending payload:", payload); // Log payload to see what's sent
      const res = await postData("/nutrition_goal/recommend", payload);
      setResult(res);
      setCurrentStep(4);
    } catch (err) {
      alert("Failed to fetch nutrition plan: " + err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const steps = [
    {
      title: "Tell us about you",
      subtitle: "Basic information to personalize your plan",
      icon: "👤",
      fields: ['dietary_preference', 'activity_level', 'age', 'height', 'weight', 'disease', 'days']
    },
    {
      title: "Macro Targets",
      subtitle: "Customize your macronutrient goals (optional)",
      icon: "🎯",
      fields: ['target_calories', 'target_protein', 'target_carbs', 'target_fat']
    },
    {
      title: "Health Limits",
      subtitle: "Set your daily limits for optimal health",
      icon: "🛡",
      fields: ['target_sugar', 'target_sodium', 'target_fiber']
    },
    {
      title: "Review & Submit",
      subtitle: "Double-check your information before we create your plan",
      icon: "📋",
      fields: []
    }
  ];

  const getFieldIcon = (key) => {
    const icons = {
      dietary_preference: "🥗",
      activity_level: "🏃‍♂",
      age: "🎂",
      height: "📏",
      weight: "⚖",
      disease: "🏥",
      days: "📅",
      target_calories: "🔥",
      target_protein: "💪",
      target_carbs: "🍞",
      target_fat: "🥑",
      target_sugar: "🍯",
      target_sodium: "🧂",
      target_fiber: "🌾",
      // Icons for results (case-sensitive to match backend output)
      Calories: "🔥",
      Carbohydrates: "🍞",
      Fat: "🥑",
      Protein: "💪",
      Fiber: "🌾",
      Sodium: "🧂",
      Sugar: "🍯",
      Cost: "💸"
    };
    return icons[key] || "📋";
  };

  const getSelectOptions = (key) => {
    if (key === 'dietary_preference') {
      return ['Vegan', 'Vegetarian', 'Pescatarian', 'Omnivore', 'Keto', 'Paleo'];
    }
    if (key === 'activity_level') {
      // Adjusted to match common backend expectations and your test data
      return ['Low', 'Moderately Active', 'High', 'Very High']; 
    }
    if (key === 'disease') {
      return ['', 'Weight Gain', 'Weight Loss', 'Diabetes', 'Hypertension', 'Kidney Disease', 'None'];
    }
    return [];
  };

  const isOptionalField = (key) => {
    return ['target_calories', 'target_protein', 'target_carbs', 'target_fat', 'disease'].includes(key);
  };

  const renderField = (key) => {
    const isSelect = ['dietary_preference', 'activity_level', 'disease'].includes(key);
    
    return (
      <div key={key} className="group">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-pink-100 hover:border-pink-200 transition-all duration-300 hover:shadow-lg">
          <label className="flex items-center text-gray-700 font-semibold text-lg mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-pink-400 to-orange-400 rounded-xl flex items-center justify-center text-white text-xl mr-4 shadow-lg">
              {getFieldIcon(key)}
            </div>
            <div>
              <div className="capitalize">
                {key.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}
              </div>
              {isOptionalField(key) && (
                <div className="text-sm text-pink-400 font-normal">Optional - leave blank for auto-calculation</div>
              )}
            </div>
          </label>
          
          {isSelect ? (
            <select
              name={key}
              value={form[key]}
              onChange={handleChange}
              className="w-full border-0 bg-gray-50 focus:bg-white p-4 rounded-xl text-lg font-medium transition-all duration-200 outline-none focus:ring-2 focus:ring-pink-300 shadow-inner"
            >
              {getSelectOptions(key).map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          ) : (
            <input
              type={key === 'disease' ? 'text' : 'number'} // Disease input is text - though we made it select now, but keep this logic for other potential text fields
              name={key}
              value={form[key]}
              onChange={handleChange}
              placeholder={isOptionalField(key) ? "Auto-calculate" : "Enter value"}
              className="w-full border-0 bg-gray-50 focus:bg-white p-4 rounded-xl text-lg font-medium transition-all duration-200 outline-none focus:ring-2 focus:ring-pink-300 shadow-inner placeholder:text-gray-400"
              min={key === 'age' ? 1 : key === 'days' ? 1 : 0}
              step={key.includes('target_') ? 0.1 : 1}
            />
          )}
        </div>
      </div>
    );
  };

  const renderPreviewCard = () => (
    <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 border border-pink-100 shadow-xl">
      <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">Your Profile Summary</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Object.entries(form).map(([key, value]) => (
          <div key={key} className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-pink-400 to-orange-400 rounded-lg flex items-center justify-center text-white text-sm">
              {getFieldIcon(key)}
            </div>
            <div>
              <div className="text-sm text-gray-500 capitalize">
                {key.replace(/_/g, " ")}
              </div>
              <div className="font-medium">
                {value || (isOptionalField(key) ? "Auto-calculate" : "Not set")}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const formatNutrientValue = (key, value) => {
    if (typeof value !== 'number') return value;

    let unit = '';
    if (key.toLowerCase().includes('calories')) unit = 'kcal';
    else if (key.toLowerCase().includes('sodium')) unit = 'mg';
    else if (key.toLowerCase().includes('cost')) unit = '$';
    else unit = 'g'; // Default for protein, carbs, fat, sugar, fiber

    return `${value.toLocaleString(undefined, { maximumFractionDigits: 1 })} ${unit}`;
  };

  const renderResults = () => (
    <div className="space-y-8">
      {/* Success Animation */}
      <div className="text-center">
        <div className="w-24 h-24 bg-gradient-to-br from-pink-400 to-orange-400 rounded-full flex items-center justify-center text-white text-4xl mx-auto mb-6 animate-bounce shadow-xl">
          🎉
        </div>
        <h2 className="text-3xl font-bold bg-gradient-to-r from-pink-500 to-orange-400 bg-clip-text text-transparent mb-4">
          Your Nutrition Plan is Ready!
        </h2>
      </div>

      {/* Daily Goals */}
      {result?.predicted_nutrition && (
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 border border-pink-100 shadow-xl">
          <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">Daily Nutrition Goals</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {Object.entries(result.predicted_nutrition).map(([key, value]) => (
              <div key={key} className="text-center group hover:scale-105 transition-transform duration-300">
                <div className="w-20 h-20 bg-gradient-to-br from-pink-400 to-orange-400 rounded-2xl flex items-center justify-center text-white text-2xl mx-auto mb-3 shadow-lg group-hover:shadow-xl">
                  {getFieldIcon(key)}
                </div>
                <div className="text-2xl font-bold text-gray-800 mb-1">
                  {formatNutrientValue(key, value)}
                </div>
                <div className="text-sm text-gray-600 capitalize">
                  {key.replace(/_/g, " ")}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Weekly Totals */}
      {result?.weekly_totals && (
        <div className="bg-gradient-to-r from-pink-50 to-orange-50 rounded-3xl p-8 border border-pink-100 shadow-xl">
          <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">Weekly Totals ({form.days} days)</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {Object.entries(result.weekly_totals).map(([key, value]) => (
              <div key={key} className="bg-white rounded-2xl p-6 text-center shadow-md hover:shadow-lg transition-shadow duration-300">
                <div className="text-3xl font-bold bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent mb-2">
                  {formatNutrientValue(key, value)}
                </div>
                <div className="text-sm text-gray-600 capitalize">
                  {key.replace(/_/g, " ")}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Weekly Plan */}
      {result?.weekly_plan && (
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 border border-pink-100 shadow-xl">
          <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">Your Weekly Meal Plan</h3>
          <div className="space-y-8">
            {result.weekly_plan.map((dayPlan) => (
              <div key={dayPlan.day} className="bg-pink-50 rounded-2xl p-6 shadow-md border border-pink-100">
                <h4 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                  <span className="w-8 h-8 bg-gradient-to-br from-pink-400 to-orange-400 rounded-full flex items-center justify-center text-white text-lg mr-3 shadow-md">
                    📅
                  </span>
                  Day {dayPlan.day}
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {dayPlan.meal["Breakfast Suggestion"] && (
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-3">
                      <span className="text-2xl">🍳</span>
                      <div>
                        <div className="font-semibold text-gray-700">Breakfast:</div>
                        <div className="text-gray-600">{dayPlan.meal["Breakfast Suggestion"]}</div>
                      </div>
                    </div>
                  )}
                  {dayPlan.meal["Lunch Suggestion"] && (
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-3">
                      <span className="text-2xl">🍜</span>
                      <div>
                        <div className="font-semibold text-gray-700">Lunch:</div>
                        <div className="text-gray-600">{dayPlan.meal["Lunch Suggestion"]}</div>
                      </div>
                    </div>
                  )}
                  {dayPlan.meal["Dinner Suggestion"] && (
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-3">
                      <span className="text-2xl">🍽️</span>
                      <div>
                        <div className="font-semibold text-gray-700">Dinner:</div>
                        <div className="text-gray-600">{dayPlan.meal["Dinner Suggestion"]}</div>
                      </div>
                    </div>
                  )}
                  {dayPlan.meal["Snack Suggestion"] && (
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-3">
                      <span className="text-2xl">🍎</span>
                      <div>
                        <div className="font-semibold text-gray-700">Snack:</div>
                        <div className="text-gray-600">{dayPlan.meal["Snack Suggestion"]}</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}


      <div className="text-center">
        <button
          onClick={() => {setCurrentStep(0); setResult(null);}}
          className="px-8 py-4 bg-gradient-to-r from-pink-500 to-orange-400 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
        >
          Create Another Plan
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-orange-50 to-pink-50 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-pink-200 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-orange-200 rounded-full opacity-20 animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-100 rounded-full opacity-10 animate-spin" style={{animationDuration: '20s'}}></div>
      </div>

      <div className="relative z-10 p-4 sm:p-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-pink-500 to-orange-400 bg-clip-text text-transparent mb-4">
              Nutrition Goals
            </h1>
            <p className="text-gray-600 text-xl">
              Create your personalized nutrition plan in just a few steps
            </p>
          </div>

          {/* Progress Bar */}
          {currentStep < 4 && (
            <div className="mb-12">
              <div className="flex justify-between items-center mb-4">
                {steps.slice(0, 4).map((step, index) => (
                  <div key={index} className="flex items-center">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold transition-all duration-300 ${
                      index <= currentStep 
                        ? 'bg-gradient-to-r from-pink-500 to-orange-400 text-white shadow-lg' 
                        : 'bg-gray-200 text-gray-400'
                    }`}>
                      {index < currentStep ? '✓' : step.icon}
                    </div>
                    {index < 3 && (
                      <div className={`w-16 h-1 mx-4 rounded-full transition-all duration-300 ${
                        index < currentStep ? 'bg-gradient-to-r from-pink-500 to-orange-400' : 'bg-gray-200'
                      }`}></div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step Content */}
          {currentStep < 4 && (
            <div className="bg-white/60 backdrop-blur-lg rounded-3xl shadow-2xl p-8 mb-8 border border-white/20">
              <div className="text-center mb-8">
                <div className="text-6xl mb-4">{steps[currentStep].icon}</div>
                <h2 className="text-3xl font-bold text-gray-800 mb-2">{steps[currentStep].title}</h2>
                <p className="text-gray-600 text-lg">{steps[currentStep].subtitle}</p>
              </div>

              {currentStep < 3 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {steps[currentStep].fields.map(renderField)}
                </div>
              ) : (
                renderPreviewCard()
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between items-center mt-8 pt-8 border-t border-pink-100">
                <button
                  onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                  disabled={currentStep === 0}
                  className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                    currentStep === 0
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-white text-gray-700 border-2 border-pink-200 hover:border-pink-300 hover:shadow-md'
                  }`}
                >
                  ← Previous
                </button>

                {currentStep === 3 ? (
                  <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className={`px-8 py-3 rounded-xl font-semibold text-white transition-all duration-300 transform ${
                      loading
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-pink-500 to-orange-400 hover:from-pink-600 hover:to-orange-500 hover:shadow-lg hover:-translate-y-1 shadow-xl'
                    }`}
                  >
                    {loading ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-3"></div>
                        Creating Plan...
                      </div>
                    ) : (
                      '🚀 Create My Plan'
                    )}
                  </button>
                ) : (
                  <button
                    onClick={() => setCurrentStep(currentStep + 1)}
                    className="px-8 py-3 bg-gradient-to-r from-pink-500 to-orange-400 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                  >
                    Next →
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Results */}
          {currentStep === 4 && result && renderResults()}
        </div>
      </div>
    </div>
  );
}