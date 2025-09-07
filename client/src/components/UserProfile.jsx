import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom"; // Added useNavigate
import { Calendar, MapPin, UserRoundCheck, HeartPulse } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import axios from "axios";

// Configure axios defaults if not already configured globally
axios.defaults.baseURL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
axios.defaults.withCredentials = true; // Important for cookies
axios.defaults.timeout = 10000;

const UserProfile = () => {
  const { userId } = useParams();
  const { user: currentUser } = useAuth(); // Removed isAuthenticated as it's not used after removing follow logic
  const navigate = useNavigate(); // Initialize useNavigate

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("about"); // Default to 'about'

  useEffect(() => {
    if (userId) {
      fetchUserProfile();
    }
  }, [userId]); // Removed currentUser from dependencies as follow status is no longer relevant here

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/v1/users/profile/${userId}`);
      setUser(response.data.data);
    } catch (error) {
      console.error("Error fetching user profile:", error);
      setUser(null); // Explicitly set user to null on error
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="animate-pulse">
          {/* Cover Image Placeholder */}
          <div className="h-32 sm:h-48 bg-gray-200 rounded-lg mb-6"></div>
          <div className="flex flex-col sm:flex-row items-start gap-6 mb-8">
            {/* Avatar Placeholder */}
            <div className="w-24 h-24 bg-gray-200 rounded-full border-4 border-white shadow-lg"></div>
            <div className="flex-1 space-y-4">
              {/* Name and Username Placeholder */}
              <div className="h-8 bg-gray-200 rounded w-2/3"></div>
              <div className="h-5 bg-gray-200 rounded w-1/3"></div>
              {/* Bio Placeholder */}
              <div className="h-5 bg-gray-200 rounded w-full"></div>
              <div className="h-5 bg-gray-200 rounded w-5/6"></div>
              {/* Meta Info Placeholder */}
              <div className="flex flex-wrap items-center gap-4">
                <div className="h-4 bg-gray-200 rounded w-24"></div>
                <div className="h-4 bg-gray-200 rounded w-32"></div>
                <div className="h-4 bg-gray-200 rounded w-28"></div>
              </div>
            </div>
          </div>
          {/* Tabs Placeholder */}
          <div className="flex border-b border-gray-200 bg-gray-50 rounded-t-lg mb-8">
            <div className="flex-1 py-3 px-4 text-center h-12 bg-gray-200 rounded-tl-lg"></div>
            <div className="flex-1 py-3 px-4 text-center h-12 bg-gray-100"></div>
          </div>
          {/* Content Placeholder */}
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 h-64"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          User not found
        </h1>
        <p className="text-gray-600">
          The profile you are looking for does not exist or has been deleted.
        </p>
      </div>
    );
  }

  // Determine if the current user is viewing their own profile
  const isOwner = currentUser && currentUser._id === user._id;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Cover Image */}
      <div className="h-32 sm:h-48 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg mb-6 overflow-hidden relative">
        <img
          src={user.coverImage || "/default-cover.png"} // Use a default cover image
          alt="Cover"
          className="w-full h-full object-cover"
        />
        {/* You might want an edit button here for the owner */}
        {isOwner && (
          <button className="absolute bottom-2 right-2 bg-white p-2 rounded-full shadow-md text-gray-700 hover:bg-gray-100">
            {/* <Edit className="w-4 h-4" /> */}
            Edit Cover
          </button>
        )}
      </div>

      {/* Profile Header */}
      <div className="flex flex-col sm:flex-row items-start gap-6 mb-8">
        {/* Avatar */}
        <div className="relative -mt-16 sm:-mt-24 ml-4 sm:ml-0">
          {" "}
          {/* Adjusted margin-top for avatar overlap */}
          <img
            src={user.avatar || "/default-avatar.png"} // Use a default avatar image
            alt={user.fullName || user.username}
            className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-white shadow-lg object-cover bg-gray-100"
          />
          {!user.avatar && (
            <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-white shadow-lg bg-gray-300 flex items-center justify-center text-4xl font-bold text-gray-600">
              {user.fullName
                ? user.fullName.charAt(0).toUpperCase()
                : user.username.charAt(0).toUpperCase()}
            </div>
          )}
          {isOwner && (
            <button className="absolute bottom-0 right-0 bg-white p-1 rounded-full shadow-md text-gray-700 hover:bg-gray-100">
              {/* <Edit className="w-4 h-4" /> */}
              Edit
            </button>
          )}
        </div>

        <div className="flex-1 mt-4 sm:mt-0">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {user.fullName || "User Name"}
              </h1>
              <p className="text-gray-600 text-lg">@{user.username}</p>
              {user.role === "admin" && (
                <span className="inline-flex items-center gap-1 px-3 py-1 mt-2 rounded-full bg-blue-100 text-blue-800 text-xs font-semibold">
                  <UserRoundCheck className="w-3 h-3" /> Admin
                </span>
              )}
            </div>
            {/* Action Buttons (e.g., Edit Profile) */}
            {isOwner && (
              <button
                onClick={() => navigate("/settings")} // Assuming a settings route for editing
                className="px-5 py-2 rounded-full text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors"
              >
                Edit Profile
              </button>
            )}
          </div>

          {user.bio && (
            <p className="text-gray-700 mb-4 text-base">{user.bio}</p>
          )}

          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-4">
            {user.location && (
              <div className="flex items-center gap-1 hover:text-gray-800 transition-colors">
                <MapPin className="w-4 h-4" />
                <span>{user.location}</span>
              </div>
            )}

            <div className="flex items-center gap-1 hover:text-gray-800 transition-colors">
              <Calendar className="w-4 h-4" />
              <span>Joined {formatDate(user.createdAt)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content Tabs */}
      <div className="mb-8">
        <div className="flex border-b border-gray-200 bg-gray-50 rounded-t-lg overflow-x-auto">
          <button
            onClick={() => setActiveTab("about")}
            className={`flex-shrink-0 py-3 px-6 text-center font-medium transition-all duration-200 ${
              activeTab === "about"
                ? "text-blue-600 border-b-2 border-blue-600 bg-white"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
            }`}
          >
            About
          </button>
          <button
            onClick={() => setActiveTab("health")}
            className={`flex-shrink-0 py-3 px-6 text-center font-medium transition-all duration-200 ${
              activeTab === "health"
                ? "text-blue-600 border-b-2 border-blue-600 bg-white"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
            }`}
          >
            Health Profile
          </button>
        </div>

        {/* About Tab Content */}
        {activeTab === "about" && (
          <div className="mt-6">
            <div className="bg-white rounded-lg shadow-md border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900">
                  About {user.fullName || user.username}
                </h2>
              </div>
              <div className="p-6 space-y-4">
                {user.bio ? (
                  <div>
                    <h4 className="font-semibold mb-2 text-gray-900">Bio</h4>
                    <p className="text-gray-700 whitespace-pre-wrap">
                      {user.bio}
                    </p>
                  </div>
                ) : (
                  <p className="text-gray-600">No bio available.</p>
                )}

                <div>
                  <h4 className="font-semibold mb-2 text-gray-900">Email</h4>
                  <p className="text-gray-700">{user.email}</p>
                </div>

                <div>
                  <h4 className="font-semibold mb-2 text-gray-900">
                    Member Since
                  </h4>
                  <p className="text-sm text-gray-600">
                    {formatDate(user.createdAt)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Health Profile Tab Content */}
        {activeTab === "health" && (
          <div className="mt-6">
            <div className="bg-white rounded-lg shadow-md border border-gray-200">
              <div className="p-6 border-b border-gray-200 flex items-center gap-2">
                <HeartPulse className="w-6 h-6 text-red-500" />
                <h2 className="text-xl font-bold text-gray-900">
                  Health Profile
                </h2>
              </div>
              <div className="p-6 space-y-4">
                {user.healthProfile && (
                  <>
                    {/* ✅ Primary Health Goal */}
                    <div>
                      <h4 className="font-semibold mb-2 text-gray-900">
                        Primary Health Goal
                      </h4>
                      <p className="text-gray-700">
                        {user.healthProfile.primaryHealthGoal || "N/A"}
                      </p>
                    </div>

                    {/* ✅ Dietary Preferences */}
                    <div>
                      <h4 className="font-semibold mb-2 text-gray-900">
                        Dietary Preferences
                      </h4>
                      <p className="text-gray-700">
                        {user.healthProfile.dietaryPreferences?.length > 0
                          ? user.healthProfile.dietaryPreferences.join(", ")
                          : "N/A"}
                      </p>
                    </div>

                    {/* ✅ Allergies */}
                    <div>
                      <h4 className="font-semibold mb-2 text-gray-900">
                        Allergies
                      </h4>
                      <p className="text-gray-700">
                        {user.healthProfile.allergies?.length > 0
                          ? user.healthProfile.allergies.join(", ")
                          : "N/A"}
                      </p>
                    </div>
                  </>
                )}

                {/* Show message if no details */}
                {!user.healthProfile ||
                Object.values(user.healthProfile).every((val) =>
                  Array.isArray(val) ? val.length === 0 : !val
                ) ? (
                  <p className="text-gray-600">
                    No health profile details available.
                  </p>
                ) : null}

                {/* Edit button for owner */}
                {isOwner && (
                  <button
                    onClick={() => navigate("/settings/health")}
                    className="mt-4 px-4 py-2 rounded-md text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                  >
                    Edit Health Profile
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfile;
