
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

const MAX_QUANTITY = 5;
const API_BASE_URL =
  import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

function formatPrice(value) {
  const price = Number(value);
  return Number.isFinite(price) && price >= 0
    ? price.toLocaleString("en-IN")
    : "0";
}

function getImageUrl(image) {
  if (!image) return "";

  // Support both complete URLs and backend-relative image paths.
  if (/^https?:\/\//i.test(image)) return image;

  return `${API_BASE_URL}${image.startsWith("/") ? "" : "/"}${image}`;
}

function Cart() {
  const navigate = useNavigate();

  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatingProducts, setUpdatingProducts] = useState([]);
  const [removingProducts, setRemovingProducts] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");

  // =========================================
  // AUTHENTICATION
  // =========================================
  const getAuthConfig = () => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return null;
    }

    return {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  };

  // =========================================
  // FETCH CART
  // =========================================
  const fetchCart = useCallback(async () => {
    setLoading(true);
    setErrorMessage("");

    try {
      const config = getAuthConfig();

      if (!config) return;

      const response = await api.get("/cart", config);
      const fetchedCart = response.data?.cart;

      if (!fetchedCart || !Array.isArray(fetchedCart.items)) {
        setCart({ items: [] });
        return;
      }

      setCart(fetchedCart);
    } catch (error) {
      console.error(
        "Failed to fetch cart:",
        error.response?.data || error.message
      );

      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
        return;
      }

      setErrorMessage(
        error.response?.data?.message ||
          "Unable to load your cart. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  // =========================================
  // UPDATE QUANTITY
  // =========================================
  const handleUpdateQuantity = async (productId, quantity) => {
    if (!productId || !Number.isInteger(quantity)) return;
    if (quantity < 1 || quantity > MAX_QUANTITY) return;
    if (updatingProducts.includes(productId)) return;

    setUpdatingProducts((previous) => [...previous, productId]);
    setErrorMessage("");

    try {
      const config = getAuthConfig();

      if (!config) return;

      const response = await api.put(
        `/cart/${productId}`,
        { quantity },
        config
      );

      if (response.data?.cart) {
        setCart(response.data.cart);
      } else {
        await fetchCart();
      }
    } catch (error) {
      console.error(
        "Update cart error:",
        error.response?.data || error.message
      );

      setErrorMessage(
        error.response?.data?.message ||
          "Unable to update quantity. Please try again."
      );
    } finally {
      setUpdatingProducts((previous) =>
        previous.filter((id) => id !== productId)
      );
    }
  };

  // =========================================
  // REMOVE PRODUCT
  // =========================================
  const handleRemove = async (productId) => {
    if (!productId || removingProducts.includes(productId)) return;

    setRemovingProducts((previous) => [...previous, productId]);
    setErrorMessage("");

    try {
      const config = getAuthConfig();

      if (!config) return;

      const response = await api.delete(`/cart/${productId}`, config);

      if (response.data?.cart) {
        setCart(response.data.cart);
      } else {
        await fetchCart();
      }
    } catch (error) {
      console.error(
        "Remove cart error:",
        error.response?.data || error.message
      );

      setErrorMessage(
        error.response?.data?.message ||
          "Unable to remove the product. Please try again."
      );
    } finally {
      setRemovingProducts((previous) =>
        previous.filter((id) => id !== productId)
      );
    }
  };

  // =========================================
  // VALID CART ITEMS
  // =========================================
  const cartItems = useMemo(
    () =>
      Array.isArray(cart?.items)
        ? cart.items.filter((item) => item?.productId)
        : [],
    [cart]
  );

  // =========================================
  // CHECK UNAVAILABLE PRODUCTS
  // =========================================
  const hasUnavailableProduct = cartItems.some((item) => {
    const product = item.productId;
    const stock = Number(product.stock);

    return (
      product.isActive === false ||
      !Number.isFinite(stock) ||
      stock <= 0 ||
      Number(item.quantity) > stock
    );
  });

  // =========================================
  // SUBTOTAL
  // =========================================
  const subtotal = cartItems.reduce((total, item) => {
    const product = item.productId;
    const quantity = Number(item.quantity);

    const finalPrice = item.offer?.hasOffer
      ? Number(item.offer.finalPrice)
      : Number(product.price);

    if (
      !Number.isFinite(finalPrice) ||
      finalPrice < 0 ||
      !Number.isFinite(quantity) ||
      quantity < 1
    ) {
      return total;
    }

    return total + finalPrice * quantity;
  }, 0);

  // Coupon integration can be added when the coupon API is connected.
  const discount = 0;
  const delivery = 0;
  const total = Math.max(0, subtotal - discount + delivery);

  // =========================================
  // LOADING
  // =========================================
  if (loading) {
    return (
      <div className="min-h-[calc(100vh-64px)] bg-[#11161e] text-white flex items-center justify-center">
        <p className="text-sm text-gray-400">Loading cart...</p>
      </div>
    );
  }

  // =========================================
  // FETCH ERROR
  // =========================================
  if (errorMessage && !cart) {
    return (
      <div className="min-h-[calc(100vh-64px)] bg-[#11161e] text-white flex flex-col items-center justify-center px-6">
        <p className="text-sm text-red-300 text-center">
          {errorMessage}
        </p>

        <button
          type="button"
          onClick={fetchCart}
          className="mt-5 rounded-full bg-[#b51a2b] px-6 py-3 text-sm hover:bg-[#c9273c]"
        >
          TRY AGAIN
        </button>
      </div>
    );
  }

  // =========================================
  // EMPTY CART
  // =========================================
  if (!cart || cartItems.length === 0) {
    return (
      <div className="min-h-[calc(100vh-64px)] bg-[#11161e] text-white">
        <div className="min-h-[60vh] flex flex-col items-center justify-center px-6">
          <div className="w-16 h-16 rounded-full bg-[#1b2028] flex items-center justify-center text-2xl">
            🛒
          </div>

          <h1 className="text-2xl font-semibold mt-5">
            Your cart is empty
          </h1>

          <p className="text-sm text-gray-500 mt-2 text-center">
            Add some laptops to your cart to get started.
          </p>

          <button
            type="button"
            onClick={() => navigate("/products")}
            className="mt-6 px-7 py-3 rounded-md bg-[#b51a2b] text-white text-sm font-medium hover:bg-[#c9273c] transition"
          >
            CONTINUE SHOPPING
          </button>
        </div>
      </div>
    );
  }

  // =========================================
  // RENDER
  // =========================================
  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#11161e] text-white">
      <main className="max-w-7xl mx-auto px-4 md:px-7 py-7">
        {/* BREADCRUMB */}
        <div className="text-[9px] text-gray-600 mb-6">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="hover:text-gray-300"
          >
            HOME
          </button>

          <span className="mx-2">/</span>

          <span className="text-gray-400">SHOPPING CART</span>
        </div>

        {/* PAGE TITLE */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <h1 className="text-sm uppercase tracking-wide text-gray-300">
            YOUR CART
          </h1>

          <div className="bg-[#1b2028] border border-[#292f38] rounded-full px-4 py-2">
            <span className="text-[9px] text-gray-400 tracking-widest">
              {cartItems.length}{" "}
              {cartItems.length === 1 ? "ITEM" : "ITEMS"} SELECTED
            </span>
          </div>
        </div>

        {/* ERROR MESSAGE */}
        {errorMessage && (
          <div
            role="alert"
            className="mb-5 rounded-lg border border-red-900 bg-red-950/40 px-4 py-3 text-sm text-red-200"
          >
            {errorMessage}
          </div>
        )}

        {/* CART + ORDER SUMMARY */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-5">
          {/* CART ITEMS */}
          <div className="space-y-4">
            {cartItems.map((item) => {
              const product = item.productId;
              const productId = product._id;
              const quantity = Number(item.quantity) || 1;
              const stock = Number(product.stock);

              const isOutOfStock =
                !Number.isFinite(stock) || stock <= 0;

              const isUnavailable = product.isActive === false;

              const unavailable = isOutOfStock || isUnavailable;

              const maxReached =
                quantity >= MAX_QUANTITY ||
                quantity >= stock;

              const isUpdating = updatingProducts.includes(productId);
              const isRemoving = removingProducts.includes(productId);

              const imageUrl = getImageUrl(product.images?.[0]);

              const hasOffer =
                item.offer?.hasOffer === true &&
                Number.isFinite(Number(item.offer.finalPrice));

              const displayPrice = hasOffer
                ? Number(item.offer.finalPrice)
                : Number(product.price) || 0;

              return (
                <div
                  key={productId}
                  className={`relative bg-[#3b465d] rounded-xl p-3 flex flex-col sm:flex-row gap-4 ${
                    unavailable ? "opacity-70" : ""
                  }`}
                >
                  {/* PRODUCT IMAGE */}
                  <button
                    type="button"
                    onClick={() => navigate(`/products/${productId}`)}
                    aria-label={`View ${product.name}`}
                    className="w-full h-40 sm:w-28 sm:h-28 md:w-36 md:h-32 bg-[#171c24] rounded-lg overflow-hidden shrink-0 flex items-center justify-center"
                  >
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={product.name || "Laptop"}
                        className="w-full h-full object-contain"
                        onError={(event) => {
                          event.currentTarget.style.display = "none";
                        }}
                      />
                    ) : (
                      <span className="text-gray-500 text-xs">
                        No Image
                      </span>
                    )}
                  </button>

                  {/* PRODUCT DETAILS */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:justify-between gap-3">
                      <div className="min-w-0">
                        <button
                          type="button"
                          onClick={() =>
                            navigate(`/products/${productId}`)
                          }
                          className="text-left text-sm md:text-base font-medium text-white hover:text-[#ffb2b8]"
                        >
                          {product.name || "Unnamed laptop"}
                        </button>

                        {/* SPEC TAGS */}
                        <div className="flex flex-wrap gap-2 mt-2">
                          {product.specifications?.processor && (
                            <span className="bg-[#171c24] px-2.5 py-1 rounded-full text-[9px] text-gray-400">
                              {product.specifications.processor}
                            </span>
                          )}

                          {product.specifications?.ram && (
                            <span className="bg-[#171c24] px-2.5 py-1 rounded-full text-[9px] text-gray-400">
                              {product.specifications.ram}
                            </span>
                          )}

                          {product.specifications?.storage && (
                            <span className="bg-[#171c24] px-2.5 py-1 rounded-full text-[9px] text-gray-400">
                              {product.specifications.storage}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* PRICE */}
                      <div className="text-left sm:text-right whitespace-nowrap">
                        {hasOffer && (
                          <p className="text-xs text-gray-400 line-through">
                            ₹{formatPrice(item.offer.originalPrice)}
                          </p>
                        )}

                        <p className="text-base font-semibold text-[#ffb2b8]">
                          ₹{formatPrice(displayPrice)}
                        </p>

                        {hasOffer && (
                          <p className="text-[9px] text-green-400 mt-1">
                            {item.offer.offer?.discountType === "PERCENTAGE"
                              ? `${item.offer.offer.discountValue}% OFF`
                              : item.offer.discountAmount != null
                                ? `₹${formatPrice(item.offer.discountAmount)} OFF`
                                : "OFFER APPLIED"}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* STOCK / AVAILABILITY */}
                    {isOutOfStock && (
                      <p className="text-[10px] text-red-300 mt-3 font-medium">
                        OUT OF STOCK
                      </p>
                    )}

                    {isUnavailable && (
                      <p className="text-[10px] text-red-300 mt-2 font-medium">
                        PRODUCT UNAVAILABLE
                      </p>
                    )}

                    {Number.isFinite(stock) &&
                      stock > 0 &&
                      quantity > stock && (
                        <p className="text-[10px] text-orange-300 mt-2">
                          Only {stock} available. Update the quantity or remove this item.
                        </p>
                      )}

                    {/* QUANTITY + REMOVE */}
                    <div className="border-t border-[#525d72] mt-5 pt-3 flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center bg-[#171c24] rounded-full overflow-hidden">
                        <button
                          type="button"
                          aria-label="Decrease quantity"
                          disabled={
                            unavailable ||
                            quantity <= 1 ||
                            isUpdating ||
                            isRemoving
                          }
                          onClick={() =>
                            handleUpdateQuantity(productId, quantity - 1)
                          }
                          className="w-9 h-8 text-gray-300 hover:text-white disabled:opacity-30"
                        >
                          −
                        </button>

                        <span
                          aria-live="polite"
                          className="w-8 text-center text-xs text-gray-200"
                        >
                          {isUpdating ? "…" : quantity}
                        </span>

                        <button
                          type="button"
                          aria-label="Increase quantity"
                          disabled={
                            unavailable ||
                            maxReached ||
                            isUpdating ||
                            isRemoving
                          }
                          onClick={() =>
                            handleUpdateQuantity(productId, quantity + 1)
                          }
                          className="w-9 h-8 text-gray-300 hover:text-white disabled:opacity-30"
                        >
                          +
                        </button>
                      </div>

                      <button
                        type="button"
                        disabled={isRemoving || isUpdating}
                        onClick={() => handleRemove(productId)}
                        className="text-[10px] uppercase tracking-wide text-[#ffb2b8] hover:text-white disabled:opacity-50"
                      >
                        {isRemoving ? "REMOVING..." : "✕ REMOVE"}
                      </button>
                    </div>

                    {quantity >= MAX_QUANTITY && (
                      <p className="text-[9px] text-orange-300 mt-2">
                        Maximum quantity per product is {MAX_QUANTITY}.
                      </p>
                    )}

                    {Number.isFinite(stock) &&
                      stock > 0 &&
                      quantity >= stock && (
                        <p className="text-[9px] text-gray-400 mt-1">
                          You have reached the available stock limit.
                        </p>
                      )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* ORDER SUMMARY */}
          <aside className="bg-[#20252e] rounded-xl p-5 md:p-6 h-fit">
            <h2 className="text-sm font-medium text-gray-200">
              ORDER SUMMARY
            </h2>

            {/* SUBTOTAL */}
            <div className="flex justify-between gap-3 mt-6">
              <span className="text-xs text-gray-400">Subtotal</span>
              <span className="text-xs text-gray-200">
                ₹{formatPrice(subtotal)}
              </span>
            </div>

            {/* DISCOUNT */}
            <div className="flex justify-between gap-3 mt-4">
              <span className="text-xs text-[#ffb2b8]">Discount</span>
              <span className="text-xs text-[#ffb2b8]">
                −₹{formatPrice(discount)}
              </span>
            </div>

            {/* DELIVERY */}
            <div className="flex justify-between gap-3 mt-4">
              <span className="text-xs text-gray-400">Delivery</span>
              <span className="text-xs text-green-300">FREE</span>
            </div>

            {/* TOTAL */}
            <div className="border-t border-[#343b45] mt-6 pt-5">
              <div className="flex justify-between items-end gap-3">
                <div>
                  <p className="text-[9px] text-gray-400 uppercase">
                    Total Amount
                  </p>
                  <p className="text-[9px] text-gray-500 mt-1">
                    Including applicable taxes
                  </p>
                </div>

                <p className="text-xl font-semibold text-[#ffb2b8]">
                  ₹{formatPrice(total)}
                </p>
              </div>
            </div>

            {/* CHECKOUT */}
            <button
              type="button"
              disabled={hasUnavailableProduct}
              onClick={() => navigate("/checkout")}
              className="w-full mt-7 min-h-11 rounded-full bg-[#b51a2b] text-white text-[10px] font-semibold tracking-wide hover:bg-[#c9273c] disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              🔒{" "}
              {hasUnavailableProduct
                ? "REMOVE UNAVAILABLE PRODUCTS"
                : "PROCEED TO CHECKOUT"}
            </button>

            {hasUnavailableProduct && (
              <p className="text-[10px] text-red-300 text-center mt-3 leading-5">
                Remove unavailable or out-of-stock products before checkout.
              </p>
            )}

            <button
              type="button"
              onClick={() => navigate("/products")}
              className="w-full mt-3 py-2 text-xs text-gray-400 hover:text-white transition"
            >
              CONTINUE SHOPPING
            </button>
          </aside>
        </div>
      </main>

     
    </div>
  );
}

export default Cart;