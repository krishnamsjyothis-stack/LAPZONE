
import { Link } from "react-router-dom";
import {
  Instagram,
  Facebook,
  Youtube,
  Mail,
  ShieldCheck,
  Truck,
  Headphones,
  ArrowRight,
} from "lucide-react";

function UserFooter() {
  const shopLinks = [
    { label: "All Laptops", to: "/products" },
    { label: "Gaming Laptops", to: "/products?category=gaming" },
    { label: "Business Laptops", to: "/products?category=business" },
    { label: "Student Laptops", to: "/products?category=students" },
    { label: "Shopping Cart", to: "/cart" },
    { label: "Wishlist", to: "/wishlist" },
  ];

  const accountLinks = [
    { label: "My Profile", to: "/profile" },
    { label: "My Orders", to: "/orders" },
    { label: "My Addresses", to: "/addresses" },
    { label: "Change Password", to: "/change-password" },
  ];

  const socialLinks = [
    {
      label: "Instagram",
      href: "https://www.instagram.com/",
      Icon: Instagram,
    },
    {
      label: "Facebook",
      href: "https://www.facebook.com/",
      Icon: Facebook,
    },
    {
      label: "YouTube",
      href: "https://www.youtube.com/",
      Icon: Youtube,
    },
  ];

  return (
    <footer className="bg-[#11161e] text-gray-300">
      {/* Newsletter / Explore section */}
      <div className="border-b border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-5 px-6 py-10 md:flex-row md:items-center">
          <div>
            <h2 className="text-xl font-bold text-white">
              Stay updated with LAP
              <span className="text-[#b51a2b]">ZONE</span>
            </h2>

            <p className="mt-2 text-sm leading-6 text-gray-400">
              Discover laptops for gaming, business, studies, and everyday use.
            </p>
          </div>

          <Link
            to="/products"
            className="inline-flex w-fit items-center justify-center gap-2 rounded-md bg-[#b51a2b] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#941625] focus:outline-none focus:ring-2 focus:ring-[#ff6675]"
          >
            Explore Laptops
            <ArrowRight size={17} />
          </Link>
        </div>
      </div>

      {/* Main footer */}
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-6 py-12 sm:grid-cols-2 lg:grid-cols-4">
        {/* Brand and social media */}
        <div>
          <Link
            to="/"
            aria-label="LAPZONE home"
            className="inline-block text-2xl font-extrabold tracking-wider text-white"
          >
            LAP<span className="text-[#b51a2b]">ZONE</span>
          </Link>

          <p className="mt-4 max-w-xs text-sm leading-6 text-gray-400">
            Your destination for laptops for gaming, business, education,
            and everyday productivity.
          </p>

          <div className="mt-6 flex items-center gap-3">
            {socialLinks.map(({ label, href, Icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="rounded-lg border border-white/10 p-3 transition hover:border-[#b51a2b] hover:bg-[#b51a2b] hover:text-white focus:outline-none focus:ring-2 focus:ring-[#ff6675]"
              >
                <Icon size={18} />
              </a>
            ))}

            <a
              href="mailto:support@lapzone.com"
              aria-label="Email LAPZONE support"
              className="rounded-lg border border-white/10 p-3 transition hover:border-[#b51a2b] hover:bg-[#b51a2b] hover:text-white focus:outline-none focus:ring-2 focus:ring-[#ff6675]"
            >
              <Mail size={18} />
            </a>
          </div>
        </div>

        {/* Shop links */}
        <div>
          <h3 className="mb-5 font-semibold text-white">Shop</h3>

          <ul className="space-y-3 text-sm">
            {shopLinks.map((item) => (
              <li key={item.label}>
                <Link
                  to={item.to}
                  className="transition-colors hover:text-white"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Account links */}
        <div>
          <h3 className="mb-5 font-semibold text-white">My Account</h3>

          <ul className="space-y-3 text-sm">
            {accountLinks.map((item) => (
              <li key={item.label}>
                <Link
                  to={item.to}
                  className="transition-colors hover:text-white"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Customer support */}
        <div>
          <h3 className="mb-5 font-semibold text-white">Customer Support</h3>

          <ul className="space-y-5 text-sm">
            <li className="flex items-start gap-3">
              <Headphones
                size={19}
                className="mt-0.5 shrink-0 text-[#ff6675]"
              />

              <div>
                <p className="font-medium text-gray-200">Need help?</p>
                <a
                  href="mailto:support@lapzone.com"
                  className="mt-1 inline-block text-gray-400 transition hover:text-white"
                >
                  Email Support
                </a>
              </div>
            </li>

            <li className="flex items-start gap-3">
              <ShieldCheck
                size={19}
                className="mt-0.5 shrink-0 text-[#ff6675]"
              />
              <span className="text-gray-400">Secure checkout</span>
            </li>

            <li className="flex items-start gap-3">
              <Truck
                size={19}
                className="mt-0.5 shrink-0 text-[#ff6675]"
              />
              <span className="text-gray-400">Delivery across India</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-5 text-center sm:flex-row sm:text-left">
          <p className="text-xs text-gray-500">
            © {new Date().getFullYear()} LAPZONE. All rights reserved.
          </p>

          <p className="text-xs text-gray-500">
            Built for your next upgrade.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default UserFooter;
