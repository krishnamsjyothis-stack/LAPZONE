
import { useCallback, useEffect, useState } from "react";
import api from "../../api/axios";

const STATUS_OPTIONS = ["All", "Pending", "Approved", "Rejected"];

function AdminReviews() {
  const [reviews, setReviews] = useState([]);
  const [counts, setCounts] = useState({});
  const [status, setStatus] = useState("Pending");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const [modal, setModal] = useState({
    open: false,
    type: "",
    review: null,
  });

  const [notice, setNotice] = useState("");

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const params = {
        page,
        limit: 10,
      };

      if (status !== "All") params.status = status;
      if (search.trim()) params.search = search.trim();

      const response = await api.get("/admin/reviews", {
        params,
        withCredentials: true,
      });

      const data = response.data;

      setReviews(
        Array.isArray(data.reviews) ? data.reviews : []
      );

      setCounts(data.counts || {});
      setTotalPages(
        Math.max(1, Number(data.totalPages) || 1)
      );
    } catch (err) {
      console.error("Failed to fetch reviews:", err);

      setError(
        err.response?.data?.message ||
          "Unable to load reviews. Please check your admin login and API."
      );
    } finally {
      setLoading(false);
    }
  }, [page, status, search]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const selectStatus = (value) => {
    setStatus(value);
    setPage(1);
  };

  const handleSearch = (value) => {
    setSearch(value);
    setPage(1);
  };

  const openModal = (type, review) => {
    setModal({
      open: true,
      type,
      review,
    });
  };

  const closeModal = () => {
    if (actionLoading) return;

    setModal({
      open: false,
      type: "",
      review: null,
    });
  };

  const performAction = async () => {
    if (!modal.review || actionLoading) return;

    const reviewId = modal.review._id;
    const action = modal.type;

    setActionLoading(true);
    setNotice("");
    setError("");

    try {
      if (action === "delete") {
        await api.delete(`/admin/reviews/${reviewId}`, {
          withCredentials: true,
        });
      } else {
        await api.patch(
          `/admin/reviews/${reviewId}/status`,
          {
            status: action === "approve" ? "Approved" : "Rejected",
          },
          {
            withCredentials: true,
          }
        );
      }

      setNotice(
        action === "delete"
          ? "Review deleted successfully."
          : action === "approve"
            ? "Review approved successfully."
            : "Review rejected successfully."
      );

      setModal({
        open: false,
        type: "",
        review: null,
      });

      await fetchReviews();
    } catch (err) {
      console.error("Review action failed:", err);

      setError(
        err.response?.data?.message ||
          "The action failed. Please try again."
      );
    } finally {
      setActionLoading(false);
    }
  };

  const getCount = (value) => {
    if (value === "All") {
      return (
        Number(counts.All ?? counts.all ?? counts.total) || 0
      );
    }

    return Number(
      counts[value] ??
        counts[value.toLowerCase()]
    ) || 0;
  };

  const getUserName = (review) => {
    const user = review.userId;

    if (!user) return "Deleted user";
    if (typeof user === "string") return "Customer";

    return user.name || user.email || "Customer";
  };

  const getUserEmail = (review) => {
    const user = review.userId;

    if (!user || typeof user === "string") return "";
    return user.email || "";
  };

  const getProductName = (review) => {
    const product = review.productId;

    if (!product) return "Product unavailable";
    if (typeof product === "string") return "Product";

    return product.name || "Product unavailable";
  };

  const formatDate = (value) => {
    if (!value) return "—";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "—";

    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getStatusStyle = (value) => {
    switch (value) {
      case "Approved":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case "Rejected":
        return "bg-red-500/10 text-red-400 border-red-500/20";
      default:
        return "bg-amber-500/10 text-amber-400 border-amber-500/20";
    }
  };

  const getModalTitle = () => {
    if (modal.type === "approve") return "Approve review?";
    if (modal.type === "reject") return "Reject review?";
    return "Delete review?";
  };

  const getModalDescription = () => {
    if (modal.type === "approve") {
      return "This review will be approved and can appear on the product page.";
    }

    if (modal.type === "reject") {
      return "This review will be marked as rejected and will not appear among approved reviews.";
    }

    return "This action permanently removes the review. You cannot undo this action.";
  };

  return (
    <div className="min-h-screen bg-[#11161e] text-white px-5 py-7 sm:px-8">
      {/* HEADER */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-[#ffb2b8]">
            Store management
          </p>

          <h1 className="mt-2 text-2xl font-semibold">
            Customer Reviews
          </h1>

          <p className="mt-2 text-sm text-gray-400">
            Review customer feedback and manage publication status.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchReviews}
          disabled={loading}
          className="rounded-lg border border-[#384354] px-4 py-2.5 text-sm text-gray-200 transition hover:bg-[#252b34] disabled:opacity-50"
        >
          {loading ? "Refreshing..." : "↻ Refresh"}
        </button>
      </div>

      {/* NOTIFICATIONS */}
      {notice && (
        <div
          role="status"
          className="mt-6 flex items-center justify-between gap-3 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300"
        >
          <span>{notice}</span>

          <button
            type="button"
            onClick={() => setNotice("")}
            aria-label="Dismiss notification"
            className="text-lg"
          >
            ×
          </button>
        </div>
      )}

      {error && (
        <div
          role="alert"
          className="mt-6 flex items-center justify-between gap-3 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300"
        >
          <span>{error}</span>

          <button
            type="button"
            onClick={() => setError("")}
            aria-label="Dismiss error"
            className="text-lg"
          >
            ×
          </button>
        </div>
      )}

      {/* SUMMARY CARDS */}
      <div className="mt-7 grid grid-cols-2 gap-4 xl:grid-cols-4">
        {[
          {
            label: "All reviews",
            value: getCount("All"),
            color: "text-white",
          },
          {
            label: "Pending",
            value: getCount("Pending"),
            color: "text-amber-400",
          },
          {
            label: "Approved",
            value: getCount("Approved"),
            color: "text-emerald-400",
          },
          {
            label: "Rejected",
            value: getCount("Rejected"),
            color: "text-red-400",
          },
        ].map((item) => (
          <div
            key={item.label}
            className="rounded-xl border border-[#303846] bg-[#1b2028] p-5"
          >
            <p className="text-sm text-gray-400">
              {item.label}
            </p>

            <p className={`mt-3 text-2xl font-semibold ${item.color}`}>
              {item.value}
            </p>
          </div>
        ))}
      </div>

      {/* REVIEWS PANEL */}
      <div className="mt-7 overflow-hidden rounded-xl border border-[#303846] bg-[#1b2028]">
        {/* FILTERS */}
        <div className="border-b border-[#303846] p-5">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex flex-wrap gap-2">
              {STATUS_OPTIONS.map((option) => (
                <button
                  type="button"
                  key={option}
                  onClick={() => selectStatus(option)}
                  className={`rounded-lg px-4 py-2 text-sm transition ${
                    status === option
                      ? "bg-[#b51a2b] text-white"
                      : "border border-[#384354] text-gray-400 hover:bg-[#252b34] hover:text-white"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                type="search"
                value={search}
                onChange={(event) =>
                  handleSearch(event.target.value)
                }
                placeholder="Search customer or product..."
                className="min-w-0 flex-1 rounded-lg border border-[#384354] bg-[#11161e] px-4 py-2.5 text-sm text-white outline-none placeholder:text-gray-500 focus:border-[#b51a2b] xl:w-80"
              />

              {search && (
                <button
                  type="button"
                  onClick={() => handleSearch("")}
                  className="rounded-lg border border-[#384354] px-3 text-sm text-gray-300 hover:bg-[#252b34]"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>

        {/* TABLE */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left">
            <thead className="bg-[#202630] text-xs uppercase tracking-wider text-gray-400">
              <tr>
                <th className="px-5 py-4 font-medium">Customer</th>
                <th className="px-5 py-4 font-medium">Product</th>
                <th className="px-5 py-4 font-medium">Review</th>
                <th className="px-5 py-4 font-medium">Rating</th>
                <th className="px-5 py-4 font-medium">Date</th>
                <th className="px-5 py-4 font-medium">Status</th>
                <th className="px-5 py-4 font-medium">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#303846]">
              {loading ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-5 py-16 text-center text-sm text-gray-400"
                  >
                    Loading reviews...
                  </td>
                </tr>
              ) : reviews.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-5 py-16 text-center"
                  >
                    <p className="text-sm text-gray-300">
                      No reviews found.
                    </p>
                    <p className="mt-2 text-xs text-gray-500">
                      Try a different status or search term.
                    </p>
                  </td>
                </tr>
              ) : (
                reviews.map((review) => (
                  <tr
                    key={review._id}
                    className="align-top transition hover:bg-[#202630]/60"
                  >
                    <td className="px-5 py-5">
                      <p className="text-sm font-medium text-gray-100">
                        {getUserName(review)}
                      </p>
                      <p className="mt-1 text-xs text-gray-500">
                        {getUserEmail(review)}
                      </p>
                    </td>

                    <td className="px-5 py-5">
                      <p className="max-w-[180px] text-sm text-gray-200">
                        {getProductName(review)}
                      </p>
                    </td>

                    <td className="px-5 py-5">
                      <p className="max-w-[260px] break-words text-sm font-medium text-gray-200">
                        {review.title}
                      </p>
                      <p className="mt-1 max-w-[260px] whitespace-pre-wrap break-words text-xs leading-5 text-gray-400">
                        {review.comment}
                      </p>
                    </td>

                    <td className="whitespace-nowrap px-5 py-5">
                      <span className="text-amber-400">
                        {"★".repeat(
                          Math.max(
                            0,
                            Math.min(5, Number(review.rating) || 0)
                          )
                        )}
                      </span>
                      <span className="ml-1 text-xs text-gray-400">
                        {review.rating}/5
                      </span>
                    </td>

                    <td className="whitespace-nowrap px-5 py-5 text-xs text-gray-400">
                      {formatDate(review.createdAt)}
                    </td>

                    <td className="px-5 py-5">
                      <span
                        className={`inline-flex rounded-full border px-2.5 py-1 text-xs ${getStatusStyle(review.status)}`}
                      >
                        {review.status || "Pending"}
                      </span>
                    </td>

                    <td className="px-5 py-5">
                      <div className="flex flex-wrap gap-2">
                        {review.status !== "Approved" && (
                          <button
                            type="button"
                            onClick={() =>
                              openModal("approve", review)
                            }
                            className="rounded-md border border-emerald-500/30 px-2.5 py-1.5 text-xs text-emerald-400 transition hover:bg-emerald-500/10"
                          >
                            Approve
                          </button>
                        )}

                        {review.status !== "Rejected" && (
                          <button
                            type="button"
                            onClick={() =>
                              openModal("reject", review)
                            }
                            className="rounded-md border border-amber-500/30 px-2.5 py-1.5 text-xs text-amber-400 transition hover:bg-amber-500/10"
                          >
                            Reject
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() =>
                            openModal("delete", review)
                          }
                          className="rounded-md border border-red-500/30 px-2.5 py-1.5 text-xs text-red-400 transition hover:bg-red-500/10"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        <div className="flex flex-col gap-3 border-t border-[#303846] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-gray-500">
            Page {page} of {totalPages}
          </p>

          <div className="flex gap-2">
            <button
              type="button"
              disabled={page <= 1 || loading}
              onClick={() =>
                setPage((current) => Math.max(1, current - 1))
              }
              className="rounded-lg border border-[#384354] px-4 py-2 text-sm text-gray-300 hover:bg-[#252b34] disabled:cursor-not-allowed disabled:opacity-40"
            >
              Previous
            </button>

            <button
              type="button"
              disabled={page >= totalPages || loading}
              onClick={() =>
                setPage((current) =>
                  Math.min(totalPages, current + 1)
                )
              }
              className="rounded-lg border border-[#384354] px-4 py-2 text-sm text-gray-300 hover:bg-[#252b34] disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* CONFIRMATION MODAL */}
      {modal.open && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeModal();
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="review-modal-title"
            className="w-full max-w-md rounded-2xl border border-[#384354] bg-[#1b2028] p-6 shadow-2xl"
          >
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#b51a2b]/15 text-xl text-[#ffb2b8]">
                {modal.type === "approve"
                  ? "✓"
                  : modal.type === "reject"
                    ? "!"
                    : "×"}
              </div>

              <div>
                <h2
                  id="review-modal-title"
                  className="text-lg font-semibold"
                >
                  {getModalTitle()}
                </h2>

                <p className="mt-2 text-sm leading-6 text-gray-400">
                  {getModalDescription()}
                </p>

                {modal.review && (
                  <div className="mt-4 rounded-lg border border-[#303846] bg-[#11161e] p-3">
                    <p className="text-sm font-medium text-gray-200">
                      {modal.review.title}
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      By {getUserName(modal.review)}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-7 flex justify-end gap-3">
              <button
                type="button"
                disabled={actionLoading}
                onClick={closeModal}
                className="rounded-lg border border-[#384354] px-4 py-2.5 text-sm text-gray-300 hover:bg-[#252b34] disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={actionLoading}
                onClick={performAction}
                className={`rounded-lg px-4 py-2.5 text-sm font-medium text-white transition disabled:cursor-not-allowed disabled:opacity-50 ${
                  modal.type === "approve"
                    ? "bg-emerald-600 hover:bg-emerald-500"
                    : modal.type === "reject"
                      ? "bg-amber-600 hover:bg-amber-500"
                      : "bg-[#b51a2b] hover:bg-[#961625]"
                }`}
              >
                {actionLoading
                  ? "Please wait..."
                  : modal.type === "approve"
                    ? "Approve review"
                    : modal.type === "reject"
                      ? "Reject review"
                      : "Delete review"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminReviews;
