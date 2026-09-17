import { useEffect, useState } from "react";
import api from "../api/axios";

function Cart() {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);

  const MAX_QUANTITY = 5;

  // =========================
  // FETCH CART
  // =========================

  const fetchCart = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await api.get("/cart", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setCart(response.data.cart);
    } catch (error) {
      console.error(
        "Failed to fetch cart:",
        error.response?.data || error.message
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // UPDATE QUANTITY
  // =========================

  const handleUpdateQuantity = async (productId, quantity) => {
    try {
      const token = localStorage.getItem("token");

      if (quantity < 1) {
        return;
      }

      if (quantity > MAX_QUANTITY) {
        return;
      }

      const response = await api.put(
        `/cart/${productId}`,
        {
          quantity,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setCart(response.data.cart);
    } catch (error) {
      console.error(
        "Update cart error:",
        error.response?.data || error.message
      );
    }
  };

  // =========================
  // REMOVE PRODUCT
  // =========================

  const handleRemove = async (productId) => {
    try {
      const token = localStorage.getItem("token");

      const response = await api.delete(`/cart/${productId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setCart(response.data.cart);
    } catch (error) {
      console.error(
        "Remove cart error:",
        error.response?.data || error.message
      );
    }
  };

  // =========================
  // LOAD CART
  // =========================

  useEffect(() => {
    fetchCart();
  }, []);

  // =========================
  // LOADING
  // =========================

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading cart...</p>
      </div>
    );
  }

  // =========================
  // EMPTY CART
  // =========================

  if (!cart || cart.items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <h1 className="text-2xl font-bold text-[#384358]">
          Your cart is empty
        </h1>
      </div>
    );
  }

  // =========================
  // CART PAGE
  // =========================

  return (
    <div className="min-h-screen bg-[#f5f5f5] px-8 py-10">
      <h1 className="text-3xl font-bold text-[#384358] mb-8">
        My Cart
      </h1>

      <div className="max-w-4xl mx-auto space-y-4">

        {cart.items.map((item) => {
          const product = item.productId;

          const isOutOfStock = product.stock === 0;

          const maxReached =
            item.quantity >= product.stock ||
            item.quantity >= MAX_QUANTITY;

          return (
            <div
              key={product._id}
              className={`bg-white rounded-xl p-5 shadow flex justify-between items-center ${
                isOutOfStock ? "opacity-60" : ""
              }`}
            >

              {/* PRODUCT INFORMATION */}

              <div>
                <p className="text-sm text-gray-500">
                  {product.brand}
                </p>

                <h2 className="text-xl font-semibold text-[#384358]">
                  {product.name}
                </h2>

                <p className="text-[#b51a2b] font-bold mt-2">
                  ₹{product.price.toLocaleString("en-IN")}
                </p>

                <p className="text-sm text-gray-500 mt-2">
                  Stock: {product.stock}
                </p>

                {isOutOfStock && (
                  <p className="text-sm text-red-600 font-semibold mt-2">
                    OUT OF STOCK
                  </p>
                )}

                {!isOutOfStock &&
                  item.quantity >= MAX_QUANTITY && (
                    <p className="text-sm text-orange-600 font-medium mt-2">
                      Maximum quantity reached
                    </p>
                  )}
              </div>

              {/* CART CONTROLS */}

              <div className="flex items-center gap-4">

                {/* DECREASE */}

                <button
                  onClick={() =>
                    handleUpdateQuantity(
                      product._id,
                      item.quantity - 1
                    )
                  }
                  disabled={
                    isOutOfStock ||
                    item.quantity <= 1
                  }
                  className="w-8 h-8 rounded-lg border disabled:opacity-40"
                >
                  -
                </button>

                {/* QUANTITY */}

                <span className="font-medium min-w-[20px] text-center">
                  {item.quantity}
                </span>

                {/* INCREASE */}

                <button
                  onClick={() =>
                    handleUpdateQuantity(
                      product._id,
                      item.quantity + 1
                    )
                  }
                  disabled={
                    isOutOfStock ||
                    maxReached
                  }
                  className="w-8 h-8 rounded-lg border disabled:opacity-40"
                >
                  +
                </button>

                {/* REMOVE */}

                <button
                  onClick={() =>
                    handleRemove(product._id)
                  }
                  className="ml-4 text-red-600 hover:text-red-800"
                >
                  Remove
                </button>

              </div>
            </div>
          );
        })}

      </div>
    </div>
  );
}

export default Cart;