
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";

const AdminInventory = () => {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [topSearch, setTopSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [stockFilter, setStockFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);

  const [editingProduct, setEditingProduct] = useState(null);
  const [newStock, setNewStock] = useState("");
  const [updatingStock, setUpdatingStock] = useState(false);

  const [modal, setModal] = useState({
    open: false,
    title: "",
    message: "",
    type: "info",
    onConfirm: null,
  });

  const limit = 10;

  // CUSTOM MODAL
  const showModal = (
    title,
    message,
    type = "info",
    onConfirm = null
  ) => {
    setModal({
      open: true,
      title,
      message,
      type,
      onConfirm,
    });
  };

  const closeModal = () => {
    setModal({
      open: false,
      title: "",
      message: "",
      type: "info",
      onConfirm: null,
    });
  };

  // FETCH INVENTORY
  const fetchInventory = useCallback(
    async (
      searchValue = "",
      page = 1,
      filterValue = "all"
    ) => {
      try {
        setLoading(true);

        const response = await api.get("/admin/inventory", {
          params: {
            search: searchValue.trim(),
            stockFilter: filterValue,
            page,
            limit,
          },
        });

        setProducts(response.data.products || []);

        setCurrentPage(
          response.data.pagination?.currentPage || page
        );

        setTotalPages(
          response.data.pagination?.totalPages || 1
        );

        setTotalProducts(
          response.data.pagination?.totalProducts || 0
        );
      } catch (error) {
        console.error(
          "Fetch inventory error:",
          error.response?.data || error.message
        );

        showModal(
          "Unable to Load Inventory",
          error.response?.data?.message ||
            "Failed to fetch inventory. Please try again.",
          "error"
        );
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // INITIAL LOAD
  useEffect(() => {
    fetchInventory("", 1, "all");
  }, [fetchInventory]);

  // SEARCH
  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchInventory(search, 1, stockFilter);
  };

  const handleTopSearch = (e) => {
    e.preventDefault();
    setSearch(topSearch);
    setCurrentPage(1);
    fetchInventory(topSearch, 1, stockFilter);
  };

  // CLEAR SEARCH
  const handleClear = () => {
    setSearch("");
    setTopSearch("");
    setCurrentPage(1);
    fetchInventory("", 1, stockFilter);
  };

  // STOCK FILTER
  const handleStockFilter = (filter) => {
    setStockFilter(filter);
    setCurrentPage(1);
    fetchInventory(search, 1, filter);
  };

  // PAGINATION
  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;

    setCurrentPage(page);
    fetchInventory(search, page, stockFilter);
  };

  // EDIT STOCK
  const handleEditStock = (product) => {
    setEditingProduct(product);
    setNewStock(String(product.stock ?? ""));
  };

  const handleCloseModal = () => {
    if (updatingStock) return;

    setEditingProduct(null);
    setNewStock("");
  };

  // UPDATE STOCK
  const handleUpdateStock = async () => {
    if (!editingProduct) return;

    if (newStock.trim() === "") {
      showModal(
        "Stock Quantity Required",
        "Please enter a stock quantity.",
        "error"
      );
      return;
    }

    const stockNumber = Number(newStock);

    if (!Number.isInteger(stockNumber) || stockNumber < 0) {
      showModal(
        "Invalid Stock Quantity",
        "Stock must be a non-negative whole number.",
        "error"
      );
      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      setEditingProduct(null);
      navigate("/login");
      return;
    }

    try {
      setUpdatingStock(true);

      await api.patch(
        `/admin/inventory/${editingProduct._id}/stock`,
        { stock: stockNumber },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setEditingProduct(null);
      setNewStock("");

      showModal(
        "Stock Updated",
        "The product stock has been updated successfully.",
        "success"
      );

      await fetchInventory(search, currentPage, stockFilter);
    } catch (error) {
      console.error(
        "Update stock error:",
        error.response?.data || error.message
      );

      showModal(
        "Stock Update Failed",
        error.response?.data?.message ||
          "Failed to update stock. Please try again.",
        "error"
      );
    } finally {
      setUpdatingStock(false);
    }
  };

  // STOCK STATUS
  const getStockStatus = (stock) => {
    if (stock === 0) {
      return {
        text: "OUT OF STOCK",
        className:
          "bg-red-400/10 border border-red-300/20 text-red-300",
      };
    }

    if (stock <= 5) {
      return {
        text: "LOW STOCK",
        className:
          "bg-yellow-400/10 border border-yellow-300/20 text-yellow-300",
      };
    }

    return {
      text: "IN STOCK",
      className:
        "bg-green-400/10 border border-green-300/20 text-green-300",
    };
  };

  // LOADING
  if (loading && products.length === 0) {
    return (
      <div className="min-h-screen bg-[#151923] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[#b51a2b] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-gray-500 mt-4">
            Loading inventory...
          </p>

          {modal.open && (
            <NotificationModal
              modal={modal}
              closeModal={closeModal}
            />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#151923] text-white">
      {/* TOP BAR */}
      <header className="min-h-16 bg-[#151923] border-b border-[#2c3340] px-4 md:px-6 py-3 flex flex-wrap items-center justify-between gap-4">
        <form
          onSubmit={handleTopSearch}
          className="w-full md:w-[55%] max-w-xl"
        >
          <div className="flex items-center bg-[#202632] border border-[#303847] rounded-lg px-4 py-2.5">
            <span className="text-gray-500 text-sm mr-2">
              ⌕
            </span>

            <input
              type="text"
              value={topSearch}
              onChange={(e) => setTopSearch(e.target.value)}
              placeholder="Search LAPZONE inventory..."
              className="flex-1 min-w-0 bg-transparent outline-none text-xs text-white placeholder:text-gray-500"
            />

            {topSearch && (
              <button
                type="button"
                onClick={() => {
                  setTopSearch("");
                  handleClear();
                }}
                className="text-gray-500 hover:text-white text-xs mr-2"
                aria-label="Clear top search"
              >
                ✕
              </button>
            )}

            <button
              type="submit"
              className="text-xs text-[#ffb2b8] hover:text-white"
            >
              Search
            </button>
          </div>
        </form>

        <div className="flex items-center gap-4">
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

      <div className="p-4 md:p-6">
        {/* PAGE HEADER */}
        <div>
          <div className="text-[9px] uppercase tracking-wide text-gray-500 mb-2">
            Dashboard
            <span className="mx-2">/</span>
            <span className="text-[#e33445]">Inventory</span>
          </div>

          <h1 className="text-xl font-semibold">
            INVENTORY MANAGEMENT
          </h1>

          <p className="text-xs text-gray-500 mt-2 max-w-2xl">
            Manage laptop stock levels, monitor availability and
            update inventory quantities.
          </p>
        </div>

        {/* STAT CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="bg-[#3b465d] rounded-lg p-5">
            <p className="text-[10px] uppercase tracking-wide text-gray-400">
              Total Products
            </p>
            <p className="text-2xl font-semibold mt-5">
              {totalProducts}
            </p>
            <p className="text-[10px] text-gray-500 mt-1">
              Inventory items
            </p>
          </div>

          <div className="bg-[#d8f7e2] text-[#166534] rounded-lg p-5">
            <p className="text-[10px] uppercase tracking-wide font-medium">
              In Stock
            </p>
            <p className="text-2xl font-semibold mt-5">
              {products.filter((product) => Number(product.stock) > 5).length}
            </p>
            <p className="text-[10px] mt-1">More than 5 units</p>
          </div>

          <div className="bg-[#f0f3f7] text-[#4b5b72] rounded-lg p-5">
            <p className="text-[10px] uppercase tracking-wide font-medium">
              Low / Out Stock
            </p>
            <p className="text-2xl font-semibold mt-5">
              {products.filter((product) => Number(product.stock) <= 5).length}
            </p>
            <p className="text-[10px] mt-1">5 units or fewer</p>
          </div>
        </div>

        {/* INVENTORY TABLE */}
        <div className="mt-6 bg-[#354158] rounded-lg overflow-hidden">
          {/* CONTROLS */}
          <div className="p-3 flex flex-col md:flex-row gap-3">
            <form
              onSubmit={handleSearch}
              className="flex-1 flex items-center bg-[#171d28] rounded-md px-3"
            >
              <span className="text-gray-500 mr-2">⌕</span>

              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products..."
                className="flex-1 min-w-0 bg-transparent outline-none text-xs text-white placeholder:text-gray-600 py-2.5"
              />

              {search && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="text-gray-500 hover:text-white text-xs ml-2"
                >
                  ✕
                </button>
              )}

              <button
                type="submit"
                className="text-xs text-[#ffb2b8] ml-3"
              >
                Search
              </button>
            </form>

            <select
              value={stockFilter}
              onChange={(e) => handleStockFilter(e.target.value)}
              className="bg-[#171d28] text-gray-400 text-xs rounded-md px-4 py-2 outline-none"
            >
              <option value="all">STOCK: ALL</option>
              <option value="in">IN STOCK</option>
              <option value="low">LOW STOCK</option>
              <option value="out">OUT OF STOCK</option>
            </select>

            <div className="bg-[#171d28] text-gray-400 text-xs rounded-md px-4 py-2 flex items-center">
              SORT: NEWEST
            </div>
          </div>

          {loading && (
            <p className="px-5 py-2 text-xs text-gray-400">
              Refreshing inventory...
            </p>
          )}

          <div className="overflow-x-auto">
            {products.length === 0 ? (
              <div className="p-12 text-center">
                <p className="text-gray-500 text-xs">
                  No products found.
                </p>
              </div>
            ) : (
              <table className="w-full min-w-[950px]">
                <thead>
                  <tr className="bg-[#354158] text-[9px] uppercase tracking-wide text-gray-400">
                    <th className="text-left px-5 py-4">Product</th>
                    <th className="text-left px-5 py-4">Brand</th>
                    <th className="text-left px-5 py-4">Category</th>
                    <th className="text-left px-5 py-4">Price</th>
                    <th className="text-left px-5 py-4">Stock</th>
                    <th className="text-left px-5 py-4">Status</th>
                    <th className="text-right px-5 py-4">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {products.map((product) => {
                    const stock = Number(product.stock || 0);
                    const stockStatus = getStockStatus(stock);

                    const image = product.images?.[0]
                      ? product.images[0].startsWith("http")
                        ? product.images[0]
                        : `${import.meta.env.VITE_BACKEND_URL || "http://localhost:5000"}${image}`
                      : null;

                    return (
                      <tr
                        key={product._id}
                        className="border-t border-[#465168] hover:bg-[#3d4961] transition"
                      >
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
                              <p className="text-xs font-medium text-white truncate">
                                {product.name}
                              </p>
                              <p className="text-[9px] text-gray-500 mt-1">
                                ID: {product._id?.slice(-6)}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-4 text-[10px] text-gray-300">
                          {product.brand || "-"}
                        </td>

                        <td className="px-5 py-4 text-[10px] text-gray-400">
                          {product.category || "-"}
                        </td>

                        <td className="px-5 py-4">
                          <span className="text-xs font-semibold text-[#ffb2b8]">
                            ₹{Number(product.price || 0).toLocaleString("en-IN")}
                          </span>
                        </td>

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
                                  width: `${Math.min(stock * 5, 100)}%`,
                                }}
                              />
                            </div>
                            <span className="text-[10px] text-gray-300">
                              {stock}
                            </span>
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] ${stockStatus.className}`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                stock === 0
                                  ? "bg-red-300"
                                  : stock <= 5
                                  ? "bg-yellow-300"
                                  : "bg-green-300"
                              }`}
                            />
                            {stockStatus.text}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex justify-end">
                            <button
                              type="button"
                              onClick={() => handleEditStock(product)}
                              className="bg-[#b51a2b] hover:bg-[#d92d3d] px-4 py-2 rounded-md text-[10px] font-medium text-white transition"
                            >
                              EDIT STOCK
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {/* PAGINATION */}
          {totalPages > 1 && (
            <div className="px-5 py-4 border-t border-[#465168] flex flex-wrap items-center justify-between gap-3">
              <p className="text-[9px] text-gray-400">
                Showing {(currentPage - 1) * limit + 1}-
                {(currentPage - 1) * limit + products.length} of{" "}
                {totalProducts} products
              </p>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="w-7 h-7 rounded text-gray-400 hover:bg-[#465168] disabled:opacity-30"
                >
                  ‹
                </button>

                {Array.from({ length: totalPages }, (_, index) => index + 1)
                  .slice(
                    Math.max(currentPage - 2, 0),
                    Math.min(currentPage + 1, totalPages)
                  )
                  .map((page) => (
                    <button
                      key={page}
                      type="button"
                      onClick={() => handlePageChange(page)}
                      className={`w-7 h-7 rounded text-[10px] ${
                        currentPage === page
                          ? "bg-[#d92d3d] text-white"
                          : "text-gray-400 hover:bg-[#465168]"
                      }`}
                    >
                      {page}
                    </button>
                  ))}

                <button
                  type="button"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="w-7 h-7 rounded text-gray-400 hover:bg-[#465168] disabled:opacity-30"
                >
                  ›
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* EDIT STOCK MODAL */}
      {editingProduct && (
        <div
          className="fixed inset-0 z-40 bg-black/70 flex items-center justify-center p-5"
          onClick={handleCloseModal}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-stock-title"
            className="w-full max-w-md bg-[#202632] border border-[#384354] rounded-xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-5 border-b border-[#343d4c] flex items-center justify-between">
              <div>
                <h2 id="edit-stock-title" className="text-lg font-semibold text-white">
                  Edit Stock
                </h2>
                <p className="text-[10px] text-gray-500 mt-1">
                  Update product inventory quantity
                </p>
              </div>

              <button
                type="button"
                onClick={handleCloseModal}
                disabled={updatingStock}
                className="text-gray-500 hover:text-white disabled:opacity-50"
                aria-label="Close edit stock modal"
              >
                ✕
              </button>
            </div>

            <div className="p-6">
              <p className="text-xs text-white font-medium">
                {editingProduct.name}
              </p>
              <p className="text-[9px] text-gray-500 mt-1 break-all">
                Product ID: {editingProduct._id}
              </p>

              <div className="bg-[#171d28] border border-[#343d4c] rounded-md p-4 my-5">
                <p className="text-[9px] uppercase tracking-wide text-gray-500">
                  Current Stock
                </p>
                <p className="text-2xl font-semibold text-white mt-1">
                  {editingProduct.stock}
                </p>
              </div>

              <label
                htmlFor="new-stock"
                className="block text-xs text-gray-400 mb-2"
              >
                New Stock Quantity
              </label>

              <input
                id="new-stock"
                type="number"
                min="0"
                step="1"
                value={newStock}
                onChange={(e) => setNewStock(e.target.value)}
                className="w-full bg-[#171d28] border border-[#343d4c] rounded-md px-4 py-3 text-xs text-white outline-none focus:border-[#b51a2b]"
              />

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  disabled={updatingStock}
                  className="px-5 py-2.5 rounded-md bg-[#30394a] text-xs text-gray-300 hover:bg-[#3a4558] disabled:opacity-50"
                >
                  CANCEL
                </button>

                <button
                  type="button"
                  onClick={handleUpdateStock}
                  disabled={updatingStock}
                  className="px-5 py-2.5 rounded-md bg-[#b51a2b] text-xs font-medium text-white hover:bg-[#d92d3d] disabled:opacity-50"
                >
                  {updatingStock ? "UPDATING..." : "UPDATE STOCK"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CUSTOM NOTIFICATION MODAL */}
      {modal.open && (
        <NotificationModal
          modal={modal}
          closeModal={closeModal}
        />
      )}
    </div>
  );
};

// REUSABLE CUSTOM NOTIFICATION MODAL
const NotificationModal = ({ modal, closeModal }) => {
  const handleOk = () => {
    const action = modal.onConfirm;
    closeModal();
    if (action) action();
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4"
      onClick={handleOk}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="inventory-modal-title"
        className="w-full max-w-md rounded-xl border border-[#3c4658] bg-[#202632] p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-4">
          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-xl font-bold ${
              modal.type === "success"
                ? "bg-green-500/15 text-green-400"
                : modal.type === "error"
                ? "bg-red-500/15 text-red-400"
                : "bg-blue-500/15 text-blue-400"
            }`}
          >
            {modal.type === "success"
              ? "✓"
              : modal.type === "error"
              ? "!"
              : "i"}
          </div>

          <div className="min-w-0 flex-1">
            <h2
              id="inventory-modal-title"
              className="text-base font-semibold text-white"
            >
              {modal.title}
            </h2>

            <p className="mt-2 text-sm leading-6 text-gray-400">
              {modal.message}
            </p>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={handleOk}
            className="rounded-md bg-[#b51a2b] px-5 py-2.5 text-xs font-semibold text-white transition hover:bg-[#d92d3d]"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminInventory;
