import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const AdminProtectedRoute = ({ children }) => {
  const { user } = useAuth();

  // If no user is logged in, redirect to the admin login
  if (!user) {
    return <Navigate to="/admin/login" replace />;
  }

  // Ensure consistent role comparison
  const normalizedRole = String(user.role || "").toLowerCase();

  // If a user is logged in but is not an admin, redirect them away (or show unauthorized)
  if (normalizedRole !== "admin") {
    // If they are a doctor, send them to doctor dashboard, else home
    if (normalizedRole === "doctor") {
      return <Navigate to="/doctor/dashboard" replace />;
    }
    return <Navigate to="/" replace />;
  }

  // User is an admin, grant access
  return children;
};

export default AdminProtectedRoute;
