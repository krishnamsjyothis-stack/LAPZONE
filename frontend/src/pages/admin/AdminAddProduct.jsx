import { useEffect, useState } from "react";
import { z } from "zod";
import api from "../../api/axios";

import ImageCropper from "../../components/ImageCropper";
import cropImage from "../../utils/cropImage";

// ==========================================
// ZOD VALIDATION
// ==========================================

const productSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Product name must be at least 2 characters"),

  brand: z
    .string()
    .trim()
    .min(2, "Brand must be at least 2 characters"),

  category: z
    .string()
    .trim()
    .min(2, "Category is required"),

  description: z
    .string()
    .trim()
    .min(10, "Description must be at least 10 characters"),

  price: z.coerce
    .number()
    .min(0, "Price cannot be negative"),

  stock: z.coerce
    .number()
    .int("Stock must be a whole number")
    .min(0, "Stock cannot be negative"),

  specifications: z.object({
    processor: z.string().trim(),
    ram: z.string().trim(),
    storage: z.string().trim(),
    display: z.string().trim(),
    graphics: z.string().trim(),
    operatingSystem: z.string().trim(),
  }),
});

function AdminAddProduct() {
  // ==========================================
  // FORM STATE
  // ==========================================

  const [formData, setFormData] = useState({
    name: "",
    brand: "",
    category: "",
    description: "",
    price: "",
    stock: "",
    processor: "",
    ram: "",
    storage: "",
    display: "",
    graphics: "",
    operatingSystem: "",
  });

  // ==========================================
  // CATEGORY STATE
  // ==========================================

  const [categories, setCategories] = useState([]);

  const [loadingCategories, setLoadingCategories] =
    useState(true);

  // ==========================================
  // SUBMIT STATE
  // ==========================================

  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  // ==========================================
  // IMAGE STATE
  // ==========================================

  const [images, setImages] = useState([]);

  const [croppedImages, setCroppedImages] = useState([]);

  const [cropImageSrc, setCropImageSrc] =
    useState(null);

  const [cropImageIndex, setCropImageIndex] =
    useState(null);

  // ==========================================
  // FETCH CATEGORIES
  // ==========================================

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get("/categories", {
          params: {
            page: 1,
            limit: 100,
          },
        });

        setCategories(
          response.data.categories || []
        );
      } catch (error) {
        console.error(
          "Failed to fetch categories:",
          error.response?.data ||
            error.message
        );
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  // ==========================================
  // HANDLE INPUT CHANGE
  // ==========================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // ==========================================
  // HANDLE IMAGE SELECTION
  // ==========================================

  const handleImageChange = (e) => {
    const selectedImages = [
      ...e.target.files,
    ];

    setImages(selectedImages);

    setCroppedImages([]);

    if (selectedImages.length === 0) {
      setCropImageSrc(null);
      setCropImageIndex(null);
      return;
    }

    // Open first image for cropping

    setCropImageSrc(
      URL.createObjectURL(
        selectedImages[0]
      )
    );

    setCropImageIndex(0);
  };

  // ==========================================
  // HANDLE CROPPING
  // ==========================================

  const handleCropComplete = async (
    croppedAreaPixels
  ) => {
    if (!croppedAreaPixels) return;

    try {
      const croppedFile =
        await cropImage(
          cropImageSrc,
          croppedAreaPixels
        );

      setCroppedImages(
        (previous) => [
          ...previous,
          croppedFile,
        ]
      );

      const nextIndex =
        cropImageIndex + 1;

      // Open next image

      if (
        nextIndex <
        images.length
      ) {
        setCropImageIndex(
          nextIndex
        );

        setCropImageSrc(
          URL.createObjectURL(
            images[nextIndex]
          )
        );
      } else {
        // All images cropped

        setCropImageSrc(null);

        setCropImageIndex(null);
      }
    } catch (error) {
      console.error(
        "Image cropping failed:",
        error
      );

      setError(
        "Failed to crop image"
      );
    }
  };

  // ==========================================
  // CANCEL CROPPING
  // ==========================================

  const handleCropCancel = () => {
    setCropImageSrc(null);

    setCropImageIndex(null);
  };

  // ==========================================
  // SUBMIT PRODUCT
  // ==========================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    // ==========================================
    // ZOD VALIDATION
    // ==========================================

    const result =
      productSchema.safeParse({
        name: formData.name,
        brand: formData.brand,
        category: formData.category,
        description:
          formData.description,
        price: formData.price,
        stock: formData.stock,

        specifications: {
          processor:
            formData.processor,

          ram: formData.ram,

          storage:
            formData.storage,

          display:
            formData.display,

          graphics:
            formData.graphics,

          operatingSystem:
            formData.operatingSystem,
        },
      });

    if (!result.success) {
      setError(
        result.error.issues[0]
          .message
      );

      return;
    }

    // ==========================================
    // CHECK CROPPED IMAGES
    // ==========================================

    if (
      croppedImages.length < 3
    ) {
      setError(
        "Please select and crop at least 3 images"
      );

      return;
    }

    try {
      setSaving(true);

      // ==========================================
      // UPLOAD CROPPED IMAGES
      // ==========================================

      const imageFormData =
        new FormData();

      croppedImages.forEach(
        (image) => {
          imageFormData.append(
            "images",
            image
          );
        }
      );

      const uploadResponse =
        await api.post(
          "/products/upload-images",
          imageFormData,
          {
            headers: {
              "Content-Type":
                "multipart/form-data",
            },
          }
        );

      const uploadedImages =
        uploadResponse.data.images;

      // ==========================================
      // CREATE PRODUCT
      // ==========================================

      const response =
        await api.post(
          "/products",
          {
            name:
              result.data.name,

            brand:
              result.data.brand,

            category:
              result.data.category,

            description:
              result.data.description,

            price:
              result.data.price,

            stock:
              result.data.stock,

            images:
              uploadedImages,

            specifications:
              result.data
                .specifications,
          }
        );

      setSuccess(
        response.data.message ||
          "Product added successfully"
      );

      // ==========================================
      // CLEAR FORM
      // ==========================================

      setFormData({
        name: "",
        brand: "",
        category: "",
        description: "",
        price: "",
        stock: "",
        processor: "",
        ram: "",
        storage: "",
        display: "",
        graphics: "",
        operatingSystem: "",
      });

      setImages([]);

      setCroppedImages([]);

      setCropImageSrc(null);

      setCropImageIndex(null);
    } catch (error) {
      console.error(
        "Failed to add product:",
        error.response?.data ||
          error.message
      );

      setError(
        error.response?.data
          ?.message ||
          "Failed to add product"
      );
    } finally {
      setSaving(false);
    }
  };

  // ==========================================
  // INPUT STYLE
  // ==========================================

  const inputClass =
    "w-full bg-[#171d28] border border-[#303847] rounded-md px-4 py-3 text-xs text-white placeholder:text-gray-600 outline-none focus:border-[#b51a2b] transition";

  const labelClass =
    "block text-[10px] uppercase tracking-wide text-gray-400 mb-2";

  // ==========================================
  // PAGE
  // ==========================================

  return (
    <div className="min-h-screen bg-[#151923] text-white">

      {/* ==========================================
          TOP BAR
      ========================================== */}

      <header className="h-16 bg-[#151923] border-b border-[#2c3340] px-6 flex items-center justify-between">

        {/* SEARCH */}

        <div className="w-[55%] max-w-xl">

          <div className="flex items-center bg-[#202632] border border-[#303847] rounded-lg px-4 py-2.5">

            <span className="text-gray-500 text-sm mr-2">
              ⌕
            </span>

            <input
              type="text"
              placeholder="Search LAPZONE core..."
              className="flex-1 bg-transparent outline-none text-xs text-white placeholder:text-gray-500"
            />

          </div>

        </div>

        {/* ADMIN */}

        <div className="flex items-center gap-4">

          <button
            type="button"
            className="text-gray-400"
          >
            ♧
          </button>

          <div className="text-right">

            <p className="text-xs font-medium text-white">
              Admin User
            </p>

            <p className="text-[9px] text-gray-500">
              System Architect
            </p>

          </div>

          <div className="w-9 h-9 rounded-full bg-[#4a556c] border-2 border-[#69758c] flex items-center justify-center text-xs">
            A
          </div>

        </div>

      </header>

      {/* ==========================================
          PAGE CONTENT
      ========================================== */}

      <div className="p-6">

        {/* ==========================================
            BREADCRUMB
        ========================================== */}

        <div className="text-[9px] uppercase tracking-wide text-gray-500 mb-2">

          Products

          <span className="mx-2">
            /
          </span>

          <span className="text-[#e33445]">
            Add Product
          </span>

        </div>

        {/* ==========================================
            HEADER
        ========================================== */}

        <div className="mb-6">

          <h1 className="text-xl font-semibold">
            ADD PRODUCT
          </h1>

          <p className="text-xs text-gray-500 mt-2">
            Add a new laptop product to
            the LAPZONE catalog.
          </p>

        </div>

        {/* ==========================================
            SUCCESS
        ========================================== */}

        {success && (
          <div className="mb-5 bg-green-500/10 border border-green-500/30 text-green-300 text-xs px-4 py-3 rounded-md">
            {success}
          </div>
        )}

        {/* ==========================================
            ERROR
        ========================================== */}

        {error && (
          <div className="mb-5 bg-red-500/10 border border-red-500/30 text-red-300 text-xs px-4 py-3 rounded-md">
            {error}
          </div>
        )}

        {/* ==========================================
            FORM
        ========================================== */}

        <form
          onSubmit={handleSubmit}
          className="space-y-6"
        >

          {/* ==========================================
              BASIC INFORMATION
          ========================================== */}

          <div className="bg-[#354158] rounded-lg p-6">

            <div className="mb-6">

              <h2 className="text-sm font-semibold">
                PRODUCT INFORMATION
              </h2>

              <p className="text-[10px] text-gray-500 mt-1">
                Enter the basic details
                of the laptop.
              </p>

            </div>

            {/* PRODUCT NAME */}

            <div className="mb-5">

              <label className={labelClass}>
                Product Name
              </label>

              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={inputClass}
                placeholder="Enter product name"
              />

            </div>

            {/* BRAND + CATEGORY */}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">

              {/* BRAND */}

              <div>

                <label className={labelClass}>
                  Brand
                </label>

                <input
                  type="text"
                  name="brand"
                  value={formData.brand}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="Enter brand"
                />

              </div>

              {/* CATEGORY */}

              <div>

                <label className={labelClass}>
                  Category
                </label>

                <select
                  name="category"
                  value={
                    formData.category
                  }
                  onChange={
                    handleChange
                  }
                  className={inputClass}
                >

                  <option
                    value=""
                    className="bg-[#171d28]"
                  >
                    {loadingCategories
                      ? "Loading categories..."
                      : "Select category"}
                  </option>

                  {categories.map(
                    (category) => (
                      <option
                        key={
                          category._id
                        }
                        value={
                          category.name
                        }
                        className="bg-[#171d28]"
                      >
                        {
                          category.name
                        }
                      </option>
                    )
                  )}

                </select>

              </div>

            </div>

            {/* PRICE + STOCK */}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">

              {/* PRICE */}

              <div>

                <label className={labelClass}>
                  Price
                </label>

                <input
                  type="number"
                  name="price"
                  value={
                    formData.price
                  }
                  onChange={
                    handleChange
                  }
                  className={inputClass}
                  placeholder="Enter price"
                />

              </div>

              {/* STOCK */}

              <div>

                <label className={labelClass}>
                  Stock
                </label>

                <input
                  type="number"
                  name="stock"
                  value={
                    formData.stock
                  }
                  onChange={
                    handleChange
                  }
                  className={inputClass}
                  placeholder="Enter stock quantity"
                />

              </div>

            </div>

            {/* DESCRIPTION */}

            <div>

              <label className={labelClass}>
                Description
              </label>

              <textarea
                name="description"
                value={
                  formData.description
                }
                onChange={
                  handleChange
                }
                rows="5"
                className={`${inputClass} resize-none`}
                placeholder="Enter product description"
              />

            </div>

          </div>

          {/* ==========================================
              PRODUCT IMAGES
          ========================================== */}

          <div className="bg-[#354158] rounded-lg p-6">

            <div className="mb-6">

              <h2 className="text-sm font-semibold">
                PRODUCT IMAGES
              </h2>

              <p className="text-[10px] text-gray-500 mt-1">
                Select and crop at least
                3 product images.
              </p>

            </div>

            {/* FILE INPUT */}

            <div className="border border-dashed border-[#465168] rounded-lg bg-[#202632] p-6">

              <input
                type="file"
                multiple
                accept="image/jpeg,image/png,image/webp"
                onChange={
                  handleImageChange
                }
                className="block w-full text-xs text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-[#b51a2b] file:text-white file:text-xs file:cursor-pointer hover:file:bg-[#d92d3d]"
              />

              <div className="mt-4 space-y-1">

                <p className="text-[10px] text-gray-400">
                  Selected:{" "}
                  <span className="text-white">
                    {images.length}
                  </span>{" "}
                  image(s)
                </p>

                <p className="text-[10px] text-gray-400">
                  Cropped:{" "}
                  <span className="text-white">
                    {
                      croppedImages.length
                    }
                  </span>{" "}
                  image(s)
                </p>

                <p className="text-[9px] text-gray-600">
                  Minimum 3 cropped
                  images required.
                </p>

              </div>

            </div>

            {/* IMAGE STATUS */}

            {images.length > 0 && (
              <div className="mt-4 flex items-center gap-2">

                <div
                  className={`w-2 h-2 rounded-full ${
                    croppedImages.length >=
                    3
                      ? "bg-green-400"
                      : "bg-yellow-400"
                  }`}
                />

                <p className="text-[10px] text-gray-400">

                  {croppedImages.length >=
                  3
                    ? "Minimum image requirement completed"
                    : `Crop ${
                        3 -
                        croppedImages.length
                      } more image(s)`}

                </p>

              </div>
            )}

          </div>

          {/* ==========================================
              SPECIFICATIONS
          ========================================== */}

          <div className="bg-[#354158] rounded-lg p-6">

            <div className="mb-6">

              <h2 className="text-sm font-semibold">
                TECHNICAL SPECIFICATIONS
              </h2>

              <p className="text-[10px] text-gray-500 mt-1">
                Enter the technical
                specifications of the laptop.
              </p>

            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

              {/* PROCESSOR */}

              <div>

                <label className={labelClass}>
                  Processor
                </label>

                <input
                  type="text"
                  name="processor"
                  value={
                    formData.processor
                  }
                  onChange={
                    handleChange
                  }
                  className={inputClass}
                  placeholder="Example: Intel Core i7"
                />

              </div>

              {/* RAM */}

              <div>

                <label className={labelClass}>
                  RAM
                </label>

                <input
                  type="text"
                  name="ram"
                  value={
                    formData.ram
                  }
                  onChange={
                    handleChange
                  }
                  className={inputClass}
                  placeholder="Example: 16GB"
                />

              </div>

              {/* STORAGE */}

              <div>

                <label className={labelClass}>
                  Storage
                </label>

                <input
                  type="text"
                  name="storage"
                  value={
                    formData.storage
                  }
                  onChange={
                    handleChange
                  }
                  className={inputClass}
                  placeholder="Example: 512GB SSD"
                />

              </div>

              {/* DISPLAY */}

              <div>

                <label className={labelClass}>
                  Display
                </label>

                <input
                  type="text"
                  name="display"
                  value={
                    formData.display
                  }
                  onChange={
                    handleChange
                  }
                  className={inputClass}
                  placeholder="Example: 15.6 inch FHD"
                />

              </div>

              {/* GRAPHICS */}

              <div>

                <label className={labelClass}>
                  Graphics
                </label>

                <input
                  type="text"
                  name="graphics"
                  value={
                    formData.graphics
                  }
                  onChange={
                    handleChange
                  }
                  className={inputClass}
                  placeholder="Example: NVIDIA RTX 4060"
                />

              </div>

              {/* OPERATING SYSTEM */}

              <div>

                <label className={labelClass}>
                  Operating System
                </label>

                <input
                  type="text"
                  name="operatingSystem"
                  value={
                    formData.operatingSystem
                  }
                  onChange={
                    handleChange
                  }
                  className={inputClass}
                  placeholder="Example: Windows 11"
                />

              </div>

            </div>

          </div>

          {/* ==========================================
              SUBMIT SECTION
          ========================================== */}

          <div className="flex justify-end">

            <button
              type="submit"
              disabled={saving}
              className="px-8 py-3 bg-[#b51a2b] hover:bg-[#d92d3d] text-white rounded-md text-xs font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving
                ? "ADDING PRODUCT..."
                : "ADD PRODUCT"}
            </button>

          </div>

        </form>

      </div>

      {/* ==========================================
          IMAGE CROPPER
      ========================================== */}

      {cropImageSrc && (
        <ImageCropper
          image={cropImageSrc}
          onCropComplete={
            handleCropComplete
          }
          onCancel={
            handleCropCancel
          }
        />
      )}

    </div>
  );
}

export default AdminAddProduct;