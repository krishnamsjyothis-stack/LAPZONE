
import { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Package,
  UserRound,
  MapPin,
  CreditCard,
  Receipt,
  Truck,
  CalendarDays,
  Phone,
  Mail,
  CheckCircle2,
  Clock,
  RefreshCw,
  ShoppingBag,
  Boxes,
  ShieldCheck,
} from "lucide-react";
import api from "../../api/axios";

const STATUS_STYLES = {
  Pending: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  Processing: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  Shipped: "bg-violet-500/10 text-violet-400 border-violet-500/20",
  "Out for Delivery":
    "bg-orange-500/10 text-orange-400 border-orange-500/20",
  Delivered: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  Cancelled: "bg-red-500/10 text-red-400 border-red-500/20",
};

const PAYMENT_STYLES = {
  Paid: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  Completed: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  Pending: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  Failed: "bg-red-500/10 text-red-400 border-red-500/20",
  Refunded: "bg-blue-500/10 text-blue-400 border-blue-500/20",
};

const STATUS_OPTIONS = [
  "Pending",
  "Processing",
  "Shipped",
  "Out for Delivery",
  "Delivered",
  "Cancelled",
];

const getToken = () =>
  localStorage.getItem("adminToken") ||
  localStorage.getItem("token");

const formatCurrency = (value) =>
  Number(value || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const formatDate = (value) => {
  if (!value) return "Not available";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Not available";

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getProductImage = (image) => {
  if (!image) return "/placeholder.png";

  if (/^https?:\/\//i.test(image)) return image;

  return `https://lapzone-backend-psqn.onrender.com${
    image.startsWith("/") ? image : `/${image}`
  }`;
};

const Card = ({ children, className = "" }) => (
  <section
    className={`rounded-2xl border border-slate-700/70 bg-[#1b2433] shadow-lg shadow-black/10 ${className}`}
  >
    {children}
  </section>
);

const SectionHeading = ({ icon: Icon, title, subtitle, action }) => (
  <div className="flex flex-col gap-3 border-b border-slate-700/70 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#b51a2b]/15 text-[#ff7b88]">
        <Icon size={20} />
      </div>
      <div>
        <h2 className="font-semibold text-white">{title}</h2>
        {subtitle && (
          <p className="mt-1 text-xs text-slate-400">{subtitle}</p>
        )}
      </div>
    </div>
    {action}
  </div>
);

const InfoItem = ({ label, value, icon: Icon }) => (
  <div className="min-w-0 rounded-xl border border-slate-700/60 bg-[#151d29] p-4">
    <div className="mb-2 flex items-center gap-2 text-xs text-slate-400">
      {Icon && <Icon size={14} className="text-slate-500" />}
      {label}
    </div>
    <p className="break-words text-sm font-medium text-slate-100">
      {value || "Not available"}
    </p>
  </div>
);

const StatusBadge = ({ status }) => (
  <span
    className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold ${
      STATUS_STYLES[status] ||
      "border-slate-600 bg-slate-700/40 text-slate-300"
    }`}
  >
    <span className="h-1.5 w-1.5 rounded-full bg-current" />
    {status || "Pending"}
  </span>
);

const AdminOrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const fetchOrder = useCallback(async () => {
    try {
      setLoading(true);

      const token = getToken();

      if (!token) {
        alert("Admin token not found. Please log in again.");
        navigate("/admin/login");
        return;
      }

      const response = await api.get(`/admin/orders/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const fetchedOrder = response.data?.order ?? response.data;

      if (!fetchedOrder?._id) {
        throw new Error("Order details were not found.");
      }

      setOrder(fetchedOrder);
      setStatus(fetchedOrder.orderStatus || "Pending");
    } catch (error) {
      console.error(
        "Fetch admin order error:",
        error.response?.data || error.message
      );

      alert(
        error.response?.data?.message ||
          "Failed to fetch order details."
      );

      navigate("/admin/orders");
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  const handleStatusUpdate = async () => {
    if (!status) {
      alert("Please select an order status.");
      return;
    }

    if (status === order?.orderStatus) {
      alert("The selected status is already active.");
      return;
    }

    try {
      const token = getToken();

      if (!token) {
        alert("Admin token not found. Please log in again.");
        navigate("/admin/login");
        return;
      }

      setUpdatingStatus(true);

      const response = await api.patch(
        `/admin/orders/${id}/status`,
        { orderStatus: status },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const updatedOrder = response.data?.order ?? response.data;

      if (!updatedOrder) {
        throw new Error("Updated order was not returned by the server.");
      }

      setOrder((previous) => ({
        ...previous,
        ...updatedOrder,
        orderStatus: updatedOrder.orderStatus || status,
      }));

      setStatus(updatedOrder.orderStatus || status);

      alert("Order status updated successfully.");
    } catch (error) {
      console.error(
        "Update status error:",
        error.response?.data || error.message
      );

      alert(
        error.response?.data?.message ||
          "Failed to update order status."
      );
    } finally {
      setUpdatingStatus(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#11161e]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-700 border-t-[#b51a2b]" />
          <p className="text-sm text-slate-400">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#11161e] px-4 text-center">
        <Package size={42} className="text-slate-500" />
        <h2 className="text-xl font-semibold text-white">
          Order not available
        </h2>
        <button
          type="button"
          onClick={() => navigate("/admin/orders")}
          className="rounded-xl bg-[#b51a2b] px-5 py-3 text-sm font-semibold text-white hover:bg-[#961626]"
        >
          Back to Orders
        </button>
      </div>
    );
  }

  const items = order.items || [];
  const shipping = order.shippingAddress || {};
  const paymentStatus = order.paymentStatus || "Not available";

  const subtotal =
    order.subtotal ??
    items.reduce(
      (sum, item) =>
        sum +
        Number(item.price || 0) * Number(item.quantity || 0),
      0
    );

  const discount = Number(order.discount || 0);
  const deliveryCharge = Number(order.deliveryCharge || 0);
  const total = Number(
    order.totalAmount ?? subtotal - discount + deliveryCharge
  );

  return (
    <div className="min-h-screen bg-[#11161e] px-4 py-6 text-slate-200 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Page heading */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <button
              type="button"
              onClick={() => navigate("/admin/orders")}
              className="mb-4 inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-white"
            >
              <ArrowLeft size={16} />
              Back to orders
            </button>

            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                Order Details
              </h1>
              <StatusBadge status={order.orderStatus} />
            </div>

            <p className="mt-2 break-all text-sm text-slate-400">
              Order reference:{" "}
              <span className="font-medium text-slate-300">
                {order.orderId || order._id}
              </span>
            </p>
          </div>

          <button
            type="button"
            onClick={fetchOrder}
            className="inline-flex items-center justify-center gap-2 self-start rounded-xl border border-slate-700 bg-[#1b2433] px-4 py-3 text-sm font-medium text-slate-200 transition hover:border-slate-500 hover:bg-[#253146]"
          >
            <RefreshCw size={16} />
            Refresh order
          </button>
        </div>

        {/* Overview cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-blue-500/20 bg-gradient-to-br from-blue-500/10 to-[#1b2433] p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-400">Order total</span>
              <Receipt className="text-blue-400" size={21} />
            </div>
            <p className="mt-4 text-2xl font-bold text-white">
              ₹{formatCurrency(total)}
            </p>
            <p className="mt-2 text-xs text-slate-500">
              Final order amount
            </p>
          </div>

          <div className="rounded-2xl border border-violet-500/20 bg-gradient-to-br from-violet-500/10 to-[#1b2433] p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-400">Products</span>
              <ShoppingBag className="text-violet-400" size={21} />
            </div>
            <p className="mt-4 text-2xl font-bold text-white">
              {items.length}
            </p>
            <p className="mt-2 text-xs text-slate-500">
              Different product lines
            </p>
          </div>

          <div className="rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 to-[#1b2433] p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-400">Payment</span>
              <ShieldCheck className="text-emerald-400" size={21} />
            </div>
            <p className="mt-4 text-lg font-bold text-white">
              {paymentStatus}
            </p>
            <p className="mt-2 text-xs text-slate-500">
              {order.paymentMethod || "Payment method unavailable"}
            </p>
          </div>

          <div className="rounded-2xl border border-amber-500/20 bg-gradient-to-br from-amber-500/10 to-[#1b2433] p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-400">Order placed</span>
              <CalendarDays className="text-amber-400" size={21} />
            </div>
            <p className="mt-4 text-lg font-bold text-white">
              {order.createdAt
                ? new Date(order.createdAt).toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })
                : "Unavailable"}
            </p>
            <p className="mt-2 text-xs text-slate-500">
              {formatDate(order.createdAt)}
            </p>
          </div>
        </div>

        {/* Status management */}
        <Card>
          <SectionHeading
            icon={Truck}
            title="Order fulfillment"
            subtitle="Manage and update the current order status"
          />

          <div className="flex flex-col gap-4 p-5 sm:p-6 lg:flex-row lg:items-end">
            <div className="flex-1">
              <label
                htmlFor="order-status"
                className="mb-2 block text-sm font-medium text-slate-300"
              >
                New order status
              </label>

              <select
                id="order-status"
                value={status}
                onChange={(event) => setStatus(event.target.value)}
                disabled={updatingStatus}
                className="w-full rounded-xl border border-slate-700 bg-[#111923] px-4 py-3 text-sm text-white outline-none transition focus:border-[#b51a2b] focus:ring-2 focus:ring-[#b51a2b]/20 disabled:opacity-60"
              >
                {STATUS_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>

              <p className="mt-2 text-xs text-slate-500">
                Current status: {order.orderStatus || "Pending"}
              </p>
            </div>

            <button
              type="button"
              onClick={handleStatusUpdate}
              disabled={
                updatingStatus || status === (order.orderStatus || "Pending")
              }
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#b51a2b] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#961626] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {updatingStatus ? (
                <>
                  <RefreshCw size={16} className="animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <CheckCircle2 size={17} />
                  Save status
                </>
              )}
            </button>
          </div>
        </Card>

        {/* Customer and address */}
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <Card>
            <SectionHeading
              icon={UserRound}
              title="Customer information"
              subtitle="Contact details associated with this order"
            />

            <div className="grid grid-cols-1 gap-3 p-5 sm:grid-cols-2">
              <InfoItem
                label="Customer name"
                value={shipping.fullName || order.userId?.name}
                icon={UserRound}
              />
              <InfoItem
                label="Email address"
                value={order.userId?.email}
                icon={Mail}
              />
              <InfoItem
                label="Phone number"
                value={shipping.phone || order.userId?.phone}
                icon={Phone}
              />
              <InfoItem
                label="Customer ID"
                value={
                  typeof order.userId === "object"
                    ? order.userId?._id
                    : order.userId
                }
              />
            </div>
          </Card>

          <Card>
            <SectionHeading
              icon={MapPin}
              title="Delivery address"
              subtitle="Shipping destination for this order"
            />

            <div className="p-5">
              <div className="rounded-xl border border-slate-700/60 bg-[#151d29] p-5">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
                    <MapPin size={21} />
                  </div>
                  <div>
                    <p className="font-semibold text-white">
                      {shipping.fullName || "Recipient"}
                    </p>
                    <p className="mt-1 text-xs text-slate-400">
                      Delivery destination
                    </p>
                  </div>
                </div>

                <div className="space-y-2 text-sm leading-6 text-slate-300">
                  <p>{shipping.addressLine || "Address unavailable"}</p>
                  <p>
                    {[shipping.city, shipping.state]
                      .filter(Boolean)
                      .join(", ") || "City and state unavailable"}
                  </p>
                  <p>PIN: {shipping.pincode || "Not available"}</p>
                  <p>Phone: {shipping.phone || "Not available"}</p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Ordered products */}
        <Card>
          <SectionHeading
            icon={Boxes}
            title="Ordered products"
            subtitle={`${items.length} product line${items.length === 1 ? "" : "s"} in this order`}
          />

          {items.length > 0 ? (
            <div className="divide-y divide-slate-700/70">
              {items.map((item, index) => {
                const quantity = Number(item.quantity || 0);
                const price = Number(item.price || 0);
                const itemTotal =
                  item.itemTotal != null
                    ? Number(item.itemTotal)
                    : price * quantity;

                return (
                  <div
                    key={item._id || item.productId || index}
                    className="flex flex-col gap-4 p-5 transition hover:bg-white/[0.02] sm:flex-row sm:items-center sm:px-6"
                  >
                    <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-700 bg-white p-2">
                      <img
                        src={getProductImage(item.productImage)}
                        alt={item.productName || "Product"}
                        onError={(event) => {
                          event.currentTarget.onerror = null;
                          event.currentTarget.src = "/placeholder.png";
                        }}
                        className="h-full w-full object-contain"
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold uppercase tracking-wider text-[#ff7b88]">
                        Product {String(index + 1).padStart(2, "0")}
                      </p>
                      <h3 className="mt-1 break-words font-semibold text-white">
                        {item.productName || "Product"}
                      </h3>
                      <p className="mt-2 text-sm text-slate-400">
                        Unit price: ₹{formatCurrency(price)}
                      </p>
                      <p className="mt-1 text-sm text-slate-400">
                        Quantity: {quantity}
                      </p>
                    </div>

                    <div className="border-t border-slate-700 pt-3 sm:border-0 sm:pt-0 sm:text-right">
                      <p className="text-xs text-slate-500">Line total</p>
                      <p className="mt-1 text-lg font-bold text-white">
                        ₹{formatCurrency(itemTotal)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-10 text-center text-sm text-slate-400">
              No products found in this order.
            </div>
          )}
        </Card>

        {/* Payment and total summary */}
        <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-2">
          <Card>
            <SectionHeading
              icon={CreditCard}
              title="Payment information"
              subtitle="Payment method and transaction status"
            />

            <div className="space-y-3 p-5 sm:p-6">
              <div className="flex items-center justify-between gap-4 rounded-xl border border-slate-700/60 bg-[#151d29] p-4">
                <div>
                  <p className="text-xs text-slate-400">Payment method</p>
                  <p className="mt-1 font-semibold text-white">
                    {order.paymentMethod || "Not available"}
                  </p>
                </div>
                <CreditCard className="text-blue-400" size={22} />
              </div>

              <div className="flex items-center justify-between gap-4 rounded-xl border border-slate-700/60 bg-[#151d29] p-4">
                <div>
                  <p className="text-xs text-slate-400">Payment status</p>
                  <p className="mt-2">
                    <span
                      className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${
                        PAYMENT_STYLES[paymentStatus] ||
                        "border-slate-600 bg-slate-700/40 text-slate-300"
                      }`}
                    >
                      {paymentStatus}
                    </span>
                  </p>
                </div>
                <ShieldCheck className="text-emerald-400" size={22} />
              </div>

              <div className="flex items-center gap-3 rounded-xl bg-blue-500/5 p-4 text-sm text-slate-400">
                <Clock size={18} className="shrink-0 text-blue-400" />
                <p>
                  Order placed on {formatDate(order.createdAt)}.
                </p>
              </div>
            </div>
          </Card>

          <Card className="overflow-hidden">
            <div className="bg-gradient-to-r from-[#b51a2b] to-[#751725] px-6 py-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
                  <Receipt size={21} className="text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">
                    Order summary
                  </h2>
                  <p className="mt-1 text-xs text-white/70">
                    Price breakdown in INR
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4 p-5 sm:p-6">
              <div className="flex justify-between gap-4 text-sm">
                <span className="text-slate-400">Subtotal</span>
                <span className="font-medium text-white">
                  ₹{formatCurrency(subtotal)}
                </span>
              </div>

              <div className="flex justify-between gap-4 text-sm">
                <span className="text-slate-400">Discount</span>
                <span className="font-medium text-emerald-400">
                  − ₹{formatCurrency(discount)}
                </span>
              </div>

              <div className="flex justify-between gap-4 text-sm">
                <span className="text-slate-400">Delivery charge</span>
                <span className="font-medium text-white">
                  ₹{formatCurrency(deliveryCharge)}
                </span>
              </div>

              <div className="border-t border-dashed border-slate-700 pt-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold text-white">Total amount</p>
                    <p className="mt-1 text-xs text-slate-500">
                      Including delivery and discounts
                    </p>
                  </div>
                  <p className="text-2xl font-bold text-[#ff7b88]">
                    ₹{formatCurrency(total)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 rounded-xl border border-slate-700/60 bg-[#151d29] p-3 text-xs text-slate-400">
                <ShieldCheck size={16} className="shrink-0 text-emerald-400" />
                All amounts are displayed in Indian Rupees (INR).
              </div>
            </div>
          </Card>
        </div>

        {/* Bottom navigation */}
        <div className="flex flex-col justify-between gap-4 border-t border-slate-800 pt-5 sm:flex-row sm:items-center">
          <p className="text-xs text-slate-500">
            LAPZONE Admin · Order management
          </p>

          <button
            type="button"
            onClick={() => navigate("/admin/orders")}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 px-5 py-3 text-sm font-semibold text-slate-300 transition hover:border-slate-500 hover:bg-slate-800/60 hover:text-white"
          >
            <ArrowLeft size={16} />
            Return to orders
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminOrderDetails;
