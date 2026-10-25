
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api/axios";

const BACKEND_URL =
  import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

function getImageUrl(image) {
  if (!image || typeof image !== "string") return "";

  const cleanImage = image.trim();
  if (!cleanImage) return "";

  if (
    cleanImage.startsWith("http://") ||
    cleanImage.startsWith("https://") ||
    cleanImage.startsWith("data:")
  ) {
    return cleanImage;
  }

  return `${BACKEND_URL}/${cleanImage.replace(/^\/+/, "")}`;
}

function ProductImage({ image, name }) {
  const [imageFailed, setImageFailed] = useState(false);
  const imageUrl = getImageUrl(image);

  useEffect(() => {
    setImageFailed(false);
  }, [image]);

  if (!imageUrl || imageFailed) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center bg-[#171d26] text-gray-400">
        <span className="text-5xl" role="img" aria-label="Laptop">💻</span>
        <span className="mt-2 text-xs">Image unavailable</span>
      </div>
    );
  }

  return (
    <img
      src={imageUrl}
      alt={name || "LAPZONE laptop"}
      className="h-full w-full object-contain p-2"
      loading="lazy"
      onError={() => {
        console.error("Product image failed to load:", imageUrl);
        setImageFailed(true);
      }}
    />
  );
}

function OrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloadingInvoice, setDownloadingInvoice] = useState(false);

  const [alertModal, setAlertModal] = useState({
    show: false,
    message: "",
    type: "error",
    action: null,
  });

  const [reasonModal, setReasonModal] = useState({
    show: false,
    type: "order",
    productId: null,
  });

  const [cancellationReason, setCancellationReason] = useState("");
  const [returnReason, setReturnReason] = useState("");
  const [submittingReason, setSubmittingReason] = useState(false);

  const showAlert = (message, type = "error", action = null) => {
    setAlertModal({ show: true, message, type, action });
  };

  const closeAlert = () => {
    const action = alertModal.action;

    setAlertModal({
      show: false,
      message: "",
      type: "error",
      action: null,
    });

    if (action === "orders") navigate("/orders");
  };

  const closeReasonModal = () => {
    if (submittingReason) return;

    setReasonModal({
      show: false,
      type: "order",
      productId: null,
    });
    setCancellationReason("");
    setReturnReason("");
  };

  // FETCH ORDER
  const fetchOrder = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      const response = await api.get(`/orders/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setOrder(response.data.order || null);
    } catch (error) {
      console.error(
        "Fetch order details error:",
        error.response?.data || error.message
      );

      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
        return;
      }

      showAlert(
        error.response?.data?.message || "Failed to load order details.",
        "error",
        "orders"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  // FORMAT DATE
  const formatDate = (date) => {
    if (!date) return "—";

    const parsedDate = new Date(date);
    if (Number.isNaN(parsedDate.getTime())) return "—";

    return parsedDate.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // OPEN CANCELLATION MODAL
  const handleCancelOrder = () => {
    setCancellationReason("");
    setReasonModal({
      show: true,
      type: "order",
      productId: null,
    });
  };

  const handleCancelOrderItem = (productId) => {
    if (!productId) {
      showAlert("Product details are unavailable.");
      return;
    }

    setCancellationReason("");
    setReasonModal({
      show: true,
      type: "product",
      productId,
    });
  };

  // SUBMIT CANCELLATION
  const submitCancellation = async () => {
    if (!order?._id || submittingReason) return;

    try {
      setSubmittingReason(true);

      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      const isWholeOrder = reasonModal.type === "order";

      const url = isWholeOrder
        ? `/orders/${order._id}/cancel`
        : `/orders/${order._id}/items/${reasonModal.productId}/cancel`;

      const response = await api.patch(
        url,
        { cancellationReason: cancellationReason.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setReasonModal({
        show: false,
        type: "order",
        productId: null,
      });
      setCancellationReason("");

      await fetchOrder();

      showAlert(
        response.data?.message || "Cancellation completed successfully.",
        "success"
      );
    } catch (error) {
      console.error(
        "Cancellation error:",
        error.response?.data || error.message
      );

      setReasonModal({
        show: false,
        type: "order",
        productId: null,
      });

      showAlert(
        error.response?.data?.message ||
          "Failed to cancel. Please try again."
      );
    } finally {
      setSubmittingReason(false);
    }
  };

  // OPEN RETURN MODAL
  const handleReturnOrder = () => {
    setReturnReason("");
    setReasonModal({
      show: true,
      type: "return",
      productId: null,
    });
  };

  // SUBMIT RETURN REQUEST
  const submitReturnRequest = async () => {
    if (!returnReason.trim()) {
      showAlert("Please enter a reason for returning this order.");
      return;
    }

    if (submittingReason) return;

    try {
      setSubmittingReason(true);

      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      const response = await api.patch(
        `/orders/${order._id}/return`,
        { returnReason: returnReason.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setReasonModal({
        show: false,
        type: "order",
        productId: null,
      });
      setReturnReason("");

      await fetchOrder();

      showAlert(
        response.data?.message ||
          "Return request submitted successfully.",
        "success"
      );
    } catch (error) {
      console.error(
        "Return order error:",
        error.response?.data || error.message
      );

      setReasonModal({
        show: false,
        type: "order",
        productId: null,
      });

      showAlert(
        error.response?.data?.message ||
          "Failed to submit return request."
      );
    } finally {
      setSubmittingReason(false);
    }
  };

  // DOWNLOAD INVOICE
  const downloadInvoice = async () => {
    try {
      setDownloadingInvoice(true);

      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      const response = await api.get(`/orders/${id}/invoice`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: "blob",
      });

      const blob = new Blob([response.data], {
        type: "application/pdf",
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = `LAPZONE-${order?.orderId || id}.pdf`;

      document.body.appendChild(link);
      link.click();
      link.remove();

      window.setTimeout(() => {
        window.URL.revokeObjectURL(url);
      }, 1000);
    } catch (error) {
      console.error(
        "Download invoice error:",
        error.response?.data || error.message
      );

      showAlert("Failed to download invoice. Please try again.");
    } finally {
      setDownloadingInvoice(false);
    }
  };

  // BUY AGAIN
  const handleBuyAgain = (productId) => {
    if (!productId) {
      showAlert("Product details are unavailable.");
      return;
    }

    navigate(`/products/${productId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#151a23] flex items-center justify-center">
        <p className="text-gray-300 font-semibold">
          Loading order details...
        </p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-[#151a23]">
        {alertModal.show && (
          <AlertModal alertModal={alertModal} onClose={closeAlert} />
        )}
      </div>
    );
  }

  const statusSteps = [
    "Pending",
    "Shipped",
    "Out for Delivery",
    "Delivered",
  ];

  const statusIndex = statusSteps.indexOf(order.orderStatus);
  const currentStatusIndex = statusIndex < 0 ? 0 : statusIndex;
  const isCancelled = order.orderStatus === "Cancelled";
  const items = Array.isArray(order.items) ? order.items : [];

  const getStatusLabel = (status) => {
    if (status === "Pending") return "PLACED";
    if (status === "Shipped") return "SHIPPED";
    if (status === "Out for Delivery") return "IN TRANSIT";
    if (status === "Delivered") return "DELIVERED";
    return status.toUpperCase();
  };

  return (
    <div className="min-h-screen bg-[#151a23] text-white">
      <main className="max-w-6xl mx-auto px-5 md:px-8 py-7">
        {/* TOP SECTION */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5 mb-6">
          <div>
            <button
              type="button"
              onClick={() => navigate("/orders")}
              className="text-xs text-gray-400 hover:text-white mb-3"
            >
              ← BACK TO MY ORDERS
            </button>

            <p className="text-[9px] uppercase tracking-widest text-gray-500">
              ORDER DETAILS
            </p>

            <div className="flex flex-wrap items-center gap-3 mt-2">
              <h1 className="text-sm md:text-base font-bold">
                #{order.orderId}
              </h1>

              <span
                className={`px-3 py-1 rounded text-[9px] font-bold ${
                  isCancelled
                    ? "bg-red-500/20 text-red-400"
                    : order.orderStatus === "Delivered"
                    ? "bg-green-500/20 text-green-400"
                    : "bg-[#b51a2b]/20 text-[#ff5368]"
                }`}
              >
                {order.orderStatus?.toUpperCase() || "UNKNOWN"}
              </span>
            </div>

            <p className="text-[10px] text-gray-400 mt-2">
              Placed on {formatDate(order.createdAt)}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={downloadInvoice}
              disabled={downloadingInvoice}
              className="px-4 py-2 bg-[#384358] rounded-md text-[10px] font-semibold hover:bg-[#46536a] disabled:opacity-50"
            >
              {downloadingInvoice ? "DOWNLOADING..." : "▣ INVOICE"}
            </button>

            {order.orderStatus === "Delivered" &&
              (!order.returnStatus ||
                order.returnStatus === "Not Requested") && (
                <button
                  type="button"
                  onClick={handleReturnOrder}
                  className="px-4 py-2 border border-[#b51a2b] text-[#ff5368] rounded-md text-[10px] font-semibold hover:bg-[#b51a2b]/10"
                >
                  ↩ RETURN
                </button>
              )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[190px_1fr] gap-5">
          {/* LEFT SIDEBAR */}
          <aside className="hidden lg:block">
            <div className="bg-[#202733] rounded-lg border border-[#303a49] p-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#b51a2b] flex items-center justify-center">
                  👤
                </div>

                <div className="min-w-0">
                  <p className="text-xs font-bold truncate">
                    {order.shippingAddress?.fullName || "Customer"}
                  </p>
                  <p className="text-[8px] text-gray-500 truncate">
                    LAPZONE CUSTOMER
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-5 space-y-2">
              <button
                type="button"
                onClick={() => navigate("/profile")}
                className="w-full text-left px-4 py-3 text-[9px] text-gray-400 hover:text-white"
              >
                ◎ PROFILE
              </button>

              <button
                type="button"
                onClick={() => navigate("/orders")}
                className="w-full text-left px-4 py-3 bg-[#b51a2b] rounded-md text-[9px] font-bold"
              >
                ▣ ORDER HISTORY
              </button>

              <button
                type="button"
                onClick={() => navigate("/wishlist")}
                className="w-full text-left px-4 py-3 text-[9px] text-gray-400 hover:text-white"
              >
                ♡ WISHLIST
              </button>

              <button
                type="button"
                onClick={() => navigate("/addresses")}
                className="w-full text-left px-4 py-3 text-[9px] text-gray-400 hover:text-white"
              >
                ▣ ADDRESSES
              </button>
            </div>
          </aside>

          {/* RIGHT CONTENT */}
          <div className="space-y-5">
            {/* DELIVERY STATUS */}
            <section className="bg-[#202733] border border-[#303a49] rounded-lg p-5">
              <div className="flex items-center justify-between">
                <p className="text-[9px] uppercase tracking-widest text-gray-400">
                  Delivery Status
                </p>
                <span className="text-[8px] text-gray-500">
                  ORDER TRACKING
                </span>
              </div>

              {isCancelled ? (
                <div className="mt-6 py-6 text-center">
                  <div className="w-10 h-10 mx-auto rounded-full bg-red-500/20 flex items-center justify-center text-red-400">
                    ✕
                  </div>

                  <p className="text-xs font-bold text-red-400 mt-3">
                    ORDER CANCELLED
                  </p>

                  {order.cancellationReason && (
                    <p className="text-[9px] text-gray-400 mt-2">
                      Reason: {order.cancellationReason}
                    </p>
                  )}
                </div>
              ) : (
                <div className="relative mt-8">
                  <div className="absolute top-3 left-[6%] right-[6%] h-[2px] bg-[#3b4555]" />

                  <div
                    className="absolute top-3 left-[6%] h-[2px] bg-[#b51a2b]"
                    style={{
                      width:
                        currentStatusIndex === 0
                          ? "0%"
                          : currentStatusIndex === 1
                          ? "29%"
                          : currentStatusIndex === 2
                          ? "58%"
                          : "88%",
                    }}
                  />

                  <div className="relative grid grid-cols-4">
                    {statusSteps.map((step, index) => {
                      const completed = index <= currentStatusIndex;

                      return (
                        <div
                          key={step}
                          className="flex flex-col items-center"
                        >
                          <div
                            className={`w-7 h-7 rounded-full flex items-center justify-center border-2 ${
                              completed
                                ? "bg-[#b51a2b] border-[#b51a2b]"
                                : "bg-[#384358] border-[#384358]"
                            }`}
                          >
                            <span className="text-[9px]">
                              {index === 0
                                ? "▣"
                                : index === 1
                                ? "●"
                                : index === 2
                                ? "➜"
                                : "✓"}
                            </span>
                          </div>

                          <p
                            className={`text-[8px] uppercase mt-2 text-center ${
                              index === currentStatusIndex
                                ? "text-[#ff5368] font-bold"
                                : "text-gray-400"
                            }`}
                          >
                            {getStatusLabel(step)}
                          </p>

                          {index === currentStatusIndex && (
                            <p className="text-[7px] text-gray-500 mt-1">
                              {formatDate(order.createdAt)}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </section>

            {/* PRODUCTS AND FINANCIAL SUMMARY */}
            <div className="grid grid-cols-1 xl:grid-cols-[1fr_230px] gap-5">
              <section className="space-y-4">
                {items.map((item, index) => (
                  <div
                    key={item._id || index}
                    className="bg-[#202733] border border-[#303a49] rounded-lg p-4"
                  >
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="w-full sm:w-36 h-32 bg-[#151a23] rounded-md overflow-hidden flex items-center justify-center flex-shrink-0">
                        <ProductImage
                          image={item.productImage || item.image}
                          name={item.productName}
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:justify-between gap-3">
                          <div>
                            <p className="text-xs text-gray-400 uppercase">
                              Product
                            </p>
                            <h2 className="font-bold text-sm mt-1">
                              {item.productName || "LAPZONE Laptop"}
                            </h2>
                            <p className="text-[9px] text-gray-500 mt-1">
                              LAPZONE LAPTOP
                            </p>
                          </div>

                          <div className="sm:text-right">
                            <p className="text-[8px] text-gray-400 uppercase">
                              Unit Price
                            </p>
                            <p className="text-sm font-bold text-[#ff5368] mt-1">
                              ₹{Number(item.price || 0).toLocaleString("en-IN")}
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-4">
                          <div className="bg-[#171d26] rounded-md p-2">
                            <p className="text-[7px] text-gray-400 uppercase">
                              Quantity
                            </p>
                            <p className="text-[10px] font-bold mt-1">
                              {item.quantity || 1}
                            </p>
                          </div>

                          <div className="bg-[#171d26] rounded-md p-2">
                            <p className="text-[7px] text-gray-400 uppercase">
                              Item Total
                            </p>
                            <p className="text-[10px] font-bold mt-1">
                              ₹
                              {Number(
                                item.itemTotal ??
                                  Number(item.price || 0) *
                                    Number(item.quantity || 1)
                              ).toLocaleString("en-IN")}
                            </p>
                          </div>

                          <div className="bg-[#171d26] rounded-md p-2">
                            <p className="text-[7px] text-gray-400 uppercase">
                              Status
                            </p>
                            <p
                              className={`text-[10px] font-bold mt-1 ${
                                item.cancelled
                                  ? "text-red-400"
                                  : "text-green-400"
                              }`}
                            >
                              {item.cancelled ? "CANCELLED" : "ACTIVE"}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2 mt-4">
                          {!item.cancelled && (
                            <button
                              type="button"
                              onClick={() =>
                                handleBuyAgain(
                                  item.productId?._id || item.productId
                                )
                              }
                              className="px-4 py-2 bg-[#b51a2b] text-white rounded-md text-[9px] font-semibold hover:bg-[#c9273c]"
                            >
                              BUY AGAIN
                            </button>
                          )}

                          {order.orderStatus === "Pending" &&
                            !item.cancelled && (
                              <button
                                type="button"
                                onClick={() =>
                                  handleCancelOrderItem(
                                    item.productId?._id || item.productId
                                  )
                                }
                                className="px-4 py-2 border border-red-500 text-red-400 rounded-md text-[9px] font-semibold hover:bg-red-500/10"
                              >
                                CANCEL PRODUCT
                              </button>
                            )}
                        </div>

                        {item.cancelled && (
                          <div className="mt-3">
                            <p className="text-[8px] text-red-400 font-semibold">
                              PRODUCT CANCELLED
                            </p>

                            {item.cancellationReason && (
                              <p className="text-[8px] text-gray-400 mt-1">
                                Reason: {item.cancellationReason}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </section>

              {/* FINANCIAL SUMMARY */}
              <aside>
                <div className="bg-gradient-to-br from-[#303a4b] to-[#4b405d] rounded-lg p-5">
                  <p className="text-[9px] uppercase tracking-widest text-gray-300">
                    Financial Summary
                  </p>

                  <div className="space-y-3 mt-5">
                    <div className="flex justify-between gap-3 text-[9px]">
                      <span className="text-gray-300">Subtotal</span>
                      <span>
                        ₹{Number(order.subtotal || 0).toLocaleString("en-IN")}
                      </span>
                    </div>

                    <div className="flex justify-between gap-3 text-[9px]">
                      <span className="text-gray-300">Discount</span>
                      <span className="text-[#ff5368]">
                        -₹{Number(order.discount || 0).toLocaleString("en-IN")}
                      </span>
                    </div>

                    <div className="flex justify-between gap-3 text-[9px]">
                      <span className="text-gray-300">Delivery</span>
                      <span className="text-green-400">FREE</span>
                    </div>

                    <div className="flex justify-between gap-3 text-[9px]">
                      <span className="text-gray-300">Payment</span>
                      <span>{order.paymentMethod || "—"}</span>
                    </div>
                  </div>

                  <div className="border-t border-white/10 mt-5 pt-5">
                    <p className="text-[8px] text-gray-300 uppercase">
                      Total Value
                    </p>
                    <p className="text-2xl font-bold text-[#ff5368] mt-1">
                      ₹{Number(order.totalAmount || 0).toLocaleString("en-IN")}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={downloadInvoice}
                    disabled={downloadingInvoice}
                    className="w-full mt-5 py-3 bg-[#b51a2b] rounded-md text-[9px] font-bold hover:bg-[#c9273c] disabled:opacity-50"
                  >
                    {downloadingInvoice
                      ? "DOWNLOADING..."
                      : "DOWNLOAD INVOICE"}
                  </button>
                </div>
              </aside>
            </div>

            {/* DELIVERY AND TRANSACTION */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <section className="bg-[#202733] border border-[#303a49] rounded-lg p-5">
                <p className="text-[9px] uppercase tracking-widest text-gray-400">
                  Delivery Address
                </p>

                <p className="text-xs font-bold mt-4">
                  {order.shippingAddress?.fullName || "—"}
                </p>
                <p className="text-[9px] text-gray-400 mt-1">
                  {order.shippingAddress?.addressLine || "—"}
                </p>
                <p className="text-[9px] text-gray-400">
                  {order.shippingAddress?.city || ""}
                  {order.shippingAddress?.state
                    ? `, ${order.shippingAddress.state}`
                    : ""}
                </p>
                <p className="text-[9px] text-gray-400">
                  PIN: {order.shippingAddress?.pincode || "—"}
                </p>
                <p className="text-[9px] text-gray-400 mt-2">
                  ☎ {order.shippingAddress?.phone || "—"}
                </p>
              </section>

              <section className="bg-[#202733] border border-[#303a49] rounded-lg p-5">
                <p className="text-[9px] uppercase tracking-widest text-gray-400">
                  Payment Information
                </p>

                <div className="space-y-3 mt-4">
                  <div className="flex justify-between gap-3">
                    <span className="text-[9px] text-gray-400">Method</span>
                    <span className="text-[9px] font-semibold">
                      {order.paymentMethod || "—"}
                    </span>
                  </div>

                  <div className="flex justify-between gap-3">
                    <span className="text-[9px] text-gray-400">Status</span>
                    <span
                      className={`text-[9px] font-semibold ${
                        order.paymentStatus === "Paid"
                          ? "text-green-400"
                          : "text-orange-400"
                      }`}
                    >
                      {order.paymentStatus || "Pending"}
                    </span>
                  </div>
                </div>
              </section>
            </div>

            {/* ORDER ACTIONS */}
            <section className="bg-[#202733] border border-[#303a49] rounded-lg p-5">
              <div className="flex flex-col md:flex-row gap-3">
                <button
                  type="button"
                  onClick={() => navigate("/orders")}
                  className="flex-1 py-3 bg-[#384358] rounded-lg font-semibold hover:bg-[#46536a]"
                >
                  MY ORDERS
                </button>

                {order.orderStatus !== "Cancelled" &&
                  order.orderStatus !== "Delivered" && (
                    <button
                      type="button"
                      onClick={handleCancelOrder}
                      className="flex-1 py-3 border border-red-500 text-red-400 rounded-md text-[9px] font-bold hover:bg-red-500/10"
                    >
                      CANCEL ORDER
                    </button>
                  )}

                {order.orderStatus === "Delivered" &&
                  (!order.returnStatus ||
                    order.returnStatus === "Not Requested") && (
                    <button
                      type="button"
                      onClick={handleReturnOrder}
                      className="flex-1 py-3 border border-orange-500 text-orange-400 rounded-md text-[9px] font-bold hover:bg-orange-500/10"
                    >
                      ↩ RETURN ORDER
                    </button>
                  )}

                <button
                  type="button"
                  onClick={() => navigate("/products")}
                  className="flex-1 py-3 bg-[#b51a2b] rounded-md text-[9px] font-bold hover:bg-[#c9273c]"
                >
                  CONTINUE SHOPPING
                </button>
              </div>

              {order.returnStatus &&
                order.returnStatus !== "Not Requested" && (
                  <div className="mt-4 bg-[#171d26] rounded-md p-4">
                    <p className="text-[8px] uppercase text-gray-400">
                      Return Status
                    </p>
                    <p className="text-xs font-bold text-orange-400 mt-2">
                      {order.returnStatus}
                    </p>
                    {order.returnReason && (
                      <p className="text-[9px] text-gray-400 mt-1">
                        Reason: {order.returnReason}
                      </p>
                    )}
                  </div>
                )}
            </section>
          </div>
        </div>
      </main>

      {/* CUSTOM REASON MODAL */}
      {reasonModal.show && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/75 p-4"
          onClick={(event) => {
            if (
              event.target === event.currentTarget &&
              !submittingReason
            ) {
              closeReasonModal();
            }
          }}
        >
          <div
            className="w-full max-w-md rounded-2xl border border-[#414d5e] bg-[#202936] p-6 shadow-2xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="reason-modal-title"
          >
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold tracking-[0.2em] text-[#ff5368]">
                  LAPZONE
                </p>
                <h2
                  id="reason-modal-title"
                  className="mt-2 text-xl font-bold text-white"
                >
                  {reasonModal.type === "return"
                    ? "Return Order"
                    : reasonModal.type === "product"
                    ? "Cancel Product"
                    : "Cancel Order"}
                </h2>
                <p className="mt-2 text-sm text-gray-400">
                  {reasonModal.type === "return"
                    ? "Please tell us why you want to return this order."
                    : "Please tell us why you want to cancel."}
                </p>
              </div>

              <button
                type="button"
                onClick={closeReasonModal}
                disabled={submittingReason}
                className="text-2xl leading-none text-gray-400 hover:text-white disabled:opacity-50"
                aria-label="Close modal"
              >
                ×
              </button>
            </div>

            <label
              htmlFor="order-action-reason"
              className="mb-2 block text-sm font-medium text-gray-200"
            >
              {reasonModal.type === "return"
                ? "Return reason"
                : "Cancellation reason"}
              {reasonModal.type !== "return" && (
                <span className="ml-1 text-gray-500">(optional)</span>
              )}
            </label>

            <textarea
              id="order-action-reason"
              value={
                reasonModal.type === "return"
                  ? returnReason
                  : cancellationReason
              }
              onChange={(event) => {
                if (reasonModal.type === "return") {
                  setReturnReason(event.target.value);
                } else {
                  setCancellationReason(event.target.value);
                }
              }}
              placeholder={
                reasonModal.type === "return"
                  ? "Enter your return reason..."
                  : "Enter your cancellation reason..."
              }
              rows={4}
              maxLength={500}
              disabled={submittingReason}
              className="w-full resize-none rounded-lg border border-[#414d5e] bg-[#171d26] p-3 text-sm text-white outline-none placeholder:text-gray-500 focus:border-[#b51a2b] disabled:opacity-50"
            />

            <p className="mt-1 text-right text-xs text-gray-500">
              {(reasonModal.type === "return"
                ? returnReason
                : cancellationReason
              ).length}
              /500
            </p>

            <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row">
              <button
                type="button"
                onClick={closeReasonModal}
                disabled={submittingReason}
                className="flex-1 rounded-lg border border-[#414d5e] py-3 text-sm font-semibold text-gray-300 hover:bg-white/5 disabled:opacity-50"
              >
                Go Back
              </button>

              <button
                type="button"
                onClick={
                  reasonModal.type === "return"
                    ? submitReturnRequest
                    : submitCancellation
                }
                disabled={
                  submittingReason ||
                  (reasonModal.type === "return" &&
                    !returnReason.trim())
                }
                className="flex-1 rounded-lg bg-[#b51a2b] py-3 text-sm font-semibold text-white hover:bg-[#c9273c] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submittingReason
                  ? "PLEASE WAIT..."
                  : reasonModal.type === "return"
                  ? "Submit Return"
                  : reasonModal.type === "product"
                  ? "Cancel Product"
                  : "Cancel Order"}
              </button>
            </div>
          </div>
        </div>
      )}

      {alertModal.show && (
        <AlertModal alertModal={alertModal} onClose={closeAlert} />
      )}
    </div>
  );
}

function AlertModal({ alertModal, onClose }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="order-alert-title"
    >
      <div className="w-full max-w-sm rounded-2xl border border-gray-700 bg-[#1d222c] p-6 shadow-2xl">
        <div className="flex flex-col items-center text-center">
          <div
            className={`mb-4 flex h-14 w-14 items-center justify-center rounded-full text-2xl ${
              alertModal.type === "success"
                ? "bg-green-500/15 text-green-400"
                : "bg-[#b51a2b]/15 text-[#ff5368]"
            }`}
          >
            {alertModal.type === "success" ? "✓" : "!"}
          </div>

          <h2
            id="order-alert-title"
            className="text-lg font-semibold text-white"
          >
            {alertModal.type === "success" ? "SUCCESS" : "NOTICE"}
          </h2>

          <p className="mt-3 text-sm leading-6 text-gray-300">
            {alertModal.message}
          </p>

          <button
            type="button"
            onClick={onClose}
            autoFocus
            className="mt-6 w-full rounded-lg bg-[#b51a2b] py-3 text-sm font-semibold text-white hover:bg-[#c9273c]"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
}

export default OrderDetails;
