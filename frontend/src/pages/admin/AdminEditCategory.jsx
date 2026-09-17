import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { z } from "zod";
import api from "../../api/axios";

const categorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Category name must be at least 2 characters")
    .max(50, "Category name cannot exceed 50 characters"),
});

function AdminEditCategory() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Get category details
  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const response = await api.get("/categories");

        const category = response.data.categories.find(
          (item) => item._id === id
        );

        if (!category) {
          setError("Category not found");
          return;
        }

        setName(category.name);
      } catch (error) {
        setError(
          error.response?.data?.message ||
            "Failed to fetch category"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchCategory();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    const result = categorySchema.safeParse({
      name,
    });

    if (!result.success) {
      setError(result.error.issues[0].message);
      return;
    }

    try {
      setSaving(true);

      const response = await api.put(`/categories/${id}`, {
        name: result.data.name,
      });

      setSuccess(
        response.data.message ||
          "Category updated successfully"
      );
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to update category"
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading category...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f5f5] flex items-center justify-center px-6">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-lg p-8">

        <h1 className="text-3xl font-bold text-[#384358] mb-2">
          Edit Category
        </h1>

        <p className="text-gray-500 mb-6">
          Update the category name
        </p>

        <form onSubmit={handleSubmit}>

          <label className="block text-sm font-medium text-[#384358] mb-2">
            Category Name
          </label>

          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
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
            disabled={saving}
            className="w-full mt-6 bg-[#b51a2b] hover:bg-[#9f1729] text-white py-3 rounded-xl font-semibold disabled:opacity-50"
          >
            {saving ? "UPDATING..." : "UPDATE CATEGORY"}
          </button>

          <button
            type="button"
            onClick={() => navigate("/admin/categories")}
            className="w-full mt-3 border border-gray-300 text-[#384358] py-3 rounded-xl font-semibold"
          >
            CANCEL
          </button>

        </form>
      </div>
    </div>
  );
}

export default AdminEditCategory;