import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../components/AuthContext";

const ProtectedRoute = ({ allowedRoles = null }) => {
  const { authState, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div
        style={{
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        인증 정보 로딩 중...
      </div>
    );
  }

  if (!authState.isLoggedIn) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (!authState.isSignedUp) {
    return <Navigate to="/login/need-signed-up" replace />;
  }

  if (allowedRoles && authState.role && !allowedRoles.includes(authState.role)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
