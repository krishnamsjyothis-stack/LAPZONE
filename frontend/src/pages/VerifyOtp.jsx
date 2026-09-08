import { useState, useEffect, useRef } from "react";
import api from "../api/axios";

function VerifyOtp({ email, onVerified, onChangeEmail }) {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [timer, setTimer] = useState(44);
  const [loading, setLoading] = useState(false);

  const inputRefs = useRef([]);

  // Countdown
  useEffect(() => {
    if (timer <= 0) return;

    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timer]);

  // Handle OTP typing
  const handleChange = (value, index) => {
    if (!/^\d?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;

    setOtp(newOtp);

    // Move to next box
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Backspace
  const handleKeyDown = (e, index) => {
    if (
      e.key === "Backspace" &&
      !otp[index] &&
      index > 0
    ) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Verify OTP
  const handleVerify = async () => {
    const enteredOtp = otp.join("");

    if (enteredOtp.length !== 6) {
      alert("Please enter the 6-digit OTP");
      return;
    }

    try {
      setLoading(true);

      const response = await api.post("/otp/verify", {
        email,
        otp: enteredOtp,
      });

      console.log(response.data);

      alert("OTP verified successfully!");

      if (onVerified) {
        onVerified();
      }

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

  // Resend OTP
  const handleResend = async () => {
    if (timer > 0) return;

    try {
      await api.post("/otp/send", {
        email,
      });

      alert("New OTP sent successfully");

      setOtp(["", "", "", "", "", ""]);
      setTimer(44);

      inputRefs.current[0]?.focus();

    } catch (error) {
      console.error(
        error.response?.data || error.message
      );

      alert(
        error.response?.data?.message ||
        "Failed to resend OTP"
      );
    }
  };

  return (
    <div className="min-h-screen bg-[#151820] flex items-center justify-center p-4">

      <div className="w-full max-w-6xl min-h-[665px] flex overflow-hidden">

        {/* ================= LEFT SIDE ================= */}

        <div
          className="hidden md:flex md:w-1/2 relative bg-cover bg-center rounded-l-2xl overflow-hidden"
          style={{
            backgroundImage:
              "url('/lapzone-login-bg.png')",
          }}
        >

          {/* Dark overlay */}
          <div className="absolute inset-0 bg-[#0d1119]/55"></div>

          {/* Red overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#171b26]/20 to-[#151820]/50"></div>

          <div className="relative z-10 w-full p-10 flex flex-col">

            {/* Top logo */}
            <div className="flex items-center gap-2">

              <div className="w-7 h-7 rounded-md bg-[#c51f35] flex items-center justify-center">
                <span className="text-white text-xs">
                  ⚙
                </span>
              </div>

              <span className="text-gray-200 text-sm">
                LAPZONE
              </span>

              <span className="text-gray-500">
                |
              </span>

              <span className="text-gray-300 text-sm">
                VERIFY YOUR ACCOUNT
              </span>

            </div>

            {/* Bottom text */}
            <div className="mt-auto mb-8 max-w-md">

              <h1 className="text-4xl font-bold leading-[1.05] text-white">
                SECURE YOUR
                <br />
                LAPZONE ACCOUNT
              </h1>

              <p className="text-gray-300 text-sm leading-6 mt-5 max-w-sm">
                Verify your email address to complete your
                registration and start exploring premium
                laptops.
              </p>

            </div>

          </div>

        </div>

        {/* ================= RIGHT SIDE ================= */}

        <div className="w-full md:w-1/2 flex items-center justify-center bg-[#151820]">

          <div className="w-full max-w-md px-10 py-12">

            {/* Verification card */}
            <div className="border border-[#3b4355] rounded-2xl bg-[#1c202a] px-10 py-11 shadow-xl">

              {/* Heading */}

              <h2 className="text-2xl font-bold text-gray-200">
                VERIFY EMAIL
              </h2>

              <p className="text-gray-400 text-sm leading-5 mt-2">
                We've sent a verification code to your
                email address:
              </p>

              <p className="text-gray-300 text-sm mt-1 break-all">
                {email}
              </p>

              {/* Instruction */}

              <p className="text-gray-500 text-xs mt-8">
                Please enter the 6-digit code sent to your email.
              </p>

              {/* OTP boxes */}

              <div className="flex gap-2 mt-4">

                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(element) =>
                      (inputRefs.current[index] = element)
                    }
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) =>
                      handleChange(
                        e.target.value,
                        index
                      )
                    }
                    onKeyDown={(e) =>
                      handleKeyDown(e, index)
                    }
                    className="w-12 h-14 rounded-lg bg-[#272c36] border border-transparent text-center text-lg text-white outline-none focus:border-[#c51f35] focus:ring-1 focus:ring-[#c51f35]"
                  />
                ))}

              </div>

              {/* Verify button */}

              <button
                type="button"
                onClick={handleVerify}
                disabled={loading}
                className="w-full h-12 mt-7 rounded-lg bg-[#c51f35] hover:bg-[#b51b30] text-white text-sm font-medium transition disabled:opacity-50"
              >
                {loading
                  ? "VERIFYING..."
                  : "VERIFY & CONTINUE →"}
              </button>

              {/* Resend */}

              <p className="text-center text-xs text-gray-500 mt-5">

                Didn't receive the code?{" "}

                {timer > 0 ? (
                  <span className="text-[#c51f35]">
                    Resend available in 00:
                    {String(timer).padStart(2, "0")}
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={handleResend}
                    className="text-[#c51f35] hover:underline"
                  >
                    Resend OTP
                  </button>
                )}

              </p>

              {/* Divider */}

              <div className="border-t border-[#2d323d] mt-7 pt-6">

                <button
                  type="button"
                  onClick={onChangeEmail}
                  className="text-xs text-gray-500 hover:text-gray-300"
                >
                  ← Wrong email address? Change Email
                </button>

              </div>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}

export default VerifyOtp;