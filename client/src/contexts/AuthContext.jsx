import React, { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
//import axios from "axios";
import { useToast } from "../components/ui/use-toast";
import { api } from "./api";
// // Base URL will come from environment variable in local or Vercel
// axios.defaults.baseURL =
//   import.meta.env.VITE_API_URL || "https://smartbite-server-ay4k.onrender.com";
// axios.defaults.withCredentials = true; // Important for cookies
// axios.defaults.timeout = 10000;

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const [requiresOtp, setRequiresOtp] = useState(false);
  const [emailForOtp, setEmailForOtp] = useState("");

  const navigate = useNavigate();

  // Check authentication status on app load
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await api.get("/api/v1/users/current-user");
      if (response.data.success) {
        setUser(response.data.data);
      }
    } catch (error) {
      console.log("Not authenticated: " + error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const register = async (formData) => {
    try {
      setLoading(true);

      // Create FormData for file uploads
      const uploadData = new FormData();
      uploadData.append("fullName", formData.fullName);
      uploadData.append("email", formData.email);
      uploadData.append("username", formData.username);
      uploadData.append("password", formData.password);
      uploadData.append("bio", formData.bio || "");
      uploadData.append("role", formData.role || "user");
      // Add health details if present
      if (formData.dateOfBirth) {
        uploadData.append("healthProfile.dateOfBirth", formData.dateOfBirth);
      }
      if (formData.gender) {
        uploadData.append("healthProfile.gender", formData.gender);
      }
      if (formData.height) {
        uploadData.append("healthProfile.height", formData.height);
      }
      if (formData.weight) {
        uploadData.append("healthProfile.weight", formData.weight);
      }
      if (formData.bloodGroup) {
        uploadData.append("healthProfile.bloodGroup", formData.bloodGroup);
      }

      if (formData.avatar) {
        uploadData.append("avatar", formData.avatar);
      }
      if (formData.coverImage) {
        uploadData.append("coverImage", formData.coverImage);
      }

      const response = await api.post("/api/v1/users/register", uploadData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      return {
        success: true,
        message: response.data.message || "Registration successful",
        data: response.data.data,
      };
    } catch (error) {
      console.error("Registration failed:", error);
      return {
        success: false,
        message:
          error.response?.data?.message ||
          "Registration failed. Please try again.",
      };
    } finally {
      setLoading(false);
    }
  };

  const login = async ({ email, username, password }) => {
    try {
      setLoading(true);

      const loginData = { password };
      if (email) loginData.email = email;
      if (username) loginData.username = username;

      const response = await api.post("/api/v1/users/login", loginData);

      if (response.data.data?.requiresOtp) {
        setRequiresOtp(true);
        setEmailForOtp(response.data.data.email); // Use the email from the response
        return {
          success: true,
          requiresOtp: true,
          message: response.data.data.message || "OTP sent to your email",
        };
      } else if (response.data.success) {
        // If OTP is not required, directly log in the user
        setUser(response.data.data.user);
        return {
          success: true,
          requiresOtp: false,
          message: response.data.message || "Login successful",
        };
      }

      return {
        success: false,
        message: "Unexpected login response",
      };
    } catch (error) {
      console.error("Login failed:", error);
      return {
        success: false,
        message:
          error.response?.data?.message || "Login failed. Please try again.",
      };
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async (otp) => {
    try {
      setLoading(true);

      const response = await api.post("/api/v1/users/verify-otp", {
        email: emailForOtp,
        otp,
      });

      if (response.data.success) {
        setUser(response.data.data.user);
        setRequiresOtp(false);
        setEmailForOtp("");

        return {
          success: true,
          message: response.data.message || "Login successful",
        };
      }

      return {
        success: false,
        message: "OTP verification failed",
      };
    } catch (error) {
      console.error("OTP verification failed:", error);
      return {
        success: false,
        message:
          error.response?.data?.message || "Invalid OTP. Please try again.",
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await api.post("/api/v1/users/logout");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setUser(null);
      setRequiresOtp(false);
      setEmailForOtp("");
      navigate("/signin");
    }
  };

  const refreshToken = async () => {
    try {
      const response = await api.post("/api/v1/users/refresh-token");
      return response.data.success;
    } catch (error) {
      console.error("Token refresh failed:", error);
      logout();
      return false;
    }
  };

  const changePassword = async ({ oldPassword, newPassword }) => {
    try {
      const response = await api.post("/api/v1/users/change-password", {
        oldPassword,
        newPassword,
      });

      return {
        success: true,
        message: response.data.message || "Password changed successfully",
      };
    } catch (error) {
      console.error("Password change failed:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Failed to change password",
      };
    }
  };

  const updateAccountDetails = async ({
    fullName,
    email,
    bio,
    website,
    location,
    socialLinks,
  }) => {
    try {
      const response = await api.patch("/api/v1/users/update-account", {
        fullName,
        email,
        bio,
        website,
        location,
        socialLinks,
      });

      if (response.data.success) {
        setUser(response.data.data);
        return {
          success: true,
          message: response.data.message || "Account updated successfully",
        };
      }

      return {
        success: false,
        message: "Failed to update account",
      };
    } catch (error) {
      console.error("Account update failed:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Failed to update account",
      };
    }
  };

  const updateUserHealthProfile = async ({
    dateOfBirth,
    gender,
    height,
    weight,
    bloodGroup,
  }) => {
    try {
      const response = await api.patch("/api/v1/users/health-profile", {
        dateOfBirth,
        gender,
        height,
        weight,
        bloodGroup,
      });

      if (response.data.success) {
        setUser(response.data.data); // Update user state with new health profile
        return {
          success: true,
          message:
            response.data.message || "Health profile updated successfully",
        };
      }

      return {
        success: false,
        message: "Failed to update health profile",
      };
    } catch (error) {
      console.error("Health profile update failed:", error);
      return {
        success: false,
        message:
          error.response?.data?.message || "Failed to update health profile",
      };
    }
  };

  const updateAvatar = async (avatarFile) => {
    try {
      const formData = new FormData();
      formData.append("avatar", avatarFile);

      const response = await api.patch("/api/v1/users/avatar", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.success) {
        setUser(response.data.data);
        return {
          success: true,
          message: response.data.message || "Avatar updated successfully",
        };
      }

      return {
        success: false,
        message: "Failed to update avatar",
      };
    } catch (error) {
      console.error("Avatar update failed:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Failed to update avatar",
      };
    }
  };

  const updateCoverImage = async (coverImageFile) => {
    try {
      const formData = new FormData();
      formData.append("coverImage", coverImageFile);

      const response = await api.patch("/api/v1/users/cover-image", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.success) {
        setUser(response.data.data);
        return {
          success: true,
          message: response.data.message || "Cover image updated successfully",
        };
      }

      return {
        success: false,
        message: "Failed to update cover image",
      };
    } catch (error) {
      console.error("Cover image update failed:", error);
      return {
        success: false,
        message:
          error.response?.data?.message || "Failed to update cover image",
      };
    }
  };

  const getReadHistory = async () => {
    try {
      const response = await api.get("/api/v1/users/read-history");

      if (response.data.success) {
        return {
          success: true,
          data: response.data.data,
        };
      }

      return {
        success: false,
        message: "Failed to fetch read history",
      };
    } catch (error) {
      console.error("Failed to fetch read history:", error);
      return {
        success: false,
        message:
          error.response?.data?.message || "Failed to fetch read history",
      };
    }
  };

  const deleteAccount = async (userId) => {
    if (
      !confirm(
        "Are you sure you want to delete this account? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      const response = await api.delete(`/api/v1/users/delete/${userId}`);

      if (response.data.success) {
        toast({
          variant: "success",
          title: "Success",
          description:
            "Account and all associated images deleted successfully.",
        });

        logout();
        navigate("/signin");
      }
    } catch (error) {
      console.error("Delete account failed:", error);

      if (error.response?.status === 401) {
        toast({
          variant: "destructive",
          title: "Authentication Error",
          description: "Your session has expired. Please log in again.",
        });
        navigate("/signin");
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description:
            error.response?.data?.message ||
            "Failed to delete account. Please try again.",
        });
      }
    }
  };

  const value = {
    user,
    loading,
    requiresOtp,
    emailForOtp,
    isAuthenticated: !!user,
    register,
    login,
    verifyOtp,
    logout,
    isAdmin: user?.role === "admin",
    refreshToken,
    changePassword,
    updateAccountDetails,
    updateUserHealthProfile, // Add the new function to the context value
    updateAvatar,
    deleteAccount,
    updateCoverImage,
    getReadHistory,
    checkAuthStatus,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
