
import { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  X,
  Package,
  UserRound,
  Heart,
  MapPin,
  ShoppingCart,
  LogOut,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Eye,
  Truck,
  RotateCcw,
  Ban,
  CheckCircle2,
  AlertCircle,
  Laptop,
  RefreshCw,
} from "lucide-react";
import api from "../api/axios";

const API_BASE_URL =
  import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
const ORDERS_PER_PAGE = 3;

function getProductImageUrl(image) {
  if (!image || typeof image !== "string") return "";

  const trimmed = image.trim();
  if (!trimmed) return "";

  if (/^https?:\/\//i.test(trimmed)) return trimmed;

  return `${API_BASE_URL}${
    trimmed.startsWith("/") ? trimmed : `/${trimmed}`
  }`;
}

function formatCurrency(value) {
  return Number(value || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  });
}

function formatDate(date) {
  if (!date) return "Date unavailable";

  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return "Date unavailable";

  return parsed.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getStatusConfig(status) {
  const configs = {
    Pending: {
      label: "Processing",
      className: "border-amber-400/20 bg-amber-400/10 text-amber-300",
      dot: "bg-amber-400",
    },
    Shipped: {
      label: "Shipped",
      className: "border-sky-400/20 bg-sky-400/10 text-sky-300",
      dot: "bg-sky-400",
    },
    "Out for Delivery": {
      label: "Out for delivery",
      className: "border-violet-400/20 bg-violet-400/10 text-violet-300",
      dot: "bg-violet-400",
    },
    Delivered: {
      label: "Delivered",
      className: "border-emerald-400/20 bg-emerald-400/10 text-emerald-300",
      dot: "bg-emerald-400",
    },
    Cancelled: {
      label: "Cancelled",
      className: "border-red-400/20 bg-red-400/10 text-red-300",
      dot: "bg-red-400",
    },
  };

  return (
    configs[status] || {
      label: status || "Unknown",
      className: "border-slate-400/20 bg-slate-400/10 text-slate-300",
      dot: "bg-slate-400",
    }
  );
}

function getProgressWidth(status) {
  const widths = {
    Pending: "25%",
    Shipped: "55%",
    "Out for Delivery": "80%",
    Delivered: "100%",
    Cancelled: "100%",
  };

  return widths[status] || "10%";
}

function MyOrders() {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [brokenImages, setBrokenImages] = useState({});

  const [alertModal, setAlertModal] = useState({
    show: false,
    message: "",
    type: "error",
  });

  const [actionModal, setActionModal] = useState({
    show: false,
    orderId: "",
    action: "",
    reason: "",
  });

  const [actionLoading, setActionLoading] = useState(false);

  const showAlert = (message, type = "error") => {
    setAlertModal({ show: true, message, type });
  };

  const closeAlert = () => {
    setAlertModal((previous) => ({ ...previous, show: false }));
  };

  const getToken = () => localStorage.getItem("token");

  const fetchOrders = useCallback(
    async (searchValue = "") => {
      try {
        setLoading(true);

        const token = getToken();

        if (!token) {
          navigate("/login");
          return;
        }

        const response = await api.get(
          `/orders?search=${encodeURIComponent(searchValue)}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setOrders(
          Array.isArray(response.data?.orders)
            ? response.data.orders
            : []
        );

        setCurrentPage(1);
        setBrokenImages({});
      } catch (error) {
        console.error(
          "Fetch orders error:",
          error.response?.data || error.message
        );

        if (error.response?.status === 401) {
          localStorage.removeItem("token");
          navigate("/login");
          return;
        }

        showAlert(
          error.response?.data?.message ||
            "Failed to load your orders."
        );
      } finally {
        setLoading(false);
      }
    },
    [navigate]
  );

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const status = order.orderStatus;

      switch (statusFilter) {
        case "PROCESSING":
          return status === "Pending";

        case "SHIPPED":
          return (
            status === "Shipped" ||
            status === "Out for Delivery"
          );

        case "DELIVERED":
          return status === "Delivered";

        case "CANCELLED":
          return status === "Cancelled";

        default:
          return true;
      }
    });
  }, [orders, statusFilter]);

  const totalPages = Math.ceil(
    filteredOrders.length / ORDERS_PER_PAGE
  );

  const currentOrders = filteredOrders.slice(
    (currentPage - 1) * ORDERS_PER_PAGE,
    currentPage * ORDERS_PER_PAGE
  );

  const handleStatusFilter = (status) => {
    setStatusFilter(status);
    setCurrentPage(1);
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchOrders(search.trim());
  };

  const handleClearSearch = () => {
    setSearch("");
    setStatusFilter("ALL");
    setCurrentPage(1);
    fetchOrders("");
  };

  const openActionModal = (orderId, action) => {
    setActionModal({
      show: true,
      orderId,
      action,
      reason: "",
    });
  };

  const closeActionModal = () => {
    if (actionLoading) return;

    setActionModal({
      show: false,
      orderId: "",
      action: "",
      reason: "",
    });
  };

  const submitOrderAction = async (event) => {
    event.preventDefault();

    const reason = actionModal.reason.trim();

    if (!reason) {
      showAlert(
        `Please enter a reason for ${
          actionModal.action === "cancel"
            ? "cancelling"
            : "returning"
        } this order.`
      );
      return;
    }

    try {
      setActionLoading(true);

      const token = getToken();

      if (!token) {
        localStorage.removeItem("token");
        navigate("/login");
        return;
      }

      const isCancel = actionModal.action === "cancel";

      const endpoint = isCancel
        ? `/orders/${actionModal.orderId}/cancel`
        : `/orders/${actionModal.orderId}/return`;

      const body = isCancel
        ? { cancellationReason: reason }
        : { returnReason: reason };

      const response = await api.patch(endpoint, body, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setActionModal({
        show: false,
        orderId: "",
        action: "",
        reason: "",
      });

      showAlert(
        response.data?.message ||
          (isCancel
            ? "Order cancelled successfully."
            : "Return request submitted successfully."),
        "success"
      );

      await fetchOrders(search.trim());
    } catch (error) {
      console.error(
        "Order action error:",
        error.response?.data || error.message
      );

      showAlert(
        error.response?.data?.message ||
          (actionModal.action === "cancel"
            ? "Failed to cancel the order."
            : "Failed to submit the return request.")
      );
    } finally {
      setActionLoading(false);
    }
  };

  const counts = useMemo(
    () => ({
      all: orders.length,
      processing: orders.filter(
        (order) => order.orderStatus === "Pending"
      ).length,
      shipped: orders.filter(
        (order) =>
          order.orderStatus === "Shipped" ||
          order.orderStatus === "Out for Delivery"
      ).length,
      delivered: orders.filter(
        (order) => order.orderStatus === "Delivered"
      ).length,
      cancelled: orders.filter(
        (order) => order.orderStatus === "Cancelled"
      ).length,
    }),
    [orders]
  );

  const filters = [
    { label: "All orders", value: "ALL", count: counts.all },
    {
      label: "Processing",
      value: "PROCESSING",
      count: counts.processing,
    },
    { label: "Shipped", value: "SHIPPED", count: counts.shipped },
    {
      label: "Delivered",
      value: "DELIVERED",
      count: counts.delivered,
    },
    {
      label: "Cancelled",
      value: "CANCELLED",
      count: counts.cancelled,
    },
  ];

  if (loading) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 bg-[#151922] text-white">
        <RefreshCw className="h-8 w-8 animate-spin text-[#e52b43]" />
        <p className="text-sm text-slate-400">
          Loading your orders...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#151922] text-white">
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-8 md:py-10">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[230px_minmax(0,1fr)]">

          {/* CUSTOMER SIDEBAR */}
          <aside>
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#202735] lg:sticky lg:top-6">
              <div className="border-b border-white/10 bg-gradient-to-br from-[#384358] to-[#242d3c] p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#b51a2b]">
                    <UserRound className="h-5 w-5" />
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold">
                      MY ACCOUNT
                    </p>
                    <p className="mt-1 text-xs text-slate-400">
                      LAPZONE customer
                    </p>
                  </div>
                </div>
              </div>

              <nav className="grid grid-cols-2 gap-2 p-3 sm:grid-cols-3 lg:grid-cols-1">
                {[
                  { label: "Profile", path: "/profile", icon: UserRound },
                  {
                    label: "My Orders",
                    path: "/orders",
                    icon: Package,
                    active: true,
                  },
                  { label: "Wishlist", path: "/wishlist", icon: Heart },
                  { label: "Addresses", path: "/addresses", icon: MapPin },
                  {
                    label: "Cart",
                    path: "/cart",
                    icon: ShoppingCart,
                  },
                ].map((item) => {
                  const Icon = item.icon;

                  return (
                    <button
                      key={item.path}
                      type="button"
                      onClick={() => navigate(item.path)}
                      className={`flex items-center gap-3 rounded-xl px-3 py-3 text-left text-xs font-semibold transition ${
                        item.active
                          ? "bg-[#b51a2b] text-white shadow-lg shadow-red-950/20"
                          : "text-slate-300 hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      {item.label}
                    </button>
                  );
                })}

                <button
                  type="button"
                  onClick={() => {
                    localStorage.removeItem("token");
                    navigate("/login");
                  }}
                  className="flex items-center gap-3 rounded-xl px-3 py-3 text-left text-xs font-semibold text-red-300 transition hover:bg-red-500/10"
                >
                  <LogOut className="h-4 w-4" />
                  Sign out
                </button>
              </nav>
            </div>
          </aside>

          {/* ORDER HISTORY */}
          <main className="min-w-0">

            {/* PAGE HEADER */}
            <div className="relative mb-7 overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[#252d3b] to-[#1c222d] p-6 md:p-8">
              <div className="pointer-events-none absolute -right-8 -top-16 h-56 w-56 rounded-full bg-[#b51a2b]/15 blur-3xl" />

              <div className="relative flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
                <div>
                  <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.22em] text-[#ff6b7c]">
                    <span className="h-2 w-2 rounded-full bg-[#e52b43]" />
                    Customer account
                  </div>

                  <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
                    Order <span className="text-[#e52b43]">History</span>
                  </h1>

                  <p className="mt-3 max-w-lg text-sm leading-6 text-slate-400">
                    Track deliveries, review your purchases, and manage
                    cancellations and return requests in one place.
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-3 rounded-xl border border-white/10 bg-black/10 px-4 py-3">
                  <Package className="h-5 w-5 text-[#ff6b7c]" />
                  <div>
                    <p className="text-2xl font-black">{counts.all}</p>
                    <p className="text-[10px] uppercase tracking-wider text-slate-400">
                      Total orders
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* SEARCH — SUMMARY CARDS REMOVED */}
            <div className="mb-5 rounded-2xl border border-white/10 bg-[#202735] p-4">
              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="relative min-w-0 flex-1">
                  <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />

                  <input
                    type="text"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") handleSearch();
                    }}
                    placeholder="Search by order ID or product..."
                    className="w-full rounded-xl border border-white/10 bg-[#151922] py-3 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-[#b51a2b]"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleSearch}
                  className="flex items-center justify-center gap-2 rounded-xl bg-[#b51a2b] px-5 py-3 text-xs font-bold transition hover:bg-[#d12238]"
                >
                  <Search className="h-4 w-4" />
                  Search
                </button>

                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="flex items-center justify-center gap-2 rounded-xl border border-white/10 px-5 py-3 text-xs font-bold text-slate-300 transition hover:bg-white/5"
                >
                  <X className="h-4 w-4" />
                  Clear
                </button>
              </div>
            </div>

            {/* STATUS FILTERS */}
            <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
              {filters.map((filter) => (
                <button
                  key={filter.value}
                  type="button"
                  onClick={() => handleStatusFilter(filter.value)}
                  className={`flex shrink-0 items-center gap-2 rounded-xl border px-4 py-3 text-xs font-semibold transition ${
                    statusFilter === filter.value
                      ? "border-[#b51a2b] bg-[#b51a2b]/15 text-white"
                      : "border-white/10 bg-[#202735] text-slate-400 hover:border-white/20 hover:text-white"
                  }`}
                >
                  {filter.label}

                  <span
                    className={`rounded-md px-2 py-0.5 text-[10px] ${
                      statusFilter === filter.value
                        ? "bg-[#b51a2b] text-white"
                        : "bg-white/5 text-slate-400"
                    }`}
                  >
                    {filter.count}
                  </span>
                </button>
              ))}
            </div>

            {/* ORDER LIST */}
            {currentOrders.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-[#202735] px-5 py-14 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#b51a2b]/10 text-[#ff6b7c]">
                  <Package className="h-8 w-8" />
                </div>

                <h2 className="mt-5 text-xl font-bold">
                  {search ? "No matching orders" : "No orders found"}
                </h2>

                <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-400">
                  {search
                    ? `No orders match "${search}". Try a different search or clear your filters.`
                    : "Your orders will appear here after you place a purchase."}
                </p>

                <button
                  type="button"
                  onClick={() => navigate("/products")}
                  className="mt-6 rounded-xl bg-[#b51a2b] px-6 py-3 text-xs font-bold transition hover:bg-[#d12238]"
                >
                  Browse laptops
                </button>
              </div>
            ) : (
              <div className="space-y-5">
                {currentOrders.map((order) => {
                  const firstItem = order.items?.[0];
                  const imageValue = firstItem?.productImage;
                  const imageUrl = getProductImageUrl(imageValue);
                  const imageKey = `${order._id}-${String(imageValue || "")}`;
                  const imageBroken = brokenImages[imageKey];
                  const statusConfig = getStatusConfig(order.orderStatus);

                  return (
                    <article
                      key={order._id}
                      className="overflow-hidden rounded-2xl border border-white/10 bg-[#202735] transition hover:border-white/20"
                    >
                      {/* ORDER HEADER */}
                      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 bg-white/[0.02] px-5 py-4">
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">
                            Order reference
                          </p>
                          <p className="mt-1 break-all text-sm font-bold">
                            #{order.orderId || order._id}
                          </p>
                        </div>

                        <span
                          className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[10px] font-bold ${statusConfig.className}`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${statusConfig.dot}`}
                          />
                          {statusConfig.label}
                        </span>
                      </div>

                      {/* ORDER BODY */}
                      <div className="p-5">
                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-[120px_minmax(0,1fr)]">
                          {/* PRODUCT IMAGE */}
                          <div className="flex h-28 w-full items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-[#151922] sm:w-[120px]">
                            {imageUrl && !imageBroken ? (
                              <img
                                src={imageUrl}
                                alt={firstItem?.productName || "Laptop"}
                                className="h-full w-full object-contain p-2"
                                onError={() =>
                                  setBrokenImages((previous) => ({
                                    ...previous,
                                    [imageKey]: true,
                                  }))
                                }
                              />
                            ) : (
                              <div className="flex flex-col items-center gap-2 text-slate-500">
                                <Laptop className="h-9 w-9" />
                                <span className="text-[10px]">
                                  Image unavailable
                                </span>
                              </div>
                            )}
                          </div>

                          {/* ORDER DETAILS */}
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-400">
                              <span className="inline-flex items-center gap-1.5">
                                <CalendarDays className="h-3.5 w-3.5" />
                                {formatDate(order.createdAt)}
                              </span>

                              <span>
                                {order.items?.length || 0} product
                                {order.items?.length !== 1 ? "s" : ""}
                              </span>
                            </div>

                            <h2 className="mt-3 break-words text-lg font-bold leading-snug">
                              {firstItem?.productName || "LAPZONE laptop"}
                            </h2>

                            {(order.items || []).length > 1 && (
                              <p className="mt-1 text-xs text-slate-400">
                                + {order.items.length - 1} more product
                                {order.items.length - 1 !== 1 ? "s" : ""} in
                                this order
                              </p>
                            )}

                            {/* DELIVERY PROGRESS */}
                            {order.orderStatus !== "Cancelled" && (
                              <div className="mt-5">
                                <div className="mb-2 flex items-center justify-between text-[10px] text-slate-400">
                                  <span>DELIVERY PROGRESS</span>
                                  <span>
                                    {getProgressWidth(order.orderStatus)}
                                  </span>
                                </div>

                                <div className="h-1.5 overflow-hidden rounded-full bg-[#10141b]">
                                  <div
                                    className="h-full rounded-full bg-gradient-to-r from-[#b51a2b] to-[#ff6377] transition-all duration-500"
                                    style={{
                                      width: getProgressWidth(
                                        order.orderStatus
                                      ),
                                    }}
                                  />
                                </div>

                                <div className="mt-2 flex justify-between gap-1 text-[9px] uppercase tracking-wide text-slate-500">
                                  <span
                                    className={
                                      order.orderStatus === "Pending"
                                        ? "text-amber-300"
                                        : ""
                                    }
                                  >
                                    Placed
                                  </span>

                                  <span
                                    className={
                                      order.orderStatus === "Shipped"
                                        ? "text-sky-300"
                                        : ""
                                    }
                                  >
                                    Shipped
                                  </span>

                                  <span
                                    className={
                                      order.orderStatus === "Out for Delivery"
                                        ? "text-violet-300"
                                        : ""
                                    }
                                  >
                                    In transit
                                  </span>

                                  <span
                                    className={
                                      order.orderStatus === "Delivered"
                                        ? "text-emerald-300"
                                        : ""
                                    }
                                  >
                                    Delivered
                                  </span>
                                </div>
                              </div>
                            )}

                            {order.orderStatus === "Cancelled" && (
                              <p className="mt-4 flex items-center gap-2 text-xs text-red-300">
                                <Ban className="h-4 w-4" />
                                This order has been cancelled.
                              </p>
                            )}

                            {/* ORDER ACTIONS */}
                            <div className="mt-5 flex flex-wrap gap-2">
                              <button
                                type="button"
                                onClick={() =>
                                  navigate(`/orders/${order._id}`)
                                }
                                className="inline-flex items-center gap-2 rounded-lg bg-[#b51a2b] px-4 py-2.5 text-[10px] font-bold transition hover:bg-[#d12238]"
                              >
                                <Eye className="h-3.5 w-3.5" />
                                View details
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  navigate(`/orders/${order._id}`)
                                }
                                className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-4 py-2.5 text-[10px] font-bold text-slate-300 transition hover:bg-white/5"
                              >
                                <Truck className="h-3.5 w-3.5" />
                                Track order
                              </button>

                              {order.orderStatus === "Pending" && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    openActionModal(order._id, "cancel")
                                  }
                                  className="inline-flex items-center gap-2 rounded-lg border border-red-400/20 bg-red-400/5 px-4 py-2.5 text-[10px] font-bold text-red-300 transition hover:bg-red-400/10"
                                >
                                  <Ban className="h-3.5 w-3.5" />
                                  Cancel order
                                </button>
                              )}

                              {order.orderStatus === "Delivered" &&
                                (!order.returnStatus ||
                                  order.returnStatus === "Not Requested") && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      openActionModal(order._id, "return")
                                    }
                                    className="inline-flex items-center gap-2 rounded-lg border border-amber-400/20 bg-amber-400/5 px-4 py-2.5 text-[10px] font-bold text-amber-300 transition hover:bg-amber-400/10"
                                  >
                                    <RotateCcw className="h-3.5 w-3.5" />
                                    Request return
                                  </button>
                                )}

                              {order.returnStatus === "Requested" && (
                                <span className="rounded-lg border border-amber-400/20 bg-amber-400/10 px-3 py-2.5 text-[10px] font-bold text-amber-300">
                                  Return requested
                                </span>
                              )}

                              {order.returnStatus === "Approved" && (
                                <span className="rounded-lg border border-emerald-400/20 bg-emerald-400/10 px-3 py-2.5 text-[10px] font-bold text-emerald-300">
                                  Return approved
                                </span>
                              )}

                              {order.returnStatus === "Rejected" && (
                                <span className="rounded-lg border border-red-400/20 bg-red-400/10 px-3 py-2.5 text-[10px] font-bold text-red-300">
                                  Return rejected
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* PRICE SUMMARY */}
                        <div className="mt-5 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-4">
                          <div>
                            <p className="text-[10px] uppercase tracking-wider text-slate-500">
                              Payment method
                            </p>
                            <p className="mt-1 text-xs font-semibold text-slate-300">
                              {order.paymentMethod || "Not available"}
                            </p>
                          </div>

                          <div className="text-left sm:text-right">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                              Order total
                            </p>

                            <p className="mt-1 text-xl font-black text-white">
                              <span className="mr-1 text-sm text-[#ff6b7c]">
                                ₹
                              </span>
                              {formatCurrency(order.totalAmount)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}

            {/* PAGINATION */}
            {totalPages > 1 && (
              <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
                <button
                  type="button"
                  disabled={currentPage === 1}
                  onClick={() =>
                    setCurrentPage((page) => Math.max(page - 1, 1))
                  }
                  className="inline-flex items-center gap-1 rounded-lg border border-white/10 px-3 py-2 text-xs disabled:cursor-not-allowed disabled:opacity-30"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </button>

                {Array.from(
                  { length: totalPages },
                  (_, index) => index + 1
                ).map((page) => (
                  <button
                    key={page}
                    type="button"
                    onClick={() => setCurrentPage(page)}
                    className={`h-9 w-9 rounded-lg text-xs font-bold transition ${
                      currentPage === page
                        ? "bg-[#b51a2b] text-white"
                        : "border border-white/10 bg-[#202735] text-slate-400 hover:text-white"
                    }`}
                  >
                    {page}
                  </button>
                ))}

                <button
                  type="button"
                  disabled={currentPage === totalPages}
                  onClick={() =>
                    setCurrentPage((page) =>
                      Math.min(page + 1, totalPages)
                    )
                  }
                  className="inline-flex items-center gap-1 rounded-lg border border-white/10 px-3 py-2 text-xs disabled:cursor-not-allowed disabled:opacity-30"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}

            {/* CONTINUE SHOPPING */}
            <div className="mt-9 flex justify-center">
              <button
                type="button"
                onClick={() => navigate("/products")}
                className="inline-flex items-center gap-2 rounded-xl border border-[#b51a2b]/40 bg-[#b51a2b]/10 px-6 py-3 text-xs font-bold text-[#ff7c8b] transition hover:bg-[#b51a2b] hover:text-white"
              >
                <ShoppingCart className="h-4 w-4" />
                Continue shopping
              </button>
            </div>
          </main>
        </div>
      </div>

      {/* CANCEL / RETURN REASON MODAL */}
      {actionModal.show && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeActionModal();
            }
          }}
        >
          <form
            onSubmit={submitOrderAction}
            className="w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-[#202735] shadow-2xl"
          >
            <div className="flex items-start justify-between border-b border-white/10 p-5">
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-xl ${
                    actionModal.action === "cancel"
                      ? "bg-red-400/10 text-red-300"
                      : "bg-amber-400/10 text-amber-300"
                  }`}
                >
                  {actionModal.action === "cancel" ? (
                    <Ban className="h-5 w-5" />
                  ) : (
                    <RotateCcw className="h-5 w-5" />
                  )}
                </div>

                <div>
                  <h2 className="text-lg font-bold">
                    {actionModal.action === "cancel"
                      ? "Cancel order"
                      : "Request a return"}
                  </h2>
                  <p className="mt-1 text-xs text-slate-400">
                    Please tell us why.
                  </p>
                </div>
              </div>

              <button
                type="button"
                disabled={actionLoading}
                onClick={closeActionModal}
                aria-label="Close modal"
                className="rounded-lg p-2 text-slate-400 transition hover:bg-white/5 hover:text-white disabled:opacity-50"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-5">
              <label
                htmlFor="order-action-reason"
                className="mb-2 block text-xs font-semibold text-slate-300"
              >
                {actionModal.action === "cancel"
                  ? "Cancellation reason"
                  : "Return reason"}
              </label>

              <textarea
                id="order-action-reason"
                value={actionModal.reason}
                onChange={(event) =>
                  setActionModal((previous) => ({
                    ...previous,
                    reason: event.target.value,
                  }))
                }
                placeholder={
                  actionModal.action === "cancel"
                    ? "Tell us why you want to cancel..."
                    : "Tell us why you want to return this product..."
                }
                rows={4}
                maxLength={500}
                required
                disabled={actionLoading}
                className="w-full resize-y rounded-xl border border-white/10 bg-[#151922] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-[#b51a2b] disabled:opacity-60"
              />

              <p className="mt-2 text-right text-[10px] text-slate-500">
                {actionModal.reason.length}/500
              </p>

              <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeActionModal}
                  disabled={actionLoading}
                  className="rounded-xl border border-white/10 px-5 py-3 text-xs font-bold text-slate-300 transition hover:bg-white/5 disabled:opacity-50"
                >
                  Keep order
                </button>

                <button
                  type="submit"
                  disabled={
                    actionLoading || !actionModal.reason.trim()
                  }
                  className={`rounded-xl px-5 py-3 text-xs font-bold text-white transition disabled:cursor-not-allowed disabled:opacity-50 ${
                    actionModal.action === "cancel"
                      ? "bg-red-600 hover:bg-red-500"
                      : "bg-amber-600 hover:bg-amber-500"
                  }`}
                >
                  {actionLoading
                    ? "Please wait..."
                    : actionModal.action === "cancel"
                    ? "Confirm cancellation"
                    : "Submit return request"}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* ALERT MODAL */}
      {alertModal.show && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="order-alert-title"
            className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#202735] p-6 shadow-2xl"
          >
            <div className="flex flex-col items-center text-center">
              <div
                className={`mb-4 flex h-14 w-14 items-center justify-center rounded-2xl ${
                  alertModal.type === "success"
                    ? "bg-emerald-400/10 text-emerald-300"
                    : "bg-red-400/10 text-red-300"
                }`}
              >
                {alertModal.type === "success" ? (
                  <CheckCircle2 className="h-7 w-7" />
                ) : (
                  <AlertCircle className="h-7 w-7" />
                )}
              </div>

              <h2 id="order-alert-title" className="text-lg font-bold">
                {alertModal.type === "success" ? "Success" : "Notice"}
              </h2>

              <p className="mt-3 whitespace-pre-line text-sm leading-6 text-slate-400">
                {alertModal.message}
              </p>

              <button
                type="button"
                onClick={closeAlert}
                className="mt-6 w-full rounded-xl bg-[#b51a2b] py-3 text-xs font-bold text-white transition hover:bg-[#d12238]"
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

export default MyOrders;
