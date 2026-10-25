
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../api/axios";

function OrderSuccess() {
  const navigate = useNavigate();
  const location = useLocation();

  const order = location.state?.order;

  const [downloadingInvoice, setDownloadingInvoice] =
    useState(false);

  // =========================================
  // CUSTOM ALERT MODAL
  // =========================================
  const [alertModal, setAlertModal] = useState({
    show: false,
    message: "",
    type: "error",
  });

  const showAlert = (message, type = "error") => {
    setAlertModal({
      show: true,
      message,
      type,
    });
  };

  const closeAlert = () => {
    setAlertModal({
      show: false,
      message: "",
      type: "error",
    });
  };

  // =========================================
  // DOWNLOAD INVOICE
  // =========================================
  const downloadInvoice = async () => {
    try {
      if (!order?._id) {
        showAlert("Order information is not available.");
        return;
      }

      setDownloadingInvoice(true);

      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      const response = await api.get(
        `/orders/${order._id}/invoice`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          responseType: "blob",
        }
      );

      const blob = new Blob([response.data], {
        type: "application/pdf",
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = `LAPZONE-${order.orderId}.pdf`;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error(
        "Download invoice error:",
        error.response?.data || error.message
      );

      showAlert(
        "Failed to download invoice. Please try again."
      );
    } finally {
      setDownloadingInvoice(false);
    }
  };

  // =========================================
  // IF ORDER DATA IS NOT AVAILABLE
  // =========================================
  if (!order) {
    return (
      <div className="min-h-screen bg-[#151a23] text-white flex items-center justify-center px-6">
        <div className="bg-[#202733] border border-[#303949] rounded-xl p-8 text-center max-w-md w-full">
          <div className="text-5xl mb-5">📦</div>

          <h1 className="text-2xl font-bold">
            Order Information Not Found
          </h1>

          <p className="text-gray-400 mt-3">
            We couldn't find the order information.
          </p>

          <button
            type="button"
            onClick={() => navigate("/products")}
            className="mt-6 px-6 py-3 bg-[#384358] text-white rounded-md font-semibold hover:bg-[#46536a] transition"
          >
            CONTINUE SHOPPING
          </button>
        </div>

        {/* CUSTOM ALERT MODAL */}
        {alertModal.show && (
          <AlertModal
            alertModal={alertModal}
            onClose={closeAlert}
          />
        )}
      </div>
    );
  }

  // =========================================
  // ORDER STATUS
  // =========================================
  const statusSteps = [
    "Pending",
    "Processing",
    "Shipped",
    "Delivered",
  ];

  const currentStatus = order.orderStatus || "Pending";

  const statusIndex =
    currentStatus === "Pending"
      ? 0
      : currentStatus === "Shipped"
      ? 2
      : currentStatus === "Delivered"
      ? 3
      : 1;

  // =========================================
  // RETURN
  // =========================================
  return (
    <div className="min-h-screen bg-[#151a23] text-white">
      {/* MAIN */}
      <main className="max-w-6xl mx-auto px-5 md:px-8 py-10">
        {/* SUCCESS MESSAGE */}
        <section className="text-center">
          <div className="relative w-16 h-16 mx-auto">
            <div className="absolute inset-0 rounded-full bg-[#b51a2b]/20" />

            <div className="absolute inset-2 rounded-full bg-[#b51a2b] flex items-center justify-center">
              <span className="text-3xl font-bold">✓</span>
            </div>
          </div>

          <h1 className="text-xl md:text-2xl font-bold tracking-wide mt-6">
            ORDER PLACED SUCCESSFULLY!
          </h1>

          <p className="text-gray-400 text-sm mt-2">
            Thank you for shopping with LAPZONE.
          </p>

          <p className="text-gray-500 text-xs max-w-lg mx-auto mt-2 leading-relaxed">
            Your high-performance rig is being prepared for
            deployment. We'll notify you when it ships.
          </p>
        </section>

        {/* ORDER INFORMATION GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_330px] gap-5 mt-10">
          {/* LEFT SIDE */}
          <div className="space-y-5">
            {/* DELIVERY STATUS */}
            <section className="bg-[#202733] border border-[#2f3948] rounded-xl p-5">
              <p className="text-[9px] uppercase tracking-widest text-gray-500 font-semibold">
                Delivery Status
              </p>

              <div className="relative mt-6">
                <div className="absolute left-0 right-0 top-2.5 h-[2px] bg-[#414b5b]" />

                <div
                  className="absolute left-0 top-2.5 h-[2px] bg-[#b51a2b] transition-all"
                  style={{
                    width:
                      statusIndex === 0
                        ? "0%"
                        : statusIndex === 1
                        ? "33%"
                        : statusIndex === 2
                        ? "66%"
                        : "100%",
                  }}
                />

                <div className="relative flex justify-between">
                  {statusSteps.map((step, index) => {
                    const completed = index <= statusIndex;

                    return (
                      <div
                        key={step}
                        className="flex flex-col items-center"
                      >
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            completed
                              ? "bg-[#b51a2b] border-[#b51a2b]"
                              : "bg-[#384358] border-[#384358]"
                          }`}
                        >
                          {completed && index < statusIndex && (
                            <span className="text-[8px]">✓</span>
                          )}
                        </div>

                        <p
                          className={`text-[8px] uppercase mt-2 ${
                            index === statusIndex
                              ? "text-[#b51a2b] font-bold"
                              : "text-gray-500"
                          }`}
                        >
                          {step}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>

            {/* ORDER REFERENCE + DESTINATION */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* ORDER REFERENCE */}
              <section className="bg-[#202733] border border-[#2f3948] rounded-xl p-5">
                <p className="text-[9px] uppercase tracking-widest text-gray-500 font-semibold">
                  Order Reference
                </p>

                <p className="font-bold text-sm mt-3 break-all">
                  {order.orderId}
                </p>

                <p className="text-xs text-gray-500 mt-3">
                  Placed on{" "}
                  {new Date(
                    order.createdAt || Date.now()
                  ).toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              </section>

              {/* DELIVERY DESTINATION */}
              <section className="bg-[#202733] border border-[#2f3948] rounded-xl p-5">
                <p className="text-[9px] uppercase tracking-widest text-gray-500 font-semibold">
                  Delivery Destination
                </p>

                {order.shippingAddress ? (
                  <>
                    <p className="font-bold text-sm mt-3">
                      {order.shippingAddress.fullName}
                    </p>

                    <p className="text-xs text-gray-500 mt-1">
                      {order.shippingAddress.addressLine}
                    </p>

                    <p className="text-xs text-gray-500">
                      {order.shippingAddress.city},{" "}
                      {order.shippingAddress.state}
                    </p>

                    <p className="text-xs text-gray-500">
                      {order.shippingAddress.pincode}
                    </p>
                  </>
                ) : (
                  <p className="text-xs text-gray-500 mt-3">
                    Delivery address available in your order
                    details.
                  </p>
                )}
              </section>
            </div>

            {/* BUTTONS */}
            <div className="flex flex-col items-center gap-4 pt-4">
              <div className="flex flex-col sm:flex-row gap-3 w-full max-w-md">
                <button
                  type="button"
                  onClick={() =>
                    navigate(`/orders/${order._id}`)
                  }
                  className="flex-1 py-3 bg-[#b51a2b] text-white rounded-md text-xs font-semibold hover:bg-[#c9273c] transition"
                >
                  VIEW ORDER DETAILS
                </button>

                <button
                  type="button"
                  onClick={() => navigate("/products")}
                  className="flex-1 py-3 bg-[#384358] text-white rounded-md text-xs font-semibold hover:bg-[#46536a] transition"
                >
                  CONTINUE SHOPPING
                </button>
              </div>

              {/* DOWNLOAD INVOICE */}
              <button
                type="button"
                onClick={downloadInvoice}
                disabled={downloadingInvoice}
                className="text-xs text-gray-500 hover:text-[#b51a2b] transition disabled:opacity-50"
              >
                ↓{" "}
                {downloadingInvoice
                  ? "Downloading Invoice..."
                  : "Download Invoice"}
              </button>
            </div>
          </div>

          {/* RIGHT SIDE - ORDER SUMMARY */}
          <aside>
            <section className="bg-gradient-to-br from-[#303a4b] to-[#4b405d] rounded-xl p-5">
              <p className="text-[9px] uppercase tracking-widest text-gray-400">
                Order Summary
              </p>

              {/* PRODUCT */}
              {order.items && order.items.length > 0 && (
                <div className="flex gap-3 mt-5">
                  <div className="w-12 h-12 rounded-md bg-[#1d2530] overflow-hidden flex items-center justify-center flex-shrink-0">
                    {order.items[0].productImage ? (
                      <img
                        src={
  order.items[0].productImage?.startsWith("http")
    ? order.items[0].productImage
    : `${import.meta.env.VITE_BACKEND_URL || "http://localhost:5000"}${order.items[0].productImage?.startsWith("/") ? "" : "/"}${order.items[0].productImage || ""}`
}
                        alt={order.items[0].productName}
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <span className="text-lg">💻</span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold truncate">
                      {order.items[0].productName}
                    </p>

                    <p className="text-[9px] text-gray-400 mt-1">
                      Qty: {order.items[0].quantity}
                    </p>
                  </div>
                </div>
              )}

              {/* SUBTOTAL */}
              <div className="flex justify-between mt-6 text-xs">
                <span className="text-gray-400">Subtotal</span>

                <span>
                  ₹
                  {Number(
                    order.subtotal || order.totalAmount || 0
                  ).toLocaleString("en-IN")}
                </span>
              </div>

              {/* DISCOUNT */}
              <div className="flex justify-between mt-3 text-xs">
                <span className="text-gray-400">Discount</span>

                <span className="text-[#b51a2b]">
                  -₹
                  {Number(order.discount || 0).toLocaleString(
                    "en-IN"
                  )}
                </span>
              </div>

              {/* DELIVERY */}
              <div className="flex justify-between mt-3 text-xs">
                <span className="text-gray-400">Delivery</span>

                <span className="text-green-400">FREE</span>
              </div>

              {/* TOTAL */}
              <div className="border-t border-white/10 mt-5 pt-4">
                <div className="flex justify-between items-center">
                  <span className="font-bold">TOTAL</span>

                  <span className="text-xl font-bold text-[#b51a2b]">
                    ₹
                    {Number(
                      order.totalAmount || 0
                    ).toLocaleString("en-IN")}
                  </span>
                </div>
              </div>
            </section>
          </aside>
        </div>

        {/* FEATURES */}
        <section className="border-t border-[#2b3442] mt-20 pt-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="w-9 h-9 mx-auto rounded-full bg-[#202733] flex items-center justify-center">
                🔒
              </div>

              <h3 className="text-[10px] uppercase font-bold mt-3">
                Secure Payment
              </h3>

              <p className="text-[9px] text-gray-500 mt-2">
                End-to-end encrypted transactions.
              </p>
            </div>

            <div>
              <div className="w-9 h-9 mx-auto rounded-full bg-[#202733] flex items-center justify-center">
                🚚
              </div>

              <h3 className="text-[10px] uppercase font-bold mt-3">
                Fast Delivery
              </h3>

              <p className="text-[9px] text-gray-500 mt-2">
                Insured premium shipping via air.
              </p>
            </div>

            <div>
              <div className="w-9 h-9 mx-auto rounded-full bg-[#202733] flex items-center justify-center">
                ↩
              </div>

              <h3 className="text-[10px] uppercase font-bold mt-3">
                Easy Returns
              </h3>

              <p className="text-[9px] text-gray-500 mt-2">
                14-day hassle-free hardware returns.
              </p>
            </div>
          </div>
        </section>
      </main>

    
      

      {/* CUSTOM ALERT MODAL */}
      {alertModal.show && (
        <AlertModal
          alertModal={alertModal}
          onClose={closeAlert}
        />
      )}
    </div>
  );
}

// =========================================
// REUSABLE CUSTOM ALERT MODAL
// =========================================
function AlertModal({ alertModal, onClose }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="order-success-alert-title"
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
            id="order-success-alert-title"
            className="text-lg font-semibold text-white"
          >
            {alertModal.type === "success"
              ? "SUCCESS"
              : "NOTICE"}
          </h2>

          <p className="mt-3 text-sm leading-6 text-gray-400">
            {alertModal.message}
          </p>

          <button
            type="button"
            onClick={onClose}
            autoFocus
            className="mt-6 w-full rounded-lg bg-[#b51a2b] py-3 text-sm font-semibold text-white transition hover:bg-[#c9273c]"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
}

export default OrderSuccess;