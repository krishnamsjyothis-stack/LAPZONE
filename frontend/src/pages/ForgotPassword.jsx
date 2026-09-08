import { useState } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";

function ForgotPassword() {
   const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [showOtp, setShowOtp] = useState(false);
  const [loading, setLoading] = useState(false);
  
 

  // ================= SEND OTP =================

  const handleSendOtp = async (e) => {
  e.preventDefault();

  if (!email) {
    alert("Please enter your email");
    return;
  }

  if (!email.includes("@")) {
    alert("Please enter a valid email");
    return;
  }

  try {
    setLoading(true);

    const response = await api.post("/auth/forgot-password", {
      email,
    });

    console.log(response.data);

    alert("OTP sent successfully to your email");

    // Go to OTP verification page
    navigate("/forgot-password/verify", {
      state: { email },
    });

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

  // ================= VERIFY OTP =================

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
        "/auth/forgot-password/verify",
        {
          email,
          otp,
        }
      );

      console.log(response.data);

      alert("OTP verified successfully");

      // For now, we will add reset password here next.
      console.log("Ready for reset password");

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
    try {
      setLoading(true);

      const response = await api.post(
        "/auth/forgot-password",
        {
          email,
        }
      );

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

  // ================= OTP CHANGE =================

  const handleOtpChange = (index, value) => {
    const number = value.replace(/\D/g, "");

    if (!number) {
      return;
    }

    const newOtp = otp.split("");

    newOtp[index] = number[0];

    setOtp(newOtp.join(""));

    // Move to next input
    const inputs =
      document.querySelectorAll(".otp-input");

    if (index < 5) {
      inputs[index + 1]?.focus();
    }
  };

  // ================= OTP PASTE =================

  const handleOtpPaste = (e) => {
    e.preventDefault();

    const pastedData = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);

    if (pastedData.length === 6) {
      setOtp(pastedData);

      const inputs =
        document.querySelectorAll(".otp-input");

      inputs[5]?.focus();
    }
  };

  // ================= BACKSPACE =================

  const handleOtpKeyDown = (e, index) => {
    if (
      e.key === "Backspace" &&
      !otp[index] &&
      index > 0
    ) {
      const inputs =
        document.querySelectorAll(".otp-input");

      inputs[index - 1]?.focus();
    }
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
                RESET PASSWORD
              </span>

            </div>

            {/* Left Content */}

            <div className="mt-auto mb-10 max-w-md">

              <h2 className="text-4xl font-bold text-white leading-tight">
                FORGOT YOUR
                <br />
                PASSWORD?
              </h2>

              <p className="text-gray-400 text-sm leading-6 mt-5">
                Don't worry. Enter your email
                address and we'll send you a
                verification code to securely
                reset your password.
              </p>

            </div>

          </div>

        </div>

        {/* ================= RIGHT SIDE ================= */}

        <div className="w-full md:w-1/2 flex items-center justify-center px-8 py-10">

          <div className="w-full max-w-sm">

            {!showOtp ? (

              /* ================= EMAIL FORM ================= */

              <>
                <div className="mb-8">

                  <h1 className="text-3xl font-bold text-gray-100">
                    Forgot Password?
                  </h1>

                  <p className="text-gray-500 text-xs mt-2 leading-5">
                    Enter your registered email
                    address to receive a
                    verification code.
                  </p>

                </div>

                <form onSubmit={handleSendOtp}>

                  {/* Email */}

                  <div className="mb-6">

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
                        className="w-full h-11 rounded-full bg-[#414d64] text-gray-200 placeholder:text-gray-500 text-xs pl-9 pr-4 outline-none focus:ring-1 focus:ring-[#c51f35]"
                      />

                    </div>

                  </div>

                  {/* Send OTP */}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full h-11 rounded-full bg-[#c51f35] hover:bg-[#b51b30] text-white text-[10px] font-medium transition disabled:opacity-50"
                  >
                    {loading
                      ? "SENDING OTP..."
                      : "SEND OTP →"}
                  </button>

                </form>

                {/* Back Login */}

                <p className="text-center text-[10px] text-gray-500 mt-10">

                  <button
                    type="button"
                    className="text-[#c51f35] hover:underline"
                  >
                    ← Back to Login
                  </button>

                </p>
              </>

            ) : (

              /* ================= OTP FORM ================= */

              <>

                <div className="mb-8">

                  <h1 className="text-3xl font-bold text-gray-200 uppercase">
                    Verify Email
                  </h1>

                  <p className="text-gray-400 text-sm mt-2 leading-6">
                    We've sent a verification code
                    to your email address:
                    <br />

                    <span className="text-gray-200 font-medium">
                      {email}
                    </span>
                  </p>

                </div>

                <p className="text-gray-500 text-xs mb-4">
                  Please enter the 6-digit code
                  sent to your email.
                </p>

                {/* OTP BOXES */}

                <div className="flex gap-2 mb-7">

                  {[0, 1, 2, 3, 4, 5].map(
                    (index) => (
                      <input
                        key={index}
                        className="
                          otp-input
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
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={otp[index] || ""}
                        onChange={(e) =>
                          handleOtpChange(
                            index,
                            e.target.value
                          )
                        }
                        onPaste={handleOtpPaste}
                        onKeyDown={(e) =>
                          handleOtpKeyDown(
                            e,
                            index
                          )
                        }
                      />
                    )
                  )}

                </div>

                {/* VERIFY */}

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

                {/* RESEND */}

                <p className="text-center text-xs text-gray-500 mt-5">

                  Didn't receive the code?

                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={loading}
                    className="text-[#c51f35] ml-1 hover:underline disabled:opacity-50"
                  >
                    Resend
                  </button>

                </p>

                {/* DIVIDER */}

                <div className="border-t border-gray-700 my-7"></div>

                {/* CHANGE EMAIL */}

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
                  ← Wrong email address?
                  Change Email
                </button>

              </>

            )}

            {/* SECURITY */}

            <p className="text-center text-[8px] text-gray-700 mt-5">
              🔒 Your personal information is
              securely protected.
            </p>

          </div>

        </div>

      </div>

    </div>
  );
}

export default ForgotPassword;