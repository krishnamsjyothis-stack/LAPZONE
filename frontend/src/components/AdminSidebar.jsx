import { useLocation, useNavigate } from "react-router-dom";

function AdminSidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path;
  };

  const isPathActive = (path) => {
    return location.pathname.startsWith(path);
  };

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("token");

    navigate("/admin/login", { replace: true });
  };

  const showComingSoon = (pageName) => {
    alert(`${pageName} page is not created yet.`);
  };

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-60 bg-[#1b2433] border-r border-[#30394a] flex flex-col z-50">

      {/* LOGO */}
      <div className="h-16 px-5 flex items-center border-b border-[#30394a]">
        <div className="w-5 h-5 bg-[#b51a2b] rounded-sm mr-2" />

        <span className="font-semibold text-sm tracking-wide">
          LAPZONE
        </span>
      </div>

      {/* NAVIGATION */}
      <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">

        {/* DASHBOARD */}
        <button
          type="button"
          onClick={() => navigate("/admin/dashboard")}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-xs transition ${
            isActive("/admin/dashboard")
              ? "bg-[#b51a2b] text-white"
              : "text-gray-400 hover:bg-[#252f40] hover:text-white"
          }`}
        >
          <span>▣</span>
          <span>Dashboard</span>
        </button>

        {/* PRODUCTS */}
        <button
          type="button"
          onClick={() => navigate("/admin/products")}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-xs transition ${
            isPathActive("/admin/products")
              ? "bg-[#b51a2b] text-white"
              : "text-gray-400 hover:bg-[#252f40] hover:text-white"
          }`}
        >
          <span>◇</span>
          <span>Products</span>
        </button>

        {/* CATEGORIES */}
        <button
          type="button"
          onClick={() => navigate("/admin/categories")}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-xs transition ${
            isPathActive("/admin/categories")
              ? "bg-[#b51a2b] text-white"
              : "text-gray-400 hover:bg-[#252f40] hover:text-white"
          }`}
        >
          <span>◆</span>
          <span>Categories</span>
        </button>

        {/* INVENTORY */}
        <button
          type="button"
          onClick={() => navigate("/admin/inventory")}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-xs transition ${
            isPathActive("/admin/inventory")
              ? "bg-[#b51a2b] text-white"
              : "text-gray-400 hover:bg-[#252f40] hover:text-white"
          }`}
        >
          <span>▤</span>
          <span>Inventory</span>
        </button>

        

        {/* ORDERS */}
        <button
          type="button"
          onClick={() => navigate("/admin/orders")}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-xs transition ${
            isPathActive("/admin/orders")
              ? "bg-[#b51a2b] text-white"
              : "text-gray-400 hover:bg-[#252f40] hover:text-white"
          }`}
        >
          <span>▱</span>
          <span>Orders</span>
        </button>

        {/* CUSTOMERS */}
        <button
          type="button"
          onClick={() => navigate("/admin/users")}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-xs transition ${
            isPathActive("/admin/users")
              ? "bg-[#b51a2b] text-white"
              : "text-gray-400 hover:bg-[#252f40] hover:text-white"
          }`}
        >
          <span>♙</span>
          <span>Customers</span>
        </button>

        {/* REVIEWS */}
       
{/* REVIEWS */}
<button
  type="button"
  onClick={() => navigate("/admin/reviews")}
  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-xs transition ${
    isPathActive("/admin/reviews")
      ? "bg-[#b51a2b] text-white"
      : "text-gray-400 hover:bg-[#252f40] hover:text-white"
  }`}
>
  <span>☆</span>
  <span>Reviews</span>
</button>
{/* RETURNS */}
<button
  type="button"
  onClick={() => navigate("/admin/returns")}
  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-gray-400 hover:bg-[#252f40] hover:text-white text-xs transition"
>
  <span>↩</span>
  <span>Returns</span>
</button>

        {/* COUPONS */}
<button
  type="button"
  onClick={() => navigate("/admin/coupons")}
  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-xs transition ${
    isPathActive("/admin/coupons")
      ? "bg-[#b51a2b] text-white"
      : "text-gray-400 hover:bg-[#252f40] hover:text-white"
  }`}
>
  <span>◇</span>
  <span>Coupons</span>
</button>

{/* OFFERS */}
<button
  type="button"
  onClick={() => navigate("/admin/offers")}
  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-xs transition ${
    isPathActive("/admin/offers")
      ? "bg-[#b51a2b] text-white"
      : "text-gray-400 hover:bg-[#252f40] hover:text-white"
  }`}
>
  <span>🏷</span>
  <span>Offers</span>
</button>

        {/* WALLET */}
        {/* WALLET */}
<button
  type="button"
  onClick={() => navigate("/admin/wallet")}
  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-xs transition ${
    isPathActive("/admin/wallet")
      ? "bg-[#b51a2b] text-white"
      : "text-gray-400 hover:bg-[#252f40] hover:text-white"
  }`}
>
  <span>◉</span>
  <span>Wallet</span>
</button>
        {/* SALES REPORTS */}
        {/* SALES REPORTS */}
<button
  type="button"
  onClick={() => navigate("/admin/sales-reports")}
  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-xs transition ${
    isPathActive("/admin/sales-reports")
      ? "bg-[#b51a2b] text-white"
      : "text-gray-400 hover:bg-[#252f40] hover:text-white"
  }`}
>
  <span>📊</span>
  <span>Sales Reports</span>
</button>

      </nav>

      {/* BOTTOM */}
      <div className="border-t border-[#30394a] p-3">

        {/* SETTINGS */}
        <button
          type="button"
          onClick={() => showComingSoon("Settings")}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-gray-500 hover:text-white text-xs transition"
        >
          <span>⚙</span>
          <span>Settings</span>
        </button>

        {/* LOGOUT */}
        <button
          type="button"
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-[#b51a2b] hover:bg-[#252f40] text-xs transition"
        >
          <span>↪</span>
          <span>Logout</span>
        </button>

      </div>

    </aside>
  );
}

export default AdminSidebar;