import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import emailSchema from "../validation/emailValidation";
import api from "../api/axios";

function ChangeEmail() {
  const navigate = useNavigate();

  const [currentEmail, setCurrentEmail] = useState("");
  const [authProvider, setAuthProvider] = useState("");
  const [newEmail, setNewEmail] = useState("");

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);

  const [showOtp, setShowOtp] = useState(false);
  const [loading, setLoading] = useState(false);

  const [validationError, setValidationError] = useState("");

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          navigate("/login");
          return;
        }

        const response = await api.get("/user/profile", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

       setCurrentEmail(response.data.user.email || "");
    setAuthProvider(response.data.user.authProvider || "local");
      } catch (error) {
        console.error(
          "Fetch profile error:",
          error.response?.data || error.message
        );
      }
    };

    fetchProfile();
  }, [navigate]);

  const handleSendOtp = async (e) => {
    e.preventDefault();

    const result = emailSchema.safeParse({
      email: newEmail,
    });

    if (!result.success) {
      setValidationError(result.error.issues[0].message);
      return;
    }

    if (
      newEmail.trim().toLowerCase() ===
      currentEmail.trim().toLowerCase()
    ) {
      setValidationError(
        "New email must be different from your current email"
      );
      return;
    }

    setValidationError("");

    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      const response = await api.post(
        "/user/change-email/send-otp",
        {
          email: newEmail.trim().toLowerCase(),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("CHANGE EMAIL OTP:", response.data);

      setShowOtp(true);
    } catch (error) {
      console.error(
        "Send change email OTP error:",
        error.response?.data || error.message
      );

      setErrorMessage(
        error.response?.data?.message ||
          "Failed to send OTP"
      );

      setShowErrorModal(true);
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) {
      return;
    }

    const newOtp = [...otp];

    newOtp[index] = value.slice(-1);

    setOtp(newOtp);

    if (value && index < 5) {
      document
        .getElementById(`otp-${index + 1}`)
        ?.focus();
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();

    const enteredOtp = otp.join("");

    if (enteredOtp.length !== 6) {
      setValidationError(
        "Please enter the 6-digit OTP"
      );
      return;
    }

    setValidationError("");

    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      const response = await api.post(
        "/user/change-email/verify-otp",
        {
          email: newEmail.trim().toLowerCase(),
          otp: enteredOtp,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("EMAIL CHANGE:", response.data);

      const storedUser = JSON.parse(
        localStorage.getItem("user") || "{}"
      );

      localStorage.setItem(
        "user",
        JSON.stringify({
          ...storedUser,
          email: response.data.user.email,
        })
      );

      setShowSuccessModal(true);
    } catch (error) {
      console.error(
        "Verify email OTP error:",
        error.response?.data || error.message
      );

      setErrorMessage(
        error.response?.data?.message ||
          "Failed to change email"
      );

      setShowErrorModal(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#151820] text-gray-200 flex items-center justify-center px-6">

      <div className="w-full max-w-lg bg-[#384358] rounded-2xl p-8">

        <h1 className="text-3xl font-bold text-white">
          Change Email
        </h1>

        <p className="text-gray-400 mt-2">
          Update your email address securely using OTP verification.
        </p>

        {/* CURRENT EMAIL */}

        <div className="mt-8">

          <label className="block text-sm text-gray-400 mb-2">
            CURRENT EMAIL
          </label>

          <div className="h-12 bg-[#222731] rounded-lg px-4 flex items-center text-gray-400">
            {currentEmail}
          </div>

        </div>

        {/* NEW EMAIL */}

        {/* GOOGLE ACCOUNT */}

{authProvider === "google" && (
  <div className="mt-8 bg-[#222731] border border-[#4a5568] rounded-xl p-5">
    <p className="text-white font-semibold">
      Email cannot be changed
    </p>

    <p className="text-gray-400 text-sm mt-2">
      Your email is linked to your Google account, so it cannot be changed.
    </p>

    <button
      type="button"
      onClick={() => navigate("/profile")}
      className="w-full h-11 mt-5 rounded-xl bg-[#c51f35] hover:bg-[#b51a2b] text-white font-semibold"
    >
      BACK TO PROFILE
    </button>
  </div>
)}

{/* NORMAL ACCOUNT */}

{authProvider !== "google" && !showOtp && (
  <form
    onSubmit={handleSendOtp}
    className="mt-6"
  >
    <label className="block text-sm text-gray-400 mb-2">
      NEW EMAIL
    </label>

    <input
      type="email"
      value={newEmail}
      onChange={(e) => {
        setNewEmail(e.target.value);
        setValidationError("");
      }}
      placeholder="Enter your new email"
      className="w-full h-12 bg-[#222731] border border-[#4a5568] rounded-lg px-4 text-white outline-none focus:border-[#c51f35]"
    />

    {validationError && (
      <p className="text-red-400 text-sm mt-2">
        {validationError}
      </p>
    )}

    <div className="flex justify-end gap-4 mt-6">
      <button
        type="button"
        onClick={() => navigate("/profile")}
        className="px-6 h-11 rounded-xl border border-[#4a5568] text-gray-300 hover:bg-[#222731]"
      >
        Cancel
      </button>

      <button
        type="submit"
        disabled={loading}
        className="px-7 h-11 rounded-xl bg-[#c51f35] hover:bg-[#b51a2b] text-white font-semibold disabled:opacity-50"
      >
        {loading ? "SENDING..." : "SEND OTP"}
      </button>
    </div>
  </form>
)}

{/* OTP */}

{authProvider !== "google" && showOtp && (
  <form
    onSubmit={handleVerifyOtp}
    className="mt-8"
  >
    <p className="text-gray-400 text-sm mb-4">
      Enter the 6-digit OTP sent to:
    </p>

    <p className="text-white font-medium mb-5">
      {newEmail}
    </p>

    <div className="flex gap-2">
      {otp.map((digit, index) => (
        <input
          key={index}
          id={`otp-${index}`}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digit}
          onChange={(e) =>
            handleOtpChange(index, e.target.value)
          }
          className="w-12 h-12 text-center text-xl bg-[#222731] border border-[#4a5568] rounded-lg text-white outline-none focus:border-[#c51f35]"
        />
      ))}
    </div>

    {validationError && (
      <p className="text-red-400 text-sm mt-2">
        {validationError}
      </p>
    )}

    <div className="flex justify-end gap-4 mt-6">
      <button
        type="button"
        onClick={() => {
          setShowOtp(false);
          setOtp(["", "", "", "", "", ""]);
        }}
        className="px-6 h-11 rounded-xl border border-[#4a5568] text-gray-300 hover:bg-[#222731]"
      >
        BACK
      </button>

      <button
        type="submit"
        disabled={loading}
        className="px-7 h-11 rounded-xl bg-[#c51f35] hover:bg-[#b51a2b] text-white font-semibold disabled:opacity-50"
      >
        {loading ? "VERIFYING..." : "VERIFY OTP"}
      </button>
    </div>
  </form>
)}

        {/* OTP */}

        {showOtp && (
          <form
            onSubmit={handleVerifyOtp}
            className="mt-8"
          >

            <p className="text-gray-400 text-sm mb-4">
              Enter the 6-digit OTP sent to:
            </p>

            <p className="text-white font-medium mb-5">
              {newEmail}
            </p>

            <div className="flex gap-2">

              {otp.map((digit, index) => (
                <input
                  key={index}
                  id={`otp-${index}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) =>
                    handleOtpChange(
                      index,
                      e.target.value
                    )
                  }
                  className="w-12 h-12 text-center text-xl bg-[#222731] border border-[#4a5568] rounded-lg text-white outline-none focus:border-[#c51f35]"
                />
              ))}

            </div>

            {validationError && (
              <p className="text-red-400 text-sm mt-2">
                {validationError}
              </p>
            )}

            <div className="flex justify-end gap-4 mt-6">

              <button
                type="button"
                onClick={() => {
                  setShowOtp(false);
                  setOtp(["", "", "", "", "", ""]);
                }}
                className="px-6 h-11 rounded-xl border border-[#4a5568] text-gray-300 hover:bg-[#222731]"
              >
                BACK
              </button>

              <button
                type="submit"
                disabled={loading}
                className="px-7 h-11 rounded-xl bg-[#c51f35] hover:bg-[#b51a2b] text-white font-semibold disabled:opacity-50"
              >
                {loading
                  ? "VERIFYING..."
                  : "VERIFY OTP"}
              </button>

            </div>

          </form>
        )}

      </div>

      {/* SUCCESS MODAL */}

      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-6">

          <div className="bg-[#384358] w-full max-w-md rounded-2xl p-8 text-center">

            <h2 className="text-2xl font-bold text-white">
              EMAIL UPDATED
            </h2>

            <p className="text-gray-400 mt-3">
              Your email address has been changed successfully.
            </p>

            <button
              onClick={() => navigate("/profile")}
              className="w-full h-12 mt-6 rounded-xl bg-[#c51f35] hover:bg-[#b51a2b] text-white font-semibold"
            >
              CONTINUE
            </button>

          </div>

        </div>
      )}

      {/* ERROR MODAL */}

      {showErrorModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-6">

          <div className="bg-[#384358] w-full max-w-md rounded-2xl p-8 text-center">

            <h2 className="text-2xl font-bold text-white">
              CHANGE EMAIL FAILED
            </h2>

            <p className="text-gray-400 mt-3">
              {errorMessage}
            </p>

            <button
              onClick={() => setShowErrorModal(false)}
              className="w-full h-12 mt-6 rounded-xl bg-[#c51f35] hover:bg-[#b51a2b] text-white font-semibold"
            >
              TRY AGAIN
            </button>

          </div>

        </div>
      )}

    </div>
  );
}

export default ChangeEmail;