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

  // Success modal
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Error / validation modal
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorTitle, setErrorTitle] = useState("Unable to Reset Password");
  const [errorMessage, setErrorMessage] = useState("");

  // Show / hide password
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // ================================
  // SHOW ERROR MODAL
  // ================================
  const showError = (message, title = "Unable to Reset Password") => {
    setErrorTitle(title);
    setErrorMessage(message);
    setShowErrorModal(true);
  };

  // ================================
  // RESET PASSWORD
  // ================================
  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (!password || !confirmPassword) {
      showError(
        "Please fill in both password fields.",
        "Missing Information"
      );
      return;
    }

    if (password.length < 6) {
      showError(
        "Your password must contain at least 6 characters.",
        "Password Too Short"
      );
      return;
    }

    if (password !== confirmPassword) {
      showError(
        "The passwords you entered do not match. Please try again.",
        "Passwords Do Not Match"
      );
      return;
    }

    if (!email) {
      showError(
        "We could not find your email address. Please restart the forgot password process.",
        "Email Not Found"
      );
      return;
    }

    try {
      setLoading(true);

      const response = await api.post("/auth/reset-password", {
        email,
        password,
      });

      console.log("Password reset response:", response.data);

      // Show success modal only after the API succeeds
      setShowSuccessModal(true);
    } catch (error) {
      console.error(
        "Reset password error:",
        error.response?.data || error.message
      );

      showError(
        error.response?.data?.message ||
          "We couldn't reset your password. Please try again.",
        "Password Reset Failed"
      );
    } finally {
      setLoading(false);
    }
  };

  // ================================
  // GO TO LOGIN
  // ================================
  const handleGoToLogin = () => {
    setShowSuccessModal(false);
    navigate("/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-[#151820] flex items-center justify-center p-4">

      {/* MAIN CARD */}
      <div className="w-full max-w-5xl min-h-[650px] rounded-2xl overflow-hidden bg-[#1d222c] shadow-2xl flex">

        {/* ================================
            LEFT SIDE
        ================================= */}
        <div
          className="hidden md:flex md:w-1/2 relative bg-cover bg-center"
          style={{
            backgroundImage: "url('/lapzone-login-bg.png')",
          }}
        >
          <div className="absolute inset-0 bg-[#10151e]/80"></div>

          <div className="relative z-10 w-full p-10 flex flex-col">

            <div className="flex items-center gap-2">

              <div className="w-7 h-7 rounded-md bg-[#c51f35] flex items-center justify-center">
                <span className="text-white text-xs">⚙</span>
              </div>

              <span className="text-white text-sm font-medium">
                LAPZONE
              </span>

              <span className="text-gray-500">|</span>

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
                Create a strong new password for your LAPZONE
                account and get back to shopping.
              </p>

            </div>
          </div>
        </div>

        {/* ================================
            RIGHT SIDE
        ================================= */}
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

              {/* NEW PASSWORD */}
              <div className="mb-5">

                <label className="block text-[8px] font-semibold tracking-wider text-gray-400 mb-2">
                  NEW PASSWORD
                </label>

                <div className="relative">

                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-xs">
                    🔒
                  </span>

                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a new password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="new-password"
                    disabled={loading}
                    className="w-full h-11 rounded-full bg-[#414d64] text-gray-200 placeholder:text-gray-500 text-xs pl-9 pr-10 outline-none focus:ring-1 focus:ring-[#c51f35] disabled:opacity-60"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    {showPassword ? "◉" : "○"}
                  </button>

                </div>
              </div>

              {/* CONFIRM PASSWORD */}
              <div className="mb-6">

                <label className="block text-[8px] font-semibold tracking-wider text-gray-400 mb-2">
                  CONFIRM PASSWORD
                </label>

                <div className="relative">

                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-xs">
                    🔒
                  </span>

                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your new password"
                    value={confirmPassword}
                    onChange={(e) =>
                      setConfirmPassword(e.target.value)
                    }
                    autoComplete="new-password"
                    disabled={loading}
                    className="w-full h-11 rounded-full bg-[#414d64] text-gray-200 placeholder:text-gray-500 text-xs pl-9 pr-10 outline-none focus:ring-1 focus:ring-[#c51f35] disabled:opacity-60"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword(!showConfirmPassword)
                    }
                    aria-label={
                      showConfirmPassword
                        ? "Hide confirm password"
                        : "Show confirm password"
                    }
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    {showConfirmPassword ? "◉" : "○"}
                  </button>

                </div>
              </div>

              {/* RESET BUTTON */}
              <button
                type="submit"
                disabled={loading}
                className="w-full h-11 rounded-full bg-[#c51f35] hover:bg-[#b51b30] text-white text-[10px] font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "RESETTING..." : "RESET PASSWORD →"}
              </button>

            </form>

            {/* BACK TO LOGIN */}
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
              🔒 Your personal information is securely protected.
            </p>

          </div>
        </div>
      </div>

      {/* =========================================
          SUCCESS MODAL
      ========================================= */}
      {showSuccessModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4 py-6"
          onClick={handleGoToLogin}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="reset-success-title"
            className="w-full max-w-xl max-h-[90vh] overflow-y-auto bg-[#151820] border border-[#303642] rounded-3xl p-6 sm:p-8 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >

            {/* CLOSE BUTTON */}
            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleGoToLogin}
                aria-label="Close success modal"
                className="text-gray-400 hover:text-white text-3xl"
              >
                ×
              </button>
            </div>

            {/* SUCCESS ICON */}
            <div className="flex justify-center mt-1">
              <div className="w-20 h-20 rounded-full bg-[#451724] border border-[#c51f35]/30 flex items-center justify-center">
                <span className="text-5xl text-[#c51f35]">
                  ✓
                </span>
              </div>
            </div>

            {/* TITLE */}
            <h2
              id="reset-success-title"
              className="text-center text-2xl sm:text-3xl font-bold text-white mt-8"
            >
              PASSWORD RESET SUCCESSFUL
            </h2>

            {/* MESSAGE */}
            <div className="mt-8 bg-[#11151d] border border-[#282e39] rounded-2xl p-5 sm:p-6 text-center">

              <h3 className="text-lg font-semibold text-white">
                Your password has been updated
              </h3>

              <p className="text-gray-400 text-sm leading-6 mt-3">
                Your LAPZONE password has been successfully reset.
                You can now log in using your new password.
              </p>

            </div>

            {/* GO TO LOGIN */}
            <button
              type="button"
              onClick={handleGoToLogin}
              className="w-full h-14 mt-8 rounded-xl bg-[#c51f35] hover:bg-[#b51a2b] text-white font-semibold tracking-wide transition"
            >
              GO TO LOGIN →
            </button>

          </div>
        </div>
      )}

      {/* =========================================
          ERROR / VALIDATION MODAL
      ========================================= */}
      {showErrorModal && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm px-4"
          onClick={() => setShowErrorModal(false)}
        >
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="reset-error-title"
            className="w-full max-w-md bg-[#1d222c] border border-[#3a3038] rounded-2xl p-6 sm:p-8 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >

            {/* ERROR ICON */}
            <div className="flex justify-center">
              <div className="w-16 h-16 rounded-full bg-[#451724] border border-[#c51f35]/30 flex items-center justify-center">
                <span className="text-3xl text-[#ff687a]">!</span>
              </div>
            </div>

            {/* ERROR TITLE */}
            <h2
              id="reset-error-title"
              className="text-center text-lg font-bold text-white mt-5"
            >
              {errorTitle}
            </h2>

            {/* ERROR MESSAGE */}
            <p className="text-center text-sm text-gray-400 leading-6 mt-3">
              {errorMessage}
            </p>

            {/* CLOSE BUTTON */}
            <button
              type="button"
              onClick={() => setShowErrorModal(false)}
              className="w-full h-11 mt-6 rounded-xl bg-[#c51f35] hover:bg-[#b51a2b] text-white text-xs font-semibold transition"
            >
              OK, GOT IT
            </button>

          </div>
        </div>
      )}

    </div>
  );
}

export default ResetPassword;