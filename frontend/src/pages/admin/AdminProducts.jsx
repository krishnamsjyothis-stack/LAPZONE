
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";

const BACKEND_URL =
  import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
const LIMIT = 5;

function AdminProducts() {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [statusFilter, setStatusFilter] = useState("ALL");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [notification, setNotification] = useState({
    open: false,
    title: "",
    message: "",
    type: "error",
  });

  // --------------------------------------------------
  // NOTIFICATION MODAL
  // --------------------------------------------------

  const showNotification = (message, type = "error") => {
    setNotification({
      open: true,
      title: type === "success" ? "Success" : "Something went wrong",
      message,
      type,
    });
  };

  const closeNotification = () => {
    setNotification((previous) => ({
      ...previous,
      open: false,
    }));
  };

  // --------------------------------------------------
  // FORMAT CURRENCY
  // --------------------------------------------------

  const formatMoney = (amount = 0) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(Number(amount) || 0);

  // --------------------------------------------------
  // GET PRODUCT IMAGE URL
  // Supports relative paths, full URLs and image objects.
  // --------------------------------------------------

  const getProductImage = (product) => {
    const images = product?.images;

    if (!Array.isArray(images) || images.length === 0) {
      return null;
    }

    const firstImage = images[0];

    const imagePath =
      typeof firstImage === "string"
        ? firstImage
        : firstImage?.url ||
          firstImage?.path ||
          firstImage?.filename;

    if (typeof imagePath !== "string" || !imagePath.trim()) {
      return null;
    }

    const cleanedPath = imagePath.trim();

    // Keep complete URLs unchanged.
    if (/^https?:\/\//i.test(cleanedPath)) {
      return cleanedPath;
    }

    // Normalize a relative path, for example:
    // /uploads/laptop.jpg -> uploads/laptop.jpg
    const normalizedPath = cleanedPath
      .replace(/\\/g, "/")
      .replace(/^\/+/, "");

    return `${BACKEND_URL}/${normalizedPath}`;
  };

  // --------------------------------------------------
  // FETCH PRODUCTS
  // --------------------------------------------------

  const fetchProducts = useCallback(
    async (searchValue = "", page = 1) => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/products", {
          params: {
            search: searchValue,
            page,
            limit: LIMIT,
            sort: "newest",
          },
        });

        const data = response.data || {};
        const fetchedProducts = Array.isArray(data.products)
          ? data.products
          : [];

        setProducts(fetchedProducts);
        setCurrentPage(data.currentPage || page);
        setTotalPages(Math.max(1, Number(data.totalPages) || 1));
        setTotalProducts(
          Number(
            data.totalProducts ??
              data.total ??
              fetchedProducts.length
          )
        );

        // Helpful for checking the image data returned by the API.
        console.log(
          "Product image data:",
          fetchedProducts.map((product) => ({
            name: product.name,
            images: product.images,
          }))
        );
      } catch (err) {
        console.error(
          "Failed to fetch products:",
          err.response?.data || err.message
        );

        setError(
          err.response?.data?.message ||
            "Failed to fetch products. Please try again."
        );
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // --------------------------------------------------
  // INITIAL LOAD
  // --------------------------------------------------

  useEffect(() => {
    fetchProducts("", 1);
  }, [fetchProducts]);

  // --------------------------------------------------
  // SEARCH
  // --------------------------------------------------

  const handleSearch = () => {
    const searchValue = search.trim();
    setCurrentPage(1);
    setSuccess("");
    fetchProducts(searchValue, 1);
  };

  const handleSearchChange = (event) => {
    const value = event.target.value;
    setSearch(value);

    if (value.trim() === "") {
      setCurrentPage(1);
      setSuccess("");
      fetchProducts("", 1);
    }
  };

  const handleClear = () => {
    setSearch("");
    setCurrentPage(1);
    setSuccess("");
    fetchProducts("", 1);
  };

  // --------------------------------------------------
  // DELETE PRODUCT
  // --------------------------------------------------

  const handleDelete = async () => {
    if (!deleteTarget?._id || deleting) return;

    try {
      setDeleting(true);
      setError("");
      setSuccess("");

      await api.delete(`/products/${deleteTarget._id}`);

      const message = "Product deleted successfully.";
      setSuccess(message);
      setDeleteTarget(null);

      showNotification(message, "success");

      const nextPage =
        products.length === 1 && currentPage > 1
          ? currentPage - 1
          : currentPage;

      setCurrentPage(nextPage);
      await fetchProducts(search.trim(), nextPage);
    } catch (err) {
      console.error(
        "Failed to delete product:",
        err.response?.data || err.message
      );

      showNotification(
        err.response?.data?.message ||
          "Failed to delete product. Please try again."
      );
    } finally {
      setDeleting(false);
    }
  };

  // --------------------------------------------------
  // PAGINATION
  // --------------------------------------------------

  const goToPage = (page) => {
    if (page < 1 || page > totalPages || page === currentPage) {
      return;
    }

    setCurrentPage(page);
    fetchProducts(search.trim(), page);
  };

  const handlePrevious = () => goToPage(currentPage - 1);
  const handleNext = () => goToPage(currentPage + 1);

  // --------------------------------------------------
  // FILTER PRODUCTS
  // --------------------------------------------------

  const displayedProducts = products.filter((product) => {
    if (statusFilter === "ACTIVE") {
      return product.isActive !== false;
    }

    if (statusFilter === "INACTIVE") {
      return product.isActive === false;
    }

    return true;
  });

  const activeProducts = products.filter(
    (product) => product.isActive !== false
  ).length;

  const lowStockProducts = products.filter(
    (product) => Number(product.stock ?? 0) <= 5
  ).length;

  // --------------------------------------------------
  // IMAGE FALLBACK
  // --------------------------------------------------

  const handleImageError = (event, product) => {
    console.error("Product image failed to load:", {
      product: product?.name,
      url: event.currentTarget.src,
    });

    // Replace the broken image with a visible placeholder.
    event.currentTarget.style.display = "none";

    const placeholder = event.currentTarget.nextElementSibling;
    if (placeholder) {
      placeholder.classList.remove("hidden");
    }
  };

  // --------------------------------------------------
  // MAIN UI
  // --------------------------------------------------

  return (
    <div className="min-h-screen bg-[#151923] text-white">
      {/* TOP BAR */}
      <header className="flex min-h-16 flex-col justify-between gap-4 border-b border-[#2c3340] bg-[#151923] px-6 py-3 sm:flex-row sm:items-center">
        <div className="w-full max-w-xl">
          <div className="flex items-center rounded-lg border border-[#303847] bg-[#202632] px-4 py-2.5">
            <span className="mr-2 text-sm text-gray-500">⌕</span>

            <input
              type="text"
              value={search}
              onChange={handleSearchChange}
              onKeyDown={(event) => {
                if (event.key === "Enter") handleSearch();
              }}
              placeholder="Search LAPZONE products..."
              aria-label="Search LAPZONE products"
              className="flex-1 bg-transparent text-xs text-white outline-none placeholder:text-gray-500"
            />

            {search && (
              <button
                type="button"
                onClick={handleClear}
                className="ml-2 text-xs text-gray-400 hover:text-white"
                aria-label="Clear search"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center justify-end gap-4">
          <div className="text-right">
            <p className="text-xs font-medium text-white">Admin User</p>
            <p className="text-[9px] text-gray-500">System Architect</p>
          </div>

          <div className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-[#69758c] bg-[#4a556c] text-xs">
            A
          </div>
        </div>
      </header>

      <main className="p-6">
        {/* PAGE HEADER */}
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row">
          <div>
            <div className="mb-2 text-[9px] uppercase tracking-wide text-gray-500">
              Dashboard <span className="mx-2">/</span>
              <span className="text-[#e33445]">Products</span>
            </div>

            <h1 className="text-xl font-semibold">
              PRODUCT MANAGEMENT
            </h1>

            <p className="mt-2 max-w-2xl text-xs text-gray-500">
              Manage laptops available in the LAPZONE store. Monitor
              inventory, pricing and product availability.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate("/admin/products/add")}
            className="flex items-center gap-2 rounded-md bg-[#d92d3d] px-5 py-2.5 text-xs font-medium transition hover:bg-[#ed3c4c]"
          >
            <span className="text-base">+</span>
            ADD NEW PRODUCT
          </button>
        </div>

        {/* SUCCESS MESSAGE */}
        {success && (
          <div className="mt-4 flex items-center justify-between gap-3 rounded-md border border-green-500/30 bg-green-500/10 px-4 py-3 text-xs text-green-300">
            <span>{success}</span>

            <button
              type="button"
              onClick={() => setSuccess("")}
              className="text-green-200 hover:text-white"
              aria-label="Dismiss success message"
            >
              ✕
            </button>
          </div>
        )}

        {/* ERROR MESSAGE */}
        {error && (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-md border border-red-500/30 bg-red-500/10 px-4 py-3 text-xs text-red-300">
            <span>{error}</span>

            <button
              type="button"
              onClick={() => fetchProducts(search.trim(), currentPage)}
              disabled={loading}
              className="underline disabled:opacity-50"
            >
              {loading ? "Loading..." : "Retry"}
            </button>
          </div>
        )}

        {/* SUMMARY CARDS */}
        <section className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-lg bg-[#3b465d] p-5">
            <p className="text-[10px] uppercase tracking-wide text-gray-400">
              Total Products
            </p>
            <div className="mt-5 flex items-end justify-between gap-2">
              <p className="text-2xl font-semibold">{totalProducts}</p>
              <p className="text-[10px] text-gray-500">Products found</p>
            </div>
          </div>

          <div className="rounded-lg bg-[#d8f7e2] p-5 text-[#166534]">
            <p className="text-[10px] font-medium uppercase tracking-wide">
              Active Products
            </p>
            <div className="mt-5 flex items-end justify-between gap-2">
              <p className="text-2xl font-semibold">{activeProducts}</p>
              <p className="text-[10px]">On this page</p>
            </div>
          </div>

          <div className="rounded-lg bg-[#f0f3f7] p-5 text-[#4b5b72]">
            <p className="text-[10px] font-medium uppercase tracking-wide">
              Low Stock
            </p>
            <div className="mt-5 flex items-end justify-between gap-2">
              <p className="text-2xl font-semibold">{lowStockProducts}</p>
              <p className="text-[10px]">5 units or fewer · this page</p>
            </div>
          </div>
        </section>

        {/* PRODUCT TABLE */}
        <section className="mt-6 overflow-hidden rounded-lg bg-[#354158]">
          <div className="flex flex-col gap-3 p-3 md:flex-row">
            <div className="flex flex-1 items-center rounded-md bg-[#171d28] px-3">
              <span className="mr-2 text-gray-500">⌕</span>

              <input
                type="text"
                value={search}
                onChange={handleSearchChange}
                onKeyDown={(event) => {
                  if (event.key === "Enter") handleSearch();
                }}
                placeholder="Search products..."
                aria-label="Search products"
                className="flex-1 bg-transparent py-2.5 text-xs text-white outline-none placeholder:text-gray-600"
              />

              {search && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="text-xs text-gray-400 hover:text-white"
                  aria-label="Clear product search"
                >
                  ✕
                </button>
              )}
            </div>

            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              aria-label="Filter products by status"
              className="rounded-md bg-[#171d28] px-4 py-2 text-xs text-gray-300 outline-none focus:ring-1 focus:ring-[#b51a2b]"
            >
              <option value="ALL">STATUS: ALL</option>
              <option value="ACTIVE">ACTIVE</option>
              <option value="INACTIVE">INACTIVE</option>
            </select>

            <div className="flex items-center gap-2 rounded-md bg-[#171d28] px-4 py-2 text-xs text-gray-400">
              SORT: NEWEST <span>↕</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead>
                <tr className="bg-[#354158] text-left text-[9px] uppercase tracking-wide text-gray-400">
                  <th className="px-5 py-4">Product</th>
                  <th className="px-5 py-4">Brand</th>
                  <th className="px-5 py-4">Category</th>
                  <th className="px-5 py-4">Price</th>
                  <th className="px-5 py-4">Stock</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4 text-right">Actions</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="py-12 text-center text-xs text-gray-400"
                    >
                      Loading products...
                    </td>
                  </tr>
                ) : displayedProducts.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="py-12 text-center text-xs text-gray-400"
                    >
                      {products.length === 0
                        ? "No products found."
                        : "No products match this status filter."}
                    </td>
                  </tr>
                ) : (
                  displayedProducts.map((product) => {
                    const active = product.isActive !== false;
                    const image = getProductImage(product);
                    const stock = Number(product.stock ?? 0);

                    return (
                      <tr
                        key={product._id}
                        className="border-t border-[#465168] transition hover:bg-[#3d4961]"
                      >
                        {/* PRODUCT IMAGE */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-md bg-[#171d28]">
                              {image && (
                                <img
                                  src={image}
                                  alt={product.name || "Laptop product"}
                                  loading="lazy"
                                  className="h-full w-full object-contain"
                                  onError={(event) =>
                                    handleImageError(event, product)
                                  }
                                />
                              )}

                              <span
                                className={`absolute inset-0 flex items-center justify-center bg-[#171d28] text-center text-[8px] text-gray-500 ${
                                  image ? "hidden" : ""
                                }`}
                              >
                                NO IMAGE
                              </span>
                            </div>

                            <div className="max-w-[180px]">
                              <p
                                className={`truncate text-xs font-medium ${
                                  active ? "text-white" : "text-gray-500"
                                }`}
                              >
                                {product.name || "Unnamed product"}
                              </p>

                              <p className="mt-1 text-[9px] text-gray-500">
                                ID: {product._id?.slice(-6) || "—"}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-4 text-[10px] text-gray-300">
                          {product.brand || "—"}
                        </td>

                        <td className="px-5 py-4 text-[10px] text-gray-400">
                          {typeof product.category === "object"
                            ? product.category?.name || "—"
                            : product.category || "—"}
                        </td>

                        <td className="whitespace-nowrap px-5 py-4 text-xs font-semibold text-[#ffb2b8]">
                          {formatMoney(product.price)}
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <div className="h-1 w-10 overflow-hidden rounded-full bg-[#171d28]">
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
                                    Math.max(stock, 0) * 5,
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

                        <td className="px-5 py-4">
                          {active ? (
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-green-300/20 bg-green-400/10 px-3 py-1 text-[9px] text-green-300">
                              <span className="h-1.5 w-1.5 rounded-full bg-green-300" />
                              ACTIVE
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-gray-400/20 bg-gray-500/10 px-3 py-1 text-[9px] text-gray-400">
                              <span className="h-1.5 w-1.5 rounded-full bg-gray-500" />
                              INACTIVE
                            </span>
                          )}
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex justify-end gap-4">
                            <button
                              type="button"
                              onClick={() =>
                                navigate(
                                  `/admin/products/edit/${product._id}`
                                )
                              }
                              className="text-sm text-gray-400 hover:text-white"
                              title="Edit product"
                              aria-label={`Edit ${product.name}`}
                            >
                              ✎
                            </button>

                            <button
                              type="button"
                              onClick={() => setDeleteTarget(product)}
                              disabled={deleting}
                              className="text-sm text-gray-400 hover:text-[#ff6b78] disabled:opacity-50"
                              title="Delete product"
                              aria-label={`Delete ${product.name}`}
                            >
                              🗑
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* PAGINATION */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#465168] px-5 py-4">
            <p className="text-[9px] text-gray-400">
              Showing{" "}
              {products.length === 0
                ? 0
                : (currentPage - 1) * LIMIT + 1}
              {" - "}
              {(currentPage - 1) * LIMIT + products.length}
              {" of "}
              {totalProducts} products
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrevious}
                disabled={currentPage <= 1 || loading}
                className="h-8 w-8 rounded text-gray-400 hover:bg-[#465168] disabled:cursor-not-allowed disabled:opacity-30"
                aria-label="Previous page"
              >
                ‹
              </button>

              {Array.from(
                { length: Math.min(totalPages, 5) },
                (_, index) => {
                  const startPage = Math.max(
                    1,
                    Math.min(currentPage - 2, totalPages - 4)
                  );

                  return startPage + index;
                }
              ).map((pageNumber) => (
                <button
                  key={pageNumber}
                  type="button"
                  onClick={() => goToPage(pageNumber)}
                  disabled={loading}
                  className={`h-8 w-8 rounded text-[10px] ${
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
                disabled={currentPage >= totalPages || loading}
                className="h-8 w-8 rounded text-gray-400 hover:bg-[#465168] disabled:cursor-not-allowed disabled:opacity-30"
                aria-label="Next page"
              >
                ›
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* DELETE CONFIRMATION MODAL */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="delete-product-title"
            className="w-full max-w-md rounded-2xl border border-[#414d5e] bg-[#293444] p-6 shadow-2xl"
          >
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-500/15 text-xl text-red-400">
              !
            </div>

            <h2
              id="delete-product-title"
              className="text-lg font-semibold"
            >
              Delete product?
            </h2>

            <p className="mt-2 text-sm leading-6 text-gray-300">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-white">
                {deleteTarget.name || "this product"}
              </span>
              ? This action cannot be undone.
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
                className="rounded-lg border border-[#414d5e] px-4 py-2.5 text-sm text-gray-300 hover:bg-[#354158] disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="rounded-lg bg-[#b51a2b] px-4 py-2.5 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {deleting ? "Deleting..." : "Delete product"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* NOTIFICATION MODAL */}
      {notification.open && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4">
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="product-notification-title"
            aria-describedby="product-notification-message"
            className="w-full max-w-md rounded-2xl border border-[#414d5e] bg-[#293444] p-6 shadow-2xl"
          >
            <div
              className={`mb-4 flex h-12 w-12 items-center justify-center rounded-full text-xl ${
                notification.type === "success"
                  ? "bg-green-500/15 text-green-400"
                  : "bg-red-500/15 text-red-400"
              }`}
            >
              {notification.type === "success" ? "✓" : "!"}
            </div>

            <h2
              id="product-notification-title"
              className="text-lg font-semibold"
            >
              {notification.title}
            </h2>

            <p
              id="product-notification-message"
              className="mt-2 text-sm leading-6 text-gray-300"
            >
              {notification.message}
            </p>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={closeNotification}
                autoFocus
                className="rounded-lg bg-[#b51a2b] px-5 py-2.5 text-sm font-medium transition hover:bg-red-700"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminProducts;
