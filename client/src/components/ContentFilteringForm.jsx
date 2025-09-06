import { useState } from "react";
import { postData } from "../api"; // Assuming you have an api.js file with a postData function

export default function ContentFilteringForm() {
  const [form, setForm] = useState({
    dietary_preference: "",
    activity_level: "",
    age: "",
    height: "",
    weight: "",
    target_protein: "",
    target_sugar: "",
    target_sodium: "",
    target_calories: "",
    target_carbs: "",
    target_fiber: "",
    target_fat: "",
    preferred_ingredients: "",
    disease: "",
    gender: "", // Added gender to the initial state
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const genderOptions = ["Male", "Female"];
  
  const activityLevelOptions = [
    "Moderately Active",
    "Lightly Active", 
    "Sedentary",
    "Very Active",
    "Extremely Active"
  ];

  const dietaryPreferenceOptions = [
    "Omnivore",
    "Vegetarian",
    "Vegan",
    "Pescatarian"
  ];

  const diseaseOptions = [
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
  ];

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await postData("/content_filtering/recommend", form);
      setResult(res);
    } catch (err) {
      alert("Something went wrong. Please try again: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  const renderField = (key, value) => {
    const label = key.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase());
    
    if (key === 'gender') {
      return (
        <div key={key} className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">{label}</label>
          <select
            name={key}
            value={value}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-white border-2 border-gray-100 rounded-xl focus:border-pink-400 focus:outline-none transition-colors duration-200"
          >
            <option value="">Select {label}</option>
            {genderOptions.map((option, index) => (
              <option key={index} value={option}>{option}</option>
            ))}
          </select>
        </div>
      );
    }
    
    if (key === 'activity_level') {
      return (
        <div key={key} className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">{label}</label>
          <select
            name={key}
            value={value}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-white border-2 border-gray-100 rounded-xl focus:border-pink-400 focus:outline-none transition-colors duration-200"
          >
            <option value="">Select {label}</option>
            {activityLevelOptions.map((option, index) => (
              <option key={index} value={option}>{option}</option>
            ))}
          </select>
        </div>
      );
    }
    
    if (key === 'dietary_preference') {
      return (
        <div key={key} className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">{label}</label>
          <select
            name={key}
            value={value}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-white border-2 border-gray-100 rounded-xl focus:border-pink-400 focus:outline-none transition-colors duration-200"
          >
            <option value="">Select {label}</option>
            {dietaryPreferenceOptions.map((option, index) => (
              <option key={index} value={option}>{option}</option>
            ))}
          </select>
        </div>
      );
    }
    
    if (key === 'disease') {
      return (
        <div key={key} className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">{label}</label>
          <select
            name={key}
            value={value}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-white border-2 border-gray-100 rounded-xl focus:border-pink-400 focus:outline-none transition-colors duration-200"
          >
            <option value="">Select {label}</option>
            {diseaseOptions.map((option, index) => (
              <option key={index} value={option}>{option}</option>
            ))}
          </select>
        </div>
      );
    }
    
    return (
      <div key={key} className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">{label}</label>
        <input
          type={key === 'preferred_ingredients' ? 'text' : 'number'}
          name={key}
          value={value}
          onChange={handleChange}
          placeholder={key === 'preferred_ingredients' ? 'e.g., tofu, beans, spinach' : `Enter ${label.toLowerCase()}`}
          className="w-full px-4 py-3 bg-white border-2 border-gray-100 rounded-xl focus:border-pink-400 focus:outline-none transition-colors duration-200 placeholder-gray-400"
        />
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-orange-50 to-red-50 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-500 to-orange-500 bg-clip-text text-transparent">
              Health Profile
            </h1>
          </div>
          <p className="text-gray-600 text-lg">
            Get personalized nutrition recommendations
          </p>
        </div>

        {/* Form */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-8 border border-white/20">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Object.entries(form).map(([key, value]) => renderField(key, value))}
            </div>
            
            <div className="pt-4">
              <button
                type="submit"
                className="w-full px-6 py-4 bg-gradient-to-r from-pink-500 to-orange-500 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Getting Recommendation...
                  </>
                ) : (
                  <>
                    <span>🍎</span>
                    Get Recommendation
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Results */}
        {result && (
          <div className="mt-8 bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-8 border border-white/20">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-500 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-800">Your Personalized Recommendation</h2>
            </div>
            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Daily Targets:</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-2 mb-6">
                <li><strong>Daily Calories:</strong> {result.recommendation.Calories} kcal (Target: {result.recommendation["Daily Calorie Target"]} kcal)</li>
                <li><strong>Protein:</strong> {result.recommendation.Protein}g</li>
                <li><strong>Carbohydrates:</strong> {result.recommendation.Carbohydrates}g</li>
                <li><strong>Fats:</strong> {result.recommendation.Fat}g</li>
                <li><strong>Fiber:</strong> {result.recommendation.Fiber}g</li>
                <li><strong>Sugar:</strong> {result.recommendation.Sugar}g</li>
                <li><strong>Sodium:</strong> {result.recommendation.Sodium}mg</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-4">Meal Suggestions:</h3>
              <div className="space-y-4">
                {result.recommendation["Breakfast Suggestion"] && (
                  <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                    <h4 className="font-medium text-gray-900">Breakfast: {result.recommendation["Breakfast Suggestion"]}</h4>
                    <p className="text-sm text-gray-600">Calories: {result.recommendation["Breakfast Calories"]}kcal, Protein: {result.recommendation["Breakfast Protein"]}g, Carbs: {result.recommendation["Breakfast Carbohydrates"]}g, Fats: {result.recommendation["Breakfast Fats"]}g</p>
                  </div>
                )}
                {result.recommendation["Lunch Suggestion"] && (
                  <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                    <h4 className="font-medium text-gray-900">Lunch: {result.recommendation["Lunch Suggestion"]}</h4>
                    <p className="text-sm text-gray-600">Calories: {result.recommendation["Lunch Calories"]}kcal, Protein: {result.recommendation["Lunch Protein"]}g, Carbs: {result.recommendation["Lunch Carbohydrates"]}g, Fats: {result.recommendation["Lunch Fats"]}g</p>
                  </div>
                )}
                {result.recommendation["Dinner Suggestion"] && (
                  <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                    <h4 className="font-medium text-gray-900">Dinner: {result.recommendation["Dinner Suggestion"]}</h4>
                    <p className="text-sm text-gray-600">Calories: {result.recommendation["Dinner Calories"]}kcal, Protein: {result.recommendation["Dinner Protein.1"]}g, Carbs: {result.recommendation["Dinner Carbohydrates.1"]}g, Fats: {result.recommendation["Dinner Fats"]}g</p>
                  </div>
                )}
                {result.recommendation["Snack Suggestion"] && (
                  <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                    <h4 className="font-medium text-gray-900">Snacks: {result.recommendation["Snack Suggestion"]}</h4>
                    <p className="text-sm text-gray-600">Calories: {result.recommendation["Snacks Calories"]}kcal, Protein: {result.recommendation["Snacks Protein"]}g, Carbs: {result.recommendation["Snacks Carbohydrates"]}g, Fats: {result.recommendation["Snacks Fats"]}g</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}