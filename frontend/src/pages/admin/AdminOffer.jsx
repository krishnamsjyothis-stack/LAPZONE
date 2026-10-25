
import { useCallback, useEffect, useState } from "react";
import api from "../../api/axios";

const initialFormData = {
  name: "",
  offerType: "PRODUCT",
  productId: "",
  category: "",
  discountType: "PERCENTAGE",
  discountValue: "",
  startDate: "",
  expiryDate: "",
  isActive: true,
};

const AdminOffer = () => {
  // =========================
  // UI STATE
  // =========================

  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [productsLoading, setProductsLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // =========================
  // DATA STATE
  // =========================

  const [offers, setOffers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);

  // =========================
  // MODAL STATE
  // =========================

  const [modal, setModal] = useState({
    open: false,
    title: "",
    message: "",
    type: "info",
    confirmText: "OK",
    onConfirm: null,
  });

  const showModal = (
    title,
    message,
    type = "info",
    onConfirm = null,
    confirmText = "OK"
  ) => {
    setModal({
      open: true,
      title,
      message,
      type,
      confirmText,
      onConfirm,
    });
  };

  const closeModal = () => {
    const action = modal.onConfirm;

    setModal({
      open: false,
      title: "",
      message: "",
      type: "info",
      confirmText: "OK",
      onConfirm: null,
    });

    if (action) {
      action();
    }
  };

  // =========================
  // FORM STATE
  // =========================

  const [formData, setFormData] = useState(initialFormData);

  // =========================
  // AUTH HEADERS
  // =========================

  const getAuthConfig = () => {
    const token = localStorage.getItem("token");

    return {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  };

  // =========================
  // FETCH OFFERS
  // =========================

  const fetchOffers = useCallback(async (showError = true) => {
    try {
      const response = await api.get("/offers", getAuthConfig());

      setOffers(response.data.offers || []);
    } catch (error) {
      console.error("Fetch offers error:", error);

      if (showError) {
        showModal(
          "Unable to Load Offers",
          error.response?.data?.message ||
            "Failed to fetch offers. Please try again.",
          "error"
        );
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // =========================
  // FETCH CATEGORIES
  // =========================

  const fetchCategories = useCallback(async () => {
    try {
      setCategoriesLoading(true);

      const response = await api.get(
        "/categories?page=1&limit=100",
        getAuthConfig()
      );

      setCategories(response.data.categories || []);
    } catch (error) {
      console.error("Fetch categories error:", error);

      showModal(
        "Unable to Load Categories",
        error.response?.data?.message ||
          "Failed to fetch categories. Please try again.",
        "error"
      );
    } finally {
      setCategoriesLoading(false);
    }
  }, []);

  // =========================
  // FETCH PRODUCTS
  // =========================

  const fetchProducts = useCallback(async () => {
    try {
      setProductsLoading(true);

      const response = await api.get(
        "/products?page=1&limit=100",
        getAuthConfig()
      );

      setProducts(response.data.products || []);
    } catch (error) {
      console.error("Fetch products error:", error);

      showModal(
        "Unable to Load Products",
        error.response?.data?.message ||
          "Failed to fetch products. Please try again.",
        "error"
      );
    } finally {
      setProductsLoading(false);
    }
  }, []);

  // =========================
  // LOAD DATA
  // =========================

  useEffect(() => {
    fetchOffers();
    fetchCategories();
    fetchProducts();
  }, [fetchOffers, fetchCategories, fetchProducts]);

  // =========================
  // HANDLE INPUT CHANGE
  // =========================

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name === "offerType") {
      setFormData((previous) => ({
        ...previous,
        offerType: value,
        productId: value === "PRODUCT" ? previous.productId : "",
        category: value === "CATEGORY" ? previous.category : "",
      }));

      return;
    }

    setFormData((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // =========================
  // RESET FORM
  // =========================

  const resetForm = () => {
    setFormData({ ...initialFormData });
    setShowForm(false);
  };

  // =========================
  // CREATE OFFER
  // =========================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (submitting) return;

    // Basic validation
    if (!formData.name.trim()) {
      showModal(
        "Offer Name Required",
        "Please enter an offer name.",
        "warning"
      );
      return;
    }

    if (
      formData.offerType === "PRODUCT" &&
      !formData.productId
    ) {
      showModal(
        "Product Required",
        "Please select a product for this offer.",
        "warning"
      );
      return;
    }

    if (
      formData.offerType === "CATEGORY" &&
      !formData.category
    ) {
      showModal(
        "Category Required",
        "Please select a category for this offer.",
        "warning"
      );
      return;
    }

    const discountValue = Number(formData.discountValue);

    if (
      formData.discountValue === "" ||
      !Number.isFinite(discountValue) ||
      discountValue <= 0
    ) {
      showModal(
        "Invalid Discount",
        "Please enter a discount value greater than zero.",
        "warning"
      );
      return;
    }

    if (
      formData.discountType === "PERCENTAGE" &&
      discountValue > 100
    ) {
      showModal(
        "Invalid Percentage",
        "Percentage discount cannot be more than 100%.",
        "warning"
      );
      return;
    }

    if (!formData.startDate) {
      showModal(
        "Start Date Required",
        "Please select the offer start date.",
        "warning"
      );
      return;
    }

    if (!formData.expiryDate) {
      showModal(
        "Expiry Date Required",
        "Please select the offer expiry date.",
        "warning"
      );
      return;
    }

    if (
      new Date(formData.expiryDate) <=
      new Date(formData.startDate)
    ) {
      showModal(
        "Invalid Date Range",
        "The expiry date must be after the start date.",
        "warning"
      );
      return;
    }

    const data = {
      name: formData.name.trim(),
      offerType: formData.offerType,
      productId:
        formData.offerType === "PRODUCT"
          ? formData.productId
          : null,
      category:
        formData.offerType === "CATEGORY"
          ? formData.category
          : null,
      discountType: formData.discountType,
      discountValue,
      startDate: formData.startDate,
      expiryDate: formData.expiryDate,
      isActive: formData.isActive,
    };

    console.log("Offer data being sent:", data);

    try {
      setSubmitting(true);

      const response = await api.post(
        "/offers",
        data,
        getAuthConfig()
      );

      resetForm();

      // Refresh list before showing success.
      await fetchOffers(false);

      showModal(
        "Offer Created",
        response.data.message || "The offer was created successfully.",
        "success"
      );
    } catch (error) {
      console.error("Create offer error:", error);
      console.error("Backend response:", error.response?.data);

      showModal(
        "Offer Creation Failed",
        error.response?.data?.message ||
          "Failed to create the offer. Please try again.",
        "error"
      );
    } finally {
      setSubmitting(false);
    }
  };

  // =========================
  // DELETE OFFER
  // =========================

  const handleDelete = (offer) => {
    showModal(
      "Delete Offer?",
      `Are you sure you want to delete "${offer.name}"? This action cannot be undone.`,
      "confirm",
      () => confirmDelete(offer._id),
      "DELETE OFFER"
    );
  };

  const confirmDelete = async (id) => {
    if (deleting) return;

    try {
      setDeleting(true);

      const response = await api.delete(
        `/offers/${id}`,
        getAuthConfig()
      );

      await fetchOffers(false);

      showModal(
        "Offer Deleted",
        response.data.message || "The offer was deleted successfully.",
        "success"
      );
    } catch (error) {
      console.error("Delete offer error:", error);

      showModal(
        "Delete Failed",
        error.response?.data?.message ||
          "Failed to delete the offer. Please try again.",
        "error"
      );
    } finally {
      setDeleting(false);
    }
  };

  // =========================
  // FORMAT DATE
  // =========================

  const formatDate = (date) => {
    if (!date) return "-";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "-";
    }

    return parsedDate.toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  // =========================
  // UI
  // =========================

  return (
    <div className="min-h-screen bg-[#202936] p-6 text-white">
      {/* HEADER */}
      <div className="mb-6 flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Offer Management</h1>

        <button
          type="button"
          onClick={() => {
            if (showForm) {
              resetForm();
            } else {
              setShowForm(true);
            }
          }}
          className="rounded-lg bg-[#b51a2b] px-5 py-2 font-semibold hover:bg-[#991827]"
        >
          {showForm ? "CANCEL" : "+ CREATE OFFER"}
        </button>
      </div>

      {/* CREATE OFFER FORM */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="mb-8 rounded-xl border border-[#414d5e] bg-[#293444] p-6"
        >
          <h2 className="mb-6 text-xl font-semibold">
            Create Offer
          </h2>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {/* OFFER NAME */}
            <div>
              <label
                htmlFor="offer-name"
                className="mb-2 block"
              >
                Offer Name
              </label>

              <input
                id="offer-name"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Gaming Laptop Sale"
                maxLength={100}
                required
                className="w-full rounded-lg border border-[#414d5e] bg-[#202936] p-3 outline-none focus:border-[#b51a2b]"
              />
            </div>

            {/* OFFER TYPE */}
            <div>
              <label
                htmlFor="offer-type"
                className="mb-2 block"
              >
                Offer Type
              </label>

              <select
                id="offer-type"
                name="offerType"
                value={formData.offerType}
                onChange={handleChange}
                className="w-full rounded-lg border border-[#414d5e] bg-[#202936] p-3 outline-none focus:border-[#b51a2b]"
              >
                <option value="PRODUCT">Product Offer</option>
                <option value="CATEGORY">Category Offer</option>
              </select>
            </div>

            {/* PRODUCT */}
            {formData.offerType === "PRODUCT" && (
              <div>
                <label
                  htmlFor="offer-product"
                  className="mb-2 block"
                >
                  Product
                </label>

                <select
                  id="offer-product"
                  name="productId"
                  value={formData.productId}
                  onChange={handleChange}
                  required
                  disabled={productsLoading}
                  className="w-full rounded-lg border border-[#414d5e] bg-[#202936] p-3 outline-none focus:border-[#b51a2b] disabled:opacity-60"
                >
                  <option value="">
                    {productsLoading
                      ? "Loading products..."
                      : "Select Product"}
                  </option>

                  {products.map((product) => (
                    <option
                      key={product._id}
                      value={product._id}
                    >
                      {product.name}
                    </option>
                  ))}
                </select>

                <p className="mt-2 text-xs text-gray-400">
                  The selected product's MongoDB ID is submitted.
                </p>
              </div>
            )}

            {/* CATEGORY */}
            {formData.offerType === "CATEGORY" && (
              <div>
                <label
                  htmlFor="offer-category"
                  className="mb-2 block"
                >
                  Category
                </label>

                <select
                  id="offer-category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                  disabled={categoriesLoading}
                  className="w-full rounded-lg border border-[#414d5e] bg-[#202936] p-3 outline-none focus:border-[#b51a2b] disabled:opacity-60"
                >
                  <option value="">
                    {categoriesLoading
                      ? "Loading categories..."
                      : "Select Category"}
                  </option>

                  {categories
                    .filter(
                      (category) => category.isActive !== false
                    )
                    .map((category) => (
                      <option
                        key={category._id}
                        value={category.name}
                      >
                        {category.name}
                      </option>
                    ))}
                </select>
              </div>
            )}

            {/* DISCOUNT TYPE */}
            <div>
              <label
                htmlFor="discount-type"
                className="mb-2 block"
              >
                Discount Type
              </label>

              <select
                id="discount-type"
                name="discountType"
                value={formData.discountType}
                onChange={handleChange}
                className="w-full rounded-lg border border-[#414d5e] bg-[#202936] p-3 outline-none focus:border-[#b51a2b]"
              >
                <option value="PERCENTAGE">Percentage</option>
                <option value="FIXED">Fixed Amount</option>
              </select>
            </div>

            {/* DISCOUNT VALUE */}
            <div>
              <label
                htmlFor="discount-value"
                className="mb-2 block"
              >
                Discount Value
              </label>

              <input
                id="discount-value"
                type="number"
                name="discountValue"
                value={formData.discountValue}
                onChange={handleChange}
                min="0.01"
                max={
                  formData.discountType === "PERCENTAGE"
                    ? "100"
                    : undefined
                }
                step="any"
                required
                placeholder={
                  formData.discountType === "PERCENTAGE"
                    ? "10"
                    : "5000"
                }
                className="w-full rounded-lg border border-[#414d5e] bg-[#202936] p-3 outline-none focus:border-[#b51a2b]"
              />
            </div>

            {/* START DATE */}
            <div>
              <label
                htmlFor="offer-start-date"
                className="mb-2 block"
              >
                Start Date
              </label>

              <input
                id="offer-start-date"
                type="datetime-local"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-[#414d5e] bg-[#202936] p-3 outline-none focus:border-[#b51a2b]"
              />
            </div>

            {/* EXPIRY DATE */}
            <div>
              <label
                htmlFor="offer-expiry-date"
                className="mb-2 block"
              >
                Expiry Date
              </label>

              <input
                id="offer-expiry-date"
                type="datetime-local"
                name="expiryDate"
                value={formData.expiryDate}
                onChange={handleChange}
                min={formData.startDate || undefined}
                required
                className="w-full rounded-lg border border-[#414d5e] bg-[#202936] p-3 outline-none focus:border-[#b51a2b]"
              />
            </div>
          </div>

          {/* ACTIVE */}
          <div className="mt-5 flex items-center gap-3">
            <input
              id="offer-active"
              type="checkbox"
              name="isActive"
              checked={formData.isActive}
              onChange={handleChange}
              className="h-4 w-4 accent-[#b51a2b]"
            />

            <label htmlFor="offer-active">Offer Active</label>
          </div>

          {/* SUBMIT */}
          <button
            type="submit"
            disabled={submitting}
            className="mt-6 rounded-lg bg-[#b51a2b] px-6 py-3 font-semibold hover:bg-[#991827] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "CREATING OFFER..." : "CREATE OFFER"}
          </button>
        </form>
      )}

      {/* OFFERS LIST */}
      <div className="overflow-hidden rounded-xl border border-[#414d5e] bg-[#293444]">
        <div className="flex items-center justify-between border-b border-[#414d5e] p-5">
          <h2 className="text-xl font-semibold">All Offers</h2>

          <button
            type="button"
            onClick={() => fetchOffers()}
            disabled={loading}
            className="rounded-lg border border-[#414d5e] px-4 py-2 text-sm hover:bg-[#202936] disabled:opacity-60"
          >
            {loading ? "Loading..." : "Refresh"}
          </button>
        </div>

        {loading ? (
          <div className="p-6 text-gray-300">
            Loading offers...
          </div>
        ) : offers.length === 0 ? (
          <div className="p-6 text-gray-400">
            No offers found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[#414d5e] text-sm text-gray-300">
                  <th className="p-4">Name</th>
                  <th className="p-4">Type</th>
                  <th className="p-4">Category / Product</th>
                  <th className="p-4">Discount</th>
                  <th className="p-4">Start Date</th>
                  <th className="p-4">Expiry Date</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Action</th>
                </tr>
              </thead>

              <tbody>
                {offers.map((offer) => (
                  <tr
                    key={offer._id}
                    className="border-b border-[#414d5e] last:border-b-0 hover:bg-white/[0.02]"
                  >
                    <td className="p-4">{offer.name}</td>

                    <td className="p-4">
                      {offer.offerType}
                    </td>

                    <td className="p-4">
                      {offer.offerType === "CATEGORY"
                        ? offer.category || "-"
                        : offer.productId?.name || "-"}
                    </td>

                    <td className="p-4">
                      {offer.discountType === "PERCENTAGE"
                        ? `${offer.discountValue}%`
                        : `₹${Number(
                            offer.discountValue
                          ).toLocaleString("en-IN")}`}
                    </td>

                    <td className="whitespace-nowrap p-4">
                      {formatDate(offer.startDate)}
                    </td>

                    <td className="whitespace-nowrap p-4">
                      {formatDate(offer.expiryDate)}
                    </td>

                    <td className="p-4">
                      <span
                        className={
                          offer.isActive
                            ? "font-medium text-green-400"
                            : "font-medium text-red-400"
                        }
                      >
                        {offer.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>

                    <td className="p-4">
                      <button
                        type="button"
                        onClick={() => handleDelete(offer)}
                        disabled={deleting}
                        className="font-medium text-red-400 hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {deleting ? "Please wait..." : "Delete"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CUSTOM MODAL */}
      {modal.open && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 px-4 py-6"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              closeModal();
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="offer-modal-title"
            aria-describedby="offer-modal-message"
            className="w-full max-w-md rounded-xl border border-[#414d5e] bg-[#202936] p-6 shadow-2xl"
          >
            <div
              className={`mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full text-2xl font-bold ${
                modal.type === "success"
                  ? "bg-green-500/15 text-green-400"
                  : modal.type === "error"
                  ? "bg-red-500/15 text-red-400"
                  : modal.type === "warning"
                  ? "bg-yellow-500/15 text-yellow-400"
                  : modal.type === "confirm"
                  ? "bg-red-500/15 text-red-400"
                  : "bg-blue-500/15 text-blue-400"
              }`}
            >
              {modal.type === "success"
                ? "✓"
                : modal.type === "error"
                ? "✕"
                : modal.type === "warning"
                ? "!"
                : modal.type === "confirm"
                ? "?"
                : "i"}
            </div>

            <h3
              id="offer-modal-title"
              className="text-center text-xl font-bold text-white"
            >
              {modal.title}
            </h3>

            <p
              id="offer-modal-message"
              className="mt-3 whitespace-pre-line break-words text-center text-sm leading-6 text-gray-300"
            >
              {modal.message}
            </p>

            <div className="mt-6 flex gap-3">
              {modal.type === "confirm" && (
                <button
                  type="button"
                  onClick={() =>
                    setModal({
                      open: false,
                      title: "",
                      message: "",
                      type: "info",
                      confirmText: "OK",
                      onConfirm: null,
                    })
                  }
                  className="flex-1 rounded-lg border border-[#414d5e] px-4 py-3 text-sm font-semibold text-gray-200 hover:bg-[#293444]"
                >
                  CANCEL
                </button>
              )}

              <button
                type="button"
                onClick={closeModal}
                disabled={deleting && modal.type === "confirm"}
                className={`flex-1 rounded-lg px-4 py-3 text-sm font-bold tracking-wide text-white transition focus:outline-none focus:ring-2 focus:ring-white/70 ${
                  modal.type === "confirm"
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-[#b51a2b] hover:bg-[#991827]"
                }`}
              >
                {modal.confirmText}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOffer;
