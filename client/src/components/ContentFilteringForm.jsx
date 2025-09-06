import { useState } from "react";
import { postData } from "../api";

export default function ContentFilteringForm() {
  const [form, setForm] = useState({
    dietary_preference: "Vegan",
    activity_level: "Moderate",
    age: 26,
    height: 165,
    weight: 60,
    target_protein: 70,
    target_sugar: 80,
    target_sodium: 2000,
    target_calories: 1800,
    target_carbs: 220,
    target_fiber: 25,
    target_fat: 55,
    preferred_ingredients: "tofu, beans",
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
      const res = await postData("/content_filtering/recommend", form);
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
          className="px-4 py-2 bg-pink-600 text-white rounded-lg"
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
