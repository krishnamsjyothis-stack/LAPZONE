
import { useEffect, useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

// Reusable modal design for success and error messages
function FeedbackModal({
  type,
  title,
  heading,
  message,
  onClose,
  onContinue,
}) {
  const isSuccess = type === "success";

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm"
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="feedback-modal-title"
        className="w-full max-w-xl rounded-3xl border border-[#303642] bg-[#151820] p-6 shadow-2xl sm:p-8"
      >
        {/* Close button */}
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="text-3xl leading-none text-gray-400 transition hover:text-white"
          >
            ×
          </button>
        </div>

        {/* Icon */}
        <div className="mt-1 flex justify-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#451724]">
            <span
              className={`text-5xl ${
                isSuccess ? "text-[#c51f35]" : "text-[#c51f35]"
              }`}
              aria-hidden="true"
            >
              {isSuccess ? "✓" : "!"}
            </span>
          </div>
        </div>

        {/* Title */}
        <h2
          id="feedback-modal-title"
          className="mt-7 text-center text-2xl font-bold text-white sm:text-4xl"
        >
          {title}
        </h2>

        {/* Message */}
        <div className="mt-7 rounded-2xl bg-[#11151d] p-5 text-center sm:p-6">
          <h3 className="text-lg font-semibold text-white sm:text-xl">
            {heading}
          </h3>

          <p className="mt-2 break-words text-sm leading-6 text-gray-400">
            {message}
          </p>
        </div>

        {/* Action */}
        <button
          type="button"
          onClick={onContinue}
          className="mt-7 h-12 w-full rounded-xl bg-[#c51f35] font-semibold tracking-wide text-white transition hover:bg-[#b51a2b] focus:outline-none focus:ring-2 focus:ring-[#c51f35] focus:ring-offset-2 focus:ring-offset-[#151820] sm:h-14"
        >
          {isSuccess ? "CONTINUE" : "TRY AGAIN"}
        </button>
      </div>
    </div>
  );
}

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [modal, setModal] = useState(null);
  const [pendingNavigation, setPendingNavigation] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      navigate("/", { replace: true });
    }
  }, [navigate]);

  const openErrorModal = (message) => {
    setPendingNavigation(null);
    setModal({
      type: "error",
      title: "LOGIN FAILED",
      heading: "Unable to login",
      message,
    });
  };

  const openSuccessModal = () => {
    setPendingNavigation("/");
    setModal({
      type: "success",
      title: "LOGIN SUCCESSFUL",
      heading: "Welcome back!",
      message: "You have successfully logged in to LAPZONE.",
    });
  };

  const closeModal = () => {
    setModal(null);
    setPendingNavigation(null);
  };

  const continueFromModal = () => {
    const destination = pendingNavigation;

    setModal(null);
    setPendingNavigation(null);

    if (destination) {
      navigate(destination, { replace: true });
    }
  };

  const saveLogin = (response) => {
    const { token, user } = response.data;

    if (!token || !user) {
      throw new Error("Login response is missing the token or user.");
    }

    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
  };

  const handleLogin = async (event) => {
    event.preventDefault();

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail) {
      openErrorModal("Please enter your email address.");
      return;
    }

    if (!password) {
      openErrorModal("Please enter your password.");
      return;
    }

    try {
      setLoading(true);

      const response = await api.post("/auth/login", {
        email: cleanEmail,
        password,
      });

      saveLogin(response);
      openSuccessModal();
    } catch (error) {
      console.error(
        "LOGIN ERROR:",
        error.response?.data || error.message
      );

      openErrorModal(
        error.response?.data?.message ||
          error.message ||
          "Login failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      if (!credentialResponse?.credential) {
        throw new Error("Google did not return a credential.");
      }

      setLoading(true);

      const response = await api.post("/auth/google", {
        credential: credentialResponse.credential,
      });

      saveLogin(response);
      openSuccessModal();
    } catch (error) {
      console.error(
        "GOOGLE LOGIN ERROR:",
        error.response?.data || error.message
      );

      openErrorModal(
        error.response?.data?.message ||
          error.message ||
          "Google login failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    openErrorModal(
      "Google Sign-In was unsuccessful. Please try again."
    );
  };

  return (
    <div className="flex min-h-screen bg-[#151820]">
      {/* LEFT SIDE */}
      <div
        className="relative hidden min-h-screen bg-cover bg-center md:flex md:w-1/2"
        style={{
          backgroundImage: "url('/lapzone-login-bg.png')",
        }}
      >
        <div className="absolute inset-0 bg-[#384358]/70" />

        <div className="relative z-10 flex w-full flex-col px-12 py-14 lg:px-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#c51f35]">
              <span className="text-xs text-white">⚙</span>
            </div>

            <span className="text-sm font-medium tracking-wide text-white">
              LAPZONE
            </span>
          </div>

          {/* Welcome */}
          <div className="my-auto max-w-lg">
            <h1 className="text-5xl font-bold leading-[0.95] text-white lg:text-6xl">
              Welcome
              <br />
              Back
            </h1>

            <div className="mt-5 border-l-2 border-[#c51f35] pl-3">
              <p className="max-w-sm text-sm leading-5 text-gray-300">
                Sign in to continue shopping and manage your LAPZONE
                account. Access extreme performance hardware.
              </p>
            </div>
          </div>

          {/* Bottom */}
          <div className="flex gap-5 text-xs text-gray-400">
            <span>♢ Secure Login</span>
            <span>♧ Fast Access</span>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="flex min-h-screen w-full items-center justify-center px-7 sm:px-10 md:w-1/2 lg:px-16">
        <div className="w-full max-w-md">
          {/* Heading */}
          <div className="mb-8">
            <h2 className="text-4xl font-bold leading-[1.05] text-gray-100 lg:text-5xl">
              Login to Your
              <br />
              Account
            </h2>

            <p className="mt-3 text-sm text-gray-400">
              Enter your details to continue.
            </p>
          </div>

          {/* LOGIN FORM */}
          <form onSubmit={handleLogin}>
            {/* Email */}
            <div className="mb-5">
              <label
                htmlFor="email"
                className="mb-2 block text-[10px] font-semibold tracking-wider text-gray-400"
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
                  onChange={(event) => setEmail(event.target.value)}
                  autoComplete="email"
                  className="h-10 w-full rounded-full bg-[#222731] pl-10 pr-4 text-sm text-gray-200 outline-none placeholder:text-gray-600 focus:ring-1 focus:ring-[#c51f35]"
                />
              </div>
            </div>

            {/* Password */}
            <div className="mb-2">
              <label
                htmlFor="password"
                className="mb-2 block text-[10px] font-semibold tracking-wider text-gray-400"
              >
                PASSWORD
              </label>

              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                  🔒
                </span>

                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete="current-password"
                  className="h-10 w-full rounded-full bg-[#222731] pl-10 pr-12 text-sm text-gray-200 outline-none placeholder:text-gray-600 focus:ring-1 focus:ring-[#c51f35]"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                >
                  {showPassword ? "◉" : "◌"}
                </button>
              </div>
            </div>

            {/* Forgot password */}
            <div className="mb-4 text-right">
              <button
                type="button"
                onClick={() => navigate("/forgot-password")}
                className="text-[10px] text-[#c51f35] hover:underline"
              >
                Forgot Password?
              </button>
            </div>

            {/* Login button */}
            <button
              type="submit"
              disabled={loading}
              className="h-10 w-full rounded-full bg-[#c51f35] text-xs font-medium text-white transition hover:bg-[#b51b30] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "LOGGING IN..." : "LOGIN →"}
            </button>
          </form>

          {/* OR */}
          <div className="my-6 flex items-center gap-4">
            <div className="h-px flex-1 bg-[#252a33]" />

            <span className="text-[9px] text-gray-600">OR</span>

            <div className="h-px flex-1 bg-[#252a33]" />
          </div>

          {/* GOOGLE LOGIN */}
          <div className="flex w-full justify-center">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
            />
          </div>

          {/* SIGNUP */}
          <p className="mt-6 text-center text-xs text-gray-500">
            Don't have an account?{" "}
            <button
              type="button"
              onClick={() => navigate("/signup")}
              className="text-[#c51f35] hover:underline"
            >
              Sign Up
            </button>
          </p>

          {/* Security */}
          <p className="mt-7 text-center text-[9px] text-gray-700">
            ♧ &nbsp; Your information is securely protected.
          </p>
        </div>
      </div>

      {/* SHARED FEEDBACK MODAL */}
      {modal && (
        <FeedbackModal
          type={modal.type}
          title={modal.title}
          heading={modal.heading}
          message={modal.message}
          onClose={closeModal}
          onContinue={continueFromModal}
        />
      )}
    </div>
  );
}

export default Login;
