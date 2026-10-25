
import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import api from "../api/axios";

function Products() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Search
  const [search, setSearch] = useState("");

  // Sorting
  const [sort, setSort] = useState("");

  // Filters
  const [category, setCategory] = useState("");
  const [categories, setCategories] = useState([]);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [brand, setBrand] = useState("");
  const [processor, setProcessor] = useState("");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Custom alert modal
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [alertSuccess, setAlertSuccess] = useState(false);
  const [redirectAfterAlert, setRedirectAfterAlert] = useState(false);

  const limit = 6;

  // Read filters from URL
  const urlSearch = searchParams.get("search") || "";
  const urlCategory = searchParams.get("category") || "";
  const urlBrand = searchParams.get("brand") || "";

  // ================================
  // CUSTOM ALERT
  // ================================
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
    setShowAlertModal(false);

    if (redirectAfterAlert) {
      setRedirectAfterAlert(false);
      navigate("/login");
    }
  };

  // ================================
  // ADD TO WISHLIST
  // ================================
  const handleAddToWishlist = async (productId) => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        showCustomAlert(
          "LOGIN REQUIRED",
          "Please login to add products to your wishlist.",
          false,
          true
        );
        return;
      }

      await api.post(
        "/wishlist",
        { productId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      showCustomAlert(
        "WISHLIST UPDATED",
        "Product added to your wishlist ❤️",
        true
      );
    } catch (error) {
      console.error(
        "Add to wishlist error:",
        error.response?.data || error.message
      );

      if (error.response?.status === 401) {
        showCustomAlert(
          "LOGIN REQUIRED",
          "Your session may have expired. Please login to continue.",
          false,
          true
        );
        return;
      }

      showCustomAlert(
        "UNABLE TO UPDATE",
        error.response?.data?.message ||
          "Failed to add product to wishlist. Please try again.",
        false
      );
    }
  };

  // ================================
  // FETCH CATEGORIES
  // ================================
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get("/categories", {
          params: {
            page: 1,
            limit: 100,
          },
        });

        setCategories(response.data.categories || []);
      } catch (error) {
        console.error(
          "Failed to fetch categories:",
          error.response?.data || error.message
        );
      }
    };

    fetchCategories();
  }, []);

  // ================================
  // FETCH PRODUCTS
  // ================================
  const fetchProducts = async (
    searchValue = "",
    page = 1,
    sortValue = "",
    categoryValue = "",
    minPriceValue = "",
    maxPriceValue = "",
    brandValue = "",
    processorValue = ""
  ) => {
    try {
      setLoading(true);
      setError("");

      const params = {
        search: searchValue.trim(),
        page,
        limit,
        sort: sortValue,
      };

      if (categoryValue) params.category = categoryValue;
      if (minPriceValue !== "") params.minPrice = minPriceValue;
      if (maxPriceValue !== "") params.maxPrice = maxPriceValue;
      if (brandValue) params.brand = brandValue;
      if (processorValue) params.processor = processorValue;

      const response = await api.get("/products", { params });

      setProducts(response.data.products || []);
      setCurrentPage(response.data.currentPage || page);
      setTotalPages(response.data.totalPages || 1);
    } catch (error) {
      console.error(
        "Failed to fetch products:",
        error.response?.data || error.message
      );

      setProducts([]);
      setError(
        error.response?.data?.message ||
          "Failed to load products. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // ================================
  // SYNC URL FILTERS WITH STATE
  // ================================
  useEffect(() => {
    setSearch(urlSearch);
    setCategory(urlCategory);
    setBrand(urlBrand);
    setCurrentPage(1);

    fetchProducts(
      urlSearch,
      1,
      sort,
      urlCategory,
      minPrice,
      maxPrice,
      urlBrand,
      processor
    );

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlSearch, urlCategory, urlBrand]);

  // ================================
  // UPDATE URL FILTERS
  // ================================
  const updateUrlFilters = ({
    searchValue = search,
    categoryValue = category,
    brandValue = brand,
  }) => {
    const params = new URLSearchParams(searchParams);

    if (searchValue.trim()) {
      params.set("search", searchValue.trim());
    } else {
      params.delete("search");
    }

    if (categoryValue) {
      params.set("category", categoryValue);
    } else {
      params.delete("category");
    }

    if (brandValue) {
      params.set("brand", brandValue);
    } else {
      params.delete("brand");
    }

    setSearchParams(params);
  };

  // ================================
  // SEARCH
  // ================================
  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);

    updateUrlFilters({ searchValue: search });
  };

  // ================================
  // CLEAR SEARCH
  // ================================
  const handleClear = () => {
    setSearch("");
    setCurrentPage(1);

    updateUrlFilters({ searchValue: "" });
  };

  // ================================
  // CLEAR ALL FILTERS
  // ================================
  const handleClearFilters = () => {
    setSearch("");
    setSort("");
    setCategory("");
    setMinPrice("");
    setMaxPrice("");
    setBrand("");
    setProcessor("");
    setCurrentPage(1);

    setSearchParams({});

    fetchProducts("", 1, "", "", "", "", "", "");
  };

  // ================================
  // SORT
  // ================================
  const handleSortChange = (e) => {
    const value = e.target.value;

    setSort(value);
    setCurrentPage(1);

    fetchProducts(
      search,
      1,
      value,
      category,
      minPrice,
      maxPrice,
      brand,
      processor
    );
  };

  // ================================
  // CATEGORY
  // ================================
  const handleCategoryChange = (e) => {
    const value = e.target.value;

    setCategory(value);
    setCurrentPage(1);

    updateUrlFilters({ categoryValue: value });

    fetchProducts(
      search,
      1,
      sort,
      value,
      minPrice,
      maxPrice,
      brand,
      processor
    );
  };

  // ================================
  // BRAND
  // ================================
  const handleBrandChange = (e) => {
    const value = e.target.value;

    setBrand(value);
    setCurrentPage(1);

    updateUrlFilters({ brandValue: value });

    fetchProducts(
      search,
      1,
      sort,
      category,
      minPrice,
      maxPrice,
      value,
      processor
    );
  };

  // ================================
  // PRICE FILTER
  // ================================
  const handlePriceApply = () => {
    if (
      minPrice !== "" &&
      maxPrice !== "" &&
      Number(minPrice) > Number(maxPrice)
    ) {
      showCustomAlert(
        "INVALID PRICE RANGE",
        "Minimum price cannot be greater than maximum price."
      );
      return;
    }

    if (
      (minPrice !== "" && Number(minPrice) < 0) ||
      (maxPrice !== "" && Number(maxPrice) < 0)
    ) {
      showCustomAlert(
        "INVALID PRICE",
        "Price cannot be negative."
      );
      return;
    }

    setCurrentPage(1);

    fetchProducts(
      search,
      1,
      sort,
      category,
      minPrice,
      maxPrice,
      brand,
      processor
    );
  };

  // ================================
  // PROCESSOR FILTER
  // ================================
  const processorOptions = [
    "Intel Core i5",
    "Intel Core i7",
    "AMD Ryzen 7",
    "AMD Ryzen 9",
    "Apple M3 Max",
  ];

  const handleProcessorChange = (e) => {
    const selectedProcessor = e.target.value;

    // Clicking the selected processor again clears the selection.
    const value =
      selectedProcessor === processor ? "" : selectedProcessor;

    setProcessor(value);
    setCurrentPage(1);

    fetchProducts(
      search,
      1,
      sort,
      category,
      minPrice,
      maxPrice,
      brand,
      value
    );
  };

  // ================================
  // PAGINATION
  // ================================
  const changePage = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return;

    setCurrentPage(newPage);

    fetchProducts(
      search,
      newPage,
      sort,
      category,
      minPrice,
      maxPrice,
      brand,
      processor
    );

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // ================================
  // BRAND OPTIONS
  // ================================
  const knownBrands = [
    "ASUS",
    "Dell",
    "HP",
    "Lenovo",
    "Acer",
    "MSI",
    "Apple",
    "Samsung",
    "Microsoft",
    "LG",
    "Gigabyte",
    "Razer",
  ];

  const brandOptions = [
    ...new Set([
      ...knownBrands,
      ...products.map((product) => product.brand).filter(Boolean),
      ...(brand ? [brand] : []),
    ]),
  ].sort((a, b) => a.localeCompare(b));

  // ================================
  // LOADING
  // ================================
  if (loading) {
    return (
      <div className="min-h-screen bg-[#11161e] text-white flex items-center justify-center">
        <p className="text-gray-400">Loading laptops...</p>
      </div>
    );
  }

  // ================================
  // ERROR
  // ================================
  if (error) {
    return (
      <div className="min-h-screen bg-[#11161e] text-white flex flex-col items-center justify-center gap-4">
        <p className="text-red-400">{error}</p>

        <button
          type="button"
          onClick={() =>
            fetchProducts(
              search,
              currentPage,
              sort,
              category,
              minPrice,
              maxPrice,
              brand,
              processor
            )
          }
          className="rounded-lg bg-[#b51a2b] px-5 py-2 text-sm hover:bg-[#c9273c]"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#11161e] text-white">
      <main className="max-w-7xl mx-auto px-5 md:px-7 py-5">
        {/* BREADCRUMB */}
        <div className="text-[9px] text-gray-500 mb-7">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="hover:text-white"
          >
            Home
          </button>

          <span className="mx-2">/</span>

          <span className="text-gray-300">Laptops</span>

          {brand && (
            <>
              <span className="mx-2">/</span>
              <span className="text-[#ffb2b8]">{brand}</span>
            </>
          )}

          {search && (
            <>
              <span className="mx-2">/</span>
              <span className="text-[#ffb2b8]">
                Search: {search}
              </span>
            </>
          )}
        </div>

        {/* TITLE + SORT */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
          <div>
            <h1 className="text-xl font-semibold">
              {brand
                ? `${brand} Laptops`
                : search
                ? `Search results for "${search}"`
                : "Explore Laptops"}
            </h1>

            <p className="text-[10px] text-gray-500 mt-2">
              {brand
                ? `Explore laptops from ${brand}.`
                : "Find the perfect laptop for work, gaming, study, and creativity."}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <span className="text-[9px] text-gray-500">
              Showing {products.length} Products
            </span>

            <select
              value={sort}
              onChange={handleSortChange}
              aria-label="Sort products"
              className="bg-[#1b2028] border border-[#2b323c] text-gray-300 text-[9px] rounded-md px-3 py-2 outline-none"
            >
              <option value="">Sort By: Popular</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="name-asc">Name: A to Z</option>
              <option value="name-desc">Name: Z to A</option>
            </select>
          </div>
        </div>

        {/* CONTENT */}
        <div className="grid grid-cols-1 lg:grid-cols-[210px_1fr] gap-7">
          {/* FILTER SIDEBAR */}
          <aside className="bg-[#181d25] border border-[#252c35] rounded-lg p-4 h-fit">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-[10px] font-medium">Filters</h2>

              <button
                type="button"
                onClick={handleClearFilters}
                className="text-[8px] text-[#ff9fa7] hover:text-white"
              >
                Clear All
              </button>
            </div>

            {/* SEARCH */}
            <form onSubmit={handleSearch} className="mb-5">
              <label className="text-[8px] text-gray-500 block mb-2">
                SEARCH
              </label>

              <div className="flex bg-[#20252e] border border-[#2b323c] rounded-md overflow-hidden">
                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search laptops..."
                  className="w-full min-w-0 bg-transparent px-3 py-2 text-[9px] text-white outline-none placeholder:text-gray-600"
                />

                {search && (
                  <button
                    type="button"
                    onClick={handleClear}
                    aria-label="Clear search"
                    className="px-2 text-gray-500 hover:text-white"
                  >
                    ×
                  </button>
                )}
              </div>

              <button
                type="submit"
                className="w-full mt-2 bg-[#2b313b] hover:bg-[#353c48] text-gray-300 text-[9px] py-2 rounded-md"
              >
                Search Products
              </button>
            </form>

            {/* CATEGORY */}
            <div className="mb-5">
              <label className="text-[8px] text-gray-500 block mb-2">
                CATEGORY
              </label>

              <select
                value={category}
                onChange={handleCategoryChange}
                className="w-full bg-[#20252e] border border-[#2b323c] rounded-md px-3 py-2 text-[9px] text-gray-300 outline-none"
              >
                <option value="">All Categories</option>

                {categories.map((item) => (
                  <option key={item._id} value={item.name}>
                    {item.name}
                  </option>
                ))}
              </select>
            </div>

            {/* BRAND */}
            <div className="mb-5">
              <label className="text-[8px] text-gray-500 block mb-2">
                BRAND
              </label>

              <select
                value={brand}
                onChange={handleBrandChange}
                className="w-full bg-[#20252e] border border-[#2b323c] rounded-md px-3 py-2 text-[9px] text-gray-300 outline-none"
              >
                <option value="">All Brands</option>

                {brandOptions.map((brandName) => (
                  <option key={brandName} value={brandName}>
                    {brandName}
                  </option>
                ))}
              </select>
            </div>

            {/* PRICE */}
            <div className="mb-5">
              <label className="text-[8px] text-gray-500 block mb-2">
                PRICE RANGE (₹)
              </label>

              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  placeholder="Min"
                  aria-label="Minimum price"
                  className="w-full min-w-0 bg-[#20252e] border border-[#2b323c] rounded-md px-2 py-2 text-[9px] text-white outline-none"
                />

                <span className="text-gray-600 text-[8px]">—</span>

                <input
                  type="number"
                  min="0"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  placeholder="Max"
                  aria-label="Maximum price"
                  className="w-full min-w-0 bg-[#20252e] border border-[#2b323c] rounded-md px-2 py-2 text-[9px] text-white outline-none"
                />
              </div>

              <button
                type="button"
                onClick={handlePriceApply}
                className="w-full mt-2 bg-[#2b313b] text-gray-300 text-[9px] py-2 rounded-md hover:bg-[#353c48]"
              >
                Apply Price
              </button>
            </div>

            {/* PROCESSOR */}
            <div>
              <label className="text-[8px] text-gray-500 block mb-3">
                PROCESSOR
              </label>

              <div className="space-y-2 text-[8px] text-gray-400">
                {processorOptions.map((processorName) => (
                  <label
                    key={processorName}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      value={processorName}
                      checked={processor === processorName}
                      onChange={handleProcessorChange}
                      className="accent-[#ff9fa7]"
                    />
                    {processorName}
                  </label>
                ))}
              </div>

              {processor && (
                <button
                  type="button"
                  onClick={() => {
                    setProcessor("");
                    setCurrentPage(1);

                    fetchProducts(
                      search,
                      1,
                      sort,
                      category,
                      minPrice,
                      maxPrice,
                      brand,
                      ""
                    );
                  }}
                  className="mt-3 text-[8px] text-[#ff9fa7] hover:text-white"
                >
                  Clear processor
                </button>
              )}
            </div>
          </aside>

          {/* PRODUCT RESULTS */}
          <section>
            {products.length === 0 ? (
              <div className="border border-[#292f38] rounded-lg py-16 px-5 text-center">
                <div className="text-3xl text-gray-600 mb-3">⌕</div>

                <h2 className="text-sm font-semibold text-white">
                  {processor
                    ? `No laptops found for ${processor}`
                    : brand
                    ? `No ${brand} laptops found`
                    : search
                    ? "No matching laptops found"
                    : "No products available"}
                </h2>

                <p className="text-xs text-gray-500 mt-2">
                  Try changing your filters or check your product specifications.
                </p>

                {(search ||
                  category ||
                  brand ||
                  minPrice ||
                  maxPrice ||
                  processor) && (
                  <button
                    type="button"
                    onClick={handleClearFilters}
                    className="mt-5 rounded-lg bg-[#b51a2b] px-4 py-2 text-xs font-semibold text-white hover:bg-[#c9273c]"
                  >
                    Clear Search & Filters
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {products.map((product, index) => {
                  const isOutOfStock = product.stock === 0;
                  const image = product.images?.[0];

                  const imageUrl = !image
                    ? ""
                    : image.startsWith("http")
                    ? image
                    : `${import.meta.env.VITE_BACKEND_URL || "http://localhost:5000"}${image}`

                  return (
                    <div
                      key={product._id}
                      className="group bg-[#1b2028] border border-[#292f38] rounded-xl overflow-hidden hover:border-[#454d59] transition cursor-pointer"
                      onClick={() => navigate(`/products/${product._id}`)}
                    >
                      {/* IMAGE */}
                      <div className="relative h-48 bg-[#151a21] flex items-center justify-center overflow-hidden">
                        {index === 0 && currentPage === 1 && !search && (
                          <span className="absolute top-3 left-3 z-10 bg-[#ffb2b8] text-[#35151a] text-[8px] font-semibold px-2 py-1 rounded">
                            Best Seller
                          </span>
                        )}

                        {product.offer?.hasOffer && (
                          <span className="absolute top-2 left-2 z-10 bg-[#b51a2b] text-white text-[10px] font-bold px-2 py-1 rounded">
                            {product.offer.offer?.discountType === "PERCENTAGE"
                              ? `${product.offer.offer.discountValue}% OFF`
                              : `₹${Number(
                                  product.offer.discountAmount || 0
                                ).toLocaleString("en-IN")} OFF`}
                          </span>
                        )}

                        {/* WISHLIST */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAddToWishlist(product._id);
                          }}
                          aria-label={`Add ${product.name} to wishlist`}
                          className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-[#2b313a] border border-[#414853] text-gray-300 text-lg hover:text-[#ffb2b8] hover:border-[#ffb2b8] transition"
                        >
                          ♡
                        </button>

                        {/* PRODUCT IMAGE */}
                        {imageUrl ? (
                          <img
                            src={imageUrl}
                            alt={product.name}
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                            }}
                            className="w-[85%] h-[85%] object-contain group-hover:scale-105 transition duration-300"
                          />
                        ) : (
                          <span className="text-gray-600 text-xs">
                            No Image
                          </span>
                        )}

                        {/* STOCK */}
                        {isOutOfStock && (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <span className="bg-red-500/80 text-white text-[9px] font-semibold px-3 py-1 rounded">
                              OUT OF STOCK
                            </span>
                          </div>
                        )}
                      </div>

                      {/* DETAILS */}
                      <div className="p-4">
                        <p className="text-[8px] text-gray-500 uppercase tracking-wide">
                          {product.brand || "Laptop"}
                        </p>

                        <h2 className="text-[11px] font-semibold text-gray-100 mt-1 line-clamp-2 min-h-[30px]">
                          {product.name}
                        </h2>

                        <p className="text-[8px] text-gray-500 mt-2">
                          {product.category}
                        </p>

                        {/* SPECIFICATIONS */}
                        <div className="flex flex-wrap gap-1.5 mt-3">
                          {product.specifications?.processor && (
                            <span className="bg-[#252b34] text-gray-400 text-[7px] px-2 py-1 rounded">
                              {product.specifications.processor}
                            </span>
                          )}

                          {product.specifications?.ram && (
                            <span className="bg-[#252b34] text-gray-400 text-[7px] px-2 py-1 rounded">
                              {product.specifications.ram}
                            </span>
                          )}

                          {product.specifications?.storage && (
                            <span className="bg-[#252b34] text-gray-400 text-[7px] px-2 py-1 rounded">
                              {product.specifications.storage}
                            </span>
                          )}
                        </div>

                        {/* RATING */}
                        <div className="flex items-center gap-2 mt-3">
                          <span className="text-[#ffb2b8] text-[9px]">
                            ★★★★★
                          </span>

                          <span className="text-gray-600 text-[8px]">
                            0 reviews
                          </span>
                        </div>

                        {/* PRICE + VIEW */}
                        <div className="flex items-end justify-between mt-4">
                          <div>
                            {product.offer?.hasOffer ? (
                              <>
                                <p className="text-[8px] text-gray-600 line-through">
                                  ₹
                                  {Number(
                                    product.offer.originalPrice ??
                                      product.price ??
                                      0
                                  ).toLocaleString("en-IN")}
                                </p>

                                <p className="text-sm font-bold text-[#ffb2b8]">
                                  ₹
                                  {Number(
                                    product.offer.finalPrice ??
                                      product.price ??
                                      0
                                  ).toLocaleString("en-IN")}
                                </p>
                              </>
                            ) : (
                              <p className="text-sm font-bold text-[#ffb2b8]">
                                ₹
                                {Number(product.price || 0).toLocaleString(
                                  "en-IN"
                                )}
                              </p>
                            )}
                          </div>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/products/${product._id}`);
                            }}
                            aria-label={`View ${product.name}`}
                            className="w-8 h-8 rounded-full bg-[#ffb2b8] text-[#34161b] flex items-center justify-center text-xs hover:bg-[#ffc5ca] transition"
                          >
                            →
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* PAGINATION */}
            {products.length > 0 && totalPages > 1 && (
              <div className="flex flex-col items-center mt-9">
                

                <div className="flex items-center gap-4 mt-4 text-[9px] text-gray-500">
                  <button
                    type="button"
                    onClick={() => changePage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="hover:text-white disabled:opacity-30"
                  >
                    ← Previous
                  </button>

                  <span>
                    Page {currentPage} of {totalPages}
                  </span>

                  <button
                    type="button"
                    onClick={() => changePage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="hover:text-white disabled:opacity-30"
                  >
                    Next →
                  </button>
                </div>
              </div>
            )}
          </section>
        </div>
      </main>

  

      {/* CUSTOM ALERT MODAL */}
      {showAlertModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm px-4"
          onClick={closeAlertModal}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="wishlist-alert-title"
            className="w-full max-w-sm bg-[#1b2028] border border-[#343c48] rounded-2xl p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className={`mx-auto mb-4 w-14 h-14 rounded-full flex items-center justify-center text-2xl border ${
                alertSuccess
                  ? "bg-[#ffb2b8]/10 border-[#ffb2b8]/30 text-[#ffb2b8]"
                  : "bg-[#b51a2b]/10 border-[#b51a2b]/40 text-[#ff9fa7]"
              }`}
            >
              {alertSuccess ? "♥" : "!"}
            </div>

            <h2
              id="wishlist-alert-title"
              className="text-center text-sm font-semibold tracking-wider text-white"
            >
              {alertTitle}
            </h2>

            <p className="text-center text-xs text-gray-400 leading-6 mt-3">
              {alertMessage}
            </p>

            <button
              type="button"
              onClick={closeAlertModal}
              className="w-full mt-6 bg-[#ffb2b8] hover:bg-[#ffc5ca] text-[#34161b] font-semibold text-xs py-3 rounded-lg transition"
            >
              {redirectAfterAlert ? "LOGIN NOW" : "OK, GOT IT"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Products;
