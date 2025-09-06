import { useState } from "react";
import { postData } from "../api";

export default function VarietyClusteringForm() {
  const [form, setForm] = useState({
    dietary_preference: "Omnivore",
    activity_level: "High",
    age: 28,
    height: 175,
    weight: 72,
    target_protein: 100,
    target_sugar: 80,
    target_sodium: 2200,
    target_calories: 2500,
    target_carbs: 300,
    target_fiber: 30,
    target_fat: 70,
    days: 7,
    preferred_ingredients: "",
    disease: "",
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
      const res = await postData("/variety_clustering/recommend", form);
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
          className="px-4 py-2 bg-purple-600 text-white rounded-lg"
          disabled={loading}
        >
          {loading ? "Loading..." : "Get Recommendation"}
        </button>
      </form>

      {result && (
        <div className="mt-4 p-4 bg-gray-100 rounded">
          <h2 className="font-bold">Weekly Plan</h2>
          <pre className="text-sm">{JSON.stringify(result.weekly_plan, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
