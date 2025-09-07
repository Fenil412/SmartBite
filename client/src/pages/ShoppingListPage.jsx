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
  ClipboardList,
  Plus,
  Trash2,
  CheckCircle,
  Pencil,
  Save,
  X,
  UserPlus,
  ListFilter,
  RefreshCw,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useUserPreferences } from "../contexts/UserPreferencesContext"; // Assuming you might use preferences for ingredient suggestions
import Navbar from "../components/Navbar"; // Import the new Navbar component

export default function ShoppingListPage() {
  const navigate = useNavigate();
  const { userPreferences } = useUserPreferences(); // Access user preferences if needed

  const [shoppingList, setShoppingList] = useState([]);
  const [newItem, setNewItem] = useState("");
  const [editingItem, setEditingItem] = useState(null); // Stores the item being edited
  const [editedItemText, setEditedItemText] = useState("");
  const [filter, setFilter] = useState("all"); // 'all', 'active', 'completed'
  const [sortOrder, setSortOrder] = useState("default"); // 'default', 'alpha', 'added'

  // Load shopping list from local storage on initial render
  useEffect(() => {
    const storedList = localStorage.getItem("smartBiteShoppingList");
    if (storedList) {
      setShoppingList(JSON.parse(storedList));
    }
  }, []);

  // Save shopping list to local storage whenever it changes
  useEffect(() => {
    localStorage.setItem("smartBiteShoppingList", JSON.stringify(shoppingList));
  }, [shoppingList]);

  // Example of generating initial items based on user preferences (if applicable)
  useEffect(() => {
    if (
      shoppingList.length === 0 &&
      userPreferences.dietaryPreferences?.length > 0
    ) {
      // Small example of pre-populating based on preferences
      const suggestedItems = [];
      if (userPreferences.dietaryPreferences.includes("Vegetarian")) {
        suggestedItems.push(
          { id: Date.now() + 1, text: "Tofu", completed: false },
          { id: Date.now() + 2, text: "Lentils", completed: false }
        );
      }
      if (userPreferences.dietaryPreferences.includes("Keto")) {
        suggestedItems.push(
          { id: Date.now() + 3, text: "Avocado", completed: false },
          { id: Date.now() + 4, text: "Salmon", completed: false }
        );
      }
      if (userPreferences.allergies.includes("Gluten")) {
        suggestedItems.push({
          id: Date.now() + 5,
          text: "Gluten-free pasta",
          completed: false,
        });
      }
      setShoppingList((prev) => [
        ...prev,
        ...suggestedItems.filter((s) => !prev.some((p) => p.text === s.text)),
      ]);
    }
  }, [userPreferences, shoppingList.length]);


  const handleAddItem = (e) => {
    e.preventDefault();
    if (newItem.trim()) {
      setShoppingList((prev) => [
        ...prev,
        { id: Date.now(), text: newItem.trim(), completed: false },
      ]);
      setNewItem("");
    }
  };

  const handleToggleComplete = (id) => {
    setShoppingList((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    );
  };

  const handleDeleteItem = (id) => {
    setShoppingList((prev) => prev.filter((item) => item.id !== id));
  };

  const handleEditItem = (item) => {
    setEditingItem(item.id);
    setEditedItemText(item.text);
  };

  const handleSaveEdit = (id) => {
    setShoppingList((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, text: editedItemText.trim() } : item
      )
    );
    setEditingItem(null);
    setEditedItemText("");
  };

  const handleCancelEdit = () => {
    setEditingItem(null);
    setEditedItemText("");
  };

  const handleClearCompleted = () => {
    setShoppingList((prev) => prev.filter((item) => !item.completed));
  };

  const handleClearAll = () => {
    setShoppingList([]);
  };

  const filteredList = shoppingList.filter((item) => {
    if (filter === "active") return !item.completed;
    if (filter === "completed") return item.completed;
    return true;
  });

  const sortedList = [...filteredList].sort((a, b) => {
    if (sortOrder === "alpha") {
      return a.text.localeCompare(b.text);
    }
    // Default or 'added' order is implicit (by id/Date.now())
    return 0;
  });


  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-pink-50 to-blue-50">
      <Navbar /> {/* Integrated Navbar */}

      {/* Main Content Area */}
      <div className="flex-1 pt-16 lg:pt-24"> {/* Added padding top to account for fixed Navbar */}
          {/* Shopping List Page Content */}
          <div className="flex min-h-screen items-start justify-center p-4">
            <div className="w-full max-w-2xl space-y-8 rounded-3xl bg-white/90 p-6 sm:p-8 shadow-xl backdrop-blur-md animate-fade-in border border-pink-200">
              <div className="text-center">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-pink-400 to-orange-400 rounded-2xl flex items-center justify-center shadow-lg">
                    <ShoppingCart className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                  </div>
                  <h2 className="text-3xl sm:text-5xl font-black bg-gradient-to-r from-pink-500 to-orange-500 bg-clip-text text-transparent leading-tight">
                    Shopping List
                  </h2>
                </div>
                <p className="mt-2 text-lg sm:text-xl text-gray-700 font-medium">
                  Organize your groceries, never forget an item!
                </p>
              </div>

            {/* Add New Item Form */}
            <form onSubmit={handleAddItem} className="flex gap-3">
              <input
                type="text"
                placeholder="Add new item (e.g., 2 apples, 1L milk)"
                value={newItem}
                onChange={(e) => setNewItem(e.target.value)}
                className="flex-1 rounded-xl border border-pink-200/60 bg-white/80 px-4 py-2.5 text-gray-900 shadow-sm focus:border-pink-400 focus:ring-2 focus:ring-pink-200/40"
              />
              <button
                type="submit"
                className="group px-5 py-2.5 bg-gradient-to-r from-pink-500 to-orange-500 text-white rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all duration-200 flex items-center justify-center">
                <Plus className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform" />
                Add
              </button>
            </form>

            {/* Filters and Sort */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 p-4 bg-pink-50/50 rounded-xl border border-pink-100">
              <div className="flex items-center gap-3">
                <ListFilter className="w-5 h-5 text-pink-500" />
                <span className="text-gray-700 font-medium">Filter:</span>
                <div className="flex gap-2">
                  {["all", "active", "completed"].map((f) => (
                    <button
                      key={f}
                      onClick={() => setFilter(f)}
                      className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                        filter === f
                          ? "bg-gradient-to-r from-pink-400 to-orange-400 text-white shadow-md"
                          : "bg-white text-gray-700 hover:bg-pink-100"
                      }`}>
                      {f.charAt(0).toUpperCase() + f.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <RefreshCw className="w-5 h-5 text-orange-500" />
                <span className="text-gray-700 font-medium">Sort by:</span>
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  className="px-3 py-2 rounded-lg border border-pink-200 bg-white text-gray-700 text-sm font-medium focus:ring-pink-400 focus:border-pink-400">
                  <option value="default">Default</option>
                  <option value="alpha">Alphabetical</option>
                </select>
              </div>
            </div>

            {/* Shopping List */}
            {sortedList.length === 0 ? (
              <p className="text-center text-gray-500 text-lg py-8 bg-white/70 rounded-xl border border-pink-100">
                Your shopping list is empty! Add some items.
              </p>
            ) : (
              <ul className="space-y-3">
                {sortedList.map((item) => (
                  <li
                    key={item.id}
                    className="flex items-center p-4 bg-white/80 rounded-xl shadow-sm border border-pink-100 transition-all duration-200 hover:shadow-md">
                    {editingItem === item.id ? (
                      <div className="flex flex-1 items-center gap-3">
                        <input
                          type="text"
                          value={editedItemText}
                          onChange={(e) => setEditedItemText(e.target.value)}
                          className="flex-1 rounded-lg border border-blue-300 bg-blue-50/50 px-3 py-2 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200/40"
                        />
                        <button
                          onClick={() => handleSaveEdit(item.id)}
                          className="p-2 text-green-600 hover:text-green-800 transition-colors"
                          title="Save">
                          <Save className="w-5 h-5" />
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
                          title="Cancel">
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <input
                          type="checkbox"
                          checked={item.completed}
                          onChange={() => handleToggleComplete(item.id)}
                          className="h-5 w-5 text-pink-600 focus:ring-pink-500 border-gray-300 rounded mr-3 flex-shrink-0"
                        />
                        <span
                          className={`flex-1 text-lg font-medium ${
                            item.completed
                              ? "line-through text-gray-500"
                              : "text-gray-800"
                          }`}>
                          {item.text}
                        </span>
                        <div className="flex items-center gap-2 ml-4 flex-shrink-0">
                          <button
                            onClick={() => handleEditItem(item)}
                            className="p-2 text-blue-500 hover:text-blue-700 transition-colors"
                            title="Edit Item">
                            <Pencil className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDeleteItem(item.id)}
                            className="p-2 text-red-500 hover:text-red-700 transition-colors"
                            title="Delete Item">
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </>
                    )}
                  </li>
                ))}
              </ul>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end gap-4 pt-4 border-t border-pink-100">
              <button
                onClick={handleClearCompleted}
                disabled={!shoppingList.some((item) => item.completed)}
                className="px-6 py-3 bg-white text-gray-700 border-2 border-pink-200 rounded-xl font-bold text-base hover:border-pink-300 hover:bg-pink-50 hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed">
                Clear Completed
              </button>
              <button
                onClick={handleClearAll}
                disabled={shoppingList.length === 0}
                className="px-6 py-3 bg-red-500 text-white rounded-xl font-bold text-base hover:bg-red-600 hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed">
                Clear All
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}