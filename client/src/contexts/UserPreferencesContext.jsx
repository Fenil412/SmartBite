// src/contexts/UserPreferencesContext.jsx
import React, { createContext, useContext, useState, useEffect } from "react";

const UserPreferencesContext = createContext();

export const useUserPreferences = () => {
  return useContext(UserPreferencesContext);
};

export const UserPreferencesProvider = ({ children }) => {
  // Initialize preferences with a default or load from localStorage/API
  const [userPreferences, setUserPreferences] = useState(() => {
    // Attempt to load from localStorage on initial render
    const savedPreferences = localStorage.getItem("userPreferences");
    return savedPreferences
      ? JSON.parse(savedPreferences)
      : {
          dietaryType: "",
          allergies: [],
          healthGoals: [],
          targetCalories: "",
        };
  });

  // Save preferences to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("userPreferences", JSON.stringify(userPreferences));
  }, [userPreferences]);

  const updatePreferences = (newPreferences) => {
    setUserPreferences((prev) => ({
      ...prev,
      ...newPreferences,
    }));
  };

  const value = {
    userPreferences,
    updatePreferences,
  };

  return (
    <UserPreferencesContext.Provider value={value}>
      {children}
    </UserPreferencesContext.Provider>
  );
};