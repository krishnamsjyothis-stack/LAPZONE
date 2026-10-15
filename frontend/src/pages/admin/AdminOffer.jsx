import { useEffect, useState } from "react";
import api from "../../api/axios";

const AdminOffer = () => {
  // =========================
  // UI STATE
  // =========================

  const [showForm, setShowForm] = useState(false);

  // =========================
  // DATA STATE
  // =========================

  const [offers, setOffers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);

  // =========================
  // LOADING STATE
  // =========================

  const [loading, setLoading] = useState(true);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [productsLoading, setProductsLoading] = useState(false);

  // =========================
  // FORM STATE
  // =========================

  const [formData, setFormData] = useState({
    name: "",
    offerType: "PRODUCT",
    productId: "",
    category: "",
    discountType: "PERCENTAGE",
    discountValue: "",
    startDate: "",
    expiryDate: "",
    isActive: true,
  });

  // =========================
  // FETCH OFFERS
  // =========================

  const fetchOffers = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await api.get("/offers", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setOffers(response.data.offers || []);
    } catch (error) {
      console.error("Fetch offers error:", error);

      alert(
        error.response?.data?.message ||
          "Failed to fetch offers"
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // FETCH CATEGORIES
  // =========================

  const fetchCategories = async () => {
    try {
      setCategoriesLoading(true);

      const token = localStorage.getItem("token");

      const response = await api.get(
        "/categories?page=1&limit=100",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setCategories(response.data.categories || []);
    } catch (error) {
      console.error("Fetch categories error:", error);

      alert(
        error.response?.data?.message ||
          "Failed to fetch categories"
      );
    } finally {
      setCategoriesLoading(false);
    }
  };

  // =========================
  // FETCH PRODUCTS
  // =========================

  const fetchProducts = async () => {
    try {
      setProductsLoading(true);

      const token = localStorage.getItem("token");

      const response = await api.get(
        "/products?page=1&limit=100",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setProducts(response.data.products || []);
    } catch (error) {
      console.error("Fetch products error:", error);

      alert(
        error.response?.data?.message ||
          "Failed to fetch products"
      );
    } finally {
      setProductsLoading(false);
    }
  };

  // =========================
  // LOAD DATA
  // =========================

  useEffect(() => {
    fetchOffers();
    fetchCategories();
    fetchProducts();
  }, []);

  // =========================
  // HANDLE INPUT CHANGE
  // =========================

  const handleChange = (e) => {
    const {
      name,
      value,
      type,
      checked,
    } = e.target;

    // When changing offer type,
    // clear the unused field.
    if (name === "offerType") {
      setFormData((prev) => ({
        ...prev,
        offerType: value,
        productId:
          value === "PRODUCT"
            ? prev.productId
            : "",
        category:
          value === "CATEGORY"
            ? prev.category
            : "",
      }));

      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));
  };

  // =========================
  // CREATE OFFER
  // =========================

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");

      // Basic validation
      if (!formData.name.trim()) {
        alert("Please enter offer name");
        return;
      }

      if (
        formData.offerType === "PRODUCT" &&
        !formData.productId
      ) {
        alert("Please select a product");
        return;
      }

      if (
        formData.offerType === "CATEGORY" &&
        !formData.category
      ) {
        alert("Please select a category");
        return;
      }

      if (!formData.discountValue) {
        alert("Please enter discount value");
        return;
      }

      if (!formData.startDate) {
        alert("Please select start date");
        return;
      }

      if (!formData.expiryDate) {
        alert("Please select expiry date");
        return;
      }

      if (
        new Date(formData.expiryDate) <=
        new Date(formData.startDate)
      ) {
        alert(
          "Expiry date must be after start date"
        );
        return;
      }

      // Percentage validation
      if (
        formData.discountType === "PERCENTAGE" &&
        Number(formData.discountValue) > 100
      ) {
        alert(
          "Percentage discount cannot be more than 100%"
        );
        return;
      }

      const data = {
        name: formData.name.trim(),

        offerType: formData.offerType,

        // IMPORTANT:
        // Send MongoDB ObjectId for product.
        productId:
          formData.offerType === "PRODUCT"
            ? formData.productId
            : null,

        category:
          formData.offerType === "CATEGORY"
            ? formData.category
            : null,

        discountType: formData.discountType,

        discountValue:
          Number(formData.discountValue),

        startDate: formData.startDate,

        expiryDate: formData.expiryDate,

        isActive: formData.isActive,
      };

      console.log(
        "Offer data being sent:",
        data
      );

      const response = await api.post(
        "/offers",
        data,
        {
          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );

      alert(response.data.message);

      // Close form
      setShowForm(false);

      // Reset form
      setFormData({
        name: "",
        offerType: "PRODUCT",
        productId: "",
        category: "",
        discountType: "PERCENTAGE",
        discountValue: "",
        startDate: "",
        expiryDate: "",
        isActive: true,
      });

      // Refresh offers
      fetchOffers();
    } catch (error) {
      console.error(
        "Create offer error:",
        error
      );

      console.error(
        "Backend response:",
        error.response?.data
      );

      alert(
        error.response?.data?.message ||
          "Failed to create offer"
      );
    }
  };

  // =========================
  // DELETE OFFER
  // =========================

  const handleDelete = async (id) => {
    const confirmDelete =
      window.confirm(
        "Are you sure you want to delete this offer?"
      );

    if (!confirmDelete) {
      return;
    }

    try {
      const token =
        localStorage.getItem("token");

      const response =
        await api.delete(
          `/offers/${id}`,
          {
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

      alert(response.data.message);

      fetchOffers();
    } catch (error) {
      console.error(
        "Delete offer error:",
        error
      );

      alert(
        error.response?.data?.message ||
          "Failed to delete offer"
      );
    }
  };

  // =========================
  // FORMAT DATE
  // =========================

  const formatDate = (date) => {
    if (!date) {
      return "-";
    }

    return new Date(
      date
    ).toLocaleDateString("en-IN");
  };

  // =========================
  // UI
  // =========================

  return (
    <div className="min-h-screen bg-[#202936] text-white p-6">

      {/* ========================= */}
      {/* HEADER */}
      {/* ========================= */}

      <div className="flex justify-between items-center mb-6">

        <h1 className="text-2xl font-bold">
          Offer Management
        </h1>

        <button
          type="button"
          onClick={() =>
            setShowForm(!showForm)
          }
          className="bg-[#b51a2b] px-5 py-2 rounded-lg font-semibold hover:bg-[#991827]"
        >
          {showForm
            ? "CANCEL"
            : "+ CREATE OFFER"}
        </button>

      </div>

      {/* ========================= */}
      {/* CREATE OFFER FORM */}
      {/* ========================= */}

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-[#293444] border border-[#414d5e] rounded-xl p-6 mb-8"
        >

          <h2 className="text-xl font-semibold mb-6">
            Create Offer
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

            {/* OFFER NAME */}

            <div>
              <label className="block mb-2">
                Offer Name
              </label>

              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Gaming Laptop Sale"
                required
                className="w-full p-3 rounded-lg bg-[#202936] border border-[#414d5e]"
              />
            </div>

            {/* OFFER TYPE */}

            <div>
              <label className="block mb-2">
                Offer Type
              </label>

              <select
                name="offerType"
                value={formData.offerType}
                onChange={handleChange}
                className="w-full p-3 rounded-lg bg-[#202936] border border-[#414d5e]"
              >
                <option value="PRODUCT">
                  Product Offer
                </option>

                <option value="CATEGORY">
                  Category Offer
                </option>
              </select>
            </div>

            {/* PRODUCT */}

            {formData.offerType === "PRODUCT" && (
              <div>
                <label className="block mb-2">
                  Product
                </label>

                <select
                  name="productId"
                  value={formData.productId}
                  onChange={handleChange}
                  required
                  disabled={productsLoading}
                  className="w-full p-3 rounded-lg bg-[#202936] border border-[#414d5e]"
                >
                  <option value="">
                    {productsLoading
                      ? "Loading products..."
                      : "Select Product"}
                  </option>

                  {products.map((product) => (
                    <option
                      key={product._id}
                      value={product._id}
                    >
                      {product.name}
                    </option>
                  ))}
                </select>

                <p className="text-xs text-gray-400 mt-2">
                  Product name is displayed, but
                  MongoDB product ID is submitted.
                </p>
              </div>
            )}

            {/* CATEGORY */}

            {formData.offerType === "CATEGORY" && (
              <div>
                <label className="block mb-2">
                  Category
                </label>

                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                  disabled={categoriesLoading}
                  className="w-full p-3 rounded-lg bg-[#202936] border border-[#414d5e]"
                >
                  <option value="">
                    {categoriesLoading
                      ? "Loading categories..."
                      : "Select Category"}
                  </option>

                  {categories
                    .filter(
                      (category) =>
                        category.isActive !== false
                    )
                    .map((category) => (
                      <option
                        key={category._id}
                        value={category.name}
                      >
                        {category.name}
                      </option>
                    ))}
                </select>
              </div>
            )}

            {/* DISCOUNT TYPE */}

            <div>
              <label className="block mb-2">
                Discount Type
              </label>

              <select
                name="discountType"
                value={formData.discountType}
                onChange={handleChange}
                className="w-full p-3 rounded-lg bg-[#202936] border border-[#414d5e]"
              >
                <option value="PERCENTAGE">
                  Percentage
                </option>

                <option value="FIXED">
                  Fixed Amount
                </option>
              </select>
            </div>

            {/* DISCOUNT VALUE */}

            <div>
              <label className="block mb-2">
                Discount Value
              </label>

              <input
                type="number"
                name="discountValue"
                value={formData.discountValue}
                onChange={handleChange}
                min="0"
                required
                placeholder={
                  formData.discountType ===
                  "PERCENTAGE"
                    ? "10"
                    : "5000"
                }
                className="w-full p-3 rounded-lg bg-[#202936] border border-[#414d5e]"
              />
            </div>

            {/* START DATE */}

            <div>
              <label className="block mb-2">
                Start Date
              </label>

              <input
                type="datetime-local"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                required
                className="w-full p-3 rounded-lg bg-[#202936] border border-[#414d5e]"
              />
            </div>

            {/* EXPIRY DATE */}

            <div>
              <label className="block mb-2">
                Expiry Date
              </label>

              <input
                type="datetime-local"
                name="expiryDate"
                value={formData.expiryDate}
                onChange={handleChange}
                required
                className="w-full p-3 rounded-lg bg-[#202936] border border-[#414d5e]"
              />
            </div>

          </div>

          {/* ACTIVE */}

          <div className="flex items-center gap-3 mt-5">

            <input
              type="checkbox"
              name="isActive"
              checked={formData.isActive}
              onChange={handleChange}
            />

            <label>
              Offer Active
            </label>

          </div>

          {/* SUBMIT */}

          <button
            type="submit"
            className="mt-6 bg-[#b51a2b] px-6 py-3 rounded-lg font-semibold hover:bg-[#991827]"
          >
            CREATE OFFER
          </button>

        </form>
      )}

      {/* ========================= */}
      {/* OFFERS LIST */}
      {/* ========================= */}

      <div className="bg-[#293444] border border-[#414d5e] rounded-xl overflow-hidden">

        <div className="p-5 border-b border-[#414d5e]">

          <h2 className="text-xl font-semibold">
            All Offers
          </h2>

        </div>

        {loading ? (
          <div className="p-6">
            Loading offers...
          </div>
        ) : offers.length === 0 ? (
          <div className="p-6 text-gray-400">
            No offers found.
          </div>
        ) : (
          <div className="overflow-x-auto">

            <table className="w-full">

              <thead>
                <tr className="border-b border-[#414d5e] text-left">

                  <th className="p-4">
                    Name
                  </th>

                  <th className="p-4">
                    Type
                  </th>

                  <th className="p-4">
                    Category / Product
                  </th>

                  <th className="p-4">
                    Discount
                  </th>

                  <th className="p-4">
                    Start Date
                  </th>

                  <th className="p-4">
                    Expiry Date
                  </th>

                  <th className="p-4">
                    Status
                  </th>

                  <th className="p-4">
                    Action
                  </th>

                </tr>
              </thead>

              <tbody>

                {offers.map((offer) => (
                  <tr
                    key={offer._id}
                    className="border-b border-[#414d5e]"
                  >

                    <td className="p-4">
                      {offer.name}
                    </td>

                    <td className="p-4">
                      {offer.offerType}
                    </td>

                    <td className="p-4">
  {offer.offerType === "CATEGORY"
    ? offer.category || "-"
    : offer.productId?.name || "-"}
</td>

                    <td className="p-4">

                      {offer.discountType ===
                      "PERCENTAGE"
                        ? `${offer.discountValue}%`
                        : `₹${Number(
                            offer.discountValue
                          ).toLocaleString("en-IN")}`}

                    </td>

                    <td className="p-4">
                      {formatDate(offer.startDate)}
                    </td>

                    <td className="p-4">
                      {formatDate(offer.expiryDate)}
                    </td>

                    <td className="p-4">

                      <span
                        className={
                          offer.isActive
                            ? "text-green-400"
                            : "text-red-400"
                        }
                      >
                        {offer.isActive
                          ? "Active"
                          : "Inactive"}
                      </span>

                    </td>

                    <td className="p-4">

                      <button
                        type="button"
                        onClick={() =>
                          handleDelete(offer._id)
                        }
                        className="text-red-400 hover:text-red-300"
                      >
                        Delete
                      </button>

                    </td>

                  </tr>
                ))}

              </tbody>

            </table>

          </div>
        )}

      </div>

    </div>
  );
};

export default AdminOffer;