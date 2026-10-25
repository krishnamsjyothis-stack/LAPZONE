
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

const BACKEND_URL =
  import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

function getImageUrl(images) {
  if (!images || !images[0]) return null;

  const image = images[0];

  // Support both string URLs and image objects
  const imagePath =
    typeof image === "string"
      ? image
      : image.url || image.path || image.filename;

  if (!imagePath) return null;

  // Already a complete URL
  if (/^https?:\/\//i.test(imagePath)) {
    return imagePath;
  }

  // Relative image path
  return `${BACKEND_URL}/${imagePath.replace(/^\/+/, "")}`;
}

function Checkout() {
  const navigate = useNavigate();

  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [cart, setCart] = useState(null);

  const [loading, setLoading] = useState(true);
  const [cartLoading, setCartLoading] = useState(true);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("COD");

  // Coupon
  const [coupon, setCoupon] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponLoading, setCouponLoading] = useState(false);

  // Wallet
  const [walletBalance, setWalletBalance] = useState(0);

  // Custom alert modal
  const [alertModal, setAlertModal] = useState({
    open: false,
    message: "",
    type: "info",
  });

  const showAlert = (message, type = "info") => {
    setAlertModal({ open: true, message, type });
  };

  const closeAlert = () => {
    setAlertModal({
      open: false,
      message: "",
      type: "info",
    });
  };

  // Fetch addresses
  const fetchAddresses = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      const response = await api.get("/address", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const fetchedAddresses = response.data.addresses || [];

      setAddresses(fetchedAddresses);

      const defaultAddress = fetchedAddresses.find(
        (address) => address.isDefault
      );

      if (defaultAddress) {
        setSelectedAddress(defaultAddress._id);
      } else if (fetchedAddresses.length > 0) {
        setSelectedAddress(fetchedAddresses[0]._id);
      }
    } catch (error) {
      console.error(
        "Failed to fetch addresses:",
        error.response?.data || error.message
      );
    } finally {
      setLoading(false);
    }
  };

  // Fetch cart
  const fetchCart = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

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
      setCartLoading(false);
    }
  };

  // Fetch wallet balance
  const fetchWallet = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) return;

      const response = await api.get("/wallet", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setWalletBalance(response.data.wallet?.balance || 0);
    } catch (error) {
      console.error(
        "Failed to fetch wallet:",
        error.response?.data || error.message
      );
    }
  };

  // Calculate subtotal using the current cart prices
  const subtotal = (cart?.items || []).reduce((total, item) => {
    if (!item.productId) return total;

    const price = item.offer?.hasOffer
      ? Number(item.offer.finalPrice || 0)
      : Number(item.productId.price || 0);

    return total + price * Number(item.quantity || 0);
  }, 0);

  const discount = couponDiscount;
  const delivery = 0;
  const total = Math.max(0, subtotal - discount + delivery);

  // Apply coupon
  const handleApplyCoupon = async () => {
    if (!coupon.trim()) {
      showAlert("Please enter a coupon code.");
      return;
    }

    if (couponApplied) {
      showAlert("A coupon is already applied.");
      return;
    }

    if (!cart?.items?.length) {
      showAlert("Your cart is empty.");
      return;
    }

    try {
      setCouponLoading(true);

      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      const response = await api.post(
        "/coupon/validate",
        {
          code: coupon.trim(),
          orderAmount: subtotal,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setAppliedCoupon(response.data.coupon);
      setCouponDiscount(Number(response.data.discount || 0));
      setCouponApplied(true);
      setCoupon(response.data.coupon.code);

      showAlert(
        `Coupon applied successfully!\n\nYou saved ₹${Number(
          response.data.discount || 0
        ).toLocaleString("en-IN")}`,
        "success"
      );
    } catch (error) {
      console.error(
        "Coupon validation error:",
        error.response?.data || error.message
      );

      showAlert(
        error.response?.data?.message || "Failed to apply coupon."
      );
    } finally {
      setCouponLoading(false);
    }
  };

  // Remove coupon
  const handleRemoveCoupon = () => {
    setCoupon("");
    setCouponApplied(false);
    setAppliedCoupon(null);
    setCouponDiscount(0);
  };

  // Place order
  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      showAlert("Please select a delivery address.");
      return;
    }

    if (!cart?.items?.length) {
      showAlert("Your cart is empty.");
      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    try {
      setPlacingOrder(true);

      // Wallet payment
      if (paymentMethod === "WALLET") {
        if (walletBalance < total) {
          showAlert(
            `Insufficient wallet balance.\n\nWallet Balance: ₹${walletBalance.toLocaleString(
              "en-IN"
            )}\nOrder Total: ₹${total.toLocaleString("en-IN")}`
          );
          return;
        }

        const response = await api.post(
          "/orders",
          {
            addressId: selectedAddress,
            paymentMethod: "WALLET",
            couponCode: appliedCoupon?.code || "",
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        navigate("/order-success", {
          state: { order: response.data.order },
        });

        return;
      }

      // Cash on delivery
      if (paymentMethod === "COD") {
        const response = await api.post(
          "/orders",
          {
            addressId: selectedAddress,
            paymentMethod: "COD",
            couponCode: appliedCoupon?.code || "",
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        navigate("/order-success", {
          state: { order: response.data.order },
        });

        return;
      }

      // Razorpay payment
      if (paymentMethod === "RAZORPAY") {
        if (!window.Razorpay) {
          showAlert(
            "Razorpay could not be loaded. Please refresh and try again."
          );
          return;
        }

        const key = import.meta.env.VITE_RAZORPAY_KEY_ID;

        if (!key) {
          showAlert("Razorpay configuration is missing.");
          return;
        }

        const response = await api.post(
          "/payment/create-order",
          {
            couponCode: appliedCoupon?.code || "",
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const razorpayOrder = response.data.order;

        if (!razorpayOrder?.id) {
          showAlert("Failed to create Razorpay payment order.");
          return;
        }

        const razorpay = new window.Razorpay({
          key,
          amount: razorpayOrder.amount,
          currency: razorpayOrder.currency,
          name: "LAPZONE",
          description: "Laptop Purchase",
          order_id: razorpayOrder.id,
          theme: {
            color: "#b51a2b",
          },

          handler: async (paymentResponse) => {
            try {
              showAlert("Payment successful! Verifying payment...");

              const verifyResponse = await api.post(
                "/payment/verify",
                {
                  razorpay_order_id:
                    paymentResponse.razorpay_order_id,
                  razorpay_payment_id:
                    paymentResponse.razorpay_payment_id,
                  razorpay_signature:
                    paymentResponse.razorpay_signature,
                  addressId: selectedAddress,
                  couponCode: appliedCoupon?.code || "",
                },
                {
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                }
              );

              if (verifyResponse.data.verified) {
                navigate("/order-success", {
                  state: {
                    order: verifyResponse.data.order,
                    payment: paymentResponse,
                  },
                });
              } else {
                navigate("/payment-failed", {
                  state: {
                    errorMessage: "Payment verification failed.",
                  },
                });
              }
            } catch (error) {
              console.error(
                "Payment verification error:",
                error.response?.data || error.message
              );

              navigate("/payment-failed", {
                state: {
                  errorMessage:
                    error.response?.data?.message ||
                    "Payment verification failed. Please try again.",
                },
              });
            } finally {
              setPlacingOrder(false);
            }
          },

          modal: {
            ondismiss: () => {
              setPlacingOrder(false);
              navigate("/payment-failed", {
                state: {
                  errorMessage:
                    "Payment was cancelled or the payment window was closed.",
                },
              });
            },
          },
        });

        razorpay.on("payment.failed", (paymentFailure) => {
          const message =
            paymentFailure.error?.description ||
            "Payment failed. Please try again.";

          setPlacingOrder(false);
          razorpay.close();

          navigate("/payment-failed", {
            state: { errorMessage: message },
          });
        });

        razorpay.open();
        return;
      }
    } catch (error) {
      console.error(
        "Place order error:",
        error.response?.data || error.message
      );

      showAlert(
        error.response?.data?.message ||
          "Failed to process your order. Please try again."
      );
    } finally {
      setPlacingOrder(false);
    }
  };

  // Fetch data
  useEffect(() => {
    fetchAddresses();
    fetchCart();
    fetchWallet();
  }, []);

  // Loading
  if (loading || cartLoading) {
    return (
      <div className="min-h-screen bg-[#202936] flex items-center justify-center">
        <p className="text-white font-semibold">Loading checkout...</p>
      </div>
    );
  }

  // Empty cart
  if (!cart?.items?.length) {
    return (
      <div className="min-h-screen bg-[#202936] flex items-center justify-center px-6">
        <div className="text-center bg-[#2d3747] p-10 rounded-xl">
          <div className="text-5xl mb-5">🛒</div>

          <h1 className="text-2xl font-bold text-white">
            Your cart is empty
          </h1>

          <p className="text-gray-300 mt-2">
            Add some laptops before proceeding to checkout.
          </p>

          <button
            type="button"
            onClick={() => navigate("/products")}
            className="mt-6 px-6 py-3 bg-[#b51a2b] text-white rounded-lg font-semibold hover:bg-[#c9273c] transition"
          >
            CONTINUE SHOPPING
          </button>
        </div>
      </div>
    );
  }

  const selectedAddressData = addresses.find(
    (address) => address._id === selectedAddress
  );

  const paymentOptions = [
    {
      id: "RAZORPAY",
      title: "ONLINE PAYMENT",
      description: "UPI, Card, Net Banking",
      icon: "▣",
    },
    {
      id: "WALLET",
      title: "WALLET",
      description: `Balance: ₹${walletBalance.toLocaleString("en-IN")}`,
      icon: "▣",
    },
    {
      id: "COD",
      title: "COD",
      description: "Pay cash for this amount",
      icon: "▣",
    },
  ];

  return (
    <div className="min-h-screen bg-[#202936] text-white px-4 md:px-8 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Checkout</h1>
          <p className="text-gray-400 mt-2">
            Complete your order securely.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left side */}
          <div className="lg:col-span-2 space-y-6">
            {/* Delivery address */}
            <section className="bg-[#293444] border border-[#414d5e] rounded-lg p-5">
              <h2 className="font-bold text-lg mb-5">
                <span className="text-[#b51a2b]">▣</span>{" "}
                Delivery Address
              </h2>

              {addresses.length === 0 ? (
                <div className="border border-dashed border-gray-500 rounded-lg p-6 text-center">
                  <p className="text-gray-400">
                    You don't have any saved addresses.
                  </p>

                  <button
                    type="button"
                    onClick={() => navigate("/addresses")}
                    className="mt-4 px-5 py-2 bg-[#b51a2b] rounded-md font-semibold text-sm"
                  >
                    ADD ADDRESS
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {addresses.map((address) => (
                    <button
                      type="button"
                      key={address._id}
                      onClick={() => setSelectedAddress(address._id)}
                      className={`w-full text-left border rounded-lg p-4 transition ${
                        selectedAddress === address._id
                          ? "border-[#b51a2b] bg-[#343e4e]"
                          : "border-[#4b5667] bg-[#293444]"
                      }`}
                    >
                      <div className="flex justify-between gap-4">
                        <div>
                          <p className="font-semibold">
                            {address.fullName}
                          </p>

                          <p className="text-sm text-gray-400 mt-1">
                            {address.addressLine}
                          </p>

                          <p className="text-sm text-gray-400">
                            {address.city}, {address.state} -{" "}
                            {address.pincode}
                          </p>

                          <p className="text-sm text-gray-400 mt-1">
                            Phone: {address.phone}
                          </p>
                        </div>

                        <div
                          className={`w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 ${
                            selectedAddress === address._id
                              ? "border-[#b51a2b]"
                              : "border-gray-500"
                          }`}
                        >
                          {selectedAddress === address._id && (
                            <div className="w-2.5 h-2.5 rounded-full bg-[#b51a2b]" />
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </section>

            {/* Products */}
            <section className="bg-[#293444] border border-[#414d5e] rounded-lg p-5">
              <h2 className="font-bold text-lg mb-5">
                <span className="text-[#b51a2b]">▣</span>{" "}
                Your Products
              </h2>

              <div className="space-y-4">
                {cart.items.map((item, index) => {
                  if (!item.productId) return null;

                  const product = item.productId;
                  const imageUrl = getImageUrl(product.images);

                  const unitPrice = item.offer?.hasOffer
                    ? Number(item.offer.finalPrice || 0)
                    : Number(product.price || 0);

                  return (
                    <div
                      key={item._id || index}
                      className="flex items-center gap-4 border-b border-[#414d5e] pb-4 last:border-b-0 last:pb-0"
                    >
                      {/* Product image */}
                      <div className="w-20 h-20 rounded-lg bg-[#202936] flex items-center justify-center overflow-hidden flex-shrink-0">
                        {imageUrl ? (
                          <img
                            src={imageUrl}
                            alt={product.name || "Laptop"}
                            className="w-full h-full object-contain"
                            loading="eager"
                            onError={(event) => {
                              console.error(
                                "Laptop image failed to load:",
                                event.currentTarget.src
                              );

                              event.currentTarget.style.display = "none";

                              const fallback =
                                event.currentTarget.parentElement?.querySelector(
                                  ".image-fallback"
                                );

                              if (fallback) {
                                fallback.style.display = "flex";
                              }
                            }}
                          />
                        ) : null}

                        <div
                          className="image-fallback w-full h-full items-center justify-center text-3xl"
                          style={{ display: imageUrl ? "none" : "flex" }}
                        >
                          💻
                        </div>
                      </div>

                      {/* Product details */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold break-words">
                          {product.name}
                        </h3>

                        <p className="text-sm text-gray-400 mt-1">
                          Quantity: {item.quantity}
                        </p>

                        <p className="text-sm text-gray-400 mt-1">
                          {item.offer?.hasOffer ? (
                            <>
                              <span className="line-through text-gray-500 mr-2">
                                ₹
                                {Number(
                                  item.offer.originalPrice || 0
                                ).toLocaleString("en-IN")}
                              </span>

                              <span className="text-green-400">
                                ₹
                                {Number(
                                  item.offer.finalPrice || 0
                                ).toLocaleString("en-IN")}
                              </span>

                              <span className="text-green-400 ml-2">
                                {item.offer.offer?.discountType ===
                                "PERCENTAGE"
                                  ? `${item.offer.offer.discountValue}% OFF`
                                  : `₹${Number(
                                      item.offer.discountAmount || 0
                                    ).toLocaleString("en-IN")} OFF`}
                              </span>
                            </>
                          ) : (
                            <>
                              ₹
                              {Number(
                                product.price || 0
                              ).toLocaleString("en-IN")}
                            </>
                          )}{" "}
                          each
                        </p>
                      </div>

                      {/* Item total */}
                      <div className="font-bold text-[#b51a2b] whitespace-nowrap">
                        ₹
                        {(unitPrice * Number(item.quantity || 0)).toLocaleString(
                          "en-IN"
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Payment method */}
            <section className="bg-[#293444] border border-[#414d5e] rounded-lg p-5">
              <h2 className="font-bold text-lg mb-5">
                <span className="text-[#b51a2b]">▣</span>{" "}
                Payment Method
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {paymentOptions.map((option) => {
                  const selected = paymentMethod === option.id;

                  return (
                    <button
                      type="button"
                      key={option.id}
                      onClick={() => setPaymentMethod(option.id)}
                      className={`text-left border rounded-lg p-4 transition ${
                        selected
                          ? "border-[#b51a2b] bg-[#343e4e]"
                          : "border-[#4b5667] bg-[#293444] hover:border-gray-400"
                      }`}
                    >
                      <div className="flex justify-between gap-3">
                        <div className="flex gap-3">
                          <span className="text-sm">{option.icon}</span>

                          <div>
                            <p className="font-semibold text-sm">
                              {option.title}
                            </p>

                            <p className="text-xs text-gray-400 mt-1">
                              {option.description}
                            </p>
                          </div>
                        </div>

                        <span
                          className={`w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0 ${
                            selected
                              ? "border-[#b51a2b]"
                              : "border-gray-500"
                          }`}
                        >
                          {selected && (
                            <span className="w-2 h-2 bg-[#b51a2b] rounded-full" />
                          )}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>

              <p className="text-xs text-gray-500 mt-4">
                Online payment is powered by Razorpay. Wallet payment uses
                your LAPZONE wallet balance.
              </p>
            </section>
          </div>

          {/* Right side: order summary */}
          <aside className="lg:sticky lg:top-5 h-fit">
            <div className="bg-[#293444] border border-[#414d5e] rounded-lg p-5">
              <h2 className="font-bold text-lg">Order Summary</h2>

              <div className="flex justify-between mt-6 text-sm">
                <span className="text-gray-400">Subtotal</span>
                <span>₹{subtotal.toLocaleString("en-IN")}</span>
              </div>

              <div className="flex justify-between mt-4 text-sm">
                <span className="text-gray-400">Delivery</span>
                <span className="text-green-400 font-semibold">FREE</span>
              </div>

              {/* Coupon */}
              <div className="mt-5">
                <p className="text-sm text-gray-400 mb-2">Coupon</p>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={coupon}
                    onChange={(event) => setCoupon(event.target.value)}
                    placeholder="Enter coupon"
                    disabled={couponApplied || couponLoading}
                    className="min-w-0 flex-1 px-3 py-2 bg-[#202936] border border-[#4b5667] rounded-md outline-none text-sm"
                  />

                  {!couponApplied ? (
                    <button
                      type="button"
                      onClick={handleApplyCoupon}
                      disabled={couponLoading}
                      className="px-4 py-2 bg-[#384358] rounded-md text-sm font-semibold disabled:opacity-40"
                    >
                      {couponLoading ? "CHECKING..." : "APPLY"}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleRemoveCoupon}
                      className="px-4 py-2 bg-gray-600 rounded-md text-sm font-semibold"
                    >
                      REMOVE
                    </button>
                  )}
                </div>

                {couponApplied && appliedCoupon && (
                  <p className="text-xs text-green-400 mt-2">
                    ✓ {appliedCoupon.code} applied successfully
                  </p>
                )}
              </div>

              <div className="flex justify-between mt-4 text-sm">
                <span className="text-gray-400">Coupon Discount</span>
                <span className="text-[#b51a2b]">
                  -₹{discount.toLocaleString("en-IN")}
                </span>
              </div>

              {/* Total */}
              <div className="border-t border-[#485365] mt-6 pt-5">
                <div className="flex justify-between items-center gap-3">
                  <span className="font-bold">TOTAL</span>

                  <span className="text-2xl font-extrabold">
                    ₹{total.toLocaleString("en-IN")}
                  </span>
                </div>

                <p className="text-xs text-gray-500 text-right mt-1">
                  Inclusive of all applicable charges
                </p>
              </div>

              {/* Selected address */}
              {selectedAddressData && (
                <div className="mt-5 bg-[#232c39] border border-[#424e60] rounded-lg p-3">
                  <p className="text-xs uppercase text-gray-500 font-bold">
                    Delivery To
                  </p>

                  <p className="text-sm font-semibold mt-2">
                    {selectedAddressData.fullName}
                  </p>

                  <p className="text-xs text-gray-400 mt-1">
                    {selectedAddressData.addressLine},{" "}
                    {selectedAddressData.city}
                  </p>

                  <p className="text-xs text-gray-400">
                    {selectedAddressData.state} -{" "}
                    {selectedAddressData.pincode}
                  </p>
                </div>
              )}

              {/* Place order */}
              <button
                type="button"
                onClick={handlePlaceOrder}
                disabled={
                  !selectedAddress ||
                  addresses.length === 0 ||
                  placingOrder
                }
                className="w-full mt-5 py-3 bg-[#b51a2b] text-white rounded-md font-bold text-sm hover:bg-[#c9273c] transition disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {placingOrder ? "PROCESSING..." : "PLACE ORDER →"}
              </button>

              <p className="text-center text-xs text-gray-500 mt-3">
                🔒 Secure payment • Your data is protected
              </p>

              <p className="text-center text-xs text-gray-600 mt-2">
                Encrypted Checkout
              </p>
            </div>

            {/* Checkout features */}
            <div className="grid grid-cols-3 gap-2 mt-4">
              <div className="text-center">
                <div className="w-8 h-8 mx-auto rounded-full bg-[#303b4a] flex items-center justify-center text-[#b51a2b]">
                  🔒
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  Secure Payment
                </p>
              </div>

              <div className="text-center">
                <div className="w-8 h-8 mx-auto rounded-full bg-[#303b4a] flex items-center justify-center text-[#b51a2b]">
                  🚚
                </div>
                <p className="text-xs text-gray-400 mt-2">Fast Delivery</p>
              </div>

              <div className="text-center">
                <div className="w-8 h-8 mx-auto rounded-full bg-[#303b4a] flex items-center justify-center text-[#b51a2b]">
                  ↩
                </div>
                <p className="text-xs text-gray-400 mt-2">Easy Returns</p>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Custom alert modal */}
      {alertModal.open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="checkout-alert-title"
            className="w-full max-w-md rounded-2xl border border-[#414d5e] bg-[#151b25] p-6 text-white shadow-2xl"
          >
            <div className="mb-4 flex items-center gap-3">
              <div
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${
                  alertModal.type === "success"
                    ? "bg-emerald-500/15 text-emerald-400"
                    : "bg-[#b51a2b]/15 text-[#ff6479]"
                }`}
              >
                <span className="text-xl font-bold">
                  {alertModal.type === "success" ? "✓" : "!"}
                </span>
              </div>

              <h2
                id="checkout-alert-title"
                className="text-lg font-semibold"
              >
                {alertModal.type === "success" ? "SUCCESS" : "NOTICE"}
              </h2>
            </div>

            <p className="whitespace-pre-line text-sm leading-6 text-gray-300">
              {alertModal.message}
            </p>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={closeAlert}
                className="rounded-lg bg-[#b51a2b] px-5 py-2.5 font-semibold text-white transition hover:bg-[#951626] focus:outline-none focus:ring-2 focus:ring-[#ff6479]"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Checkout;
