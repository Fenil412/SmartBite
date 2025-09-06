import { useState } from "react";
import MealPlanningForm from "../components/MealPlanningForm";
import NutritionGoalForm from "../components/NutritionGoalForm";
import RuleFilteringForm from "../components/RuleFilteringForm";
import VarietyClusteringForm from "../components/VarietyClusteringForm";
import ContentFilteringForm from "../components/ContentFilteringForm";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("meal");

  const tabs = [
    { key: "meal", label: "Meal Planning", component: <MealPlanningForm /> },
    { key: "nutrition", label: "Nutrition Goal", component: <NutritionGoalForm /> },
    { key: "rule", label: "Rule Filtering", component: <RuleFilteringForm /> },
    { key: "variety", label: "Variety Clustering", component: <VarietyClusteringForm /> },
    { key: "content", label: "Content Filtering", component: <ContentFilteringForm /> },
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Diet Recommendation Dashboard</h1>
      <div className="flex gap-2 mb-4">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-lg ${
              activeTab === tab.key ? "bg-blue-500 text-white" : "bg-gray-200"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="p-4 border rounded-lg shadow bg-white">
        {tabs.find((t) => t.key === activeTab)?.component}
      </div>
    </div>
  );
}
