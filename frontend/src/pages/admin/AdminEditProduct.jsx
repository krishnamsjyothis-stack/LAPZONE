import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../api/axios";

function EditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [product, setProduct] = useState({
    name: "",
    brand: "",
    category: "",
    price: "",
    stock: "",
    description: "",
    processor: "",
    ram: "",
    storage: "",
    display: "",
  });

 const [existingImages, setExistingImages] = useState([]);
const [newImages, setNewImages] = useState([]);

  // FETCH PRODUCT
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await api.get(`/products/${id}`);

        const data = response.data.product;

        setProduct({
          name: data.name || "",
          brand: data.brand || "",
          category: data.category || "",
          price: data.price || "",
          stock: data.stock || "",
          description: data.description || "",
          processor: data.specifications?.processor || "",
          ram: data.specifications?.ram || "",
          storage: data.specifications?.storage || "",
          display: data.specifications?.display || "",
        });

        setExistingImages(data.images || []);
setNewImages([]);
      } catch (error) {
        console.error("Failed to fetch product:", error);

        alert(
          error.response?.data?.message ||
            "Failed to load product"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  // HANDLE INPUT
  const handleChange = (e) => {
    const { name, value } = e.target;

    setProduct((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // HANDLE IMAGES
  const handleImageChange = (e) => {
  const selectedFiles = Array.from(e.target.files);

  setNewImages((previous) => [
    ...previous,
    ...selectedFiles,
  ]);

  e.target.value = "";
};

const handleRemoveExistingImage = (index) => {
  setExistingImages((previous) =>
    previous.filter((_, imageIndex) => imageIndex !== index)
  );
};

const handleRemoveNewImage = (index) => {
  setNewImages((previous) =>
    previous.filter((_, imageIndex) => imageIndex !== index)
  );
};

  // UPDATE PRODUCT
const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    setSaving(true);

    const formData = new FormData();

    // Product details
    formData.append("name", product.name);
    formData.append("brand", product.brand);
    formData.append("category", product.category);
    formData.append("price", product.price);
    formData.append("stock", product.stock);
    formData.append("description", product.description);

    // Specifications
    formData.append(
      "specifications",
      JSON.stringify({
        processor: product.processor,
        ram: product.ram,
        storage: product.storage,
        display: product.display,
      })
    );

    // Existing images that were NOT removed
    formData.append(
      "existingImages",
      JSON.stringify(existingImages)
    );

    // Newly selected images
    newImages.forEach((image) => {
      formData.append("images", image);
    });

    // Send update request
    await api.put(`/products/${id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    alert("Product updated successfully");

    navigate("/admin/products");
  } catch (error) {
    console.error(
      "Update product error:",
      error.response?.data || error.message
    );

    alert(
      error.response?.data?.message ||
        "Failed to update product"
    );
  } finally {
    setSaving(false);
  }
};  
  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5f5f5] flex items-center justify-center">
        <p className="text-[#384358] font-semibold">
          Loading product...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f5f5] px-6 py-8">

      <div className="max-w-4xl mx-auto">

        {/* HEADER */}
        <div className="flex items-center justify-between mb-6">

          <div>
            <h1 className="text-3xl font-bold text-[#384358]">
              Edit Product
            </h1>

            <p className="text-gray-500 mt-1">
              Update your product information
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate("/admin/products")}
            className="px-4 py-2 bg-white border border-[#384358] text-[#384358] rounded-lg hover:bg-[#384358] hover:text-white transition"
          >
            ← Back
          </button>

        </div>

        {/* FORM */}
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-xl shadow-md p-6 border border-gray-200"
        >

          {/* PRODUCT INFORMATION */}
          <h2 className="text-xl font-semibold text-[#384358] mb-5">
            Product Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

            {/* NAME */}
            <div>
              <label className="block text-sm font-medium text-[#384358] mb-2">
                Product Name
              </label>

              <input
                type="text"
                name="name"
                value={product.name}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-[#384358] focus:ring-1 focus:ring-[#384358]"
                required
              />
            </div>

            {/* BRAND */}
            <div>
              <label className="block text-sm font-medium text-[#384358] mb-2">
                Brand
              </label>

              <input
                type="text"
                name="brand"
                value={product.brand}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-[#384358] focus:ring-1 focus:ring-[#384358]"
                required
              />
            </div>

            {/* CATEGORY */}
            <div>
              <label className="block text-sm font-medium text-[#384358] mb-2">
                Category
              </label>

              <input
                type="text"
                name="category"
                value={product.category}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-[#384358] focus:ring-1 focus:ring-[#384358]"
                required
              />
            </div>

            {/* PRICE */}
            <div>
              <label className="block text-sm font-medium text-[#384358] mb-2">
                Price
              </label>

              <input
                type="number"
                name="price"
                value={product.price}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-[#384358] focus:ring-1 focus:ring-[#384358]"
                required
              />
            </div>

            {/* STOCK */}
            <div>
              <label className="block text-sm font-medium text-[#384358] mb-2">
                Stock
              </label>

              <input
                type="number"
                name="stock"
                value={product.stock}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-[#384358] focus:ring-1 focus:ring-[#384358]"
                required
              />
            </div>

          </div>

          {/* DESCRIPTION */}
          <div className="mt-5">

            <label className="block text-sm font-medium text-[#384358] mb-2">
              Description
            </label>

            <textarea
              name="description"
              value={product.description}
              onChange={handleChange}
              rows="4"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-[#384358] focus:ring-1 focus:ring-[#384358]"
              required
            />

          </div>

          {/* SPECIFICATIONS */}
          <h2 className="text-xl font-semibold text-[#384358] mt-8 mb-5">
            Specifications
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

            <input
              type="text"
              name="processor"
              value={product.processor}
              onChange={handleChange}
              placeholder="Processor"
              className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-[#384358] focus:ring-1 focus:ring-[#384358]"
            />

            <input
              type="text"
              name="ram"
              value={product.ram}
              onChange={handleChange}
              placeholder="RAM"
              className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-[#384358] focus:ring-1 focus:ring-[#384358]"
            />

            <input
              type="text"
              name="storage"
              value={product.storage}
              onChange={handleChange}
              placeholder="Storage"
              className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-[#384358] focus:ring-1 focus:ring-[#384358]"
            />

            <input
              type="text"
              name="display"
              value={product.display}
              onChange={handleChange}
              placeholder="Display"
              className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-[#384358] focus:ring-1 focus:ring-[#384358]"
            />

          </div>

          {/* IMAGES */}
         {/* IMAGES */}
<h2 className="text-xl font-semibold text-[#384358] mt-8 mb-5">
  Product Images
</h2>

<div className="border-2 border-dashed border-[#384358] rounded-lg p-6 bg-gray-50">

  {/* EXISTING IMAGES */}
  {existingImages.length > 0 && (
    <div className="mb-6">
      <p className="text-sm font-semibold text-[#384358] mb-3">
        Existing Images
      </p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {existingImages.map((image, index) => (
          <div
            key={`${image}-${index}`}
            className="relative border border-gray-300 rounded-lg overflow-hidden bg-white"
          >
            <img
              src={`https://lapzone-backend-psqn.onrender.com${image}`}
              alt={`Product ${index + 1}`}
              className="w-full h-32 object-contain"
            />

            <button
              type="button"
              onClick={() =>
                handleRemoveExistingImage(index)
              }
              className="absolute top-2 right-2 w-7 h-7 rounded-full bg-red-600 text-white hover:bg-red-700"
            >
              ×
            </button>

            <p className="text-xs text-gray-500 text-center py-2">
              Existing {index + 1}
            </p>
          </div>
        ))}
      </div>
    </div>
  )}

  {/* NEW IMAGES */}
  <p className="text-sm font-semibold text-[#384358] mb-3">
    Add New Images
  </p>

  <input
    type="file"
    multiple
    accept="image/jpeg,image/png,image/webp"
    onChange={handleImageChange}
    className="w-full text-[#384358]"
  />

  {newImages.length > 0 && (
    <div className="mt-6">
      <p className="text-sm font-semibold text-[#384358] mb-3">
        New Images
      </p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {newImages.map((image, index) => {
          const previewUrl = URL.createObjectURL(image);

          return (
            <div
              key={index}
              className="relative border border-green-300 rounded-lg overflow-hidden bg-white"
            >
              <img
                src={previewUrl}
                alt={`New ${index + 1}`}
                className="w-full h-32 object-contain"
              />

              <button
                type="button"
                onClick={() =>
                  handleRemoveNewImage(index)
                }
                className="absolute top-2 right-2 w-7 h-7 rounded-full bg-red-600 text-white hover:bg-red-700"
              >
                ×
              </button>

              <p className="text-xs text-green-600 text-center py-2">
                New Image
              </p>
            </div>
          );
        })}
      </div>
    </div>
  )}

  <p className="text-xs text-gray-500 mt-5">
    Existing images: {existingImages.length}
  </p>

  <p className="text-xs text-gray-500 mt-1">
    New images: {newImages.length}
  </p>

</div>

          {/* BUTTONS */}
          <div className="flex justify-end gap-4 mt-8">

            {/* CANCEL */}
            <button
              type="button"
              onClick={() => navigate("/admin/products")}
              className="px-6 py-2 border border-[#384358] text-[#384358] rounded-lg hover:bg-[#384358] hover:text-white transition"
            >
              Cancel
            </button>

            {/* UPDATE */}
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-[#384358] text-white rounded-lg hover:bg-[#B51A2B] transition disabled:opacity-50"
            >
              {saving ? "Updating..." : "Update Product"}
            </button>

          </div>

        </form>
      </div>
    </div>
  );
}

export default EditProduct;