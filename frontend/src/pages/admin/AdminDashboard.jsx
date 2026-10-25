
import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";

const API_ORIGIN = (
  import.meta.env.VITE_BACKEND_URL ||
  api.defaults?.baseURL ||
  "http://localhost:5000/api"
).replace(/\/api\/?$/, "");


const formatCurrency = (value) =>
  `₹${Number(value || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  })}`;

const formatNumber = (value) =>
  Number(value || 0).toLocaleString("en-IN");

const getImageUrl = (image) => {
  if (!image) return "";
  if (/^https?:\/\//i.test(image)) return image;
  return `${API_ORIGIN}/${String(image).replace(/^\/+/, "")}`;
};

const getStatusStyle = (status = "") => {
  const value = status.toLowerCase();

  if (value.includes("deliver")) {
    return "bg-green-500/10 text-green-300";
  }
  if (value.includes("cancel") || value.includes("reject")) {
    return "bg-red-500/10 text-red-300";
  }
  if (value.includes("ship") || value.includes("transit")) {
    return "bg-yellow-500/10 text-yellow-300";
  }
  return "bg-blue-500/10 text-blue-300";
};

function AdminDashboard() {
  const navigate = useNavigate();

  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [period, setPeriod] = useState("Current");

  const fetchDashboard = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const response = await api.get("/admin/dashboard");
      const result = response.data?.data ?? response.data;

      setDashboardData(result || {});
    } catch (err) {
      console.error("Dashboard loading error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to load dashboard data. Please check your connection and try again."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const statsData = dashboardData?.stats || {};

  const stats = [
    {
      title: "Total Sales",
      value: formatCurrency(statsData.totalSales),
      description: "Total sales recorded",
      icon: "₹",
      color: "text-green-300",
    },
    {
      title: "Total Orders",
      value: formatNumber(statsData.totalOrders),
      description: "Orders placed",
      icon: "▤",
      color: "text-blue-300",
    },
    {
      title: "Total Customers",
      value: formatNumber(statsData.totalCustomers),
      description: "Registered customers",
      icon: "♙",
      color: "text-purple-300",
    },
    {
      title: "Total Products",
      value: formatNumber(statsData.totalProducts),
      description: `${formatNumber(statsData.lowStockProducts)} low-stock products`,
      icon: "▣",
      color: Number(statsData.lowStockProducts || 0) > 0
        ? "text-red-300"
        : "text-green-300",
    },
  ];

  const recentOrders = Array.isArray(dashboardData?.recentOrders)
    ? dashboardData.recentOrders
    : [];

  const topProducts = Array.isArray(dashboardData?.topProducts)
    ? dashboardData.topProducts
    : [];

  const salesOverview = Array.isArray(dashboardData?.salesOverview)
    ? dashboardData.salesOverview
    : [];

  const salesValues = salesOverview.map((item) =>
    Math.max(0, Number(item.sales) || 0)
  );

  const maxSales = Math.max(...salesValues, 1);

  const graphPoints = salesOverview.map((item, index) => {
    const x =
      salesOverview.length <= 1
        ? 400
        : (index / (salesOverview.length - 1)) * 800;

    const y = 175 - ((Number(item.sales) || 0) / maxSales) * 135;

    return { x, y };
  });

  const points = graphPoints.length
    ? graphPoints
    : [{ x: 0, y: 175 }, { x: 800, y: 175 }];

  const graphPath = points.reduce((path, point, index) => {
    if (index === 0) return `M ${point.x} ${point.y}`;

    const previous = points[index - 1];
    const controlX = (previous.x + point.x) / 2;

    return (
      path +
      ` C ${controlX} ${previous.y}, ${controlX} ${point.y}, ${point.x} ${point.y}`
    );
  }, "");

  const areaPath = `${graphPath} L 800 220 L 0 220 Z`;

  const salesLabels = salesOverview.map((item) => {
    const rawDate = item._id || item.date;

    if (!rawDate) return "";

    const date = new Date(rawDate);

    if (Number.isNaN(date.getTime())) return String(rawDate);

    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
    });
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-[#11161e] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-[#303846] border-t-[#b51a2b]" />
          <p className="text-sm font-medium">Loading LAPZONE dashboard...</p>
          <p className="mt-2 text-xs text-gray-500">
            Fetching your latest store data
          </p>
        </div>
      </div>
    );
  }

  if (error && !dashboardData) {
    return (
      <div className="min-h-screen bg-[#11161e] text-white flex items-center justify-center p-6">
        <div className="w-full max-w-md rounded-xl border border-[#303846] bg-[#202936] p-7 text-center">
          <div className="mb-4 text-3xl text-red-400">!</div>
          <h2 className="text-lg font-semibold">Dashboard unavailable</h2>
          <p className="mt-3 text-sm text-gray-400">{error}</p>
          <button
            type="button"
            onClick={() => fetchDashboard()}
            className="mt-6 rounded-lg bg-[#b51a2b] px-5 py-3 text-sm font-medium hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#11161e] text-white">
      {/* Header */}
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-[#292f38] bg-[#11161e] px-5 py-4 sm:px-7">
        <div>
          <p className="text-xs font-semibold tracking-[0.25em] text-[#ffb2b8]">
            LAPZONE
          </p>
          <p className="mt-1 text-xs text-gray-500">Store administration</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => fetchDashboard(true)}
            disabled={refreshing}
            className="rounded-lg border border-[#303846] bg-[#1b2028] px-4 py-2 text-xs text-gray-300 transition hover:border-[#b51a2b] disabled:opacity-50"
          >
            {refreshing ? "Refreshing..." : "↻ Refresh"}
          </button>

          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#b51a2b] text-sm font-semibold">
            A
          </div>
          <div>
            <p className="text-xs font-medium">Admin User</p>
            <p className="text-[10px] text-gray-500">Administrator</p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1600px] p-4 sm:p-7">
        {/* Page title */}
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-medium tracking-[0.2em] text-[#ffb2b8]">
              STORE OVERVIEW
            </p>
            <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
              Admin Dashboard
            </h1>
            <p className="mt-2 text-sm text-gray-500">
              Monitor sales, orders, customers and inventory.
            </p>
          </div>

          <div className="rounded-lg border border-[#303846] bg-[#1b2028] px-4 py-3">
            <p className="text-[10px] uppercase tracking-wider text-gray-500">
              Today
            </p>
            <p className="mt-1 text-sm font-medium">
              {new Date().toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </p>
          </div>
        </div>

        {error && (
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
            <span>{error}</span>
            <button
              type="button"
              onClick={() => fetchDashboard(true)}
              className="underline"
            >
              Retry
            </button>
          </div>
        )}

        {/* Statistics */}
        <section className="mt-7 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.title}
              className="rounded-xl border border-[#303846] bg-[#202936] p-5 transition hover:border-[#515b6b]"
            >
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium uppercase tracking-wider text-gray-400">
                  {stat.title}
                </p>
                <span className={`text-xl ${stat.color}`}>{stat.icon}</span>
              </div>
              <h2 className="mt-4 break-words text-2xl font-bold sm:text-3xl">
                {stat.value}
              </h2>
              <p className={`mt-3 text-xs ${stat.color}`}>
                {stat.description}
              </p>
            </div>
          ))}
        </section>

        {/* Sales graph */}
        <section className="mt-6 rounded-xl border border-[#303846] bg-[#202936] p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-semibold">Sales Overview</h2>
              <p className="mt-1 text-xs text-gray-500">
                Sales data returned by your dashboard API
              </p>
            </div>

            <div className="flex gap-2">
              {["Weekly", "Current"].map((item) => (
                <button
                  type="button"
                  key={item}
                  onClick={() => setPeriod(item)}
                  className={`rounded-lg px-4 py-2 text-xs transition ${
                    period === item
                      ? "bg-[#b51a2b] text-white"
                      : "border border-[#303846] bg-[#171c24] text-gray-400 hover:text-white"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-xs text-gray-500">
                {period === "Weekly" ? "Weekly sales" : "Current sales data"}
              </p>
              <p className="text-xs text-gray-400">
                Peak: {formatCurrency(maxSales)}
              </p>
            </div>

            <div className="relative h-56 w-full overflow-hidden">
              <div className="absolute inset-0 flex flex-col justify-between">
                {[0, 1, 2, 3, 4].map((line) => (
                  <div key={line} className="border-t border-[#303846]" />
                ))}
              </div>

              <svg
                viewBox="0 0 800 220"
                preserveAspectRatio="none"
                className="absolute inset-0 h-full w-full"
                role="img"
                aria-label="Sales overview line graph"
              >
                <defs>
                  <linearGradient id="salesFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#b51a2b" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#b51a2b" stopOpacity="0" />
                  </linearGradient>
                </defs>

                <path d={areaPath} fill="url(#salesFill)" />

                <path
                  d={graphPath}
                  fill="none"
                  stroke="#b51a2b"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {points.map((point, index) => (
                  <circle
                    key={index}
                    cx={point.x}
                    cy={point.y}
                    r="4"
                    fill="#ffb2b8"
                    stroke="#b51a2b"
                    strokeWidth="2"
                  />
                ))}
              </svg>
            </div>

            <div className="mt-2 flex justify-between gap-2 overflow-hidden text-[10px] text-gray-500">
              {salesLabels.length > 0 ? (
                salesLabels.map((label, index) => (
                  <span key={`${label}-${index}`} className="truncate">
                    {label}
                  </span>
                ))
              ) : (
                <span>
                  No sales history available yet. The graph will update when
                  your API returns sales data.
                </span>
              )}
            </div>
          </div>
        </section>

        {/* Top products and recent orders */}
        <section className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-2">
          <div className="rounded-xl border border-[#303846] bg-[#202936] p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold">Top Products</h2>
                <p className="mt-1 text-xs text-gray-500">
                  Best-selling laptops
                </p>
              </div>
              <button
                type="button"
                onClick={() => navigate("/admin/products")}
                className="text-xs text-[#ffb2b8] hover:text-white"
              >
                View all →
              </button>
            </div>

            <div className="mt-4">
              {topProducts.length > 0 ? (
                topProducts.slice(0, 5).map((product, index) => {
                  const name =
                    product.productName ||
                    product.name ||
                    "Unknown Product";

                  const image =
                    product.productImage ||
                    product.image ||
                    product.images?.[0] ||
                    "";

                  return (
                    <div
                      key={product._id || product.productId || `${name}-${index}`}
                      className="flex items-center gap-3 border-b border-[#303846] py-3 last:border-b-0"
                    >
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-[#171c24] text-[10px] text-gray-600">
                        {image ? (
                          <img
                            src={getImageUrl(image)}
                            alt={name}
                            className="h-full w-full object-cover"
                            onError={(event) => {
                              event.currentTarget.style.display = "none";
                            }}
                          />
                        ) : (
                          "LAPTOP"
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{name}</p>
                        <p className="mt-1 text-xs text-gray-500">
                          {product.category || "Laptop"}
                        </p>
                      </div>

                      <span className="shrink-0 text-xs text-green-300">
                        {formatNumber(
                          product.quantitySold ?? product.sold ?? product.totalSold
                        )}{" "}
                        sold
                      </span>
                    </div>
                  );
                })
              ) : (
                <div className="py-10 text-center">
                  <p className="text-sm text-gray-400">No top products yet</p>
                  <p className="mt-2 text-xs text-gray-600">
                    Product sales will appear here when available.
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="rounded-xl border border-[#303846] bg-[#202936] p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold">Recent Orders</h2>
                <p className="mt-1 text-xs text-gray-500">
                  Latest customer purchases
                </p>
              </div>
              <button
                type="button"
                onClick={() => navigate("/admin/orders")}
                className="text-xs text-[#ffb2b8] hover:text-white"
              >
                View all →
              </button>
            </div>

            <div className="mt-4 space-y-3">
              {recentOrders.length > 0 ? (
                recentOrders.slice(0, 5).map((order, index) => {
                  const customer =
                    order.userId?.name ||
                    order.user?.name ||
                    order.customerName ||
                    "Unknown Customer";

                  const status =
                    order.orderStatus ||
                    order.status ||
                    "Pending";

                  const firstItem = order.items?.[0];

                  return (
                    <div
                      key={order._id || order.orderId || index}
                      className="rounded-lg border border-[#303846] bg-[#171c24] p-4"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">
                            {customer}
                          </p>
                          <p className="mt-1 truncate text-xs text-gray-500">
                            {order.orderId ||
                              (order._id
                                ? `Order #${String(order._id).slice(-6)}`
                                : "Order")}
                          </p>
                        </div>

                        <span
                          className={`rounded-full px-2.5 py-1 text-[10px] ${getStatusStyle(status)}`}
                        >
                          {status}
                        </span>
                      </div>

                      <div className="mt-3 flex items-end justify-between gap-3">
                        <p className="min-w-0 truncate text-xs text-gray-400">
                          {firstItem?.productName ||
                            firstItem?.name ||
                            (order.items?.length > 1
                              ? `${order.items.length} products`
                              : "Laptop order")}
                        </p>
                        <p className="shrink-0 text-sm font-semibold">
                          {formatCurrency(
                            order.totalAmount ?? order.total ?? order.grandTotal
                          )}
                        </p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="py-10 text-center">
                  <p className="text-sm text-gray-400">No recent orders</p>
                  <p className="mt-2 text-xs text-gray-600">
                    New orders will appear here.
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Quick actions */}
        <section className="mt-6">
          <h2 className="text-base font-semibold">Quick Actions</h2>
          <p className="mt-1 text-xs text-gray-500">
            Shortcuts to common store management tasks
          </p>

          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {[
              {
                title: "Add New Product",
                description: "Add a laptop to your inventory",
                path: "/admin/products/add",
                icon: "+",
              },
              {
                title: "Manage Categories",
                description: "View and manage product categories",
                path: "/admin/categories",
                icon: "▦",
              },
              {
                title: "Manage Users",
                description: "View and manage customers",
                path: "/admin/users",
                icon: "♙",
              },
            ].map((action) => (
              <button
                type="button"
                key={action.title}
                onClick={() => navigate(action.path)}
                className="flex items-start gap-4 rounded-xl border border-[#303846] bg-[#202936] p-5 text-left transition hover:border-[#b51a2b]"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#b51a2b]/15 text-xl text-[#ffb2b8]">
                  {action.icon}
                </span>
                <span>
                  <span className="block text-sm font-medium">
                    {action.title}
                  </span>
                  <span className="mt-2 block text-xs text-gray-500">
                    {action.description}
                  </span>
                </span>
                <span className="ml-auto text-gray-500">→</span>
              </button>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

export default AdminDashboard;
