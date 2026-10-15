import { useEffect, useState } from "react";
import api from "../../api/axios";

const AdminSalesReports = () => {
  const [period, setPeriod] = useState("daily");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchReport = async () => {
    try {
      setLoading(true);

      let url = `/reports/sales?period=${period}`;

      if (period === "custom") {
        if (!startDate || !endDate) {
          alert("Please select start date and end date");
          return;
        }

        url += `&startDate=${startDate}&endDate=${endDate}`;
      }

      const response = await api.get(url);

      setReport(response.data.report);
    } catch (error) {
      console.error("Sales report error:", error);

      alert(
        error.response?.data?.message ||
          "Failed to load sales report"
      );
    } finally {
      setLoading(false);
    }
  };

  const downloadExcel = async () => {
  try {
    let url = `/reports/sales/excel?period=${period}`;

    if (period === "custom") {
      if (!startDate || !endDate) {
        alert("Please select start date and end date");
        return;
      }

      url += `&startDate=${startDate}&endDate=${endDate}`;
    }

    const response = await api.get(url, {
      responseType: "blob",
    });

    const blob = new Blob([response.data], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    const downloadUrl = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = `lapzone-sales-report-${period}.xlsx`;

    document.body.appendChild(link);
    link.click();

    link.remove();

    window.URL.revokeObjectURL(downloadUrl);

  } catch (error) {
    console.error("Excel download error:", error);

    alert(
      error.response?.data?.message ||
        "Failed to download Excel report"
    );
  }
};

const downloadPDF = async () => {
  try {
    let url = `/reports/sales/pdf?period=${period}`;

    if (period === "custom") {
      if (!startDate || !endDate) {
        alert("Please select start date and end date");
        return;
      }

      url += `&startDate=${startDate}&endDate=${endDate}`;
    }

    const response = await api.get(url, {
      responseType: "blob",
    });

    const blob = new Blob([response.data], {
      type: "application/pdf",
    });

    const downloadUrl = window.URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = downloadUrl;

    link.download = `lapzone-sales-report-${period}.pdf`;

    document.body.appendChild(link);

    link.click();

    link.remove();

    window.URL.revokeObjectURL(downloadUrl);

  } catch (error) {
    console.error("PDF download error:", error);

    alert(
      error.response?.data?.message ||
        "Failed to download PDF report"
    );
  }
};
  useEffect(() => {
    fetchReport();
  }, [period]);

  return (
    <div className="min-h-screen bg-[#202936] text-white p-6">

      {/* HEADER */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold">
          Sales Reports
        </h1>

        <p className="text-gray-400 text-sm mt-1">
          View your store sales and order performance
        </p>
      </div>

      {/* FILTER */}
      <div className="bg-[#293444] border border-[#414d5e] rounded-lg p-5 mb-6">

        <h2 className="font-semibold mb-4">
          Report Period
        </h2>

        <div className="flex flex-wrap gap-3">

          <button
            onClick={() => setPeriod("daily")}
            className={`px-4 py-2 rounded-md text-sm ${
              period === "daily"
                ? "bg-[#b51a2b] text-white"
                : "bg-[#202936] text-gray-300"
            }`}
          >
            Daily
          </button>

          <button
            onClick={() => setPeriod("weekly")}
            className={`px-4 py-2 rounded-md text-sm ${
              period === "weekly"
                ? "bg-[#b51a2b] text-white"
                : "bg-[#202936] text-gray-300"
            }`}
          >
            Weekly
          </button>

          <button
            onClick={() => setPeriod("yearly")}
            className={`px-4 py-2 rounded-md text-sm ${
              period === "yearly"
                ? "bg-[#b51a2b] text-white"
                : "bg-[#202936] text-gray-300"
            }`}
          >
            Yearly
          </button>

          <button
            onClick={() => setPeriod("custom")}
            className={`px-4 py-2 rounded-md text-sm ${
              period === "custom"
                ? "bg-[#b51a2b] text-white"
                : "bg-[#202936] text-gray-300"
            }`}
          >
            Custom
          </button>

          <button
  onClick={downloadExcel}
  className="px-4 py-2 rounded-md text-sm bg-green-700 hover:bg-green-800 text-white"
>
  Download Excel
</button>
<button
  onClick={downloadPDF}
  className="px-4 py-2 rounded-md text-sm bg-blue-700 hover:bg-blue-800 text-white"
>
  Download PDF
</button>

        </div>

        {/* CUSTOM DATE */}
        {period === "custom" && (
          <div className="flex flex-wrap gap-4 mt-5">

            <div>
              <label className="block text-xs text-gray-400 mb-1">
                Start Date
              </label>

              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-[#202936] border border-[#414d5e] rounded-md px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-1">
                End Date
              </label>

              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-[#202936] border border-[#414d5e] rounded-md px-3 py-2 text-sm"
              />
            </div>

            <div className="flex items-end">
              <button
                onClick={fetchReport}
                className="bg-[#b51a2b] px-5 py-2 rounded-md text-sm font-medium"
              >
                Generate Report
              </button>
            </div>

          </div>
        )}
      </div>

      {/* LOADING */}
      {loading && (
        <p className="text-gray-400">
          Loading report...
        </p>
      )}

      {/* REPORT */}
      {!loading && report && (
        <>
          {/* STAT CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">

            <div className="bg-[#293444] border border-[#414d5e] rounded-lg p-5">
              <p className="text-gray-400 text-sm">
                Total Orders
              </p>

              <h2 className="text-2xl font-bold mt-2">
                {report.totalOrders}
              </h2>
            </div>

            <div className="bg-[#293444] border border-[#414d5e] rounded-lg p-5">
              <p className="text-gray-400 text-sm">
                Total Sales
              </p>

              <h2 className="text-2xl font-bold mt-2">
                ₹{report.totalSales?.toLocaleString("en-IN")}
              </h2>
            </div>

            <div className="bg-[#293444] border border-[#414d5e] rounded-lg p-5">
              <p className="text-gray-400 text-sm">
                Total Discount
              </p>

              <h2 className="text-2xl font-bold mt-2">
                ₹{report.totalDiscount?.toLocaleString("en-IN")}
              </h2>
            </div>

            <div className="bg-[#293444] border border-[#414d5e] rounded-lg p-5">
              <p className="text-gray-400 text-sm">
                Average Order Value
              </p>

              <h2 className="text-2xl font-bold mt-2">
                ₹
                {Math.round(
                  report.averageOrderValue || 0
                ).toLocaleString("en-IN")}
              </h2>
            </div>

          </div>

          {/* REPORT DETAILS */}
          {/* ORDERS TABLE */}
<div className="bg-[#293444] border border-[#414d5e] rounded-lg p-5 mt-6">

  <h2 className="font-semibold mb-4">
    Orders in this Report
  </h2>

  {report.orders && report.orders.length > 0 ? (
    <div className="overflow-x-auto">

      <table className="w-full text-sm">

        <thead>
          <tr className="border-b border-[#414d5e] text-gray-400 text-left">

            <th className="p-3">
              Order ID
            </th>

            <th className="p-3">
              Date
            </th>

            <th className="p-3">
              Payment
            </th>

            <th className="p-3">
              Status
            </th>

            <th className="p-3">
              Discount
            </th>

            <th className="p-3">
              Amount
            </th>

          </tr>
        </thead>

        <tbody>

          {report.orders.map((order) => (
            <tr
              key={order._id}
              className="border-b border-[#414d5e] hover:bg-[#252f40]"
            >

              <td className="p-3">
                {order.orderId}
              </td>

              <td className="p-3 text-gray-300">
                {new Date(
                  order.createdAt
                ).toLocaleDateString("en-IN")}
              </td>

              <td className="p-3">
                {order.paymentMethod}
              </td>

              <td className="p-3">
                {order.orderStatus}
              </td>

              <td className="p-3">
                ₹
                {(order.discount || 0).toLocaleString(
                  "en-IN"
                )}
              </td>

              <td className="p-3 font-semibold">
                ₹
                {(order.totalAmount || 0).toLocaleString(
                  "en-IN"
                )}
              </td>

            </tr>
          ))}

        </tbody>

      </table>

    </div>
  ) : (
    <p className="text-gray-400 text-sm">
      No orders found for this period.
    </p>
  )}

</div>  
        </>
      )}

    </div>
  );
};

export default AdminSalesReports;