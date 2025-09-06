import React, { useState, useEffect } from "react";
import { ChefHat, ShoppingCart, Target, Zap, Calendar, Heart, Brain, CheckCircle, Star, ArrowRight, Play, Users, Clock, TrendingUp, Sparkles, Award, Shield } from "lucide-react";

export default function HomePageContent({ navigate, isDarkMode }) {
  const [isVisible, setIsVisible] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);

  useEffect(() => {
    setIsVisible(true);
    const interval = setInterval(() => {
      setActiveFeature(prev => (prev + 1) % 6);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const features = [
    { icon: Brain, title: "AI-Powered Recommendations", description: "Smart algorithms learn your taste preferences and suggest meals you'll love while meeting your nutritional needs.", color: "from-pink-400 to-rose-400" },
    { icon: Target, title: "Dietary Goals Tracking", description: "Set and track weight loss, muscle gain, or maintenance goals with precision nutrition planning.", color: "from-blue-300 to-cyan-300" },
    { icon: ShoppingCart, title: "Smart Shopping Lists", description: "Automatically generated grocery lists organized by store sections, with quantity optimization to reduce waste.", color: "from-green-300 to-emerald-300" },
    { icon: Calendar, title: "Weekly Planning", description: "Comprehensive 7-day meal plans with breakfast, lunch, dinner, and snacks tailored to your schedule.", color: "from-orange-300 to-amber-300" },
    { icon: Heart, title: "Health Integration", description: "Connect with fitness trackers and health apps to sync your activity levels and adjust nutrition accordingly.", color: "from-rose-300 to-pink-300" },
    { icon: ChefHat, title: "Recipe Variety", description: "Access thousands of recipes with detailed instructions, prep times, and nutritional breakdowns.", color: "from-purple-300 to-violet-300" }
  ];

  const testimonials = [
    { name: "Sarah Johnson", role: "Fitness Enthusiast", content: "Smart Bite transformed my meal prep routine. I've saved 6 hours weekly and lost 15 pounds!", rating: 5 },
    { name: "Mike Chen", role: "Busy Parent", content: "Finally, healthy meals that my whole family loves. The shopping lists are a game-changer!", rating: 5 },
    { name: "Emily Rodriguez", role: "Nutritionist", content: "I recommend Smart Bite to all my clients. The AI recommendations are incredibly accurate.", rating: 5 }
  ];

  return (
    <>
      {/* Hero Section */}
      <section className={`relative pt-2 pb-20 lg:pt-32 lg:pb-32 overflow-hidden ${isDarkMode ? "dark bg-gray-900" : ""}`}>
        {/* Background elements */}
        <div className="absolute inset-0">
          <div className={`absolute inset-0 ${isDarkMode ? "bg-gray-950" : "bg-gradient-to-br from-orange-100/50 via-pink-100/50 to-blue-100/50"}`}></div>
          <div className={`absolute top-1/4 left-1/4 w-72 h-72 ${isDarkMode ? "bg-purple-900/40" : "bg-gradient-to-r from-pink-200/40 to-orange-200/40"} rounded-full blur-3xl animate-pulse`}></div>
          <div className={`absolute bottom-1/4 right-1/4 w-96 h-96 ${isDarkMode ? "bg-blue-900/30" : "bg-gradient-to-r from-blue-200/30 to-purple-200/30"} rounded-full blur-3xl animate-pulse delay-1000`}></div>
        </div>

        <div className="container mx-auto px-4 relative">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className={`space-y-8 ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}>
              <div className="space-y-8">
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border shadow-sm ${isDarkMode ? "bg-gray-700 border-gray-600" : "bg-gradient-to-r from-pink-100 to-orange-100 border-pink-200/50"}`}>
                  <Sparkles className={`w-4 h-4 ${isDarkMode ? "text-pink-400" : "text-pink-500"}`} />
                  <span className={`text-sm font-semibold ${isDarkMode ? "text-pink-400" : "text-pink-600"}`}>Intelligent Nutrition Dashboard</span>
                </div>

                <h1 className="text-5xl lg:text-7xl font-black tracking-tight leading-[0.9]">
                  <span className={`${isDarkMode ? "text-gray-100" : "text-gray-800"}`}>Smart Meal</span>
                  <span className={`${isDarkMode ? "text-gray-100" : "text-gray-800"} `}>Planning for </span>
                  <span className="bg-gradient-to-r from-pink-500 via-orange-500 to-blue-500 bg-clip-text text-transparent">Health Goals</span>
                </h1>

                <p className={`text-xl max-w-lg leading-relaxed font-medium ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
                  Transform your nutrition journey with AI-powered meal plans, automated shopping lists, and personalized recipes that adapt to your lifestyle.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-5">
                <button
                  onClick={() => navigate("/signup")}
                  className="group px-8 py-4 bg-gradient-to-r from-pink-400 to-orange-400 text-white rounded-2xl font-bold text-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 flex items-center justify-center"
                >
                  <ChefHat className="w-5 h-5 mr-2 group-hover:animate-bounce" />
                  Start Your Journey
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </button>
                <button className={`group px-8 py-4 rounded-2xl font-bold text-lg hover:shadow-lg transition-all duration-300 flex items-center justify-center ${isDarkMode ? "bg-gray-700 text-gray-100 border-2 border-gray-600 hover:border-gray-500 hover:bg-gray-600" : "bg-white text-gray-700 border-2 border-pink-200 hover:border-pink-300 hover:bg-pink-50"}`}>
                  <Play className="w-5 h-5 mr-2" />
                  Watch Demo
                </button>
              </div>

              {/* Stats */}
              <div className={`grid grid-cols-3 gap-6 pt-6 border-t ${isDarkMode ? "border-gray-700" : "border-pink-200/50"}`}>
                {[
                  { value: "50K+", label: "Meal Plans", icon: ChefHat },
                  { value: "98%", label: "Success Rate", icon: TrendingUp },
                  { value: "4.9★", label: "User Rating", icon: Star }
                ].map((stat, index) => (
                  <div key={index} className="text-center group">
                    <div className="flex items-center justify-center mb-2">
                      <stat.icon className={`w-5 h-5 ${isDarkMode ? "text-pink-400" : "text-pink-500"} mr-1`} />
                      <div className={`text-2xl font-black ${isDarkMode ? "text-gray-100" : "text-gray-800"}`}>{stat.value}</div>
                    </div>
                    <div className={`text-xs font-medium ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative lg:pl-8">
              {/* Floating Cards */}
              <div className="relative">
                <div className={`absolute inset-0 rounded-3xl blur-3xl ${isDarkMode ? "bg-purple-900/20" : "bg-gradient-to-r from-pink-300/20 to-orange-300/20"}`}></div>

                <div className={`relative rounded-3xl p-6 shadow-xl border ${isDarkMode ? "bg-gray-800/80 backdrop-blur-xl border-gray-700" : "bg-white/80 backdrop-blur-xl border-pink-200/50"}`}>
                  <div className="space-y-5">
                    <div className="flex items-center justify-between">
                      <h3 className={`text-xl font-bold ${isDarkMode ? "text-gray-100" : "text-gray-800"}`}>Today's Meal Plan</h3>
                      <div className={`px-3 py-1.5 rounded-full ${isDarkMode ? "bg-gray-700" : "bg-gradient-to-r from-pink-100 to-orange-100"}`}>
                        <span className={`text-xs font-bold ${isDarkMode ? "text-pink-400" : "text-pink-600"}`}>Optimized</span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {['Breakfast', 'Lunch', 'Dinner'].map((meal, index) => (
                        <div key={index} className={`flex items-center gap-3 p-3 rounded-xl border ${isDarkMode ? "bg-gray-700 border-gray-600" : "bg-gradient-to-r from-pink-50 to-orange-50 border-pink-100"}`}>
                          <div className="w-12 h-12 bg-gradient-to-br from-pink-300 to-orange-400 rounded-xl"></div>
                          <div className="flex-1">
                            <div className={`font-bold text-base ${isDarkMode ? "text-gray-100" : "text-gray-800"}`}>{meal}</div>
                            <div className={`text-xs font-medium ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>Personalized recipe</div>
                          </div>
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        </div>
                      ))}
                    </div>

                    <div className={`pt-3 border-t ${isDarkMode ? "border-gray-700" : "border-pink-200"}`}>
                      <div className="flex justify-between text-xs font-medium">
                        <span className={`${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>Calories: 1,850</span>
                        <span className={`font-bold ${isDarkMode ? "text-pink-400" : "text-pink-500"}`}>Goal: 98%</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating notification */}
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

      {/* Interactive Features Section */}
      <section className={`py-20 ${isDarkMode ? "bg-gray-900/70" : "bg-white/70"}`}>
        <div className="container mx-auto px-4">
          <div className="text-center space-y-5 mb-16">
            <h2 className={`text-4xl lg:text-6xl font-black ${isDarkMode ? "text-gray-100" : "text-gray-800"}`}>
              Powered by Advanced AI
            </h2>
            <p className={`text-xl max-w-3xl mx-auto font-medium ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
              Our intelligent system learns from your preferences and continuously adapts to deliver the perfect nutrition experience
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
                      ? `${isDarkMode ? "border-pink-700 bg-gray-800 shadow-xl scale-105" : "border-pink-300 bg-white shadow-xl scale-105"}`
                      : `${isDarkMode ? "border-gray-700 bg-gray-800/60 hover:border-gray-600" : "border-pink-100 bg-white/60 hover:border-pink-200"}`
                  }`}
                  onClick={() => setActiveFeature(index)}
                >
                  <div className="space-y-3">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center shadow-lg`}>
                      <feature.icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className={`text-lg font-bold mb-1 ${isDarkMode ? "text-gray-100" : "text-gray-800"}`}>{feature.title}</h3>
                      <p className={`text-sm leading-relaxed ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>{feature.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* AI Insights Column - Takes 1/3 width */}
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <div className="relative">
                  <div className={`absolute inset-0 rounded-3xl blur-3xl ${isDarkMode ? "bg-blue-900/30" : "bg-gradient-to-r from-pink-200/30 to-orange-200/30"}`}></div>
                  <div className={`relative rounded-3xl p-6 shadow-xl border ${isDarkMode ? "bg-gray-800/90 backdrop-blur-xl border-gray-700" : "bg-white/90 backdrop-blur-xl border-pink-200/50"}`}>
                    <div className="space-y-6">
                      <div className="text-center">
                        <div className="flex items-center justify-center mb-3">
                          <h3 className={`text-xl font-bold ${isDarkMode ? "text-gray-100" : "text-gray-800"}`}>AI Insights</h3>
                          <div className="w-2.5 h-2.5 bg-green-400 rounded-full animate-pulse ml-2"></div>
                        </div>
                        <p className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>Real-time analysis</p>
                      </div>

                      <div className="space-y-5">
                        <div className={`p-4 rounded-xl border text-center ${isDarkMode ? "bg-gray-700 border-gray-600" : "bg-gradient-to-r from-pink-100 to-orange-100 border-pink-200"}`}>
                          <div className={`text-base font-bold ${isDarkMode ? "text-pink-400" : "text-pink-600"}`}>Nutrition Score</div>
                          <div className={`text-2xl font-black mt-1 ${isDarkMode ? "text-pink-300" : "text-pink-700"}`}>94%</div>
                          <div className={`text-xs mt-0.5 font-medium ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>Optimized for your goals</div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className={`p-3 rounded-xl text-center border ${isDarkMode ? "bg-purple-800 border-purple-700" : "bg-purple-100 border-purple-200"}`}>
                            <div className={`text-xl font-black ${isDarkMode ? "text-purple-400" : "text-purple-600"}`}>2.1k</div>
                            <div className={`text-xs font-medium ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>Calories</div>
                          </div>
                          <div className={`p-3 rounded-xl text-center border ${isDarkMode ? "bg-blue-800 border-blue-700" : "bg-blue-100 border-blue-200"}`}>
                            <div className={`text-xl font-black ${isDarkMode ? "text-blue-400" : "text-blue-600"}`}>45g</div>
                            <div className={`text-xs font-medium ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>Protein</div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className={`text-xs font-medium ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>Carbs</span>
                            <span className={`text-xs font-bold ${isDarkMode ? "text-orange-400" : "text-orange-600"}`}>180g</span>
                          </div>
                          <div className={`w-full rounded-full h-1.5 ${isDarkMode ? "bg-orange-900" : "bg-orange-100"}`}>
                            <div className="bg-gradient-to-r from-orange-400 to-orange-500 h-1.5 rounded-full" style={{width: '75%'}}></div>
                          </div>

                          <div className="flex justify-between items-center">
                            <span className={`text-xs font-medium ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>Fats</span>
                            <span className={`text-xs font-bold ${isDarkMode ? "text-green-400" : "text-green-600"}`}>65g</span>
                          </div>
                          <div className={`w-full rounded-full h-1.5 ${isDarkMode ? "bg-green-900" : "bg-green-100"}`}>
                            <div className="bg-gradient-to-r from-green-400 to-green-500 h-1.5 rounded-full" style={{width: '60%'}}></div>
                          </div>
                        </div>

                        <div className={`p-3 rounded-lg border text-center ${isDarkMode ? "bg-blue-800/50 border-blue-700" : "bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200"}`}>
                          <div className={`text-xs font-bold mb-0.5 ${isDarkMode ? "text-blue-400" : "text-blue-600"}`}>Weekly Progress</div>
                          <div className={`text-base font-black ${isDarkMode ? "text-blue-300" : "text-blue-700"}`}>+2.5 lbs</div>
                          <div className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>Towards goal</div>
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

      {/* How It Works Section */}
      <section className={`py-20 ${isDarkMode ? "bg-gray-800" : "bg-gradient-to-br from-pink-50 to-orange-50"}`}>
        <div className="container mx-auto px-4">
          <div className="text-center space-y-5 mb-16">
            <h2 className={`text-4xl lg:text-6xl font-black ${isDarkMode ? "text-gray-100" : "text-gray-800"}`}>
              Simple, Smart, Effective
            </h2>
            <p className={`text-xl max-w-2xl mx-auto font-medium ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
              Get started with personalized meal planning in three effortless steps
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-10">
            {[
              { step: 1, title: "Set Your Profile", desc: "Tell us your goals, preferences, and dietary needs", icon: Users, color: "from-pink-400 to-rose-400" },
              { step: 2, title: "AI Creates Magic", desc: "Our AI generates your personalized meal plan", icon: Brain, color: "from-blue-400 to-purple-400" },
              { step: 3, title: "Shop & Enjoy", desc: "Get your shopping list and start cooking", icon: ShoppingCart, color: "from-green-400 to-emerald-400" }
            ].map((item, index) => (
              <div key={index} className="relative group">
                <div className="text-center space-y-6">
                  <div className="relative mx-auto">
                    <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform duration-300`}>
                      <item.icon className="w-10 h-10 text-white" />
                    </div>
                    <div className={`absolute -top-1 -right-1 w-8 h-8 rounded-full border-2 flex items-center justify-center shadow-lg ${isDarkMode ? "bg-gray-700 border-gray-600" : "bg-white border-pink-200"}`}>
                      <span className={`text-base font-black ${isDarkMode ? "text-gray-100" : "text-gray-800"}`}>{item.step}</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <h3 className={`text-2xl font-black ${isDarkMode ? "text-gray-100" : "text-gray-800"}`}>{item.title}</h3>
                    <p className={`text-lg font-medium ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>{item.desc}</p>
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

      {/* Testimonials Section */}
      <section className={`py-20 ${isDarkMode ? "bg-gray-900/70" : "bg-white/70"}`}>
        <div className="container mx-auto px-4">
          <div className="text-center space-y-5 mb-14">
            <h2 className={`text-4xl font-black ${isDarkMode ? "text-gray-100" : "text-gray-800"}`}>Loved by Thousands</h2>
            <p className={`text-xl font-medium ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>See what our community says about Smart Bite</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <div key={index} className={`p-6 rounded-2xl shadow-xl border hover:shadow-2xl transition-all duration-300 hover:scale-105 ${isDarkMode ? "bg-gray-800/90 backdrop-blur-xl border-gray-700" : "bg-white/90 backdrop-blur-xl border-pink-200/50"}`}>
                <div className="space-y-5">
                  <div className="flex gap-1">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className={`text-lg leading-relaxed font-medium ${isDarkMode ? "text-gray-200" : "text-gray-700"}`}>"{testimonial.content}"</p>
                  <div className={`pt-3 border-t ${isDarkMode ? "border-gray-700" : "border-pink-200"}`}>
                    <div className={`font-bold text-base ${isDarkMode ? "text-gray-100" : "text-gray-800"}`}>{testimonial.name}</div>
                    <div className={`text-sm font-medium ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
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
              Join 50,000+ users who've already achieved their nutrition goals with Smart Bite
            </p>

            <div className="flex flex-col sm:flex-row gap-5 justify-center items-center">
              <button
                onClick={() => navigate("/signup")}
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
                <span className="font-bold text-base">7-day free trial</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5" />
                <span className="font-bold text-base">No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                <span className="font-bold text-base">Cancel anytime</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}