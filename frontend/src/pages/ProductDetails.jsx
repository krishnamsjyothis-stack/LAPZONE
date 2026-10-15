
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api/axios";

function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  // PRODUCT
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [selectedImage, setSelectedImage] = useState(0);
  const [zoom, setZoom] = useState(false);
  const [isHoveringImage, setIsHoveringImage] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // CART
  const [addingToCart, setAddingToCart] = useState(false);
  const [showCartModal, setShowCartModal] = useState(false);
  const [cartMessage, setCartMessage] = useState("");
  const [cartSuccess, setCartSuccess] = useState(false);

  // ALERT
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [alertSuccess, setAlertSuccess] = useState(false);
  const [redirectAfterAlert, setRedirectAfterAlert] = useState(false);

  // REVIEWS
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [reviewsLoading, setReviewsLoading] = useState(true);

  const [rating, setRating] = useState(0);
  const [reviewTitle, setReviewTitle] = useState("");
  const [reviewComment, setReviewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewMessage, setReviewMessage] = useState("");
  const [reviewSuccess, setReviewSuccess] = useState(false);

  // CUSTOM ALERT
  const showCustomAlert = (
    title,
    message,
    success = false,
    redirect = false
  ) => {
    setAlertTitle(title);
    setAlertMessage(message);
    setAlertSuccess(success);
    setRedirectAfterAlert(redirect);
    setShowAlertModal(true);
  };

  const closeAlertModal = () => {
    const shouldRedirect = redirectAfterAlert;
    setShowAlertModal(false);
    setRedirectAfterAlert(false);

    if (shouldRedirect) {
      navigate("/login");
    }
  };

  // FETCH PRODUCT
  useEffect(() => {
    let cancelled = false;

    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get(`/products/${id}`);
        const currentProduct = response.data.product;

        if (!currentProduct || !currentProduct.isActive) {
          navigate("/products");
          return;
        }

        if (cancelled) return;

        setProduct(currentProduct);
        setSelectedImage(0);

        const relatedResponse = await api.get("/products", {
          params: {
            category: currentProduct.category,
            page: 1,
            limit: 5,
          },
        });

        if (cancelled) return;

        const related = (relatedResponse.data.products || []).filter(
          (item) =>
            item._id !== currentProduct._id &&
            item.isActive === true
        );

        setRelatedProducts(related);
      } catch (err) {
        if (cancelled) return;

        console.error("Failed to fetch product:", err);

        if (err.response?.status === 404) {
          navigate("/products");
          return;
        }

        setError(
          err.response?.data?.message || "Failed to load product"
        );
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchProduct();

    return () => {
      cancelled = true;
    };
  }, [id, navigate]);

  // FETCH APPROVED REVIEWS
  useEffect(() => {
    let cancelled = false;

    const fetchReviews = async () => {
      try {
        setReviewsLoading(true);

        const response = await api.get(`/reviews/product/${id}`);

        if (cancelled) return;

        setReviews(response.data.reviews || []);
        setAverageRating(Number(response.data.averageRating) || 0);
        setTotalReviews(Number(response.data.totalReviews) || 0);
      } catch (err) {
        if (cancelled) return;

        console.error(
          "Failed to fetch reviews:",
          err.response?.data || err.message
        );

        setReviews([]);
        setAverageRating(0);
        setTotalReviews(0);
      } finally {
        if (!cancelled) setReviewsLoading(false);
      }
    };

    if (id) fetchReviews();

    return () => {
      cancelled = true;
    };
  }, [id]);

  // ADD TO CART
  const handleAddToCart = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setCartMessage("Please login first to add products to your cart.");
      setCartSuccess(false);
      setShowCartModal(true);
      return;
    }

    try {
      setAddingToCart(true);

      const response = await api.post(
        "/cart",
        { productId: product._id, quantity: 1 },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setCartMessage(
        response.data.message || "Product added to cart successfully."
      );
      setCartSuccess(true);
      setShowCartModal(true);
    } catch (err) {
      console.error("Add to cart error:", err.response?.data || err.message);

      setCartMessage(
        err.response?.data?.message || "Unable to add product to cart."
      );
      setCartSuccess(false);
      setShowCartModal(true);
    } finally {
      setAddingToCart(false);
    }
  };

  // ADD TO WISHLIST
  const handleAddToWishlist = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      showCustomAlert(
        "LOGIN REQUIRED",
        "Please login first to add products to your wishlist.",
        false,
        true
      );
      return;
    }

    try {
      await api.post(
        "/wishlist",
        { productId: product._id },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      showCustomAlert(
        "ADDED TO WISHLIST",
        "Product added to your wishlist successfully.",
        true
      );
    } catch (err) {
      console.error("Add to wishlist error:", err.response?.data || err.message);

      showCustomAlert(
        "UNABLE TO ADD",
        err.response?.data?.message ||
          "Unable to add product to your wishlist.",
        false
      );
    }
  };

  // BUY NOW
  const handleBuyNow = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setCartMessage("Please login first to continue.");
      setCartSuccess(false);
      setShowCartModal(true);
      return;
    }

    try {
      setAddingToCart(true);

      await api.post(
        "/cart",
        { productId: product._id, quantity: 1 },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      navigate("/checkout");
    } catch (err) {
      console.error("Buy now error:", err.response?.data || err.message);

      setCartMessage(
        err.response?.data?.message || "Unable to continue to checkout."
      );
      setCartSuccess(false);
      setShowCartModal(true);
    } finally {
      setAddingToCart(false);
    }
  };

  // SUBMIT REVIEW
  const handleSubmitReview = async (e) => {
    e.preventDefault();
    setReviewMessage("");
    setReviewSuccess(false);

    const token = localStorage.getItem("token");

    if (!token) {
      showCustomAlert(
        "LOGIN REQUIRED",
        "Please login to submit a review.",
        false,
        true
      );
      return;
    }

    if (!rating || rating < 1 || rating > 5) {
      setReviewMessage("Please select a rating from 1 to 5 stars.");
      return;
    }

    if (reviewTitle.trim().length < 3) {
      setReviewMessage("The title must contain at least 3 characters.");
      return;
    }

    if (reviewComment.trim().length < 10) {
      setReviewMessage("The review must contain at least 10 characters.");
      return;
    }

    try {
      setSubmittingReview(true);

      const response = await api.post(
        "/reviews",
        {
          productId: product._id,
          rating,
          title: reviewTitle.trim(),
          comment: reviewComment.trim(),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setReviewMessage(
        response.data.message ||
          "Review submitted. It is awaiting admin approval."
      );
      setReviewSuccess(true);
      setRating(0);
      setReviewTitle("");
      setReviewComment("");
    } catch (err) {
      console.error("Submit review error:", err.response?.data || err.message);

      setReviewMessage(
        err.response?.data?.message ||
          "Unable to submit your review. Please try again."
      );
    } finally {
      setSubmittingReview(false);
    }
  };

  // IMAGE MOUSE MOVE
  const handleImageMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();

    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setMousePosition({ x, y });
  };

  // LOADING
  if (loading) {
    return (
      <div className="min-h-screen bg-[#11161e] text-white flex items-center justify-center">
        <p className="text-gray-400 text-sm">Loading product...</p>
      </div>
    );
  }

  // ERROR
  if (error) {
    return (
      <div className="min-h-screen bg-[#11161e] text-white flex flex-col items-center justify-center">
        <p className="text-red-400 mb-5">{error}</p>
        <button
          type="button"
          onClick={() => navigate("/products")}
          className="px-6 py-2 rounded-md bg-[#ffb2b8] text-[#32161a] text-sm font-medium"
        >
          Back to Products
        </button>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#11161e] text-white flex items-center justify-center">
        <p className="text-gray-400">Product not found</p>
      </div>
    );
  }

  const isOutOfStock = product.stock === 0;

  const currentImage =
    product.images && product.images.length > 0
      ? product.images[selectedImage]
      : null;

  const imageUrl = (image) => {
    if (!image) return "";
    return image.startsWith("http")
      ? image
      : `http://localhost:5000${image}`;
  };

  return (
    <div className="min-h-screen bg-[#11161e] text-white">
      <main className="max-w-7xl mx-auto px-7 py-6">
        {/* BREADCRUMB */}
        <div className="text-[10px] text-gray-600 mb-7">
          <button type="button" onClick={() => navigate("/")} className="hover:text-white">
            Home
          </button>
          <span className="mx-2">/</span>
          <button type="button" onClick={() => navigate("/products")} className="hover:text-white">
            Laptops
          </button>
          <span className="mx-2">/</span>
          <span className="text-gray-400">{product.name}</span>
        </div>

        {/* PRODUCT MAIN SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-10">
          {/* PRODUCT IMAGES */}
          <div>
            <div
              className="relative h-[430px] bg-[#171c24] border border-[#292f38] rounded-xl flex items-center justify-center overflow-hidden"
              onMouseEnter={() => setIsHoveringImage(true)}
              onMouseLeave={() => setIsHoveringImage(false)}
              onMouseMove={handleImageMouseMove}
              onDoubleClick={() => currentImage && setZoom(true)}
              title="Double-click to zoom"
            >
              {currentImage ? (
                <>
                  <img
                    src={imageUrl(currentImage)}
                    alt={product.name}
                    className="w-[90%] h-[90%] object-contain"
                  />
                  {isHoveringImage && (
                    <div
                      className="absolute inset-0 pointer-events-none"
                      style={{
                        backgroundImage: `url("${imageUrl(currentImage)}")`,
                        backgroundRepeat: "no-repeat",
                        backgroundSize: "250%",
                        backgroundPosition: `${mousePosition.x}% ${mousePosition.y}%`,
                      }}
                    />
                  )}
                </>
              ) : (
                <span className="text-gray-600 text-sm">No Image</span>
              )}
            </div>

            {product.images?.length > 0 && (
              <div className="flex gap-3 mt-4 overflow-x-auto pb-2">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setSelectedImage(index)}
                    className={`flex-shrink-0 w-24 h-20 rounded-lg overflow-hidden border ${
                      selectedImage === index
                        ? "border-[#ffb2b8]"
                        : "border-[#292f38]"
                    } bg-[#171c24]`}
                  >
                    <img
                      src={imageUrl(image)}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-contain"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* PRODUCT INFORMATION */}
          <div className="flex flex-col">
            <p className="text-[10px] uppercase tracking-widest text-[#ffb2b8]">
              {product.category}
            </p>
            <p className="text-[10px] text-gray-500 mt-2 uppercase">{product.brand}</p>

            <h1 className="text-3xl md:text-4xl font-semibold text-white mt-2 leading-tight">
              {product.name}
            </h1>

            {/* LIVE RATING */}
            <div className="flex items-center gap-3 mt-4">
              <span className="text-[#ffb2b8] text-sm tracking-wide">
                {"★".repeat(Math.round(averageRating))}
                {"☆".repeat(5 - Math.round(averageRating))}
              </span>
              <span className="text-[10px] text-gray-400">
                {averageRating.toFixed(1)} / 5
              </span>
              <button
                type="button"
                onClick={() =>
                  document.getElementById("product-reviews")?.scrollIntoView({
                    behavior: "smooth",
                  })
                }
                className="text-[10px] text-gray-500 hover:text-[#ffb2b8]"
              >
                ({totalReviews} {totalReviews === 1 ? "Review" : "Reviews"})
              </button>
            </div>

            {product.description && (
              <p className="text-xs leading-6 text-gray-500 mt-5">
                {product.description}
              </p>
            )}

            {/* PRICE */}
            <div className="mt-6">
              {product.offer?.hasOffer ? (
                <>
                  <div className="inline-flex items-center bg-[#b51a2b] text-white text-[10px] font-bold px-3 py-1 rounded-md mb-3">
                    {product.offer.offer.discountType === "PERCENTAGE"
                      ? `${product.offer.offer.discountValue}% OFF`
                      : `₹${product.offer.discountAmount.toLocaleString("en-IN")} OFF`}
                  </div>
                  <p className="text-sm text-gray-500 line-through">
                    ₹{product.offer.originalPrice.toLocaleString("en-IN")}
                  </p>
                  <p className="text-3xl font-bold text-[#ffb2b8]">
                    ₹{product.offer.finalPrice.toLocaleString("en-IN")}
                  </p>
                </>
              ) : (
                <p className="text-3xl font-bold text-[#ffb2b8]">
                  ₹{product.price.toLocaleString("en-IN")}
                </p>
              )}
              <p className="text-[10px] text-gray-600 mt-1">
                Inclusive of applicable taxes
              </p>
            </div>

            {/* STOCK */}
            <div className="mt-5">
              {isOutOfStock ? (
                <span className="inline-flex bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] px-3 py-2 rounded-md">
                  ● OUT OF STOCK
                </span>
              ) : (
                <span className="inline-flex bg-green-500/10 border border-green-500/20 text-green-400 text-[10px] px-3 py-2 rounded-md">
                  ● {product.stock} IN STOCK
                </span>
              )}
            </div>

            {/* CONFIGURATION */}
            <div className="mt-6">
              <p className="text-[10px] text-gray-500 uppercase tracking-wide mb-3">
                Available Configuration
              </p>
              <div className="flex flex-wrap gap-2">
                {product.specifications?.ram && (
                  <span className="border border-[#414955] bg-[#1c222b] text-gray-300 text-[10px] px-3 py-2 rounded-md">
                    {product.specifications.ram}
                  </span>
                )}
                {product.specifications?.storage && (
                  <span className="border border-[#414955] bg-[#1c222b] text-gray-300 text-[10px] px-3 py-2 rounded-md">
                    {product.specifications.storage}
                  </span>
                )}
              </div>
            </div>

            {/* ACTION BUTTONS */}
            <div className="mt-7 flex gap-3">
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={addingToCart || isOutOfStock || !product.isActive}
                className="flex-1 h-11 rounded-md bg-[#ffb2b8] text-[#34161b] text-[10px] font-bold tracking-wide hover:bg-[#ffc4c9] transition disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {isOutOfStock ? "OUT OF STOCK" : addingToCart ? "PLEASE WAIT..." : "ADD TO CART"}
              </button>
              <button
                type="button"
                onClick={handleBuyNow}
                disabled={addingToCart || isOutOfStock || !product.isActive}
                className="flex-1 h-11 rounded-md bg-white text-[#11161e] text-[10px] font-bold tracking-wide hover:bg-gray-200 transition disabled:opacity-40 disabled:cursor-not-allowed"
              >
                BUY NOW
              </button>
              <button
                type="button"
                onClick={handleAddToWishlist}
                className="w-11 h-11 rounded-md border border-[#343b45] bg-[#1b2028] text-gray-400 hover:text-[#ffb2b8] transition text-xl"
                aria-label="Add to wishlist"
              >
                ♡
              </button>
            </div>
          </div>
        </div>

        {/* FEATURE STRIP */}
        <div className="grid grid-cols-2 md:grid-cols-4 border-y border-[#292f38] mt-12">
          {[
            ["↗", "Fast Delivery", "Quick delivery"],
            ["✓", "Genuine Product", "100% authentic"],
            ["↻", "Easy Returns", "Hassle-free returns"],
            ["◉", "Secure Payment", "Secure checkout"],
          ].map(([icon, title, description], index) => (
            <div
              key={title}
              className={`flex items-center gap-3 py-5 px-4 ${
                index % 2 === 0 ? "border-r border-[#292f38]" : ""
              } ${index < 2 ? "md:border-r md:border-[#292f38]" : ""}`}
            >
              <div className="w-8 h-8 rounded-full bg-[#202630] flex items-center justify-center text-[#ffb2b8] text-xs">
                {icon}
              </div>
              <div>
                <p className="text-[10px] font-medium">{title}</p>
                <p className="text-[9px] text-gray-600 mt-1">{description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* PRODUCT HIGHLIGHTS */}
        <section className="mt-12">
          <div className="mb-5">
            <p className="text-[10px] text-[#ffb2b8] uppercase tracking-widest">
              Product Overview
            </p>
            <h2 className="text-xl font-semibold mt-2">Product Highlights</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              ["Processor", product.specifications?.processor],
              ["Memory", product.specifications?.ram],
              ["Storage", product.specifications?.storage],
              ["Display", product.specifications?.display],
            ]
              .filter(([, value]) => value)
              .map(([label, value]) => (
                <div key={label} className="bg-[#1b2028] border border-[#292f38] rounded-lg p-5">
                  <p className="text-[10px] text-gray-600 uppercase">{label}</p>
                  <p className="text-xs text-gray-200 mt-3">{value}</p>
                </div>
              ))}
          </div>
        </section>

        {/* SPECIFICATIONS */}
        <section className="mt-12">
          <p className="text-[10px] text-[#ffb2b8] uppercase tracking-widest">
            Technical Details
          </p>
          <h2 className="text-xl font-semibold mt-2 mb-5">Specifications</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              ["Processor", product.specifications?.processor],
              ["RAM", product.specifications?.ram],
              ["Storage", product.specifications?.storage],
              ["Display", product.specifications?.display],
              ["Graphics", product.specifications?.graphics],
              ["Operating System", product.specifications?.operatingSystem],
            ].map(([label, value]) => (
              <div key={label} className="bg-[#1b2028] border border-[#292f38] rounded-lg p-5 flex justify-between gap-5">
                <span className="text-[10px] text-gray-600">{label}</span>
                <span className="text-[10px] text-gray-300 text-right">{value || "N/A"}</span>
              </div>
            ))}
          </div>
        </section>

        {/* CUSTOMER REVIEWS */}
        <section id="product-reviews" className="mt-14 border-t border-[#292f38] pt-10">
          <p className="text-[10px] text-[#ffb2b8] uppercase tracking-widest">
            Customer Feedback
          </p>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5 mt-2 mb-8">
            <div>
              <h2 className="text-xl font-semibold">Customer Reviews</h2>
              <p className="text-[10px] text-gray-500 mt-2">
                Share your experience with this laptop.
              </p>
            </div>

            <div className="bg-[#1b2028] border border-[#292f38] rounded-xl p-4">
              <p className="text-2xl font-bold text-[#ffb2b8]">
                {averageRating.toFixed(1)}
                <span className="text-sm text-gray-500"> / 5</span>
              </p>
              <p className="text-[#ffb2b8] text-sm mt-1">
                {"★".repeat(Math.round(averageRating))}
                {"☆".repeat(5 - Math.round(averageRating))}
              </p>
              <p className="text-[10px] text-gray-500 mt-1">
                {totalReviews} approved reviews
              </p>
            </div>
          </div>

          {/* REVIEW FORM */}
          <div className="bg-[#1b2028] border border-[#292f38] rounded-xl p-5 md:p-7 mb-8">
            <h3 className="text-sm font-semibold">Write a Review</h3>
            <p className="text-[10px] text-gray-500 mt-2 mb-5">
              Your review will be submitted for admin approval.
            </p>

            <form onSubmit={handleSubmitReview} className="space-y-5">
              <div>
                <label className="block text-[10px] text-gray-400 mb-2">
                  Your Rating
                </label>
                <div className="flex gap-2" role="group" aria-label="Select rating">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      aria-label={`${star} star${star > 1 ? "s" : ""}`}
                      aria-pressed={rating === star}
                      className={`text-2xl transition ${
                        star <= rating
                          ? "text-[#ffb2b8]"
                          : "text-gray-600 hover:text-[#ffb2b8]"
                      }`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label htmlFor="review-title" className="block text-[10px] text-gray-400 mb-2">
                  Review Title
                </label>
                <input
                  id="review-title"
                  type="text"
                  minLength={3}
                  maxLength={100}
                  required
                  value={reviewTitle}
                  onChange={(e) => setReviewTitle(e.target.value)}
                  placeholder="e.g. Excellent laptop for work"
                  className="w-full bg-[#11161e] border border-[#343b45] rounded-lg px-4 py-3 text-sm text-white outline-none focus:border-[#ffb2b8]"
                />
              </div>

              <div>
                <label htmlFor="review-comment" className="block text-[10px] text-gray-400 mb-2">
                  Your Review
                </label>
                <textarea
                  id="review-comment"
                  minLength={10}
                  maxLength={1000}
                  required
                  rows={4}
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Tell other customers about performance, build quality and battery life..."
                  className="w-full bg-[#11161e] border border-[#343b45] rounded-lg px-4 py-3 text-sm text-white outline-none resize-y focus:border-[#ffb2b8]"
                />
                <p className="text-right text-[10px] text-gray-600 mt-1">
                  {reviewComment.length}/1000
                </p>
              </div>

              {reviewMessage && (
                <p
                  role="status"
                  className={`text-xs ${reviewSuccess ? "text-green-400" : "text-red-400"}`}
                >
                  {reviewMessage}
                </p>
              )}

              <button
                type="submit"
                disabled={submittingReview}
                className="rounded-lg bg-[#ffb2b8] text-[#34161b] px-6 py-3 text-xs font-bold disabled:opacity-50"
              >
                {submittingReview ? "SUBMITTING..." : "SUBMIT REVIEW"}
              </button>
            </form>
          </div>

          {/* APPROVED REVIEW LIST */}
          <div className="space-y-4">
            {reviewsLoading ? (
              <p className="text-sm text-gray-500 py-5">Loading reviews...</p>
            ) : reviews.length === 0 ? (
              <div className="text-center py-10 bg-[#171c24] border border-[#292f38] rounded-xl">
                <p className="text-sm text-gray-300">No approved reviews yet</p>
                <p className="text-[10px] text-gray-500 mt-2">
                  Be the first to share your experience.
                </p>
              </div>
            ) : (
              reviews.map((review) => (
                <article key={review._id} className="bg-[#1b2028] border border-[#292f38] rounded-xl p-5">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                    <div>
                      <h3 className="text-sm font-semibold text-white">{review.title}</h3>
                      <p className="text-[10px] text-gray-500 mt-1">
                        By {review.userId?.name || "Customer"}
                      </p>
                    </div>
                    <span className="text-[#ffb2b8] text-sm tracking-wide">
                      {"★".repeat(review.rating)}
                      {"☆".repeat(5 - review.rating)}
                    </span>
                  </div>

                  <p className="text-xs text-gray-400 leading-6 mt-4 whitespace-pre-wrap">
                    {review.comment}
                  </p>

                  <p className="text-[10px] text-gray-600 mt-4">
                    {review.createdAt
                      ? new Date(review.createdAt).toLocaleDateString("en-IN")
                      : ""}
                  </p>
                </article>
              ))
            )}
          </div>
        </section>

        {/* RELATED PRODUCTS */}
        {relatedProducts.length > 0 && (
          <section className="mt-14">
            <div className="flex items-end justify-between mb-5">
              <div>
                <p className="text-[10px] text-[#ffb2b8] uppercase tracking-widest">
                  Similar Products
                </p>
                <h2 className="text-xl font-semibold mt-2">You May Also Like</h2>
              </div>
              <button
                type="button"
                onClick={() => navigate("/products")}
                className="text-[10px] text-gray-500 hover:text-[#ffb2b8]"
              >
                VIEW ALL →
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {relatedProducts.slice(0, 4).map((item) => (
                <div
                  key={item._id}
                  className="bg-[#1b2028] border border-[#292f38] rounded-lg overflow-hidden hover:border-[#454d59] transition cursor-pointer"
                  onClick={() => navigate(`/products/${item._id}`)}
                >
                  <div className="relative h-40 bg-[#151a21] flex items-center justify-center">
                    {item.images?.length > 0 ? (
                      <img
                        src={imageUrl(item.images[0])}
                        alt={item.name}
                        className="w-[85%] h-[85%] object-contain hover:scale-105 transition"
                      />
                    ) : (
                      <span className="text-gray-600 text-[10px]">No Image</span>
                    )}

                    {item.offer?.hasOffer && (
                      <span className="absolute top-2 left-2 bg-[#b51a2b] text-white text-[8px] font-bold px-2 py-1 rounded">
                        {item.offer.offer.discountType === "PERCENTAGE"
                          ? `${item.offer.offer.discountValue}% OFF`
                          : `₹${item.offer.discountAmount.toLocaleString("en-IN")} OFF`}
                      </span>
                    )}

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        showCustomAlert(
                          "WISHLIST",
                          "Open the product page to add this laptop to your wishlist."
                        );
                      }}
                      aria-label="Wishlist information"
                      className="absolute top-2 right-2 w-7 h-7 rounded-full bg-[#252b34] text-gray-400 text-sm"
                    >
                      ♡
                    </button>
                  </div>

                  <div className="p-4">
                    <p className="text-[8px] text-gray-600 uppercase">{item.brand}</p>
                    <h3 className="text-xs text-gray-200 font-medium mt-1 line-clamp-2 min-h-[32px]">
                      {item.name}
                    </h3>

                    <div className="flex items-center gap-2 mt-3">
                      <span className="text-[#ffb2b8] text-[10px]">★★★★★</span>
                      <span className="text-[9px] text-gray-600">Reviews</span>
                    </div>

                    <div className="flex items-center justify-between mt-4">
                      <div>
                        {item.offer?.hasOffer ? (
                          <>
                            <p className="text-[9px] text-gray-500 line-through">
                              ₹{item.offer.originalPrice.toLocaleString("en-IN")}
                            </p>
                            <p className="text-xs font-bold text-[#ffb2b8]">
                              ₹{item.offer.finalPrice.toLocaleString("en-IN")}
                            </p>
                          </>
                        ) : (
                          <p className="text-xs font-bold text-[#ffb2b8]">
                            ₹{item.price.toLocaleString("en-IN")}
                          </p>
                        )}
                      </div>
                      <span className="w-7 h-7 rounded-full bg-[#252b34] flex items-center justify-center text-xs text-gray-400">
                        →
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

     
     

      {/* IMAGE ZOOM MODAL */}
      {zoom && currentImage && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-6"
          onClick={() => setZoom(false)}
        >
          <div
            className="relative max-w-6xl max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={imageUrl(currentImage)}
              alt={product.name}
              className="max-w-full max-h-[85vh] object-contain"
            />
            <button
              type="button"
              onClick={() => setZoom(false)}
              className="absolute -top-4 -right-4 w-9 h-9 rounded-full bg-white text-black font-bold"
              aria-label="Close image zoom"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* CART MODAL */}
      {showCartModal && (
        <div className="fixed inset-0 z-[60] bg-black/70 flex items-center justify-center px-6" role="dialog" aria-modal="true" aria-labelledby="cart-modal-title">
          <div className="w-full max-w-sm bg-[#1b2028] border border-[#343b45] rounded-xl p-7 text-center">
            <div className={`w-12 h-12 mx-auto rounded-full flex items-center justify-center text-lg ${cartSuccess ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"}`}>
              {cartSuccess ? "✓" : "!"}
            </div>
            <h2 id="cart-modal-title" className="text-lg font-semibold mt-4">
              {cartSuccess ? "Added to Cart" : "Something went wrong"}
            </h2>
            <p className="text-xs text-gray-500 mt-3 leading-5">{cartMessage}</p>
            <div className="flex gap-3 mt-6">
              <button type="button" onClick={() => setShowCartModal(false)} className="flex-1 h-10 rounded-md border border-[#343b45] text-gray-300 text-xs">
                CONTINUE
              </button>
              {cartSuccess && (
                <button type="button" onClick={() => navigate("/cart")} className="flex-1 h-10 rounded-md bg-[#ffb2b8] text-[#34161b] text-xs font-semibold">
                  VIEW CART
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* WISHLIST ALERT MODAL */}
      {showAlertModal && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/75 px-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="wishlist-alert-title"
          onClick={closeAlertModal}
        >
          <div
            className="w-full max-w-sm rounded-2xl border border-[#384358] bg-[#202733] p-7 text-center shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className={`mx-auto flex h-14 w-14 items-center justify-center rounded-full border text-2xl ${alertSuccess ? "border-green-500/30 bg-green-500/10 text-green-400" : "border-[#b51a2b]/40 bg-[#b51a2b]/15 text-[#ff5368]"}`}>
              {alertSuccess ? "✓" : "!"}
            </div>
            <h2 id="wishlist-alert-title" className="mt-5 text-lg font-bold tracking-wide text-white">
              {alertTitle}
            </h2>
            <p className="mt-3 text-sm leading-6 text-gray-400">{alertMessage}</p>
            <button
              type="button"
              onClick={closeAlertModal}
              autoFocus
              className="mt-6 w-full rounded-lg bg-[#b51a2b] py-3 text-sm font-semibold tracking-wide text-white transition hover:bg-[#c9273c] focus:outline-none focus:ring-2 focus:ring-[#ff5368] focus:ring-offset-2 focus:ring-offset-[#202733]"
            >
              {redirectAfterAlert ? "LOGIN NOW" : "OK, GOT IT"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProductDetails;
