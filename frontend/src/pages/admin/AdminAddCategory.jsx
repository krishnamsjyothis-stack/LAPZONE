import { useState } from "react";
import { z } from "zod";
import api from "../../api/axios";

const categorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Category name must be at least 2 characters")
    .max(50, "Category name cannot exceed 50 characters"),
});

function AdminAddCategory() {
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    // Frontend validation
    const result = categorySchema.safeParse({
      name,
    });

    if (!result.success) {
      setError(result.error.issues[0].message);
      return;
    }

    try {
      setLoading(true);

      const response = await api.post("/categories", {
        name: result.data.name,
      });

      setSuccess(
        response.data.message || "Category added successfully"
      );

      setName("");
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to add category"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f5f5] flex items-center justify-center px-6">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-lg p-8">

        <h1 className="text-3xl font-bold text-[#384358] mb-2">
          Add Category
        </h1>

        <p className="text-gray-500 mb-6">
          Create a new laptop category
        </p>

        <form onSubmit={handleSubmit}>

          <label className="block text-sm font-medium text-[#384358] mb-2">
            Category Name
          </label>

          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter category name"
            className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:border-[#b51a2b]"
          />

          {error && (
            <p className="text-red-600 text-sm mt-2">
              {error}
            </p>
          )}

          {success && (
            <p className="text-green-600 text-sm mt-2">
              {success}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-6 bg-[#b51a2b] hover:bg-[#9f1729] text-white py-3 rounded-xl font-semibold disabled:opacity-50"
          >
            {loading ? "ADDING..." : "ADD CATEGORY"}
          </button>

        </form>
      </div>
    </div>
  );
}

export default AdminAddCategory;