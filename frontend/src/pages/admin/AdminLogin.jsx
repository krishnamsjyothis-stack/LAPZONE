    import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";

function AdminLogin() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);

  // ================= ADMIN LOGIN =================

const handleLogin = async (e) => {
  e.preventDefault();

  if (!email.trim() || !password) {
    alert("Please enter email and password");
    return;
  }

  try {
    setLoading(true);

    const response = await api.post(
      "/admin/login",
      {
        email: email.trim().toLowerCase(),
        password,
      },
      {
        withCredentials: true,
      }
    );

    console.log("ADMIN LOGIN:", response.data);

    alert("Admin login successful!");

    navigate("/admin/dashboard");

  } catch (error) {
    console.error(
      "ADMIN LOGIN ERROR:",
      error.response?.data || error.message
    );

    alert(
      error.response?.data?.message ||
        "Admin login failed"
    );
  } finally {
    setLoading(false);
  }
};
  // ================= UI =================

  return (
    <div className="min-h-screen flex bg-[#384358]">

      {/* =====================================================
          LEFT SIDE
      ===================================================== */}

      <div className="hidden md:flex md:w-[43%] min-h-screen bg-[#384358] relative">

        <div className="w-full flex flex-col px-12 lg:px-16 py-12">

          {/* Gear Icon */}

          <div className="flex-1 flex items-center justify-center">

            <div className="w-20 h-20 rounded-lg border-4 border-[#c51f35] flex items-center justify-center">

              <span className="text-5xl text-[#c51f35]">
                ⚙
              </span>

            </div>

          </div>

          {/* Branding */}

          <div className="pb-10">

            <h1 className="text-5xl lg:text-6xl font-black tracking-tight text-white">
              LAPZONE
            </h1>

            <h2 className="text-2xl lg:text-3xl font-bold tracking-widest text-gray-300 mt-2">
              ADMIN PANEL
            </h2>

            <p className="text-gray-300 text-sm leading-6 mt-6 max-w-sm">
              Manage your store with precision
              <br />
              and control.
              <br />
              Command center for elite hardware
              <br />
              logistics.
            </p>

          </div>

        </div>
      </div>


      {/* =====================================================
          RIGHT SIDE
      ===================================================== */}

      <div className="w-full md:w-[57%] min-h-screen bg-[#b91f35] flex flex-col">

        {/* Main Content */}

        <div className="flex-1 flex items-center justify-center px-7 sm:px-12 lg:px-20">

          <div className="w-full max-w-lg">

            {/* Logo */}

            <div className="text-right mb-12">

              <span className="text-white text-2xl font-black tracking-tight">
                LAPZONE
              </span>

            </div>


            {/* Heading */}

            <div className="mb-10">

              <h2 className="text-4xl lg:text-5xl font-black text-white">
                ADMIN LOGIN
              </h2>

              <p className="text-white/75 text-sm mt-3">
                Enter your credentials to access the admin panel.
              </p>

            </div>


            {/* =================================================
                LOGIN FORM
            ================================================= */}

            <form onSubmit={handleLogin}>

              {/* Email */}

              <div className="mb-7">

                <label
                  htmlFor="admin-email"
                  className="block text-xs font-bold tracking-widest text-white mb-3"
                >
                  EMAIL ADDRESS
                </label>

                <div className="relative">

                  {/* Email Icon */}

                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white text-lg">
                    ✉
                  </span>

                  <input
                    id="admin-email"
                    type="email"
                    placeholder="admin@lapzone.com"
                    value={email}
                    onChange={(e) =>
                      setEmail(e.target.value)
                    }
                    autoComplete="email"
                    className="w-full h-12 rounded-md border border-white/40 bg-transparent pl-12 pr-4 text-white placeholder:text-white/50 outline-none focus:border-white focus:ring-1 focus:ring-white"
                  />

                </div>

              </div>


              {/* Password */}

              <div className="mb-4">

                <label
                  htmlFor="admin-password"
                  className="block text-xs font-bold tracking-widest text-white mb-3"
                >
                  PASSWORD
                </label>

                <div className="relative">

                  {/* Lock Icon */}

                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white text-lg">
                    🔒
                  </span>

                  <input
                    id="admin-password"
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) =>
                      setPassword(e.target.value)
                    }
                    autoComplete="current-password"
                    className="w-full h-12 rounded-md border border-white/40 bg-transparent pl-12 pr-12 text-white placeholder:text-white/50 outline-none focus:border-white focus:ring-1 focus:ring-white"
                  />

                  {/* Show Password */}

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(
                        !showPassword
                      )
                    }
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white text-lg"
                  >
                    {showPassword ? "◉" : "◌"}
                  </button>

                </div>

              </div>


              {/* Remember + Forgot */}

              <div className="flex items-center justify-between mb-7">

                <label className="flex items-center gap-2 text-sm text-white cursor-pointer">

                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) =>
                      setRememberMe(
                        e.target.checked
                      )
                    }
                    className="w-4 h-4 accent-[#384358]"
                  />

                  <span>
                    Remember Me
                  </span>

                </label>


                <button
                  type="button"
                  onClick={() =>
                    alert(
                      "Admin password recovery will be added next."
                    )
                  }
                  className="text-xs font-bold tracking-wide text-white hover:underline"
                >
                  FORGOT PASSWORD?
                </button>

              </div>


              {/* Login Button */}

              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 rounded-md bg-[#384358] hover:bg-[#30394c] text-white text-sm font-bold tracking-widest transition disabled:opacity-50 disabled:cursor-not-allowed"
              >

                {loading
                  ? "LOGGING IN..."
                  : "LOGIN TO DASHBOARD →"}

              </button>

            </form>


            {/* Secure Access */}

            <div className="flex items-center justify-center gap-2 mt-8 text-white/75 text-sm">

              <span>
                🔒
              </span>

              <span>
                Secure admin access
              </span>

            </div>

          </div>

        </div>


        {/* =====================================================
            FOOTER
        ===================================================== */}

        <footer className="border-t border-white/20 px-8 sm:px-12 lg:px-16 py-7">

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">

            <p className="text-[10px] tracking-widest text-white/70">
              © 2026 LAPZONE. ALL RIGHTS RESERVED.
            </p>

            <div className="flex items-center gap-5 text-[10px] tracking-widest text-white/70">

              <button
                type="button"
                className="hover:text-white"
              >
                SUPPORT
              </button>

              <span>
                |
              </span>

              <button
                type="button"
                className="hover:text-white"
              >
                PRIVACY
              </button>

            </div>

          </div>

        </footer>

      </div>

    </div>
  );
}

export default AdminLogin;