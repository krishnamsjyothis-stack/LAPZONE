import { useNavigate } from "react-router-dom";

function Home() {
  const navigate = useNavigate();

  const products = [
    {
      name: "ASUS ROG Strix G16",
      category: "Gaming",
      price: "₹1,24,990",
      oldPrice: "₹1,49,990",
      image:
        "https://images.unsplash.com/photo-1593642702749-b7d2a804fbcf?w=800",
    },
    {
      name: "Lenovo Legion 5",
      category: "Gaming",
      price: "₹1,09,990",
      oldPrice: "₹1,29,990",
      image:
        "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800",
    },
    {
      name: "MacBook Air M3",
      category: "Business",
      price: "₹1,14,990",
      oldPrice: "₹1,24,990",
      image:
        "https://images.unsplash.com/photo-1517336714739-489689fd1ca8?w=800",
    },
    {
      name: "ASUS TUF Gaming A15",
      category: "Gaming",
      price: "₹89,990",
      oldPrice: "₹1,09,990",
      image:
        "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=800",
    },
    {
      name: "Lenovo ThinkPad E14",
      category: "Business",
      price: "₹54,990",
      oldPrice: "₹69,990",
      image:
        "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800",
    },
  ];

  const categories = [
    {
      title: "Gaming",
      subtitle: "High Performance",
      image:
        "https://images.unsplash.com/photo-1593640495253-23196b27a87f?w=800",
    },
    {
      title: "Business",
      subtitle: "Work Smart",
      image:
        "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800",
    },
    {
      title: "Students",
      subtitle: "Powerful. Simple. Clean.",
      image:
        "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800",
    },
    {
      title: "Everyday Use",
      subtitle: "For Work & Home",
      image:
        "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=800",
    },
  ];

  return (
    <div className="min-h-screen bg-[#151820] text-gray-200">

      {/* ================= NAVBAR ================= */}

      <header className="sticky top-0 z-50 bg-[#151820]/95 backdrop-blur border-b border-[#384358]/30">

        <div className="max-w-7xl mx-auto px-5 lg:px-8 h-16 flex items-center justify-between">

          {/* LOGO */}

          <div
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => navigate("/")}
          >
            <div className="w-8 h-8 rounded-md bg-[#c51f35] flex items-center justify-center">
              <span className="text-white font-bold text-sm">
                LZ
              </span>
            </div>

            <span className="font-semibold tracking-wide text-white">
              LAPZONE
            </span>
          </div>

          {/* NAVIGATION */}

          <nav className="hidden md:flex items-center gap-7 text-xs">

            <button className="text-[#c51f35] font-medium">
              Home
            </button>

            <button className="text-gray-400 hover:text-white transition">
              Products
            </button>

            <button className="text-gray-400 hover:text-white transition">
              Categories
            </button>

            <button className="text-gray-400 hover:text-white transition">
              Wishlist
            </button>

            <button className="text-gray-400 hover:text-white transition">
              Cart
            </button>

          </nav>

          {/* SEARCH + ICONS */}

          <div className="flex items-center gap-3">

            <div className="hidden sm:flex items-center bg-[#222731] border border-[#384358]/40 rounded-full px-4 h-9 w-48">

              <input
                type="text"
                placeholder="Search laptops..."
                className="bg-transparent outline-none text-xs text-gray-300 placeholder:text-gray-600 w-full"
              />

              <span className="text-gray-500">
                ⌕
              </span>

            </div>

            <button
             onClick={() => navigate("/profile")}
               className="w-10 h-10 rounded-full bg-[#384358] hover:bg-[#c51f35] transition flex items-center justify-center text-gray-400 hover:text-white"
                 >
                  ♙
                 </button>

            <button className="text-gray-400 hover:text-white">
              ♡
            </button>

            <button className="text-gray-400 hover:text-white relative">
              🛒

              <span className="absolute -top-2 -right-2 bg-[#c51f35] text-white text-[8px] w-4 h-4 rounded-full flex items-center justify-center">
                0
              </span>

            </button>

          </div>

        </div>

      </header>


      {/* ================= HERO ================= */}

      <section className="relative overflow-hidden">

        <div className="max-w-7xl mx-auto px-5 lg:px-8">

          <div className="min-h-[500px] grid lg:grid-cols-2 items-center">

            {/* HERO CONTENT */}

            <div className="py-16 lg:py-20">

              <p className="text-[#c51f35] text-[10px] font-bold tracking-[0.25em] mb-4">
                WELCOME TO LAPZONE
              </p>

              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-[0.95]">

                POWER YOUR

                <br />

                <span className="text-[#c51f35]">
                  PERFORMANCE
                </span>

              </h1>

              <p className="text-gray-400 text-sm leading-6 max-w-md mt-6">
                Discover powerful laptops built for gaming,
                business, creativity and everyday performance.
              </p>

              <div className="flex flex-wrap gap-3 mt-7">

                <button
                  onClick={() => navigate("/products")}
                  className="bg-[#c51f35] hover:bg-[#b51b30] text-white text-xs font-medium px-6 py-3 rounded-md transition"
                >
                  SHOP LAPTOPS →
                </button>

                <button
                  onClick={() => navigate("/products")}
                  className="border border-[#384358] hover:border-[#c51f35] text-gray-300 text-xs px-6 py-3 rounded-md transition"
                >
                  EXPLORE LAPTOPS
                </button>

              </div>

              {/* FEATURES */}

              <div className="flex flex-wrap gap-7 mt-10">

                <div className="flex items-center gap-2">
                  <span className="text-[#c51f35]">
                    ♢
                  </span>

                  <div>
                    <p className="text-[10px] text-gray-300">
                      Free Shipping
                    </p>

                    <p className="text-[8px] text-gray-600">
                      On orders above ₹500
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[#c51f35]">
                    ◈
                  </span>

                  <div>
                    <p className="text-[10px] text-gray-300">
                      Secure Payment
                    </p>

                    <p className="text-[8px] text-gray-600">
                      100% secure checkout
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[#c51f35]">
                    ♧
                  </span>

                  <div>
                    <p className="text-[10px] text-gray-300">
                      24/7 Support
                    </p>

                    <p className="text-[8px] text-gray-600">
                      We're here to help
                    </p>
                  </div>
                </div>

              </div>

            </div>


            {/* HERO IMAGE */}

            <div className="relative h-full min-h-[420px] flex items-center justify-center">

              <div className="absolute w-[450px] h-[450px] bg-[#c51f35]/10 rounded-full blur-3xl"></div>

              <img
                src="https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=1200"
                alt="Gaming Laptop"
                className="relative z-10 w-full max-w-xl object-cover rounded-xl shadow-2xl border border-[#384358]/40"
              />

            </div>

          </div>

        </div>

      </section>


      {/* ================= TRUSTED BRANDS ================= */}

      <section className="border-y border-[#384358]/30 bg-[#222731]/40">

        <div className="max-w-7xl mx-auto px-5 lg:px-8 py-7">

          <p className="text-[9px] text-[#c51f35] font-semibold tracking-widest mb-5">
            TRUSTED BRANDS
          </p>

          <div className="grid grid-cols-3 sm:grid-cols-6 gap-6 items-center text-center">

            {[
              "ASUS",
              "DELL",
              "HP",
              "Lenovo",
              "acer",
              "MSI",
            ].map((brand) => (
              <span
                key={brand}
                className="text-gray-500 font-bold text-sm hover:text-gray-200 transition"
              >
                {brand}
              </span>
            ))}

          </div>

        </div>

      </section>


      {/* ================= FEATURED PRODUCTS ================= */}

      <section className="max-w-7xl mx-auto px-5 lg:px-8 py-14">

        <div className="flex justify-between items-end mb-7">

          <div>
            <p className="text-[9px] text-[#c51f35] font-semibold tracking-widest mb-2">
              FEATURED PRODUCTS
            </p>

            <h2 className="text-xl font-bold text-white">
              Handpicked laptops for every need.
            </h2>
          </div>

          <button className="text-[#c51f35] text-[10px] hover:underline">
            View All →
          </button>

        </div>


        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">

          {products.map((product) => (

            <div
              key={product.name}
              className="bg-[#222731] border border-[#384358]/40 rounded-md overflow-hidden hover:border-[#c51f35]/60 transition group"
            >

              {/* IMAGE */}

              <div className="relative h-40 bg-[#151820] p-3">

                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover rounded-sm group-hover:scale-105 transition duration-300"
                />

                <button className="absolute top-3 right-3 w-6 h-6 rounded-full bg-[#151820]/80 text-gray-400 hover:text-[#c51f35]">
                  ♡
                </button>

              </div>


              {/* DETAILS */}

              <div className="p-3">

                <p className="text-[8px] text-gray-500 mb-1">
                  {product.category}
                </p>

                <h3 className="text-xs font-semibold text-gray-200 truncate">
                  {product.name}
                </h3>

                <div className="mt-3">

                  <span className="text-sm font-bold text-white">
                    {product.price}
                  </span>

                  <span className="text-[9px] text-gray-600 line-through ml-2">
                    {product.oldPrice}
                  </span>

                </div>

                <button className="w-full mt-3 bg-[#c51f35] hover:bg-[#b51b30] text-white text-[9px] py-2 rounded transition">
                  ADD TO CART
                </button>

              </div>

            </div>

          ))}

        </div>

      </section>


      {/* ================= SHOP BY CATEGORY ================= */}

      <section className="bg-[#384358]">

        <div className="max-w-7xl mx-auto px-5 lg:px-8 py-14">

          <div className="flex justify-between items-end mb-7">

            <div>

              <p className="text-[9px] text-[#c51f35] font-semibold tracking-widest mb-2">
                SHOP BY CATEGORY
              </p>

              <h2 className="text-xl font-bold text-white">
                Find the perfect laptop for your needs
              </h2>

            </div>

            <button className="text-[#c51f35] text-[10px] hover:underline">
              View All →
            </button>

          </div>


          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

            {categories.map((category) => (

              <div
                key={category.title}
                className="relative h-48 rounded-md overflow-hidden group cursor-pointer border border-[#222731]/50"
              >

                <img
                  src={category.image}
                  alt={category.title}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition duration-500"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-[#151820] via-[#151820]/50 to-transparent"></div>

                <div className="absolute bottom-4 left-4">

                  <p className="text-[#c51f35] text-[9px] font-semibold">
                    LAPTOPS
                  </p>

                  <h3 className="text-white font-bold text-base">
                    {category.title}
                  </h3>

                  <p className="text-gray-400 text-[9px] mt-1">
                    {category.subtitle}
                  </p>

                </div>

                <span className="absolute bottom-4 right-4 text-[#c51f35]">
                  →
                </span>

              </div>

            ))}

          </div>

        </div>

      </section>


      {/* ================= DEALS ================= */}

      <section className="max-w-7xl mx-auto px-5 lg:px-8 py-10">

        <div className="border-l-2 border-[#c51f35] bg-[#222731] rounded-r-md p-6 flex flex-col md:flex-row items-center justify-between gap-5">

          <div>

            <p className="text-[9px] text-[#c51f35] font-semibold tracking-widest">
              SPECIAL OFFER
            </p>

            <h2 className="text-lg font-bold text-white mt-1">
              Get the Latest Deals & Offers
            </h2>

            <p className="text-[10px] text-gray-500 mt-2">
              Subscribe to receive exclusive deals and the latest
              laptop offers.
            </p>

          </div>

          <div className="flex w-full md:w-auto">

            <input
              type="email"
              placeholder="Enter your email address"
              className="bg-[#151820] border border-[#384358] text-xs text-gray-300 px-4 h-9 outline-none rounded-l-md w-full md:w-64"
            />

            <button className="bg-[#c51f35] hover:bg-[#b51b30] text-white text-[9px] font-semibold px-5 rounded-r-md">
              SUBSCRIBE
            </button>

          </div>

        </div>

      </section>


      {/* ================= FOOTER ================= */}

      <footer className="border-t border-[#384358]/40 bg-[#151820]">

        <div className="max-w-7xl mx-auto px-5 lg:px-8 py-12">

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">

            {/* ABOUT */}

            <div>

              <div className="flex items-center gap-3 mb-4">

                <div className="w-7 h-7 bg-[#c51f35] rounded-md flex items-center justify-center">
                  <span className="text-white text-xs font-bold">
                    LZ
                  </span>
                </div>

                <span className="font-semibold text-white">
                  LAPZONE
                </span>

              </div>

              <p className="text-[10px] text-gray-500 leading-5 max-w-xs">
                Your trusted destination for premium laptops,
                high-performance hardware and exceptional
                technology.
              </p>

              <div className="flex gap-3 mt-5">

                <span className="w-7 h-7 rounded-full bg-[#222731] flex items-center justify-center text-gray-500">
                  f
                </span>

                <span className="w-7 h-7 rounded-full bg-[#222731] flex items-center justify-center text-gray-500">
                  ◎
                </span>

                <span className="w-7 h-7 rounded-full bg-[#222731] flex items-center justify-center text-gray-500">
                  X
                </span>

              </div>

            </div>


            {/* QUICK LINKS */}

            <div>

              <h3 className="text-[10px] font-semibold text-white tracking-widest mb-5">
                QUICK LINKS
              </h3>

              <div className="space-y-3 text-[10px] text-gray-500">

                <p className="hover:text-[#c51f35] cursor-pointer">
                  Products
                </p>

                <p className="hover:text-[#c51f35] cursor-pointer">
                  Categories
                </p>

                <p className="hover:text-[#c51f35] cursor-pointer">
                  Wishlist
                </p>

                <p className="hover:text-[#c51f35] cursor-pointer">
                  Cart
                </p>

                <p className="hover:text-[#c51f35] cursor-pointer">
                  Contact
                </p>

              </div>

            </div>


            {/* SUPPORT */}

            <div>

              <h3 className="text-[10px] font-semibold text-white tracking-widest mb-5">
                SUPPORT
              </h3>

              <div className="space-y-3 text-[10px] text-gray-500">

                <p>Help Center</p>
                <p>Shipping Info</p>
                <p>Returns & Refunds</p>
                <p>Terms & Conditions</p>
                <p>Privacy Policy</p>

              </div>

            </div>


            {/* CONTACT */}

            <div>

              <h3 className="text-[10px] font-semibold text-white tracking-widest mb-5">
                CONTACT US
              </h3>

              <div className="space-y-3 text-[10px] text-gray-500">

                <p>
                  ☎ +91 98765 43210
                </p>

                <p>
                  ✉ support@lapzone.com
                </p>

                <p>
                  ◉ Bangalore, India
                </p>

              </div>

            </div>

          </div>


          <div className="border-t border-[#384358]/30 mt-10 pt-5 flex flex-col sm:flex-row justify-between gap-3">

            <p className="text-[8px] text-gray-600">
              © 2026 LAPZONE. All rights reserved.
            </p>

            <p className="text-[8px] text-gray-600">
              Power • Performance • LAPZONE
            </p>

          </div>

        </div>

      </footer>

    </div>
  );
}

export default Home;