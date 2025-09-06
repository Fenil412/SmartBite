import { useState } from "react";
import { postData } from "../api";

export default function MealPlanningForm() {
  const [form, setForm] = useState({
    dietary_preference: "Vegan",
    activity_level: "High",
    target_calories: 2000,
    target_protein: 70,
    target_carbs: 250,
    target_fat: 60,
    target_sugar: 100,
    target_sodium: 2000,
    target_fiber: 30,
    days: 7,
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await postData("/meal_planning/recommend", form);
      setResult(res);
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <form onSubmit={handleSubmit} className="space-y-2">
        {Object.keys(form).map((key) => (
          <div key={key}>
            <label className="block capitalize">{key.replace(/_/g, " ")}</label>
            <input
              type="text"
              name={key}
              value={form[key]}
              onChange={handleChange}
              className="w-full border p-2 rounded"
            />
          </div>
        ))}
        <button
          type="submit"
          className="px-4 py-2 bg-green-600 text-white rounded-lg"
          disabled={loading}
        >
          {loading ? "Loading..." : "Get Recommendation"}
        </button>
      </form>

      {result && (
        <div className="mt-4 p-4 bg-gray-100 rounded">
          <h2 className="font-bold">Weekly Totals</h2>
          <pre className="text-sm">{JSON.stringify(result.weekly_totals, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
