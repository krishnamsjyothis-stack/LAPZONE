
import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import {
  AlertCircle,
  CheckCircle2,
  X,
  RefreshCw,
  Search,
  Bell,
  Package,
} from "lucide-react";

const AdminOrders = () => {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [sort, setSort] = useState("newest");

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);

  // Custom notification modal
  const [modal, setModal] = useState({
    open: false,
    title: "",
    message: "",
    type: "error",
  });

  const showModal = (title, message, type = "error") => {
    setModal({
      open: true,
      title,
      message,
      type,
    });
  };

  const closeModal = () => {
    setModal((previous) => ({
      ...previous,
      open: false,
    }));
  };

  // ==========================================
  // FETCH ORDERS
  // ==========================================

  const fetchOrders = useCallback(
    async (
      searchValue = search,
      statusValue = status,
      sortValue = sort,
      pageValue = page
    ) => {
      setLoading(true);

      try {
        const response = await api.get("/admin/orders", {
          params: {
            search: searchValue.trim(),
            status: statusValue,
            sort: sortValue,
            page: pageValue,
            limit: 10,
          },
        });

        setOrders(response.data.orders || []);

        setTotalPages(
          Math.max(
            1,
            response.data.pagination?.totalPages || 1
          )
        );

        setTotalOrders(
          response.data.pagination?.totalOrders || 0
        );
      } catch (error) {
        console.error(
          "Fetch admin orders error:",
          error.response?.data || error.message
        );

        showModal(
          "Unable to Load Orders",
          error.response?.data?.message ||
            "Failed to fetch orders. Please try again.",
          "error"
        );
      } finally {
        setLoading(false);
      }
    },
    [search, status, sort, page]
  );

  useEffect(() => {
    fetchOrders(search, status, sort, page);
  }, [status, sort, page, fetchOrders]);

  // ==========================================
  // SEARCH
  // ==========================================

  const handleSearch = (e) => {
    e.preventDefault();

    if (page !== 1) {
      setPage(1);
    }

    fetchOrders(search, status, sort, 1);
  };

  // ==========================================
  // CLEAR FILTERS
  // ==========================================

  const handleClear = () => {
    setSearch("");
    setStatus("");
    setSort("newest");
    setPage(1);

    fetchOrders("", "", "newest", 1);
  };

  // ==========================================
  // PAGINATION
  // ==========================================

  const handlePrevious = () => {
    if (page > 1) {
      setPage((previous) => previous - 1);
    }
  };

  const handleNext = () => {
    if (page < totalPages) {
      setPage((previous) => previous + 1);
    }
  };

  // ==========================================
  // STATUS STYLE
  // ==========================================

  const getStatusStyle = (orderStatus) => {
    switch (orderStatus) {
      case "Delivered":
        return {
          className:
            "bg-green-400/10 border border-green-300/20 text-green-300",
          dot: "bg-green-300",
        };

      case "Shipped":
        return {
          className:
            "bg-blue-400/10 border border-blue-300/20 text-blue-300",
          dot: "bg-blue-300",
        };

      case "Out for Delivery":
        return {
          className:
            "bg-yellow-400/10 border border-yellow-300/20 text-yellow-300",
          dot: "bg-yellow-300",
        };

      case "Cancelled":
        return {
          className:
            "bg-red-400/10 border border-red-300/20 text-red-300",
          dot: "bg-red-300",
        };

      default:
        return {
          className:
            "bg-gray-400/10 border border-gray-300/20 text-gray-300",
          dot: "bg-gray-300",
        };
    }
  };

  // ==========================================
  // CUSTOM MODAL
  // ==========================================

  const NotificationModal = () => {
    if (!modal.open) return null;

    const isSuccess = modal.type === "success";

    return (
      <div
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
        onMouseDown={(e) => {
          if (e.target === e.currentTarget) {
            closeModal();
          }
        }}
      >
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="notification-title"
          className="w-full max-w-md overflow-hidden rounded-2xl border border-[#414d5e] bg-[#202936] shadow-2xl"
        >
          <div className="flex items-start justify-between border-b border-[#414d5e] px-6 py-5">
            <div className="flex items-center gap-3">
              <div
                className={`flex h-11 w-11 items-center justify-center rounded-xl ${
                  isSuccess
                    ? "bg-green-400/10 text-green-400"
                    : "bg-red-400/10 text-red-400"
                }`}
              >
                {isSuccess ? (
                  <CheckCircle2 size={23} />
                ) : (
                  <AlertCircle size={23} />
                )}
              </div>

              <div>
                <h2
                  id="notification-title"
                  className="text-base font-semibold text-white"
                >
                  {modal.title}
                </h2>

                <p className="mt-1 text-[10px] uppercase tracking-[0.18em] text-gray-500">
                  LAPZONE ADMIN
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={closeModal}
              aria-label="Close notification"
              className="rounded-lg p-2 text-gray-400 transition hover:bg-white/5 hover:text-white"
            >
              <X size={18} />
            </button>
          </div>

          <div className="px-6 py-5">
            <p className="text-sm leading-6 text-gray-300">
              {modal.message}
            </p>

            <button
              type="button"
              onClick={closeModal}
              className={`mt-6 w-full rounded-lg px-4 py-3 text-xs font-semibold tracking-wide text-white transition ${
                isSuccess
                  ? "bg-green-600 hover:bg-green-500"
                  : "bg-[#b51a2b] hover:bg-[#d92d3d]"
              }`}
            >
              OK, GOT IT
            </button>
          </div>
        </div>
      </div>
    );
  };

  // ==========================================
  // INITIAL LOADING
  // ==========================================

  if (loading && orders.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#151923] text-white">
        <NotificationModal />

        <div className="text-center">
          <div className="mx-auto h-9 w-9 animate-spin rounded-full border-2 border-[#b51a2b] border-t-transparent" />

          <p className="mt-4 text-xs text-gray-500">
            Loading orders...
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
      <NotificationModal />

      {/* TOP BAR */}
      <header className="flex h-16 items-center justify-between border-b border-[#2c3340] bg-[#151923] px-6">
        <div className="w-[55%] max-w-xl">
          <div className="flex items-center rounded-lg border border-[#303847] bg-[#202632] px-4 py-2.5">
            <Search size={15} className="mr-2 text-gray-500" />

            <input
              type="text"
              placeholder="Search LAPZONE core..."
              aria-label="Search LAPZONE core"
              className="flex-1 bg-transparent text-xs text-white outline-none placeholder:text-gray-500"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  navigate("/admin/orders");
                }
              }}
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            type="button"
            aria-label="Notifications"
            className="text-gray-400 transition hover:text-white"
          >
            <Bell size={17} />
          </button>

          <div className="text-right">
            <p className="text-xs font-medium text-white">
              Admin User
            </p>

            <p className="text-[9px] text-gray-500">
              System Architect
            </p>
          </div>

          <div className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-[#69758c] bg-[#4a556c] text-xs">
            A
          </div>
        </div>
      </header>

      {/* PAGE CONTENT */}
      <main className="p-6">
        {/* PAGE HEADER */}
        <div className="flex items-start justify-between">
          <div>
            <div className="mb-2 text-[9px] uppercase tracking-wide text-gray-500">
              Dashboard
              <span className="mx-2">/</span>
              <span className="text-[#e33445]">Orders</span>
            </div>

            <h1 className="text-xl font-semibold">
              ORDER MANAGEMENT
            </h1>

            <p className="mt-2 max-w-2xl text-xs text-gray-500">
              Manage customer orders, monitor order status and
              review order information.
            </p>
          </div>

          <button
            type="button"
            onClick={() => fetchOrders(search, status, sort, page)}
            disabled={loading}
            className="flex items-center gap-2 rounded-lg border border-[#414d5e] bg-[#202936] px-4 py-2.5 text-xs text-gray-300 transition hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw
              size={13}
              className={loading ? "animate-spin" : ""}
            />
            Refresh
          </button>
        </div>

        {/* STAT CARDS */}
        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          {/* TOTAL ORDERS */}
          <div className="rounded-lg bg-[#3b465d] p-5">
            <div className="flex justify-between">
              <p className="text-[10px] uppercase tracking-wide text-gray-400">
                Total Orders
              </p>

              <div className="flex h-7 w-7 items-center justify-center rounded bg-[#252d3b]">
                <Package size={15} />
              </div>
            </div>

            <div className="mt-5 flex items-end justify-between">
              <p className="text-2xl font-semibold">
                {totalOrders}
              </p>

              <p className="text-[10px] text-gray-500">
                Matching orders
              </p>
            </div>
          </div>

          {/* CURRENT PAGE */}
          <div className="rounded-lg bg-[#d8f7e2] p-5 text-[#166534]">
            <div className="flex justify-between">
              <p className="text-[10px] font-medium uppercase tracking-wide">
                Current Page
              </p>

              <div className="flex h-7 w-7 items-center justify-center rounded bg-white/70">
                №
              </div>
            </div>

            <div className="mt-5 flex items-end justify-between">
              <p className="text-2xl font-semibold">
                {orders.length}
              </p>

              <p className="text-[10px]">Orders shown</p>
            </div>
          </div>

          {/* PAGE */}
          <div className="rounded-lg bg-[#f0f3f7] p-5 text-[#4b5b72]">
            <div className="flex justify-between">
              <p className="text-[10px] font-medium uppercase tracking-wide">
                Page
              </p>

              <div className="flex h-7 w-7 items-center justify-center rounded bg-white">
                #
              </div>
            </div>

            <div className="mt-5 flex items-end justify-between">
              <p className="text-2xl font-semibold">{page}</p>

              <p className="text-[10px]">of {totalPages}</p>
            </div>
          </div>
        </div>

        {/* ORDERS TABLE */}
        <div className="mt-6 overflow-hidden rounded-lg bg-[#354158]">
          {/* FILTER CONTROLS */}
          <div className="flex flex-col gap-3 p-3 md:flex-row">
            {/* SEARCH */}
            <form
              onSubmit={handleSearch}
              className="flex flex-1 items-center rounded-md bg-[#171d28] px-3"
            >
              <Search size={14} className="mr-2 text-gray-500" />

              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search orders..."
                aria-label="Search orders"
                className="flex-1 bg-transparent py-2.5 text-xs text-white outline-none placeholder:text-gray-600"
              />

              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  aria-label="Clear search input"
                  className="text-xs text-gray-500 hover:text-white"
                >
                  ✕
                </button>
              )}
            </form>

            {/* STATUS */}
            <select
              value={status}
              onChange={(e) => {
                setPage(1);
                setStatus(e.target.value);
              }}
              aria-label="Filter by order status"
              className="rounded-md bg-[#171d28] px-4 py-2 text-xs text-gray-400 outline-none"
            >
              <option value="">STATUS: ALL</option>
              <option value="Pending">PENDING</option>
              <option value="Shipped">SHIPPED</option>
              <option value="Out for Delivery">OUT FOR DELIVERY</option>
              <option value="Delivered">DELIVERED</option>
              <option value="Cancelled">CANCELLED</option>
            </select>

            {/* SORT */}
            <select
              value={sort}
              onChange={(e) => {
                setPage(1);
                setSort(e.target.value);
              }}
              aria-label="Sort orders"
              className="rounded-md bg-[#171d28] px-4 py-2 text-xs text-gray-400 outline-none"
            >
              <option value="newest">SORT: NEWEST</option>
              <option value="oldest">SORT: OLDEST</option>
            </select>

            {/* CLEAR */}
            <button
              type="button"
              onClick={handleClear}
              className="rounded-md bg-[#171d28] px-5 py-2 text-xs text-gray-400 transition hover:text-white"
            >
              CLEAR
            </button>
          </div>

          {/* TABLE */}
          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex items-center justify-center gap-3 p-12 text-xs text-gray-400">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#b51a2b] border-t-transparent" />
                Loading orders...
              </div>
            ) : orders.length === 0 ? (
              <div className="p-12 text-center">
                <Package
                  size={28}
                  className="mx-auto mb-3 text-gray-600"
                />

                <p className="text-xs text-gray-500">
                  No orders found.
                </p>

                <p className="mt-2 text-[10px] text-gray-600">
                  Try changing your search or filters.
                </p>
              </div>
            ) : (
              <table className="w-full min-w-[1050px]">
                <thead>
                  <tr className="bg-[#354158] text-[9px] uppercase tracking-wide text-gray-400">
                    <th className="px-5 py-4 text-left">Order ID</th>
                    <th className="px-5 py-4 text-left">Customer</th>
                    <th className="px-5 py-4 text-left">Date</th>
                    <th className="px-5 py-4 text-left">Amount</th>
                    <th className="px-5 py-4 text-left">Payment</th>
                    <th className="px-5 py-4 text-left">Status</th>
                    <th className="px-5 py-4 text-right">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {orders.map((order) => {
                    const statusStyle = getStatusStyle(
                      order.orderStatus
                    );

                    const createdDate = order.createdAt
                      ? new Date(order.createdAt)
                      : null;

                    return (
                      <tr
                        key={order._id}
                        className="border-t border-[#465168] transition hover:bg-[#3d4961]"
                      >
                        {/* ORDER ID */}
                        <td className="px-5 py-4">
                          <p className="text-xs font-medium text-white">
                            {order.orderId || "N/A"}
                          </p>

                          <p className="mt-1 text-[9px] text-gray-500">
                            ID: {order._id?.slice(-6) || "N/A"}
                          </p>
                        </td>

                        {/* CUSTOMER */}
                        <td className="px-5 py-4">
                          <p className="text-xs font-medium text-white">
                            {order.userId?.name ||
                              order.shippingAddress?.fullName ||
                              "Unknown"}
                          </p>

                          <p className="mt-1 text-[9px] text-gray-500">
                            {order.userId?.email || "Not available"}
                          </p>
                        </td>

                        {/* DATE */}
                        <td className="px-5 py-4">
                          <p className="text-[10px] text-gray-300">
                            {createdDate &&
                            !Number.isNaN(createdDate.getTime())
                              ? createdDate.toLocaleDateString("en-IN")
                              : "N/A"}
                          </p>
                        </td>

                        {/* AMOUNT */}
                        <td className="px-5 py-4">
                          <p className="text-xs font-semibold text-[#ffb2b8]">
                            ₹
                            {Number(
                              order.totalAmount || 0
                            ).toLocaleString("en-IN")}
                          </p>

                          {Number(order.discount || 0) > 0 && (
                            <p className="mt-1 text-[9px] text-green-300">
                              Discount: -₹
                              {Number(
                                order.discount
                              ).toLocaleString("en-IN")}
                            </p>
                          )}

                          {order.couponCode && (
                            <p className="mt-1 text-[9px] text-gray-400">
                              Coupon:{" "}
                              <span className="text-[#ffb2b8]">
                                {order.couponCode}
                              </span>
                            </p>
                          )}
                        </td>

                        {/* PAYMENT */}
                        <td className="px-5 py-4">
                          <span className="text-[10px] text-gray-400">
                            {order.paymentMethod || "-"}
                          </span>
                        </td>

                        {/* STATUS */}
                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[9px] ${statusStyle.className}`}
                          >
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${statusStyle.dot}`}
                            />

                            {order.orderStatus || "Pending"}
                          </span>
                        </td>

                        {/* ACTION */}
                        <td className="px-5 py-4">
                          <div className="flex justify-end">
                            <button
                              type="button"
                              onClick={() =>
                                navigate(
                                  `/admin/orders/${order._id}`
                                )
                              }
                              className="rounded-md bg-[#b51a2b] px-4 py-2 text-[10px] font-medium text-white transition hover:bg-[#d92d3d]"
                            >
                              VIEW
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
          {!loading && orders.length > 0 && (
            <div className="flex items-center justify-between border-t border-[#465168] px-5 py-4">
              <p className="text-[9px] text-gray-400">
                Showing {(page - 1) * 10 + 1}-
                {(page - 1) * 10 + orders.length} of{" "}
                {totalOrders} orders
              </p>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePrevious}
                  disabled={page <= 1 || loading}
                  aria-label="Previous page"
                  className="flex h-7 w-7 items-center justify-center rounded text-gray-400 transition hover:bg-[#465168] disabled:cursor-not-allowed disabled:opacity-30"
                >
                  ‹
                </button>

                <div className="flex h-7 w-7 items-center justify-center rounded bg-[#d92d3d] text-[10px] text-white">
                  {page}
                </div>

                <span className="text-[9px] text-gray-500">
                  of {totalPages}
                </span>

                <button
                  type="button"
                  onClick={handleNext}
                  disabled={page >= totalPages || loading}
                  aria-label="Next page"
                  className="flex h-7 w-7 items-center justify-center rounded text-gray-400 transition hover:bg-[#465168] disabled:cursor-not-allowed disabled:opacity-30"
                >
                  ›
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminOrders;
