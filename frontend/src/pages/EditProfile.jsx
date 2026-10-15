import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import profileSchema from "../validation/profileValidation";
import api from "../api/axios";

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

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // ================= GET PROFILE =================

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

        const user = response.data.user;

        setFormData({
          name: user.name || "",
          email: user.email || "",
          phone: user.phone || "",
          profileImage: user.profileImage || "",
        });

        // Show existing profile image
        if (user.profileImage) {
          setPreviewImage(
            `https://lapzone-backend-psqn.onrender.com${user.profileImage}`
          );
        }
      } catch (error) {
        console.error(
          "Fetch profile error:",
          error.response?.data || error.message
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  // ================= INPUT CHANGE =================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // ================= IMAGE CHANGE =================

const handleImageChange = (e) => {
  const file = e.target.files[0];

  if (!file) {
    return;
  }

  if (!file.type.startsWith("image/")) {
    setErrorMessage("Please select an image file only.");
setShowErrorModal(true);
return;
  }

  if (file.size > 5 * 1024 * 1024) {
    setErrorMessage("Image size must be less than 5MB.");
setShowErrorModal(true);
return;
  }

  setSelectedImage(file);

  const imageUrl = URL.createObjectURL(file);

  setPreviewImage(imageUrl);
};

  // ================= SAVE PROFILE =================

 const handleSubmit = async (e) => {
  e.preventDefault();

  const result = profileSchema.safeParse({
    name: formData.name,
    phone: formData.phone,
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

    const data = new FormData();

    data.append("name", formData.name);
    data.append("phone", formData.phone);

    // Add selected image
    if (selectedImage) {
      data.append("profileImage", selectedImage);
    }

    console.log("SELECTED IMAGE:", selectedImage);
    console.log("FORM DATA IMAGE:", data.get("profileImage"));

    const response = await api.put(
      "/user/profile",
      data,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    console.log("UPDATE PROFILE:", response.data);

    setShowSuccessModal(true);

  } catch (error) {
    console.error(
      "Update profile error:",
      error.response?.data || error.message
    );

    setErrorMessage(
  error.response?.data?.message ||
    "Failed to update profile"
);

setShowErrorModal(true);

  } finally {
    setSaving(false);
  }
};  
  // ================= LOADING =================

  if (loading) {
    return (
      <div className="min-h-screen bg-[#151820] flex items-center justify-center text-white">
        Loading...
      </div>
    );
  }

  // ================= UI =================

  return (
    <div className="min-h-screen bg-[#151820] text-gray-200">

      

      {/* CONTENT */}

      <main className="max-w-4xl mx-auto px-6 py-10">

        <div className="bg-[#384358] rounded-2xl p-8">




          {/* PROFILE PHOTO */}

          <div className="flex flex-col items-center mb-8">

            <label className="cursor-pointer">

              <div className="w-36 h-36 rounded-full border-2 border-[#c51f35] overflow-hidden bg-[#222731] flex items-center justify-center">

                {previewImage ? (
                  <img
                    src={previewImage}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-6xl">
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

            <p className="text-gray-300 mt-3">
              Upload profile photo
            </p>

            <p className="text-gray-500 text-sm mt-1">
              JPG, PNG or WEBP
            </p>

          </div>


          {/* FORM */}

          <form onSubmit={handleSubmit}>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* NAME */}

              <div>

                <label className="block text-xs uppercase tracking-wider text-gray-400 mb-2">
                  Full Name
                </label>

                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your name"
                  className="w-full h-12 bg-[#222731] border border-[#4a5568] rounded-lg px-4 text-white outline-none focus:border-[#c51f35]"
                />
                {validationErrors.name && (
  <p className="text-red-400 text-xs mt-2">
    {validationErrors.name}
  </p>
)}

              </div>


              {/* PHONE */}

              <div>

                <label className="block text-xs uppercase tracking-wider text-gray-400 mb-2">
                  Phone Number
                </label>

                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Enter your phone number"
                  className="w-full h-12 bg-[#222731] border border-[#4a5568] rounded-lg px-4 text-white outline-none focus:border-[#c51f35]"
                />
                {validationErrors.phone && (
  <p className="text-red-400 text-xs mt-2">
    {validationErrors.phone}
  </p>
)}
                

              </div>

            </div>


            {/* EMAIL */}

           <div>
  <label className="block text-sm text-gray-400 mb-2">
    EMAIL ADDRESS
  </label>

  <div className="h-12 bg-[#222731] rounded-lg px-4 flex items-center justify-between text-gray-400">
    <span>{formData.email}</span>

    <span className="text-sm">
      🔒 READ ONLY
    </span>
  </div>

  <p className="text-gray-500 text-sm mt-2">
    Email address cannot be changed here.
  </p>

  <button
    type="button"
    onClick={() => navigate("/change-email")}
    className="mt-3 text-[#d62839] hover:text-[#ef4052] font-medium"
  >
    Change Email
  </button>
</div>

            {/* BUTTONS */}

            <div className="flex justify-end gap-4 mt-8">

              <button
                type="button"
                onClick={() => navigate("/profile")}
                className="px-7 h-11 rounded-xl border border-[#4a5568] text-gray-300 hover:bg-[#222731]"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={saving}
                className="px-8 h-11 rounded-xl bg-[#c51f35] hover:bg-[#b51a2b] text-white font-medium disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>

            </div>

          </form>

        </div>

      </main>

      {/* SUCCESS MODAL */}
{showSuccessModal && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
    <div className="w-full max-w-xl bg-[#151820] border border-[#303642] rounded-3xl p-8 shadow-2xl">

      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => {
            setShowSuccessModal(false);
            navigate("/profile");
          }}
          className="text-gray-400 hover:text-white text-3xl"
        >
          ×
        </button>
      </div>

      <div className="flex justify-center mt-1">
        <div className="w-20 h-20 rounded-full bg-[#173d2d] flex items-center justify-center">
          <span className="text-5xl text-green-400">
            ✓
          </span>
        </div>
      </div>

      <h2 className="text-center text-4xl font-bold text-white mt-8">
        PROFILE UPDATED
      </h2>

      <p className="text-center text-gray-400 mt-3">
        Your profile has been updated successfully.
      </p>

      <button
        type="button"
        onClick={() => {
          setShowSuccessModal(false);
          navigate("/profile");
        }}
        className="w-full h-14 mt-8 rounded-xl bg-[#c51f35] hover:bg-[#b51a2b] text-white font-semibold tracking-wide"
      >
        CONTINUE
      </button>

    </div>
  </div>
)}

{/* ERROR MODAL */}
{showErrorModal && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
    <div className="w-full max-w-xl bg-[#151820] border border-[#303642] rounded-3xl p-8 shadow-2xl">

      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => setShowErrorModal(false)}
          className="text-gray-400 hover:text-white text-3xl"
        >
          ×
        </button>
      </div>

      <div className="flex justify-center mt-1">
        <div className="w-20 h-20 rounded-full bg-[#451724] flex items-center justify-center">
          <span className="text-5xl text-[#c51f35]">
            !
          </span>
        </div>
      </div>

      <h2 className="text-center text-4xl font-bold text-white mt-8">
        UPDATE FAILED
      </h2>

      <div className="mt-8 bg-[#11151d] rounded-2xl p-6 text-center">
        <h3 className="text-xl font-semibold text-white">
          Unable to update profile
        </h3>

        <p className="text-gray-400 mt-2">
          {errorMessage}
        </p>
      </div>

      <button
        type="button"
        onClick={() => setShowErrorModal(false)}
        className="w-full h-14 mt-8 rounded-xl bg-[#c51f35] hover:bg-[#b51a2b] text-white font-semibold tracking-wide"
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