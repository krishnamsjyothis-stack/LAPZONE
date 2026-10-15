
import { useEffect, useState } from "react";
import api from "../../api/axios";

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const limit = 5;

  // FETCH USERS
  const fetchUsers = async (searchValue = "", page = 1) => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/admin/users", {
        params: {
          search: searchValue,
          page,
          limit,
          sort: "newest",
        },
      });

      const data = response.data;
      const pagination = data.pagination || {};

      setUsers(data.users || []);
      setCurrentPage(pagination.currentPage || page);
      setTotalPages(pagination.totalPages || 1);
      setTotalUsers(
        pagination.totalUsers ?? data.users?.length ?? 0
      );
    } catch (err) {
      console.error(
        "Failed to fetch users:",
        err.response?.data || err.message
      );

      setError(
        err.response?.data?.message || "Failed to fetch users"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers("", 1);
  }, []);

  // SEARCH
  const handleSearch = () => {
    setCurrentPage(1);
    fetchUsers(search.trim(), 1);
  };

  const handleClear = () => {
    setSearch("");
    setStatusFilter("all");
    setSortOrder("newest");
    setCurrentPage(1);
    fetchUsers("", 1);
  };

  // BLOCK / UNBLOCK USER
  const handleToggleBlock = async (user) => {
    const action = user.isBlocked ? "unblock" : "block";

    const confirmed = window.confirm(
      `Are you sure you want to ${action} this user?`
    );

    if (!confirmed) return;

    try {
      setError("");
      setSuccess("");

      await api.patch(
        `/admin/users/${user._id}/${action}`,
        { isBlocked: !user.isBlocked }
      );

      setSuccess(`User ${action}ed successfully`);
      await fetchUsers(search.trim(), currentPage);
    } catch (err) {
      console.error(
        `Failed to ${action} user:`,
        err.response?.data || err.message
      );

      setError(
        err.response?.data?.message ||
          `Failed to ${action} user`
      );
    }
  };

  // PAGINATION
  const goToPage = (page) => {
    if (page < 1 || page > totalPages) return;

    setCurrentPage(page);
    fetchUsers(search.trim(), page);
  };

  // CLIENT-SIDE FILTER AND SORT
  // Applies only to users loaded for the current server page.
  const displayedUsers = [...users]
    .filter((user) => {
      if (statusFilter === "active") {
        return !user.isBlocked;
      }

      if (statusFilter === "blocked") {
        return user.isBlocked;
      }

      return true;
    })
    .sort((a, b) => {
      if (sortOrder === "oldest") {
        return (
          new Date(a.createdAt || 0) -
          new Date(b.createdAt || 0)
        );
      }

      if (sortOrder === "name-asc") {
        return (a.name || "").localeCompare(b.name || "");
      }

      if (sortOrder === "name-desc") {
        return (b.name || "").localeCompare(a.name || "");
      }

      return (
        new Date(b.createdAt || 0) -
        new Date(a.createdAt || 0)
      );
    });

  const activeUsers = users.filter(
    (user) => !user.isBlocked
  ).length;

  const blockedUsers = users.filter(
    (user) => user.isBlocked
  ).length;

  return (
    <div className="min-h-screen bg-[#151923] text-white">
      {/* TOP BAR */}
      <header className="h-16 bg-[#151923] border-b border-[#2c3340] px-6 flex items-center justify-between">
        <div className="w-[55%] max-w-xl">
          <div className="flex items-center bg-[#202632] border border-[#303847] rounded-lg px-4 py-2.5">
            <span className="text-gray-500 text-sm mr-2">
              ⌕
            </span>

            <span className="text-xs text-gray-500">
              LAPZONE Admin
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-xs font-medium text-white">
              Admin User
            </p>

            <p className="text-[9px] text-gray-500">
              System Architect
            </p>
          </div>

          <div className="w-9 h-9 rounded-full bg-[#4a556c] border-2 border-[#69758c] flex items-center justify-center text-xs">
            A
          </div>
        </div>
      </header>

      {/* PAGE CONTENT */}
      <div className="p-6">
        <div>
          <div className="text-[9px] uppercase tracking-wide text-gray-500 mb-2">
            Dashboard
            <span className="mx-2">/</span>
            <span className="text-[#e33445]">
              Customers
            </span>
          </div>

          <h1 className="text-xl font-semibold">
            USER MANAGEMENT
          </h1>

          <p className="text-xs text-gray-500 mt-2 max-w-2xl">
            Manage LAPZONE customers, monitor account status
            and control user access.
          </p>
        </div>

        {/* SUCCESS MESSAGE */}
        {success && (
          <div className="mt-4 bg-green-500/10 border border-green-500/30 text-green-300 text-xs px-4 py-3 rounded-md">
            {success}
          </div>
        )}

        {/* ERROR MESSAGE */}
        {error && (
          <div className="mt-4 bg-red-500/10 border border-red-500/30 text-red-300 text-xs px-4 py-3 rounded-md">
            {error}
          </div>
        )}

        {/* STAT CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="bg-[#354158] rounded-lg p-5">
            <p className="text-[10px] uppercase tracking-wide text-gray-400">
              Total Customers
            </p>

            <p className="text-2xl font-semibold mt-5">
              {totalUsers}
            </p>

            <p className="text-[10px] text-gray-500 mt-1">
              Matching registered users
            </p>
          </div>

          <div className="bg-[#354158] rounded-lg p-5">
            <p className="text-[10px] uppercase tracking-wide text-gray-400">
              Active Users
            </p>

            <p className="text-2xl font-semibold text-green-300 mt-5">
              {activeUsers}
            </p>

            <p className="text-[10px] text-gray-500 mt-1">
              On this page
            </p>
          </div>

          <div className="bg-[#354158] rounded-lg p-5">
            <p className="text-[10px] uppercase tracking-wide text-gray-400">
              Blocked Users
            </p>

            <p className="text-2xl font-semibold text-red-300 mt-5">
              {blockedUsers}
            </p>

            <p className="text-[10px] text-gray-500 mt-1">
              On this page
            </p>
          </div>
        </div>

        {/* USER TABLE */}
        <div className="mt-6 bg-[#354158] rounded-lg overflow-hidden">
          {/* SEARCH, FILTER AND SORT */}
          <div className="p-3 flex flex-col lg:flex-row gap-3">
            <div className="flex-1 flex items-center bg-[#171d28] border border-[#2c3340] rounded-md px-3">
              <span className="text-gray-500 mr-2">
                ⌕
              </span>

              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSearch();
                }}
                placeholder="Search users by name or email..."
                className="flex-1 min-w-0 bg-transparent outline-none text-xs text-white placeholder:text-gray-600 py-2.5"
              />

              {search && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="text-gray-500 hover:text-white text-xs px-2"
                  aria-label="Clear search"
                >
                  ✕
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={handleSearch}
              className="bg-[#b51a2b] hover:bg-[#d92d3d] px-5 py-2 rounded-md text-xs font-medium"
            >
              SEARCH
            </button>

            <button
              type="button"
              onClick={handleClear}
              className="bg-[#202938] hover:bg-[#273142] text-gray-300 px-5 py-2 rounded-md text-xs"
            >
              CLEAR
            </button>

            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
                fetchUsers(search.trim(), 1);
              }}
              className="bg-[#202938] border border-[#465168] rounded-md px-3 py-2 text-xs text-white"
              aria-label="Filter by user status"
            >
              <option value="all">All Users</option>
              <option value="active">Active</option>
              <option value="blocked">Blocked</option>
            </select>

            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="bg-[#202938] border border-[#465168] rounded-md px-3 py-2 text-xs text-white"
              aria-label="Sort users"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="name-asc">Name A–Z</option>
              <option value="name-desc">Name Z–A</option>
            </select>
          </div>

          {/* TABLE */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px]">
              <thead>
                <tr className="bg-[#3b465d] text-[9px] uppercase tracking-wide text-gray-400">
                  <th className="text-left px-5 py-4">
                    User
                  </th>
                  <th className="text-left px-5 py-4">
                    Email
                  </th>
                  <th className="text-left px-5 py-4">
                    Phone
                  </th>
                  <th className="text-left px-5 py-4">
                    Joined
                  </th>
                  <th className="text-left px-5 py-4">
                    Status
                  </th>
                  <th className="text-right px-5 py-4">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="text-center py-12 text-gray-400 text-xs"
                    >
                      Loading users...
                    </td>
                  </tr>
                ) : displayedUsers.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="text-center py-12 text-gray-500 text-xs"
                    >
                      No users found for this filter
                    </td>
                  </tr>
                ) : (
                  displayedUsers.map((user) => {
                    const blocked = user.isBlocked === true;

                    return (
                      <tr
                        key={user._id}
                        className="border-t border-[#465168] hover:bg-[#3d4961] transition"
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-[#202735] border border-[#556078] flex items-center justify-center text-xs font-semibold">
                              {user.name?.charAt(0)?.toUpperCase() || "U"}
                            </div>

                            <div>
                              <p
                                className={`text-xs font-medium ${
                                  blocked ? "text-gray-500" : "text-white"
                                }`}
                              >
                                {user.name}
                              </p>

                              <p className="text-[9px] text-gray-500 mt-1">
                                ID: {user._id?.slice(-6)}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <span className="text-[10px] text-gray-300">
                            {user.email || "-"}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <span className="text-[10px] text-gray-400">
                            {user.phone || "-"}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <span className="text-[10px] text-gray-400">
                            {user.createdAt
                              ? new Date(user.createdAt).toLocaleDateString("en-IN")
                              : "-"}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          {blocked ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-400/10 border border-red-300/20 text-[9px] text-red-300">
                              <span className="w-1.5 h-1.5 bg-red-300 rounded-full" />
                              BLOCKED
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-400/10 border border-green-300/20 text-[9px] text-green-300">
                              <span className="w-1.5 h-1.5 bg-green-300 rounded-full" />
                              ACTIVE
                            </span>
                          )}
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex justify-end">
                            <button
                              type="button"
                              onClick={() => handleToggleBlock(user)}
                              className={`px-4 py-2 rounded-md text-[9px] font-medium ${
                                blocked
                                  ? "bg-green-500/10 text-green-300 border border-green-400/20 hover:bg-green-500/20"
                                  : "bg-red-500/10 text-red-300 border border-red-400/20 hover:bg-red-500/20"
                              }`}
                            >
                              {blocked ? "UNBLOCK" : "BLOCK"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* PAGINATION */}
          <div className="px-5 py-4 border-t border-[#465168] flex flex-col sm:flex-row gap-3 items-center justify-between">
            <p className="text-[9px] text-gray-400">
              Showing {displayedUsers.length} of {users.length} users on this page
              {" · "}
              {totalUsers} total matching users
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage <= 1 || loading}
                className="w-7 h-7 rounded text-gray-400 hover:bg-[#465168] disabled:opacity-30"
                aria-label="Previous page"
              >
                ‹
              </button>

              {Array.from(
                { length: totalPages },
                (_, index) => index + 1
              )
                .slice(
                  Math.max(currentPage - 2, 0),
                  Math.min(currentPage + 1, totalPages)
                )
                .map((pageNumber) => (
                  <button
                    key={pageNumber}
                    type="button"
                    onClick={() => goToPage(pageNumber)}
                    disabled={loading}
                    className={`w-7 h-7 rounded text-[10px] ${
                      currentPage === pageNumber
                        ? "bg-[#b51a2b] text-white"
                        : "text-gray-400 hover:bg-[#465168]"
                    }`}
                  >
                    {pageNumber}
                  </button>
                ))}

              <button
                type="button"
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage >= totalPages || loading}
                className="w-7 h-7 rounded text-gray-400 hover:bg-[#465168] disabled:opacity-30"
                aria-label="Next page"
              >
                ›
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminUsers;
