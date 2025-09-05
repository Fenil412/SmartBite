import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Calendar, MapPin, Link } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import axios from "axios";

const UserProfile = () => {
  const { userId } = useParams();
  const { user: currentUser } = useAuth();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("posts");

  useEffect(() => {
    if (userId) {
      fetchUserProfile();
    }
  }, [userId]);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/v1/users/profile/${userId}`);
      setUser(response.data.data);
    } catch (error) {
      console.error("Error fetching user profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
    });
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-32 bg-gray-200 rounded-lg mb-6"></div>
          <div className="flex items-center gap-4 mb-6">
            <div className="w-24 h-24 bg-gray-200 rounded-full"></div>
            <div className="space-y-2">
              <div className="h-6 bg-gray-200 rounded w-48"></div>
              <div className="h-4 bg-gray-200 rounded w-32"></div>
            </div>
          </div>
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
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Cover Image */}
      {user.coverImage && (
        <div className="h-32 sm:h-48 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg mb-6 overflow-hidden">
          <img
            src={user.coverImage || "/placeholder.svg"}
            alt="Cover"
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Profile Header */}
      <div className="flex flex-col sm:flex-row items-start gap-6 mb-8">
        {/* Avatar */}
        <div className="relative">
          <img
            src={user.avatar || "/placeholder.svg"}
            alt={user.name}
            className="w-24 h-24 rounded-full border-4 border-white shadow-lg object-cover"
          />
          {!user.avatar && (
            <div className="w-24 h-24 rounded-full border-4 border-white shadow-lg bg-gray-300 flex items-center justify-center text-2xl font-bold text-gray-600">
              {user.name?.charAt(0)}
            </div>
          )}
        </div>

        <div className="flex-1">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{user.name}</h1>
              <p className="text-gray-600">@{user.username}</p>
            </div>
          </div>

          {user.bio && <p className="text-gray-700 mb-4">{user.bio}</p>}

          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-4">
            {user.location && (
              <div className="flex items-center gap-1 hover:text-gray-800 transition-colors">
                <MapPin className="w-4 h-4" />
                <span>{user.location}</span>
              </div>
            )}

            {user.website && (
              <div className="flex items-center gap-1">
                <Link className="w-4 h-4" />
                <a
                  href={user.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                >
                  {user.website}
                </a>
              </div>
            )}

            <div className="flex items-center gap-1 hover:text-gray-800 transition-colors">
              <Calendar className="w-4 h-4" />
              <span>Joined {formatDate(user.createdAt)}</span>
            </div>
          </div>

          <div className="flex items-center gap-6 text-sm"></div>
        </div>
      </div>

      {/* Content Tabs */}
      <div className="mb-8">
        <div className="flex border-b border-gray-200 bg-gray-50 rounded-t-lg">
          <button
            onClick={() => setActiveTab("about")}
            className={`flex-1 py-3 px-4 text-center font-medium transition-all duration-200 ${
              activeTab === "about"
                ? "text-blue-600 border-b-2 border-blue-600 bg-white"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
            }`}
          >
            About
          </button>
        </div>

        {/* About Tab */}
        {activeTab === "about" && (
          <div className="mt-6">
            <div className="bg-white rounded-lg shadow-md border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900">
                  About {user.name}
                </h2>
              </div>
              <div className="p-6 space-y-4">
                {user.bio ? (
                  <div>
                    <h4 className="font-semibold mb-2 text-gray-900">Bio</h4>
                    <p className="text-gray-700">{user.bio}</p>
                  </div>
                ) : (
                  <p className="text-gray-600">No bio available.</p>
                )}

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
      </div>
    </div>
  );
};

export default UserProfile;
