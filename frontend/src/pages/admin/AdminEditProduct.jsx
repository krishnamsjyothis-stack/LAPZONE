
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../api/axios";

const BACKEND_URL =
  import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

const INITIAL_PRODUCT = {
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
};

const inputClass =
  "w-full rounded-lg border border-[#414d5e] bg-[#202936] px-4 py-3 text-sm text-white placeholder:text-gray-500 outline-none transition focus:border-[#b51a2b] focus:ring-1 focus:ring-[#b51a2b]";

const labelClass =
  "mb-2 block text-sm font-medium text-gray-300";

function EditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [product, setProduct] = useState(INITIAL_PRODUCT);
  const [existingImages, setExistingImages] = useState([]);
  const [newImages, setNewImages] = useState([]);

  const [modal, setModal] = useState({
    open: false,
    title: "",
    message: "",
    type: "info",
    onConfirm: null,
  });

  const [imageToRemove, setImageToRemove] = useState(null);

  const showModal = (
    title,
    message,
    type = "info",
    onConfirm = null
  ) => {
    setModal({
      open: true,
      title,
      message,
      type,
      onConfirm,
    });
  };

  const closeModal = () => {
    setModal({
      open: false,
      title: "",
      message: "",
      type: "info",
      onConfirm: null,
    });
  };

  // --------------------------------------------------
  // IMAGE URL HELPER
  // --------------------------------------------------

  const getImageUrl = (image) => {
    const path =
      typeof image === "string"
        ? image
        : image?.url || image?.path || image?.filename;

    if (!path || typeof path !== "string") return "";

    if (/^https?:\/\//i.test(path)) return path;

    return `${BACKEND_URL}/${path.replace(/^\/+/, "")}`;
  };

  // --------------------------------------------------
  // FETCH PRODUCT
  // --------------------------------------------------

  useEffect(() => {
    let cancelled = false;

    const fetchProduct = async () => {
      try {
        setLoading(true);

        const response = await api.get(`/products/${id}`);
        const data = response.data?.product || response.data;

        if (!data?._id && !data?.name) {
          throw new Error("Product details were not found.");
        }

        if (cancelled) return;

        setProduct({
          name: data.name || "",
          brand: data.brand || "",
          category:
            typeof data.category === "object"
              ? data.category?.name || ""
              : data.category || "",
          price: data.price ?? "",
          stock: data.stock ?? "",
          description: data.description || "",
          processor: data.specifications?.processor || "",
          ram: data.specifications?.ram || "",
          storage: data.specifications?.storage || "",
          display: data.specifications?.display || "",
        });

        setExistingImages(
          Array.isArray(data.images) ? data.images : []
        );
        setNewImages([]);
      } catch (error) {
        console.error(
          "Failed to fetch product:",
          error.response?.data || error.message
        );

        if (!cancelled) {
          showModal(
            "Unable to Load Product",
            error.response?.data?.message ||
              error.message ||
              "Failed to load product. Please try again.",
            "error",
            () => navigate("/admin/products")
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchProduct();

    return () => {
      cancelled = true;
    };
  }, [id, navigate]);

  // --------------------------------------------------
  // HANDLE INPUT
  // --------------------------------------------------

  const handleChange = (event) => {
    const { name, value } = event.target;

    setProduct((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // --------------------------------------------------
  // HANDLE IMAGE UPLOAD
  // --------------------------------------------------

  const handleImageChange = (event) => {
    const selectedFiles = Array.from(
      event.target.files || []
    );

    const validTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    const invalidFile = selectedFiles.find(
      (file) => !validTypes.includes(file.type)
    );

    if (invalidFile) {
      showModal(
        "Unsupported Image",
        "Please select JPG, PNG, or WebP images only.",
        "error"
      );
      event.target.value = "";
      return;
    }

    const totalImages =
      existingImages.length +
      newImages.length +
      selectedFiles.length;

    if (totalImages > 10) {
      showModal(
        "Image Limit Reached",
        "You can upload a maximum of 10 product images.",
        "error"
      );
      event.target.value = "";
      return;
    }

    setNewImages((previous) => [
      ...previous,
      ...selectedFiles,
    ]);

    event.target.value = "";
  };

  const handleRemoveExistingImage = () => {
    if (imageToRemove === null) return;

    setExistingImages((previous) =>
      previous.filter(
        (_, index) => index !== imageToRemove
      )
    );

    setImageToRemove(null);
  };

  const handleRemoveNewImage = (index) => {
    setNewImages((previous) =>
      previous.filter((_, imageIndex) => imageIndex !== index)
    );
  };

  // --------------------------------------------------
  // UPDATE PRODUCT
  // --------------------------------------------------

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (
      !product.name.trim() ||
      !product.brand.trim() ||
      !product.category.trim() ||
      !product.description.trim()
    ) {
      showModal(
        "Missing Information",
        "Please complete all required product fields.",
        "error"
      );
      return;
    }

    if (
      product.price === "" ||
      !Number.isFinite(Number(product.price)) ||
      Number(product.price) < 0
    ) {
      showModal(
        "Invalid Price",
        "Please enter a valid, non-negative product price.",
        "error"
      );
      return;
    }

    if (
      product.stock === "" ||
      !Number.isInteger(Number(product.stock)) ||
      Number(product.stock) < 0
    ) {
      showModal(
        "Invalid Stock",
        "Stock must be a non-negative whole number.",
        "error"
      );
      return;
    }

    try {
      setSaving(true);

      const formData = new FormData();

      formData.append("name", product.name.trim());
      formData.append("brand", product.brand.trim());
      formData.append("category", product.category.trim());
      formData.append("price", String(product.price));
      formData.append("stock", String(product.stock));
      formData.append(
        "description",
        product.description.trim()
      );

      formData.append(
        "specifications",
        JSON.stringify({
          processor: product.processor,
          ram: product.ram,
          storage: product.storage,
          display: product.display,
        })
      );

      formData.append(
        "existingImages",
        JSON.stringify(existingImages)
      );

      newImages.forEach((image) => {
        formData.append("images", image);
      });

      await api.put(`/products/${id}`, formData);

      showModal(
        "Product Updated",
        "Your product information has been updated successfully.",
        "success",
        () => navigate("/admin/products")
      );
    } catch (error) {
      console.error(
        "Update product error:",
        error.response?.data || error.message
      );

      showModal(
        "Update Failed",
        error.response?.data?.message ||
          "Failed to update product. Please try again.",
        "error"
      );
    } finally {
      setSaving(false);
    }
  };

  // --------------------------------------------------
  // LOADING SCREEN
  // --------------------------------------------------

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#202936] text-white">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-[#414d5e] border-t-[#b51a2b]" />
          <p className="text-sm text-gray-300">
            Loading product details...
          </p>
        </div>
      </div>
    );
  }

  // --------------------------------------------------
  // MAIN UI
  // --------------------------------------------------

  return (
    <div className="min-h-screen bg-[#202936] px-4 py-6 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        {/* HEADER */}
        <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs text-gray-400">
              Admin / Products / Edit Product
            </p>

            <h1 className="mt-2 text-2xl font-semibold tracking-wide sm:text-3xl">
              Edit Product
            </h1>

            <p className="mt-2 text-sm text-gray-400">
              Update product details, specifications, inventory and images.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate("/admin/products")}
            className="rounded-lg border border-[#414d5e] px-4 py-2.5 text-sm text-gray-200 transition hover:border-[#b51a2b] hover:bg-[#293444]"
          >
            ← Back to Products
          </button>
        </header>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* PRODUCT INFORMATION */}
          <section className="rounded-xl border border-[#414d5e] bg-[#293444] p-5 sm:p-6">
            <div className="mb-6 border-b border-[#414d5e] pb-4">
              <h2 className="text-lg font-semibold">
                Product Information
              </h2>
              <p className="mt-1 text-sm text-gray-400">
                Basic information displayed in your LAPZONE store.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              {[
                {
                  name: "name",
                  label: "Product Name",
                  type: "text",
                  placeholder: "Enter laptop name",
                },
                {
                  name: "brand",
                  label: "Brand",
                  type: "text",
                  placeholder: "e.g. HP, Dell, Lenovo",
                },
                {
                  name: "category",
                  label: "Category",
                  type: "text",
                  placeholder: "e.g. Gaming, Business, Students",
                },
                {
                  name: "price",
                  label: "Price (₹)",
                  type: "number",
                  placeholder: "Enter price",
                },
                {
                  name: "stock",
                  label: "Stock Quantity",
                  type: "number",
                  placeholder: "Enter available units",
                },
              ].map((field) => (
                <div key={field.name}>
                  <label
                    htmlFor={field.name}
                    className={labelClass}
                  >
                    {field.label}
                  </label>

                  <input
                    id={field.name}
                    type={field.type}
                    name={field.name}
                    value={product[field.name]}
                    onChange={handleChange}
                    placeholder={field.placeholder}
                    min={
                      field.name === "price" ||
                      field.name === "stock"
                        ? "0"
                        : undefined
                    }
                    step={
                      field.name === "stock"
                        ? "1"
                        : field.name === "price"
                        ? "0.01"
                        : undefined
                    }
                    required
                    className={inputClass}
                  />
                </div>
              ))}
            </div>

            <div className="mt-5">
              <label
                htmlFor="description"
                className={labelClass}
              >
                Product Description
              </label>

              <textarea
                id="description"
                name="description"
                value={product.description}
                onChange={handleChange}
                placeholder="Describe the laptop and its main features..."
                rows={5}
                required
                className={`${inputClass} resize-y`}
              />
            </div>
          </section>

          {/* SPECIFICATIONS */}
          <section className="rounded-xl border border-[#414d5e] bg-[#293444] p-5 sm:p-6">
            <div className="mb-6 border-b border-[#414d5e] pb-4">
              <h2 className="text-lg font-semibold">
                Technical Specifications
              </h2>
              <p className="mt-1 text-sm text-gray-400">
                Update the hardware details for this laptop.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              {[
                {
                  name: "processor",
                  label: "Processor",
                  placeholder: "e.g. Intel Core i7",
                },
                {
                  name: "ram",
                  label: "RAM",
                  placeholder: "e.g. 16GB DDR5",
                },
                {
                  name: "storage",
                  label: "Storage",
                  placeholder: "e.g. 512GB SSD",
                },
                {
                  name: "display",
                  label: "Display",
                  placeholder: "e.g. 15.6-inch Full HD",
                },
              ].map((field) => (
                <div key={field.name}>
                  <label
                    htmlFor={field.name}
                    className={labelClass}
                  >
                    {field.label}
                  </label>

                  <input
                    id={field.name}
                    type="text"
                    name={field.name}
                    value={product[field.name]}
                    onChange={handleChange}
                    placeholder={field.placeholder}
                    className={inputClass}
                  />
                </div>
              ))}
            </div>
          </section>

          {/* PRODUCT IMAGES */}
          <section className="rounded-xl border border-[#414d5e] bg-[#293444] p-5 sm:p-6">
            <div className="mb-6 border-b border-[#414d5e] pb-4">
              <h2 className="text-lg font-semibold">
                Product Images
              </h2>
              <p className="mt-1 text-sm text-gray-400">
                Manage existing photos or add new product images.
              </p>
            </div>

            {/* EXISTING IMAGES */}
            <div className="mb-7">
              <div className="mb-3 flex items-center justify-between gap-3">
                <h3 className="text-sm font-medium text-gray-200">
                  Existing Images
                </h3>
                <span className="text-xs text-gray-400">
                  {existingImages.length} image(s)
                </span>
              </div>

              {existingImages.length > 0 ? (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                  {existingImages.map((image, index) => (
                    <div
                      key={`${getImageUrl(image)}-${index}`}
                      className="overflow-hidden rounded-lg border border-[#414d5e] bg-[#202936]"
                    >
                      <div className="relative flex h-36 items-center justify-center p-2">
                        <img
                          src={getImageUrl(image)}
                          alt={`Existing product image ${index + 1}`}
                          className="h-full w-full object-contain"
                          onError={(event) => {
                            event.currentTarget.style.display = "none";
                            const fallback =
                              event.currentTarget.nextElementSibling;
                            if (fallback) {
                              fallback.classList.remove("hidden");
                            }
                          }}
                        />

                        <div className="absolute inset-0 hidden items-center justify-center text-xs text-gray-500">
                          Image unavailable
                        </div>
                      </div>

                      <div className="flex items-center justify-between border-t border-[#414d5e] px-3 py-2">
                        <span className="text-xs text-gray-400">
                          Image {index + 1}
                        </span>

                        <button
                          type="button"
                          onClick={() => setImageToRemove(index)}
                          className="text-xs font-medium text-red-400 transition hover:text-red-300"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-lg border border-dashed border-[#414d5e] py-8 text-center">
                  <p className="text-sm text-gray-400">
                    No existing images.
                  </p>
                </div>
              )}
            </div>

            {/* NEW IMAGES */}
            <div>
              <div className="mb-3 flex items-center justify-between gap-3">
                <h3 className="text-sm font-medium text-gray-200">
                  Add New Images
                </h3>
                <span className="text-xs text-gray-400">
                  {newImages.length} selected
                </span>
              </div>

              <label
                htmlFor="product-images"
                className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#414d5e] bg-[#202936] px-5 py-8 text-center transition hover:border-[#b51a2b] hover:bg-[#252f3e]"
              >
                <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#b51a2b]/15 text-2xl text-red-300">
                  +
                </span>

                <span className="text-sm font-medium text-gray-200">
                  Click to select images
                </span>

                <span className="mt-2 text-xs text-gray-400">
                  JPG, PNG or WebP · Up to 10 total images
                </span>

                <input
                  id="product-images"
                  type="file"
                  multiple
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleImageChange}
                  className="sr-only"
                />
              </label>

              {newImages.length > 0 && (
                <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                  {newImages.map((image, index) => (
                    <NewImagePreview
                      key={`${image.name}-${image.size}-${index}`}
                      image={image}
                      index={index}
                      onRemove={handleRemoveNewImage}
                    />
                  ))}
                </div>
              )}

              <p className="mt-4 text-xs text-gray-500">
                Total images after saving:{" "}
                {existingImages.length + newImages.length} / 10
              </p>
            </div>
          </section>

          {/* FORM ACTIONS */}
          <div className="flex flex-wrap justify-end gap-3 rounded-xl border border-[#414d5e] bg-[#293444] p-4 sm:p-5">
            <button
              type="button"
              onClick={() => navigate("/admin/products")}
              disabled={saving}
              className="rounded-lg border border-[#414d5e] px-5 py-2.5 text-sm text-gray-300 transition hover:bg-[#354158] disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-[#b51a2b] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? "Saving Changes..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>

      {/* NOTIFICATION MODAL */}
      {modal.open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onClick={closeModal}
        >
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="product-modal-title"
            aria-describedby="product-modal-message"
            className="w-full max-w-md rounded-2xl border border-[#414d5e] bg-[#293444] p-6 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div
              className={`mb-4 flex h-12 w-12 items-center justify-center rounded-full text-xl font-bold ${
                modal.type === "success"
                  ? "bg-green-500/15 text-green-400"
                  : modal.type === "error"
                  ? "bg-red-500/15 text-red-400"
                  : "bg-blue-500/15 text-blue-400"
              }`}
            >
              {modal.type === "success"
                ? "✓"
                : modal.type === "error"
                ? "!"
                : "i"}
            </div>

            <h2
              id="product-modal-title"
              className="text-lg font-semibold text-white"
            >
              {modal.title}
            </h2>

            <p
              id="product-modal-message"
              className="mt-2 text-sm leading-6 text-gray-300"
            >
              {modal.message}
            </p>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  const action = modal.onConfirm;
                  closeModal();
                  if (action) action();
                }}
                autoFocus
                className="rounded-lg bg-[#b51a2b] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-red-700"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REMOVE IMAGE CONFIRMATION */}
      {imageToRemove !== null && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4">
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="remove-image-title"
            className="w-full max-w-md rounded-2xl border border-[#414d5e] bg-[#293444] p-6 shadow-2xl"
          >
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-500/15 text-xl text-red-400">
              !
            </div>

            <h2
              id="remove-image-title"
              className="text-lg font-semibold"
            >
              Remove Product Image?
            </h2>

            <p className="mt-2 text-sm leading-6 text-gray-300">
              This image will be removed from the product when you save your changes.
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setImageToRemove(null)}
                className="rounded-lg border border-[#414d5e] px-4 py-2.5 text-sm text-gray-300 transition hover:bg-[#354158]"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleRemoveExistingImage}
                className="rounded-lg bg-[#b51a2b] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-red-700"
              >
                Remove Image
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// --------------------------------------------------
// NEW IMAGE PREVIEW
// --------------------------------------------------

function NewImagePreview({ image, index, onRemove }) {
  const [previewUrl, setPreviewUrl] = useState("");

  useEffect(() => {
    const url = URL.createObjectURL(image);
    setPreviewUrl(url);

    return () => URL.revokeObjectURL(url);
  }, [image]);

  return (
    <div className="overflow-hidden rounded-lg border border-[#414d5e] bg-[#202936]">
      <div className="relative flex h-36 items-center justify-center p-2">
        {previewUrl && (
          <img
            src={previewUrl}
            alt={`New product image ${index + 1}`}
            className="h-full w-full object-contain"
          />
        )}
      </div>

      <div className="flex items-center justify-between gap-2 border-t border-[#414d5e] px-3 py-2">
        <span className="truncate text-xs text-gray-400">
          New image {index + 1}
        </span>

        <button
          type="button"
          onClick={() => onRemove(index)}
          className="shrink-0 text-xs font-medium text-red-400 transition hover:text-red-300"
        >
          Remove
        </button>
      </div>
    </div>
  );
}

export default EditProduct;
