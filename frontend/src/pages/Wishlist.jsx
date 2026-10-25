
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

const BACKEND_URL =
  import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

function getImageUrl(images) {
  const image = Array.isArray(images) ? images[0] : images;

  if (!image || typeof image !== "string" || !image.trim()) {
    return null;
  }

  const imagePath = image.trim();

  // The image already has a complete URL.
  if (/^https?:\/\//i.test(imagePath)) {
    return imagePath;
  }

  // Convert a backend-relative path into a complete URL.
  return `${BACKEND_URL}/${imagePath.replace(/^\/+/, "")}`;
}

function Wishlist() {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [clearing, setClearing] = useState(false);
  const [removingId, setRemovingId] = useState(null);
  const [addingId, setAddingId] = useState(null);

  const [modal, setModal] = useState({
    open: false,
    type: "success",
    title: "",
    message: "",
    action: null,
    actionText: "OK",
  });

  const showModal = ({
    type = "success",
    title,
    message,
    action = null,
    actionText = "OK",
  }) => {
    setModal({
      open: true,
      type,
      title,
      message,
      action,
      actionText,
    });
  };

  const closeModal = () => {
    setModal((previous) => ({
      ...previous,
      open: false,
    }));
  };

  const getToken = () => localStorage.getItem("token");

  const handleUnauthorized = (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");

      showModal({
        type: "error",
        title: "Session expired",
        message: "Please log in again to access your wishlist.",
        action: () => navigate("/login"),
        actionText: "LOGIN NOW",
      });

      return true;
    }

    return false;
  };

  // FETCH WISHLIST
  const fetchWishlist = useCallback(async () => {
    const token = getToken();

    if (!token) {
      setLoading(false);
      navigate("/login");
      return;
    }

    try {
      setLoading(true);

      const response = await api.get("/wishlist", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setProducts(response.data.wishlist?.products || []);
    } catch (error) {
      console.error(
        "Fetch wishlist error:",
        error.response?.data || error.message
      );

      if (!handleUnauthorized(error)) {
        showModal({
          type: "error",
          title: "Unable to load wishlist",
          message:
            error.response?.data?.message ||
            "Failed to load your wishlist. Please try again.",
          action: fetchWishlist,
          actionText: "TRY AGAIN",
        });
      }
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  // REMOVE ONE PRODUCT
  const handleRemove = async (productId) => {
    if (removingId || clearing || addingId) return;

    const token = getToken();

    if (!token) {
      navigate("/login");
      return;
    }

    try {
      setRemovingId(productId);

      await api.delete(`/wishlist/${productId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setProducts((previous) =>
        previous.filter((product) => product._id !== productId)
      );

      showModal({
        type: "success",
        title: "Removed from wishlist",
        message: "The product has been removed from your wishlist.",
      });
    } catch (error) {
      console.error(
        "Remove wishlist error:",
        error.response?.data || error.message
      );

      if (!handleUnauthorized(error)) {
        showModal({
          type: "error",
          title: "Unable to remove product",
          message:
            error.response?.data?.message ||
            "Failed to remove this product. Please try again.",
        });
      }
    } finally {
      setRemovingId(null);
    }
  };

  // CLEAR WISHLIST
  const handleClearAll = () => {
    if (
      products.length === 0 ||
      clearing ||
      removingId ||
      addingId
    ) {
      return;
    }

    showModal({
      type: "confirm",
      title: "Clear your wishlist?",
      message:
        "Are you sure you want to remove all products from your wishlist? This action cannot be undone.",
      action: confirmClearAll,
      actionText: "YES, CLEAR ALL",
    });
  };

  const confirmClearAll = async () => {
    closeModal();

    const token = getToken();

    if (!token) {
      navigate("/login");
      return;
    }

    try {
      setClearing(true);

      await Promise.all(
        products.map((product) =>
          api.delete(`/wishlist/${product._id}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })
        )
      );

      setProducts([]);

      showModal({
        type: "success",
        title: "Wishlist cleared",
        message: "All products have been removed from your wishlist.",
      });
    } catch (error) {
      console.error(
        "Clear wishlist error:",
        error.response?.data || error.message
      );

      if (!handleUnauthorized(error)) {
        showModal({
          type: "error",
          title: "Unable to clear wishlist",
          message:
            error.response?.data?.message ||
            "Some products may not have been removed. Your wishlist will be refreshed.",
        });

        fetchWishlist();
      }
    } finally {
      setClearing(false);
    }
  };

  // ADD TO CART
  const handleAddToCart = async (product) => {
    if (addingId || removingId || clearing) return;

    const token = getToken();

    if (!token) {
      navigate("/login");
      return;
    }

    if (product.isActive === false) {
      showModal({
        type: "error",
        title: "Product unavailable",
        message: "This product is currently unavailable.",
      });
      return;
    }

    if (Number(product.stock) <= 0) {
      showModal({
        type: "error",
        title: "Out of stock",
        message: "This product is currently out of stock.",
      });
      return;
    }

    try {
      setAddingId(product._id);

      await api.post(
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

      // Remove from wishlist after adding to cart.
      try {
        await api.delete(`/wishlist/${product._id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setProducts((previous) =>
          previous.filter((item) => item._id !== product._id)
        );
      } catch (removeError) {
        console.error(
          "Added to cart, but wishlist removal failed:",
          removeError.response?.data || removeError.message
        );
      }

      showModal({
        type: "success",
        title: "Added to cart!",
        message: `${product.name} has been added to your shopping cart.`,
        action: () => navigate("/cart"),
        actionText: "VIEW CART",
      });
    } catch (error) {
      console.error(
        "Add to cart error:",
        error.response?.data || error.message
      );

      if (!handleUnauthorized(error)) {
        showModal({
          type: "error",
          title: "Unable to add to cart",
          message:
            error.response?.data?.message ||
            "Failed to add this product to your cart. Please try again.",
        });
      }
    } finally {
      setAddingId(null);
    }
  };

  // LOADING
  if (loading) {
    return (
      <div className="min-h-screen bg-[#151820] flex items-center justify-center text-white">
        <p className="text-gray-300 text-lg">
          Loading wishlist...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#151820] text-white">
      <div className="max-w-7xl mx-auto px-5 md:px-8 py-10">
        {/* HEADING */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">
              My Wishlist
            </h1>

            <p className="text-sm text-gray-400 mt-2">
              {products.length}{" "}
              {products.length === 1 ? "product" : "products"} saved
            </p>
          </div>

          {products.length > 0 && (
            <button
              type="button"
              onClick={handleClearAll}
              disabled={clearing || !!removingId || !!addingId}
              className="px-4 py-2.5 rounded-lg border border-[#46536a] bg-[#202632] text-sm text-gray-300 hover:bg-red-900/50 hover:text-white transition disabled:opacity-50"
            >
              {clearing ? "CLEARING..." : "CLEAR WISHLIST"}
            </button>
          )}
        </div>

        {/* EMPTY WISHLIST */}
        {products.length === 0 ? (
          <div className="min-h-[400px] flex items-center justify-center">
            <div className="text-center">
              <div className="text-6xl mb-6 text-[#ff6478]">
                ♡
              </div>

              <h2 className="text-2xl font-bold">
                Your Wishlist is Empty
              </h2>

              <p className="text-gray-400 mt-3">
                Save laptops you love and find them here later.
              </p>

              <button
                type="button"
                onClick={() => navigate("/products")}
                className="mt-6 px-6 py-3 bg-[#b51a2b] rounded-lg font-semibold hover:bg-[#c9273c] transition"
              >
                EXPLORE LAPTOPS
              </button>
            </div>
          </div>
        ) : (
          /* PRODUCT GRID */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {products.map((product) => {
              const outOfStock = Number(product.stock) <= 0;
              const unavailable = product.isActive === false;

              const isBusy =
                clearing ||
                removingId === product._id ||
                addingId === product._id;

              const imageUrl = getImageUrl(product.images);

              return (
                <div
                  key={product._id}
                  className="group bg-[#202936] rounded-xl overflow-hidden border border-[#384358] shadow-lg hover:-translate-y-1 hover:shadow-2xl transition duration-300"
                >
                  {/* IMAGE AND STOCK */}
                  <div className="relative">
                    <span
                      className={`absolute top-3 left-3 z-10 px-2.5 py-1 text-[10px] font-bold rounded-full uppercase ${
                        !outOfStock && !unavailable
                          ? "bg-[#151820] text-gray-200"
                          : "bg-red-900 text-red-200"
                      }`}
                    >
                      {unavailable
                        ? "UNAVAILABLE"
                        : outOfStock
                        ? "OUT OF STOCK"
                        : Number(product.stock) <= 5
                        ? "LOW STOCK"
                        : "IN STOCK"}
                    </span>

                    <button
                      type="button"
                      onClick={() => handleRemove(product._id)}
                      disabled={isBusy}
                      className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-[#151820]/90 flex items-center justify-center text-[#ff6478] hover:bg-[#b51a2b] hover:text-white transition disabled:opacity-50"
                      title="Remove from wishlist"
                      aria-label={`Remove ${product.name} from wishlist`}
                    >
                      {removingId === product._id ? "..." : "♥"}
                    </button>

                    {/* PRODUCT IMAGE */}
                    <button
                      type="button"
                      onClick={() =>
                        navigate(`/products/${product._id}`)
                      }
                      className="w-full h-52 bg-[#151820] flex items-center justify-center p-4 overflow-hidden"
                      aria-label={`View ${product.name}`}
                    >
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={product.name || "Laptop"}
                          loading="lazy"
                          onError={(event) => {
                            console.error(
                              "Wishlist image failed to load:",
                              {
                                product: product.name,
                                storedImage: product.images?.[0],
                                attemptedUrl: event.currentTarget.src,
                              }
                            );

                            event.currentTarget.style.display = "none";
                            event.currentTarget.nextElementSibling?.classList.remove(
                              "hidden"
                            );
                          }}
                          className="w-full h-full object-contain group-hover:scale-105 transition duration-300"
                        />
                      ) : null}

                      <div
                        className={`flex flex-col items-center justify-center text-gray-500 ${
                          imageUrl ? "hidden" : ""
                        }`}
                      >
                        <span className="text-5xl">💻</span>
                        <span className="text-xs mt-2">
                          Image unavailable
                        </span>
                      </div>
                    </button>
                  </div>

                  {/* PRODUCT DETAILS */}
                  <div className="p-4">
                    <h2 className="text-base font-semibold text-white line-clamp-2 min-h-[48px]">
                      {product.name || "Unnamed laptop"}
                    </h2>

                    <p className="text-xs text-gray-400 mt-1">
                      {product.brand || "LAPZONE"}
                    </p>

                    {/* SPECIFICATIONS */}
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {product.specifications?.ram && (
                        <span className="px-2 py-1 bg-[#151820] text-gray-300 text-[9px] rounded">
                          {product.specifications.ram}
                        </span>
                      )}

                      {product.specifications?.storage && (
                        <span className="px-2 py-1 bg-[#151820] text-gray-300 text-[9px] rounded">
                          {product.specifications.storage}
                        </span>
                      )}

                      {product.specifications?.processor && (
                        <span className="px-2 py-1 bg-[#151820] text-gray-300 text-[9px] rounded">
                          {product.specifications.processor}
                        </span>
                      )}
                    </div>

                    {/* PRICE */}
                    <p className="text-xl font-semibold text-white mt-4">
                      ₹{Number(product.price || 0).toLocaleString("en-IN")}
                    </p>

                    {/* ACTION BUTTONS */}
                    <div className="flex gap-2 mt-4">
                      <button
                        type="button"
                        onClick={() => handleAddToCart(product)}
                        disabled={
                          isBusy || outOfStock || unavailable
                        }
                        className="flex-1 py-2.5 bg-[#b51a2b] text-white rounded-lg text-xs font-bold hover:bg-[#c9273c] transition disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        {addingId === product._id
                          ? "ADDING..."
                          : unavailable
                          ? "UNAVAILABLE"
                          : outOfStock
                          ? "OUT OF STOCK"
                          : "ADD TO CART"}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleRemove(product._id)}
                        disabled={isBusy}
                        className="w-11 py-2.5 bg-[#151820] text-gray-300 rounded-lg hover:bg-red-600 hover:text-white transition disabled:opacity-50"
                        title="Remove from wishlist"
                        aria-label={`Delete ${product.name}`}
                      >
                        🗑
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        navigate(`/products/${product._id}`)
                      }
                      className="w-full mt-2 py-2 text-xs text-gray-400 hover:text-white transition"
                    >
                      VIEW PRODUCT →
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* CUSTOM MODAL */}
      {modal.open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4 py-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="wishlist-modal-title"
        >
          <div className="w-full max-w-md bg-[#151820] border border-[#303642] rounded-2xl p-6 sm:p-8 shadow-2xl">
            <div className="flex justify-end">
              <button
                type="button"
                onClick={closeModal}
                aria-label="Close dialog"
                className="text-gray-400 hover:text-white text-2xl leading-none"
              >
                ×
              </button>
            </div>

            <div className="flex justify-center mt-1">
              <div
                className={`w-16 h-16 rounded-full flex items-center justify-center ${
                  modal.type === "error"
                    ? "bg-red-950 text-red-400"
                    : modal.type === "confirm"
                    ? "bg-amber-950 text-amber-400"
                    : "bg-[#451724] text-[#ff6478]"
                }`}
              >
                <span className="text-3xl font-bold">
                  {modal.type === "error"
                    ? "!"
                    : modal.type === "confirm"
                    ? "?"
                    : "✓"}
                </span>
              </div>
            </div>

            <h2
              id="wishlist-modal-title"
              className="text-center text-xl sm:text-2xl font-bold text-white mt-5"
            >
              {modal.title}
            </h2>

            <p className="text-center text-sm text-gray-400 leading-6 mt-3">
              {modal.message}
            </p>

            <div className="flex flex-col sm:flex-row gap-3 mt-7">
              {modal.type === "confirm" && (
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 py-3 rounded-xl bg-[#293241] hover:bg-[#384358] text-gray-200 font-semibold text-sm transition"
                >
                  CANCEL
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  const action = modal.action;
                  closeModal();

                  if (action) {
                    action();
                  }
                }}
                className="flex-1 py-3 rounded-xl bg-[#b51a2b] hover:bg-[#c9273c] text-white font-semibold text-sm transition"
              >
                {modal.actionText}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Wishlist;
