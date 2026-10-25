
import { useEffect, useState, useCallback } from "react";
import api from "../../api/axios";
import {
  AlertCircle,
  CheckCircle2,
  X,
  RefreshCw,
  FileSpreadsheet,
  FileText,
  CalendarDays,
  TrendingUp,
  ShoppingBag,
  Wallet,
} from "lucide-react";

const AdminSalesReports = () => {
  const [period, setPeriod] = useState("daily");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState("");

  const [modal, setModal] = useState({
    open: false,
    title: "",
    message: "",
    type: "error",
  });

  // =========================================
  // CUSTOM NOTIFICATION MODAL
  // =========================================

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
          aria-labelledby="sales-modal-title"
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
                  id="sales-modal-title"
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
  // VALIDATE CUSTOM DATES
  // =========================================

  const validateCustomDates = () => {
    if (period !== "custom") {
      return true;
    }

    if (!startDate || !endDate) {
      showModal(
        "Dates Required",
        "Please select both a start date and an end date.",
        "error"
      );

      return false;
    }

    if (startDate > endDate) {
      showModal(
        "Invalid Date Range",
        "The start date cannot be later than the end date.",
        "error"
      );

      return false;
    }

    return true;
  };

  // =========================================
  // BUILD REPORT URL
  // =========================================

  const buildReportUrl = (endpoint) => {
    const params = new URLSearchParams();
    params.set("period", period);

    if (period === "custom") {
      params.set("startDate", startDate);
      params.set("endDate", endDate);
    }

    return `${endpoint}?${params.toString()}`;
  };

  // =========================================
  // FETCH SALES REPORT
  // =========================================

  const fetchReport = useCallback(
    async (showErrors = true) => {
      if (!validateCustomDates()) {
        return;
      }

      try {
        setLoading(true);

        const url = buildReportUrl("/reports/sales");
        const response = await api.get(url);

        setReport(response.data.report || null);
      } catch (error) {
        console.error(
          "Sales report error:",
          error.response?.data || error.message
        );

        if (showErrors) {
          showModal(
            "Unable to Load Report",
            error.response?.data?.message ||
              "Failed to load the sales report. Please try again.",
            "error"
          );
        }
      } finally {
        setLoading(false);
      }
    },
    [period, startDate, endDate]
  );

  // =========================================
  // DOWNLOAD REPORT FILE
  // =========================================

  const downloadReport = async (fileType) => {
    if (!validateCustomDates()) {
      return;
    }

    const isExcel = fileType === "excel";
    const endpoint = isExcel
      ? "/reports/sales/excel"
      : "/reports/sales/pdf";

    try {
      setDownloading(fileType);

      const url = buildReportUrl(endpoint);

      const response = await api.get(url, {
        responseType: "blob",
      });

      const mimeType = isExcel
        ? "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        : "application/pdf";

      const blob = new Blob([response.data], {
        type: mimeType,
      });

      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = downloadUrl;
      link.download = `lapzone-sales-report-${period}.${
        isExcel ? "xlsx" : "pdf"
      }`;

      document.body.appendChild(link);
      link.click();
      link.remove();

      // Give the browser time to begin the download.
      window.setTimeout(() => {
        window.URL.revokeObjectURL(downloadUrl);
      }, 1000);

      showModal(
        "Download Started",
        `Your sales report ${
          isExcel ? "Excel" : "PDF"
        } file has been prepared for download.`,
        "success"
      );
    } catch (error) {
      console.error(
        `${fileType.toUpperCase()} download error:`,
        error.response?.data || error.message
      );

      let message = `Failed to download the ${
        isExcel ? "Excel" : "PDF"
      } report. Please try again.`;

      // Blob responses may contain an error message as JSON.
      if (error.response?.data instanceof Blob) {
        try {
          const errorText = await error.response.data.text();
          const errorData = JSON.parse(errorText);

          if (errorData.message) {
            message = errorData.message;
          }
        } catch {
          // Keep the default error message if the response
          // is not a JSON error payload.
        }
      } else if (error.response?.data?.message) {
        message = error.response.data.message;
      }

      showModal(
        "Download Failed",
        message,
        "error"
      );
    } finally {
      setDownloading("");
    }
  };

  // =========================================
  // LOAD REPORT WHEN PERIOD CHANGES
  // =========================================

  useEffect(() => {
    if (period === "custom") {
      return;
    }

    fetchReport(false);
  }, [period, fetchReport]);

  // =========================================
  // GENERATE REPORT BUTTON
  // =========================================

  const handleGenerateReport = () => {
    fetchReport();
  };

  // =========================================
  // FORMAT CURRENCY
  // =========================================

  const formatCurrency = (amount) =>
    Number(amount || 0).toLocaleString("en-IN", {
      maximumFractionDigits: 2,
    });

  // =========================================
  // PAGE
  // =========================================

  return (
    <div className="min-h-screen bg-[#202936] p-6 text-white">
      <NotificationModal />

      {/* HEADER */}
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="mb-2 text-[10px] uppercase tracking-wider text-gray-500">
            Dashboard
            <span className="mx-2">/</span>
            <span className="text-[#e33445]">Sales Reports</span>
          </div>

          <h1 className="text-2xl font-bold">
            Sales Reports
          </h1>

          <p className="mt-1 text-sm text-gray-400">
            View your store sales and order performance.
          </p>
        </div>

        <button
          type="button"
          onClick={() => fetchReport()}
          disabled={loading || downloading !== ""}
          className="flex items-center justify-center gap-2 rounded-lg border border-[#414d5e] bg-[#293444] px-4 py-3 text-xs font-medium text-gray-300 transition hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          <RefreshCw
            size={14}
            className={loading ? "animate-spin" : ""}
          />
          REFRESH REPORT
        </button>
      </div>

      {/* FILTER */}
      <div className="mb-6 rounded-lg border border-[#414d5e] bg-[#293444] p-5">
        <div className="mb-4 flex items-center gap-2">
          <CalendarDays size={17} className="text-[#ffb2b8]" />

          <h2 className="font-semibold">
            Report Period
          </h2>
        </div>

        <div className="flex flex-wrap gap-3">
          {[
            { value: "daily", label: "Daily" },
            { value: "weekly", label: "Weekly" },
            { value: "yearly", label: "Yearly" },
            { value: "custom", label: "Custom" },
          ].map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => setPeriod(item.value)}
              className={`rounded-md px-4 py-2 text-sm transition ${
                period === item.value
                  ? "bg-[#b51a2b] text-white"
                  : "bg-[#202936] text-gray-300 hover:bg-[#354158]"
              }`}
            >
              {item.label}
            </button>
          ))}

          <div className="hidden flex-1 sm:block" />

          {/* EXCEL DOWNLOAD */}
          <button
            type="button"
            onClick={() => downloadReport("excel")}
            disabled={downloading !== "" || loading}
            className="flex items-center justify-center gap-2 rounded-md bg-green-700 px-4 py-2 text-sm text-white transition hover:bg-green-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <FileSpreadsheet size={16} />
            {downloading === "excel"
              ? "Preparing Excel..."
              : "Download Excel"}
          </button>

          {/* PDF DOWNLOAD */}
          <button
            type="button"
            onClick={() => downloadReport("pdf")}
            disabled={downloading !== "" || loading}
            className="flex items-center justify-center gap-2 rounded-md bg-blue-700 px-4 py-2 text-sm text-white transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <FileText size={16} />
            {downloading === "pdf"
              ? "Preparing PDF..."
              : "Download PDF"}
          </button>
        </div>

        {/* CUSTOM DATE FILTER */}
        {period === "custom" && (
          <div className="mt-5 flex flex-wrap items-end gap-4 border-t border-[#414d5e] pt-5">
            <div>
              <label
                htmlFor="sales-start-date"
                className="mb-1 block text-xs text-gray-400"
              >
                Start Date
              </label>

              <input
                id="sales-start-date"
                type="date"
                value={startDate}
                max={endDate || undefined}
                onChange={(event) =>
                  setStartDate(event.target.value)
                }
                className="rounded-md border border-[#414d5e] bg-[#202936] px-3 py-2 text-sm text-white outline-none focus:border-[#b51a2b]"
              />
            </div>

            <div>
              <label
                htmlFor="sales-end-date"
                className="mb-1 block text-xs text-gray-400"
              >
                End Date
              </label>

              <input
                id="sales-end-date"
                type="date"
                value={endDate}
                min={startDate || undefined}
                onChange={(event) =>
                  setEndDate(event.target.value)
                }
                className="rounded-md border border-[#414d5e] bg-[#202936] px-3 py-2 text-sm text-white outline-none focus:border-[#b51a2b]"
              />
            </div>

            <button
              type="button"
              onClick={handleGenerateReport}
              disabled={loading || downloading !== ""}
              className="rounded-md bg-[#b51a2b] px-5 py-2 text-sm font-medium transition hover:bg-[#d92d3d] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Generating..." : "Generate Report"}
            </button>
          </div>
        )}
      </div>

      {/* LOADING */}
      {loading && (
        <div className="mb-6 flex items-center gap-3 rounded-lg border border-[#414d5e] bg-[#293444] p-5 text-sm text-gray-400">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#b51a2b] border-t-transparent" />
          Loading sales report...
        </div>
      )}

      {/* REPORT */}
      {!loading && report && (
        <>
          {/* STAT CARDS */}
          <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg border border-[#414d5e] bg-[#293444] p-5">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-400">
                  Total Orders
                </p>

                <ShoppingBag
                  size={19}
                  className="text-[#ffb2b8]"
                />
              </div>

              <h2 className="mt-3 text-2xl font-bold">
                {Number(report.totalOrders || 0).toLocaleString(
                  "en-IN"
                )}
              </h2>

              <p className="mt-1 text-xs text-gray-500">
                Orders in selected period
              </p>
            </div>

            <div className="rounded-lg border border-[#414d5e] bg-[#293444] p-5">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-400">
                  Total Sales
                </p>

                <TrendingUp
                  size={19}
                  className="text-green-400"
                />
              </div>

              <h2 className="mt-3 text-2xl font-bold">
                ₹{formatCurrency(report.totalSales)}
              </h2>

              <p className="mt-1 text-xs text-gray-500">
                Reported sales amount
              </p>
            </div>

            <div className="rounded-lg border border-[#414d5e] bg-[#293444] p-5">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-400">
                  Total Discount
                </p>

                <Wallet
                  size={19}
                  className="text-yellow-400"
                />
              </div>

              <h2 className="mt-3 text-2xl font-bold">
                ₹{formatCurrency(report.totalDiscount)}
              </h2>

              <p className="mt-1 text-xs text-gray-500">
                Discounts applied
              </p>
            </div>

            <div className="rounded-lg border border-[#414d5e] bg-[#293444] p-5">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-400">
                  Average Order Value
                </p>

                <FileText
                  size={19}
                  className="text-blue-400"
                />
              </div>

              <h2 className="mt-3 text-2xl font-bold">
                ₹
                {formatCurrency(
                  Math.round(report.averageOrderValue || 0)
                )}
              </h2>

              <p className="mt-1 text-xs text-gray-500">
                Average value per order
              </p>
            </div>
          </div>

          {/* ORDERS TABLE */}
          <div className="mt-6 overflow-hidden rounded-lg border border-[#414d5e] bg-[#293444]">
            <div className="border-b border-[#414d5e] p-5">
              <h2 className="font-semibold">
                Orders in this Report
              </h2>

              <p className="mt-1 text-xs text-gray-400">
                Order details for the selected reporting period.
              </p>
            </div>

            {report.orders && report.orders.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[800px] text-sm">
                  <thead>
                    <tr className="border-b border-[#414d5e] text-left text-xs text-gray-400">
                      <th className="p-4">Order ID</th>
                      <th className="p-4">Date</th>
                      <th className="p-4">Payment</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Discount</th>
                      <th className="p-4">Amount</th>
                    </tr>
                  </thead>

                  <tbody>
                    {report.orders.map((order) => {
                      const date = order.createdAt
                        ? new Date(order.createdAt)
                        : null;

                      const validDate =
                        date && !Number.isNaN(date.getTime());

                      return (
                        <tr
                          key={order._id}
                          className="border-b border-[#414d5e] transition hover:bg-[#252f40]"
                        >
                          <td className="p-4 font-medium">
                            {order.orderId || "-"}
                          </td>

                          <td className="p-4 text-gray-300">
                            {validDate
                              ? date.toLocaleDateString("en-IN")
                              : "-"}
                          </td>

                          <td className="p-4 text-gray-300">
                            {order.paymentMethod || "-"}
                          </td>

                          <td className="p-4">
                            <span className="rounded-full border border-[#414d5e] bg-[#202936] px-3 py-1 text-xs text-gray-300">
                              {order.orderStatus || "Unknown"}
                            </span>
                          </td>

                          <td className="p-4 text-gray-300">
                            ₹{formatCurrency(order.discount)}
                          </td>

                          <td className="p-4 font-semibold text-[#ffb2b8]">
                            ₹{formatCurrency(order.totalAmount)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-10 text-center">
                <ShoppingBag
                  size={28}
                  className="mx-auto mb-3 text-gray-500"
                />

                <p className="text-sm text-gray-400">
                  No orders found for this period.
                </p>
              </div>
            )}
          </div>
        </>
      )}

      {/* NO REPORT */}
      {!loading && !report && (
        <div className="rounded-lg border border-[#414d5e] bg-[#293444] p-10 text-center">
          <FileText
            size={32}
            className="mx-auto mb-3 text-gray-500"
          />

          <p className="text-sm text-gray-300">
            No report data is available.
          </p>

          <p className="mt-2 text-xs text-gray-500">
            Select a reporting period and try again.
          </p>
        </div>
      )}
    </div>
  );
};

export default AdminSalesReports;
