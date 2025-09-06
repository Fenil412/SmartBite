// src/pages/UserProfilePage.jsx
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  Mail,
  Target,
  Forklift,
  Egg,
  Flame,
  Save,
  Edit,
  X,
  RefreshCw,
  ArrowRight,
} from "lucide-react";
import { useUserPreferences } from "../contexts/UserPreferencesContext";

// ✅ Move custom hook OUTSIDE component
function useUserAuthData(userPreferences, updatePreferences) {
  const getInitialUserData = useCallback(() => {
    return {
      name: "John Doe",
      email: "john.doe@example.com",
      healthGoals: userPreferences.healthGoals || "Weight Loss",
      dietaryPreferences:
        userPreferences.dietaryPreferences?.length > 0
          ? userPreferences.dietaryPreferences
          : ["Vegetarian"],
      allergies:
        userPreferences.allergies?.length > 0
          ? userPreferences.allergies
          : ["Peanuts"],
      targetCalories: userPreferences.targetCalories || 2000,
    };
  }, [userPreferences]);

  const [currentUser, setCurrentUser] = useState(getInitialUserData);
  const [loading, setLoading] = useState(false);

  // Sync with preferences
  useEffect(() => {
    setCurrentUser(getInitialUserData());
  }, [getInitialUserData]);

  const updateUserProfile = async (profileData) => {
    setLoading(true);
    return new Promise((resolve) => {
      setTimeout(() => {
        setCurrentUser(profileData);
        updatePreferences({
          healthGoals: profileData.healthGoals,
          dietaryPreferences: profileData.dietaryPreferences,
          allergies: profileData.allergies,
          targetCalories: profileData.targetCalories,
        });
        setLoading(false);
        resolve({ success: true, message: "Profile updated successfully!" });
      }, 1000);
    });
  };

  return { currentUser, updateUserProfile, loading };
}

export default function UserProfile() {
  const { userPreferences, updatePreferences } = useUserPreferences();
  const { currentUser, updateUserProfile, loading } = useUserAuthData(
    userPreferences,
    updatePreferences
  );

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    healthGoals: "",
    dietaryPreferences: [],
    allergies: [],
    targetCalories: "",
  });
  const [isEditing, setIsEditing] = useState(false);
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
    "Manage Chronic Conditions",
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
    "Kosher",
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
    "Sesame",
  ];

  // ✅ Initialize form data from currentUser
  useEffect(() => {
    if (currentUser) {
      setFormData({
        name: currentUser.name || "",
        email: currentUser.email || "",
        healthGoals: currentUser.healthGoals || "",
        dietaryPreferences: currentUser.dietaryPreferences || [],
        allergies: currentUser.allergies || [],
        targetCalories: currentUser.targetCalories || "",
      });
    }
  }, [currentUser]);

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
      const current = Array.isArray(prev[type]) ? prev[type] : [];
      return checked
        ? { ...prev, [type]: [...current, value] }
        : { ...prev, [type]: current.filter((item) => item !== value) };
    });
    setError("");
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (
      formData.targetCalories &&
      (isNaN(formData.targetCalories) || parseInt(formData.targetCalories) <= 0)
    ) {
      setError("Target Calories must be a positive number.");
      return;
    }

    const result = await updateUserProfile(formData);
    if (result.success) {
      setSuccess(result.message);
      setIsEditing(false);
    } else {
      setError(result.message || "Failed to update profile. Please try again.");
    }
  };

  const renderFieldValue = (label, value, icon) => (
    <div className="flex items-center gap-3 p-3 bg-white/70 rounded-xl shadow-sm border border-pink-100">
      {icon &&
        React.createElement(icon, { className: "w-5 h-5 text-pink-500" })}
      <div>
        <span className="font-semibold text-gray-700 text-sm">{label}:</span>{" "}
        <span className="text-gray-800 font-medium">{value || "N/A"}</span>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen items-start justify-center bg-gradient-to-br from-orange-50 via-pink-50 to-blue-50 p-4 pt-24">
      <div className="w-full max-w-2xl space-y-8 rounded-3xl bg-white/90 p-8 shadow-xl backdrop-blur-md animate-fade-in border border-pink-200">
        <div className="text-center">
          <h2 className="text-4xl font-black leading-tight bg-gradient-to-r from-pink-500 to-orange-500 bg-clip-text text-transparent">
            Your Profile
          </h2>
          <p className="mt-2 text-md text-gray-600">
            Manage your personal information and health preferences for Smart
            Bite
          </p>
        </div>

        {error && (
          <p className="text-center text-sm font-medium text-red-500 bg-red-50 p-2 rounded-lg">
            {error}
          </p>
        )}
        {success && (
          <p className="text-center text-sm font-medium text-green-500 bg-green-50 p-2 rounded-lg">
            {success}
          </p>
        )}

        {!isEditing ? (
          <div className="space-y-4">
            {renderFieldValue("Name", formData.name, User)}
            {renderFieldValue("Email", formData.email, Mail)}
            {renderFieldValue("Health Goal", formData.healthGoals, Target)}
            {renderFieldValue(
              "Dietary Preferences",
              formData.dietaryPreferences?.length
                ? formData.dietaryPreferences.join(", ")
                : "None",
              Forklift
            )}
            {renderFieldValue(
              "Allergies",
              formData.allergies?.length
                ? formData.allergies.join(", ")
                : "None",
              Egg
            )}
            {renderFieldValue(
              "Target Daily Calories",
              formData.targetCalories
                ? `${formData.targetCalories} kcal`
                : "Not set",
              Flame
            )}

            <button
              onClick={() => setIsEditing(true)}
              className="group w-full rounded-2xl bg-gradient-to-r from-pink-500 to-orange-500 px-5 py-3 text-lg font-bold text-white shadow-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl flex items-center justify-center mt-6">
              <Edit className="w-5 h-5 mr-2 group-hover:rotate-6 transition-transform" />
              Edit Profile
            </button>
          </div>
        ) : (
          <form onSubmit={handleUpdateProfile} className="space-y-6">
            {/* --- form fields (unchanged) --- */}
            {/* Keep your inputs and checkboxes as you had them */}
            {/* ... */}
          </form>
        )}
      </div>
    </div>
  );
}
