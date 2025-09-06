import React, { useState, useEffect } from "react";
import PreferencesPage from "./PreferencesPage";
import UserProfile from "./UserProfilePage"; // Import UserProfilePage
import {
  ChefHat,
  ShoppingCart,
  Target,
  Zap,
  Calendar,
  Heart,
  Brain,
  CheckCircle,
  LogIn,
  UserPlus,
  Star,
  ArrowRight,
  Play,
  Users,
  Clock,
  TrendingUp,
  Sparkles,
  Award,
  Shield,
  Home,
  Settings,
  PersonStanding,
  Book,
  Timer,
} from "lucide-react";
import { useNavigate } from "react-router-dom"; // Import useNavigate

export default function App() {
  const [isVisible, setIsVisible] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);
  const [activeSidebarItem, setActiveSidebarItem] = useState("Home"); // Default to "Home"
  const navigate = useNavigate(); // Initialize useNavigate

  useEffect(() => {
    setIsVisible(true);
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % 6);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const features = [
    {
      icon: Brain,
      title: "AI-Powered Recommendations",
      description:
        "Smart algorithms learn your taste preferences and suggest meals you'll love while meeting your nutritional needs.",
      color: "from-pink-400 to-rose-400",
    },
    {
      icon: Target,
      title: "Dietary Goals Tracking",
      description:
        "Set and track weight loss, muscle gain, or maintenance goals with precision nutrition planning.",
      color: "from-blue-300 to-cyan-300",
    },
    {
      icon: ShoppingCart,
      title: "Smart Shopping Lists",
      description:
        "Automatically generated grocery lists organized by store sections, with quantity optimization to reduce waste.",
      color: "from-green-300 to-emerald-300",
    },
    {
      icon: Calendar,
      title: "Weekly Planning",
      description:
        "Comprehensive 7-day meal plans with breakfast, lunch, dinner, and snacks tailored to your schedule.",
      color: "from-orange-300 to-amber-300",
    },
    {
      icon: Heart,
      title: "Health Integration",
      description:
        "Connect with fitness trackers and health apps to sync your activity levels and adjust nutrition accordingly.",
      color: "from-rose-300 to-pink-300",
    },
    {
      icon: ChefHat,
      title: "Recipe Variety",
      description:
        "Access thousands of recipes with detailed instructions, prep times, and nutritional breakdowns.",
      color: "from-purple-300 to-violet-300",
    },
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Fitness Enthusiast",
      content:
        "Smart Bite transformed my meal prep routine. I've saved 6 hours weekly and lost 15 pounds!",
      rating: 5,
    },
    {
      name: "Mike Chen",
      role: "Busy Parent",
      content:
        "Finally, healthy meals that my whole family loves. The shopping lists are a game-changer!",
      rating: 5,
    },
    {
      name: "Emily Rodriguez",
      role: "Nutritionist",
      content:
        "I recommend Smart Bite to all my clients. The AI recommendations are incredibly accurate.",
      rating: 5,
    },
  ];

  const sidebarItems = [
    { name: "Home", icon: Home },
    { name: "User Profile", icon: PersonStanding },
    { name: "Preferences", icon: Sparkles },
    { name: "AI Meal Plans", icon: ChefHat },
    { name: "Shopping List", icon: ShoppingCart },
    { name: "Meal History", icon: Book },
    { name: "Nutrition Tracker", icon: Timer },
    { name: "AI Summary", icon: Brain },
  ];

  // Function to render the main content based on activeSidebarItem
  const renderMainContent = () => {
    switch (activeSidebarItem) {
      case "Home":
        return (
          <>
            {/* Light Hero Section with Big Headers */}
            <section className="relative pt-24 pb-20 lg:pt-32 lg:pb-32 overflow-hidden">
              {/* Light Background */}
              <div className="absolute inset-0">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-100/50 via-pink-100/50 to-blue-100/50"></div>
                <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-gradient-to-r from-pink-200/40 to-orange-200/40 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-blue-200/30 to-purple-200/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
              </div>

              <div className="container mx-auto px-4 relative">
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                  <div
                    className={`space-y-8 ${
                      isVisible ? "animate-fade-in-up" : "opacity-0"
                    }`}
                  >
                    <div className="space-y-8">
                      <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-100 to-orange-100 rounded-full border border-pink-200/50 shadow-sm">
                        <Sparkles className="w-4 h-4 text-pink-500" />
                        <span className="text-sm font-semibold text-pink-600">
                          Intelligent Nutrition Dashboard
                        </span>
                      </div>

                      <h1 className="text-5xl lg:text-7xl font-black tracking-tight leading-[0.9]">
                        <span className="text-gray-800">Smart Meal</span>

                        <span className="text-gray-800 ">Planning for </span>

                        <span className="bg-gradient-to-r  from-pink-500 via-orange-500 to-blue-500 bg-clip-text text-transparent">
                          Health Goals
                        </span>
                      </h1>

                      <p className="text-xl text-gray-600 max-w-lg leading-relaxed font-medium">
                        Transform your nutrition journey with AI-powered meal
                        plans, automated shopping lists, and personalized
                        recipes that adapt to your lifestyle.
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-5">
                      <button
                        onClick={() => navigate("/signup")} // Connected to SignUpPage
                        className="group px-8 py-4 bg-gradient-to-r from-pink-400 to-orange-400 text-white rounded-2xl font-bold text-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 flex items-center justify-center"
                      >
                        <ChefHat className="w-5 h-5 mr-2 group-hover:animate-bounce" />
                        Start Your Journey
                        <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                      </button>
                      <button className="group px-8 py-4 bg-white text-gray-700 border-2 border-pink-200 rounded-2xl font-bold text-lg hover:border-pink-300 hover:bg-pink-50 hover:shadow-lg transition-all duration-300 flex items-center justify-center">
                        <Play className="w-5 h-5 mr-2" />
                        Watch Demo
                      </button>
                    </div>

                    {/* Light Stats */}
                    <div className="grid grid-cols-3 gap-6 pt-6 border-t border-pink-200/50">
                      {[
                        { value: "50K+", label: "Meal Plans", icon: ChefHat },
                        {
                          value: "98%",
                          label: "Success Rate",
                          icon: TrendingUp,
                        },
                        { value: "4.9★", label: "User Rating", icon: Star },
                      ].map((stat, index) => (
                        <div key={index} className="text-center group">
                          <div className="flex items-center justify-center mb-2">
                            <stat.icon className="w-5 h-5 text-pink-500 mr-1" />
                            <div className="text-2xl font-black text-gray-800">
                              {stat.value}
                            </div>
                          </div>
                          <div className="text-xs text-gray-600 font-medium">
                            {stat.label}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="relative lg:pl-8">
                    {/* Light Floating Cards */}
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-pink-300/20 to-orange-300/20 rounded-3xl blur-3xl"></div>

                      <div className="relative bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-pink-200/50">
                        <div className="space-y-5">
                          <div className="flex items-center justify-between">
                            <h3 className="text-xl font-bold text-gray-800">
                              Today's Meal Plan
                            </h3>
                            <div className="px-3 py-1.5 bg-gradient-to-r from-pink-100 to-orange-100 rounded-full">
                              <span className="text-xs font-bold text-pink-600">
                                Optimized
                              </span>
                            </div>
                          </div>

                          <div className="space-y-3">
                            {["Breakfast", "Lunch", "Dinner"].map(
                              (meal, index) => (
                                <div
                                  key={index}
                                  className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-pink-50 to-orange-50 border border-pink-100"
                                >
                                  <div className="w-12 h-12 bg-gradient-to-br from-pink-300 to-orange-400 rounded-xl"></div>
                                  <div className="flex-1">
                                    <div className="font-bold text-gray-800 text-base">
                                      {meal}
                                    </div>
                                    <div className="text-xs text-gray-600 font-medium">
                                      Personalized recipe
                                    </div>
                                  </div>
                                  <CheckCircle className="w-5 h-5 text-green-500" />
                                </div>
                              )
                            )}
                          </div>

                          <div className="pt-3 border-t border-pink-200">
                            <div className="flex justify-between text-xs font-medium">
                              <span className="text-gray-600">
                                Calories: 1,850
                              </span>
                              <span className="text-pink-500 font-bold">
                                Goal: 98%
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Light floating notification */}
                      <div className="absolute -top-3 -right-3 bg-gradient-to-r from-yellow-400 to-orange-400 text-white px-4 py-2 rounded-full shadow-xl animate-bounce">
                        <div className="flex items-center gap-1 text-xs font-bold">
                          <Zap className="w-3 h-3" />
                          AI Generated
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Light Interactive Features Section */}
            <section className="py-20 bg-white/70">
              <div className="container mx-auto px-4">
                <div className="text-center space-y-5 mb-16">
                  <h2 className="text-4xl lg:text-6xl font-black text-gray-800">
                    Powered by Advanced AI
                  </h2>
                  <p className="text-xl text-gray-600 max-w-3xl mx-auto font-medium">
                    Our intelligent system learns from your preferences and
                    continuously adapts to deliver the perfect nutrition
                    experience
                  </p>
                </div>

                <div className="grid lg:grid-cols-3 gap-8 items-start mb-16">
                  {/* Features Column - Takes 2/3 width */}
                  <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-5">
                    {features.map((feature, index) => (
                      <div
                        key={index}
                        className={`p-5 rounded-2xl border-2 transition-all duration-500 cursor-pointer ${
                          activeFeature === index
                            ? "border-pink-300 bg-white shadow-xl scale-105"
                            : "border-pink-100 bg-white/60 hover:border-pink-200"
                        }`}
                        onClick={() => setActiveFeature(index)}
                      >
                        <div className="space-y-3">
                          <div
                            className={`w-10 h-10 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center shadow-lg`}
                          >
                            <feature.icon className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-gray-800 mb-1">
                              {feature.title}
                            </h3>
                            <p className="text-gray-600 text-sm leading-relaxed">
                              {feature.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* AI Insights Column - Takes 1/3 width */}
                  <div className="lg:col-span-1">
                    <div className="sticky top-24">
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-pink-200/30 to-orange-200/30 rounded-3xl blur-3xl"></div>
                        <div className="relative bg-white/90 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-pink-200/50">
                          <div className="space-y-6">
                            <div className="text-center">
                              <div className="flex items-center justify-center mb-3">
                                <h3 className="text-xl font-bold text-gray-800">
                                  AI Insights
                                </h3>
                                <div className="w-2.5 h-2.5 bg-green-400 rounded-full animate-pulse ml-2"></div>
                              </div>
                              <p className="text-xs text-gray-600">
                                Real-time analysis
                              </p>
                            </div>

                            <div className="space-y-5">
                              <div className="p-4 bg-gradient-to-r from-pink-100 to-orange-100 rounded-xl border border-pink-200 text-center">
                                <div className="text-base font-bold text-pink-600">
                                  Nutrition Score
                                </div>
                                <div className="text-2xl font-black text-pink-700 mt-1">
                                  94%
                                </div>
                                <div className="text-xs text-gray-600 mt-0.5 font-medium">
                                  Optimized for your goals
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-3">
                                <div className="p-3 bg-purple-100 rounded-xl text-center border border-purple-200">
                                  <div className="text-xl font-black text-purple-600">
                                    2.1k
                                  </div>
                                  <div className="text-xs text-gray-600 font-medium">
                                    Calories
                                  </div>
                                </div>
                                <div className="p-3 bg-blue-100 rounded-xl text-center border border-blue-200">
                                  <div className="text-xl font-black text-blue-600">
                                    45g
                                  </div>
                                  <div className="text-xs text-gray-600 font-medium">
                                    Protein
                                  </div>
                                </div>
                              </div>

                              <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                  <span className="text-xs font-medium text-gray-600">
                                    Carbs
                                  </span>
                                  <span className="text-xs font-bold text-orange-600">
                                    180g
                                  </span>
                                </div>
                                <div className="w-full bg-orange-100 rounded-full h-1.5">
                                  <div
                                    className="bg-gradient-to-r from-orange-400 to-orange-500 h-1.5 rounded-full"
                                    style={{ width: "75%" }}
                                  ></div>
                                </div>

                                <div className="flex justify-between items-center">
                                  <span className="text-xs font-medium text-gray-600">
                                    Fats
                                  </span>
                                  <span className="text-xs font-bold text-green-600">
                                    65g
                                  </span>
                                </div>
                                <div className="w-full bg-green-100 rounded-full h-1.5">
                                  <div
                                    className="bg-gradient-to-r from-green-400 to-green-500 h-1.5 rounded-full"
                                    style={{ width: "60%" }}
                                  ></div>
                                </div>
                              </div>

                              <div className="p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200 text-center">
                                <div className="text-xs font-bold text-blue-600 mb-0.5">
                                  Weekly Progress
                                </div>
                                <div className="text-base font-black text-blue-700">
                                  +2.5 lbs
                                </div>
                                <div className="text-xs text-gray-600">
                                  Towards goal
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Light How It Works */}
            <section className="py-20 bg-gradient-to-br from-pink-50 to-orange-50">
              <div className="container mx-auto px-4">
                <div className="text-center space-y-5 mb-16">
                  <h2 className="text-4xl lg:text-6xl font-black text-gray-800">
                    Simple, Smart, Effective
                  </h2>
                  <p className="text-xl text-gray-600 max-w-2xl mx-auto font-medium">
                    Get started with personalized meal planning in three
                    effortless steps
                  </p>
                </div>

                <div className="grid lg:grid-cols-3 gap-10">
                  {[
                    {
                      step: 1,
                      title: "Set Your Profile",
                      desc: "Tell us your goals, preferences, and dietary needs",
                      icon: Users,
                      color: "from-pink-400 to-rose-400",
                    },
                    {
                      step: 2,
                      title: "AI Creates Magic",
                      desc: "Our AI generates your personalized meal plan",
                      icon: Brain,
                      color: "from-blue-400 to-purple-400",
                    },
                    {
                      step: 3,
                      title: "Shop & Enjoy",
                      desc: "Get your shopping list and start cooking",
                      icon: ShoppingCart,
                      color: "from-green-400 to-emerald-400",
                    },
                  ].map((item, index) => (
                    <div key={index} className="relative group">
                      <div className="text-center space-y-6">
                        <div className="relative mx-auto">
                          <div
                            className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform duration-300`}
                          >
                            <item.icon className="w-10 h-10 text-white" />
                          </div>
                          <div className="absolute -top-1 -right-1 w-8 h-8 bg-white border-2 border-pink-200 rounded-full flex items-center justify-center shadow-lg">
                            <span className="text-base font-black text-gray-800">
                              {item.step}
                            </span>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <h3 className="text-2xl font-black text-gray-800">
                            {item.title}
                          </h3>
                          <p className="text-gray-600 text-lg font-medium">
                            {item.desc}
                          </p>
                        </div>
                      </div>

                      {index < 2 && (
                        <div className="hidden lg:block absolute top-10 left-full w-10 h-0.5 bg-gradient-to-r from-pink-300 to-orange-300"></div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Light Testimonials */}
            <section className="py-20 bg-white/70">
              <div className="container mx-auto px-4">
                <div className="text-center space-y-5 mb-14">
                  <h2 className="text-4xl font-black text-gray-800">
                    Loved by Thousands
                  </h2>
                  <p className="text-xl text-gray-600 font-medium">
                    See what our community says about Smart Bite
                  </p>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                  {testimonials.map((testimonial, index) => (
                    <div
                      key={index}
                      className="bg-white/90 backdrop-blur-xl p-6 rounded-2xl shadow-xl border border-pink-200/50 hover:shadow-2xl transition-all duration-300 hover:scale-105"
                    >
                      <div className="space-y-5">
                        <div className="flex gap-1">
                          {[...Array(testimonial.rating)].map((_, i) => (
                            <Star
                              key={i}
                              className="w-5 h-5 text-yellow-400 fill-current"
                            />
                          ))}
                        </div>
                        <p className="text-gray-700 text-lg leading-relaxed font-medium">
                          "{testimonial.content}"
                        </p>
                        <div className="pt-3 border-t border-pink-200">
                          <div className="font-bold text-gray-800 text-base">
                            {testimonial.name}
                          </div>
                          <div className="text-sm text-gray-600 font-medium">
                            {testimonial.role}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Light CTA Section */}
            <section className="py-20 bg-gradient-to-br from-pink-400 via-orange-400 to-yellow-400 text-white relative overflow-hidden">
              <div className="absolute inset-0 bg-white/10"></div>
              <div className="absolute top-0 left-1/4 w-96 h-96 bg-white/20 rounded-full blur-3xl animate-pulse"></div>
              <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-white/20 rounded-full blur-3xl animate-pulse delay-1000"></div>

              <div className="container mx-auto px-4 relative">
                <div className="text-center space-y-8 max-w-4xl mx-auto">
                  <h2 className="text-5xl lg:text-7xl font-black mb-6">
                    Ready to Transform Your Health?
                  </h2>
                  <p className="text-xl lg:text-2xl mb-8 font-bold opacity-90">
                    Join 50,000+ users who've already achieved their nutrition
                    goals with Smart Bite
                  </p>

                  <div className="flex flex-col sm:flex-row gap-5 justify-center items-center">
                    <button
                      onClick={() => navigate("/signup")} // Connected to SignUpPage
                      className="group px-10 py-5 bg-white text-pink-500 rounded-2xl font-black text-xl hover:bg-gray-50 hover:scale-105 transition-all duration-300 shadow-2xl"
                    >
                      <ChefHat className="w-6 h-6 mr-2 inline group-hover:animate-bounce" />
                      Start Free Trial
                      <ArrowRight className="w-6 h-6 ml-2 inline group-hover:translate-x-1 transition-transform" />
                    </button>
                    <button className="px-10 py-5 border-2 border-white/70 text-white rounded-2xl font-black text-xl hover:bg-white/10 transition-all duration-300">
                      View Pricing
                    </button>
                  </div>

                  <div className="flex items-center justify-center gap-8 pt-6 text-white/90">
                    <div className="flex items-center gap-2">
                      <Shield className="w-5 h-5" />
                      <span className="font-bold text-base">
                        7-day free trial
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Award className="w-5 h-5" />
                      <span className="font-bold text-base">
                        No credit card required
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-5 h-5" />
                      <span className="font-bold text-base">
                        Cancel anytime
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Light Footer */}
            <footer className="bg-white text-gray-800 py-14 border-t border-pink-100">
              <div className="container mx-auto px-4">
                <div className="grid lg:grid-cols-4 gap-10">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 bg-gradient-to-br from-pink-400 to-orange-400 rounded-xl flex items-center justify-center shadow-lg">
                        <ChefHat className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-black">Smart Bite</h3>
                        <p className="text-xs text-gray-500 font-medium">
                          AI Nutrition
                        </p>
                      </div>
                    </div>
                    <p className="text-gray-600 font-medium text-sm">
                      Intelligent nutrition planning for a healthier, happier
                      you. Powered by cutting-edge AI technology.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-lg font-bold">Product</h4>
                    <div className="space-y-2">
                      {["Features", "Pricing", "API", "Integrations"].map(
                        (item) => (
                          <button
                            key={item}
                            className="block text-gray-600 hover:text-pink-500 transition-colors font-medium text-sm"
                          >
                            {item}
                          </button>
                        )
                      )}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-lg font-bold">Company</h4>
                    <div className="space-y-2">
                      {["About Us", "Careers", "Blog", "Press"].map((item) => (
                        <button
                          key={item}
                          className="block text-gray-600 hover:text-pink-500 transition-colors font-medium text-sm"
                        >
                          {item}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-lg font-bold">Support</h4>
                    <div className="space-y-2">
                      {[
                        "Help Center",
                        "Contact Us",
                        "Privacy Policy",
                        "Terms of Service",
                      ].map((item) => (
                        <button
                          key={item}
                          className="block text-gray-600 hover:text-pink-500 transition-colors font-medium text-sm"
                        >
                          {item}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="border-t border-pink-200 mt-10 pt-7 text-center">
                  <p className="text-gray-600 font-medium text-sm">
                    © 2025 Smart Bite. All rights reserved. Made with ❤️ for
                    healthier living.
                  </p>
                </div>
              </div>
            </footer>
          </>
        );
      case "User Profile": // Add this case
        return <UserProfile />; // Render the UserProfile component
      case "Preferences":
        return <PreferencesPage />;
      // Add other cases for other sidebar items if you create more components
      default:
        return (
          <div className="flex items-center justify-center h-full text-xl text-gray-500">
            Content for {activeSidebarItem}
          </div>
        );
    }
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
              className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-all duration-200
                ${
                  activeSidebarItem === item.name
                    ? "bg-gradient-to-r from-pink-100 to-orange-100 text-pink-700 font-bold shadow-md"
                    : "text-gray-600 hover:bg-pink-50 hover:text-pink-500 font-medium"
                }`}
              onClick={() => {
                setActiveSidebarItem(item.name);
                if (item.name === "Shopping List") {
                  navigate("/shopping-list");
                }
                if (item.name === "Nutrition Tracker") {
                  navigate("/nutrition-tracker");
                }
              }}
              // onClick={() => {
              //   if (item.name === "Home") navigate("/");
              //   else if (item.name === "User Profile") navigate("/profile");
              //   else if (item.name === "Preferences") navigate("/preferences");
              //   else if (item.name === "Shopping List") navigate("/shopping-list");
              //   else if (item.name === "Nutrition Tracker") navigate("/nutrition-tracker"); // <--- Add this line
              //   // ... other navigation logic
              // }}
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
        {" "}
        {/* Margin-left to offset sidebar */}
        {/* Light Header (adjusted for main content area) */}
        <header className="fixed top-0 right-0 w-[calc(100%-16rem)] z-50 bg-white/90 backdrop-blur-xl border-b border-pink-100/50 shadow-sm">
          <div className="container mx-auto px-4">
            <div className="flex h-16 items-center justify-end">
              {" "}
              {/* Adjusted to justify-end */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => navigate("/signin")} // Connected to SignInPage
                  className="px-4 py-2 text-gray-600 hover:text-pink-500 transition-colors font-medium rounded-xl hover:bg-pink-50"
                >
                  <LogIn className="w-4 h-4 mr-1 inline" />
                  Sign In
                </button>
                <button
                  onClick={() => navigate("/signup")} // Connected to SignUpPage
                  className="px-6 py-2.5 bg-gradient-to-r from-pink-400 to-orange-400 text-white rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all duration-200"
                >
                  <UserPlus className="w-4 h-4 mr-1 inline" />
                  Start Free
                </button>
              </div>
            </div>
          </div>
        </header>
        {renderMainContent()} {/* Render the main content here */}
      </div>
    </div>
  );
}
