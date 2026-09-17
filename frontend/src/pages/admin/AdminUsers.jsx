import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";

function AdminUsers() {
  const navigate = useNavigate();

  // ================= STATE =================

  const [users, setUsers] = useState([]);

  const [search, setSearch] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const [page, setPage] = useState(1);

  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalUsers: 0,
  });

  const [loading, setLoading] = useState(false);

  // ================= FETCH USERS =================

  const fetchUsers = async () => {
    try {
      setLoading(true);

      const response = await api.get("/admin/users", {
        params: {
            search: searchQuery,
          page,
          limit: 10,
        },
      });

      console.log("USERS:", response.data);

      setUsers(response.data.users || []);

      setPagination(
        response.data.pagination || {
          currentPage: 1,
          totalPages: 1,
          totalUsers: 0,
        }
      );
    } catch (error) {
      console.error(
        "FETCH USERS ERROR:",
        error.response?.data || error.message
      );
    } finally {
      setLoading(false);
    }
  };



// ================= FETCH USERS =================

useEffect(() => {
  fetchUsers();
}, [page, searchQuery]);

// ================= SEARCH =================
const handleSearch = (e) => {
  e.preventDefault();

  setPage(1);
  setSearchQuery(search);
};
// ================= CLEAR SEARCH =================

const handleClear = () => {
  setSearch("");
  setSearchQuery("");
  setPage(1);
};
  // ================= BLOCK USER =================

  const handleBlock = async (id) => {
    const confirmBlock = window.confirm(
      "Are you sure you want to block this user?"
    );

    if (!confirmBlock) return;

    try {
      await api.patch(`/admin/users/${id}/block`);

      alert("User blocked successfully");

      fetchUsers();
    } catch (error) {
      console.error(
        "BLOCK ERROR:",
        error.response?.data || error.message
      );

      alert(
        error.response?.data?.message ||
          "Failed to block user"
      );
    }
  };

  // ================= UNBLOCK USER =================

  const handleUnblock = async (id) => {
    const confirmUnblock = window.confirm(
      "Are you sure you want to unblock this user?"
    );

    if (!confirmUnblock) return;

    try {
      await api.patch(`/admin/users/${id}/unblock`);

      alert("User unblocked successfully");

      fetchUsers();
    } catch (error) {
      console.error(
        "UNBLOCK ERROR:",
        error.response?.data || error.message
      );

      alert(
        error.response?.data?.message ||
          "Failed to unblock user"
      );
    }
  };

  // ================= STATISTICS =================

  const activeUsers = users.filter(
    (user) => !user.isBlocked
  ).length;

  const blockedUsers = users.filter(
    (user) => user.isBlocked
  ).length;

  // ================= UI =================

  return (
    <div className="min-h-screen bg-[#161a22] text-white flex">

      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      <aside className="hidden md:flex w-64 bg-[#384358] min-h-screen flex-col">

        {/* LOGO */}

        <div className="px-6 py-6 border-b border-white/10">

          <h1 className="text-2xl font-black tracking-tight">
            LAPZONE
          </h1>

          <p className="text-xs text-gray-300 mt-1">
            ADMIN PANEL
          </p>

        </div>

        {/* NAVIGATION */}

        <nav className="flex-1 px-4 py-6">

          <button
            onClick={() =>
              navigate("/admin/dashboard")
            }
            className="w-full text-left px-4 py-3 rounded-lg text-gray-300 hover:bg-white/10 mb-2"
          >
            Dashboard
          </button>

          <button
            className="w-full text-left px-4 py-3 rounded-lg bg-[#b91f35] text-white mb-2"
          >
            Users
          </button>

          <button className="w-full text-left px-4 py-3 rounded-lg text-gray-300 hover:bg-white/10 mb-2">
            Products
          </button>

          <button className="w-full text-left px-4 py-3 rounded-lg text-gray-300 hover:bg-white/10 mb-2">
            Categories
          </button>

          <button className="w-full text-left px-4 py-3 rounded-lg text-gray-300 hover:bg-white/10 mb-2">
            Orders
          </button>

          <button className="w-full text-left px-4 py-3 rounded-lg text-gray-300 hover:bg-white/10 mb-2">
            Reviews
          </button>

          <button className="w-full text-left px-4 py-3 rounded-lg text-gray-300 hover:bg-white/10 mb-2">
            Coupons
          </button>

        </nav>

        {/* BOTTOM */}

        <div className="px-4 pb-6">

          <button className="w-full text-left px-4 py-3 rounded-lg text-gray-300 hover:bg-white/10">
            Settings
          </button>

          <button
            onClick={() =>
              navigate("/admin/login")
            }
            className="w-full text-left px-4 py-3 rounded-lg text-red-400 hover:bg-red-500/10 mt-2"
          >
            Logout
          </button>

        </div>

      </aside>

      {/* =====================================================
          MAIN CONTENT
      ===================================================== */}

      <main className="flex-1 min-w-0">

        {/* =================================================
            TOP BAR
        ================================================= */}

        <header className="h-16 bg-[#1c2029] border-b border-white/10 flex items-center justify-between px-6">

          <div>

            <p className="text-xs text-gray-500">
              Dashboard / Customers
            </p>

          </div>

          <div className="flex items-center gap-4">

            <span className="text-sm text-gray-300">
              Admin User
            </span>

            <div className="w-9 h-9 rounded-full bg-[#b91f35] flex items-center justify-center font-bold">
              A
            </div>

          </div>

        </header>

        {/* =================================================
            PAGE CONTENT
        ================================================= */}

        <div className="p-6">

          {/* HEADER */}

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 mb-7">

            <div>

              <h2 className="text-3xl font-black">
                USER MANAGEMENT
              </h2>

              <p className="text-sm text-gray-400 mt-2">
                View and manage all registered LAPZONE customers.
                Monitor status and activity.
              </p>

            </div>

            <div className="flex gap-3">

              <button
                onClick={fetchUsers}
                className="px-5 py-3 rounded-lg bg-[#384358] hover:bg-[#46526b] text-sm font-semibold"
              >
                Refresh
              </button>

            </div>

          </div>

          {/* =================================================
              STATISTICS
          ================================================= */}

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-7">

            {/* TOTAL */}

            <div className="bg-[#384358] rounded-lg p-5">

              <p className="text-xs uppercase tracking-wider text-gray-400">
                Total Users
              </p>

              <h3 className="text-3xl font-black mt-3">
                {pagination.totalUsers}
              </h3>

              <div className="h-1 bg-gray-500/40 mt-4 rounded-full">
                <div className="h-1 bg-white rounded-full w-full" />
              </div>

            </div>

            {/* ACTIVE */}

            <div className="bg-[#384358] rounded-lg p-5">

              <p className="text-xs uppercase tracking-wider text-gray-400">
                Active Users
              </p>

              <h3 className="text-3xl font-black mt-3 text-green-400">
                {activeUsers}
              </h3>

              <div className="h-1 bg-gray-500/40 mt-4 rounded-full">
                <div className="h-1 bg-green-400 rounded-full w-3/4" />
              </div>

            </div>

            {/* BLOCKED */}

            <div className="bg-[#384358] rounded-lg p-5">

              <p className="text-xs uppercase tracking-wider text-gray-400">
                Blocked Users
              </p>

              <h3 className="text-3xl font-black mt-3 text-red-500">
                {blockedUsers}
              </h3>

              <div className="h-1 bg-gray-500/40 mt-4 rounded-full">
                <div className="h-1 bg-red-500 rounded-full w-1/4" />
              </div>

            </div>

            {/* NEW USERS */}

            <div className="bg-[#384358] rounded-lg p-5">

              <p className="text-xs uppercase tracking-wider text-gray-400">
                Current Page
              </p>

              <h3 className="text-3xl font-black mt-3">
                {users.length}
              </h3>

              <p className="text-xs text-gray-400 mt-2">
                Users displayed on this page
              </p>

            </div>

          </div>

          {/* =================================================
              SEARCH BAR
          ================================================= */}

          <div className="bg-[#1c2029] rounded-lg p-4 mb-5 border border-white/5">

            <form
              onSubmit={handleSearch}
              className="flex flex-col sm:flex-row gap-3"
            >

              <div className="flex-1 relative">

                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                  🔍
                </span>

                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={search}
                  onChange={(e) =>
                    setSearch(e.target.value)
                  }
                  className="w-full h-11 bg-[#252a34] border border-white/10 rounded-lg pl-11 pr-4 text-white placeholder:text-gray-500 outline-none focus:border-[#b91f35]"
                />

              </div>

              <button
                type="submit"
                className="px-6 h-11 rounded-lg bg-[#b91f35] hover:bg-[#a51b30] font-semibold"
              >
                Search
              </button>

              <button
                type="button"
                onClick={handleClear}
                className="px-6 h-11 rounded-lg border border-gray-500 text-gray-300 hover:bg-white/5"
              >
                Clear
              </button>

            </form>

          </div>

          {/* =================================================
              TABLE
          ================================================= */}

          <div className="bg-[#384358] rounded-lg overflow-hidden border border-white/5">

            {/* TABLE HEADER */}

            <div className="px-5 py-4 border-b border-white/10 flex justify-between items-center">

              <div>

                <h3 className="font-bold">
                  Customers
                </h3>

                <p className="text-xs text-gray-400 mt-1">
                  Latest registered users appear first
                </p>

              </div>

              <div className="text-xs text-gray-400">
                {pagination.totalUsers} users
              </div>

            </div>

            <div className="overflow-x-auto">

              <table className="w-full min-w-[850px]">

                <thead className="bg-[#30394c]">

                  <tr>

                    <th className="text-left px-5 py-4 text-xs uppercase tracking-wider text-gray-400">
                      User
                    </th>

                    <th className="text-left px-5 py-4 text-xs uppercase tracking-wider text-gray-400">
                      Contact Info
                    </th>

                    <th className="text-left px-5 py-4 text-xs uppercase tracking-wider text-gray-400">
                      Status
                    </th>

                    <th className="text-left px-5 py-4 text-xs uppercase tracking-wider text-gray-400">
                      Joined
                    </th>

                    <th className="text-center px-5 py-4 text-xs uppercase tracking-wider text-gray-400">
                      Actions
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {loading ? (

                    <tr>

                      <td
                        colSpan="5"
                        className="text-center py-16 text-gray-400"
                      >
                        Loading users...
                      </td>

                    </tr>

                  ) : users.length === 0 ? (

                    <tr>

                      <td
                        colSpan="5"
                        className="text-center py-16 text-gray-400"
                      >
                        No users found
                      </td>

                    </tr>

                  ) : (

                    users.map((user) => (

                      <tr
                        key={user._id}
                        className="border-t border-white/10 hover:bg-white/5 transition"
                      >

                        {/* USER */}

                        <td className="px-5 py-5">

                          <div className="flex items-center gap-3">

                            <div className="w-9 h-9 rounded-full bg-[#b91f35] flex items-center justify-center font-bold">

                              {user.name
                                ?.charAt(0)
                                ?.toUpperCase() || "U"}

                            </div>

                            <div>

                              <p className="font-semibold text-sm">
                                {user.name}
                              </p>

                              <p className="text-xs text-gray-500">
                                ID: {user._id.slice(-6)}
                              </p>

                            </div>

                          </div>

                        </td>

                        {/* EMAIL */}

                        <td className="px-5 py-5">

                          <p className="text-sm">
                            {user.email}
                          </p>

                          <p className="text-xs text-gray-500 mt-1">
                            {user.phone || "No phone number"}
                          </p>

                        </td>

                        {/* STATUS */}

                        <td className="px-5 py-5">

                          {user.isBlocked ? (

                            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 text-red-400 text-xs font-bold">

                              <span className="w-2 h-2 rounded-full bg-red-500" />

                              BLOCKED

                            </span>

                          ) : (

                            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 text-green-400 text-xs font-bold">

                              <span className="w-2 h-2 rounded-full bg-green-400" />

                              ACTIVE

                            </span>

                          )}

                        </td>

                        {/* JOINED */}

                        <td className="px-5 py-5 text-sm text-gray-300">

                          {user.createdAt
                            ? new Date(
                                user.createdAt
                              ).toLocaleDateString("en-IN", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              })
                            : "-"}

                        </td>

                        {/* ACTION */}

                        <td className="px-5 py-5 text-center">

                          {user.isBlocked ? (

                            <button
                              onClick={() =>
                                handleUnblock(user._id)
                              }
                              className="px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white text-xs font-bold"
                            >
                              Unblock
                            </button>

                          ) : (

                            <button
                              onClick={() =>
                                handleBlock(user._id)
                              }
                              className="px-4 py-2 rounded-lg bg-[#b91f35] hover:bg-[#a51b30] text-white text-xs font-bold"
                            >
                              Block
                            </button>

                          )}

                        </td>

                      </tr>

                    ))

                  )}

                </tbody>

              </table>

            </div>

            {/* =================================================
                TABLE FOOTER / PAGINATION
            ================================================= */}

            <div className="px-5 py-4 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-4">

              <p className="text-xs text-gray-400">

                Showing{" "}
                <span className="text-white font-semibold">
                  {users.length}
                </span>{" "}
                of{" "}
                <span className="text-white font-semibold">
                  {pagination.totalUsers}
                </span>{" "}
                users

              </p>

              <div className="flex items-center gap-2">

                <button
                  disabled={page === 1}
                  onClick={() =>
                    setPage(page - 1)
                  }
                  className="px-4 py-2 rounded-lg bg-[#252a34] text-sm disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#30394c]"
                >
                  ←
                </button>

                <span className="px-4 py-2 rounded-lg bg-[#b91f35] text-sm font-bold">
                  {pagination.currentPage}
                </span>

                <button
                  disabled={
                    page >= pagination.totalPages
                  }
                  onClick={() =>
                    setPage(page + 1)
                  }
                  className="px-4 py-2 rounded-lg bg-[#252a34] text-sm disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#30394c]"
                >
                  →
                </button>

              </div>

            </div>

          </div>

        </div>

      </main>

    </div>
  );
}

export default AdminUsers;