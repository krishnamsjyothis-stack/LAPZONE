import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import profileSchema from "../validation/profileValidation";
import api from "../api/axios";

const BACKEND_URL =
  import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

// Convert a relative image path into a complete URL.
// Supports full URLs, relative paths, and image objects.
const getImageUrl = (imagePath) => {
  if (!imagePath) return "";

  // If the backend returns an object, extract its image path.
  if (typeof imagePath === "object") {
    const path =
      imagePath.url ||
      imagePath.path ||
      imagePath.filename;

    return path ? getImageUrl(path) : "";
  }

  if (typeof imagePath !== "string") return "";

  const path = imagePath.trim();

  if (!path) return "";

  // Already a complete URL.
  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  // Convert relative paths such as /uploads/profile.jpg.
  return `${BACKEND_URL}/${path.replace(/^\/+/, "")}`;
};

function EditProfile() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    profileImage: "",
  });

  const [selectedImage, setSelectedImage] = useState(null);
  const [previewImage, setPreviewImage] = useState("");
  const [imageFailed, setImageFailed] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Fetch the current user's profile.
  useEffect(() => {
    let isMounted = true;

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

        const user = response.data?.user;

        if (!user) {
          throw new Error("Profile data was not returned by the server.");
        }

        if (!isMounted) return;

        setFormData({
          name: user.name || "",
          email: user.email || "",
          phone: user.phone || "",
          profileImage: user.profileImage || "",
        });

        setPreviewImage(getImageUrl(user.profileImage));
        setImageFailed(false);
      } catch (error) {
        console.error(
          "Fetch profile error:",
          error.response?.data || error.message
        );

        if (!isMounted) return;

        if (error.response?.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          navigate("/login");
        } else {
          setErrorMessage(
            error.response?.data?.message ||
              error.message ||
              "Unable to load your profile."
          );
          setShowErrorModal(true);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchProfile();

    return () => {
      isMounted = false;
    };
  }, [navigate]);

  // Handle text input changes.
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

  // Handle profile photo selection.
  const handleImageChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setErrorMessage("Please select a JPG, PNG, or WEBP image.");
      setShowErrorModal(true);
      e.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage("Image size must be less than 5 MB.");
      setShowErrorModal(true);
      e.target.value = "";
      return;
    }

    // The preview is temporary until the backend saves the image.
    const temporaryUrl = URL.createObjectURL(file);

    setPreviewImage((previous) => {
      if (previous.startsWith("blob:")) {
        URL.revokeObjectURL(previous);
      }

      return temporaryUrl;
    });

    setSelectedImage(file);
    setImageFailed(false);
  };

  // Save profile details and the selected photo.
  const handleSubmit = async (e) => {
    e.preventDefault();

    setErrorMessage("");
    setShowErrorModal(false);

    const result = profileSchema.safeParse({
      name: formData.name.trim(),
      phone: formData.phone.trim(),
    });

    if (!result.success) {
      const errors = {};

      result.error.issues.forEach((issue) => {
        const field = issue.path[0];
        errors[field] = issue.message;
      });

      setValidationErrors(errors);
      return;
    }

    setValidationErrors({});

    try {
      setSaving(true);

      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      const data = new FormData();

      data.append("name", formData.name.trim());
      data.append("phone", formData.phone.trim());

      if (selectedImage) {
        data.append("profileImage", selectedImage);
      }

      console.log(
        "Selected image:",
        selectedImage?.name || "No new image selected"
      );

      const response = await api.put("/user/profile", data, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("Update profile response:", response.data);

      const updatedUser = response.data?.user;

      if (updatedUser) {
        setFormData((previous) => ({
          ...previous,
          name: updatedUser.name ?? previous.name,
          email: updatedUser.email ?? previous.email,
          phone: updatedUser.phone ?? previous.phone,
          profileImage:
            updatedUser.profileImage ?? previous.profileImage,
        }));

        // Prefer the saved image URL returned by the backend.
        if (updatedUser.profileImage) {
          setPreviewImage(getImageUrl(updatedUser.profileImage));
          setImageFailed(false);
        }
      }

      setSelectedImage(null);
      setShowSuccessModal(true);
    } catch (error) {
      console.error(
        "Update profile error:",
        error.response?.data || error.message
      );

      setErrorMessage(
        error.response?.data?.message ||
          "Failed to update profile. Please try again."
      );

      setShowErrorModal(true);
    } finally {
      setSaving(false);
    }
  };

  // Release temporary preview URLs when they are replaced or removed.
  useEffect(() => {
    return () => {
      if (previewImage.startsWith("blob:")) {
        URL.revokeObjectURL(previewImage);
      }
    };
  }, [previewImage]);

  const closeSuccessModal = () => {
    setShowSuccessModal(false);
    navigate("/profile");
  };

  // Loading screen.
  if (loading) {
    return (
      <div className="min-h-screen bg-[#151820] flex items-center justify-center text-white">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-[#c51f35] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-300">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#151820] text-gray-200">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        <div className="bg-[#384358] border border-[#46536a] rounded-2xl p-5 sm:p-8 shadow-xl">
          {/* Header */}
          <div className="mb-8">
            <button
              type="button"
              onClick={() => navigate("/profile")}
              className="text-sm text-gray-300 hover:text-white mb-5"
            >
              ← Back to Profile
            </button>

            <h1 className="text-2xl sm:text-3xl font-bold text-white">
              Edit Profile
            </h1>

            <p className="text-gray-300 text-sm mt-2">
              Update your personal information and profile photo.
            </p>
          </div>

          {/* Profile photo */}
          <div className="flex flex-col items-center mb-8">
            <label className="cursor-pointer group">
              <div className="w-32 h-32 sm:w-36 sm:h-36 rounded-full border-2 border-[#c51f35] overflow-hidden bg-[#222731] flex items-center justify-center">
                {previewImage && !imageFailed ? (
                  <img
                    key={previewImage}
                    src={previewImage}
                    alt="Profile"
                    className="w-full h-full object-cover"
                    onError={(event) => {
                      console.error(
                        "Profile image failed to load:",
                        event.currentTarget.src
                      );
                      setImageFailed(true);
                    }}
                  />
                ) : (
                  <span
                    className="text-6xl"
                    role="img"
                    aria-label="Default avatar"
                  >
                    👤
                  </span>
                )}
              </div>

              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={handleImageChange}
                className="hidden"
              />
            </label>

            <p className="text-gray-200 mt-3 font-medium group-hover:text-white">
              Upload profile photo
            </p>

            <p className="text-gray-400 text-sm mt-1">
              JPG, PNG or WEBP · Maximum 5 MB
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
              {/* Name */}
              <div>
                <label
                  htmlFor="name"
                  className="block text-xs uppercase tracking-wider text-gray-300 mb-2"
                >
                  Full Name
                </label>

                <input
                  id="name"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your name"
                  className="w-full h-12 bg-[#222731] border border-[#4a5568] rounded-lg px-4 text-white placeholder:text-gray-500 outline-none focus:border-[#c51f35] focus:ring-1 focus:ring-[#c51f35]"
                />

                {validationErrors.name && (
                  <p className="text-red-300 text-xs mt-2">
                    {validationErrors.name}
                  </p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label
                  htmlFor="phone"
                  className="block text-xs uppercase tracking-wider text-gray-300 mb-2"
                >
                  Phone Number
                </label>

                <input
                  id="phone"
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Enter your phone number"
                  className="w-full h-12 bg-[#222731] border border-[#4a5568] rounded-lg px-4 text-white placeholder:text-gray-500 outline-none focus:border-[#c51f35] focus:ring-1 focus:ring-[#c51f35]"
                />

                {validationErrors.phone && (
                  <p className="text-red-300 text-xs mt-2">
                    {validationErrors.phone}
                  </p>
                )}
              </div>
            </div>

            {/* Email */}
            <div className="mt-6">
              <label className="block text-xs uppercase tracking-wider text-gray-300 mb-2">
                Email Address
              </label>

              <div className="min-h-12 bg-[#222731] border border-[#4a5568] rounded-lg px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-gray-300">
                <span className="break-all">{formData.email}</span>

                <span className="text-xs whitespace-nowrap text-gray-400">
                  🔒 READ ONLY
                </span>
              </div>

              <p className="text-gray-400 text-sm mt-2">
                Your email address cannot be changed here.
              </p>

              <button
                type="button"
                onClick={() => navigate("/change-email")}
                className="mt-3 text-[#ff7182] hover:text-white font-medium text-sm"
              >
                Change Email →
              </button>
            </div>

            {/* Buttons */}
            <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 sm:gap-4 mt-8 pt-6 border-t border-[#536078]">
              <button
                type="button"
                onClick={() => navigate("/profile")}
                disabled={saving}
                className="px-7 h-11 rounded-xl border border-[#657187] text-gray-200 hover:bg-[#222731] disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={saving}
                className="px-8 h-11 rounded-xl bg-[#c51f35] hover:bg-[#b51a2b] text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </main>

      {/* Success modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4 py-6">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="success-title"
            className="w-full max-w-md bg-[#151820] border border-[#303642] rounded-3xl p-6 sm:p-8 shadow-2xl"
          >
            <div className="flex justify-end">
              <button
                type="button"
                aria-label="Close success message"
                onClick={closeSuccessModal}
                className="text-gray-400 hover:text-white text-3xl leading-none"
              >
                ×
              </button>
            </div>

            <div className="flex justify-center mt-1">
              <div className="w-20 h-20 rounded-full bg-[#173d2d] flex items-center justify-center">
                <span className="text-5xl text-green-400">✓</span>
              </div>
            </div>

            <h2
              id="success-title"
              className="text-center text-2xl sm:text-3xl font-bold text-white mt-6"
            >
              PROFILE UPDATED
            </h2>

            <p className="text-center text-gray-400 mt-3">
              Your profile has been updated successfully.
            </p>

            <button
              type="button"
              onClick={closeSuccessModal}
              className="w-full h-12 mt-8 rounded-xl bg-[#c51f35] hover:bg-[#b51a2b] text-white font-semibold tracking-wide"
            >
              CONTINUE
            </button>
          </div>
        </div>
      )}

      {/* Error modal */}
      {showErrorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4 py-6">
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="error-title"
            className="w-full max-w-md bg-[#151820] border border-[#303642] rounded-3xl p-6 sm:p-8 shadow-2xl"
          >
            <div className="flex justify-end">
              <button
                type="button"
                aria-label="Close error message"
                onClick={() => setShowErrorModal(false)}
                className="text-gray-400 hover:text-white text-3xl leading-none"
              >
                ×
              </button>
            </div>

            <div className="flex justify-center mt-1">
              <div className="w-20 h-20 rounded-full bg-[#451724] flex items-center justify-center">
                <span className="text-5xl text-[#ff7182]">!</span>
              </div>
            </div>

            <h2
              id="error-title"
              className="text-center text-2xl sm:text-3xl font-bold text-white mt-6"
            >
              UPDATE FAILED
            </h2>

            <div className="mt-6 bg-[#11151d] rounded-2xl p-5 text-center">
              <h3 className="text-lg font-semibold text-white">
                Unable to update profile
              </h3>

              <p className="text-gray-400 mt-2 text-sm break-words">
                {errorMessage}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowErrorModal(false)}
              className="w-full h-12 mt-6 rounded-xl bg-[#c51f35] hover:bg-[#b51a2b] text-white font-semibold tracking-wide"
            >
              TRY AGAIN
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default EditProfile;