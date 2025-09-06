import { useState } from "react";
import { postData } from "../api";

export default function NutritionGoalForm() {
  const [form, setForm] = useState({
    dietary_preference: "Vegetarian",
    activity_level: "Moderate",
    age: 30,
    height: 170,
    weight: 70,
    days: 7,
    // optional nutrition targets
    target_calories: "",
    target_protein: "",
    target_carbs: "",
    target_fat: "",
    target_sugar: 150,
    target_sodium: 25,
    target_fiber: 25,
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
    const payload = {
      ...form,
      age: Number(form.age),
      height: Number(form.height),
      weight: Number(form.weight),
      days: Number(form.days),
      target_calories: form.target_calories ? Number(form.target_calories) : undefined,
      target_protein: form.target_protein ? Number(form.target_protein) : undefined,
      target_carbs: form.target_carbs ? Number(form.target_carbs) : undefined,
      target_fat: form.target_fat ? Number(form.target_fat) : undefined,
      target_sugar: Number(form.target_sugar),
      target_sodium: Number(form.target_sodium),
      target_fiber: Number(form.target_fiber),
    };
    const res = await postData("/nutrition_goal/recommend", payload);
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
          {result.predicted_nutrition && (
            <>
              <h2 className="font-bold">Predicted Nutrition</h2>
              <pre className="text-sm">{JSON.stringify(result.predicted_nutrition, null, 2)}</pre>
            </>
          )}
          <h2 className="font-bold">Weekly Totals</h2>
          <pre className="text-sm">{JSON.stringify(result.weekly_totals, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
