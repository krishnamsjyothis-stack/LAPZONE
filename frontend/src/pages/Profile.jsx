import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

function Profile() {
  const navigate = useNavigate();

const [user, setUser] = useState(null);
const [addresses, setAddresses] = useState([]);
const [loading, setLoading] = useState(true);

  // ================= FETCH PROFILE =================

useEffect(() => {
  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      // Get user profile
      const profileResponse = await api.get("/user/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("PROFILE:", profileResponse.data);

      setUser(profileResponse.data.user);


      // Get addresses
      try {
        const addressResponse = await api.get("/address", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        console.log("ADDRESSES:", addressResponse.data);

        setAddresses(addressResponse.data.addresses || []);

      } catch (addressError) {
        console.error(
          "ADDRESS ERROR:",
          addressError.response?.data || addressError.message
        );

        // Don't stop the profile from loading
        setAddresses([]);
      }

    } catch (error) {

      console.error(
        "PROFILE ERROR:",
        error.response?.data || error.message
      );

      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
      }

    } finally {
      setLoading(false);
    }
  };

  fetchProfile();

}, [navigate]);

  // ================= LOGOUT =================

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    alert("Logged out successfully");

    navigate("/login");
  };

  // ================= LOADING =================

  if (loading) {
    return (
      <div className="min-h-screen bg-[#151820] flex items-center justify-center text-white">
        Loading profile...
      </div>
    );
  }

  // ================= PROFILE =================

  return (
    <div className="min-h-screen bg-[#151820] text-gray-200">

      {/* ================= NAVBAR ================= */}

      <nav className="h-16 bg-[#11151d] border-b border-[#252a33] flex items-center justify-between px-8">

        {/* LOGO */}

        <div
          className="flex items-center gap-3 cursor-pointer"
          onClick={() => navigate("/")}
        >
          <div className="w-8 h-8 bg-[#c51f35] rounded-md flex items-center justify-center">
            <span className="text-white text-xs font-bold">
              LZ
            </span>
          </div>

          <span className="text-white font-semibold tracking-wide">
            LAPZONE
          </span>
        </div>

        {/* NAV LINKS */}

        <div className="hidden md:flex items-center gap-10 text-sm">

          <button
            onClick={() => navigate("/")}
            className="text-gray-400 hover:text-[#c51f35] transition"
          >
            Home
          </button>

          <button className="text-gray-400 hover:text-[#c51f35] transition">
            Laptops
          </button>

        </div>

        {/* RIGHT ICONS */}

        <div className="flex items-center gap-5 text-gray-400">

          <button className="text-xl hover:text-white">
            ⌕
          </button>

          <button className="text-xl hover:text-white">
            ♡
          </button>

          <button className="text-xl hover:text-white">
            🛒
          </button>

          <button
            className="w-9 h-9 rounded-full bg-[#c51f35] text-white flex items-center justify-center"
          >
            👤
          </button>

        </div>

      </nav>


      {/* ================= MAIN ================= */}

      <main className="max-w-7xl mx-auto px-6 py-8">

        <div className="grid grid-cols-1 lg:grid-cols-[245px_1fr] gap-5">


          {/* ================= LEFT SIDEBAR ================= */}

        

<aside>

  {/* ================= PROFILE CARD ================= */}

  <div className="bg-[#384358] rounded-2xl p-6 text-center">

    {/* PROFILE IMAGE */}

    <div className="w-28 h-28 mx-auto rounded-full border-2 border-[#c51f35] bg-[#222731] flex items-center justify-center overflow-hidden">

      {user?.profileImage ? (
        <img
          src={`http://localhost:5000${user.profileImage}`}
          alt="Profile"
          className="w-full h-full object-cover"
        />
      ) : (
        <span className="text-5xl">
          👤
        </span>
      )}

    </div>

    {/* NAME */}

    <h2 className="text-white text-lg font-semibold mt-4">
      {user?.name || "User"}
    </h2>

    {/* EMAIL */}

    <p className="text-gray-300 text-xs mt-1 uppercase break-all">
      {user?.email || "user@email.com"}
    </p>

  </div>


  {/* ================= LOGOUT CARD ================= */}

  <div className="bg-[#384358] rounded-2xl mt-4 p-2">

    {/* LINE */}

    <div className="border-t border-gray-500/30 my-3"></div>

    {/* LOGOUT */}

    <button
      onClick={handleLogout}
      className="w-full h-12 px-4 flex items-center gap-3 text-[#ff7d8c] hover:text-white transition"
    >
      <span className="text-lg">
        ⇥
      </span>

      <span>
        Logout
      </span>
    </button>

  </div>

</aside>


          {/* ================= RIGHT CONTENT ================= */}

          <section>

            {/* ================= STATS ================= */}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">

              {/* ORDERS */}

              <div className="bg-[#384358] rounded-2xl h-20 px-5 flex items-center gap-4">

                <div className="w-12 h-12 rounded-full bg-[#222731] flex items-center justify-center text-[#c51f35] text-xl">
                  ▣
                </div>

                <div>
                  <p className="text-white text-lg">
                    0
                  </p>

                  <p className="text-gray-400 text-[9px] uppercase">
                    Total Orders
                  </p>
                </div>

              </div>


              {/* WISHLIST */}

              <div className="bg-[#384358] rounded-2xl h-20 px-5 flex items-center gap-4">

                <div className="w-12 h-12 rounded-full bg-[#222731] flex items-center justify-center text-[#c51f35] text-xl">
                  ♥
                </div>

                <div>
                  <p className="text-white text-lg">
                    0
                  </p>

                  <p className="text-gray-400 text-[9px] uppercase">
                    Wishlist Items
                  </p>
                </div>

              </div>


              {/* ADDRESSES */}

              <div className="bg-[#384358] rounded-2xl h-20 px-5 flex items-center gap-4">

                <div className="w-12 h-12 rounded-full bg-[#222731] flex items-center justify-center text-[#c51f35] text-xl">
                  ●
                </div>

                <div>
                  <p className="text-white text-lg">
                    0
                  </p>

                  <p className="text-gray-400 text-[9px] uppercase">
                    Saved Addresses
                  </p>
                </div>

              </div>

            </div>


            {/* ================= PERSONAL INFORMATION ================= */}

            <div className="bg-[#384358] rounded-2xl p-7">

              {/* HEADER */}

              <div className="flex justify-between items-start mb-7">

                <div>

                  <h1 className="text-2xl font-semibold text-white">
                    Personal Information
                  </h1>

                  <p className="text-gray-400 text-sm mt-1">
                    Update your personal details and public profile.
                  </p>

                </div>

                <div className="text-[#c51f35] text-4xl">
                  ♙
                </div>

              </div>


              {/* FORM GRID */}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">


                {/* FULL NAME */}

                <div>

                  <label className="block text-[10px] uppercase tracking-wider text-gray-400 mb-2">
                    Full Name
                  </label>

                  <div className="h-12 bg-[#222731] border border-[#4a5568] rounded-lg flex items-center px-4">

                    <span className="text-gray-400 mr-3">
                      ♙
                    </span>

                    <span className="text-gray-200 text-sm">
                      {user?.name || "Not available"}
                    </span>

                  </div>

                </div>


                {/* EMAIL */}

                <div>

                  <label className="block text-[10px] uppercase tracking-wider text-gray-400 mb-2">
                    Email Address
                  </label>

                  <div className="h-12 bg-[#222731] border border-[#4a5568] rounded-lg flex items-center px-4">

                    <span className="text-gray-400 mr-3">
                      ✉
                    </span>

                    <span className="text-gray-300 text-sm truncate">
                      {user?.email || "Not available"}
                    </span>

                  </div>

                </div>


                {/* PHONE */}

                <div>

                  <label className="block text-[10px] uppercase tracking-wider text-gray-400 mb-2">
                    Phone Number
                  </label>

                  <div className="h-12 bg-[#222731] border border-[#4a5568] rounded-lg flex items-center px-4">

                    <span className="text-gray-400 mr-3">
                      ☎
                    </span>

                    <span className="text-gray-300 text-sm">
                      {user?.phone || "Not added"}
                    </span>

                  </div>

                </div>

              </div>


             {/* ================= ADDRESS ================= */}

<div className="mt-5">

  <div className="flex items-center justify-between mb-2">

    <label className="block text-[10px] uppercase tracking-wider text-gray-400">
      Address
    </label>

    <button
      onClick={() => navigate("/addresses")}
      className="text-xs text-[#c51f35] hover:text-[#ff5268]"
    >
      Manage Addresses
    </button>

  </div>

  <div className="min-h-12 bg-[#222731] border border-[#4a5568] rounded-lg flex items-center px-4 py-3">

    <span className="text-gray-400 mr-3">
      📍
    </span>

    <span className="text-gray-300 text-sm">
      {user?.address || "No address added"}
    </span>

  </div>

</div>


              {/* ================= EDIT ================= */}  

              <div className="flex justify-end mt-7">

                <button
                  onClick={() => navigate("/profile/edit")}
                  className="px-8 h-11 rounded-xl bg-[#c51f35] hover:bg-[#b51a2b] text-white text-sm font-medium transition"
                >
                  Edit
                </button>

              </div>

            </div>

          </section>

        </div>

      </main>

    </div>
  );
}

export default Profile; 