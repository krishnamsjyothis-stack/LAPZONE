import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../api/axios";

function ResetPassword() {
  const location = useLocation();
  const navigate = useNavigate();

  const email = location.state?.email;

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (!password || !confirmPassword) {
      alert("Please fill in all fields");
      return;
    }

    if (password.length < 6) {
      alert("Password must be at least 6 characters");
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    if (!email) {
      alert("Email not found. Please start again.");
      return;
    }

    try {
      setLoading(true);

      const response = await api.post(
        "/auth/reset-password",
        {
          email,
          password,
        }
      );

      console.log(response.data);

      alert("Password reset successfully!");

      navigate("/login");

    } catch (error) {
      console.error(
        error.response?.data || error.message
      );

      alert(
        error.response?.data?.message ||
        "Failed to reset password"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#151820] flex items-center justify-center p-4">

      <div className="w-full max-w-5xl min-h-[650px] rounded-2xl overflow-hidden bg-[#1d222c] shadow-2xl flex">

        {/* LEFT SIDE */}

        <div
          className="hidden md:flex md:w-1/2 relative bg-cover bg-center"
          style={{
            backgroundImage:
              "url('/lapzone-login-bg.png')",
          }}
        >
          <div className="absolute inset-0 bg-[#10151e]/80"></div>

          <div className="relative z-10 w-full p-10 flex flex-col">

            <div className="flex items-center gap-2">

              <div className="w-7 h-7 rounded-md bg-[#c51f35] flex items-center justify-center">
                <span className="text-white text-xs">
                  ⚙
                </span>
              </div>

              <span className="text-white text-sm font-medium">
                LAPZONE
              </span>

              <span className="text-gray-500">
                |
              </span>

              <span className="text-gray-400 text-sm">
                RESET PASSWORD
              </span>

            </div>

            <div className="mt-auto mb-10 max-w-md">

              <h2 className="text-4xl font-bold text-white leading-tight">
                CREATE A
                <br />
                NEW PASSWORD
              </h2>

              <p className="text-gray-400 text-sm leading-6 mt-5">
                Create a strong new password for
                your LAPZONE account and get back
                to shopping.
              </p>

            </div>

          </div>
        </div>

        {/* RIGHT SIDE */}

        <div className="w-full md:w-1/2 flex items-center justify-center px-8 py-10">

          <div className="w-full max-w-sm">

            <div className="mb-8">

              <h1 className="text-3xl font-bold text-gray-100">
                Reset Password
              </h1>

              <p className="text-gray-500 text-xs mt-2 leading-5">
                Create a new password for your account.
              </p>

            </div>

            <form onSubmit={handleResetPassword}>

              {/* Password */}

              <div className="mb-5">

                <label className="block text-[8px] font-semibold tracking-wider text-gray-400 mb-2">
                  NEW PASSWORD
                </label>

                <div className="relative">

                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-xs">
                    🔒
                  </span>

                  <input
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    placeholder="Create a new password"
                    value={password}
                    onChange={(e) =>
                      setPassword(e.target.value)
                    }
                    className="w-full h-11 rounded-full bg-[#414d64] text-gray-200 placeholder:text-gray-500 text-xs pl-9 pr-10 outline-none focus:ring-1 focus:ring-[#c51f35]"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(!showPassword)
                    }
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    {showPassword ? "◉" : "○"}
                  </button>

                </div>

              </div>

              {/* Confirm Password */}

              <div className="mb-6">

                <label className="block text-[8px] font-semibold tracking-wider text-gray-400 mb-2">
                  CONFIRM PASSWORD
                </label>

                <div className="relative">

                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-xs">
                    🔒
                  </span>

                  <input
                    type={
                      showConfirmPassword
                        ? "text"
                        : "password"
                    }
                    placeholder="Confirm your new password"
                    value={confirmPassword}
                    onChange={(e) =>
                      setConfirmPassword(e.target.value)
                    }
                    className="w-full h-11 rounded-full bg-[#414d64] text-gray-200 placeholder:text-gray-500 text-xs pl-9 pr-10 outline-none focus:ring-1 focus:ring-[#c51f35]"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword(
                        !showConfirmPassword
                      )
                    }
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    {showConfirmPassword ? "◉" : "○"}
                  </button>

                </div>

              </div>

              {/* Reset Button */}

              <button
                type="submit"
                disabled={loading}
                className="w-full h-11 rounded-full bg-[#c51f35] hover:bg-[#b51b30] text-white text-[10px] font-medium transition disabled:opacity-50"
              >
                {loading
                  ? "RESETTING..."
                  : "RESET PASSWORD →"}
              </button>

            </form>

            {/* Back to Login */}

            <p className="text-center text-[10px] text-gray-500 mt-10">

              <button
                type="button"
                onClick={() => navigate("/login")}
                className="text-[#c51f35] hover:underline"
              >
                ← Back to Login
              </button>

            </p>

            <p className="text-center text-[8px] text-gray-700 mt-5">
              🔒 Your personal information is securely
              protected.
            </p>

          </div>

        </div>

      </div>

    </div>
  );
}

export default ResetPassword;