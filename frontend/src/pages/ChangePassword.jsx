import { useState } from "react";
import { useNavigate } from "react-router-dom";
import passwordSchema from "../validation/passwordValidation";
import api from "../api/axios";

function ChangePassword() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [validationErrors, setValidationErrors] = useState({});

  const [loading, setLoading] = useState(false);

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");


  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
const [showNewPassword, setShowNewPassword] = useState(false);
const [showConfirmPassword, setShowConfirmPassword] = useState(false);


  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setValidationErrors((previous) => ({
      ...previous,
      [name]: "",
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const result = passwordSchema.safeParse(formData);

    if (!result.success) {
      const errors = {};

      result.error.issues.forEach((issue) => {
        const field = issue.path[0];

        if (!errors[field]) {
          errors[field] = issue.message;
        }
      });

      setValidationErrors(errors);
      return;
    }

    setValidationErrors({});

    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      const response = await api.post(
        "/user/change-password",
        {
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("CHANGE PASSWORD:", response.data);

      setShowSuccessModal(true);

      setFormData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

    } catch (error) {
      console.error(
        "Change password error:",
        error.response?.data || error.message
      );

      setErrorMessage(
        error.response?.data?.message ||
          "Failed to change password"
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
          Change Password
        </h1>

        <p className="text-gray-400 mt-2">
          Update your password securely.
        </p>

        <form onSubmit={handleSubmit} className="mt-8">

          {/* CURRENT PASSWORD */}

          <div className="relative">
  <input
    type={showCurrentPassword ? "text" : "password"}
    name="currentPassword"
    value={formData.currentPassword}
    onChange={handleChange}
    placeholder="Enter current password"
    className="w-full h-12 bg-[#222731] border border-[#4a5568] rounded-lg px-4 pr-16 text-white outline-none focus:border-[#c51f35]"
  />

  <button
    type="button"
    onClick={() =>
      setShowCurrentPassword(!showCurrentPassword)
    }
    className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-white"
  >
    {showCurrentPassword ? "HIDE" : "SHOW"}
  </button>
</div>

          {/* NEW PASSWORD */}

          <div className="relative">
  <input
    type={showNewPassword ? "text" : "password"}
    name="newPassword"
    value={formData.newPassword}
    onChange={handleChange}
    placeholder="Enter new password"
    className="w-full h-12 bg-[#222731] border border-[#4a5568] rounded-lg px-4 pr-16 text-white outline-none focus:border-[#c51f35]"
  />

  <button
    type="button"
    onClick={() =>
      setShowNewPassword(!showNewPassword)
    }
    className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-white"
  >
    {showNewPassword ? "HIDE" : "SHOW"}
  </button>
</div>

          {/* CONFIRM PASSWORD */}

          <div className="relative">
  <input
    type={showConfirmPassword ? "text" : "password"}
    name="confirmPassword"
    value={formData.confirmPassword}
    onChange={handleChange}
    placeholder="Confirm new password"
    className="w-full h-12 bg-[#222731] border border-[#4a5568] rounded-lg px-4 pr-16 text-white outline-none focus:border-[#c51f35]"
  />

  <button
    type="button"
    onClick={() =>
      setShowConfirmPassword(!showConfirmPassword)
    }
    className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-white"
  >
    {showConfirmPassword ? "HIDE" : "SHOW"}
  </button>
</div>

          {/* BUTTONS */}

          <div className="flex justify-end gap-4 mt-8">

            <button
              type="button"
              onClick={() => navigate("/profile")}
              className="px-6 h-11 rounded-xl border border-[#4a5568] text-gray-300 hover:bg-[#222731]"
            >
              CANCEL
            </button>

            <button
              type="submit"
              disabled={loading}
              className="px-7 h-11 rounded-xl bg-[#c51f35] hover:bg-[#b51a2b] text-white font-semibold disabled:opacity-50"
            >
              {loading ? "UPDATING..." : "CHANGE PASSWORD"}
            </button>

          </div>

        </form>

      </div>

      {/* SUCCESS MODAL */}

      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-6">

          <div className="bg-[#384358] w-full max-w-md rounded-2xl p-8 text-center">

            <h2 className="text-2xl font-bold text-white">
              PASSWORD UPDATED
            </h2>

            <p className="text-gray-400 mt-3">
              Your password has been changed successfully.
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
              CHANGE PASSWORD FAILED
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

export default ChangePassword;