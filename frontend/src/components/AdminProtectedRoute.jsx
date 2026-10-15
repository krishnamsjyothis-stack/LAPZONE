import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import api from "../api/axios";

function AdminProtectedRoute() {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    const checkAdminSession = async () => {
      try {
        const response = await api.get("/admin/session");

        if (response.data.authenticated) {
          setAuthenticated(true);
        }
      } catch (error) {
        console.log("Admin session not active");
        setAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkAdminSession();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Checking admin session...</p>
      </div>
    );
  }

  if (!authenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  return <Outlet />;
}

export default AdminProtectedRoute;