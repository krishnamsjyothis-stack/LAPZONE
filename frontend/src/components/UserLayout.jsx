
import { Outlet } from "react-router-dom";
import UserNavbar from "./UserNavbar";
import Footer from "./UserFooter";

function UserLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-[#11161e] text-white">
      <UserNavbar />

      <main className="flex-1">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
}

export default UserLayout;