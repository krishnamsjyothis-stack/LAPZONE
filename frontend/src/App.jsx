import { BrowserRouter, Routes, Route } from "react-router-dom";

import Signup from "./pages/Signup";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import ForgotPasswordOtp from "./pages/ForgotPasswordOtp";
import ResetPassword from "./pages/ResetPassword";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import EditProfile from "./pages/EditProfile";
import Addresses from "./pages/Addresses";

function App() {
  return (
    <Routes>

      <Route path="/" element={<Home />} />

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

      <Route
        path="/profile"
        element={<Profile />}
      />
      <Route
        path="/profile/edit"
        element={<EditProfile />}
      />
      
      <Route path="/addresses" element={<Addresses />} />

    </Routes>
  );
}

export default App;