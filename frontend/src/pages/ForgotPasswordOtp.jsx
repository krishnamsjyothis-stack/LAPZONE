import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../api/axios";

function ForgotPasswordOtp() {
  const navigate = useNavigate();
  const location = useLocation();

  // Get email from Forgot Password page
  const email = location.state?.email || "";

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  // ================= VERIFY OTP =================

const handleVerifyOtp = async () => {
  if (otp.length !== 6) {
    alert("OTP must be 6 digits");
    return;
  }

  try {
    setLoading(true);

    const response = await api.post("/otp/verify", {
      email,
      otp,
    });

    console.log(response.data);

    alert("OTP verified successfully");

    // Go to reset password page
    navigate("/reset-password", {
      state: { email },
    });

  } catch (error) {
    console.error(
      error.response?.data || error.message
    );

    alert(
      error.response?.data?.message ||
      "Invalid OTP"
    );
  } finally {
    setLoading(false);
  }
};

  // ================= RESEND OTP =================

  const handleResendOtp = async () => {
    if (!email) {
      alert("Email address is missing");
      return;
    }

    try {
      setLoading(true);

      const response = await api.post(
        "/auth/forgot-password",
        {
          email,
        }
      );

      console.log(response.data);

      setOtp("");

      alert("New OTP sent successfully");

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

  // ================= OTP INPUT =================

  const handleOtpChange = (e) => {
    const value = e.target.value
      .replace(/\D/g, "")
      .slice(0, 6);

    setOtp(value);
  };

  // ================= PASTE OTP =================

  const handlePaste = (e) => {
    e.preventDefault();

    const pastedOtp = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);

    setOtp(pastedOtp);
  };

  return (
    <div className="min-h-screen bg-[#151820] flex items-center justify-center p-4">

      <div className="w-full max-w-5xl min-h-[650px] rounded-2xl overflow-hidden bg-[#1d222c] shadow-2xl flex">

        {/* ================= LEFT SIDE ================= */}

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
                VERIFY EMAIL
              </span>

            </div>

            {/* Left Content */}

            <div className="mt-auto mb-10 max-w-md">

              <h2 className="text-4xl font-bold text-white leading-tight">
                VERIFY
                <br />
                YOUR EMAIL
              </h2>

              <p className="text-gray-400 text-sm leading-6 mt-5">
                We've sent a verification code to
                your registered email address.
                Enter the code to continue resetting
                your password.
              </p>

            </div>

          </div>

        </div>

        {/* ================= RIGHT SIDE ================= */}

        <div className="w-full md:w-1/2 flex items-center justify-center px-8 py-10">

          <div className="w-full max-w-sm">

            {/* Heading */}

            <div className="mb-8">

              <h1 className="text-3xl font-bold text-gray-200 uppercase">
                Verify Email
              </h1>

              <p className="text-gray-400 text-sm mt-2 leading-6">
                We've sent a verification code to your
                email address:
                <br />

                <span className="text-gray-200 font-medium">
                  {email}
                </span>
              </p>

            </div>

            {/* Instruction */}

            <p className="text-gray-500 text-xs mb-4">
              Please enter the 6-digit code sent to
              your email.
            </p>

            {/* ================= OTP INPUT ================= */}

            <div className="mb-7">

              <input
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                placeholder="Enter 6-digit OTP"
                value={otp}
                onChange={handleOtpChange}
                onPaste={handlePaste}
                maxLength={6}
                className="
                  w-full
                  h-14
                  rounded-lg
                  bg-[#292e38]
                  border
                  border-transparent
                  text-gray-100
                  text-center
                  text-lg
                  font-semibold
                  tracking-[0.5em]
                  outline-none
                  focus:border-[#c51f35]
                  focus:ring-1
                  focus:ring-[#c51f35]
                  placeholder:text-gray-600
                  placeholder:tracking-normal
                "
              />

            </div>

            {/* ================= VERIFY BUTTON ================= */}

            <button
              type="button"
              onClick={handleVerifyOtp}
              disabled={loading || otp.length !== 6}
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

            {/* Divider */}

            <div className="border-t border-gray-700 my-7"></div>

            {/* Change Email */}

            <button
              type="button"
              onClick={() =>
                navigate("/forgot-password")
              }
              className="
                text-gray-500
                text-xs
                hover:text-gray-300
                transition
              "
            >
              ← Wrong email address? Change Email
            </button>

            {/* Security */}

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

export default ForgotPasswordOtp;