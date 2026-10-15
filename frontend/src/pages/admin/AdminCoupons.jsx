
import { useCallback, useEffect, useState } from "react";
import api from "../../api/axios";
import AdminSidebar from "../../components/AdminSidebar";

const AdminCoupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [creating, setCreating] = useState(false);

  const [form, setForm] = useState({
    code: "",
    discountType: "PERCENTAGE",
    discountValue: "",
    minimumOrderAmount: "",
    maximumDiscount: "",
    usageLimit: "",
    startDate: "",
    expiryDate: "",
  });

  // ==========================================
  // FETCH COUPONS
  // ==========================================

  const fetchCoupons = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMessage("");

      // Admin authentication uses the session cookie.
      // Axios already has withCredentials: true.
      const response = await api.get("/coupon");

      setCoupons(response.data.coupons || []);
    } catch (error) {
      console.error(
        "Fetch coupons error:",
        error.response?.data || error.message
      );

      setErrorMessage(
        error.response?.data?.message ||
          "Failed to load coupons. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // ==========================================
  // FETCH ORDERS
  // ==========================================

  const fetchOrders = useCallback(async () => {
    try {
      const response = await api.get(
        "/admin/orders?limit=1000"
      );

      setOrders(response.data.orders || []);
    } catch (error) {
      console.error(
        "Fetch orders error:",
        error.response?.data || error.message
      );
    }
  }, []);

  useEffect(() => {
    fetchCoupons();
    fetchOrders();
  }, [fetchCoupons, fetchOrders]);

  // ==========================================
  // FORM CHANGE
  // ==========================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // ==========================================
  // RESET FORM
  // ==========================================

  const resetForm = () => {
    setForm({
      code: "",
      discountType: "PERCENTAGE",
      discountValue: "",
      minimumOrderAmount: "",
      maximumDiscount: "",
      usageLimit: "",
      startDate: "",
      expiryDate: "",
    });
  };

  // ==========================================
  // CREATE COUPON
  // ==========================================

  const handleCreateCoupon = async (e) => {
    e.preventDefault();

    if (!form.code.trim()) {
      alert("Coupon code is required.");
      return;
    }

    const discountValue = Number(form.discountValue);
    const minimumOrderAmount = Number(
      form.minimumOrderAmount || 0
    );

    const maximumDiscount =
      form.maximumDiscount === ""
        ? null
        : Number(form.maximumDiscount);

    const usageLimit =
      form.usageLimit === ""
        ? null
        : Number(form.usageLimit);

    if (
      !form.discountValue ||
      !Number.isFinite(discountValue) ||
      discountValue <= 0
    ) {
      alert("Enter a valid discount value greater than zero.");
      return;
    }

    if (
      form.discountType === "PERCENTAGE" &&
      discountValue > 100
    ) {
      alert("Percentage discount cannot exceed 100%.");
      return;
    }

    if (
      !Number.isFinite(minimumOrderAmount) ||
      minimumOrderAmount < 0
    ) {
      alert("Enter a valid minimum order amount.");
      return;
    }

    if (
      maximumDiscount !== null &&
      (!Number.isFinite(maximumDiscount) ||
        maximumDiscount < 0)
    ) {
      alert("Enter a valid maximum discount.");
      return;
    }

    if (
      usageLimit !== null &&
      (!Number.isInteger(usageLimit) ||
        usageLimit < 1)
    ) {
      alert("Usage limit must be a positive whole number.");
      return;
    }

    if (!form.expiryDate) {
      alert("Expiry date is required.");
      return;
    }

    const startDate = form.startDate
      ? new Date(form.startDate)
      : new Date();

    const expiryDate = new Date(form.expiryDate);

    if (
      Number.isNaN(startDate.getTime()) ||
      Number.isNaN(expiryDate.getTime())
    ) {
      alert("Please enter valid dates.");
      return;
    }

    if (expiryDate <= startDate) {
      alert("Expiry date must be later than the start date.");
      return;
    }

    try {
      setCreating(true);

      const response = await api.post("/coupon", {
        code: form.code.trim().toUpperCase(),
        discountType: form.discountType,
        discountValue,
        minimumOrderAmount,
        maximumDiscount,
        usageLimit,
        startDate: startDate.toISOString(),
        expiryDate: expiryDate.toISOString(),
      });

      alert(
        response.data?.message ||
          "Coupon created successfully."
      );

      resetForm();
      setShowForm(false);

      await fetchCoupons();
    } catch (error) {
      console.error(
        "Create coupon error:",
        error.response?.data || error.message
      );

      alert(
        error.response?.data?.message ||
          "Failed to create coupon."
      );
    } finally {
      setCreating(false);
    }
  };

  // ==========================================
  // DELETE COUPON
  // ==========================================

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this coupon?"
    );

    if (!confirmed) return;

    try {
      await api.delete(`/coupon/${id}`);

      alert("Coupon deleted successfully.");

      await fetchCoupons();
    } catch (error) {
      console.error(
        "Delete coupon error:",
        error.response?.data || error.message
      );

      alert(
        error.response?.data?.message ||
          "Failed to delete coupon."
      );
    }
  };

  // ==========================================
  // FORMAT DATE
  // ==========================================

  const formatDate = (date) => {
    if (!date) return "-";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "-";
    }

    return parsedDate.toLocaleDateString("en-IN");
  };

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div className="min-h-screen bg-[#151923] text-white flex">
        <AdminSidebar />

        <main className="ml-60 flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-[#b51a2b] border-t-transparent rounded-full animate-spin mx-auto" />

            <p className="text-xs text-gray-400 mt-4">
              Loading coupons...
            </p>
          </div>
        </main>
      </div>
    );
  }

  // ==========================================
  // MAIN PAGE
  // ==========================================

  return (
    <div className="min-h-screen bg-[#151923] text-white">
      <AdminSidebar />

     <main className="flex-1 min-w-0">
        {/* HEADER */}
        <header className="min-h-16 bg-[#151923] border-b border-[#2c3340] px-6 py-4 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-[10px] uppercase tracking-wide text-gray-500">
              Dashboard / Coupons
            </p>

            <h1 className="text-lg font-semibold mt-1">
              COUPON MANAGEMENT
            </h1>
          </div>

          <button
            type="button"
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
            className="bg-[#b51a2b] hover:bg-[#d92d3d] px-5 py-2.5 rounded-md text-xs font-medium transition"
          >
            + CREATE COUPON
          </button>
        </header>

        <div className="p-6">
          <p className="text-xs text-gray-400 mb-6">
            Create and manage discount coupons for LAPZONE customers.
          </p>

          {/* ERROR STATE */}
          {errorMessage && (
            <div className="mb-6 rounded-lg border border-red-400/30 bg-red-500/10 p-4">
              <p className="text-sm text-red-300">
                {errorMessage}
              </p>

              <button
                type="button"
                onClick={fetchCoupons}
                className="mt-3 text-xs text-white underline"
              >
                Try again
              </button>
            </div>
          )}

          {/* STATISTICS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-[#3b465d] rounded-lg p-5">
              <p className="text-[10px] uppercase tracking-wide text-gray-300">
                Total Coupons
              </p>

              <p className="text-2xl font-semibold mt-4">
                {coupons.length}
              </p>
            </div>

            <div className="bg-[#d8f7e2] rounded-lg p-5 text-[#166534]">
              <p className="text-[10px] uppercase tracking-wide font-medium">
                Active Coupons
              </p>

              <p className="text-2xl font-semibold mt-4">
                {
                  coupons.filter(
                    (coupon) =>
                      coupon.isActive &&
                      new Date(coupon.expiryDate) >= new Date() &&
                      (!coupon.startDate ||
                        new Date(coupon.startDate) <= new Date())
                  ).length
                }
              </p>
            </div>

            <div className="bg-[#f0f3f7] rounded-lg p-5 text-[#4b5b72]">
              <p className="text-[10px] uppercase tracking-wide font-medium">
                Expired Coupons
              </p>

              <p className="text-2xl font-semibold mt-4">
                {
                  coupons.filter(
                    (coupon) =>
                      new Date(coupon.expiryDate) < new Date()
                  ).length
                }
              </p>
            </div>
          </div>

          {/* COUPON TABLE */}
          <div className="bg-[#293444] rounded-lg overflow-hidden border border-[#354158]">
            <div className="px-5 py-4 border-b border-[#465168]">
              <h2 className="text-sm font-semibold">
                COUPONS
              </h2>

              <p className="text-[10px] text-gray-400 mt-1">
                All available LAPZONE coupons
              </p>
            </div>

            <div className="overflow-x-auto">
              {coupons.length === 0 ? (
                <div className="p-12 text-center">
                  <p className="text-gray-400 text-sm">
                    No coupons found.
                  </p>

                  <button
                    type="button"
                    onClick={() => {
                      resetForm();
                      setShowForm(true);
                    }}
                    className="mt-4 text-[#ffb2b8] text-xs hover:underline"
                  >
                    Create your first coupon
                  </button>
                </div>
              ) : (
                <table className="w-full min-w-[1050px] text-left">
                  <thead>
                    <tr className="bg-[#354158] text-[10px] uppercase tracking-wide text-gray-300">
                      <th className="px-5 py-4">Code</th>
                      <th className="px-5 py-4">Discount</th>
                      <th className="px-5 py-4">Minimum Order</th>
                      <th className="px-5 py-4">Usage</th>
                      <th className="px-5 py-4">Total Discount</th>
                      <th className="px-5 py-4">Start</th>
                      <th className="px-5 py-4">Expiry</th>
                      <th className="px-5 py-4">Status</th>
                      <th className="px-5 py-4 text-right">Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {coupons.map((coupon) => {
                      const couponOrders = orders.filter(
                        (order) =>
                          order.couponCode &&
                          order.couponCode.toUpperCase() ===
                            coupon.code.toUpperCase()
                      );

                      const totalDiscountGiven =
                        couponOrders.reduce(
                          (total, order) =>
                            total + Number(order.discount || 0),
                          0
                        );

                      const now = new Date();
                      const expired =
                        new Date(coupon.expiryDate) < now;

                      const notStarted =
                        coupon.startDate &&
                        new Date(coupon.startDate) > now;

                      const active =
                        coupon.isActive &&
                        !expired &&
                        !notStarted;

                      return (
                        <tr
                          key={coupon._id}
                          className="border-t border-[#465168] hover:bg-[#354158]/70 transition"
                        >
                          <td className="px-5 py-4">
                            <span className="inline-flex px-3 py-1 rounded bg-[#202632] border border-[#b51a2b]/30 text-[#ffb2b8] text-xs font-semibold">
                              {coupon.code}
                            </span>
                          </td>

                          <td className="px-5 py-4">
                            <p className="text-xs">
                              {coupon.discountType === "PERCENTAGE"
                                ? `${coupon.discountValue}%`
                                : `₹${Number(
                                    coupon.discountValue
                                  ).toLocaleString("en-IN")}`}
                            </p>

                            {coupon.maximumDiscount != null && (
                              <p className="text-[10px] text-gray-400 mt-1">
                                Max ₹
                                {Number(
                                  coupon.maximumDiscount
                                ).toLocaleString("en-IN")}
                              </p>
                            )}
                          </td>

                          <td className="px-5 py-4 text-xs text-gray-300">
                            ₹
                            {Number(
                              coupon.minimumOrderAmount || 0
                            ).toLocaleString("en-IN")}
                          </td>

                          <td className="px-5 py-4 text-xs text-gray-300">
                            {coupon.usedCount || 0}
                            {" / "}
                            {coupon.usageLimit ?? "∞"}
                          </td>

                          <td className="px-5 py-4 text-xs text-green-300">
                            ₹
                            {totalDiscountGiven.toLocaleString(
                              "en-IN",
                              {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              }
                            )}
                          </td>

                          <td className="px-5 py-4 text-xs text-gray-300">
                            {formatDate(coupon.startDate)}
                          </td>

                          <td
                            className={`px-5 py-4 text-xs ${
                              expired
                                ? "text-red-300"
                                : "text-gray-300"
                            }`}
                          >
                            {formatDate(coupon.expiryDate)}
                          </td>

                          <td className="px-5 py-4">
                            <span
                              className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] ${
                                active
                                  ? "bg-green-400/10 border border-green-300/20 text-green-300"
                                  : "bg-red-400/10 border border-red-300/20 text-red-300"
                              }`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  active
                                    ? "bg-green-300"
                                    : "bg-red-300"
                                }`}
                              />

                              {active
                                ? "ACTIVE"
                                : expired
                                ? "EXPIRED"
                                : notStarted
                                ? "SCHEDULED"
                                : "INACTIVE"}
                            </span>
                          </td>

                          <td className="px-5 py-4">
                            <div className="flex justify-end">
                              <button
                                type="button"
                                onClick={() =>
                                  handleDelete(coupon._id)
                                }
                                className="bg-red-500/10 hover:bg-red-500/20 border border-red-400/20 text-red-300 px-4 py-2 rounded-md text-[10px] transition"
                              >
                                DELETE
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
          </div>
        </div>

        {/* CREATE COUPON MODAL */}
        {showForm && (
          <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
            <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-[#202632] border border-[#3c4658] rounded-xl shadow-2xl">
              <div className="px-6 py-5 border-b border-[#3c4658] flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-semibold">
                    CREATE COUPON
                  </h2>

                  <p className="text-[10px] text-gray-400 mt-1">
                    Add a new discount coupon
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    resetForm();
                  }}
                  className="text-gray-400 hover:text-white text-lg"
                  aria-label="Close coupon form"
                >
                  ✕
                </button>
              </div>

              <form
                onSubmit={handleCreateCoupon}
                className="p-6 space-y-5"
              >
                <div>
                  <label className="block text-[10px] uppercase tracking-wide text-gray-300 mb-2">
                    Coupon Code
                  </label>

                  <input
                    type="text"
                    name="code"
                    value={form.code}
                    onChange={handleChange}
                    placeholder="Example: LAP100"
                    required
                    className="w-full bg-[#151923] border border-[#374151] rounded-md px-4 py-3 text-sm outline-none focus:border-[#b51a2b]"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase tracking-wide text-gray-300 mb-2">
                      Discount Type
                    </label>

                    <select
                      name="discountType"
                      value={form.discountType}
                      onChange={handleChange}
                      className="w-full bg-[#151923] border border-[#374151] rounded-md px-4 py-3 text-sm outline-none focus:border-[#b51a2b]"
                    >
                      <option value="PERCENTAGE">Percentage</option>
                      <option value="FIXED">Fixed Amount</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase tracking-wide text-gray-300 mb-2">
                      Discount Value
                    </label>

                    <input
                      type="number"
                      name="discountValue"
                      value={form.discountValue}
                      onChange={handleChange}
                      min="1"
                      max={
                        form.discountType === "PERCENTAGE"
                          ? "100"
                          : undefined
                      }
                      placeholder={
                        form.discountType === "PERCENTAGE"
                          ? "10"
                          : "500"
                      }
                      required
                      className="w-full bg-[#151923] border border-[#374151] rounded-md px-4 py-3 text-sm outline-none focus:border-[#b51a2b]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase tracking-wide text-gray-300 mb-2">
                      Minimum Order Amount (₹)
                    </label>

                    <input
                      type="number"
                      name="minimumOrderAmount"
                      value={form.minimumOrderAmount}
                      onChange={handleChange}
                      min="0"
                      placeholder="0"
                      className="w-full bg-[#151923] border border-[#374151] rounded-md px-4 py-3 text-sm outline-none focus:border-[#b51a2b]"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase tracking-wide text-gray-300 mb-2">
                      Maximum Discount (₹)
                    </label>

                    <input
                      type="number"
                      name="maximumDiscount"
                      value={form.maximumDiscount}
                      onChange={handleChange}
                      min="0"
                      placeholder="Optional"
                      className="w-full bg-[#151923] border border-[#374151] rounded-md px-4 py-3 text-sm outline-none focus:border-[#b51a2b]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-wide text-gray-300 mb-2">
                    Usage Limit
                  </label>

                  <input
                    type="number"
                    name="usageLimit"
                    value={form.usageLimit}
                    onChange={handleChange}
                    min="1"
                    step="1"
                    placeholder="Leave empty for unlimited"
                    className="w-full bg-[#151923] border border-[#374151] rounded-md px-4 py-3 text-sm outline-none focus:border-[#b51a2b]"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase tracking-wide text-gray-300 mb-2">
                      Start Date
                    </label>

                    <input
                      type="datetime-local"
                      name="startDate"
                      value={form.startDate}
                      onChange={handleChange}
                      className="w-full min-w-0 bg-[#151923] border border-[#374151] rounded-md px-3 py-3 text-sm outline-none focus:border-[#b51a2b]"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase tracking-wide text-gray-300 mb-2">
                      Expiry Date
                    </label>

                    <input
                      type="datetime-local"
                      name="expiryDate"
                      value={form.expiryDate}
                      onChange={handleChange}
                      required
                      className="w-full min-w-0 bg-[#151923] border border-[#374151] rounded-md px-3 py-3 text-sm outline-none focus:border-[#b51a2b]"
                    />
                  </div>
                </div>

                <div className="flex flex-wrap justify-end gap-3 pt-4 border-t border-[#3c4658]">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      resetForm();
                    }}
                    className="bg-[#151923] hover:bg-[#2a3140] text-gray-300 px-5 py-2.5 rounded-md text-xs transition"
                  >
                    CANCEL
                  </button>

                  <button
                    type="submit"
                    disabled={creating}
                    className="bg-[#b51a2b] hover:bg-[#d92d3d] disabled:opacity-50 px-5 py-2.5 rounded-md text-xs font-medium transition"
                  >
                    {creating
                      ? "CREATING..."
                      : "CREATE COUPON"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminCoupons;
