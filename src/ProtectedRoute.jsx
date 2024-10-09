import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "./Context";

const ProtectedRoute = ({ children }) => {
  const { currentUser } = useAuth(); // Obtiene el usuario actual

  return currentUser ? children : <Navigate to="/login" />;
};

export default ProtectedRoute;
