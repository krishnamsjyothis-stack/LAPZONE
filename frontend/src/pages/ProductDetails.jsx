import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/axios";

function ProductDetails() {
  const { id } = useParams();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [addingToCart, setAddingToCart] = useState(false);
  
const [showCartModal, setShowCartModal] = useState(false);
const [cartMessage, setCartMessage] = useState("");
const [cartSuccess, setCartSuccess] = useState(false);
  

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await api.get(`/products/${id}`);

        setProduct(response.data.product);
      } catch (error) {
        console.error("Failed to fetch product:", error);

        setError(
          error.response?.data?.message || "Failed to load product"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);
const handleAddToCart = async () => {
  try {
    const token = localStorage.getItem("token");

    if (!token) {
      setCartMessage("Please login first to add products to your cart.");
      setCartSuccess(false);
      setShowCartModal(true);
      return;
    }

    setAddingToCart(true);

    const response = await api.post(
      "/cart",
      {
        productId: product._id,
        quantity: 1,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    setCartMessage(
      response.data.message || "Product added to cart successfully."
    );
    setCartSuccess(true);
    setShowCartModal(true);
  } catch (error) {
    console.error(
      "Add to cart error:",
      error.response?.data || error.message
    );

    setCartMessage(
      error.response?.data?.message ||
        "Unable to add product to cart."
    );
    setCartSuccess(false);
    setShowCartModal(true);
  } finally {
    setAddingToCart(false);
  }
};
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading product...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>{error}</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Product not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f5f5] px-8 py-10">
      <div className="max-w-6xl mx-auto bg-white rounded-2xl p-8 shadow">
        <p className="text-gray-500">
          {product.brand}
        </p>

        <h1 className="text-3xl font-bold text-[#384358] mt-2">
          {product.name}
        </h1>

        <p className="text-gray-600 mt-3">
          {product.description}
        </p>

        <p className="text-3xl font-bold text-[#b51a2b] mt-6">
          ₹{product.price.toLocaleString("en-IN")}
        </p>

        <p className="text-gray-600 mt-2">
          Stock available: {product.stock}
        </p>
        <button
  onClick={handleAddToCart}
  disabled={
  addingToCart ||
  product.stock === 0 ||
  !product.isActive
}
  className="mt-6 px-8 py-3 rounded-xl bg-[#b51a2b] text-white font-medium hover:bg-[#9f1729] disabled:opacity-50"
>
  {!product.isActive
  ? "UNAVAILABLE"
  : product.stock === 0
  ? "OUT OF STOCK"
  : addingToCart
  ? "ADDING..."
  : "ADD TO CART"}
</button>

        <div className="mt-8">
          <h2 className="text-xl font-bold text-[#384358]">
            Specifications
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <p>
              <strong>Processor:</strong>{" "}
              {product.specifications?.processor || "N/A"}
            </p>

            <p>
              <strong>RAM:</strong>{" "}
              {product.specifications?.ram || "N/A"}
            </p>

            <p>
              <strong>Storage:</strong>{" "}
              {product.specifications?.storage || "N/A"}
            </p>

            <p>
              <strong>Display:</strong>{" "}
              {product.specifications?.display || "N/A"}
            </p>

            <p>
              <strong>Graphics:</strong>{" "}
              {product.specifications?.graphics || "N/A"}
            </p>

            <p>
              <strong>Operating System:</strong>{" "}
              {product.specifications?.operatingSystem || "N/A"}
            </p>
          </div>
        </div>
      </div>

      {showCartModal && (
  <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-6">
    <div className="bg-[#384358] w-full max-w-md rounded-2xl p-8 text-center">
      
      <h2 className="text-2xl font-bold text-white">
        {cartSuccess ? "SUCCESS" : "ADD TO CART FAILED"}
      </h2>

      <p className="text-gray-400 mt-3">
        {cartMessage}
      </p>

      <button
        onClick={() => setShowCartModal(false)}
        className="w-full h-12 mt-6 rounded-xl bg-[#c51f35] hover:bg-[#b51a2b] text-white font-semibold"
      >
        CONTINUE
      </button>

    </div>
  </div>
)}
    </div>
  );
}

export default ProductDetails;