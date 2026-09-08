  import { useState } from "react";
  import { GoogleLogin } from "@react-oauth/google";
  import { useNavigate } from "react-router-dom";
  import api from "../api/axios";

  function Login() {
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
      e.preventDefault();

      const cleanEmail = email.trim().toLowerCase();

      // ================= VALIDATION =================

      if (!cleanEmail) {
        alert("Please enter your email");
        return;
      }

      if (!password) {
        alert("Please enter your password");
        return;
      }

      if (!cleanEmail.includes("@")) {
        alert("Please enter a valid email");
        return;
      }

      try {
        setLoading(true);

        // ================= LOGIN API =================

        const response = await api.post("/auth/login", {
          email: cleanEmail,
          password,
        });

        console.log("LOGIN RESPONSE:", response.data);

        // ================= SAVE TOKEN =================

        localStorage.setItem(
          "token",
          response.data.token
        );

        // Save user information if needed later
        localStorage.setItem(
          "user",
          JSON.stringify(response.data.user)
        );

        alert("Login successful!");

        // Later we can change this to your home page
        navigate("/");

      } catch (error) {
        console.error(
          "LOGIN ERROR:",
          error.response?.data || error.message
        );

        alert(
          error.response?.data?.message ||
            "Login failed"
        );

      } finally {
        setLoading(false);
      }
    };

    return (
      <div className="min-h-screen bg-[#151820] flex">

        {/* ================= LEFT SIDE ================= */}

        <div
          className="hidden md:flex md:w-1/2 min-h-screen bg-cover bg-center relative"
          style={{
            backgroundImage:
              "url('/lapzone-login-bg.png')",
          }}
        >

          {/* Overlay */}

          <div className="absolute inset-0 bg-[#384358]/70"></div>

          <div className="relative z-10 w-full px-12 lg:px-16 py-14 flex flex-col">

            {/* Logo */}

            <div className="flex items-center gap-3">

              <div className="w-7 h-7 rounded-md bg-[#c51f35] flex items-center justify-center">

                <span className="text-white text-xs">
                  ⚙
                </span>

              </div>

              <span className="text-white text-sm font-medium tracking-wide">
                LAPZONE
              </span>

            </div>


            {/* Welcome */}

            <div className="mt-auto mb-auto max-w-lg">

              <h1 className="text-5xl lg:text-6xl font-bold text-white leading-[0.95]">

                Welcome
                <br />
                Back

              </h1>

              <div className="mt-5 border-l-2 border-[#c51f35] pl-3">

                <p className="text-gray-300 text-sm leading-5 max-w-sm">

                  Sign in to continue shopping and manage
                  your LAPZONE account. Access extreme
                  performance hardware.

                </p>

              </div>

            </div>


            {/* Bottom */}

            <div className="flex gap-5 text-xs text-gray-400">

              <span>
                ♢ Secure Login
              </span>

              <span>
                ♧ Fast Access
              </span>

            </div>

          </div>

        </div>


        {/* ================= RIGHT SIDE ================= */}

        <div className="w-full md:w-1/2 min-h-screen flex items-center justify-center px-7 sm:px-10 lg:px-16">

          <div className="w-full max-w-md">


            {/* Heading */}

            <div className="mb-8">

              <h2 className="text-4xl lg:text-5xl font-bold text-gray-100 leading-[1.05]">

                Login to Your
                <br />
                Account

              </h2>

              <p className="text-gray-400 text-sm mt-3">

                Enter your details to continue.

              </p>

            </div>


            {/* ================= FORM ================= */}

            <form onSubmit={handleLogin}>

              {/* Email */}

              <div className="mb-5">

                <label
                  htmlFor="email"
                  className="block text-[10px] font-semibold tracking-wider text-gray-400 mb-2"
                >
                  EMAIL ADDRESS
                </label>

                <div className="relative">

                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                    ✉
                  </span>

                  <input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) =>
                      setEmail(e.target.value)
                    }
                    autoComplete="email"
                    className="w-full h-10 bg-[#222731] rounded-full pl-10 pr-4 text-sm text-gray-200 placeholder:text-gray-600 outline-none focus:ring-1 focus:ring-[#c51f35]"
                  />

                </div>

              </div>


              {/* Password */}

              <div className="mb-2">

                <label
                  htmlFor="password"
                  className="block text-[10px] font-semibold tracking-wider text-gray-400 mb-2"
                >
                  PASSWORD
                </label>

                <div className="relative">

                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                    🔒
                  </span>

                  <input
                    id="password"
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) =>
                      setPassword(e.target.value)
                    }
                    autoComplete="current-password"
                    className="w-full h-10 bg-[#222731] rounded-full pl-10 pr-12 text-sm text-gray-200 placeholder:text-gray-600 outline-none focus:ring-1 focus:ring-[#c51f35]"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(
                        !showPassword
                      )
                    }
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                  >
                    {showPassword ? "◉" : "◌"}
                  </button>

                </div>

              </div>


              {/* ================= FORGOT PASSWORD ================= */}

              <div className="text-right mb-4">

                <button
                  type="button"
                  onClick={() =>
                    navigate("/forgot-password")
                  }
                  className="text-[10px] text-[#c51f35] hover:underline"
                >
                  Forgot Password?
                </button>

              </div>


              {/* ================= LOGIN BUTTON ================= */}

              <button
                type="submit"
                disabled={loading}
                className="w-full h-10 bg-[#c51f35] hover:bg-[#b51b30] rounded-full text-white text-xs font-medium transition disabled:opacity-50"
              >

                {loading
                  ? "LOGGING IN..."
                  : "LOGIN →"}

              </button>

            </form>


            {/* ================= OR ================= */}

            <div className="flex items-center gap-4 my-6">

              <div className="flex-1 h-px bg-[#252a33]"></div>

              <span className="text-[9px] text-gray-600">
                OR
              </span>

              <div className="flex-1 h-px bg-[#252a33]"></div>

            </div>


            {/* ================= GOOGLE ================= */}

            <div className="w-full">
    <GoogleLogin
      onSuccess={async (credentialResponse) => {
        try {
          console.log(
            "GOOGLE LOGIN SUCCESS:",
            credentialResponse
          );

          const response = await api.post(
            "/auth/google",
            {
              credential: credentialResponse.credential,
            }
          );

          console.log(
            "GOOGLE BACKEND RESPONSE:",
            response.data
          );

          localStorage.setItem(
            "token",
            response.data.token
          );

          localStorage.setItem(
            "user",
            JSON.stringify(response.data.user)
          );

          alert("Google login successful!");

          navigate("/");

        } catch (error) {
          console.error(
            "GOOGLE LOGIN ERROR:",
            error.response?.data || error.message
          );

          alert(
            error.response?.data?.message ||
              "Google login failed"
          );
        }
      }}

      onError={() => {
        console.log("Google Login Failed");
        alert("Google login failed");
      }}

      width="100%"
    />
  </div>


            {/* ================= SIGNUP ================= */}

            <p className="text-center text-xs text-gray-500 mt-6">

              Don't have an account?{" "}

              <button
                type="button"
                onClick={() =>
                  navigate("/signup")
                }
                className="text-[#c51f35] hover:underline"
              >
                Sign Up
              </button>

            </p>


            {/* Security */}

            <p className="text-center text-[9px] text-gray-700 mt-7">

              ♧ &nbsp; Your information is securely
              protected.

            </p>

          </div>

        </div>

      </div>
    );
  }

  export default Login;