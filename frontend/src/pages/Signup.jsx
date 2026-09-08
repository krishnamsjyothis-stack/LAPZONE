import { useState } from "react";
import api from "../api/axios";

function Signup() {
  // =========================
  // SIGNUP STATES
  // =========================

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // =========================
  // OTP STATES
  // =========================

  const [otp, setOtp] = useState("");
  const [showOtp, setShowOtp] = useState(false);

  // =========================
  // PASSWORD STATES
  // =========================

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [loading, setLoading] = useState(false);

  // =====================================================
  // STEP 1 - SIGNUP FORM + SEND OTP
  // =====================================================

 const handleSignup = async (e) => {
  e.preventDefault();

  if (!name || !email || !password || !confirmPassword) {
    alert("Please fill in all fields");
    return;
  }

  if (!email.includes("@")) {
    alert("Please enter a valid email");
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

  try {
    setLoading(true);

    const response = await api.post("/auth/signup", {
      name,
      email,
      password,
    });

    console.log(response.data);

    alert("OTP sent successfully to your email");

    setShowOtp(true);
  } catch (error) {
    console.error(
      error.response?.data || error.message
    );

    alert(
      error.response?.data?.message ||
        "Failed to send OTP"
    );
  } finally {
    setLoading(false);
  }
 };
  // =====================================================
  // RESEND OTP
  // =====================================================

  const handleResendOtp = async () => {
  try {
    setLoading(true);

    const response = await api.post("/auth/signup", {
      name,
      email,
      password,
    });

    console.log(response.data);

    alert("New OTP sent successfully");

    setOtp("");

  } catch (error) {
    console.error(
      error.response?.data || error.message
    );

    alert(
      error.response?.data?.message ||
        "Failed to resend OTP"
    );
  } finally {
    setLoading(false);
  }
};

  // =====================================================
  // STEP 2 - VERIFY OTP
  // =====================================================

  const handleVerifyOtp = async () => {
  if (!otp) {
    alert("Please enter OTP");
    return;
  }

  if (otp.length !== 6) {
    alert("OTP must be 6 digits");
    return;
  }

  try {
    setLoading(true);

    const response = await api.post(
      "/auth/signup/verify-otp",
      {
        email,
        otp,
      }
    );

    console.log(response.data);

    alert("Account created successfully!");

    // Clear form
    setName("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setOtp("");
    setShowOtp(false);

  } catch (error) {
    console.error(
      error.response?.data || error.message
    );

    alert(
      error.response?.data?.message ||
        "OTP verification failed"
    );
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="min-h-screen bg-[#151820] flex items-center justify-center p-4">

      <div className="w-full max-w-5xl min-h-[650px] rounded-2xl overflow-hidden bg-[#1d222c] shadow-2xl flex">

        {/* =====================================================
            LEFT SIDE
        ===================================================== */}

        <div
          className="hidden md:flex md:w-1/2 relative bg-cover bg-center"
          style={{
            backgroundImage:
              "url('/lapzone-login-bg.png')",
          }}
        >
          <div className="absolute inset-0 bg-[#10151e]/80"></div>

          <div className="relative z-10 w-full p-10 flex flex-col">

            {/* Logo */}

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
                Sign Up
              </span>

            </div>

            {/* Main Text */}

            <div className="mt-auto mb-10 max-w-xs">

              <p className="text-gray-300 text-xs leading-5">
                Join the
              </p>

              <p className="text-sm text-[#c51f35] font-semibold">
                LAPZONE Community
              </p>

              <p className="text-gray-400 text-xs leading-5 mt-2">
                Create your account and discover the latest
                laptops, exclusive deals, and personalized
                recommendations engineered for your
                performance needs.
              </p>

            </div>

          </div>
        </div>

        {/* =====================================================
            RIGHT SIDE
        ===================================================== */}

        <div className="w-full md:w-1/2 flex items-center justify-center px-8 py-10">

          <div className="w-full max-w-sm">

            {/* =================================================
                HEADING
            ================================================= */}

            <div className="mb-7">

              <h1 className="text-2xl font-bold text-gray-100">

                {showOtp
                  ? "Verify Your Email"
                  : "Create Your Account"}

              </h1>

              <p className="text-gray-500 text-xs mt-2">

                {showOtp
                  ? `Enter the OTP sent to ${email}`
                  : "Fill in your details to get started."}

              </p>

            </div>

            {/* =================================================
                SIGNUP FORM
            ================================================= */}

            {!showOtp ? (

              <form onSubmit={handleSignup}>

                {/* ================= FULL NAME ================= */}

                <div className="mb-4">

                  <label className="block text-[8px] font-semibold tracking-wider text-gray-400 mb-2">
                    FULL NAME
                  </label>

                  <div className="relative">

                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-xs">
                      👤
                    </span>

                    <input
                      type="text"
                      placeholder="Enter your full name"
                      value={name}
                      onChange={(e) =>
                        setName(e.target.value)
                      }
                      className="w-full h-10 rounded-full bg-[#414d64] text-gray-200 placeholder:text-gray-500 text-xs pl-9 pr-4 outline-none focus:ring-1 focus:ring-[#c51f35]"
                    />

                  </div>

                </div>

                {/* ================= EMAIL ================= */}

                <div className="mb-4">

                  <label className="block text-[8px] font-semibold tracking-wider text-gray-400 mb-2">
                    EMAIL ADDRESS
                  </label>

                  <div className="relative">

                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-xs">
                      ✉
                    </span>

                    <input
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) =>
                        setEmail(e.target.value)
                      }
                      className="w-full h-10 rounded-full bg-[#414d64] text-gray-200 placeholder:text-gray-500 text-xs pl-9 pr-4 outline-none focus:ring-1 focus:ring-[#c51f35]"
                    />

                  </div>

                </div>

                {/* ================= PASSWORD ================= */}

                <div className="mb-4">

                  <label className="block text-[8px] font-semibold tracking-wider text-gray-400 mb-2">
                    PASSWORD
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
                      placeholder="Create a password"
                      value={password}
                      onChange={(e) =>
                        setPassword(e.target.value)
                      }
                      className="w-full h-10 rounded-full bg-[#414d64] text-gray-200 placeholder:text-gray-500 text-xs pl-9 pr-10 outline-none focus:ring-1 focus:ring-[#c51f35]"
                    />

                    {/* Show / Hide Password */}

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword(
                          !showPassword
                        )
                      }
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                    >

                      {showPassword ? (

                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="w-4 h-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >

                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13.875 18.825A10.05 10.05 0 0112 19c-5 0-9-7-9-7s1.5-2.625 4.125-4.625M9.88 9.88a3 3 0 104.24 4.24M6.1 6.1l11.8 11.8M14.12 14.12a3 3 0 004.24-4.24M17.9 17.9C20.5 16 21 12 21 12s-4-7-9-7c-.67 0-1.32.08-1.94.22"
                          />

                        </svg>

                      ) : (

                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="w-4 h-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >

                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7C20.268 16.057 16.477 19 12 19c-4.477 0-8.268-2.943-9.542-7z"
                          />

                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />

                        </svg>

                      )}

                    </button>

                  </div>

                </div>

                {/* ================= CONFIRM PASSWORD ================= */}

                <div className="mb-5">

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
                      placeholder="Confirm your password"
                      value={confirmPassword}
                      onChange={(e) =>
                        setConfirmPassword(
                          e.target.value
                        )
                      }
                      className="w-full h-10 rounded-full bg-[#414d64] text-gray-200 placeholder:text-gray-500 text-xs pl-9 pr-10 outline-none focus:ring-1 focus:ring-[#c51f35]"
                    />

                    {/* Show / Hide Confirm Password */}

                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(
                          !showConfirmPassword
                        )
                      }
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                    >

                      {showConfirmPassword ? (

                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="w-4 h-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >

                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13.875 18.825A10.05 10.05 0 0112 19c-5 0-9-7-9-7s1.5-2.625 4.125-4.625M9.88 9.88a3 3 0 104.24 4.24M6.1 6.1l11.8 11.8M14.12 14.12a3 3 0 004.24-4.24M17.9 17.9C20.5 16 21 12 21 12s-4-7-9-7c-.67 0-1.32.08-1.94.22"
                          />

                        </svg>

                      ) : (

                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="w-4 h-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >

                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7C20.268 16.057 16.477 19 12 19c-4.477 0-8.268-2.943-9.542-7z"
                          />

                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />

                        </svg>

                      )}

                    </button>

                  </div>

                </div>

                {/* ================= CREATE ACCOUNT ================= */}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-10 rounded-full bg-[#c51f35] hover:bg-[#b51b30] text-white text-[10px] font-medium transition disabled:opacity-50"
                >

                  {loading
                    ? "SENDING OTP..."
                    : "CREATE ACCOUNT →"}

                </button>

              </form>

            ) : (

              /* =================================================
                 OTP FORM
              ================================================= */

              <div className="w-full">

                {/* OTP Heading */}

                <div className="mb-8">

                  <h1 className="text-3xl font-bold text-gray-200 uppercase">
                    Verify Email
                  </h1>

                  <p className="text-gray-400 text-sm mt-2 leading-6">

                    We've sent a verification code to your email
                    address:

                    <br />

                    <span className="text-gray-200 font-medium">
                      {email}
                    </span>

                  </p>

                </div>

                {/* Instruction */}

                <p className="text-gray-500 text-xs mb-4">
                  Please enter the 6-digit code sent to your email.
                </p>

                {/* ================= OTP BOXES ================= */}

                <div className="flex gap-2 mb-7">

                  {[0, 1, 2, 3, 4, 5].map(
                    (index) => (

                      <input
                        key={index}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={otp[index] || ""}

                        onChange={(e) => {

                          const value =
                            e.target.value.replace(
                              /\D/g,
                              ""
                            );

                          if (!value) return;

                          const newOtp =
                            otp.split("");

                          newOtp[index] =
                            value[0];

                          setOtp(
                            newOtp.join("")
                          );

                          // Move to next box

                          const nextInput =
                            e.target
                              .parentElement
                              .children[
                              index + 1
                            ];

                          if (nextInput) {
                            nextInput.focus();
                          }

                        }}

                        onPaste={(e) => {

                          e.preventDefault();

                          const pastedData =
                            e.clipboardData
                              .getData("text")
                              .replace(/\D/g, "")
                              .slice(0, 6);

                          if (
                            pastedData.length ===
                            6
                          ) {

                            setOtp(
                              pastedData
                            );

                            const inputs =
                              e.target
                                .parentElement
                                .children;

                            inputs[5]?.focus();

                          }

                        }}

                        onKeyDown={(e) => {

                          // Backspace

                          if (
                            e.key ===
                              "Backspace" &&
                            !otp[index] &&
                            index > 0
                          ) {

                            const previousInput =
                              e.target
                                .parentElement
                                .children[
                                index - 1
                              ];

                            previousInput?.focus();

                          }

                        }}

                        className="
                          w-12
                          h-14
                          rounded-lg
                          bg-[#292e38]
                          border
                          border-transparent
                          text-gray-100
                          text-center
                          text-lg
                          font-semibold
                          outline-none
                          focus:border-[#c51f35]
                          focus:ring-1
                          focus:ring-[#c51f35]
                        "
                      />

                    )
                  )}

                </div>

                {/* ================= VERIFY BUTTON ================= */}

                <button
                  type="button"
                  onClick={handleVerifyOtp}
                  disabled={
                    loading ||
                    otp.length !== 6
                  }
                  className="
                    w-full
                    h-12
                    rounded-lg
                    bg-[#c51f35]
                    hover:bg-[#b51b30]
                    text-white
                    text-sm
                    font-medium
                    transition
                    disabled:opacity-50
                    disabled:cursor-not-allowed
                  "
                >

                  {loading
                    ? "VERIFYING..."
                    : "VERIFY & CONTINUE →"}

                </button>

                {/* ================= RESEND ================= */}

                <p className="text-center text-xs text-gray-500 mt-5">

                  Didn't receive the code?

                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={loading}
                    className="
                      text-[#c51f35]
                      ml-1
                      hover:underline
                      disabled:opacity-50
                    "
                  >
                    Resend
                  </button>

                </p>

                {/* ================= DIVIDER ================= */}

                <div className="border-t border-gray-700 my-7"></div>

                {/* ================= CHANGE EMAIL ================= */}

                <button
                  type="button"
                  onClick={() => {
                    setShowOtp(false);
                    setOtp("");
                  }}
                  className="
                    text-gray-500
                    text-xs
                    hover:text-gray-300
                    transition
                  "
                >
                  ← Wrong email address? Change Email
                </button>

              </div>
            )}

            {/* =================================================
                LOGIN
            ================================================= */}

            {!showOtp && (
              <p className="text-center text-[10px] text-gray-500 mt-12">

                Already have an account?{" "}

                <button
                  type="button"
                  className="text-[#c51f35] hover:underline"
                >
                  Login
                </button>

              </p>
            )}

            {/* =================================================
                SECURITY
            ================================================= */}

            <p className="text-center text-[8px] text-gray-700 mt-4">
              🔒 Your personal information is securely
              protected.
            </p>

          </div>

        </div>

      </div>

    </div>
  );
}

export default Signup;