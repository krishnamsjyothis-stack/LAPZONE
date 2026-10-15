
import { useCallback, useEffect, useState } from "react";
import {
  Wallet as WalletIcon,
  ArrowDownLeft,
  ArrowUpRight,
  Clock,
  RefreshCw,
  ReceiptText,
  CircleDollarSign,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";
import api from "../api/axios";

const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(amount) || 0);

const formatDate = (date) => {
  if (!date) return "Date unavailable";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Date unavailable";
  }

  return parsedDate.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const Wallet = () => {
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const fetchWallet = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setErrorMessage("");

    try {
      const response = await api.get("/wallet");
      setWallet(response.data?.wallet ?? null);
    } catch (error) {
      console.error(
        "Wallet error:",
        error.response?.data || error.message
      );

      setErrorMessage(
        error.response?.data?.message ||
          "Unable to load your wallet. Please try again."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchWallet();
  }, [fetchWallet]);

  const transactions = Array.isArray(wallet?.transactions)
    ? [...wallet.transactions].reverse()
    : [];

  const totalCredits = transactions
    .filter((transaction) => transaction.type === "CREDIT")
    .reduce(
      (total, transaction) => total + (Number(transaction.amount) || 0),
      0
    );

  const totalDebits = transactions
    .filter((transaction) => transaction.type === "DEBIT")
    .reduce(
      (total, transaction) => total + (Number(transaction.amount) || 0),
      0
    );

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center bg-[#11161e] text-white">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-white/10 border-t-[#b51a2b]" />
          <p className="text-sm text-gray-400">Loading your wallet...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#11161e] px-4 py-8 text-white sm:px-6 lg:px-8 lg:py-12">
      <div className="mx-auto max-w-6xl">
        {/* PAGE HEADER */}
        <section className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div>
            <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#ffb2b8]">
              <WalletIcon size={16} />
              LAPZONE ACCOUNT
            </div>

            <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
              My <span className="text-[#ffb2b8]">Wallet</span>
            </h1>

            <p className="mt-2 max-w-xl text-sm leading-6 text-gray-400">
              View your available balance and keep track of your wallet
              transactions in one place.
            </p>
          </div>

          <button
            type="button"
            onClick={() => fetchWallet(true)}
            disabled={refreshing}
            className="inline-flex items-center justify-center gap-2 self-start rounded-xl border border-white/10 bg-[#202936] px-4 py-3 text-sm font-semibold text-gray-200 transition hover:border-[#b51a2b]/60 hover:bg-[#293444] disabled:cursor-not-allowed disabled:opacity-60 sm:self-auto"
          >
            <RefreshCw
              size={16}
              className={refreshing ? "animate-spin" : ""}
            />
            {refreshing ? "Refreshing..." : "Refresh"}
          </button>
        </section>

        {/* ERROR MESSAGE */}
        {errorMessage && (
          <div
            role="alert"
            className="mb-6 flex flex-col gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex items-start gap-3">
              <AlertCircle
                size={20}
                className="mt-0.5 shrink-0 text-red-300"
              />
              <p className="text-sm text-red-200">{errorMessage}</p>
            </div>

            <button
              type="button"
              onClick={() => fetchWallet(true)}
              disabled={refreshing}
              className="self-start rounded-lg bg-[#b51a2b] px-4 py-2 text-sm font-semibold hover:bg-[#cf263d] disabled:opacity-60 sm:self-auto"
            >
              Try again
            </button>
          </div>
        )}

        {/* BALANCE CARD */}
        <section className="relative mb-8 overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#293444] via-[#202936] to-[#3b1723] p-6 shadow-xl shadow-black/20 sm:p-9">
          <div className="pointer-events-none absolute -right-12 -top-16 h-64 w-64 rounded-full bg-[#b51a2b]/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 left-1/3 h-48 w-48 rounded-full bg-[#b51a2b]/10 blur-3xl" />

          <div className="relative">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-sm font-medium text-gray-300">
                  <CircleDollarSign
                    size={19}
                    className="text-[#ffb2b8]"
                  />
                  Available Balance
                </div>

                <p className="mt-5 break-words text-4xl font-black tracking-tight sm:text-5xl">
                  {formatCurrency(wallet?.balance)}
                </p>

                <p className="mt-3 max-w-md text-sm leading-6 text-gray-400">
                  Your current wallet balance for eligible LAPZONE
                  purchases.
                </p>
              </div>

              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06] sm:h-16 sm:w-16">
                <WalletIcon
                  size={30}
                  className="text-[#ffb2b8]"
                />
              </div>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-2 border-t border-white/10 pt-5 text-xs text-gray-400">
              <ShieldCheck size={16} className="text-green-400" />
              <span>Wallet overview</span>
              <span className="text-gray-600">•</span>
              <span>Indian Rupees (INR)</span>
            </div>
          </div>
        </section>

        {/* TRANSACTION SUMMARY */}
        <section className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-white/[0.08] bg-[#1b222d] p-5 sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm text-gray-400">Total Credits</p>
                <p className="mt-3 text-2xl font-bold text-green-400">
                  {formatCurrency(totalCredits)}
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  Money added to your wallet
                </p>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-500/10 text-green-400">
                <ArrowDownLeft size={23} />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-white/[0.08] bg-[#1b222d] p-5 sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm text-gray-400">Total Debits</p>
                <p className="mt-3 text-2xl font-bold text-[#ffb2b8]">
                  {formatCurrency(totalDebits)}
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  Money used from your wallet
                </p>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#b51a2b]/10 text-[#ffb2b8]">
                <ArrowUpRight size={23} />
              </div>
            </div>
          </div>
        </section>

        {/* TRANSACTION HISTORY */}
        <section className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#1b222d]">
          <div className="flex flex-col gap-3 border-b border-white/[0.08] px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#b51a2b]/10 text-[#ffb2b8]">
                <ReceiptText size={22} />
              </div>

              <div>
                <h2 className="text-lg font-bold text-white">
                  Transaction History
                </h2>
                <p className="mt-1 text-xs text-gray-500">
                  {transactions.length}{" "}
                  {transactions.length === 1
                    ? "transaction"
                    : "transactions"}
                </p>
              </div>
            </div>

            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-[#202936] px-3 py-1.5 text-xs text-gray-400">
              <Clock size={14} />
              Latest first
            </span>
          </div>

          {!errorMessage && transactions.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-[#202936]">
                <ReceiptText size={28} className="text-gray-500" />
              </div>

              <h3 className="mt-5 text-lg font-semibold text-white">
                No transactions yet
              </h3>

              <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-gray-400">
                Your wallet credits and debits will appear here when
                transactions are recorded.
              </p>

              <button
                type="button"
                onClick={() => {
                  navigateToProducts();
                }}
                className="mt-6 rounded-xl bg-[#b51a2b] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#cf263d]"
              >
                Explore laptops
              </button>
            </div>
          ) : (
            <div className="divide-y divide-white/[0.06]">
              {transactions.map((transaction, index) => {
                const isCredit = transaction.type === "CREDIT";

                return (
                  <article
                    key={transaction._id || index}
                    className="flex flex-col gap-4 px-5 py-5 transition-colors hover:bg-white/[0.02] sm:flex-row sm:items-center sm:justify-between sm:px-6"
                  >
                    <div className="flex min-w-0 items-start gap-4">
                      <div
                        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                          isCredit
                            ? "bg-green-500/10 text-green-400"
                            : "bg-[#b51a2b]/10 text-[#ffb2b8]"
                        }`}
                      >
                        {isCredit ? (
                          <ArrowDownLeft size={22} />
                        ) : (
                          <ArrowUpRight size={22} />
                        )}
                      </div>

                      <div className="min-w-0">
                        <p className="break-words text-sm font-semibold text-white">
                          {transaction.reason || "Wallet transaction"}
                        </p>

                        {transaction.orderId && (
                          <p className="mt-1 break-all text-xs text-gray-500">
                            Order ID: {transaction.orderId}
                          </p>
                        )}

                        <p className="mt-2 text-xs text-gray-500">
                          {formatDate(transaction.createdAt)}
                        </p>
                      </div>
                    </div>

                    <div className="pl-[60px] sm:pl-0 sm:text-right">
                      <p
                        className={`text-lg font-bold ${
                          isCredit ? "text-green-400" : "text-[#ffb2b8]"
                        }`}
                      >
                        {isCredit ? "+" : "-"}
                        {formatCurrency(transaction.amount)}
                      </p>

                      <span
                        className={`mt-1 inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${
                          isCredit
                            ? "bg-green-500/10 text-green-400"
                            : "bg-[#b51a2b]/10 text-[#ffb2b8]"
                        }`}
                      >
                        {transaction.type || "Transaction"}
                      </span>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        {/* FOOTNOTE */}
        <p className="mt-5 text-center text-xs leading-5 text-gray-500">
          Your displayed balance and transaction history are retrieved
          from your LAPZONE account.
        </p>
      </div>
    </main>
  );
};

export default Wallet;
