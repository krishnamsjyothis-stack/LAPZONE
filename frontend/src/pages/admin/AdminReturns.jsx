
import { useEffect, useState, useCallback } from "react";
import api from "../../api/axios";
import {
  Package,
  AlertCircle,
  CheckCircle2,
  X,
  RefreshCw,
  ShieldCheck,
  Clock,
} from "lucide-react";

const AdminReturns = () => {
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  // Custom notification modal
  const [modal, setModal] = useState({
    open: false,
    title: "",
    message: "",
    type: "error",
  });

  // Return approval/rejection confirmation modal
  const [confirmation, setConfirmation] = useState({
    open: false,
    orderId: null,
    returnStatus: "",
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

  const closeConfirmation = () => {
    setConfirmation({
      open: false,
      orderId: null,
      returnStatus: "",
    });
  };

  // =========================================
  // FETCH RETURN REQUESTS
  // =========================================

  const fetchReturns = useCallback(async (showError = true) => {
    try {
      setLoading(true);

      const response = await api.get("/admin/orders/returns");

      setReturns(response.data.orders || []);
    } catch (error) {
      console.error(
        "Fetch return requests error:",
        error.response?.data || error.message
      );

      if (showError) {
        showModal(
          "Unable to Load Returns",
          error.response?.data?.message ||
            "Failed to fetch return requests. Please try again.",
          "error"
        );
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // =========================================
  // LOAD RETURNS
  // =========================================

  useEffect(() => {
    fetchReturns();

  }, [fetchReturns]);

  // =========================================
  // OPEN CONFIRMATION MODAL
  // =========================================

  const handleReturnStatus = (orderId, returnStatus) => {
    setConfirmation({
      open: true,
      orderId,
      returnStatus,
    });
  };

  // =========================================
  // CONFIRM RETURN STATUS UPDATE
  // =========================================

  const confirmReturnStatus = async () => {
    const { orderId, returnStatus } = confirmation;

    if (!orderId || !returnStatus) {
      closeConfirmation();

      showModal(
        "Invalid Request",
        "The return request information is missing. Please try again.",
        "error"
      );

      return;
    }

    const action =
      returnStatus === "Approved" ? "approve" : "reject";

    closeConfirmation();
    setUpdatingId(orderId);

    try {
      const response = await api.patch(
        `/admin/orders/returns/${orderId}`,
        {
          returnStatus,
        }
      );

      // Update the selected return immediately.
      setReturns((previousReturns) =>
        previousReturns.map((order) =>
          order._id === orderId
            ? {
                ...order,
                returnStatus,
              }
            : order
        )
      );

      showModal(
        "Return Updated Successfully",
        response.data.message ||
          `The return request has been ${action}d successfully.`,
        "success"
      );
    } catch (error) {
      console.error(
        "Update return status error:",
        error.response?.data || error.message
      );

      showModal(
        "Update Failed",
        error.response?.data?.message ||
          `Failed to ${action} this return request. Please try again.`,
        "error"
      );
    } finally {
      setUpdatingId(null);
    }
  };

  // =========================================
  // NOTIFICATION MODAL
  // =========================================

  const NotificationModal = () => {
    if (!modal.open) return null;

    const isSuccess = modal.type === "success";

    return (
      <div
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
        onMouseDown={(event) => {
          if (event.target === event.currentTarget) {
            closeModal();
          }
        }}
      >
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="return-notification-title"
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
                  id="return-notification-title"
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

  // =========================================
  // CONFIRMATION MODAL
  // =========================================

  const ConfirmationModal = () => {
    if (!confirmation.open) return null;

    const isApproval =
      confirmation.returnStatus === "Approved";

    const action = isApproval ? "approve" : "reject";

    return (
      <div
        className="fixed inset-0 z-[90] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
        onMouseDown={(event) => {
          if (event.target === event.currentTarget) {
            closeConfirmation();
          }
        }}
      >
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="return-confirmation-title"
          className="w-full max-w-md overflow-hidden rounded-2xl border border-[#414d5e] bg-[#202936] shadow-2xl"
        >
          <div className="flex items-start justify-between border-b border-[#414d5e] px-6 py-5">
            <div className="flex items-center gap-3">
              <div
                className={`flex h-11 w-11 items-center justify-center rounded-xl ${
                  isApproval
                    ? "bg-green-400/10 text-green-400"
                    : "bg-red-400/10 text-red-400"
                }`}
              >
                <ShieldCheck size={23} />
              </div>

              <div>
                <h2
                  id="return-confirmation-title"
                  className="text-base font-semibold text-white"
                >
                  {isApproval
                    ? "Approve Return?"
                    : "Reject Return?"}
                </h2>

                <p className="mt-1 text-[10px] uppercase tracking-[0.18em] text-gray-500">
                  CONFIRM YOUR ACTION
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={closeConfirmation}
              aria-label="Close confirmation"
              className="rounded-lg p-2 text-gray-400 transition hover:bg-white/5 hover:text-white"
            >
              <X size={18} />
            </button>
          </div>

          <div className="px-6 py-5">
            <p className="text-sm leading-6 text-gray-300">
              Are you sure you want to {action} this return
              request? This will update its status.
            </p>

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={closeConfirmation}
                className="flex-1 rounded-lg border border-[#414d5e] px-4 py-3 text-xs font-semibold text-gray-300 transition hover:bg-white/5 hover:text-white"
              >
                CANCEL
              </button>

              <button
                type="button"
                onClick={confirmReturnStatus}
                className={`flex-1 rounded-lg px-4 py-3 text-xs font-semibold text-white transition ${
                  isApproval
                    ? "bg-green-600 hover:bg-green-500"
                    : "bg-[#b51a2b] hover:bg-[#d92d3d]"
                }`}
              >
                YES, {isApproval ? "APPROVE" : "REJECT"}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // =========================================
  // LOADING
  // =========================================

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#151923] text-white">
        <NotificationModal />

        <div className="text-center">
          <div className="mx-auto h-9 w-9 animate-spin rounded-full border-2 border-[#b51a2b] border-t-transparent" />

          <p className="mt-4 text-xs text-gray-400">
            Loading return requests...
          </p>
        </div>
      </div>
    );
  }

  // =========================================
  // PAGE
  // =========================================

  return (
    <div className="min-h-screen bg-[#151923] p-6 text-white md:p-8">
      <NotificationModal />
      <ConfirmationModal />

      {/* HEADER */}
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="mb-3 text-[10px] uppercase tracking-wider text-gray-500">
            Dashboard
            <span className="mx-2">/</span>
            <span className="text-[#e33445]">Returns</span>
          </div>

          <h1 className="text-3xl font-bold md:text-4xl">
            RETURN REQUESTS
          </h1>

          <p className="mt-2 text-sm text-gray-400">
            Review and manage customer return requests.
          </p>
        </div>

        <button
          type="button"
          onClick={() => fetchReturns()}
          disabled={loading || updatingId !== null}
          className="flex items-center justify-center gap-2 self-start rounded-lg border border-[#414d5e] bg-[#202936] px-4 py-3 text-xs font-medium text-gray-300 transition hover:text-white disabled:cursor-not-allowed disabled:opacity-50 sm:self-center"
        >
          <RefreshCw size={14} />
          REFRESH
        </button>
      </div>

      {/* SUMMARY CARDS */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-[#2b3240] bg-[#1e2430] p-5">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-wide text-gray-400">
              Total Requests
            </p>

            <Package size={18} className="text-gray-400" />
          </div>

          <p className="mt-4 text-3xl font-semibold">
            {returns.length}
          </p>
        </div>

        <div className="rounded-xl border border-[#2b3240] bg-[#1e2430] p-5">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-wide text-gray-400">
              Pending Review
            </p>

            <Clock size={18} className="text-yellow-400" />
          </div>

          <p className="mt-4 text-3xl font-semibold text-yellow-300">
            {
              returns.filter(
                (order) => order.returnStatus === "Requested"
              ).length
            }
          </p>
        </div>

        <div className="rounded-xl border border-[#2b3240] bg-[#1e2430] p-5">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-wide text-gray-400">
              Approved
            </p>

            <CheckCircle2 size={18} className="text-green-400" />
          </div>

          <p className="mt-4 text-3xl font-semibold text-green-300">
            {
              returns.filter(
                (order) => order.returnStatus === "Approved"
              ).length
            }
          </p>
        </div>
      </div>

      {/* EMPTY STATE */}
      {returns.length === 0 ? (
        <div className="rounded-xl border border-[#2b3240] bg-[#1e2430] p-12 text-center">
          <Package
            size={40}
            className="mx-auto mb-5 text-gray-500"
          />

          <h2 className="text-xl font-bold">
            NO RETURN REQUESTS
          </h2>

          <p className="mt-2 text-sm text-gray-400">
            There are currently no return requests to display.
          </p>

          <button
            type="button"
            onClick={() => fetchReturns()}
            className="mt-6 rounded-lg bg-[#b51a2b] px-5 py-3 text-xs font-semibold text-white transition hover:bg-[#d92d3d]"
          >
            REFRESH REQUESTS
          </button>
        </div>
      ) : (
        /* RETURN TABLE */
        <div className="overflow-hidden rounded-xl border border-[#2b3240] bg-[#1e2430]">
          <div className="flex flex-col gap-1 border-b border-[#2b3240] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-sm font-semibold text-white">
                Customer Returns
              </h2>

              <p className="mt-1 text-xs text-gray-500">
                Review each request and choose an action.
              </p>
            </div>

            <span className="mt-2 w-fit rounded-full bg-[#303a4c] px-3 py-1 text-[10px] text-gray-300 sm:mt-0">
              {returns.length} REQUEST
              {returns.length === 1 ? "" : "S"}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1050px]">
              {/* TABLE HEADER */}
              <thead className="bg-[#384358]">
                <tr>
                  <th className="px-5 py-4 text-left text-xs font-semibold">
                    ORDER ID
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold">
                    CUSTOMER
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold">
                    DATE
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold">
                    AMOUNT
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold">
                    REASON
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold">
                    STATUS
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold">
                    ACTION
                  </th>
                </tr>
              </thead>

              {/* TABLE BODY */}
              <tbody>
                {returns.map((order) => {
                  const createdDate = order.createdAt
                    ? new Date(order.createdAt)
                    : null;

                  const validDate =
                    createdDate &&
                    !Number.isNaN(createdDate.getTime());

                  const isRequested =
                    order.returnStatus === "Requested";

                  const isUpdating = updatingId === order._id;

                  return (
                    <tr
                      key={order._id}
                      className="border-t border-[#2b3240] transition hover:bg-[#252c39]"
                    >
                      {/* ORDER ID */}
                      <td className="px-5 py-4">
                        <p className="text-sm font-semibold text-white">
                          #{order.orderId || order._id?.slice(-6)}
                        </p>

                        <p className="mt-1 text-[10px] text-gray-500">
                          ID: {order._id?.slice(-6) || "-"}
                        </p>
                      </td>

                      {/* CUSTOMER */}
                      <td className="px-5 py-4">
                        <p className="text-sm font-semibold text-white">
                          {order.userId?.name || "Unknown Customer"}
                        </p>

                        <p className="text-xs text-gray-400">
                          {order.userId?.email || "-"}
                        </p>
                      </td>

                      {/* DATE */}
                      <td className="px-5 py-4 text-sm text-gray-300">
                        {validDate
                          ? createdDate.toLocaleDateString("en-IN")
                          : "-"}
                      </td>

                      {/* AMOUNT */}
                      <td className="px-5 py-4 text-sm font-semibold text-[#ffb2b8]">
                        ₹
                        {Number(
                          order.totalAmount || 0
                        ).toLocaleString("en-IN")}
                      </td>

                      {/* RETURN REASON */}
                      <td className="px-5 py-4">
                        <p className="max-w-[220px] whitespace-normal break-words text-sm text-gray-300">
                          {order.returnReason ||
                            "No reason provided"}
                        </p>
                      </td>

                      {/* STATUS */}
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${
                            order.returnStatus === "Requested"
                              ? "border-yellow-300/20 bg-yellow-400/10 text-yellow-300"
                              : order.returnStatus === "Approved"
                              ? "border-green-300/20 bg-green-400/10 text-green-300"
                              : order.returnStatus === "Rejected"
                              ? "border-red-300/20 bg-red-400/10 text-red-300"
                              : "border-gray-300/20 bg-gray-400/10 text-gray-300"
                          }`}
                        >
                          {order.returnStatus || "Unknown"}
                        </span>
                      </td>

                      {/* ACTIONS */}
                      <td className="px-5 py-4">
                        {isRequested ? (
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                handleReturnStatus(
                                  order._id,
                                  "Approved"
                                )
                              }
                              disabled={
                                updatingId !== null || isUpdating
                              }
                              className="rounded-md bg-green-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-green-500 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {isUpdating ? "WAIT..." : "APPROVE"}
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                handleReturnStatus(
                                  order._id,
                                  "Rejected"
                                )
                              }
                              disabled={
                                updatingId !== null || isUpdating
                              }
                              className="rounded-md bg-[#b51a2b] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[#d92d3d] disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              REJECT
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-500">
                            No action needed
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminReturns;
