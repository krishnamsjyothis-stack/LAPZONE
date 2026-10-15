
import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

function UserNavbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const [search, setSearch] = useState("");
  const [mobileMenu, setMobileMenu] = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [logoutModal, setLogoutModal] = useState(false);

  const categoryRef = useRef(null);
  const accountRef = useRef(null);

  const token = localStorage.getItem("token");

  let user = null;

  try {
    user = JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    user = null;
  }

  const categories = [
    { name: "Gaming", description: "Performance & high FPS" },
    { name: "Business", description: "Productivity & work" },
    { name: "Students", description: "Study & everyday use" },
    { name: "Premium", description: "Flagship laptops" },
  ];

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setSearch(params.get("search") || "");
    setMobileMenu(false);
    setCategoryOpen(false);
    setAccountOpen(false);
  }, [location.pathname, location.search]);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        categoryRef.current &&
        !categoryRef.current.contains(event.target)
      ) {
        setCategoryOpen(false);
      }

      if (
        accountRef.current &&
        !accountRef.current.contains(event.target)
      ) {
        setAccountOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setCategoryOpen(false);
        setAccountOpen(false);
        setMobileMenu(false);
        setLogoutModal(false);
      }
    };

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const goTo = (path) => {
    setMobileMenu(false);
    setCategoryOpen(false);
    setAccountOpen(false);
    navigate(path);
  };

  const isActive = (path) => location.pathname === path;
  const isProductsActive = location.pathname.startsWith("/products");

  const handleSearch = (event) => {
    event.preventDefault();

    const value = search.trim();

    navigate(
      value
        ? `/products?search=${encodeURIComponent(value)}`
        : "/products"
    );

    setMobileMenu(false);
  };

  const handleCategory = (category) => {
    navigate(`/products?category=${encodeURIComponent(category)}`);
    setCategoryOpen(false);
    setMobileMenu(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setLogoutModal(false);
    setAccountOpen(false);
    setMobileMenu(false);

    navigate("/login", { replace: true });
  };

  const navLinkClass = (path) => {
    const active =
      isActive(path) || (path === "/products" && isProductsActive);

    return `relative whitespace-nowrap py-2 transition-colors duration-200
      after:absolute after:bottom-0 after:left-0 after:h-[2px]
      after:rounded-full after:bg-[#b51a2b]
      after:transition-all after:duration-300
      ${
        active
          ? "text-[#ffb2b8] after:w-full"
          : "text-gray-400 after:w-0 hover:text-white hover:after:w-full"
      }`;
  };

  const userInitial = (user?.name || user?.username || "U")
    .trim()
    .charAt(0)
    .toUpperCase();

  return (
    <>
      {/* NAVBAR */}
      <header className="relative z-50 w-full bg-[#11161e] text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex min-h-[68px] items-center justify-between gap-3">
            {/* LOGO */}
            <button
              type="button"
              onClick={() => goTo("/")}
              aria-label="LAPZONE home"
              className="flex shrink-0 items-center gap-2.5"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#b51a2b] text-xs font-black shadow-lg shadow-red-950/30">
                LZ
              </span>

              <span className="text-left">
                <span className="block text-base font-black tracking-[0.15em]">
                  LAP<span className="text-[#ffb2b8]">ZONE</span>
                </span>

                <span className="hidden text-[9px] tracking-[0.2em] text-gray-500 sm:block">
                  YOUR TECH. YOUR WORLD.
                </span>
              </span>
            </button>

            {/* DESKTOP NAV */}
            <nav
              aria-label="Main navigation"
              className="hidden items-center gap-5 text-sm font-medium xl:flex"
            >
              <button
                type="button"
                onClick={() => goTo("/")}
                className={navLinkClass("/")}
              >
                Home
              </button>

              <button
                type="button"
                onClick={() => goTo("/products")}
                className={navLinkClass("/products")}
              >
                All Laptops
              </button>

              {/* CATEGORY DROPDOWN */}
              <div className="relative" ref={categoryRef}>
                <button
                  type="button"
                  onClick={() => {
                    setCategoryOpen((open) => !open);
                    setAccountOpen(false);
                  }}
                  aria-expanded={categoryOpen}
                  aria-haspopup="true"
                  className={`flex items-center gap-2 py-2 transition-colors ${
                    categoryOpen || isProductsActive
                      ? "text-[#ffb2b8]"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  Categories
                  <span
                    className={`transition-transform ${
                      categoryOpen ? "rotate-180" : ""
                    }`}
                  >
                    ▾
                  </span>
                </button>

                <div
                  className={`absolute left-0 top-full z-50 w-72 pt-3 transition-all duration-200 ${
                    categoryOpen
                      ? "visible translate-y-0 opacity-100"
                      : "invisible -translate-y-2 opacity-0 pointer-events-none"
                  }`}
                >
                  <div className="rounded-2xl border border-white/10 bg-[#1b222d] p-2 shadow-2xl shadow-black/40">
                    <p className="px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-gray-500">
                      Shop by category
                    </p>

                    {categories.map((category) => (
                      <button
                        key={category.name}
                        type="button"
                        onClick={() =>
                          handleCategory(category.name.toLowerCase())
                        }
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-colors hover:bg-white/[0.06]"
                      >
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#b51a2b]/15 font-bold text-[#ffb2b8]">
                          {category.name.charAt(0)}
                        </span>

                        <span>
                          <span className="block text-sm font-semibold text-white">
                            {category.name}
                          </span>
                          <span className="mt-0.5 block text-xs text-gray-500">
                            {category.description}
                          </span>
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </nav>

            {/* DESKTOP SEARCH */}
            <form
              onSubmit={handleSearch}
              role="search"
              className="hidden min-w-0 max-w-[240px] flex-1 items-center rounded-xl border border-white/10 bg-[#1b222d] px-3 transition-colors focus-within:border-[#b51a2b]/70 lg:flex"
            >
              <button
                type="submit"
                aria-label="Search products"
                className="text-lg text-gray-500 hover:text-[#ffb2b8]"
              >
                ⌕
              </button>

              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search laptops..."
                aria-label="Search laptops"
                className="w-full min-w-0 bg-transparent px-3 py-2.5 text-xs text-white outline-none placeholder:text-gray-500"
              />

              {search && (
                <button
                  type="button"
                  aria-label="Clear search"
                  onClick={() => setSearch("")}
                  className="text-gray-500 hover:text-white"
                >
                  ×
                </button>
              )}
            </form>

            {/* RIGHT ACTIONS */}
            <div className="flex shrink-0 items-center gap-1 sm:gap-2">
              {token && (
                <button
                  type="button"
                  onClick={() => goTo("/wishlist")}
                  aria-label="Wishlist"
                  title="Wishlist"
                  className={`flex h-10 w-10 items-center justify-center rounded-xl text-xl transition hover:bg-white/[0.06] ${
                    location.pathname.startsWith("/wishlist")
                      ? "text-[#ffb2b8]"
                      : "text-gray-400 hover:text-[#ffb2b8]"
                  }`}
                >
                  ♡
                </button>
              )}

              {token && (
                <button
                  type="button"
                  onClick={() => goTo("/cart")}
                  aria-label="Shopping cart"
                  title="Shopping cart"
                  className={`flex h-10 w-10 items-center justify-center rounded-xl text-lg transition hover:bg-white/[0.06] ${
                    location.pathname.startsWith("/cart")
                      ? "text-[#ffb2b8]"
                      : "text-gray-400 hover:text-[#ffb2b8]"
                  }`}
                >
                  🛒
                </button>
              )}

              {/* ACCOUNT DROPDOWN */}
              {token ? (
                <div className="relative" ref={accountRef}>
                  <button
                    type="button"
                    onClick={() => {
                      setAccountOpen((open) => !open);
                      setCategoryOpen(false);
                    }}
                    aria-label="Account menu"
                    aria-expanded={accountOpen}
                    aria-haspopup="true"
                    className={`flex h-10 items-center gap-2 rounded-xl border px-2 transition-colors sm:px-3 ${
                      accountOpen ||
                      location.pathname.startsWith("/profile") ||
                      location.pathname.startsWith("/wallet")
                        ? "border-[#b51a2b]/60 bg-[#b51a2b]/10"
                        : "border-white/10 hover:border-white/20 hover:bg-white/[0.04]"
                    }`}
                  >
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#b51a2b] text-xs font-bold text-white">
                      {userInitial}
                    </span>

                    <span className="hidden max-w-20 truncate text-xs font-medium text-gray-200 xl:block">
                      {user?.name || user?.username || "Account"}
                    </span>

                    <span
                      className={`hidden text-xs text-gray-500 transition-transform sm:block ${
                        accountOpen ? "rotate-180" : ""
                      }`}
                    >
                      ▾
                    </span>
                  </button>

                  <div
                    className={`absolute right-0 top-full z-50 w-60 pt-3 transition-all duration-200 ${
                      accountOpen
                        ? "visible translate-y-0 opacity-100"
                        : "invisible -translate-y-2 opacity-0 pointer-events-none"
                    }`}
                  >
                    <div className="rounded-2xl border border-white/10 bg-[#1b222d] p-2 shadow-2xl shadow-black/40">
                      <div className="border-b border-white/[0.07] px-3 py-3">
                        <p className="truncate text-sm font-semibold text-white">
                          {user?.name || user?.username || "Welcome back"}
                        </p>
                        <p className="mt-1 truncate text-xs text-gray-500">
                          {user?.email || "Manage your account"}
                        </p>
                      </div>

                      {[
                        { label: "My Profile", path: "/profile" },
                        { label: "My Addresses", path: "/addresses" },
                        { label: "My Orders", path: "/orders" },
                        { label: "My Wallet", path: "/wallet" },
                      ].map((item) => (
                        <button
                          key={item.path}
                          type="button"
                          onClick={() => goTo(item.path)}
                          className={`block w-full rounded-xl px-3 py-3 text-left text-sm transition-colors hover:bg-white/[0.06] hover:text-white ${
                            isActive(item.path)
                              ? "bg-[#b51a2b]/10 text-[#ffb2b8]"
                              : "text-gray-300"
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}

                      <div className="my-1 border-t border-white/[0.07]" />

                      <button
                        type="button"
                        onClick={() => {
                          setAccountOpen(false);
                          setLogoutModal(true);
                        }}
                        className="block w-full rounded-xl px-3 py-3 text-left text-sm text-red-300 transition-colors hover:bg-red-500/10"
                      >
                        ↪ &nbsp; Logout
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => goTo("/login")}
                    className="hidden rounded-xl px-3 py-2.5 text-xs font-semibold text-gray-300 transition-colors hover:text-white sm:block"
                  >
                    Login
                  </button>

                  <button
                    type="button"
                    onClick={() => goTo("/signup")}
                    className="rounded-xl bg-[#b51a2b] px-3 py-2.5 text-xs font-bold text-white transition-colors hover:bg-[#cf263d] sm:px-4"
                  >
                    Sign Up
                  </button>
                </>
              )}

              {/* MOBILE MENU BUTTON */}
              <button
                type="button"
                onClick={() => setMobileMenu((open) => !open)}
                aria-label={mobileMenu ? "Close menu" : "Open menu"}
                aria-expanded={mobileMenu}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 text-lg text-gray-300 transition-colors hover:bg-white/[0.06] xl:hidden"
              >
                {mobileMenu ? "✕" : "☰"}
              </button>
            </div>
          </div>

          {/* MOBILE NAV */}
          {mobileMenu && (
            <div className="border-t border-white/[0.07] py-4 xl:hidden">
              <form
                onSubmit={handleSearch}
                role="search"
                className="mb-4 flex items-center rounded-xl border border-white/10 bg-[#1b222d] px-3"
              >
                <button
                  type="submit"
                  aria-label="Search products"
                  className="text-lg text-gray-500"
                >
                  ⌕
                </button>

                <input
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search laptops..."
                  aria-label="Search laptops"
                  className="w-full bg-transparent px-3 py-3 text-sm text-white outline-none placeholder:text-gray-500"
                />
              </form>

              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {[
                  { label: "Home", path: "/" },
                  { label: "All Laptops", path: "/products" },
                  ...(token
                    ? [
                        { label: "Wishlist", path: "/wishlist" },
                        { label: "Cart", path: "/cart" },
                        { label: "My Profile", path: "/profile" },
                        { label: "My Addresses", path: "/addresses" },
                        { label: "My Orders", path: "/orders" },
                        { label: "My Wallet", path: "/wallet" },
                      ]
                    : [
                        { label: "Login", path: "/login" },
                        { label: "Sign Up", path: "/signup" },
                      ]),
                ].map((item) => (
                  <button
                    key={item.path}
                    type="button"
                    onClick={() => goTo(item.path)}
                    className={`rounded-xl border px-3 py-3 text-left text-sm transition-colors hover:bg-white/[0.05] ${
                      isActive(item.path)
                        ? "border-[#b51a2b]/40 bg-[#b51a2b]/10 text-[#ffb2b8]"
                        : "border-white/[0.06] text-gray-300"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              <div className="mt-5">
                <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">
                  Shop by category
                </p>

                <div className="flex flex-wrap gap-2">
                  {categories.map((category) => (
                    <button
                      key={category.name}
                      type="button"
                      onClick={() =>
                        handleCategory(category.name.toLowerCase())
                      }
                      className="rounded-full border border-white/10 px-3 py-2 text-xs text-gray-300 transition-colors hover:border-[#b51a2b]/60 hover:text-[#ffb2b8]"
                    >
                      {category.name}
                    </button>
                  ))}
                </div>
              </div>

              {token && (
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenu(false);
                    setLogoutModal(true);
                  }}
                  className="mt-4 w-full rounded-xl border border-red-500/20 px-4 py-3 text-left text-sm text-red-300 transition-colors hover:bg-red-500/10"
                >
                  ↪ &nbsp; Logout
                </button>
              )}
            </div>
          )}
        </div>
      </header>

      {/* LOGOUT CONFIRMATION */}
      {logoutModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setLogoutModal(false);
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="logout-title"
            className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#1b222d] p-6 shadow-2xl"
          >
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-500/10 text-2xl text-[#ffb2b8]">
              ↪
            </div>

            <h2
              id="logout-title"
              className="mt-4 text-center text-lg font-bold text-white"
            >
              Logout from LAPZONE?
            </h2>

            <p className="mt-2 text-center text-sm leading-6 text-gray-400">
              Are you sure you want to log out of your account?
            </p>

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => setLogoutModal(false)}
                className="flex-1 rounded-xl border border-white/10 px-4 py-3 text-sm font-semibold text-gray-300 transition-colors hover:bg-white/[0.05]"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleLogout}
                className="flex-1 rounded-xl bg-[#b51a2b] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#cf263d]"
              >
                Yes, Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default UserNavbar;
