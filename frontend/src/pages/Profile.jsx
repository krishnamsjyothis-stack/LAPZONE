
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";


const BACKEND_URL =
  import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
function getProfileImageUrl(profileImage) {
  if (!profileImage) return "";

  const imagePath =
    typeof profileImage === "string"
      ? profileImage
      : profileImage.url ||
        profileImage.path ||
        profileImage.filename;

  if (typeof imagePath !== "string" || !imagePath.trim()) {
    return "";
  }

  const path = imagePath.trim();

  if (/^https?:\/\//i.test(path)) {
    try {
      const parsedUrl = new URL(path);

      if (
        parsedUrl.hostname === "localhost" ||
        parsedUrl.hostname === "127.0.0.1"
      ) {
        return `${BACKEND_URL}${parsedUrl.pathname}${parsedUrl.search}${parsedUrl.hash}`;
      }

      return path;
    } catch {
      return "";
    }
  }

  return `${BACKEND_URL}/${path.replace(/^\/+/, "")}`;
}


function Profile() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [imageFailed, setImageFailed] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);

  useEffect(() => {
    let active = true;

    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          navigate("/login");
          return;
        }

        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };

        const profileResponse = await api.get(
          "/user/profile",
          config
        );

        if (!active) return;

        const fetchedUser = profileResponse.data.user;

        setUser(fetchedUser);
        setImageFailed(false);

        try {
          const addressResponse = await api.get(
            "/address",
            config
          );

          if (active) {
            setAddresses(addressResponse.data.addresses || []);
          }
        } catch (addressError) {
          console.error(
            "Address error:",
            addressError.response?.data || addressError.message
          );

          if (active) {
            setAddresses([]);
          }
        }
      } catch (error) {
        console.error(
          "Profile error:",
          error.response?.data || error.message
        );

        if (error.response?.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          navigate("/login");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    fetchProfile();

    return () => {
      active = false;
    };
  }, [navigate]);

  const handleLogout = async () => {
    if (logoutLoading) return;

    setLogoutLoading(true);

    try {
      await api.post("/auth/logout");
    } catch (error) {
      console.error(
        "Logout error:",
        error.response?.data || error.message
      );
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      navigate("/login");
    }
  };

  const profileImageUrl = getProfileImageUrl(user?.profileImage);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#151820] flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-[#c51f35] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-300">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#151820] text-gray-200">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-8">
          <p className="text-xs uppercase tracking-[0.2em] text-[#ff6479] mb-2">
            My Account
          </p>

          <h1 className="text-3xl sm:text-4xl font-bold text-white">
            My Profile
          </h1>

          <p className="text-gray-400 text-sm mt-2">
            Manage your personal information and account settings.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)] gap-6 items-start">
          <aside className="space-y-4">
            <div className="bg-[#384358] border border-white/5 rounded-2xl p-6 text-center">
              <div className="w-28 h-28 mx-auto rounded-full border-2 border-[#c51f35] bg-[#222731] flex items-center justify-center overflow-hidden">
                {profileImageUrl && !imageFailed ? (
                  <img
                    key={profileImageUrl}
                    src={profileImageUrl}
                    alt={`${user?.name || "User"} profile`}
                    className="w-full h-full object-cover"
                    onError={(event) => {
                      console.error(
                        "Profile image failed to load:",
                        event.currentTarget.src
                      );
                      setImageFailed(true);
                    }}
                  />
                ) : (
                  <span
                    className="text-5xl"
                    aria-label="Default profile avatar"
                    role="img"
                  >
                    👤
                  </span>
                )}
              </div>

              <h2 className="text-white text-xl font-semibold mt-5 break-words">
                {user?.name || "User"}
              </h2>

              <p className="text-gray-300 text-sm mt-2 break-all">
                {user?.email || "Email not available"}
              </p>

              <div className="mt-5 pt-4 border-t border-white/10">
                <p className="text-xs text-gray-400">
                  LAPZONE MEMBER
                </p>
              </div>
            </div>

            <div className="bg-[#384358] border border-white/5 rounded-2xl p-3">
              <button
                type="button"
                onClick={() => navigate("/profile/edit")}
                className="w-full min-h-11 px-4 rounded-xl flex items-center gap-3 text-left text-gray-200 hover:bg-white/5 transition"
              >
                <span className="text-lg">✎</span>
                <span className="text-sm font-medium">
                  Edit Profile
                </span>
              </button>

              <button
                type="button"
                onClick={() => navigate("/addresses")}
                className="w-full min-h-11 px-4 rounded-xl flex items-center gap-3 text-left text-gray-200 hover:bg-white/5 transition"
              >
                <span className="text-lg">📍</span>
                <span className="text-sm font-medium">
                  Manage Addresses
                </span>
              </button>

              <button
                type="button"
                onClick={() => navigate("/change-password")}
                className="w-full min-h-11 px-4 rounded-xl flex items-center gap-3 text-left text-gray-200 hover:bg-white/5 transition"
              >
                <span className="text-lg">🔒</span>
                <span className="text-sm font-medium">
                  Change Password
                </span>
              </button>

              <div className="border-t border-white/10 my-2" />

              <button
                type="button"
                onClick={handleLogout}
                disabled={logoutLoading}
                className="w-full min-h-11 px-4 rounded-xl flex items-center gap-3 text-[#ff7d8c] hover:bg-[#c51f35]/10 transition disabled:opacity-50"
              >
                <span className="text-lg">⇥</span>
                <span className="text-sm font-medium">
                  {logoutLoading ? "Logging out..." : "Logout"}
                </span>
              </button>
            </div>
          </aside>

          <section className="min-w-0 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-[#384358] border border-white/5 rounded-2xl p-5 flex items-center gap-4">
                <div className="w-12 h-12 shrink-0 rounded-xl bg-[#222731] flex items-center justify-center text-[#ff6479] text-xl">
                  ▣
                </div>

                <div className="min-w-0">
                  <p className="text-white text-xl font-bold">0</p>
                  <p className="text-gray-400 text-xs mt-1">
                    Total Orders
                  </p>
                </div>
              </div>

              <div className="bg-[#384358] border border-white/5 rounded-2xl p-5 flex items-center gap-4">
                <div className="w-12 h-12 shrink-0 rounded-xl bg-[#222731] flex items-center justify-center text-[#ff6479] text-xl">
                  ♥
                </div>

                <div className="min-w-0">
                  <p className="text-white text-xl font-bold">0</p>
                  <p className="text-gray-400 text-xs mt-1">
                    Wishlist Items
                  </p>
                </div>
              </div>

              <div className="bg-[#384358] border border-white/5 rounded-2xl p-5 flex items-center gap-4">
                <div className="w-12 h-12 shrink-0 rounded-xl bg-[#222731] flex items-center justify-center text-[#ff6479] text-xl">
                  📍
                </div>

                <div className="min-w-0">
                  <p className="text-white text-xl font-bold">
                    {addresses.length}
                  </p>
                  <p className="text-gray-400 text-xs mt-1">
                    Saved Addresses
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-[#384358] border border-white/5 rounded-2xl p-5 sm:p-7">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-7">
                <div>
                  <h2 className="text-xl sm:text-2xl font-semibold text-white">
                    Personal Information
                  </h2>

                  <p className="text-gray-400 text-sm mt-2">
                    View your personal details and account information.
                  </p>
                </div>

                <div className="w-12 h-12 shrink-0 rounded-xl bg-[#222731] flex items-center justify-center text-[#ff6479] text-2xl">
                  ♙
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="min-w-0">
                  <label className="block text-xs uppercase tracking-wider text-gray-400 mb-2">
                    Full Name
                  </label>

                  <div className="min-h-12 bg-[#222731] border border-[#4a5568] rounded-lg flex items-center gap-3 px-4 py-3">
                    <span className="text-gray-400">♙</span>
                    <span className="text-sm text-gray-200 break-words">
                      {user?.name || "Not available"}
                    </span>
                  </div>
                </div>

                <div className="min-w-0">
                  <label className="block text-xs uppercase tracking-wider text-gray-400 mb-2">
                    Email Address
                  </label>

                  <div className="min-h-12 bg-[#222731] border border-[#4a5568] rounded-lg flex items-center gap-3 px-4 py-3">
                    <span className="text-gray-400">✉</span>
                    <span className="text-sm text-gray-200 break-all">
                      {user?.email || "Not available"}
                    </span>
                  </div>
                </div>

                <div className="min-w-0">
                  <label className="block text-xs uppercase tracking-wider text-gray-400 mb-2">
                    Phone Number
                  </label>

                  <div className="min-h-12 bg-[#222731] border border-[#4a5568] rounded-lg flex items-center gap-3 px-4 py-3">
                    <span className="text-gray-400">☎</span>
                    <span className="text-sm text-gray-200">
                      {user?.phone || "Not added"}
                    </span>
                  </div>
                </div>

                <div className="min-w-0">
                  <label className="block text-xs uppercase tracking-wider text-gray-400 mb-2">
                    Saved Addresses
                  </label>

                  <button
                    type="button"
                    onClick={() => navigate("/addresses")}
                    className="w-full min-h-12 bg-[#222731] border border-[#4a5568] rounded-lg flex items-center justify-between gap-3 px-4 py-3 text-left hover:border-[#c51f35] transition"
                  >
                    <span className="flex items-center gap-3 min-w-0">
                      <span className="text-gray-400">📍</span>
                      <span className="text-sm text-gray-200">
                        {addresses.length === 0
                          ? "No saved addresses"
                          : `${addresses.length} saved ${
                              addresses.length === 1
                                ? "address"
                                : "addresses"
                            }`}
                      </span>
                    </span>

                    <span className="text-[#ff6479] shrink-0">→</span>
                  </button>
                </div>
              </div>

              {addresses.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-xs uppercase tracking-wider text-gray-400 mb-3">
                    Your Addresses
                  </h3>

                  <div className="space-y-3">
                    {addresses.map((address) => (
                      <div
                        key={address._id}
                        className="bg-[#222731] border border-[#4a5568] rounded-xl p-4"
                      >
                        <div className="flex flex-col sm:flex-row sm:justify-between gap-2">
                          <p className="text-white text-sm font-semibold">
                            {address.fullName || user?.name}
                          </p>

                          {address.isDefault && (
                            <span className="text-xs text-green-400">
                              Default address
                            </span>
                          )}
                        </div>

                        <p className="text-gray-300 text-sm mt-2 break-words">
                          {address.addressLine}
                        </p>

                        <p className="text-gray-400 text-sm mt-1">
                          {address.city}, {address.state} -{" "}
                          {address.pincode}
                        </p>

                        <p className="text-gray-400 text-sm mt-1">
                          Phone: {address.phone}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row sm:justify-end gap-3 mt-8 pt-6 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => navigate("/change-password")}
                  className="min-h-11 px-5 rounded-xl border border-[#c51f35] text-[#ff6479] hover:bg-[#c51f35] hover:text-white text-sm font-medium transition"
                >
                  Change Password
                </button>

                <button
                  type="button"
                  onClick={() => navigate("/profile/edit")}
                  className="min-h-11 px-7 rounded-xl bg-[#c51f35] hover:bg-[#b51a2b] text-white text-sm font-semibold transition"
                >
                  Edit Profile
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
