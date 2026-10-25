
import { useCallback, useEffect, useState } from "react";
import api from "../../api/axios";

function AdminWallet() {
  const [wallets, setWallets] = useState([]);
  const [summary, setSummary] = useState({
    totalWallets: 0,
    totalBalance: 0,
    totalTransactions: 0,
  });

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedWallet, setSelectedWallet] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  // Custom notification modal
  const [notification, setNotification] = useState({
    open: false,
    title: "",
    message: "",
    type: "error",
  });

  const showNotification = (message, type = "error") => {
    setNotification({
      open: true,
      title: type === "success" ? "Success" : "Unable to Continue",
      message,
      type,
    });
  };

  const closeNotification = () => {
    setNotification((current) => ({
      ...current,
      open: false,
    }));
  };

  const formatMoney = (amount = 0) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(Number(amount) || 0);

  const fetchWallets = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/admin/wallets", {
        params: { search, page, limit: 10 },
      });

      setWallets(response.data.wallets || []);

      setSummary(
        response.data.summary || {
          totalWallets: 0,
          totalBalance: 0,
          totalTransactions: 0,
        }
      );

      setPagination(response.data.pagination || {});
    } catch (err) {
      console.error(
        "Failed to fetch wallets:",
        err.response?.data || err.message
      );

      setError(
        err.response?.data?.message ||
          "Unable to load customer wallets."
      );
    } finally {
      setLoading(false);
    }
  }, [search, page]);

  useEffect(() => {
    fetchWallets();
  }, [fetchWallets]);

  const viewWallet = async (walletId) => {
    try {
      setDetailsLoading(true);
      setSelectedWallet(null);

      const response = await api.get(`/admin/wallets/${walletId}`);

      if (!response.data?.wallet) {
        showNotification("Wallet details were not found.");
        return;
      }

      setSelectedWallet(response.data.wallet);
    } catch (err) {
      console.error(
        "Failed to fetch wallet details:",
        err.response?.data || err.message
      );

      showNotification(
        err.response?.data?.message ||
          "Unable to load wallet details. Please try again."
      );
    } finally {
      setDetailsLoading(false);
    }
  };

  const totalPages = Math.max(1, pagination.totalPages || 1);

  return (
    <div className="min-h-screen w-full bg-[#202936] text-white">
      <div className="min-w-0 p-6">
        {/* HEADER */}
        <header className="mb-8">
          <p className="text-sm text-gray-400">Admin / Finance</p>

          <h1 className="mt-2 text-2xl font-semibold">
            Wallet Management
          </h1>

          <p className="mt-1 text-sm text-gray-400">
            View customer wallet balances and transaction history.
          </p>
        </header>

        {/* ERROR MESSAGE */}
        {error && (
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-red-500/30 bg-red-500/10 p-4">
            <p className="text-sm text-red-300">{error}</p>

            <button
              type="button"
              onClick={fetchWallets}
              disabled={loading}
              className="text-sm text-white underline disabled:opacity-50"
            >
              {loading ? "Loading..." : "Retry"}
            </button>
          </div>
        )}

        {/* SUMMARY CARDS */}
        <section className="mb-7 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-[#414d5e] bg-[#293444] p-5">
            <p className="text-sm text-gray-400">Customer Wallets</p>
            <h2 className="mt-2 text-2xl font-semibold">
              {summary.totalWallets}
            </h2>
          </div>

          <div className="rounded-xl border border-[#414d5e] bg-[#293444] p-5">
            <p className="text-sm text-gray-400">
              Combined Wallet Balance
            </p>
            <h2 className="mt-2 break-words text-2xl font-semibold">
              {formatMoney(summary.totalBalance)}
            </h2>
          </div>

          <div className="rounded-xl border border-[#414d5e] bg-[#293444] p-5">
            <p className="text-sm text-gray-400">Total Transactions</p>
            <h2 className="mt-2 text-2xl font-semibold">
              {summary.totalTransactions}
            </h2>
          </div>
        </section>

        {/* CUSTOMER WALLETS TABLE */}
        <section className="min-w-0 overflow-hidden rounded-xl border border-[#414d5e] bg-[#293444]">
          <div className="flex flex-col gap-4 border-b border-[#414d5e] p-5 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="font-semibold">Customer Wallets</h2>
              <p className="mt-1 text-xs text-gray-400">
                View customer wallet balances and transaction history.
              </p>
            </div>

            <input
              type="text"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              placeholder="Search name or email..."
              aria-label="Search customer wallets"
              className="w-full rounded-lg border border-[#414d5e] bg-[#202936] px-4 py-2.5 text-sm outline-none focus:border-[#b51a2b] md:w-72"
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-left text-sm">
              <thead className="bg-[#202936] text-gray-400">
                <tr>
                  <th className="px-5 py-4 font-medium">Customer</th>
                  <th className="px-5 py-4 font-medium">Email</th>
                  <th className="px-5 py-4 font-medium">Balance</th>
                  <th className="px-5 py-4 font-medium">Transactions</th>
                  <th className="px-5 py-4 text-right font-medium">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-5 py-10 text-center text-gray-400"
                    >
                      Loading wallets...
                    </td>
                  </tr>
                ) : wallets.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-5 py-10 text-center text-gray-400"
                    >
                      No customer wallets found.
                    </td>
                  </tr>
                ) : (
                  wallets.map((wallet) => (
                    <tr
                      key={wallet._id}
                      className="border-t border-[#414d5e] transition hover:bg-[#303b4c]"
                    >
                      <td className="px-5 py-4">
                        {wallet.userId?.name || "Unknown customer"}
                      </td>

                      <td className="break-all px-5 py-4 text-gray-300">
                        {wallet.userId?.email || "—"}
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 font-medium">
                        {formatMoney(wallet.balance)}
                      </td>

                      <td className="px-5 py-4">
                        {wallet.transactions?.length || 0}
                      </td>

                      <td className="px-5 py-4 text-right">
                        <button
                          type="button"
                          onClick={() => viewWallet(wallet._id)}
                          disabled={detailsLoading}
                          className="whitespace-nowrap rounded-md bg-[#b51a2b] px-3 py-2 text-xs transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          View details
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* PAGINATION */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#414d5e] p-5 text-sm">
            <p className="text-gray-400">
              Page {pagination.currentPage || page} of {totalPages}
            </p>

            <div className="flex gap-2">
              <button
                type="button"
                disabled={page <= 1 || loading}
                onClick={() => setPage((current) => current - 1)}
                className="rounded-md border border-[#414d5e] px-3 py-2 transition hover:bg-[#354158] disabled:cursor-not-allowed disabled:opacity-40"
              >
                Previous
              </button>

              <button
                type="button"
                disabled={page >= totalPages || loading}
                onClick={() => setPage((current) => current + 1)}
                className="rounded-md border border-[#414d5e] px-3 py-2 transition hover:bg-[#354158] disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        </section>

        {/* WALLET DETAILS */}
        {(detailsLoading || selectedWallet) && (
          <section className="mt-6 min-w-0 overflow-hidden rounded-xl border border-[#414d5e] bg-[#293444] p-5">
            {detailsLoading ? (
              <p className="text-gray-400">
                Loading wallet details...
              </p>
            ) : selectedWallet ? (
              <>
                <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-semibold">
                      Transaction History
                    </h2>

                    <p className="mt-1 break-all text-sm text-gray-400">
                      {selectedWallet.userId?.name || "Unknown customer"}
                      {" · "}
                      {selectedWallet.userId?.email || "—"}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelectedWallet(null)}
                    className="rounded-md border border-[#414d5e] px-3 py-2 text-sm transition hover:bg-[#354158]"
                  >
                    Close
                  </button>
                </div>

                <p className="mb-4 text-sm">
                  Current balance:{" "}
                  <span className="font-semibold">
                    {formatMoney(selectedWallet.balance)}
                  </span>
                </p>

                <div className="overflow-x-auto">
                  <table className="w-full min-w-[650px] text-left text-sm">
                    <thead className="text-gray-400">
                      <tr>
                        <th className="px-3 py-3">Date</th>
                        <th className="px-3 py-3">Type</th>
                        <th className="px-3 py-3">Amount</th>
                        <th className="px-3 py-3">Reason</th>
                        <th className="px-3 py-3">Order</th>
                      </tr>
                    </thead>

                    <tbody>
                      {selectedWallet.transactions?.length ? (
                        [...selectedWallet.transactions]
                          .sort(
                            (a, b) =>
                              new Date(b.createdAt || 0) -
                              new Date(a.createdAt || 0)
                          )
                          .map((transaction, index) => (
                            <tr
                              key={transaction._id || index}
                              className="border-t border-[#414d5e]"
                            >
                              <td className="whitespace-nowrap px-3 py-3 text-gray-300">
                                {transaction.createdAt
                                  ? new Date(
                                      transaction.createdAt
                                    ).toLocaleString("en-IN")
                                  : "—"}
                              </td>

                              <td className="px-3 py-3">
                                <span
                                  className={
                                    transaction.type === "CREDIT"
                                      ? "text-green-400"
                                      : "text-red-400"
                                  }
                                >
                                  {transaction.type || "—"}
                                </span>
                              </td>

                              <td className="whitespace-nowrap px-3 py-3">
                                {formatMoney(transaction.amount)}
                              </td>

                              <td className="px-3 py-3">
                                {transaction.reason || "—"}
                              </td>

                              <td className="px-3 py-3">
                                {transaction.orderId?.orderId ||
                                  transaction.orderId?._id ||
                                  transaction.orderId ||
                                  "—"}
                              </td>
                            </tr>
                          ))
                      ) : (
                        <tr>
                          <td
                            colSpan={5}
                            className="px-3 py-6 text-center text-gray-400"
                          >
                            No transactions recorded.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </>
            ) : null}
          </section>
        )}
      </div>

      {/* CUSTOM NOTIFICATION MODAL */}
      {notification.open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeNotification();
            }
          }}
        >
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="wallet-notification-title"
            aria-describedby="wallet-notification-message"
            className="w-full max-w-md rounded-2xl border border-[#414d5e] bg-[#293444] p-6 shadow-2xl"
          >
            <div
              className={`mb-4 flex h-12 w-12 items-center justify-center rounded-full text-xl ${
                notification.type === "success"
                  ? "bg-green-500/15 text-green-400"
                  : "bg-red-500/15 text-red-400"
              }`}
            >
              {notification.type === "success" ? "✓" : "!"}
            </div>

            <h2
              id="wallet-notification-title"
              className="text-lg font-semibold"
            >
              {notification.title}
            </h2>

            <p
              id="wallet-notification-message"
              className="mt-2 text-sm leading-6 text-gray-300"
            >
              {notification.message}
            </p>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                autoFocus
                onClick={closeNotification}
                className="rounded-lg bg-[#b51a2b] px-5 py-2.5 text-sm font-medium transition hover:bg-red-700"
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

export default AdminWallet;
