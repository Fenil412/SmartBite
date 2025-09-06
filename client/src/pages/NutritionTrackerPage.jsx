import React, { useState, useEffect } from "react";
import {
  ChefHat,
  ShoppingCart,
  Home,
  Brain,
  Heart,
  Target,
  Users,
  Settings,
  LogIn,
  UtensilsCrossed,
  Plus,
  Trash2,
  Edit,
  Flame,
  Dumbbell,
  Apple,
  Milk,
  Drumstick,
  Carrot,
  Gauge,
  Calendar,
  UserPlus,
  RefreshCw,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useUserPreferences } from "../contexts/UserPreferencesContext"; // To get target calories

export default function NutritionTrackerPage() {
  const navigate = useNavigate();
  const { userPreferences } = useUserPreferences();

  // State for daily logs
  const [dailyLogs, setDailyLogs] = useState({}); // { 'YYYY-MM-DD': [{ id, mealType, food, calories, protein, carbs, fats }] }
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  ); // YYYY-MM-DD format

  // State for new meal entry
  const [newMeal, setNewMeal] = useState({
    mealType: "Breakfast",
    food: "",
    calories: "",
    protein: "",
    carbs: "",
    fats: "",
  });
  const [editingMealId, setEditingMealId] = useState(null); // ID of the meal being edited

  // Load daily logs from local storage on initial render
  useEffect(() => {
    const storedLogs = localStorage.getItem("smartBiteNutritionLogs");
    if (storedLogs) {
      setDailyLogs(JSON.parse(storedLogs));
    }
  }, []);

  // Save daily logs to local storage whenever they change
  useEffect(() => {
    localStorage.setItem("smartBiteNutritionLogs", JSON.stringify(dailyLogs));
  }, [dailyLogs]);

  const sidebarItems = [
    { name: "Home", icon: Home },
    { name: "User Profile", icon: Users },
    { name: "Preferences", icon: Settings },
    { name: "AI Meal Plans", icon: ChefHat },
    { name: "Shopping List", icon: ShoppingCart },
    { name: "Meal History", icon: Brain },
    { name: "Nutrition Tracker", icon: Heart },
    { name: "AI Summary", icon: Target },
  ];

  // Keep "Nutrition Tracker" as active in sidebar
  const activeSidebarItem = "Nutrition Tracker";

  const currentDayLogs = dailyLogs[selectedDate] || [];

  const totalCalories = currentDayLogs.reduce(
    (sum, meal) => sum + parseInt(meal.calories || 0),
    0
  );
  const totalProtein = currentDayLogs.reduce(
    (sum, meal) => sum + parseInt(meal.protein || 0),
    0
  );
  const totalCarbs = currentDayLogs.reduce(
    (sum, meal) => sum + parseInt(meal.carbs || 0),
    0
  );
  const totalFats = currentDayLogs.reduce(
    (sum, meal) => sum + parseInt(meal.fats || 0),
    0
  );

  const targetCalories = userPreferences.targetCalories || 2000; // Default to 2000 if not set
  const calorieProgress = Math.min(
    (totalCalories / targetCalories) * 100,
    100
  );

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewMeal((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddMeal = (e) => {
    e.preventDefault();
    const { food, calories, protein, carbs, fats } = newMeal;

    if (!food || !calories) {
      alert("Please enter food item and calories.");
      return;
    }

    const mealEntry = {
      id: Date.now(),
      mealType: newMeal.mealType,
      food: food.trim(),
      calories: parseInt(calories),
      protein: parseInt(protein || 0),
      carbs: parseInt(carbs || 0),
      fats: parseInt(fats || 0),
    };

    setDailyLogs((prevLogs) => ({
      ...prevLogs,
      [selectedDate]: [...(prevLogs[selectedDate] || []), mealEntry],
    }));

    // Reset form
    setNewMeal({
      mealType: "Breakfast",
      food: "",
      calories: "",
      protein: "",
      carbs: "",
      fats: "",
    });
  };

  const handleEditMeal = (meal) => {
    setEditingMealId(meal.id);
    setNewMeal({
      mealType: meal.mealType,
      food: meal.food,
      calories: meal.calories,
      protein: meal.protein,
      carbs: meal.carbs,
      fats: meal.fats,
    });
  };

  const handleUpdateMeal = (e) => {
    e.preventDefault();
    setDailyLogs((prevLogs) => ({
      ...prevLogs,
      [selectedDate]: prevLogs[selectedDate].map((meal) =>
        meal.id === editingMealId
          ? {
              ...meal,
              mealType: newMeal.mealType,
              food: newMeal.food.trim(),
              calories: parseInt(newMeal.calories),
              protein: parseInt(newMeal.protein || 0),
              carbs: parseInt(newMeal.carbs || 0),
              fats: parseInt(newMeal.fats || 0),
            }
          : meal
      ),
    }));
    setEditingMealId(null);
    setNewMeal({
      mealType: "Breakfast",
      food: "",
      calories: "",
      protein: "",
      carbs: "",
      fats: "",
    });
  };

  const handleDeleteMeal = (id) => {
    setDailyLogs((prevLogs) => ({
      ...prevLogs,
      [selectedDate]: prevLogs[selectedDate].filter((meal) => meal.id !== id),
    }));
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
            <h3 className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-orange-500 bg-clip-text text-transparent">
              Smart Bite
            </h3>
            <p className="text-xs text-gray-500">AI Nutrition</p>
          </div>
        </div>

        <nav className="flex-1 space-y-4">
          {sidebarItems.map((item, index) => (
            <button
              key={index}
              className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-all duration-200 ${
                activeSidebarItem === item.name
                  ? "bg-gradient-to-r from-pink-100 to-orange-100 text-pink-700 font-bold shadow-md"
                  : "text-gray-600 hover:bg-pink-50 hover:text-pink-500 font-medium"
              }`}
              onClick={() => {
                // Navigate to the corresponding page
                if (item.name === "Home") navigate("/");
                else if (item.name === "User Profile") navigate("/profile");
                else if (item.name === "Preferences") navigate("/preferences");
                else if (item.name === "Shopping List")
                  navigate("/shopping-list");
                // Add more navigation logic for other items as needed
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
      <div className="flex-1 ml-64">
        {/* Light Header (adjusted for main content area) */}
        <header className="fixed top-0 right-0 w-[calc(100%-16rem)] z-50 bg-white/90 backdrop-blur-xl border-b border-pink-100/50 shadow-sm">
          <div className="container mx-auto px-4">
            <div className="flex h-16 items-center justify-end">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => navigate("/signin")}
                  className="px-4 py-2 text-gray-600 hover:text-pink-500 transition-colors font-medium rounded-xl hover:bg-pink-50"
                >
                  <LogIn className="w-4 h-4 mr-1 inline" />
                  Sign In
                </button>
                <button
                  onClick={() => navigate("/signup")}
                  className="px-6 py-2.5 bg-gradient-to-r from-pink-400 to-orange-400 text-white rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all duration-200"
                >
                  <UserPlus className="w-4 h-4 mr-1 inline" />
                  Start Free
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Nutrition Tracker Page Content */}
        <div className="flex min-h-screen items-start justify-center pt-24 p-4">
          <div className="w-full max-w-4xl space-y-8 rounded-3xl bg-white/90 p-8 shadow-xl backdrop-blur-md animate-fade-in border border-pink-200">
            <div className="text-center">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="w-14 h-14 bg-gradient-to-br from-pink-400 to-orange-400 rounded-2xl flex items-center justify-center shadow-lg">
                  <Heart className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-5xl font-black bg-gradient-to-r from-pink-500 to-orange-500 bg-clip-text text-transparent leading-tight">
                  Nutrition Tracker
                </h2>
              </div>
              <p className="mt-2 text-xl text-gray-700 font-medium">
                Log your meals, track macros, and hit your daily goals!
              </p>
            </div>

            {/* Date Selector */}
            <div className="flex items-center justify-center gap-4 p-4 bg-pink-50/50 rounded-xl border border-pink-100">
              <Calendar className="w-6 h-6 text-pink-500" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-4 py-2 rounded-lg border border-pink-200 bg-white text-gray-700 text-lg font-medium focus:ring-pink-400 focus:border-pink-400"
              />
            </div>

            {/* Daily Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-6 bg-gradient-to-r from-pink-100 to-orange-100 rounded-2xl border border-pink-200 shadow-lg">
              <div className="text-center">
                <Flame className="w-8 h-8 text-pink-600 mx-auto mb-2" />
                <div className="text-sm font-bold text-gray-700">Calories</div>
                <div className="text-3xl font-black text-pink-700">
                  {totalCalories}
                </div>
                <div className="text-xs text-gray-600">
                  Target: {targetCalories} kcal
                </div>
                <div className="w-full bg-pink-200 rounded-full h-2 mt-2">
                  <div
                    className="bg-gradient-to-r from-pink-400 to-orange-400 h-2 rounded-full"
                    style={{ width: `${calorieProgress}%` }}
                  ></div>
                </div>
              </div>
              <div className="text-center">
                <Dumbbell className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <div className="text-sm font-bold text-gray-700">Protein</div>
                <div className="text-3xl font-black text-blue-700">
                  {totalProtein}g
                </div>
                <div className="text-xs text-gray-600">
                  Goal: ~{Math.round(targetCalories * 0.3 / 4)}g
                </div> {/* Approx 30% from calories */}
              </div>
              <div className="text-center">
                <Carrot className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                <div className="text-sm font-bold text-gray-700">Carbs</div>
                <div className="text-3xl font-black text-orange-700">
                  {totalCarbs}g
                </div>
                <div className="text-xs text-gray-600">
                  Goal: ~{Math.round(targetCalories * 0.4 / 4)}g
                </div> {/* Approx 40% from calories */}
              </div>
              <div className="text-center">
                <Milk className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <div className="text-sm font-bold text-gray-700">Fats</div>
                <div className="text-3xl font-black text-green-700">
                  {totalFats}g
                </div>
                <div className="text-xs text-gray-600">
                  Goal: ~{Math.round(targetCalories * 0.3 / 9)}g
                </div> {/* Approx 30% from calories */}
              </div>
            </div>

            {/* Add/Edit Meal Form */}
            <form
              onSubmit={editingMealId ? handleUpdateMeal : handleAddMeal}
              className="space-y-4 p-6 bg-white/70 rounded-2xl border border-pink-100 shadow-md"
            >
              <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-3">
                <UtensilsCrossed className="w-6 h-6 text-purple-500" />
                {editingMealId ? "Edit Meal" : "Add New Meal"}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="mealType"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Meal Type *
                  </label>
                  <select
                    id="mealType"
                    name="mealType"
                    value={newMeal.mealType}
                    onChange={handleInputChange}
                    className="block w-full rounded-xl border border-pink-200/60 bg-white/80 px-4 py-2.5 text-gray-900 shadow-sm focus:border-pink-400 focus:ring-2 focus:ring-pink-200/40"
                  >
                    {["Breakfast", "Lunch", "Dinner", "Snack"].map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label
                    htmlFor="food"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Food Item *
                  </label>
                  <input
                    id="food"
                    name="food"
                    type="text"
                    placeholder="e.g., Chicken Salad"
                    value={newMeal.food}
                    onChange={handleInputChange}
                    required
                    className="block w-full rounded-xl border border-pink-200/60 bg-white/80 px-4 py-2.5 text-gray-900 shadow-sm focus:border-pink-400 focus:ring-2 focus:ring-pink-200/40"
                  />
                </div>
                <div>
                  <label
                    htmlFor="calories"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Calories (kcal) *
                  </label>
                  <input
                    id="calories"
                    name="calories"
                    type="number"
                    placeholder="e.g., 450"
                    value={newMeal.calories}
                    onChange={handleInputChange}
                    required
                    min="0"
                    className="block w-full rounded-xl border border-pink-200/60 bg-white/80 px-4 py-2.5 text-gray-900 shadow-sm focus:border-pink-400 focus:ring-2 focus:ring-pink-200/40"
                  />
                </div>
                <div>
                  <label
                    htmlFor="protein"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Protein (g)
                  </label>
                  <input
                    id="protein"
                    name="protein"
                    type="number"
                    placeholder="e.g., 30"
                    value={newMeal.protein}
                    onChange={handleInputChange}
                    min="0"
                    className="block w-full rounded-xl border border-pink-200/60 bg-white/80 px-4 py-2.5 text-gray-900 shadow-sm focus:border-pink-400 focus:ring-2 focus:ring-pink-200/40"
                  />
                </div>
                <div>
                  <label
                    htmlFor="carbs"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Carbs (g)
                  </label>
                  <input
                    id="carbs"
                    name="carbs"
                    type="number"
                    placeholder="e.g., 40"
                    value={newMeal.carbs}
                    onChange={handleInputChange}
                    min="0"
                    className="block w-full rounded-xl border border-pink-200/60 bg-white/80 px-4 py-2.5 text-gray-900 shadow-sm focus:border-pink-400 focus:ring-2 focus:ring-pink-200/40"
                  />
                </div>
                <div>
                  <label
                    htmlFor="fats"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Fats (g)
                  </label>
                  <input
                    id="fats"
                    name="fats"
                    type="number"
                    placeholder="e.g., 20"
                    value={newMeal.fats}
                    onChange={handleInputChange}
                    min="0"
                    className="block w-full rounded-xl border border-pink-200/60 bg-white/80 px-4 py-2.5 text-gray-900 shadow-sm focus:border-pink-400 focus:ring-2 focus:ring-pink-200/40"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="group w-full rounded-xl bg-gradient-to-r from-pink-500 to-orange-500 px-4 py-3 text-lg font-semibold text-white shadow-lg transition-all duration-300 hover:scale-[1.02] hover:from-pink-600 hover:to-orange-600 flex items-center justify-center"
              >
                {editingMealId ? (
                  <>
                    <Edit className="w-5 h-5 mr-2" /> Update Meal
                  </>
                ) : (
                  <>
                    <Plus className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform" />{" "}
                    Add Meal
                  </>
                )}
              </button>
            </form>

            {/* Meal Logs List */}
            {currentDayLogs.length === 0 ? (
              <p className="text-center text-gray-500 text-lg py-8 bg-white/70 rounded-xl border border-pink-100">
                No meals logged for this day. Start tracking!
              </p>
            ) : (
              <div className="space-y-4">
                <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                  <Gauge className="w-6 h-6 text-green-500" />
                  Meals Logged for {selectedDate}
                </h3>
                <ul className="space-y-3">
                  {currentDayLogs.map((meal) => (
                    <li
                      key={meal.id}
                      className="flex flex-col sm:flex-row items-start sm:items-center p-4 bg-white/80 rounded-xl shadow-sm border border-pink-100 transition-all duration-200 hover:shadow-md"
                    >
                      <div className="flex-1 space-y-1 sm:space-y-0">
                        <div className="font-bold text-lg text-gray-800">
                          {meal.food}
                          <span className="ml-2 px-2 py-0.5 text-xs font-semibold text-white bg-pink-500 rounded-full">
                            {meal.mealType}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600">
                          {meal.calories} kcal • P: {meal.protein}g • C:{" "}
                          {meal.carbs}g • F: {meal.fats}g
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-3 sm:mt-0 sm:ml-4 flex-shrink-0">
                        <button
                          onClick={() => handleEditMeal(meal)}
                          className="p-2 text-blue-500 hover:text-blue-700 transition-colors"
                          title="Edit Meal"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteMeal(meal.id)}
                          className="p-2 text-red-500 hover:text-red-700 transition-colors"
                          title="Delete Meal"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}