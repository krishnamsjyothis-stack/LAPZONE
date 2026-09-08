import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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
            `http://localhost:5000${user.profileImage}`
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
    alert("Please select an image file only.");
    return;
  }

  if (file.size > 5 * 1024 * 1024) {
    alert("Image size must be less than 5MB.");
    return;
  }

  setSelectedImage(file);

  const imageUrl = URL.createObjectURL(file);

  setPreviewImage(imageUrl);
};

  // ================= SAVE PROFILE =================

  const handleSubmit = async (e) => {
  e.preventDefault();

  if (!formData.name.trim()) {
    alert("Please enter your name");
    return;
  }

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

    alert("Profile updated successfully!");

    navigate("/profile");

  } catch (error) {
    console.error(
      "Update profile error:",
      error.response?.data || error.message
    );

    alert(
      error.response?.data?.message ||
        "Failed to update profile"
    );

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

      {/* NAVBAR */}

      <nav className="h-16 bg-[#11151d] border-b border-[#252a33] flex items-center justify-between px-8">

        <div
          className="flex items-center gap-3 cursor-pointer"
          onClick={() => navigate("/")}
        >
          <div className="w-8 h-8 bg-[#c51f35] rounded-md flex items-center justify-center">
            <span className="text-white text-xs font-bold">
              LZ
            </span>
          </div>

          <span className="text-white font-semibold">
            LAPZONE
          </span>
        </div>

        <div className="hidden md:flex items-center gap-10">

          <button
            onClick={() => navigate("/")}
            className="text-gray-400 hover:text-[#c51f35]"
          >
            Home
          </button>

          <button className="text-gray-400 hover:text-[#c51f35]">
            Laptops
          </button>

        </div>

        <div className="flex items-center gap-5 text-gray-400">

          <span>⌕</span>
          <span>♡</span>
          <span>🛒</span>

          <button
            onClick={() => navigate("/profile")}
            className="w-9 h-9 rounded-full bg-[#c51f35] text-white flex items-center justify-center"
          >
            👤
          </button>

        </div>

      </nav>


      {/* CONTENT */}

      <main className="max-w-4xl mx-auto px-6 py-10">

        <div className="bg-[#384358] rounded-2xl p-8">

          {/* HEADER */}

          <div className="mb-8">

            <h1 className="text-3xl font-semibold text-white">
              Edit Profile
            </h1>

            <p className="text-gray-400 mt-2 text-sm">
              Update your personal information.
            </p>

          </div>


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

              </div>

            </div>


            {/* EMAIL */}

            <div className="mt-6">

              <label className="block text-xs uppercase tracking-wider text-gray-400 mb-2">
                Email Address
              </label>

              <div className="w-full h-12 bg-[#222731] border border-[#4a5568] rounded-lg px-4 flex items-center justify-between">

                <span className="text-gray-400">
                  {formData.email}
                </span>

                <span className="text-gray-500 text-sm">
                  🔒 READ ONLY
                </span>

              </div>

              <p className="text-gray-500 text-sm mt-2">
                Email address cannot be changed here.
              </p>

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

    </div>
  );
}

export default EditProfile;