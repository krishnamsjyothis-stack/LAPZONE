
import axios from "axios";

const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  withCredentials: true,
});

// Add JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Handle JSON and FormData
  if (config.data instanceof FormData) {
    delete config.headers["Content-Type"];
  } else {
    config.headers["Content-Type"] = "application/json";
  }

  return config;
});

// Handle blocked users
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error.response?.status === 403 &&
      error.response?.data?.message ===
        "Your account has been blocked"
    ) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      alert("Your account has been blocked by the admin.");

      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

export default api;
