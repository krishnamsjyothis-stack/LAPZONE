
import { Routes, Route, Navigate } from "react-router-dom";

// ================= USER PAGES =================

import Home from "./pages/Home";
import Signup from "./pages/Signup";
import Login from "./pages/Login";

import ForgotPassword from "./pages/ForgotPassword";
import ForgotPasswordOtp from "./pages/ForgotPasswordOtp";
import ResetPassword from "./pages/ResetPassword";

import Profile from "./pages/Profile";
import EditProfile from "./pages/EditProfile";
import Addresses from "./pages/Addresses";
import ChangeEmail from "./pages/ChangeEmail";
import ChangePassword from "./pages/ChangePassword";

import Products from "./pages/Products";
import ProductDetails from "./pages/ProductDetails";

import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Wishlist from "./pages/Wishlist";
import Wallet from "./pages/Wallet";

import OrderSuccess from "./pages/OrderSuccess";
import MyOrders from "./pages/MyOrders";
import OrderDetails from "./pages/OrderDetails";
import PaymentFailed from "./pages/PaymentFailed";

// ================= USER COMPONENTS =================

import ProtectedRoute from "./components/ProtectedRoute";
import UserLayout from "./components/UserLayout";

// ================= ADMIN COMPONENTS =================

import AdminProtectedRoute from "./components/AdminProtectedRoute";
import AdminLayout from "./components/AdminLayout";

// ================= ADMIN PAGES =================

import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";

import AdminAddCategory from "./pages/admin/AdminAddCategory";
import AdminCategories from "./pages/admin/AdminCategories";
import AdminEditCategory from "./pages/admin/AdminEditCategory";

import AdminAddProduct from "./pages/admin/AdminAddProduct";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminEditProduct from "./pages/admin/AdminEditProduct";

import AdminOrders from "./pages/admin/AdminOrders";
import AdminOrderDetails from "./pages/admin/AdminOrderDetails";
import AdminReturns from "./pages/admin/AdminReturns";

import AdminCoupons from "./pages/admin/AdminCoupons";
import AdminOffer from "./pages/admin/AdminOffer";
import AdminReviews from "./pages/admin/AdminReviews";
import AdminSalesReports from "./pages/admin/AdminSalesReports";
import AdminInventory from "./pages/admin/admininventory";
import AdminWallet from "./pages/admin/AdminWallet";

function App() {
  return (
    <Routes>
      {/* ================= USER AUTHENTICATION ================= */}

      <Route path="/signup" element={<Signup />} />
      <Route path="/login" element={<Login />} />

      <Route
        path="/forgot-password"
        element={<ForgotPassword />}
      />

      <Route
        path="/forgot-password/otp"
        element={<ForgotPasswordOtp />}
      />

      <Route
        path="/reset-password"
        element={<ResetPassword />}
      />

      {/* ================= USER LAYOUT ================= */}

      <Route element={<UserLayout />}>
        {/* Public user pages */}

        <Route path="/" element={<Home />} />
        <Route path="/home" element={<Home />} />

        <Route path="/products" element={<Products />} />
        <Route
          path="/products/:id"
          element={<ProductDetails />}
        />

        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/wishlist" element={<Wishlist />} />

        <Route
          path="/order-success"
          element={<OrderSuccess />}
        />

        <Route path="/orders" element={<MyOrders />} />
        <Route
          path="/orders/:id"
          element={<OrderDetails />}
        />

        <Route
          path="/payment-failed"
          element={<PaymentFailed />}
        />

        <Route path="/wallet" element={<Wallet />} />

        {/* Protected user pages */}

        <Route element={<ProtectedRoute />}>
          <Route path="/profile" element={<Profile />} />

          <Route
            path="/profile/edit"
            element={<EditProfile />}
          />

          <Route
            path="/addresses"
            element={<Addresses />}
          />

          <Route
            path="/change-email"
            element={<ChangeEmail />}
          />

          <Route
            path="/change-password"
            element={<ChangePassword />}
          />
        </Route>
      </Route>

      {/* ================= ADMIN LOGIN ================= */}

      <Route
        path="/admin"
        element={
          <Navigate to="/admin/login" replace />
        }
      />

      <Route
        path="/admin/login"
        element={<AdminLogin />}
      />

      {/* ================= PROTECTED ADMIN LAYOUT ================= */}

      <Route element={<AdminProtectedRoute />}>
        <Route element={<AdminLayout />}>
          <Route
            path="/admin/dashboard"
            element={<AdminDashboard />}
          />

          {/* Users */}

          <Route
            path="/admin/users"
            element={<AdminUsers />}
          />

          {/* Categories */}

          <Route
            path="/admin/categories"
            element={<AdminCategories />}
          />

          <Route
            path="/admin/categories/add"
            element={<AdminAddCategory />}
          />

          <Route
            path="/admin/categories/edit/:id"
            element={<AdminEditCategory />}
          />

          {/* Products */}

          <Route
            path="/admin/products"
            element={<AdminProducts />}
          />

          <Route
            path="/admin/products/add"
            element={<AdminAddProduct />}
          />

          <Route
            path="/admin/products/edit/:id"
            element={<AdminEditProduct />}
          />

          {/* Orders */}

          <Route
            path="/admin/orders"
            element={<AdminOrders />}
          />

          <Route
            path="/admin/orders/:id"
            element={<AdminOrderDetails />}
          />

          {/* Returns */}

          <Route
            path="/admin/returns"
            element={<AdminReturns />}
          />

          {/* Inventory */}

          <Route
            path="/admin/inventory"
            element={<AdminInventory />}
          />

          {/* Coupons */}

          <Route
            path="/admin/coupons"
            element={<AdminCoupons />}
          />

          {/* Offers */}

          <Route
            path="/admin/offers"
            element={<AdminOffer />}
          />

          {/* Reviews */}

          <Route
            path="/admin/reviews"
            element={<AdminReviews />}
          />

          {/* Wallet */}

          <Route
            path="/admin/wallet"
            element={<AdminWallet />}
          />

          {/* Sales reports */}

          <Route
            path="/admin/sales-reports"
            element={<AdminSalesReports />}
          />
        </Route>
      </Route>

      {/* ================= FALLBACK ================= */}

      <Route
        path="*"
        element={<Navigate to="/" replace />}
      />
    </Routes>
  );
}

export default App;
