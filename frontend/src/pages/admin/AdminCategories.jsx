import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";

function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const navigate = useNavigate();

  const limit = 5;

  // Fetch categories from backend
  const fetchCategories = async (searchValue = "", page = 1) => {
    try {
      setLoading(true);

      const response = await api.get("/categories", {
        params: {
          search: searchValue,
          page,
          limit,
        },
      });

      setCategories(response.data.categories || []);
      setCurrentPage(response.data.currentPage || 1);
      setTotalPages(response.data.totalPages || 1);
    } catch (error) {
      console.error(
        "Failed to fetch categories:",
        error.response?.data || error.message
      );
    } finally {
      setLoading(false);
    }
  };

  // Load categories when page opens
  useEffect(() => {
    fetchCategories("", 1);
  }, []);

  // Only update input while typing
  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };

  // Search button
  const handleSearch = () => {
    setCurrentPage(1);
    fetchCategories(search, 1);
  };

  // Clear button
  const handleClear = () => {
    setSearch("");
    setCurrentPage(1);
    fetchCategories("", 1);
  };
  const handleDelete = async (id) => {
  const confirmed = window.confirm(
    "Are you sure you want to delete this category?"
  );

  if (!confirmed) {
    return;
  }

  try {
    await api.delete(`/categories/${id}`);

    alert("Category deleted successfully");

    fetchCategories(search, currentPage);
  } catch (error) {
    console.error(
      "Failed to delete category:",
      error.response?.data || error.message
    );

    alert(
      error.response?.data?.message ||
        "Failed to delete category"
    );
  }
};

  // Previous page
  const handlePrevious = () => {
    if (currentPage > 1) {
      const newPage = currentPage - 1;

      setCurrentPage(newPage);
      fetchCategories(search, newPage);
    }
  };

  // Next page
  const handleNext = () => {
    if (currentPage < totalPages) {
      const newPage = currentPage + 1;

      setCurrentPage(newPage);
      fetchCategories(search, newPage);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f5f5] p-8">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[#384358]">
            Category Management
          </h1>

          <p className="text-gray-500 mt-1">
            Manage LAPZONE categories
          </p>
        </div>

        <button
          onClick={() => navigate("/admin/categories/add")}
          className="bg-[#b51a2b] hover:bg-[#9f1729] text-white px-6 py-3 rounded-xl font-semibold"
        >
          + Add Category
        </button>
      </div>

      {/* SEARCH */}
      <div className="bg-white rounded-2xl shadow p-5 mb-6">
        <div className="flex gap-3">

          <input
            type="text"
            value={search}
            onChange={handleSearchChange}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSearch();
              }
            }}
            placeholder="Search category..."
            className="flex-1 border border-gray-300 rounded-xl px-4 py-3 outline-none focus:border-[#b51a2b]"
          />

          <button
            onClick={handleSearch}
            className="bg-[#384358] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#2d3545]"
          >
            Search
          </button>

          <button
            onClick={handleClear}
            className="border border-gray-300 text-[#384358] px-6 py-3 rounded-xl font-semibold hover:bg-gray-100"
          >
            Clear
          </button>

        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-2xl shadow overflow-hidden">

        {loading ? (
          <div className="text-center py-10">
            <p className="text-gray-500">
              Loading categories...
            </p>
          </div>
        ) : (
          <>
            <table className="w-full">

              <thead className="bg-[#384358] text-white">
                <tr>
                  <th className="text-left px-6 py-4">
                    Category Name
                  </th>

                  <th className="text-left px-6 py-4">
                    Status
                  </th>

                  <th className="text-left px-6 py-4">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>
                {categories.length === 0 ? (
                  <tr>
                    <td
                      colSpan="3"
                      className="text-center py-8 text-gray-500"
                    >
                      No categories found
                    </td>
                  </tr>
                ) : (
                  categories.map((category) => (
                    <tr
                      key={category._id}
                      className="border-b"
                    >
                      <td className="px-6 py-4 font-medium text-[#384358]">
                        {category.name}
                      </td>

                      <td className="px-6 py-4">
                        {category.isActive ? (
                          <span className="text-green-600 font-medium">
                            Active
                          </span>
                        ) : (
                          <span className="text-red-600 font-medium">
                            Inactive
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex gap-4">

  <button
    onClick={() =>
      navigate(
        `/admin/categories/edit/${category._id}`
      )
    }
    className="text-blue-600 hover:text-blue-800 font-medium"
  >
    Edit
  </button>

  <button
    onClick={() => handleDelete(category._id)}
    className="text-red-600 hover:text-red-800 font-medium"
  >
    Delete
  </button>

</div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>

            </table>

            {/* PAGINATION */}
            <div className="flex items-center justify-between px-6 py-5 border-t">

              <button
                onClick={handlePrevious}
                disabled={currentPage === 1}
                className="px-5 py-2 border rounded-lg font-medium disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Previous
              </button>

              <p className="text-gray-600 font-medium">
                Page {currentPage} of {totalPages}
              </p>

              <button
                onClick={handleNext}
                disabled={currentPage === totalPages}
                className="px-5 py-2 border rounded-lg font-medium disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Next
              </button>

            </div>
          </>
        )}

      </div>
    </div>
  );
}

export default AdminCategories;