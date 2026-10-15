
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

function PaymentFailed() {
  const navigate = useNavigate();
  const location = useLocation();

  const errorMessage =
    location.state?.errorMessage ||
    "Your payment could not be completed.";

  // CUSTOM ALERT MODAL
  const [alertModal, setAlertModal] = useState({
    show: false,
    message: "",
  });

  const showAlert = (message) => {
    setAlertModal({
      show: true,
      message,
    });
  };

  const closeAlert = () => {
    setAlertModal({
      show: false,
      message: "",
    });
  };

  return (
    <div className="min-h-screen bg-[#151a23] flex items-center justify-center px-4 text-white">
      <div className="max-w-lg w-full bg-[#202733] border border-[#303949] rounded-2xl shadow-xl p-8 text-center">

        {/* ICON */}
        <div className="w-20 h-20 mx-auto rounded-full bg-[#b51a2b]/15 border border-[#b51a2b]/30 flex items-center justify-center">
          <span className="text-4xl text-[#ff5368]">
            ✕
          </span>
        </div>

        {/* TITLE */}
        <h1 className="text-3xl font-bold text-white mt-6">
          Payment Failed
        </h1>

        {/* MESSAGE */}
        <p className="text-gray-400 mt-3">
          Unfortunately, your payment could not be completed.
        </p>

        {/* ERROR DETAILS */}
        <div className="mt-5 bg-[#b51a2b]/10 border border-[#b51a2b]/30 rounded-lg p-4">
          <p className="text-sm text-[#ff5368]">
            {errorMessage}
          </p>
        </div>

        {/* BUTTONS */}
        <div className="mt-7 flex flex-col gap-3">

          {/* RETRY PAYMENT */}
          <button
            type="button"
            onClick={() => navigate("/checkout")}
            className="w-full py-3 bg-[#b51a2b] text-white rounded-lg font-semibold hover:bg-[#c9273c] transition"
          >
            RETRY PAYMENT
          </button>

          {/* CONTINUE SHOPPING */}
          <button
            type="button"
            onClick={() => navigate("/products")}
            className="w-full py-3 border border-[#384358] text-gray-300 rounded-lg font-semibold hover:bg-[#384358] transition"
          >
            CONTINUE SHOPPING
          </button>

          {/* GO TO MY ORDERS */}
          <button
            type="button"
            onClick={() => navigate("/orders")}
            className="w-full py-3 text-sm text-gray-500 hover:text-white transition"
          >
            VIEW MY ORDERS
          </button>

        </div>

      </div>

      {/* CUSTOM ALERT MODAL */}
      {alertModal.show && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="payment-alert-title"
        >
          <div className="w-full max-w-sm rounded-2xl border border-gray-700 bg-[#1d222c] p-6 shadow-2xl">

            <div className="flex flex-col items-center text-center">

              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#b51a2b]/15 text-2xl text-[#ff5368]">
                !
              </div>

              <h2
                id="payment-alert-title"
                className="text-lg font-semibold text-white"
              >
                PAYMENT NOTICE
              </h2>

              <p className="mt-3 text-sm leading-6 text-gray-400">
                {alertModal.message}
              </p>

              <button
                type="button"
                onClick={closeAlert}
                autoFocus
                className="mt-6 w-full rounded-lg bg-[#b51a2b] py-3 text-sm font-semibold text-white transition hover:bg-[#c9273c]"
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

export default PaymentFailed;