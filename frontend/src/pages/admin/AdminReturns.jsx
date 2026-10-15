import { useEffect, useState } from "react";
import api from "../../api/axios";

const AdminReturns = () => {
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);

  // =========================================
  // FETCH RETURN REQUESTS
  // =========================================

  const fetchReturns = async () => {
    try {
      setLoading(true);

      const response = await api.get(
        "/admin/orders/returns"
      );

      setReturns(response.data.orders || []);
    } catch (error) {
      console.error(
        "Fetch return requests error:",
        error.response?.data || error.message
      );

      alert(
        error.response?.data?.message ||
          "Failed to fetch return requests"
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================
  // LOAD RETURNS
  // =========================================

  useEffect(() => {
    fetchReturns();
  }, []);

  // =========================================
  // UPDATE RETURN STATUS
  // =========================================

  const handleReturnStatus = async (
    orderId,
    returnStatus
  ) => {
    const action =
      returnStatus === "Approved"
        ? "approve"
        : "reject";

    const confirmed = window.confirm(
      `Are you sure you want to ${action} this return request?`
    );

    if (!confirmed) {
      return;
    }

    try {
      const response = await api.patch(
        `/admin/orders/returns/${orderId}`,
        {
          returnStatus,
        }
      );

      alert(
        response.data.message ||
          "Return status updated successfully"
      );

      // Refresh the return list
      await fetchReturns();
    } catch (error) {
      console.error(
        "Update return status error:",
        error.response?.data || error.message
      );

      alert(
        error.response?.data?.message ||
          "Failed to update return status"
      );
    }
  };

  // =========================================
  // LOADING
  // =========================================

  if (loading) {
    return (
      <div className="min-h-screen bg-[#151923] text-white flex items-center justify-center">
        <p className="font-semibold">
          Loading return requests...
        </p>
      </div>
    );
  }

  // =========================================
  // PAGE
  // =========================================

  return (
    <div className="min-h-screen bg-[#151923] text-white p-6 md:p-8">

      {/* =========================================
          HEADER
      ========================================= */}

      <div className="mb-8">

        <h1 className="text-3xl md:text-4xl font-bold">
          RETURN REQUESTS
        </h1>

        <p className="text-gray-400 text-sm mt-2">
          Review and manage customer return requests.
        </p>

      </div>

      {/* =========================================
          EMPTY STATE
      ========================================= */}

      {returns.length === 0 ? (

        <div className="bg-[#1e2430] border border-[#2b3240] rounded-xl p-12 text-center">

          <div className="text-5xl mb-5">
            📦
          </div>

          <h2 className="text-xl font-bold">
            NO RETURN REQUESTS
          </h2>

          <p className="text-gray-400 text-sm mt-2">
            There are currently no pending return requests.
          </p>

        </div>

      ) : (

        /* =========================================
           RETURN TABLE
        ========================================= */

        <div className="bg-[#1e2430] border border-[#2b3240] rounded-xl overflow-hidden">

          <div className="overflow-x-auto">

            <table className="w-full">

              {/* =========================================
                  TABLE HEADER
              ========================================= */}

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

              {/* =========================================
                  TABLE BODY
              ========================================= */}

              <tbody>

                {returns.map((order) => (

                  <tr
                    key={order._id}
                    className="border-t border-[#2b3240] hover:bg-[#252c39]"
                  >

                    {/* =========================================
                        ORDER ID
                    ========================================= */}

                    <td className="px-5 py-4 text-sm font-semibold">
                      #{order.orderId}
                    </td>

                    {/* =========================================
                        CUSTOMER
                    ========================================= */}

                    <td className="px-5 py-4">

                      <p className="text-sm font-semibold">
                        {order.userId?.name ||
                          "Unknown Customer"}
                      </p>

                      <p className="text-xs text-gray-400">
                        {order.userId?.email || "-"}
                      </p>

                    </td>

                    {/* =========================================
                        DATE
                    ========================================= */}

                    <td className="px-5 py-4 text-sm text-gray-300">
                      {order.createdAt
                        ? new Date(
                            order.createdAt
                          ).toLocaleDateString("en-IN")
                        : "-"}
                    </td>

                    {/* =========================================
                        AMOUNT
                    ========================================= */}

                    <td className="px-5 py-4 text-sm font-semibold">
                      ₹
                      {Number(
                        order.totalAmount || 0
                      ).toLocaleString("en-IN")}
                    </td>

                    {/* =========================================
                        RETURN REASON
                    ========================================= */}

                    <td className="px-5 py-4">

                      <p className="text-sm text-gray-300 max-w-[220px]">
                        {order.returnReason ||
                          "No reason provided"}
                      </p>

                    </td>

                    {/* =========================================
                        STATUS
                    ========================================= */}

                    <td className="px-5 py-4">

                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          order.returnStatus ===
                          "Requested"
                            ? "bg-yellow-100 text-yellow-700"
                            : order.returnStatus ===
                              "Approved"
                            ? "bg-green-100 text-green-700"
                            : order.returnStatus ===
                              "Rejected"
                            ? "bg-red-100 text-red-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {order.returnStatus ||
                          "Unknown"}
                      </span>

                    </td>

                    {/* =========================================
                        ACTIONS
                    ========================================= */}

                    <td className="px-5 py-4">

                      <div className="flex gap-2">

                        {/* APPROVE */}

                        <button
                          type="button"
                          onClick={() =>
                            handleReturnStatus(
                              order._id,
                              "Approved"
                            )
                          }
                          disabled={
                            order.returnStatus !==
                            "Requested"
                          }
                          className="px-3 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-md text-xs font-semibold"
                        >
                          APPROVE
                        </button>

                        {/* REJECT */}

                        <button
                          type="button"
                          onClick={() =>
                            handleReturnStatus(
                              order._id,
                              "Rejected"
                            )
                          }
                          disabled={
                            order.returnStatus !==
                            "Requested"
                          }
                          className="px-3 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-md text-xs font-semibold"
                        >
                          REJECT
                        </button>

                      </div>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        </div>

      )}

    </div>
  );
};

export default AdminReturns;