import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";

export default function SignUpPage() {
  const { register, loading } = useAuth();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
    bio: "",
    role: "",
    avatar: null,
    coverImage: null,
    primaryHealthGoal: "",
    dietaryPreferences: [],
    allergies: [],
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  // Options for new fields
  const primaryHealthGoals = [
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError("");
  };

  // Handler for checkbox changes (for dietaryPreferences, allergies)
  const handleCheckboxChange = (e, fieldName) => {
    const { value, checked } = e.target;
    setFormData((prev) => {
      const currentValues = prev[fieldName];
      if (checked) {
        return {
          ...prev,
          [fieldName]: [...currentValues, value],
        };
      } else {
        return {
          ...prev,
          [fieldName]: currentValues.filter((item) => item !== value),
        };
      }
    });
    setError("");
  };

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({
        ...prev,
        [type]: file,
      }));

      const reader = new FileReader();
      reader.onload = (e) => {
        if (type === "avatar") {
          setAvatarPreview(e.target.result);
        } else {
          setCoverPreview(e.target.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSignInRedirect = () => {
    navigate("/signin");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!formData.avatar) {
      setError("Avatar image is required");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    // You might want to add validation for new fields if they are required
    // For example:
    // if (!formData.primaryHealthGoal) {
    //   setError("Primary Health Goal is required");
    //   return;
    // }

    const result = await register(formData);

    if (result.success) {
      setSuccess(
        result.message || "Registration successful! Redirecting to sign-in..."
      );
      setFormData({
        fullName: "",
        email: "",
        username: "",
        password: "",
        confirmPassword: "",
        bio: "",
        role: "",
        avatar: null,
        coverImage: null,
        primaryHealthGoal: "",
        dietaryPreferences: [],
        allergies: [],
      });
      setAvatarPreview(null);
      setCoverPreview(null);
      setTimeout(() => {
        navigate("/signin");
      }, 1500);
    } else {
      setError(result.message || "Registration failed. Please try again.");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-100 to-blue-100 p-4 dark:from-gray-900 dark:to-blue-900">
      <div className="w-full max-w-md space-y-6 rounded-2xl bg-white/60 p-8 shadow-2xl backdrop-blur-lg dark:bg-gray-800/60 animate-fade-in">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">
            Create Account
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
            Fill in your details to create a new account
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <p className="text-center text-sm font-medium text-red-500">
              {error}
            </p>
          )}
          {success && (
            <p className="text-center text-sm font-medium text-green-500">
              {success}
            </p>
          )}
          <div>
            <label
              htmlFor="fullName"
              className="block text-sm font-medium text-gray-700 dark:text-gray-200"
            >
              Full Name *
            </label>
            <input
              id="fullName"
              name="fullName"
              type="text"
              placeholder="Enter your full name"
              value={formData.fullName}
              onChange={handleInputChange}
              required
              className="mt-1 block w-full rounded-lg border border-gray-300/50 bg-white/80 px-4 py-2.5 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 dark:border-gray-600/50 dark:bg-gray-700/80 dark:text-white dark:placeholder-gray-400"
            />
          </div>
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 dark:text-gray-200"
            >
              Email *
            </label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleInputChange}
              required
              className="mt-1 block w-full rounded-lg border border-gray-300/50 bg-white/80 px-4 py-2.5 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 dark:border-gray-600/50 dark:bg-gray-700/80 dark:text-white dark:placeholder-gray-400"
            />
          </div>
          <div>
            <label
              htmlFor="username"
              className="block text-sm font-medium text-gray-700 dark:text-gray-200"
            >
              Username *
            </label>
            <input
              id="username"
              name="username"
              type="text"
              placeholder="Choose a username"
              value={formData.username}
              onChange={handleInputChange}
              required
              className="mt-1 block w-full rounded-lg border border-gray-300/50 bg-white/80 px-4 py-2.5 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 dark:border-gray-600/50 dark:bg-gray-700/80 dark:text-white dark:placeholder-gray-400"
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 dark:text-gray-200"
            >
              Password *
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Create a password"
                value={formData.password}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full rounded-lg border border-gray-300/50 bg-white/80 px-4 py-2.5 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 dark:border-gray-600/50 dark:bg-gray-700/80 dark:text-white dark:placeholder-gray-400"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>
          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-700 dark:text-gray-200"
            >
              Confirm Password *
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full rounded-lg border border-gray-300/50 bg-white/80 px-4 py-2.5 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 dark:border-gray-600/50 dark:bg-gray-700/80 dark:text-white dark:placeholder-gray-400"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>
          <div>
            <label
              htmlFor="bio"
              className="block text-sm font-medium text-gray-700 dark:text-gray-200"
            >
              Bio (Optional)
            </label>
            <input
              id="bio"
              name="bio"
              type="text"
              placeholder="Tell us about yourself"
              value={formData.bio}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-lg border border-gray-300/50 bg-white/80 px-4 py-2.5 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 dark:border-gray-600/50 dark:bg-gray-700/80 dark:text-white dark:placeholder-gray-400"
            />
          </div>
          <div>
            <label
              htmlFor="role"
              className="block text-sm font-medium text-gray-700 dark:text-gray-200"
            >
              Role *
            </label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleInputChange}
              required
              className="mt-1 block w-full rounded-lg border border-gray-300/50 bg-white/80 px-4 py-2.5 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 dark:border-gray-600/50 dark:bg-gray-700/80 dark:text-white dark:placeholder-gray-400"
            >
              <option value="">Select your role</option>
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          {/* New Field: Primary Health Goal */}
          <div>
            <label
              htmlFor="primaryHealthGoal"
              className="block text-sm font-medium text-gray-700 dark:text-gray-200"
            >
              Primary Health Goal
            </label>
            <select
              id="primaryHealthGoal"
              name="primaryHealthGoal"
              value={formData.primaryHealthGoal}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-lg border border-gray-300/50 bg-white/80 px-4 py-2.5 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 dark:border-gray-600/50 dark:bg-gray-700/80 dark:text-white dark:placeholder-gray-400"
            >
              <option value="">Select your primary health goal</option>
              {primaryHealthGoals.map((goal) => (
                <option key={goal} value={goal}>
                  {goal}
                </option>
              ))}
            </select>
          </div>

          {/* New Field: Dietary Preferences as Checkboxes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              Dietary Preferences 
            </label>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
              {dietaryPreferencesOptions.map((pref) => (
                <div key={pref} className="flex items-center">
                  <input
                    id={`dietary-pref-${pref}`}
                    name="dietaryPreferences"
                    type="checkbox"
                    value={pref}
                    checked={formData.dietaryPreferences.includes(pref)}
                    onChange={(e) => handleCheckboxChange(e, "dietaryPreferences")}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:checked:bg-blue-600 dark:focus:ring-blue-600"
                  />
                  <label
                    htmlFor={`dietary-pref-${pref}`}
                    className="ml-2 text-sm text-gray-700 dark:text-gray-200"
                  >
                    {pref}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* New Field: Allergies as Checkboxes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              Allergies 
            </label>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
              {allergiesOptions.map((allergy) => (
                <div key={allergy} className="flex items-center">
                  <input
                    id={`allergy-${allergy}`}
                    name="allergies"
                    type="checkbox"
                    value={allergy}
                    checked={formData.allergies.includes(allergy)}
                    onChange={(e) => handleCheckboxChange(e, "allergies")}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:checked:bg-blue-600 dark:focus:ring-blue-600"
                  />
                  <label
                    htmlFor={`allergy-${allergy}`}
                    className="ml-2 text-sm text-gray-700 dark:text-gray-200"
                  >
                    {allergy}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label
              htmlFor="avatar"
              className="block text-sm font-medium text-gray-700 dark:text-gray-200"
            >
              Avatar Image *
            </label>
            <input
              id="avatar"
              type="file"
              accept="image/*"
              onChange={(e) => handleFileChange(e, "avatar")}
              required
              className="mt-1 block w-full rounded-lg border border-gray-300/50 bg-white/80 px-4 py-2.5 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 dark:border-gray-600/50 dark:bg-gray-700/80 dark:text-white dark:placeholder-gray-400"
            />
            {avatarPreview && (
              <div className="mt-2 h-12 w-12 overflow-hidden rounded-full border border-gray-300 dark:border-gray-600">
                <img
                  src={avatarPreview}
                  alt="Avatar preview"
                  className="h-full w-full object-cover"
                />
              </div>
            )}
          </div>
          <div>
            <label
              htmlFor="coverImage"
              className="block text-sm font-medium text-gray-700 dark:text-gray-200"
            >
              Cover Image (Optional)
            </label>
            <input
              id="coverImage"
              type="file"
              accept="image/*"
              onChange={(e) => handleFileChange(e, "coverImage")}
              className="mt-1 block w-full rounded-lg border border-gray-300/50 bg-white/80 px-4 py-2.5 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 dark:border-gray-600/50 dark:bg-gray-700/80 dark:text-white dark:placeholder-gray-400"
            />
            {coverPreview && (
              <div className="mt-2 h-24 w-full overflow-hidden rounded-lg border border-gray-300 dark:border-gray-600">
                <img
                  src={coverPreview}
                  alt="Cover preview"
                  className="h-full w-full object-cover"
                />
              </div>
            )}
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md transition-transform hover:scale-105 hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create Account"}
          </button>
        </form>
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Already have an account?{" "}
            <button
              onClick={handleSignInRedirect}
              className="font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
            >
              Sign In
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}