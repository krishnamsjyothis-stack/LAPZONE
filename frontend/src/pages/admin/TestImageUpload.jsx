import { useState } from "react";
import api from "../../api/axios";

function TestImageUpload() {
  const [images, setImages] = useState([]);
  const [message, setMessage] = useState("");

  const handleUpload = async () => {
    if (images.length === 0) {
      setMessage("Please select images");
      return;
    }

    const formData = new FormData();

    images.forEach((image) => {
      formData.append("images", image);
    });

    try {
      const response = await api.post(
        "/products/upload-images",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setMessage(response.data.message);

      console.log("Uploaded images:", response.data.images);
    } catch (error) {
      console.error(error);

      setMessage(
        error.response?.data?.message ||
          "Image upload failed"
      );
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f5f5] p-8">
      <div className="max-w-xl mx-auto bg-white p-8 rounded-2xl shadow">

        <h1 className="text-2xl font-bold text-[#384358] mb-6">
          Test Image Upload
        </h1>

        <input
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp"
          onChange={(e) => setImages([...e.target.files])}
        />

        <p className="mt-3 text-gray-500">
          Selected: {images.length} image(s)
        </p>

        <button
          onClick={handleUpload}
          className="mt-6 bg-[#b51a2b] text-white px-6 py-3 rounded-xl font-semibold"
        >
          Upload Images
        </button>

        {message && (
          <p className="mt-5">
            {message}
          </p>
        )}

      </div>
    </div>
  );
}

export default TestImageUpload;