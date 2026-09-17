import { useNavigate } from "react-router-dom";

function AdminDashboard() {
  const navigate = useNavigate();

  // ================= DASHBOARD DATA =================

  const stats = [
    {
      title: "TOTAL SALES",
      value: "₹12,48,500",
      change: "+12.5% vs last month",
      icon: "₹",
      positive: true,
    },
    {
      title: "TOTAL ORDERS",
      value: "1,248",
      change: "+8.2% vs last month",
      icon: "🛒",
      positive: true,
    },
    {
      title: "TOTAL CUSTOMERS",
      value: "856",
      change: "+6.4% vs last month",
      icon: "♙",
      positive: true,
    },
    {
      title: "TOTAL PRODUCTS",
      value: "124",
      change: "-2.1% vs last month",
      icon: "▣",
      positive: false,
    },
  ];

  const recentOrders = [
    {
      id: "#LZ10245",
      customer: "Rahul K",
      product: "ASUS ROG Zephyrus G16",
      total: "₹1,39,999",
      status: "DELIVERED",
    },
    {
      id: "#LZ10246",
      customer: "Arun M",
      product: "Lenovo Legion Pro 5",
      total: "₹1,15,500",
      status: "PROCESSING",
    },
    {
      id: "#LZ10247",
      customer: "Priya S",
      product: "Alienware m18 R2",
      total: "₹2,45,000",
      status: "SHIPPED",
    },
    {
      id: "#LZ10248",
      customer: "Karthik V",
      product: "HP Omen 16",
      total: "₹98,999",
      status: "DELIVERED",
    },
    {
      id: "#LZ10249",
      customer: "Sneha R",
      product: "MacBook Air M2",
      total: "₹1,12,000",
      status: "PROCESSING",
    },
  ];

  const topMovers = [
    {
      name: "ASUS ROG Zephyrus G16",
      sold: "128 sold",
    },
    {
      name: "Lenovo Legion 5",
      sold: "96 sold",
    },
    {
      name: "ASUS TUF Gaming F15",
      sold: "72 sold",
    },
  ];

  const lowStock = [
    {
      name: "ASUS TUF Gaming F15",
      stock: "3 left",
    },
    {
      name: "ASUS TUF Gaming F15",
      stock: "5 left",
    },
  ];

  // ================= STATUS COLOR =================

  const getStatusStyle = (status) => {
    if (status === "DELIVERED") {
      return "bg-emerald-500/20 text-emerald-400";
    }

    if (status === "PROCESSING") {
      return "bg-yellow-500/20 text-yellow-400";
    }

    if (status === "SHIPPED") {
      return "bg-blue-500/20 text-blue-400";
    }

    return "bg-gray-500/20 text-gray-400";
  };

  return (
    <div className="min-h-screen bg-[#101722] text-white flex">

      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      <aside className="w-[175px] min-h-screen bg-[#1d2b45] flex flex-col fixed left-0 top-0">

        {/* LOGO */}

        <div className="h-[64px] flex items-center px-5 border-b border-white/5">

          <div className="w-7 h-7 bg-white flex items-center justify-center mr-2">
            <span className="text-[8px] font-bold text-[#1d2b45]">
              LAP
            </span>
          </div>

          <span className="text-xl font-bold tracking-wide">
            LAPZONE
          </span>

        </div>

        {/* MENU */}

        <nav className="flex-1 px-3 py-5 space-y-1">

          {/* Dashboard */}

          <button
            onClick={() => navigate("/admin/dashboard")}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md bg-[#e51e3c] text-white text-sm"
          >
            <span>▦</span>
            <span>Dashboard</span>
          </button>

          {/* Products */}

          <button
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-[#b7c2d8] hover:bg-white/5 text-sm"
          >
            <span>▣</span>
            <span>Products</span>
          </button>

          {/* Categories */}

          <button
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-[#b7c2d8] hover:bg-white/5 text-sm"
          >
            <span>♧</span>
            <span>Categories</span>
          </button>

          {/* Orders */}

          <button
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-[#b7c2d8] hover:bg-white/5 text-sm"
          >
            <span>🛒</span>
            <span>Orders</span>
          </button>

          {/* Customers */}

          <button
            onClick={() => navigate("/admin/users")}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-[#b7c2d8] hover:bg-white/5 text-sm"
          >
            <span>♙</span>
            <span>Customers</span>
          </button>

          {/* Reviews */}

          <button
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-[#b7c2d8] hover:bg-white/5 text-sm"
          >
            <span>⚑</span>
            <span>Reviews</span>
          </button>

          {/* Returns */}

          <button
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-[#b7c2d8] hover:bg-white/5 text-sm"
          >
            <span>↩</span>
            <span>Returns</span>
          </button>

          {/* Coupons */}

          <button
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-[#b7c2d8] hover:bg-white/5 text-sm"
          >
            <span>▤</span>
            <span>Coupons</span>
          </button>

          {/* Wallet */}

          <button
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-[#b7c2d8] hover:bg-white/5 text-sm"
          >
            <span>◈</span>
            <span>Wallet</span>
          </button>

          {/* Sales Reports */}

          <button
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-[#b7c2d8] hover:bg-white/5 text-sm"
          >
            <span>▥</span>
            <span>Sales Reports</span>
          </button>

          {/* Brand */}

          <button
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-[#b7c2d8] hover:bg-white/5 text-sm"
          >
            <span>▱</span>
            <span>Brand</span>
          </button>

          {/* Offer */}

          <button
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-[#b7c2d8] hover:bg-white/5 text-sm"
          >
            <span>◫</span>
            <span>Offer</span>
          </button>

        </nav>

        {/* BOTTOM MENU */}

        <div className="px-3 pb-5 space-y-2">

          <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-[#b7c2d8]">
            ⚙
            <span>Settings</span>
          </button>

          <button
            onClick={() => navigate("/admin/login")}
            className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-400"
          >
            ↪
            <span>Logout</span>
          </button>

        </div>

      </aside>

      {/* =====================================================
          MAIN CONTENT
      ===================================================== */}

      <main className="ml-[175px] flex-1 min-h-screen">

        {/* =================================================
            TOP BAR
        ================================================= */}

        <header className="h-[64px] bg-[#111a28] border-b border-white/5 flex items-center justify-between px-7">

          {/* SEARCH */}

          <div className="w-[435px]">

            <div className="flex items-center bg-[#1c2b45] rounded-md px-4 py-2">

              <span className="text-[#7d8da8] mr-3">
                🔍
              </span>

              <input
                type="text"
                placeholder="Search anything... (orders, products, users, etc.)"
                className="bg-transparent outline-none text-sm text-white placeholder-[#8190a9] w-full"
              />

            </div>

          </div>

          {/* RIGHT SIDE */}

          <div className="flex items-center gap-6">

            <span className="text-xl">
              🔔
            </span>

            <div className="flex items-center gap-3">

              <div className="w-9 h-9 rounded-full bg-[#344d72] flex items-center justify-center">
                ●
              </div>

              <div className="text-right">

                <p className="text-sm font-semibold">
                  Admin User
                </p>

                <p className="text-[9px] text-[#7185a4]">
                  SUPER ADMIN
                </p>

              </div>

              <span className="text-[#8292ab]">
                ˅
              </span>

            </div>

          </div>

        </header>

        {/* =================================================
            DASHBOARD CONTENT
        ================================================= */}

        <section className="p-7">

          {/* TITLE */}

          <div className="flex justify-between items-start mb-5">

            <div>

              <h1 className="text-[36px] leading-none font-bold tracking-tight">
                ADMIN DASHBOARD
              </h1>

              <p className="text-[#8191ad] text-sm mt-2">
                Overview of your LAPZONE high-performance store.
              </p>

            </div>

            <div className="bg-[#1c2b45] rounded-md px-4 py-2 text-xs text-[#c5cede]">
              📅 &nbsp;30 AUG 2026
            </div>

          </div>

          {/* =================================================
              STAT CARDS
          ================================================= */}

          <div className="grid grid-cols-4 gap-4 mb-4">

            {stats.map((stat, index) => (

              <div
                key={index}
                className="bg-[#1b2a44] rounded-lg p-5 border border-white/5"
              >

                <div className="flex justify-between items-start">

                  <div>

                    <p className="text-[10px] text-[#91a0ba] tracking-wide">
                      {stat.title}
                    </p>

                    <h2 className="text-2xl font-bold mt-3">
                      {stat.value}
                    </h2>

                  </div>

                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center ${
                      stat.positive
                        ? "bg-blue-500/10 text-blue-400"
                        : "bg-red-500/10 text-red-400"
                    }`}
                  >
                    {stat.icon}
                  </div>

                </div>

                <div
                  className={`text-[10px] mt-4 ${
                    stat.positive
                      ? "text-emerald-400"
                      : "text-red-400"
                  }`}
                >
                  {stat.positive ? "▲" : "▼"}{" "}
                  {stat.change}
                </div>

              </div>

            ))}

          </div>

          {/* =================================================
              SALES + TOP MOVERS
          ================================================= */}

          <div className="grid grid-cols-[2.2fr_1fr] gap-4 mb-4">

            {/* SALES OVERVIEW */}

            <div className="bg-[#1b2a44] rounded-lg p-5 border border-white/5">

              <div className="flex justify-between items-center mb-5">

                <h2 className="text-lg font-semibold">
                  SALES OVERVIEW
                </h2>

                <div className="flex gap-1">

                  <button className="text-[10px] px-3 py-1 bg-[#111a28] rounded">
                    Weekly
                  </button>

                  <button className="text-[10px] px-3 py-1 bg-[#e51e3c] rounded">
                    Monthly
                  </button>

                </div>

              </div>

              {/* CHART */}

              <div className="relative h-[145px]">

                {/* GRID */}

                <div className="absolute inset-0 flex flex-col justify-between">

                  <div className="border-t border-white/5" />
                  <div className="border-t border-white/5" />
                  <div className="border-t border-white/5" />
                  <div className="border-t border-white/5" />
                  <div className="border-t border-white/5" />

                </div>

                {/* CHART */}

                <svg
                  viewBox="0 0 700 180"
                  className="absolute inset-0 w-full h-full"
                  preserveAspectRatio="none"
                >

                  <defs>

                    <linearGradient
                      id="salesGradient"
                      x1="0"
                      x2="0"
                      y1="0"
                      y2="1"
                    >

                      <stop
                        offset="0%"
                        stopOpacity="0.35"
                      />

                      <stop
                        offset="100%"
                        stopOpacity="0"
                      />

                    </linearGradient>

                  </defs>

                  <path
                    d="M0 145
                       C60 130 90 135 130 130
                       C170 125 185 100 220 105
                       C270 112 280 112 320 105
                       C360 98 380 90 420 75
                       C465 60 490 75 530 70
                       C575 65 605 70 650 48
                       C670 38 685 30 700 22
                       L700 180
                       L0 180 Z"
                    fill="url(#salesGradient)"
                  />

                  <path
                    d="M0 145
                       C60 130 90 135 130 130
                       C170 125 185 100 220 105
                       C270 112 280 112 320 105
                       C360 98 380 90 420 75
                       C465 60 490 75 530 70
                       C575 65 605 70 650 48
                       C670 38 685 30 700 22"
                    fill="none"
                    stroke="currentColor"
                    className="text-red-500"
                    strokeWidth="3"
                  />

                  <circle
                    cx="0"
                    cy="145"
                    r="4"
                    fill="currentColor"
                    className="text-red-500"
                  />

                  <circle
                    cx="130"
                    cy="130"
                    r="4"
                    fill="currentColor"
                    className="text-red-500"
                  />

                  <circle
                    cx="220"
                    cy="105"
                    r="4"
                    fill="currentColor"
                    className="text-red-500"
                  />

                  <circle
                    cx="320"
                    cy="105"
                    r="4"
                    fill="currentColor"
                    className="text-red-500"
                  />

                  <circle
                    cx="420"
                    cy="75"
                    r="4"
                    fill="currentColor"
                    className="text-red-500"
                  />

                  <circle
                    cx="530"
                    cy="70"
                    r="4"
                    fill="currentColor"
                    className="text-red-500"
                  />

                  <circle
                    cx="700"
                    cy="22"
                    r="4"
                    fill="currentColor"
                    className="text-red-500"
                  />

                </svg>

              </div>

              {/* X AXIS */}

              <div className="flex justify-between text-[9px] text-[#7888a2] mt-2">

                <span>Mon</span>
                <span>Tue</span>
                <span>Wed</span>
                <span>Thu</span>
                <span>Fri</span>
                <span>Sat</span>
                <span>Sun</span>

              </div>

            </div>

            {/* TOP MOVERS */}

            <div className="bg-[#1b2a44] rounded-lg p-5 border border-white/5">

              <div className="flex justify-between items-center mb-4">

                <h2 className="text-sm font-semibold">
                  TOP MOVERS
                </h2>

                <div className="flex text-[9px]">

                  <button className="px-2 py-1 bg-[#111a28]">
                    Weekly
                  </button>

                  <button className="px-2 py-1 bg-[#e51e3c] rounded-r">
                    Monthly
                  </button>

                </div>

              </div>

              <div className="space-y-4">

                {topMovers.map((item, index) => (

                  <div key={index}>

                    <div className="flex justify-between items-center">

                      <div className="flex items-center gap-3">

                        <div className="w-9 h-9 bg-[#263958] rounded flex items-center justify-center text-xs">
                          💻
                        </div>

                        <span className="text-[10px]">
                          {item.name}
                        </span>

                      </div>

                      <span className="text-[9px] text-[#b5c0d2]">
                        {item.sold}
                      </span>

                    </div>

                    <div className="ml-12 mt-2 h-1 bg-[#263958] rounded">

                      <div
                        className="h-full bg-pink-500 rounded"
                        style={{
                          width: `${100 - index * 18}%`,
                        }}
                      />

                    </div>

                  </div>

                ))}

              </div>

            </div>

          </div>

          {/* =================================================
              RECENT ORDERS + RIGHT SIDE
          ================================================= */}

          <div className="grid grid-cols-[2.2fr_1fr] gap-4">

            {/* RECENT ORDERS */}

            <div className="bg-[#1b2a44] rounded-lg p-5 border border-white/5">

              <div className="flex justify-between items-center mb-4">

                <h2 className="text-lg font-semibold">
                  RECENT ORDERS
                </h2>

                <button className="text-[10px] text-[#8fa0bb]">
                  View All →
                </button>

              </div>

              <div className="overflow-x-auto">

                <table className="w-full text-left">

                  <thead>

                    <tr className="text-[9px] text-[#8292ad] border-b border-white/5">

                      <th className="pb-3">
                        ORDER ID
                      </th>

                      <th className="pb-3">
                        CUSTOMER
                      </th>

                      <th className="pb-3">
                        PRODUCT
                      </th>

                      <th className="pb-3">
                        TOTAL
                      </th>

                      <th className="pb-3">
                        STATUS
                      </th>

                    </tr>

                  </thead>

                  <tbody>

                    {recentOrders.map((order) => (

                      <tr
                        key={order.id}
                        className="border-b border-white/5 text-[10px]"
                      >

                        <td className="py-3 text-red-500 font-semibold">
                          {order.id}
                        </td>

                        <td className="py-3">
                          {order.customer}
                        </td>

                        <td className="py-3 text-[#c7cfdd]">
                          {order.product}
                        </td>

                        <td className="py-3">
                          {order.total}
                        </td>

                        <td className="py-3">

                          <span
                            className={`px-2 py-1 rounded text-[8px] ${getStatusStyle(
                              order.status
                            )}`}
                          >
                            {order.status}
                          </span>

                        </td>

                      </tr>

                    ))}

                  </tbody>

                </table>

              </div>

            </div>

            {/* RIGHT COLUMN */}

            <div className="space-y-4">

              {/* LOW STOCK */}

              <div className="bg-[#1b2a44] rounded-lg p-4 border border-white/5">

                <h2 className="text-sm font-semibold mb-3">
                  <span className="text-red-500">⚠</span>{" "}
                  LOW STOCK ACTION
                </h2>

                <p className="text-[9px] text-red-400 mb-3">
                  🔥 1 product needs attention
                </p>

                {lowStock.map((item, index) => (

                  <div
                    key={index}
                    className="flex items-center justify-between py-2 border-t border-white/5"
                  >

                    <div className="flex items-center gap-3">

                      <div className="w-8 h-8 bg-[#263958] rounded flex items-center justify-center">
                        💻
                      </div>

                      <span className="text-[9px]">
                        {item.name}
                      </span>

                    </div>

                    <span className="text-[9px] text-red-400">
                      {item.stock}
                    </span>

                  </div>

                ))}

              </div>

              {/* COMMAND CENTER */}

              <div className="bg-[#1b2a44] rounded-lg p-4 border border-white/5">

                <h2 className="text-sm font-semibold mb-3">
                  COMMAND CENTER
                </h2>

                <button
                  onClick={() => navigate("/admin/products")}
                  className="w-full py-2.5 rounded-md bg-[#e51e3c] hover:bg-[#c91732] text-white text-xs font-medium mb-3"
                >
                  ＋ Add New Product
                </button>

                <div className="grid grid-cols-2 gap-2">

                  <button className="border border-white/10 rounded-md py-2 text-[9px] text-[#c3ccda]">
                    ◇ &nbsp; View Orders
                  </button>

                  <button className="border border-white/10 rounded-md py-2 text-[9px] text-[#c3ccda]">
                    ▣ &nbsp; View Report
                  </button>

                </div>

              </div>

            </div>

          </div>

        </section>

      </main>

    </div>
  );
}

export default AdminDashboard;