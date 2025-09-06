import { useState } from "react";
import { postData } from "../api";

export default function RuleFilteringForm() {
  const [form, setForm] = useState({
    dietary_preference: "Keto",
    activity_level: "Low",
    age: 35,
    height: 180,
    weight: 80,
    target_protein: 90,
    target_sugar: 50,
    target_sodium: 2000,
    target_calories: 2200,
    target_carbs: 50,
    target_fiber: 25,
    target_fat: 120,
    preferred_ingredients: "chicken, avocado",
    disease: "Diabetes",
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
      const res = await postData("/rule_filtering/recommend", form);
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
          className="px-4 py-2 bg-blue-600 text-white rounded-lg"
          disabled={loading}
        >
          {loading ? "Loading..." : "Get Recommendation"}
        </button>
      </form>

      {result && (
        <div className="mt-4 p-4 bg-gray-100 rounded">
          <h2 className="font-bold">Recommendation</h2>
          <pre className="text-sm">{JSON.stringify(result.recommendation, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
