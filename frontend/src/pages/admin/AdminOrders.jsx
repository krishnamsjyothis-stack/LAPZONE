import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";

const AdminOrders = () => {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [sort, setSort] = useState("newest");

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);

  const fetchOrders = async (
    searchValue = search,
    statusValue = status,
    sortValue = sort,
    pageValue = page
  ) => {
    try {
     
const response = await api.get("/admin/orders", {
  params: {
    search: searchValue.trim(),
    status: statusValue,
    sort: sortValue,
    page: pageValue,
    limit: 10,
  },
});


      setOrders(response.data.orders || []);

      setTotalPages(
        response.data.pagination?.totalPages || 1
      );

      setTotalOrders(
        response.data.pagination?.totalOrders || 0
      );
    } catch (error) {
      console.error(
        "Fetch admin orders error:",
        error.response?.data || error.message
      );

      alert(
        error.response?.data?.message ||
          "Failed to fetch orders."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(search, status, sort, page);
  }, [status, sort, page]);

  // ==========================================
  // SEARCH
  // ==========================================

  const handleSearch = (e) => {
    e.preventDefault();

    setPage(1);

    fetchOrders(search, status, sort, 1);
  };

  // ==========================================
  // CLEAR
  // ==========================================

  const handleClear = () => {
    setSearch("");
    setStatus("");
    setSort("newest");
    setPage(1);

    fetchOrders("", "", "newest", 1);
  };

  // ==========================================
  // PAGINATION
  // ==========================================

  const handlePrevious = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };

  const handleNext = () => {
    if (page < totalPages) {
      setPage(page + 1);
    }
  };

  // ==========================================
  // ORDER STATUS STYLE
  // ==========================================

  const getStatusStyle = (orderStatus) => {
    switch (orderStatus) {
      case "Delivered":
        return {
          className:
            "bg-green-400/10 border border-green-300/20 text-green-300",
          dot: "bg-green-300",
        };

      case "Shipped":
        return {
          className:
            "bg-blue-400/10 border border-blue-300/20 text-blue-300",
          dot: "bg-blue-300",
        };

      case "Out for Delivery":
        return {
          className:
            "bg-yellow-400/10 border border-yellow-300/20 text-yellow-300",
          dot: "bg-yellow-300",
        };

      case "Cancelled":
        return {
          className:
            "bg-red-400/10 border border-red-300/20 text-red-300",
          dot: "bg-red-300",
        };

      default:
        return {
          className:
            "bg-gray-400/10 border border-gray-300/20 text-gray-300",
          dot: "bg-gray-300",
        };
    }
  };

  // ==========================================
  // LOADING
  // ==========================================

  if (loading && orders.length === 0) {
    return (
      <div className="min-h-screen bg-[#151923] text-white flex items-center justify-center">
        <div className="text-center">

          <div className="w-8 h-8 border-2 border-[#b51a2b] border-t-transparent rounded-full animate-spin mx-auto" />

          <p className="text-xs text-gray-500 mt-4">
            Loading orders...
          </p>

        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#151923] text-white">

      {/* =================================================
          TOP BAR
      ================================================= */}

      <header className="h-16 bg-[#151923] border-b border-[#2c3340] px-6 flex items-center justify-between">

        {/* Search */}

        <div className="w-[55%] max-w-xl">

          <div className="flex items-center bg-[#202632] border border-[#303847] rounded-lg px-4 py-2.5">

            <span className="text-gray-500 text-sm mr-2">
              ⌕
            </span>

            <input
              type="text"
              placeholder="Search LAPZONE core..."
              className="flex-1 bg-transparent outline-none text-xs text-white placeholder:text-gray-500"
            />

          </div>

        </div>

        {/* Admin */}

        <div className="flex items-center gap-4">

          <button
            type="button"
            className="text-gray-400"
          >
            ♧
          </button>

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


      {/* =================================================
          PAGE CONTENT
      ================================================= */}

      <div className="p-6">

        {/* =================================================
            PAGE HEADER
        ================================================= */}

        <div className="flex justify-between items-start">

          <div>

            <div className="text-[9px] uppercase tracking-wide text-gray-500 mb-2">

              Dashboard

              <span className="mx-2">
                /
              </span>

              <span className="text-[#e33445]">
                Orders
              </span>

            </div>

            <h1 className="text-xl font-semibold">
              ORDER MANAGEMENT
            </h1>

            <p className="text-xs text-gray-500 mt-2 max-w-2xl">
              Manage customer orders, monitor order
              status and review order information.
            </p>

          </div>

        </div>


        {/* =================================================
            STAT CARDS
        ================================================= */}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">

          {/* TOTAL ORDERS */}

          <div className="bg-[#3b465d] rounded-lg p-5">

            <div className="flex justify-between">

              <p className="text-[10px] uppercase tracking-wide text-gray-400">
                Total Orders
              </p>

              <div className="w-7 h-7 rounded bg-[#252d3b] flex items-center justify-center">
                ▦
              </div>

            </div>

            <div className="flex justify-between items-end mt-5">

              <p className="text-2xl font-semibold">
                {totalOrders}
              </p>

              <p className="text-[10px] text-gray-500">
                Customer orders
              </p>

            </div>

          </div>


          {/* CURRENT PAGE */}

          <div className="bg-[#d8f7e2] text-[#166534] rounded-lg p-5">

            <div className="flex justify-between">

              <p className="text-[10px] uppercase tracking-wide font-medium">
                Current Page
              </p>

              <div className="w-7 h-7 rounded bg-white/70 flex items-center justify-center">
                №
              </div>

            </div>

            <div className="flex justify-between items-end mt-5">

              <p className="text-2xl font-semibold">
                {orders.length}
              </p>

              <p className="text-[10px]">
                Orders shown
              </p>

            </div>

          </div>


          {/* PAGE */}

          <div className="bg-[#f0f3f7] text-[#4b5b72] rounded-lg p-5">

            <div className="flex justify-between">

              <p className="text-[10px] uppercase tracking-wide font-medium">
                Page
              </p>

              <div className="w-7 h-7 rounded bg-white flex items-center justify-center">
                #
              </div>

            </div>

            <div className="flex justify-between items-end mt-5">

              <p className="text-2xl font-semibold">
                {page}
              </p>

              <p className="text-[10px]">
                of {totalPages}
              </p>

            </div>

          </div>

        </div>


        {/* =================================================
            ORDERS TABLE
        ================================================= */}

        <div className="mt-6 bg-[#354158] rounded-lg overflow-hidden">

          {/* =================================================
              CONTROLS
          ================================================= */}

          <div className="p-3 flex flex-col md:flex-row gap-3">

            {/* SEARCH */}

            <form
              onSubmit={handleSearch}
              className="flex-1 flex items-center bg-[#171d28] rounded-md px-3"
            >

              <span className="text-gray-500 mr-2">
                ⌕
              </span>

              <input
                type="text"
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                placeholder="Search orders..."
                className="flex-1 bg-transparent outline-none text-xs text-white placeholder:text-gray-600 py-2.5"
              />

              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="text-gray-500 hover:text-white text-xs"
                >
                  ✕
                </button>
              )}

            </form>


            {/* STATUS */}

            <select
              value={status}
              onChange={(e) =>
                setStatus(e.target.value)
              }
              className="bg-[#171d28] text-gray-400 text-xs rounded-md px-4 py-2 outline-none"
            >

              <option value="">
                STATUS: ALL
              </option>

              <option value="Pending">
                PENDING
              </option>

              <option value="Shipped">
                SHIPPED
              </option>

              <option value="Out for Delivery">
                OUT FOR DELIVERY
              </option>

              <option value="Delivered">
                DELIVERED
              </option>

              <option value="Cancelled">
                CANCELLED
              </option>

            </select>


            {/* SORT */}

            <select
              value={sort}
              onChange={(e) =>
                setSort(e.target.value)
              }
              className="bg-[#171d28] text-gray-400 text-xs rounded-md px-4 py-2 outline-none"
            >

              <option value="newest">
                SORT: NEWEST
              </option>

              <option value="oldest">
                SORT: OLDEST
              </option>

            </select>


            {/* CLEAR */}

            <button
              type="button"
              onClick={handleClear}
              className="bg-[#171d28] text-gray-400 hover:text-white text-xs rounded-md px-5 py-2 transition"
            >
              CLEAR
            </button>

          </div>


          {/* =================================================
              TABLE
          ================================================= */}

          <div className="overflow-x-auto">

            {orders.length === 0 ? (

              <div className="p-12 text-center">

                <p className="text-gray-500 text-xs">
                  No orders found.
                </p>

              </div>

            ) : (

              <table className="w-full min-w-[1050px]">

                <thead>

                  <tr className="bg-[#354158] text-[9px] uppercase tracking-wide text-gray-400">

                    <th className="text-left px-5 py-4">
                      Order ID
                    </th>

                    <th className="text-left px-5 py-4">
                      Customer
                    </th>

                    <th className="text-left px-5 py-4">
                      Date
                    </th>

                    <th className="text-left px-5 py-4">
                      Amount
                    </th>

                    <th className="text-left px-5 py-4">
                      Payment
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

                  {orders.map((order) => {

                    const statusStyle =
                      getStatusStyle(
                        order.orderStatus
                      );

                    return (

                      <tr
                        key={order._id}
                        className="border-t border-[#465168] hover:bg-[#3d4961] transition"
                      >

                        {/* ORDER ID */}

                        <td className="px-5 py-4">

                          <p className="text-xs font-medium text-white">
                            {order.orderId}
                          </p>

                          <p className="text-[9px] text-gray-500 mt-1">
                            ID:{" "}
                            {order._id?.slice(-6)}
                          </p>

                        </td>


                        {/* CUSTOMER */}

                        <td className="px-5 py-4">

                          <p className="text-xs font-medium text-white">
                            {order.userId?.name ||
                              order.shippingAddress
                                ?.fullName ||
                              "Unknown"}
                          </p>

                          <p className="text-[9px] text-gray-500 mt-1">
                            {order.userId?.email ||
                              "Not available"}
                          </p>

                        </td>


                        {/* DATE */}

                        <td className="px-5 py-4">

                          <p className="text-[10px] text-gray-300">
                            {new Date(
                              order.createdAt
                            ).toLocaleDateString(
                              "en-IN"
                            )}
                          </p>

                        </td>


                        {/* AMOUNT */}

                        <td className="px-5 py-4">

                          <p className="text-xs font-semibold text-[#ffb2b8]">
                            ₹
                            {Number(
                              order.totalAmount || 0
                            ).toLocaleString("en-IN")}
                          </p>

                          {order.discount > 0 && (
                            <p className="text-[9px] text-green-300 mt-1">
                              Discount: -₹
                              {Number(
                                order.discount
                              ).toLocaleString("en-IN")}
                            </p>
                          )}

                          {order.couponCode && (
                            <p className="text-[9px] text-gray-400 mt-1">
                              Coupon:{" "}
                              <span className="text-[#ffb2b8]">
                                {order.couponCode}
                              </span>
                            </p>
                          )}

                        </td>


                        {/* PAYMENT */}

                        <td className="px-5 py-4">

                          <span className="text-[10px] text-gray-400">
                            {order.paymentMethod ||
                              "-"}
                          </span>

                        </td>


                        {/* STATUS */}

                        <td className="px-5 py-4">

                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] ${statusStyle.className}`}
                          >

                            <span
                              className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot}`}
                            />

                            {order.orderStatus ||
                              "Pending"}

                          </span>

                        </td>


                        {/* ACTION */}

                        <td className="px-5 py-4">

                          <div className="flex justify-end">

                            <button
                              type="button"
                              onClick={() =>
                                navigate(
                                  `/admin/orders/${order._id}`
                                )
                              }
                              className="bg-[#b51a2b] hover:bg-[#d92d3d] px-4 py-2 rounded-md text-[10px] font-medium text-white transition"
                            >
                              VIEW
                            </button>

                          </div>

                        </td>

                      </tr>

                    );
                  })}

                </tbody>

              </table>

            )}

          </div>


          {/* =================================================
              PAGINATION
          ================================================= */}

          {orders.length > 0 && (

            <div className="px-5 py-4 border-t border-[#465168] flex items-center justify-between">

              <p className="text-[9px] text-gray-400">

                Showing{" "}

                {(page - 1) * 10 + 1}

                -

                {(page - 1) * 10 +
                  orders.length}

                {" "}of{" "}

                {totalOrders}

                {" "}orders

              </p>


              <div className="flex items-center gap-2">

                {/* PREVIOUS */}

                <button
                  type="button"
                  onClick={handlePrevious}
                  disabled={page === 1}
                  className="w-7 h-7 rounded text-gray-400 hover:bg-[#465168] disabled:opacity-30"
                >
                  ‹
                </button>


                {/* PAGE */}

                <div className="w-7 h-7 rounded bg-[#d92d3d] text-white flex items-center justify-center text-[10px]">
                  {page}
                </div>


                <span className="text-[9px] text-gray-500">
                  of {totalPages}
                </span>


                {/* NEXT */}

                <button
                  type="button"
                  onClick={handleNext}
                  disabled={
                    page === totalPages
                  }
                  className="w-7 h-7 rounded text-gray-400 hover:bg-[#465168] disabled:opacity-30"
                >
                  ›
                </button>

              </div>

            </div>

          )}

        </div>

      </div>

    </div>
  );
};

export default AdminOrders;