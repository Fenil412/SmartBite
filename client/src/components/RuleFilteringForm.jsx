import { useState } from "react";
import { postData } from "../api";


export default function RuleFilteringForm() {
  const [form, setForm] = useState({
    gender: "Male",
    activity_level: "Moderately Active",
    dietary_preference: "Omnivore",
    disease: "Weight Gain",
    age: 35,
    height: 180,
    weight: 80,
    target_calories: 2200,
    target_protein: 90,
    target_carbs: 50,
    target_fat: 120,
    target_sugar: 50,
    target_sodium: 2000,
    target_fiber: 25,
    preferred_ingredients: "chicken, avocado, spinach"
  });
  
  const [currentStep, setCurrentStep] = useState(0);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

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
        target_calories: Number(form.target_calories),
        target_protein: Number(form.target_protein),
        target_carbs: Number(form.target_carbs),
        target_fat: Number(form.target_fat),
        target_sugar: Number(form.target_sugar),
        target_sodium: Number(form.target_sodium),
        target_fiber: Number(form.target_fiber),
      };
      const res = await postData("/rule_filtering/recommend", payload);
      setResult(res);
      setCurrentStep(5);
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  }

  const steps = [
    {
      title: "Personal Profile",
      subtitle: "Tell us about yourself for personalized filtering",
      icon: "👤",
      fields: ['gender', 'age', 'height', 'weight']
    },
    {
      title: "Lifestyle & Health",
      subtitle: "Your activity level and health considerations",
      icon: "🏃‍♂",
      fields: ['activity_level', 'dietary_preference', 'disease']
    },
    {
      title: "Nutritional Targets",
      subtitle: "Set your daily nutritional goals",
      icon: "🎯",
      fields: ['target_calories', 'target_protein', 'target_carbs', 'target_fat']
    },
    {
      title: "Health Parameters",
      subtitle: "Fine-tune your health-specific limits",
      icon: "🛡",
      fields: ['target_sugar', 'target_sodium', 'target_fiber']
    },
    {
      title: "Preferences & Review",
      subtitle: "Add your ingredient preferences and review",
      icon: "📋",
      fields: ['preferred_ingredients']
    }
  ];

  const getFieldIcon = (key) => {
    const icons = {
      gender: "👤",
      activity_level: "🏃‍♂",
      dietary_preference: "🥗",
      disease: "🏥",
      age: "🎂",
      height: "📏",
      weight: "⚖",
      target_calories: "🔥",
      target_protein: "💪",
      target_carbs: "🍞",
      target_fat: "🥑",
      target_sugar: "🍯",
      target_sodium: "🧂",
      target_fiber: "🌾",
      preferred_ingredients: "⭐",
      // Add icons for nutritional breakdown in results
      calories: "🔥",
      protein: "💪",
      carbohydrates: "🍞",
      fat: "🥑",
      sugar: "🍯",
      sodium: "🧂",
      fiber: "🌾",
    };
    return icons[key] || "📋";
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

  const isSelectField = (key) => {
    return ['gender', 'activity_level', 'dietary_preference', 'disease'].includes(key);
  };

  const getFieldDescription = (key) => {
    const descriptions = {
      gender: "Your biological gender",
      activity_level: "Your typical daily activity level",
      dietary_preference: "Your preferred eating style",
      disease: "Health conditions to consider",
      age: "Your current age in years",
      height: "Your height in centimeters", 
      weight: "Your current weight in kilograms",
      target_calories: "Daily calorie target",
      target_protein: "Daily protein goal (grams)",
      target_carbs: "Daily carbohydrates goal (grams)",
      target_fat: "Daily fat goal (grams)",
      target_sugar: "Daily sugar limit (grams)",
      target_sodium: "Daily sodium limit (mg)",
      target_fiber: "Daily fiber goal (grams)",
      preferred_ingredients: "Your favorite ingredients (comma separated)"
    };
    return descriptions[key] || "";
  };

  const renderField = (key) => {
    const isTextArea = key === 'preferred_ingredients';
    
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
              <div className="text-sm text-gray-500 font-normal">{getFieldDescription(key)}</div>
            </div>
          </label>
          
          {isSelectField(key) ? (
            <div className="relative">
              <select
                name={key}
                value={form[key]}
                onChange={handleChange}
                className="w-full border-0 bg-gray-50 focus:bg-white p-4 rounded-xl text-lg font-medium transition-all duration-200 outline-none focus:ring-2 focus:ring-pink-300 shadow-inner appearance-none cursor-pointer"
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
          ) : isTextArea ? (
            <textarea
              name={key}
              value={form[key]}
              onChange={handleChange}
              placeholder="e.g., chicken, avocado, spinach, quinoa"
              className="w-full border-0 bg-gray-50 focus:bg-white p-4 rounded-xl text-lg font-medium transition-all duration-200 outline-none focus:ring-2 focus:ring-pink-300 shadow-inner placeholder:text-gray-400 min-h-[100px] resize-none"
              rows={3}
            />
          ) : (
            <input
              type="number"
              name={key}
              value={form[key]}
              onChange={handleChange}
              placeholder="Enter value"
              className="w-full border-0 bg-gray-50 focus:bg-white p-4 rounded-xl text-lg font-medium transition-all duration-200 outline-none focus:ring-2 focus:ring-pink-300 shadow-inner placeholder:text-gray-400"
              min={key === 'age' ? 1 : 0}
              step={key.includes('target_') ? 0.1 : 1}
            />
          )}
        </div>
      </div>
    );
  };

  const renderPreviewCard = () => (
    <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 border border-pink-100 shadow-xl">
      <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">Complete Profile Review</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Object.entries(form).map(([key, value]) => (
          <div key={key} className="flex items-start space-x-3 bg-gradient-to-r from-pink-50 to-orange-50 p-4 rounded-xl border border-pink-100">
            <div className="w-10 h-10 bg-gradient-to-br from-pink-400 to-orange-400 rounded-lg flex items-center justify-center text-white text-lg flex-shrink-0">
              {getFieldIcon(key)}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm text-gray-600 capitalize font-medium">
                {key.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}
              </div>
              <div className="font-semibold text-gray-800 break-words">
                {key === 'preferred_ingredients' ? (
                  <span className="text-pink-600">{value}</span>
                ) : (
                  value || "Not set"
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-6 text-center">
        <div className="bg-gradient-to-r from-pink-100 to-orange-100 p-4 rounded-xl border border-pink-200">
          <p className="text-gray-700 text-sm">
            🎯 <strong>Ready to get your personalized recommendations?</strong> Our smart filtering will find the best options for your profile.
          </p>
        </div>
      </div>
    </div>
  );

  const renderResults = () => (
    <div className="space-y-8">
      {/* Success Animation */}
      <div className="text-center">
        <div className="w-24 h-24 bg-gradient-to-br from-pink-400 to-orange-400 rounded-full flex items-center justify-center text-white text-4xl mx-auto mb-6 animate-bounce shadow-xl">
          🎉
        </div>
        <h2 className="text-3xl font-bold bg-gradient-to-r from-pink-500 to-orange-400 bg-clip-text text-transparent mb-4">
          Your Personalized Recommendations Are Ready!
        </h2>
        <p className="text-gray-600 text-lg">
          Filtered specially for your {result?.recommendation?.["Dietary Preference"]?.toLowerCase()} diet and {result?.recommendation?.Disease?.toLowerCase()} management
        </p>
      </div>

      {/* Meal Suggestions */}
      {(result?.recommendation?.["Breakfast Suggestion"] || result?.recommendation?.["Lunch Suggestion"] || result?.recommendation?.["Dinner Suggestion"] || result?.recommendation?.["Snack Suggestion"]) && (
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 border border-pink-100 shadow-xl">
          <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">🍽 Personalized Meal Suggestions</h3>
          <div className="space-y-4">
            {result?.recommendation?.["Breakfast Suggestion"] && (
              <div className="bg-gradient-to-r from-pink-50 to-orange-50 p-6 rounded-xl border border-pink-100 hover:shadow-md transition-shadow duration-300">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-pink-400 to-orange-400 rounded-xl flex items-center justify-center text-white text-xl mr-4 shadow-lg">
                    🌅
                  </div>
                  <div>
                    <div className="font-semibold text-gray-800 text-lg">Breakfast</div>
                    <div className="text-gray-600">{result.recommendation["Breakfast Suggestion"]}</div>
                  </div>
                </div>
              </div>
            )}
            {result?.recommendation?.["Lunch Suggestion"] && (
              <div className="bg-gradient-to-r from-pink-50 to-orange-50 p-6 rounded-xl border border-pink-100 hover:shadow-md transition-shadow duration-300">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-pink-400 to-orange-400 rounded-xl flex items-center justify-center text-white text-xl mr-4 shadow-lg">
                    ☀
                  </div>
                  <div>
                    <div className="font-semibold text-gray-800 text-lg">Lunch</div>
                    <div className="text-gray-600">{result.recommendation["Lunch Suggestion"]}</div>
                  </div>
                </div>
              </div>
            )}
            {result?.recommendation?.["Dinner Suggestion"] && (
              <div className="bg-gradient-to-r from-pink-50 to-orange-50 p-6 rounded-xl border border-pink-100 hover:shadow-md transition-shadow duration-300">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-pink-400 to-orange-400 rounded-xl flex items-center justify-center text-white text-xl mr-4 shadow-lg">
                    🌙
                  </div>
                  <div>
                    <div className="font-semibold text-gray-800 text-lg">Dinner</div>
                    <div className="text-gray-600">{result.recommendation["Dinner Suggestion"]}</div>
                  </div>
                </div>
              </div>
            )}
            {result?.recommendation?.["Snack Suggestion"] && (
              <div className="bg-gradient-to-r from-pink-50 to-orange-50 p-6 rounded-xl border border-pink-100 hover:shadow-md transition-shadow duration-300">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-pink-400 to-orange-400 rounded-xl flex items-center justify-center text-white text-xl mr-4 shadow-lg">
                    🍎
                  </div>
                  <div>
                    <div className="font-semibold text-gray-800 text-lg">Snack</div>
                    <div className="text-gray-600">{result.recommendation["Snack Suggestion"]}</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Nutritional Breakdown */}
      {(result?.recommendation?.Calories || result?.recommendation?.Protein || result?.recommendation?.Carbohydrates || result?.recommendation?.Fat || result?.recommendation?.Sugar || result?.recommendation?.Sodium || result?.recommendation?.Fiber) && (
        <div className="bg-gradient-to-r from-pink-50 to-orange-50 rounded-3xl p-8 border border-pink-100 shadow-xl">
          <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">📊 Daily Nutritional Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {result?.recommendation?.Calories && (
              <div className="bg-white rounded-2xl p-6 text-center shadow-md hover:shadow-lg transition-shadow duration-300 border border-pink-100">
                <div className="w-16 h-16 bg-gradient-to-br from-pink-400 to-orange-400 rounded-2xl flex items-center justify-center text-white text-2xl mx-auto mb-3 shadow-lg">
                  {getFieldIcon('calories')}
                </div>
                <div className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent mb-2">
                  {result.recommendation.Calories.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600 capitalize">Calories</div>
                <div className="text-xs text-gray-400 mt-1">kcal</div>
              </div>
            )}
            {result?.recommendation?.Protein && (
              <div className="bg-white rounded-2xl p-6 text-center shadow-md hover:shadow-lg transition-shadow duration-300 border border-pink-100">
                <div className="w-16 h-16 bg-gradient-to-br from-pink-400 to-orange-400 rounded-2xl flex items-center justify-center text-white text-2xl mx-auto mb-3 shadow-lg">
                  {getFieldIcon('protein')}
                </div>
                <div className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent mb-2">
                  {result.recommendation.Protein.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600 capitalize">Protein</div>
                <div className="text-xs text-gray-400 mt-1">g</div>
              </div>
            )}
            {result?.recommendation?.Carbohydrates && (
              <div className="bg-white rounded-2xl p-6 text-center shadow-md hover:shadow-lg transition-shadow duration-300 border border-pink-100">
                <div className="w-16 h-16 bg-gradient-to-br from-pink-400 to-orange-400 rounded-2xl flex items-center justify-center text-white text-2xl mx-auto mb-3 shadow-lg">
                  {getFieldIcon('carbohydrates')}
                </div>
                <div className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent mb-2">
                  {result.recommendation.Carbohydrates.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600 capitalize">Carbohydrates</div>
                <div className="text-xs text-gray-400 mt-1">g</div>
              </div>
            )}
            {result?.recommendation?.Fat && (
              <div className="bg-white rounded-2xl p-6 text-center shadow-md hover:shadow-lg transition-shadow duration-300 border border-pink-100">
                <div className="w-16 h-16 bg-gradient-to-br from-pink-400 to-orange-400 rounded-2xl flex items-center justify-center text-white text-2xl mx-auto mb-3 shadow-lg">
                  {getFieldIcon('fat')}
                </div>
                <div className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent mb-2">
                  {result.recommendation.Fat.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600 capitalize">Fat</div>
                <div className="text-xs text-gray-400 mt-1">g</div>
              </div>
            )}
            {result?.recommendation?.Sugar && (
              <div className="bg-white rounded-2xl p-6 text-center shadow-md hover:shadow-lg transition-shadow duration-300 border border-pink-100">
                <div className="w-16 h-16 bg-gradient-to-br from-pink-400 to-orange-400 rounded-2xl flex items-center justify-center text-white text-2xl mx-auto mb-3 shadow-lg">
                  {getFieldIcon('sugar')}
                </div>
                <div className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent mb-2">
                  {result.recommendation.Sugar.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600 capitalize">Sugar</div>
                <div className="text-xs text-gray-400 mt-1">g</div>
              </div>
            )}
            {result?.recommendation?.Sodium && (
              <div className="bg-white rounded-2xl p-6 text-center shadow-md hover:shadow-lg transition-shadow duration-300 border border-pink-100">
                <div className="w-16 h-16 bg-gradient-to-br from-pink-400 to-orange-400 rounded-2xl flex items-center justify-center text-white text-2xl mx-auto mb-3 shadow-lg">
                  {getFieldIcon('sodium')}
                </div>
                <div className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent mb-2">
                  {result.recommendation.Sodium.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600 capitalize">Sodium</div>
                <div className="text-xs text-gray-400 mt-1">mg</div>
              </div>
            )}
            {result?.recommendation?.Fiber && (
              <div className="bg-white rounded-2xl p-6 text-center shadow-md hover:shadow-lg transition-shadow duration-300 border border-pink-100">
                <div className="w-16 h-16 bg-gradient-to-br from-pink-400 to-orange-400 rounded-2xl flex items-center justify-center text-white text-2xl mx-auto mb-3 shadow-lg">
                  {getFieldIcon('fiber')}
                </div>
                <div className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent mb-2">
                  {result.recommendation.Fiber.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600 capitalize">Fiber</div>
                <div className="text-xs text-gray-400 mt-1">g</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Ingredient Focus */}
      {result?.recommendation?.preferred_ingredients && (
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 border border-pink-100 shadow-xl">
          <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">⭐ Your Preferred Ingredients</h3>
          <div className="flex flex-wrap justify-center gap-4">
            {result.recommendation.preferred_ingredients.split(',').map((ingredient, index) => (
              <div key={index} className="bg-gradient-to-r from-pink-100 to-orange-100 px-6 py-3 rounded-full border border-pink-200 shadow-sm hover:shadow-md transition-shadow duration-300">
                <span className="text-gray-700 font-medium capitalize">{ingredient.trim()}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Health Notes (using disease for now, you can expand this if your backend returns specific notes) */}
      {result?.recommendation?.Disease && (
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 border border-pink-100 shadow-xl">
          <h3 className="text-2xl font-bold text-gray-800 mb-4 text-center">🏥 Health Considerations</h3>
          <div className="bg-gradient-to-r from-pink-50 to-orange-50 p-6 rounded-2xl border border-pink-100">
            <p className="text-gray-700 text-lg text-center">
              Considering your health focus on: <strong>{result.recommendation.Disease}</strong>.
            </p>
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600">
                💡 Always consult with healthcare professionals for personalized medical advice
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="text-center">
        <button
          onClick={() => {setCurrentStep(0); setResult(null);}}
          className="px-8 py-4 bg-gradient-to-r from-pink-500 to-orange-400 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
        >
          Create New Recommendations
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
              Smart Rule Filtering
            </h1>
            <p className="text-gray-600 text-xl">
              Get personalized recommendations based on your complete health profile
            </p>
          </div>

          {/* Progress Bar */}
          {currentStep < 5 && (
            <div className="mb-12">
              <div className="flex justify-between items-center mb-4">
                {steps.slice(0, 5).map((step, index) => (
                  <div key={index} className="flex items-center">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold transition-all duration-300 ${
                      index <= currentStep 
                        ? 'bg-gradient-to-r from-pink-500 to-orange-400 text-white shadow-lg' 
                        : 'bg-gray-200 text-gray-400'
                    }`}>
                      {index < currentStep ? '✓' : step.icon}
                    </div>
                    {index < 4 && (
                      <div className={`w-12 h-1 mx-2 rounded-full transition-all duration-300 ${
                        index < currentStep ? 'bg-gradient-to-r from-pink-500 to-orange-400' : 'bg-gray-200'
                      }`}></div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step Content */}
          {currentStep < 5 && (
            <div className="bg-white/60 backdrop-blur-lg rounded-3xl shadow-2xl p-8 mb-8 border border-white/20">
              <div className="text-center mb-8">
                <div className="text-6xl mb-4">{steps[currentStep].icon}</div>
                <h2 className="text-3xl font-bold text-gray-800 mb-2">{steps[currentStep].title}</h2>
                <p className="text-gray-600 text-lg">{steps[currentStep].subtitle}</p>
              </div>

              {currentStep < 4 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {steps[currentStep].fields.map(renderField)}
                </div>
              ) : (
                <div className="space-y-6">
                  {steps[currentStep].fields.map(renderField)}
                  {renderPreviewCard()}
                </div>
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

                {currentStep === 4 ? (
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
                        Filtering Recommendations...
                      </div>
                    ) : (
                      '🚀 Get My Recommendations'
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
          {currentStep === 5 && result && renderResults()}
        </div>
      </div>
    </div>
  );
}