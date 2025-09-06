import { useState, useEffect, useMemo } from "react";
import { postData } from "../api"; // Assuming postData is exported from ../api

export default function VarietyClusteringForm() {
  const [currentStep, setCurrentStep] = useState(0);
  const [form, setForm] = useState({
    dietary_preference: "Omnivore",
    activity_level: "Moderately Active",
    age: 28,
    height: 175,
    weight: 72,
    target_protein: 100,
    target_sugar: 80,
    target_sodium: 2200,
    target_calories: 2500,
    target_carbs: 300,
    target_fiber: 30,
    target_fat: 70,
    days: 7,
    preferred_ingredients: "",
    disease: "",
    goals: [],
    mealTiming: "3-meals"
  });

  // State to hold the processed result for frontend display
  const [processedResult, setProcessedResult] = useState(null); 
  const [loading, setLoading] = useState(false);
  const [aiThinking, setAiThinking] = useState(false);
  const [nutritionScore, setNutritionScore] = useState(0);
  const [achievements, setAchievements] = useState([]);

  // Multi-step form configuration
  const steps = [
    { title: "Basic Info", icon: "👤", fields: ["age", "height", "weight"] },
    { title: "Lifestyle", icon: "🏃", fields: ["activity_level", "dietary_preference", "mealTiming"] },
    { title: "Health Goals", icon: "🎯", fields: ["goals", "disease"] },
    { title: "Nutrition Targets", icon: "📊", fields: ["target_calories", "target_protein", "target_carbs", "target_fat"] },
    { title: "Preferences", icon: "🥗", fields: ["preferred_ingredients", "days"] }
  ];

  // Dynamic options
  const dietaryPreferenceOptions = ["Omnivore", "Vegetarian", "Vegan", "Pescatarian", "Keto", "Paleo", "Mediterranean"];
  const activityLevelOptions = ["Sedentary", "Lightly Active", "Moderately Active", "Very Active", "Extremely Active"];
  const mealTimingOptions = ["3-meals", "5-small-meals", "intermittent-16-8", "intermittent-18-6"];
  const goalOptions = ["Weight Loss", "Muscle Gain", "Endurance", "General Health", "Anti-Inflammatory", "Energy Boost"];
  
  const diseaseOptions = [
    "", "Weight Gain", "Weight Gain, Hypertension, Heart Disease",
    "Weight Gain, Hypertension, Heart Disease, Kidney Disease",
    "Diabetes, Acne, Weight Gain, Hypertension, Heart Disease, Kidney Disease",
    "Hypertension, Heart Disease", "Kidney Disease"
  ];

  // Calculate nutrition score based on form completeness and balance
  const calculateNutritionScore = useMemo(() => {
    let score = 0;
    const totalFields = Object.keys(form).length;
    // Filter out 'goals' array and other empty/zero values for completeness calculation
    const filledFields = Object.entries(form).filter(([key, value]) => {
      if (key === 'goals') return value.length > 0;
      return value !== "" && value !== 0;
    }).length;
    
    score += (filledFields / totalFields) * 40; // Completeness: 40 points
    
    // Balance scoring for primary macros
    const proteinCalories = form.target_protein * 4;
    const carbCalories = form.target_carbs * 4;
    const fatCalories = form.target_fat * 9;
    
    const totalMacroCalories = proteinCalories + carbCalories + fatCalories;

    if (totalMacroCalories > 0) { // Prevent division by zero
      const proteinRatioOverall = form.target_calories > 0 ? proteinCalories / form.target_calories : 0;
      const carbRatioOverall = form.target_calories > 0 ? carbCalories / form.target_calories : 0;
      const fatRatioOverall = form.target_calories > 0 ? fatCalories / form.target_calories : 0;

      if (proteinRatioOverall >= 0.15 && proteinRatioOverall <= 0.35) score += 20;
      if (carbRatioOverall >= 0.35 && carbRatioOverall <= 0.65) score += 20;
      if (fatRatioOverall >= 0.20 && fatRatioOverall <= 0.35) score += 20;
    }
    
    return Math.min(Math.round(score), 100);
  }, [form]);

  useEffect(() => {
    setNutritionScore(calculateNutritionScore);
  }, [calculateNutritionScore]);

  // Simulate AI thinking for user experience
  const simulateAiThinking = async () => {
    setAiThinking(true);
    const thinkingSteps = [
      "Analyzing your nutritional profile...",
      "Calculating macro distribution...",
      "Generating meal combinations...",
      "Optimizing for your preferences...",
      "Creating variety suggestions..."
    ];
    
    for (let step of thinkingSteps) {
      await new Promise(resolve => setTimeout(resolve, 800));
    }
    setAiThinking(false);
  };

  const handleChange = (field, value) => {
    if (field === 'goals') {
      const currentGoals = form.goals;
      const updatedGoals = currentGoals.includes(value)
        ? currentGoals.filter(g => g !== value)
        : [...currentGoals, value];
      setForm({ ...form, [field]: updatedGoals });
    } else {
      setForm({ ...form, [field]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setProcessedResult(null); // Clear previous results
    setAchievements([]); // Clear previous achievements

    try {
      await simulateAiThinking(); // Show AI thinking animation

      // Call the backend API
      const backendResponse = await postData("/variety_clustering/recommend", form);
      
      // --- Process backendResponse to fit frontend structure ---
      const newWeeklyPlan = {};
      let totalCaloriesPlanned = 0; // For calorie accuracy calculation
      const mealSuggestions = new Set(); // To estimate variety

      backendResponse.weekly_plan.forEach(dayPlan => {
        const meal = dayPlan.meal;
        const dayKey = `day_${dayPlan.day}`;

        const breakfastCalories = meal["Breakfast Calories"] || 0;
        const lunchCalories = meal["Lunch Calories"] || 0;
        const dinnerCalories = meal["Dinner Calories"] || 0;
        const snacksCalories = meal["Snacks Calories"] || 0;

        const dayTotalCalories = breakfastCalories + lunchCalories + dinnerCalories + snacksCalories;
        totalCaloriesPlanned += dayTotalCalories;

        newWeeklyPlan[dayKey] = {
          breakfast: { 
            name: meal["Breakfast Suggestion"] || "N/A", 
            calories: breakfastCalories 
          },
          lunch: { 
            name: meal["Lunch Suggestion"] || "N/A", 
            calories: lunchCalories 
          },
          dinner: { 
            name: meal["Dinner Suggestion"] || "N/A", 
            calories: dinnerCalories 
          },
          snacks: { // Added snacks to the structure
            name: meal["Snack Suggestion"] || "N/A", 
            calories: snacksCalories 
          },
          totalCalories: dayTotalCalories,
          cluster_label: dayPlan.cluster_label // Keep cluster label for potential future use
        };

        // Add meal suggestions to the set for variety score
        mealSuggestions.add(meal["Breakfast Suggestion"]);
        mealSuggestions.add(meal["Lunch Suggestion"]);
        mealSuggestions.add(meal["Dinner Suggestion"]);
        mealSuggestions.add(meal["Snack Suggestion"]);
      });

      // Calculate insights from the processed data
      const avgDailyCalories = backendResponse.weekly_plan.length > 0 
                                ? totalCaloriesPlanned / backendResponse.weekly_plan.length 
                                : 0;
      const calorieAccuracy = form.target_calories > 0 
                              ? Math.min(100, Math.round((1 - Math.abs(form.target_calories - avgDailyCalories) / form.target_calories) * 100))
                              : 0;

      // Simple variety score: higher number of unique meal suggestions = higher variety
      const varietyScore = Math.min(100, Math.round((mealSuggestions.size / (backendResponse.weekly_plan.length * 4)) * 100)); // Max 4 unique meals per day * total days

      const insights = {
        calorie_accuracy: calorieAccuracy,
        variety_score: varietyScore, // This can be made more sophisticated
        health_score: nutritionScore // Reusing client-side nutrition score for now
      };

      setProcessedResult({
        weekly_plan: newWeeklyPlan,
        insights: insights
      });
      // --- End processing ---
      
      // Award achievements (logic remains client-side)
      const newAchievements = [];
      if (nutritionScore >= 80) newAchievements.push("🏆 Nutrition Expert");
      if (form.goals.length >= 3) newAchievements.push("🎯 Goal Setter");
      if (form.preferred_ingredients.length > 20) newAchievements.push("🌟 Ingredient Explorer");
      
      setAchievements(newAchievements);
    } catch (err) {
      alert("Error generating plan: " + err.message);
      console.error("API Error:", err);
    } finally {
      setLoading(false);
      setAiThinking(false); // Ensure AI thinking is turned off
    }
  };

  const nextStep = () => setCurrentStep(Math.min(currentStep + 1, steps.length - 1));
  const prevStep = () => setCurrentStep(Math.max(currentStep - 1, 0));

  const renderProgressBar = () => (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <span className="text-sm font-medium text-gray-600">Progress</span>
        <span className="text-sm font-medium text-gray-600">{currentStep + 1}/{steps.length}</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
        <div 
          className="bg-gradient-to-r from-pink-500 to-orange-500 h-3 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
        />
      </div>
      <div className="flex justify-between">
        {steps.map((step, index) => (
          <div key={index} className={`flex flex-col items-center ${index <= currentStep ? 'text-pink-500' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm mb-1 ${
              index <= currentStep ? 'bg-pink-500 text-white' : 'bg-gray-200'
            }`}>
              {step.icon}
            </div>
            <span className="text-xs hidden sm:block">{step.title}</span>
          </div>
        ))}
      </div>
    </div>
  );

  const renderField = (key) => {
    const value = form[key];
    const label = key.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase());
    
    // Multi-select goals
    if (key === 'goals') {
      return (
        <div className="space-y-3">
          <label className="block text-gray-700 font-medium text-sm">{label}</label>
          <div className="grid grid-cols-2 gap-3">
            {goalOptions.map((goal) => (
              <button
                key={goal}
                type="button"
                onClick={() => handleChange('goals', goal)}
                className={`p-3 rounded-xl border-2 transition-all duration-200 text-sm font-medium ${
                  form.goals.includes(goal)
                    ? 'border-pink-500 bg-pink-50 text-pink-700'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-pink-300'
                }`}
              >
                {goal}
              </button>
            ))}
          </div>
        </div>
      );
    }

    // Dropdown fields
    if (['dietary_preference', 'activity_level', 'mealTiming', 'disease'].includes(key)) {
      const options = key === 'dietary_preference' ? dietaryPreferenceOptions :
                    key === 'activity_level' ? activityLevelOptions :
                    key === 'mealTiming' ? mealTimingOptions : diseaseOptions;
      
      return (
        <div className="space-y-2">
          <label className="block text-gray-700 font-medium text-sm">{label}</label>
          <select
            value={value}
            onChange={(e) => handleChange(key, e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-transparent transition-all duration-200 text-gray-700"
          >
            {key === 'disease' && <option value="">No specific conditions</option>}
            {options.map((option) => (
              <option key={option} value={option}>
                {key === 'mealTiming' ? option.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : option}
              </option>
            ))}
          </select>
        </div>
      );
    }

    // Range sliders for nutrition targets
    if (key.startsWith('target_')) {
      const ranges = {
        target_calories: { min: 1200, max: 4000, step: 50 },
        target_protein: { min: 50, max: 300, step: 5 },
        target_carbs: { min: 100, max: 600, step: 10 },
        target_fat: { min: 30, max: 200, step: 5 }
      };
      
      const range = ranges[key] || { min: 0, max: 100, step: 1 };
      
      return (
        <div className="space-y-3">
          <label className="block text-gray-700 font-medium text-sm">{label}</label>
          <div className="px-2">
            <input
              type="range"
              min={range.min}
              max={range.max}
              step={range.step}
              value={value}
              onChange={(e) => handleChange(key, parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>{range.min}</span>
              <span className="font-medium text-pink-600">{value}</span>
              <span>{range.max}</span>
            </div>
          </div>
        </div>
      );
    }

    // Regular inputs
    const inputType = ['age', 'height', 'weight', 'days'].includes(key) ? 'number' : 'text';
    
    if (key === 'preferred_ingredients') {
      return (
        <div className="space-y-2">
          <label className="block text-gray-700 font-medium text-sm">{label}</label>
          <textarea
            value={value}
            onChange={(e) => handleChange(key, e.target.value)}
            placeholder="e.g., chicken, rice, spinach, tomatoes, salmon..."
            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-transparent transition-all duration-200 text-gray-700 resize-none h-24"
          />
        </div>
      );
    }
    
    return (
      <div className="space-y-2">
        <label className="block text-gray-700 font-medium text-sm">{label}</label>
        <input
          type={inputType}
          value={value}
          onChange={(e) => handleChange(key, inputType === 'number' ? parseInt(e.target.value) || 0 : e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-transparent transition-all duration-200 text-gray-700"
          placeholder={inputType === 'number' ? '0' : `Enter ${label.toLowerCase()}`}
        />
      </div>
    );
  };

  const currentStepFields = steps[currentStep]?.fields || [];
  const isLastStep = currentStep === steps.length - 1;

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-orange-50 to-pink-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header with Score */}
        <div className="text-center mb-8 bg-white rounded-3xl shadow-lg p-8">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-r from-pink-400 to-orange-400 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-white text-2xl">🧠</span>
            </div>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-500 to-orange-500 bg-clip-text text-transparent mb-4">
            AI Nutrition Planner
          </h1>
          <p className="text-gray-600 text-lg mb-4">
            Intelligent meal planning powered by advanced nutrition science
          </p>
          
          {/* Nutrition Score Display */}
          <div className="flex items-center justify-center space-x-4">
            <div className="text-center">
              <div className={`text-3xl font-bold ${
                nutritionScore >= 80 ? 'text-green-500' :
                nutritionScore >= 60 ? 'text-yellow-500' : 'text-red-500'
              }`}>
                {nutritionScore}
              </div>
              <div className="text-sm text-gray-600">Nutrition Score</div>
            </div>
            {achievements.length > 0 && (
              <div className="flex space-x-1">
                {achievements.map((achievement, index) => (
                  <div key={index} className="text-xl" title={achievement}>
                    {achievement.split(' ')[0]}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-xl p-8">
          {renderProgressBar()}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="min-h-[300px]">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <span className="mr-3 text-3xl">{steps[currentStep].icon}</span>
                {steps[currentStep].title}
              </h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                {currentStepFields.map((field) => (
                  <div key={field}>
                    {renderField(field)}
                  </div>
                ))}
              </div>
            </div>

            {/* Navigation */}
            <div className="flex justify-between pt-6">
              <button
                type="button"
                onClick={prevStep}
                disabled={currentStep === 0 || loading || aiThinking}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 transition-all duration-200"
              >
                Previous
              </button>
              
              {!isLastStep ? (
                <button
                  type="button"
                  onClick={nextStep}
                  disabled={loading || aiThinking}
                  className="px-6 py-3 bg-gradient-to-r from-pink-500 to-orange-500 text-white rounded-xl font-medium hover:from-pink-600 hover:to-orange-600 transition-all duration-200"
                >
                  Next Step
                </button>
              ) : (
                <button
                  type="submit"
                  className="px-8 py-3 bg-gradient-to-r from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600 text-white font-semibold rounded-xl shadow-lg transform transition-all duration-200 hover:scale-105 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  disabled={loading || aiThinking}
                >
                  {(loading || aiThinking) ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Generating Plan...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <span>🧠</span>
                      <span>Generate AI Plan</span>
                    </div>
                  )}
                </button>
              )}
            </div>
          </form>

          {/* AI Thinking Animation */}
          {aiThinking && (
            <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl border border-blue-200">
              <div className="flex items-center justify-center space-x-3 mb-4">
                <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"></div>
                <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                <div className="w-3 h-3 bg-pink-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
              </div>
              <p className="text-center text-gray-700 font-medium">AI is analyzing your profile...</p>
            </div>
          )}

          {/* Results Display */}
          {processedResult && (
            <div className="mt-8 space-y-6">
              {/* Insights Cards */}
              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-2xl border border-green-200">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600 mb-2">{processedResult.insights.calorie_accuracy}%</div>
                    <div className="text-sm text-gray-600">Calorie Accuracy</div>
                  </div>
                </div>
                <div className="bg-gradient-to-r from-purple-50 to-violet-50 p-6 rounded-2xl border border-purple-200">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600 mb-2">{processedResult.insights.variety_score}</div>
                    <div className="text-sm text-gray-600">Variety Score</div>
                  </div>
                </div>
                <div className="bg-gradient-to-r from-orange-50 to-red-50 p-6 rounded-2xl border border-orange-200">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-orange-600 mb-2">{processedResult.insights.health_score}</div>
                    <div className="text-sm text-gray-600">Health Score</div>
                  </div>
                </div>
              </div>

              {/* Weekly Plan */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-200 p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                  <span className="mr-3">📅</span>
                  Your Personalized Weekly Plan
                </h2>
                
                <div className="grid gap-4">
                  {/* Convert processedResult.weekly_plan object to an array of its values for mapping */}
                  {Object.entries(processedResult.weekly_plan).map(([dayKey, meals]) => (
                    <div key={dayKey} className="bg-white rounded-xl p-4 shadow-sm">
                      <h3 className="font-bold text-lg text-gray-800 mb-3 capitalize">
                        {dayKey.replace('_', ' ')} {/* e.g., "day_1" to "Day 1" */}
                        {meals.cluster_label && <span className="text-xs ml-2 px-2 py-1 bg-gray-100 rounded-full text-gray-500">{meals.cluster_label}</span>}
                      </h3>
                      <div className="grid md:grid-cols-4 gap-4"> {/* Changed to 4 columns for snacks */}
                        <div className="text-center p-3 bg-yellow-50 rounded-lg">
                          <div className="text-2xl mb-1">🌅</div>
                          <div className="font-medium text-sm text-gray-700">{meals.breakfast.name}</div>
                          <div className="text-xs text-gray-500">{meals.breakfast.calories} cal</div>
                        </div>
                        <div className="text-center p-3 bg-orange-50 rounded-lg">
                          <div className="text-2xl mb-1">☀</div>
                          <div className="font-medium text-sm text-gray-700">{meals.lunch.name}</div>
                          <div className="text-xs text-gray-500">{meals.lunch.calories} cal</div>
                        </div>
                        <div className="text-center p-3 bg-purple-50 rounded-lg">
                          <div className="text-2xl mb-1">🌙</div>
                          <div className="font-medium text-sm text-gray-700">{meals.dinner.name}</div>
                          <div className="text-xs text-gray-500">{meals.dinner.calories} cal</div>
                        </div>
                        {/* Render snacks */}
                        {meals.snacks && meals.snacks.name !== "N/A" && (
                          <div className="text-center p-3 bg-blue-50 rounded-lg">
                            <div className="text-2xl mb-1">🍎</div>
                            <div className="font-medium text-sm text-gray-700">{meals.snacks.name}</div>
                            <div className="text-xs text-gray-500">{meals.snacks.calories} cal</div>
                          </div>
                        )}
                      </div>
                      <div className="text-center mt-3 pt-3 border-t border-gray-200">
                        <span className="font-bold text-gray-700">Total: {meals.totalCalories} calories</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: linear-gradient(to right, #ec4899, #f97316);
          cursor: pointer;
          box-shadow: 0 4px 8px rgba(0,0,0,0.2);
        }
        
        .slider::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: linear-gradient(to right, #ec4899, #f97316);
          cursor: pointer;
          border: none;
          box-shadow: 0 4px 8px rgba(0,0,0,0.2);
        }
      `}</style>
    </div>
  );
}