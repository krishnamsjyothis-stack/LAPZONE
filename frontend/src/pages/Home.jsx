
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

const Home = () => {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [productError, setProductError] = useState("");

  // FETCH PRODUCTS
  const fetchProducts = useCallback(async () => {
    try {
      setLoadingProducts(true);
      setProductError("");

      const response = await api.get("/products");
      const data = response.data;

      const productList = Array.isArray(data)
        ? data
        : Array.isArray(data?.products)
          ? data.products
          : Array.isArray(data?.data?.products)
            ? data.data.products
            : [];

      setProducts(productList);
    } catch (error) {
      console.error(
        "Home products error:",
        error.response?.data || error.message
      );

      setProductError(
        error.response?.data?.message ||
          "Unable to load products. Please try again."
      );
    } finally {
      setLoadingProducts(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // NAVIGATION
  const openProducts = (params = {}) => {
    const query = new URLSearchParams(params).toString();
    navigate(query ? `/products?${query}` : "/products");
  };

  const openProduct = (product) => {
    if (!product?._id) return;
    navigate(`/products/${product._id}`);
  };

  // IMAGE URL
  const getImageUrl = (image) => {
    if (!image || typeof image !== "string") return null;

    if (/^https?:\/\//i.test(image)) return image;

    const baseURL = (
     api.defaults?.baseURL ||
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000/api"
    ).replace(/\/+$/, "");

    const serverURL = baseURL.replace(/\/api$/i, "");
    const imagePath = image.startsWith("/") ? image : `/${image}`;

    return `${serverURL}${imagePath}`;
  };

  const handleImageError = (event) => {
    event.currentTarget.onerror = null;
    event.currentTarget.src =
      "https://placehold.co/600x400/202936/ffffff?text=LAPZONE";
  };

  // CATEGORIES
 const categories = [
  {
    title: "Gaming",
    subtitle: "High performance",
    value: "Gaming",
    image:
      "https://images.unsplash.com/photo-1593640495253-23196b27a87f?w=800",
  },
  {
    title: "Business",
    subtitle: "Work smarter",
    value: "Business",
    image:
      "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800",
  },
  {
    title: "Student",
    subtitle: "Powerful, simple, reliable",
    value: "Student",
    image:
      "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800",
  },
  {
    title: "Premium",
    subtitle: "Premium performance",
    value: "Premium",
    image:
      "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=800",
  },
];

  const brands = [
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

  const featuredProducts = products.slice(0, 5);

  // REUSABLE SECTION LABEL
  const SectionLabel = ({ children }) => (
    <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.22em] text-[#c51f35]">
      {children}
    </p>
  );

  return (
    <div className="min-h-screen overflow-x-clip bg-[#151820] text-gray-200">
      {/* HERO */}
      <section className="relative isolate overflow-hidden">
        <div className="pointer-events-none absolute -right-24 top-10 h-80 w-80 rounded-full bg-[#c51f35]/10 blur-3xl" />

        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
          <div className="grid min-h-[520px] items-center gap-10 py-12 sm:py-16 lg:grid-cols-2 lg:gap-8 lg:py-14">
            <div className="relative z-10">
              <SectionLabel>Welcome to LAPZONE</SectionLabel>

              <h1 className="text-4xl font-extrabold leading-[1.08] tracking-tight text-white sm:text-5xl md:text-6xl xl:text-7xl">
                POWER YOUR
                <span className="mt-2 block text-[#c51f35]">
                  PERFORMANCE
                </span>
              </h1>

              <p className="mt-6 max-w-lg text-sm leading-7 text-gray-400 sm:text-base">
                Discover powerful laptops built for gaming,
                business, creativity, and everyday performance.
                Find the right laptop for your needs at LAPZONE.
              </p>

              {/* STORE BENEFITS */}
              <div className="mt-10 grid grid-cols-1 gap-5 border-t border-[#384358]/60 pt-6 sm:grid-cols-3 sm:gap-4">
                <div className="flex items-start gap-3">
                  <span className="text-lg text-[#c51f35]" aria-hidden="true">
                    ◈
                  </span>
                  <div>
                    <p className="text-xs font-semibold text-gray-200">
                      Secure Payments
                    </p>
                    <p className="mt-1 text-[10px] leading-4 text-gray-500">
                      Secure checkout
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="text-lg text-[#c51f35]" aria-hidden="true">
                    ↗
                  </span>
                  <div>
                    <p className="text-xs font-semibold text-gray-200">
                      Delivery Across India
                    </p>
                    <p className="mt-1 text-[10px] leading-4 text-gray-500">
                      India-only shipping
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="text-lg text-[#c51f35]" aria-hidden="true">
                    ✓
                  </span>
                  <div>
                    <p className="text-xs font-semibold text-gray-200">
                      Customer Support
                    </p>
                    <p className="mt-1 text-[10px] leading-4 text-gray-500">
                      Help when you need it
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* HERO IMAGE */}
            <div className="relative flex min-h-[280px] items-center justify-center sm:min-h-[380px] lg:min-h-[440px]">
              <div className="pointer-events-none absolute h-64 w-64 rounded-full bg-[#c51f35]/15 blur-3xl sm:h-96 sm:w-96" />

              <img
                src="https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=1200"
                alt="Laptop for work, gaming, and performance"
                onError={handleImageError}
                className="relative z-10 max-h-[440px] w-full max-w-xl rounded-xl border border-[#384358]/60 object-cover shadow-2xl"
              />

              <div className="absolute bottom-3 left-2 z-20 rounded-lg border border-[#384358] bg-[#202936]/95 px-4 py-3 shadow-lg sm:bottom-6 sm:left-0">
                <p className="text-[9px] uppercase tracking-widest text-gray-400">
                  Discover your next
                </p>
                <p className="mt-1 text-sm font-bold text-white">
                  Performance Laptop
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TRUSTED BRANDS */}
      <section className="border-y border-[#384358]/50 bg-[#20242d]">
        <div className="mx-auto max-w-7xl px-5 py-8 sm:px-6 lg:px-8">
          <SectionLabel>Trusted Brands</SectionLabel>

          <p className="mb-5 text-xs text-gray-500">
            Explore laptops from popular technology brands.
          </p>

          <div className="grid grid-cols-3 items-center gap-2 sm:grid-cols-4 sm:gap-3 md:grid-cols-6">
            {brands.map((brand) => (
              <button
                key={brand}
                type="button"
                onClick={() => openProducts({ brand })}
                aria-label={`View ${brand} laptops`}
                className="rounded-md border border-transparent px-2 py-3 text-sm font-bold text-gray-400 transition hover:border-[#384358] hover:bg-[#29313d] hover:text-white focus:outline-none focus:ring-2 focus:ring-[#c51f35]"
              >
                {brand}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED PRODUCTS */}
      <section className="mx-auto max-w-7xl px-5 py-14 sm:px-6 lg:px-8 lg:py-16">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <SectionLabel>Featured Products</SectionLabel>
            <h2 className="text-xl font-bold text-white sm:text-2xl">
              Handpicked laptops for every need
            </h2>
            <p className="mt-2 text-xs text-gray-500 sm:text-sm">
              Explore laptops selected for performance and value.
            </p>
          </div>

          <button
            type="button"
            onClick={() => openProducts()}
            className="shrink-0 text-xs font-semibold text-[#e04a5e] transition hover:text-white"
          >
            View All <span aria-hidden="true">→</span>
          </button>
        </div>

        {/* LOADING */}
        {loadingProducts && (
          <div
            className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5"
            aria-label="Loading products"
          >
            {Array.from({ length: 5 }).map((_, index) => (
              <div
                key={index}
                className="animate-pulse overflow-hidden rounded-lg border border-[#384358]/50 bg-[#20242d]"
              >
                <div className="h-44 bg-[#29313d]" />
                <div className="space-y-3 p-4">
                  <div className="h-3 w-1/3 rounded bg-[#384358]" />
                  <div className="h-4 w-4/5 rounded bg-[#384358]" />
                  <div className="h-5 w-1/2 rounded bg-[#384358]" />
                  <div className="h-9 rounded bg-[#384358]" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ERROR */}
        {!loadingProducts && productError && (
          <div className="rounded-lg border border-red-900/70 bg-red-950/20 px-5 py-12 text-center">
            <p className="font-semibold text-red-300">
              Could not load products
            </p>
            <p className="mx-auto mt-2 max-w-lg text-sm text-gray-400">
              {productError}
            </p>
            <button
              type="button"
              onClick={fetchProducts}
              className="mt-5 rounded-md bg-[#c51f35] px-5 py-2.5 text-xs font-bold text-white transition hover:bg-[#a9182b]"
            >
              TRY AGAIN
            </button>
          </div>
        )}

        {/* EMPTY */}
        {!loadingProducts &&
          !productError &&
          featuredProducts.length === 0 && (
            <div className="rounded-lg border border-[#384358]/50 bg-[#20242d] px-5 py-12 text-center">
              <p className="font-semibold text-white">
                No products available yet
              </p>
              <p className="mt-2 text-sm text-gray-500">
                Please check back later.
              </p>
              <button
                type="button"
                onClick={() => openProducts()}
                className="mt-5 rounded-md border border-[#384358] px-5 py-2.5 text-xs text-white transition hover:border-[#c51f35]"
              >
                Browse All Laptops
              </button>
            </div>
          )}

        {/* PRODUCT GRID */}
        {!loadingProducts &&
          !productError &&
          featuredProducts.length > 0 && (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
              {featuredProducts.map((product) => {
                const image = getImageUrl(product.images?.[0]);
                const price = Number(
                  product.offer?.finalPrice ?? product.price
                );
                const originalPrice = Number(product.price);
                const hasOffer = Boolean(product.offer?.hasOffer);

                return (
                  <article
                    key={product._id}
                    className="group flex min-w-0 flex-col overflow-hidden rounded-lg border border-[#384358]/50 bg-[#20242d] transition duration-300 hover:-translate-y-1 hover:border-[#c51f35]/70 hover:shadow-xl hover:shadow-black/20"
                  >
                    <button
                      type="button"
                      onClick={() => openProduct(product)}
                      className="relative block h-48 overflow-hidden bg-[#191e27] p-3 text-left focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#c51f35]"
                      aria-label={`View ${product.name}`}
                    >
                      {image ? (
                        <img
                          src={image}
                          alt={product.name || "Laptop"}
                          onError={handleImageError}
                          loading="lazy"
                          className="h-full w-full rounded-md object-contain transition duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-sm text-gray-500">
                          LAPZONE
                        </div>
                      )}

                      {hasOffer && (
                        <span className="absolute left-3 top-3 rounded bg-[#c51f35] px-2 py-1 text-[9px] font-bold text-white">
                          SPECIAL OFFER
                        </span>
                      )}
                    </button>

                    <div className="flex flex-1 flex-col p-4">
                      <p className="mb-2 text-[10px] capitalize text-gray-500">
                        {product.category || "Laptop"}
                      </p>

                      <h3 className="min-h-10 text-sm font-semibold leading-5 text-gray-100">
                        {product.name || "Laptop"}
                      </h3>

                      <div className="mt-3 flex flex-wrap items-baseline gap-2">
                        <span className="text-base font-bold text-white">
                          {Number.isFinite(price)
                            ? `₹${price.toLocaleString("en-IN")}`
                            : "Price unavailable"}
                        </span>

                        {hasOffer &&
                          Number.isFinite(originalPrice) &&
                          originalPrice > price && (
                            <span className="text-xs text-gray-500 line-through">
                              ₹{originalPrice.toLocaleString("en-IN")}
                            </span>
                          )}
                      </div>

                      <button
                        type="button"
                        onClick={() => openProduct(product)}
                        className="mt-4 w-full rounded-md bg-[#c51f35] py-2.5 text-xs font-bold text-white transition hover:bg-[#a9182b] focus:outline-none focus:ring-2 focus:ring-[#c51f35] focus:ring-offset-2 focus:ring-offset-[#20242d]"
                      >
                        VIEW PRODUCT
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
      </section>

      {/* SHOP BY CATEGORY */}
      <section id="categories" className="scroll-mt-24 bg-[#202936]">
        <div className="mx-auto max-w-7xl px-5 py-14 sm:px-6 lg:px-8 lg:py-16">
          <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <SectionLabel>Shop by Category</SectionLabel>
              <h2 className="text-xl font-bold text-white sm:text-2xl">
                Find the right laptop for you
              </h2>
              <p className="mt-2 text-xs text-gray-400 sm:text-sm">
                Choose a category to explore matching laptops.
              </p>
            </div>

            <button
              type="button"
              onClick={() => openProducts()}
              className="self-start text-xs font-semibold text-[#e04a5e] transition hover:text-white sm:self-auto"
            >
              View All <span aria-hidden="true">→</span>
            </button>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {categories.map((category) => (
              <button
                key={category.title}
                type="button"
                onClick={() => openProducts({ category: category.value })}
                className="group relative h-56 overflow-hidden rounded-lg border border-[#384358] text-left focus:outline-none focus:ring-2 focus:ring-[#c51f35]"
              >
                <img
                  src={category.image}
                  alt=""
                  loading="lazy"
                  onError={handleImageError}
                  className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-110"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-[#10131a] via-[#151820]/50 to-transparent" />

                <div className="absolute inset-x-0 bottom-0 p-5">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#ed6172]">
                    Explore laptops
                  </p>
                  <h3 className="mt-1 text-lg font-bold text-white">
                    {category.title}
                  </h3>
                  <p className="mt-1 text-xs text-gray-300">
                    {category.subtitle}
                  </p>
                </div>

                <span
                  className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-black/40 text-white transition group-hover:bg-[#c51f35]"
                  aria-hidden="true"
                >
                  →
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* SPECIAL OFFERS SECTION REMOVED */}
      {/* FOOTER */}
    </div>
  );
};

export default Home;
