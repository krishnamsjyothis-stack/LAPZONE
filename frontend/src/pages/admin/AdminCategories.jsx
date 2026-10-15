import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";

function AdminCategories() {
  const navigate = useNavigate();

  // ==========================================
  // STATE
  // ==========================================

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [totalCategories, setTotalCategories] = useState(0);
  const [activeCategories, setActiveCategories] = useState(0);
  const [inactiveCategories, setInactiveCategories] = useState(0);

  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  const [categoryName, setCategoryName] = useState("");
  const [description, setDescription] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const limit = 5;

  // ==========================================
  // FETCH CATEGORIES
  // ==========================================

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/categories", {
        params: {
          search,
          page,
          limit,
          sort: "newest",
        },
      });

      const data = response.data;

      setCategories(data.categories || []);

      setTotalPages(data.totalPages || 1);

      setTotalCategories(
        data.totalCategories ||
          data.total ||
          data.categories?.length ||
          0
      );

      const active = (data.categories || []).filter(
        (category) => category.isActive !== false
      ).length;

      const inactive = (data.categories || []).filter(
        (category) => category.isActive === false
      ).length;

      setActiveCategories(active);
      setInactiveCategories(inactive);
    } catch (error) {
      console.error(
        "Failed to fetch categories:",
        error.response?.data || error.message
      );

      setError(
        error.response?.data?.message ||
          "Failed to fetch categories"
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // LOAD CATEGORIES
  // ==========================================

  useEffect(() => {
    fetchCategories();
  }, [page, search]);

  // ==========================================
  // SEARCH
  // ==========================================

  const handleSearch = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  // ==========================================
  // CLEAR SEARCH
  // ==========================================

  const handleClearSearch = () => {
    setSearch("");
    setPage(1);
  };

  // ==========================================
  // OPEN ADD MODAL
  // ==========================================

  const openAddModal = () => {
    setEditingCategory(null);
    setCategoryName("");
    setDescription("");
    setError("");
    setSuccess("");
    setShowModal(true);
  };

  // ==========================================
  // OPEN EDIT MODAL
  // ==========================================

  const openEditModal = (category) => {
    setEditingCategory(category);

    setCategoryName(category.name || "");
    setDescription(category.description || "");

    setError("");
    setSuccess("");

    setShowModal(true);
  };

  // ==========================================
  // CLOSE MODAL
  // ==========================================

  const closeModal = () => {
    setShowModal(false);

    setEditingCategory(null);

    setCategoryName("");
    setDescription("");

    setError("");
    setSuccess("");
  };

  // ==========================================
  // ADD / EDIT CATEGORY
  // ==========================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!categoryName.trim()) {
      setError("Category name is required");
      return;
    }

    try {
      if (editingCategory) {
        await api.put(
          `/categories/${editingCategory._id}`,
          {
            name: categoryName.trim(),
            description: description.trim(),
          }
        );

        setSuccess("Category updated successfully");
      } else {
        await api.post("/categories", {
          name: categoryName.trim(),
          description: description.trim(),
        });

        setSuccess("Category added successfully");
      }

      await fetchCategories();

      setTimeout(() => {
        closeModal();
      }, 700);
    } catch (error) {
      console.error(
        "Category save error:",
        error.response?.data || error.message
      );

      setError(
        error.response?.data?.message ||
          "Failed to save category"
      );
    }
  };

  // ==========================================
  // SOFT DELETE
  // ==========================================

  const handleDelete = async (category) => {
    const confirmed = window.confirm(
      `Are you sure you want to deactivate "${category.name}"?`
    );

    if (!confirmed) return;

    try {
      await api.delete(
        `/categories/${category._id}`
      );

      setSuccess(
        "Category deactivated successfully"
      );

      fetchCategories();
    } catch (error) {
      console.error(
        "Delete category error:",
        error.response?.data || error.message
      );

      setError(
        error.response?.data?.message ||
          "Failed to delete category"
      );
    }
  };

  // ==========================================
  // PAGINATION
  // ==========================================

  const handlePrevious = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };

  const handleNext = () => {
    if (page < totalPages) {
      setPage(page + 1);
    }
  };

  // ==========================================
  // FORMAT PRODUCT COUNT
  // ==========================================

  const getProductCount = (category) => {
    if (typeof category.productCount === "number") {
      return category.productCount;
    }

    if (typeof category.productsCount === "number") {
      return category.productsCount;
    }

    if (Array.isArray(category.products)) {
      return category.products.length;
    }

    return 0;
  };

  // ==========================================
  // LOADING
  // ==========================================

  if (loading && categories.length === 0) {
    return (
      <div className="min-h-screen bg-[#151923] text-white flex items-center justify-center">
        <div className="text-center">

          <div className="w-8 h-8 border-2 border-[#b51a2b] border-t-transparent rounded-full animate-spin mx-auto" />

          <p className="text-xs text-gray-500 mt-4">
            Loading categories...
          </p>

        </div>
      </div>
    );
  }

  // ==========================================
  // MAIN UI
  // ==========================================

  return (
    <div className="min-h-screen bg-[#151923] text-white">

      {/* =================================================
          TOP BAR
      ================================================= */}

      <header className="h-16 bg-[#151923] border-b border-[#2c3340] px-6 flex items-center justify-between">

        {/* SEARCH */}

        <div className="w-[55%] max-w-xl">

          <div className="flex items-center bg-[#202632] border border-[#303847] rounded-lg px-4 py-2.5">

            <span className="text-gray-500 text-sm mr-2">
              ⌕
            </span>

            <input
              type="text"
              placeholder="Search LAPZONE core..."
              className="flex-1 bg-transparent outline-none text-xs text-white placeholder:text-gray-500"
            />

          </div>

        </div>

        {/* ADMIN */}

        <div className="flex items-center gap-4">

          <button
            type="button"
            className="text-gray-400"
          >
            ♧
          </button>

          <div className="text-right">

            <p className="text-xs font-medium text-white">
              Admin User
            </p>

            <p className="text-[9px] text-gray-500">
              System Architect
            </p>

          </div>

          <div className="w-9 h-9 rounded-full bg-[#4a556c] border-2 border-[#69758c] flex items-center justify-center text-xs">
            A
          </div>

        </div>

      </header>

      {/* =================================================
          PAGE CONTENT
      ================================================= */}

      <div className="p-6">

        {/* PAGE HEADER */}

        <div className="flex justify-between items-start">

          <div>

            <div className="text-[9px] uppercase tracking-wide text-gray-500 mb-2">

              Dashboard

              <span className="mx-2">
                /
              </span>

              <span className="text-[#e33445]">
                Categories
              </span>

            </div>

            <h1 className="text-xl font-semibold">
              CATEGORY MANAGEMENT
            </h1>

            <p className="text-xs text-gray-500 mt-2 max-w-2xl">
              Manage product categories available in
              the LAPZONE store. Monitor active categories
              and catalog distribution.
            </p>

          </div>

          <button
            type="button"
            onClick={openAddModal}
            className="bg-[#d92d3d] hover:bg-[#ed3c4c] px-5 py-2.5 rounded-md text-xs font-medium transition flex items-center gap-2"
          >
            <span className="text-base">
              +
            </span>

            ADD NEW CATEGORY
          </button>

        </div>

        {/* =================================================
            SUCCESS / ERROR
        ================================================= */}

        {success && (
          <div className="mt-4 bg-green-500/10 border border-green-500/30 text-green-300 text-xs px-4 py-3 rounded-md">
            {success}
          </div>
        )}

        {error && !showModal && (
          <div className="mt-4 bg-red-500/10 border border-red-500/30 text-red-300 text-xs px-4 py-3 rounded-md">
            {error}
          </div>
        )}

        {/* =================================================
            STAT CARDS
        ================================================= */}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">

          {/* TOTAL */}

          <div className="bg-[#3b465d] rounded-lg p-5">

            <div className="flex justify-between">

              <p className="text-[10px] uppercase tracking-wide text-gray-400">
                Total Categories
              </p>

              <div className="w-7 h-7 rounded bg-[#252d3b] flex items-center justify-center">
                ▦
              </div>

            </div>

            <div className="flex justify-between items-end mt-5">

              <p className="text-2xl font-semibold">
                {totalCategories}
              </p>

              <p className="text-[10px] text-gray-500">
                → Unchanged
              </p>

            </div>

          </div>

          {/* ACTIVE */}

          <div className="bg-[#d8f7e2] text-[#166534] rounded-lg p-5">

            <div className="flex justify-between">

              <p className="text-[10px] uppercase tracking-wide font-medium">
                Active Categories
              </p>

              <div className="w-7 h-7 rounded bg-white/70 flex items-center justify-center">
                ⊕
              </div>

            </div>

            <div className="flex justify-between items-end mt-5">

              <p className="text-2xl font-semibold">
                {activeCategories}
              </p>

              <p className="text-[10px]">

                {totalCategories > 0
                  ? (
                      (activeCategories /
                        totalCategories) *
                      100
                    ).toFixed(1)
                  : 0}
                %

              </p>

            </div>

          </div>

          {/* INACTIVE */}

          <div className="bg-[#f0f3f7] text-[#4b5b72] rounded-lg p-5">

            <div className="flex justify-between">

              <p className="text-[10px] uppercase tracking-wide font-medium">
                Inactive Categories
              </p>

              <div className="w-7 h-7 rounded bg-white flex items-center justify-center">
                ⊘
              </div>

            </div>

            <div className="flex justify-between items-end mt-5">

              <p className="text-2xl font-semibold">
                {inactiveCategories}
              </p>

              <p className="text-[10px]">

                {totalCategories > 0
                  ? (
                      (inactiveCategories /
                        totalCategories) *
                      100
                    ).toFixed(1)
                  : 0}
                %

              </p>

            </div>

          </div>

        </div>

        {/* =================================================
            CATEGORY TABLE
        ================================================= */}

        <div className="mt-6 bg-[#354158] rounded-lg overflow-hidden">

          {/* TABLE CONTROLS */}

          <div className="p-3 flex flex-col md:flex-row gap-3">

            {/* SEARCH */}

            <div className="flex-1 flex items-center bg-[#171d28] rounded-md px-3">

              <span className="text-gray-500 mr-2">
                ⌕
              </span>

              <input
                type="text"
                value={search}
                onChange={handleSearch}
                placeholder="Search categories..."
                className="flex-1 bg-transparent outline-none text-xs text-white placeholder:text-gray-600 py-2.5"
              />

              {search && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="text-gray-500 hover:text-white text-xs"
                >
                  ✕
                </button>
              )}

            </div>

            {/* STATUS */}

            <select
              className="bg-[#171d28] text-gray-400 text-xs rounded-md px-4 py-2 outline-none"
            >

              <option>
                STATUS: ALL
              </option>

              <option>
                ACTIVE
              </option>

              <option>
                INACTIVE
              </option>

            </select>

            {/* SORT */}

            <div className="bg-[#171d28] text-gray-400 text-xs rounded-md px-4 py-2 flex items-center gap-2">
              SORT: NEWEST

              <span>
                ↕
              </span>

            </div>

          </div>

          {/* TABLE */}

          <div className="overflow-x-auto">

            <table className="w-full">

              <thead>

                <tr className="bg-[#354158] text-[9px] uppercase tracking-wide text-gray-400">

                  <th className="text-left px-5 py-4">
                    Category
                  </th>

                  <th className="text-left px-5 py-4">
                    Description
                  </th>

                  <th className="text-left px-5 py-4">
                    Products
                  </th>

                  <th className="text-left px-5 py-4">
                    Status
                  </th>

                  <th className="text-right px-5 py-4">
                    Actions
                  </th>

                </tr>

              </thead>

              <tbody>

                {categories.length === 0 ? (

                  <tr>

                    <td
                      colSpan="5"
                      className="text-center py-12 text-gray-500 text-xs"
                    >
                      No categories found
                    </td>

                  </tr>

                ) : (

                  categories.map((category) => {

                    const active =
                      category.isActive !== false;

                    const productCount =
                      getProductCount(category);

                    return (

                      <tr
                        key={category._id}
                        className="border-t border-[#465168] hover:bg-[#3d4961] transition"
                      >

                        {/* CATEGORY */}

                        <td className="px-5 py-4">

                          <div className="flex items-center gap-3">

                            <div className="w-8 h-8 bg-[#171d28] border border-[#566176] rounded-md flex items-center justify-center text-gray-300">

                              {category.name
                                ?.charAt(0)
                                ?.toUpperCase()}

                            </div>

                            <span
                              className={`text-xs font-medium ${
                                active
                                  ? "text-white"
                                  : "text-gray-500"
                              }`}
                            >
                              {category.name}
                            </span>

                          </div>

                        </td>

                        {/* DESCRIPTION */}

                        <td className="px-5 py-4 max-w-xs">

                          <p className="text-[10px] text-gray-400 truncate">

                            {category.description ||
                              "No description"}

                          </p>

                        </td>

                        {/* PRODUCTS */}

                        <td className="px-5 py-4">

                          <div className="flex items-center gap-3">

                            <div className="w-9 h-1 rounded-full bg-[#171d28] overflow-hidden">

                              <div
                                className="h-full bg-[#e43a4c] rounded-full"
                                style={{
                                  width: `${Math.min(
                                    productCount * 2,
                                    100
                                  )}%`,
                                }}
                              />

                            </div>

                            <span className="text-[10px] text-gray-300">
                              {productCount}
                            </span>

                          </div>

                        </td>

                        {/* STATUS */}

                        <td className="px-5 py-4">

                          {active ? (

                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-400/10 border border-green-300/20 text-[9px] text-green-300">

                              <span className="w-1.5 h-1.5 bg-green-300 rounded-full" />

                              ACTIVE

                            </span>

                          ) : (

                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-500/10 border border-gray-400/20 text-[9px] text-gray-500">

                              <span className="w-1.5 h-1.5 bg-gray-500 rounded-full" />

                              INACTIVE

                            </span>

                          )}

                        </td>

                        {/* ACTIONS */}

                        <td className="px-5 py-4">

                          <div className="flex justify-end gap-4">

                            <button
                              type="button"
                              onClick={() =>
                                openEditModal(category)
                              }
                              className="text-gray-400 hover:text-white text-sm"
                              title="Edit category"
                            >
                              ✎
                            </button>

                            {active && (
                              <button
                                type="button"
                                onClick={() =>
                                  handleDelete(category)
                                }
                                className="text-gray-500 hover:text-[#ff6b78] text-sm"
                                title="Delete category"
                              >
                                ♧
                              </button>
                            )}

                          </div>

                        </td>

                      </tr>

                    );
                  })

                )}

              </tbody>

            </table>

          </div>

          {/* =================================================
              PAGINATION
          ================================================= */}

          <div className="px-5 py-4 border-t border-[#465168] flex items-center justify-between">

            <p className="text-[9px] text-gray-400">

              Showing{" "}

              {categories.length === 0
                ? 0
                : (page - 1) * limit + 1}

              -

              {(page - 1) * limit +
                categories.length}

              {" "}of{" "}

              {totalCategories}

              {" "}categories

            </p>

            <div className="flex items-center gap-2">

              <button
                type="button"
                onClick={handlePrevious}
                disabled={page === 1}
                className="w-7 h-7 rounded text-gray-400 hover:bg-[#465168] disabled:opacity-30"
              >
                ‹
              </button>

              {Array.from(
                { length: totalPages },
                (_, index) => index + 1
              )
                .slice(
                  Math.max(page - 2, 0),
                  Math.min(page + 1, totalPages)
                )
                .map((pageNumber) => (

                  <button
                    key={pageNumber}
                    type="button"
                    onClick={() =>
                      setPage(pageNumber)
                    }
                    className={`w-7 h-7 rounded text-[10px] ${
                      page === pageNumber
                        ? "bg-[#d92d3d] text-white"
                        : "text-gray-400 hover:bg-[#465168]"
                    }`}
                  >
                    {pageNumber}
                  </button>

                ))}

              <button
                type="button"
                onClick={handleNext}
                disabled={page === totalPages}
                className="w-7 h-7 rounded text-gray-400 hover:bg-[#465168] disabled:opacity-30"
              >
                ›
              </button>

            </div>

          </div>

        </div>

      </div>

      {/* =====================================================
          ADD / EDIT CATEGORY MODAL
      ===================================================== */}

      {showModal && (

        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-5">

          <div className="w-full max-w-md bg-[#202632] border border-[#384354] rounded-xl shadow-2xl">

            {/* MODAL HEADER */}

            <div className="px-6 py-5 border-b border-[#343d4c] flex items-center justify-between">

              <div>

                <h2 className="text-lg font-semibold">
                  {editingCategory
                    ? "Edit Category"
                    : "Add New Category"}
                </h2>

                <p className="text-[10px] text-gray-500 mt-1">
                  {editingCategory
                    ? "Update category information"
                    : "Create a new product category"}
                </p>

              </div>

              <button
                type="button"
                onClick={closeModal}
                className="text-gray-500 hover:text-white"
              >
                ✕
              </button>

            </div>

            {/* FORM */}

            <form
              onSubmit={handleSubmit}
              className="p-6"
            >

              {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-300 text-xs px-3 py-2.5 rounded-md mb-4">
                  {error}
                </div>
              )}

              {success && (
                <div className="bg-green-500/10 border border-green-500/20 text-green-300 text-xs px-3 py-2.5 rounded-md mb-4">
                  {success}
                </div>
              )}

              {/* NAME */}

              <label className="block text-xs text-gray-400 mb-2">
                Category Name
              </label>

              <input
                type="text"
                value={categoryName}
                onChange={(e) =>
                  setCategoryName(e.target.value)
                }
                placeholder="Enter category name"
                className="w-full bg-[#171d28] border border-[#343d4c] rounded-md px-4 py-3 text-xs text-white outline-none focus:border-[#b51a2b]"
              />

              {/* DESCRIPTION */}

              <label className="block text-xs text-gray-400 mt-5 mb-2">
                Description
              </label>

              <textarea
                value={description}
                onChange={(e) =>
                  setDescription(e.target.value)
                }
                placeholder="Enter category description"
                rows="4"
                className="w-full bg-[#171d28] border border-[#343d4c] rounded-md px-4 py-3 text-xs text-white outline-none focus:border-[#b51a2b] resize-none"
              />

              {/* BUTTONS */}

              <div className="flex justify-end gap-3 mt-6">

                <button
                  type="button"
                  onClick={closeModal}
                  className="px-5 py-2.5 rounded-md bg-[#30394a] text-xs text-gray-300 hover:bg-[#3a4558]"
                >
                  CANCEL
                </button>

                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-md bg-[#b51a2b] text-xs font-medium text-white hover:bg-[#d92d3d]"
                >
                  {editingCategory
                    ? "UPDATE CATEGORY"
                    : "ADD CATEGORY"}
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  );
}

export default AdminCategories;