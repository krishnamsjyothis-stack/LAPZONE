import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";

function AdminProducts() {
  const navigate = useNavigate();

  // ==========================================
  // STATE
  // ==========================================

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const limit = 5;

  // ==========================================
  // FETCH PRODUCTS
  // ==========================================

  const fetchProducts = async (searchValue = "", page = 1) => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/products", {
        params: {
          search: searchValue,
          page,
          limit,
          sort: "newest",
        },
      });

      const data = response.data;

      setProducts(data.products || []);

      setCurrentPage(data.currentPage || page);

      setTotalPages(data.totalPages || 1);

      setTotalProducts(
        data.totalProducts ||
          data.total ||
          data.products?.length ||
          0
      );
    } catch (error) {
      console.error(
        "Failed to fetch products:",
        error.response?.data || error.message
      );

      setError(
        error.response?.data?.message ||
          "Failed to fetch products"
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // INITIAL LOAD
  // ==========================================

  useEffect(() => {
    fetchProducts("", 1);
  }, []);

  // ==========================================
  // SEARCH INPUT
  // ==========================================

const handleSearchChange = (e) => {
  const value = e.target.value;

  setSearch(value);

  // If search is cleared, immediately load all products
  if (value.trim() === "") {
    setCurrentPage(1);
    fetchProducts("", 1);
  }
};

  // ==========================================
  // SEARCH
  // ==========================================

const handleSearch = () => {
  const searchValue = search.trim();

  setCurrentPage(1);
  fetchProducts(searchValue, 1);
};

  // ==========================================
  // CLEAR SEARCH
  // ==========================================

const handleClear = () => {
  setSearch("");
  setCurrentPage(1);
  fetchProducts("", 1);
};

  // ==========================================
  // DELETE PRODUCT
  // ==========================================

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this product?"
    );

    if (!confirmed) {
      return;
    }

    try {
      await api.delete(`/products/${id}`);

      setSuccess("Product deleted successfully");

      fetchProducts(search, currentPage);
    } catch (error) {
      console.error(
        "Failed to delete product:",
        error.response?.data || error.message
      );

      setError(
        error.response?.data?.message ||
          "Failed to delete product"
      );
    }
  };

  // ==========================================
  // PREVIOUS PAGE
  // ==========================================

  const handlePrevious = () => {
    if (currentPage > 1) {
      const newPage = currentPage - 1;

      setCurrentPage(newPage);

      fetchProducts(search, newPage);
    }
  };

  // ==========================================
  // NEXT PAGE
  // ==========================================

  const handleNext = () => {
    if (currentPage < totalPages) {
      const newPage = currentPage + 1;

      setCurrentPage(newPage);

      fetchProducts(search, newPage);
    }
  };

  // ==========================================
  // PRODUCT IMAGE
  // ==========================================

  const getProductImage = (product) => {
    if (
      product.images &&
      product.images.length > 0
    ) {
      return `http://localhost:5000${product.images[0]}`;
    }

    return null;
  };

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
  value={search}
  onChange={handleSearchChange}
  onKeyDown={(e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  }}
  placeholder="Search LAPZONE products..."
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
          CONTENT
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
                Products
              </span>

            </div>

            <h1 className="text-xl font-semibold">
              PRODUCT MANAGEMENT
            </h1>

            <p className="text-xs text-gray-500 mt-2 max-w-2xl">
              Manage laptops available in the
              LAPZONE store. Monitor inventory,
              pricing and product availability.
            </p>

          </div>

          {/* ADD PRODUCT */}

          <button
            type="button"
            onClick={() =>
              navigate("/admin/products/add")
            }
            className="bg-[#d92d3d] hover:bg-[#ed3c4c] px-5 py-2.5 rounded-md text-xs font-medium transition flex items-center gap-2"
          >
            <span className="text-base">
              +
            </span>

            ADD NEW PRODUCT
          </button>

        </div>

        {/* SUCCESS */}

        {success && (
          <div className="mt-4 bg-green-500/10 border border-green-500/30 text-green-300 text-xs px-4 py-3 rounded-md">
            {success}
          </div>
        )}

        {/* ERROR */}

        {error && (
          <div className="mt-4 bg-red-500/10 border border-red-500/30 text-red-300 text-xs px-4 py-3 rounded-md">
            {error}
          </div>
        )}

        {/* =================================================
            STAT CARDS
        ================================================= */}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">

          {/* TOTAL PRODUCTS */}

          <div className="bg-[#3b465d] rounded-lg p-5">

            <div className="flex justify-between">

              <p className="text-[10px] uppercase tracking-wide text-gray-400">
                Total Products
              </p>

              <div className="w-7 h-7 rounded bg-[#252d3b] flex items-center justify-center">
                ▦
              </div>

            </div>

            <div className="flex justify-between items-end mt-5">

              <p className="text-2xl font-semibold">
                {totalProducts}
              </p>

              <p className="text-[10px] text-gray-500">
                Latest products
              </p>

            </div>

          </div>

          {/* ACTIVE PRODUCTS */}

          <div className="bg-[#d8f7e2] text-[#166534] rounded-lg p-5">

            <div className="flex justify-between">

              <p className="text-[10px] uppercase tracking-wide font-medium">
                Active Products
              </p>

              <div className="w-7 h-7 rounded bg-white/70 flex items-center justify-center">
                ⊕
              </div>

            </div>

            <div className="flex justify-between items-end mt-5">

              <p className="text-2xl font-semibold">
                {
                  products.filter(
                    (product) =>
                      product.isActive !== false
                  ).length
                }
              </p>

              <p className="text-[10px]">
                Available
              </p>

            </div>

          </div>

          {/* LOW STOCK */}

          <div className="bg-[#f0f3f7] text-[#4b5b72] rounded-lg p-5">

            <div className="flex justify-between">

              <p className="text-[10px] uppercase tracking-wide font-medium">
                Low Stock
              </p>

              <div className="w-7 h-7 rounded bg-white flex items-center justify-center">
                !
              </div>

            </div>

            <div className="flex justify-between items-end mt-5">

              <p className="text-2xl font-semibold">
                {
                  products.filter(
                    (product) =>
                      Number(product.stock) <= 5
                  ).length
                }
              </p>

              <p className="text-[10px]">
                ≤ 5 units
              </p>

            </div>

          </div>

        </div>

        {/* =================================================
            PRODUCT TABLE
        ================================================= */}

        <div className="mt-6 bg-[#354158] rounded-lg overflow-hidden">

          {/* CONTROLS */}

          <div className="p-3 flex flex-col md:flex-row gap-3">

            {/* SEARCH */}

            <div className="flex-1 flex items-center bg-[#171d28] rounded-md px-3">

              <span className="text-gray-500 mr-2">
                ⌕
              </span>

              <input
                type="text"
                value={search}
                onChange={handleSearchChange}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSearch();
                  }
                }}
                placeholder="Search products..."
                className="flex-1 bg-transparent outline-none text-xs text-white placeholder:text-gray-600 py-2.5"
              />

              {search && (
                <button
                  type="button"
                  onClick={handleClear}
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

            <table className="w-full min-w-[900px]">

              <thead>

                <tr className="bg-[#354158] text-[9px] uppercase tracking-wide text-gray-400">

                  <th className="text-left px-5 py-4">
                    Product
                  </th>

                  <th className="text-left px-5 py-4">
                    Brand
                  </th>

                  <th className="text-left px-5 py-4">
                    Category
                  </th>

                  <th className="text-left px-5 py-4">
                    Price
                  </th>

                  <th className="text-left px-5 py-4">
                    Stock
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

                {products.length === 0 ? (

                  <tr>

                    <td
                      colSpan="7"
                      className="text-center py-12 text-gray-500 text-xs"
                    >
                      No products found
                    </td>

                  </tr>

                ) : (

                  products.map((product) => {

                    const active =
                      product.isActive !== false;

                    const image =
                      getProductImage(product);

                    const stock =
                      Number(product.stock || 0);

                    return (

                      <tr
                        key={product._id}
                        className="border-t border-[#465168] hover:bg-[#3d4961] transition"
                      >

                        {/* PRODUCT */}

                        <td className="px-5 py-4">

                          <div className="flex items-center gap-3">

                            <div className="w-12 h-10 bg-[#171d28] rounded-md overflow-hidden flex items-center justify-center">

                              {image ? (

                                <img
                                  src={image}
                                  alt={product.name}
                                  className="w-full h-full object-contain"
                                />

                              ) : (

                                <span className="text-[8px] text-gray-600">
                                  NO IMAGE
                                </span>

                              )}

                            </div>

                            <div className="max-w-[180px]">

                              <p
                                className={`text-xs font-medium truncate ${
                                  active
                                    ? "text-white"
                                    : "text-gray-500"
                                }`}
                              >
                                {product.name}
                              </p>

                              <p className="text-[9px] text-gray-500 mt-1">
                                ID: {product._id?.slice(-6)}
                              </p>

                            </div>

                          </div>

                        </td>

                        {/* BRAND */}

                        <td className="px-5 py-4">

                          <span className="text-[10px] text-gray-300">
                            {product.brand || "-"}
                          </span>

                        </td>

                        {/* CATEGORY */}

                        <td className="px-5 py-4">

                          <span className="text-[10px] text-gray-400">
                            {product.category || "-"}
                          </span>

                        </td>

                        {/* PRICE */}

                        <td className="px-5 py-4">

                          <span className="text-xs font-semibold text-[#ffb2b8]">
                            ₹
                            {Number(
                              product.price || 0
                            ).toLocaleString("en-IN")}
                          </span>

                        </td>

                        {/* STOCK */}

                        <td className="px-5 py-4">

                          <div className="flex items-center gap-2">

                            <div className="w-10 h-1 bg-[#171d28] rounded-full overflow-hidden">

                              <div
                                className={`h-full rounded-full ${
                                  stock === 0
                                    ? "bg-red-500"
                                    : stock <= 5
                                    ? "bg-yellow-400"
                                    : "bg-green-400"
                                }`}
                                style={{
                                  width: `${Math.min(
                                    stock * 5,
                                    100
                                  )}%`,
                                }}
                              />

                            </div>

                            <span className="text-[10px] text-gray-300">
                              {stock}
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

                            {/* EDIT */}

                            <button
                              type="button"
                              onClick={() =>
                                navigate(
                                  `/admin/products/edit/${product._id}`
                                )
                              }
                              className="text-gray-400 hover:text-white text-sm"
                              title="Edit product"
                            >
                              ✎
                            </button>

                            {/* DELETE */}

                            {active && (

                              <button
                                type="button"
                                onClick={() =>
                                  handleDelete(
                                    product._id
                                  )
                                }
                                className="text-gray-500 hover:text-[#ff6b78] text-sm"
                                title="Delete product"
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

              {products.length === 0
                ? 0
                : (currentPage - 1) * limit + 1}

              -

              {(currentPage - 1) * limit +
                products.length}

              {" "}of{" "}

              {totalProducts}

              {" "}products

            </p>

            <div className="flex items-center gap-2">

              <button
                type="button"
                onClick={handlePrevious}
                disabled={currentPage === 1}
                className="w-7 h-7 rounded text-gray-400 hover:bg-[#465168] disabled:opacity-30"
              >
                ‹
              </button>

              {Array.from(
                { length: totalPages },
                (_, index) => index + 1
              )
                .slice(
                  Math.max(
                    currentPage - 2,
                    0
                  ),
                  Math.min(
                    currentPage + 1,
                    totalPages
                  )
                )
                .map((pageNumber) => (

                  <button
                    key={pageNumber}
                    type="button"
                    onClick={() => {
                      setCurrentPage(
                        pageNumber
                      );

                      fetchProducts(
                        search,
                        pageNumber
                      );
                    }}
                    className={`w-7 h-7 rounded text-[10px] ${
                      currentPage === pageNumber
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
                disabled={
                  currentPage === totalPages
                }
                className="w-7 h-7 rounded text-gray-400 hover:bg-[#465168] disabled:opacity-30"
              >
                ›
              </button>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}

export default AdminProducts;