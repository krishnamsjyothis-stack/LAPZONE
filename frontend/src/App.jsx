import { Routes, Route, Navigate } from "react-router-dom";

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

import ProtectedRoute from "./components/ProtectedRoute";

import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminProtectedRoute from "./components/AdminProtectedRoute";
import ChangePassword from "./pages/ChangePassword";
import Products from "./pages/Products";
import ProductDetails from "./pages/ProductDetails";
import Cart from "./pages/Cart";
import AdminAddCategory from "./pages/admin/AdminAddCategory";  
import AdminCategories from "./pages/admin/AdminCategories";
import AdminEditCategory from "./pages/admin/AdminEditCategory";

function App() {
  return (
    <Routes>

      {/* ================= PUBLIC PAGES ================= */}

      <Route path="/" element={<Home />} />

      <Route path="/signup" element={<Signup />} />

      <Route path="/login" element={<Login />} />

      <Route path="/products" element={<Products />} />

      <Route path="/cart" element={<Cart />} />

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
     


      {/* ================= USER PROTECTED PAGES ================= */}

      <Route element={<ProtectedRoute />}>

        <Route
          path="/profile"
          element={<Profile />}
        />

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

<Route
  path="/products/:id"
  element={<ProductDetails />}
/>

      </Route>


      {/* ================= ADMIN ================= */}

      <Route
        path="/admin"
        element={<Navigate to="/admin/login" replace />}
      />

      <Route
        path="/admin/login"
        element={<AdminLogin />}
      />

      <Route
        path="/admin/dashboard"
        element={
          <AdminProtectedRoute>
            <AdminDashboard />
          </AdminProtectedRoute>
        }
      />

      <Route
        path="/admin/users"
        element={
          <AdminProtectedRoute>
            <AdminUsers />
          </AdminProtectedRoute>
        }
      />
      <Route
  path="/admin/categories/add"
  element={
    <AdminProtectedRoute>
      <AdminAddCategory />
    </AdminProtectedRoute>
  }
/>  
<Route
  path="/admin/categories"
  element={
    <AdminProtectedRoute>
      <AdminCategories />
    </AdminProtectedRoute>
  }
/>
      <Route
  path="/admin/categories/edit/:id"
  element={
    <AdminProtectedRoute>
      <AdminEditCategory />
    </AdminProtectedRoute>
  }
/>

    </Routes>
  );
}

export default App;