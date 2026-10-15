
import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import api from "../api/axios";

function Signup() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const referralCode = searchParams.get("ref");

  // Modal states
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [successTitle, setSuccessTitle] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [successButtonText, setSuccessButtonText] = useState("CONTINUE");
  const [errorMessage, setErrorMessage] = useState("");
  const [errorTitle, setErrorTitle] = useState("Something went wrong");

  // Signup states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // OTP states
  const [otp, setOtp] = useState("");
  const [showOtp, setShowOtp] = useState(false);

  // Password visibility
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);

  // Custom modal helpers
  const showSuccess = (title, message, buttonText = "CONTINUE") => {
    setSuccessTitle(title);
    setSuccessMessage(message);
    setSuccessButtonText(buttonText);
    setShowErrorModal(false);
    setShowSuccessModal(true);
  };

  const showError = (message, title = "Something went wrong") => {
    setErrorTitle(title);
    setErrorMessage(message);
    setShowSuccessModal(false);
    setShowErrorModal(true);
  };

  const closeSuccessModal = () => {
    setShowSuccessModal(false);

    // Only navigate after successful account creation.
    if (successTitle === "SIGNUP SUCCESSFUL") {
      navigate("/login", { replace: true });
    }
  };

  // STEP 1: Signup and send OTP
  const handleSignup = async (e) => {
    e.preventDefault();

    if (loading) return;

    const trimmedName = name.trim();
    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedName || !trimmedEmail || !password || !confirmPassword) {
      showError("Please fill in all fields.", "Missing information");
      return;
    }

    if (trimmedName.length < 3) {
      showError("Name must be at least 3 characters long.", "Invalid name");
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(trimmedEmail)) {
      showError("Please enter a valid email address.", "Invalid email");
      return;
    }

    if (password.length < 6) {
      showError(
        "Password must be at least 6 characters long.",
        "Invalid password"
      );
      return;
    }

    if (password !== confirmPassword) {
      showError("Your passwords do not match.", "Password mismatch");
      return;
    }

    try {
      setLoading(true);

      const response = await api.post("/auth/signup", {
        name: trimmedName,
        email: trimmedEmail,
        password,
        referralCode: referralCode || null,
      });

      console.log("Signup response:", response.data);

      setEmail(trimmedEmail);
      setShowOtp(true);

      showSuccess(
        "OTP SENT SUCCESSFULLY",
        `A verification code has been sent to ${trimmedEmail}. Please check your inbox and enter the six-digit OTP.`,
        "ENTER OTP"
      );
    } catch (error) {
      console.error(error.response?.data || error.message);

      showError(
        error.response?.data?.message || "Failed to send OTP. Please try again.",
        "Signup failed"
      );
    } finally {
      setLoading(false);
    }
  };

  // RESEND OTP
  const handleResendOtp = async () => {
    if (loading) return;

    try {
      setLoading(true);

      const response = await api.post("/auth/signup", {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        referralCode: referralCode || null,
      });

      console.log("Resend OTP response:", response.data);

      setOtp("");

      showSuccess(
        "NEW OTP SENT",
        `A new verification code has been sent to ${email}. Please check your inbox.`,
        "OK"
      );
    } catch (error) {
      console.error(error.response?.data || error.message);

      showError(
        error.response?.data?.message || "Failed to resend OTP. Please try again.",
        "Unable to resend OTP"
      );
    } finally {
      setLoading(false);
    }
  };

  // STEP 2: Verify OTP
  const handleVerifyOtp = async () => {
    if (loading) return;

    if (!otp) {
      showError("Please enter the OTP sent to your email.", "OTP required");
      return;
    }

    if (!/^\d{6}$/.test(otp)) {
      showError("OTP must contain exactly six digits.", "Invalid OTP");
      return;
    }

    try {
      setLoading(true);

      const response = await api.post("/auth/signup/verify-otp", {
        email: email.trim().toLowerCase(),
        otp,
      });

      console.log("OTP verification response:", response.data);

      setName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setOtp("");
      setShowOtp(false);

      showSuccess(
        "SIGNUP SUCCESSFUL",
        "Your account has been created successfully. Welcome to LAPZONE!",
        "CONTINUE TO LOGIN"
      );
    } catch (error) {
      console.error(error.response?.data || error.message);

      showError(
        error.response?.data?.message || "OTP verification failed. Please try again.",
        "Verification failed"
      );
    } finally {
      setLoading(false);
    }
  };

  // Update an individual OTP box.
  const updateOtpDigit = (index, rawValue, inputElement) => {
    const digits = rawValue.replace(/\D/g, "");

    if (!digits) {
      const nextOtp = otp.split("");
      nextOtp[index] = "";
      setOtp(nextOtp.join("").slice(0, 6));
      return;
    }

    // Support pasting multiple digits into one OTP box.
    if (digits.length > 1) {
      const pastedOtp = digits.slice(0, 6);
      setOtp(pastedOtp);

      requestAnimationFrame(() => {
        const inputs = inputElement.parentElement.querySelectorAll("input");
        inputs[Math.min(pastedOtp.length, 5)]?.focus();
      });

      return;
    }

    const nextOtp = otp.split("");
    nextOtp[index] = digits[0];

    const updatedOtp = Array.from({ length: 6 }, (_, i) => nextOtp[i] || "")
      .join("");

    setOtp(updatedOtp);

    if (index < 5) {
      const inputs = inputElement.parentElement.querySelectorAll("input");
      inputs[index + 1]?.focus();
    }
  };

  return (
    <div className="min-h-screen bg-[#151820] flex items-center justify-center p-4">
      <div className="w-full max-w-5xl min-h-[650px] rounded-2xl overflow-hidden bg-[#1d222c] shadow-2xl flex">
        {/* LEFT SIDE */}
        <div
          className="hidden md:flex md:w-1/2 relative bg-cover bg-center"
          style={{ backgroundImage: "url('/lapzone-login-bg.png')" }}
        >
          <div className="absolute inset-0 bg-[#10151e]/80" />

          <div className="relative z-10 w-full p-10 flex flex-col">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-md bg-[#c51f35] flex items-center justify-center">
                <span className="text-white text-xs">⚙</span>
              </div>

              <span className="text-white text-sm font-medium">LAPZONE</span>
              <span className="text-gray-500">|</span>
              <span className="text-gray-400 text-sm">Sign Up</span>
            </div>

            <div className="mt-auto mb-10 max-w-xs">
              <p className="text-gray-300 text-xs leading-5">Join the</p>

              <p className="text-sm text-[#c51f35] font-semibold">
                LAPZONE Community
              </p>

              <p className="text-gray-400 text-xs leading-5 mt-2">
                Create your account and discover the latest laptops,
                exclusive deals, and personalized recommendations
                engineered for your performance needs.
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="w-full md:w-1/2 flex items-center justify-center px-8 py-10">
          <div className="w-full max-w-sm">
            {/* HEADING */}
            <div className="mb-7">
              <h1 className="text-2xl font-bold text-gray-100">
                {showOtp ? "Verify Your Email" : "Create Your Account"}
              </h1>

              <p className="text-gray-500 text-xs mt-2">
                {showOtp
                  ? `Enter the OTP sent to ${email}`
                  : "Fill in your details to get started."}
              </p>

              {!showOtp && referralCode && (
                <div className="mt-4 px-4 py-3 rounded-lg bg-[#451724] border border-[#c51f35]/30">
                  <p className="text-xs text-gray-300">
                    🎁 Referral code applied
                  </p>
                  <p className="text-xs text-[#ffb2b8] font-semibold mt-1">
                    {referralCode}
                  </p>
                </div>
              )}
            </div>

            {/* SIGNUP FORM */}
            {!showOtp ? (
              <form onSubmit={handleSignup}>
                {/* FULL NAME */}
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
                      onChange={(e) => setName(e.target.value)}
                      autoComplete="name"
                      className="w-full h-10 rounded-full bg-[#414d64] text-gray-200 placeholder:text-gray-500 text-xs pl-9 pr-4 outline-none focus:ring-1 focus:ring-[#c51f35]"
                    />
                  </div>
                </div>

                {/* EMAIL */}
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
                      onChange={(e) => setEmail(e.target.value)}
                      autoComplete="email"
                      className="w-full h-10 rounded-full bg-[#414d64] text-gray-200 placeholder:text-gray-500 text-xs pl-9 pr-4 outline-none focus:ring-1 focus:ring-[#c51f35]"
                    />
                  </div>
                </div>

                {/* PASSWORD */}
                <div className="mb-4">
                  <label className="block text-[8px] font-semibold tracking-wider text-gray-400 mb-2">
                    PASSWORD
                  </label>

                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-xs">
                      🔒
                    </span>

                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="new-password"
                      className="w-full h-10 rounded-full bg-[#414d64] text-gray-200 placeholder:text-gray-500 text-xs pl-9 pr-10 outline-none focus:ring-1 focus:ring-[#c51f35]"
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword((value) => !value)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                    >
                      {showPassword ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-5 0-9-7-9-7s1.5-2.625 4.125-4.625M9.88 9.88a3 3 0 104.24 4.24M6.1 6.1l11.8 11.8M14.12 14.12a3 3 0 004.24-4.24M17.9 17.9C20.5 16 21 12 21 12s-4-7-9-7c-.67 0-1.32.08-1.94.22" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7C20.268 16.057 16.477 19 12 19c-4.477 0-8.268-2.943-9.542-7z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                {/* CONFIRM PASSWORD */}
                <div className="mb-5">
                  <label className="block text-[8px] font-semibold tracking-wider text-gray-400 mb-2">
                    CONFIRM PASSWORD
                  </label>

                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-xs">
                      🔒
                    </span>

                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm your password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      autoComplete="new-password"
                      className="w-full h-10 rounded-full bg-[#414d64] text-gray-200 placeholder:text-gray-500 text-xs pl-9 pr-10 outline-none focus:ring-1 focus:ring-[#c51f35]"
                    />

                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((value) => !value)}
                      aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                    >
                      {showConfirmPassword ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-5 0-9-7-9-7s1.5-2.625 4.125-4.625M9.88 9.88a3 3 0 104.24 4.24M6.1 6.1l11.8 11.8M14.12 14.12a3 3 0 004.24-4.24M17.9 17.9C20.5 16 21 12 21 12s-4-7-9-7c-.67 0-1.32.08-1.94.22" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7C20.268 16.057 16.477 19 12 19c-4.477 0-8.268-2.943-9.542-7z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-10 rounded-full bg-[#c51f35] hover:bg-[#b51b30] text-white text-[10px] font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "SENDING OTP..." : "CREATE ACCOUNT →"}
                </button>
              </form>
            ) : (
              /* OTP FORM */
              <div className="w-full">
                <div className="mb-8">
                  <h2 className="text-3xl font-bold text-gray-200 uppercase">
                    Verify Email
                  </h2>

                  <p className="text-gray-400 text-sm mt-2 leading-6">
                    We've sent a verification code to your email address:
                    <br />
                    <span className="text-gray-200 font-medium">{email}</span>
                  </p>
                </div>

                <p className="text-gray-500 text-xs mb-4">
                  Please enter the 6-digit code sent to your email.
                </p>

                <div className="flex gap-2 mb-7">
                  {Array.from({ length: 6 }, (_, index) => (
                    <input
                      key={index}
                      type="text"
                      inputMode="numeric"
                      autoComplete={index === 0 ? "one-time-code" : "off"}
                      maxLength={6}
                      aria-label={`OTP digit ${index + 1}`}
                      value={otp[index] || ""}
                      onChange={(e) =>
                        updateOtpDigit(index, e.target.value, e.target)
                      }
                      onKeyDown={(e) => {
                        if (
                          e.key === "Backspace" &&
                          !otp[index] &&
                          index > 0
                        ) {
                          const inputs =
                            e.currentTarget.parentElement.querySelectorAll("input");
                          inputs[index - 1]?.focus();
                        }

                        if (e.key === "ArrowLeft" && index > 0) {
                          const inputs =
                            e.currentTarget.parentElement.querySelectorAll("input");
                          inputs[index - 1]?.focus();
                        }

                        if (e.key === "ArrowRight" && index < 5) {
                          const inputs =
                            e.currentTarget.parentElement.querySelectorAll("input");
                          inputs[index + 1]?.focus();
                        }
                      }}
                      onPaste={(e) => {
                        e.preventDefault();

                        const pastedOtp = e.clipboardData
                          .getData("text")
                          .replace(/\D/g, "")
                          .slice(0, 6);

                        if (pastedOtp) {
                          setOtp(pastedOtp);

                          requestAnimationFrame(() => {
                            const inputs =
                              e.currentTarget.parentElement.querySelectorAll("input");
                            inputs[Math.min(pastedOtp.length, 5)]?.focus();
                          });
                        }
                      }}
                      className="w-12 h-14 rounded-lg bg-[#292e38] border border-transparent text-gray-100 text-center text-lg font-semibold outline-none focus:border-[#c51f35] focus:ring-1 focus:ring-[#c51f35]"
                    />
                  ))}
                </div>

                <button
                  type="button"
                  onClick={handleVerifyOtp}
                  disabled={loading || otp.length !== 6}
                  className="w-full h-12 rounded-lg bg-[#c51f35] hover:bg-[#b51b30] text-white text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "VERIFYING..." : "VERIFY & CONTINUE →"}
                </button>

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

                <div className="border-t border-gray-700 my-7" />

                <button
                  type="button"
                  onClick={() => {
                    setShowOtp(false);
                    setOtp("");
                  }}
                  className="text-gray-500 text-xs hover:text-gray-300 transition"
                >
                  ← Wrong email address? Change Email
                </button>
              </div>
            )}

            {!showOtp && (
              <p className="text-center text-[10px] text-gray-500 mt-12">
                Already have an account?{" "}
                <Link to="/login" className="text-[#c51f35] hover:underline">
                  Login
                </Link>
              </p>
            )}

            <p className="text-center text-[8px] text-gray-700 mt-4">
              🔒 Your personal information is securely protected.
            </p>
          </div>
        </div>
      </div>

      {/* SUCCESS MODAL */}
      {showSuccessModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="signup-success-title"
        >
          <div className="w-full max-w-xl bg-[#151820] border border-[#303642] rounded-3xl p-6 sm:p-8 shadow-2xl">
            <div className="flex justify-end">
              <button
                type="button"
                onClick={closeSuccessModal}
                aria-label="Close success message"
                className="text-gray-400 hover:text-white text-3xl"
              >
                ×
              </button>
            </div>

            <div className="flex justify-center mt-1">
              <div className="w-20 h-20 rounded-full bg-[#451724] flex items-center justify-center">
                <span className="text-5xl text-[#c51f35]">✓</span>
              </div>
            </div>

            <h2
              id="signup-success-title"
              className="text-center text-2xl sm:text-4xl font-bold text-white mt-8"
            >
              {successTitle}
            </h2>

            <div className="mt-8 bg-[#11151d] rounded-2xl p-6 text-center">
              <h3 className="text-xl font-semibold text-white">
                {successTitle === "SIGNUP SUCCESSFUL"
                  ? "Welcome to LAPZONE!"
                  : "You're all set"}
              </h3>

              <p className="text-gray-400 mt-2">{successMessage}</p>
            </div>

            <button
              type="button"
              onClick={closeSuccessModal}
              className="w-full min-h-14 mt-8 rounded-xl bg-[#c51f35] hover:bg-[#b51a2b] text-white font-semibold tracking-wide"
            >
              {successButtonText}
            </button>
          </div>
        </div>
      )}

      {/* ERROR MODAL */}
      {showErrorModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="signup-error-title"
        >
          <div className="w-full max-w-xl bg-[#151820] border border-[#303642] rounded-3xl p-6 sm:p-8 shadow-2xl">
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setShowErrorModal(false)}
                aria-label="Close error message"
                className="text-gray-400 hover:text-white text-3xl"
              >
                ×
              </button>
            </div>

            <div className="flex justify-center mt-1">
              <div className="w-20 h-20 rounded-full bg-[#451724] flex items-center justify-center">
                <span className="text-5xl text-[#c51f35]">!</span>
              </div>
            </div>

            <h2
              id="signup-error-title"
              className="text-center text-2xl sm:text-4xl font-bold text-white mt-8"
            >
              {errorTitle}
            </h2>

            <div className="mt-8 bg-[#11151d] rounded-2xl p-6 text-center">
              <h3 className="text-xl font-semibold text-white">
                Unable to complete the request
              </h3>

              <p className="text-gray-400 mt-2">{errorMessage}</p>
            </div>

            <button
              type="button"
              onClick={() => setShowErrorModal(false)}
              className="w-full min-h-14 mt-8 rounded-xl bg-[#c51f35] hover:bg-[#b51a2b] text-white font-semibold tracking-wide"
            >
              TRY AGAIN
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Signup;