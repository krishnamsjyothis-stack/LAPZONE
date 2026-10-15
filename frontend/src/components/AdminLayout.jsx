
import { Outlet } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";

function AdminLayout() {
  return (
    <div className="min-h-screen bg-[#11161e] text-white">
      <AdminSidebar />

      <main className="min-h-screen pl-60">
        <Outlet />
      </main>
    </div>
  );
}

export default AdminLayout;
