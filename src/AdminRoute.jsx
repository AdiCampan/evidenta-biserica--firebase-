import React, { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "./Context";
import { doc, getDoc } from "firebase/firestore";
import { firestore } from "./firebase-config";

const AdminRoute = ({ children }) => {
  const { currentUser } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdminRole = async () => {
      if (!currentUser) {
        setLoading(false);
        return;
      }

      try {
        // Verificar si el usuario tiene rol de administrador
        const userRoleRef = doc(firestore, "userRoles", currentUser.uid);
        const userRoleSnap = await getDoc(userRoleRef);

        if (userRoleSnap.exists() && userRoleSnap.data().role === "admin") {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }
      } catch (error) {
        console.error("Error al verificar rol de administrador:", error);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    checkAdminRole();
  }, [currentUser]);

  // Mostrar un indicador de carga mientras se verifica el rol
  if (loading) {
    return (
      <div className="login">
        <div className="login-section">
          <div className="glass-container" style={{ textAlign: "center" }}>
            <div className="spinner"></div>
            <p style={{ color: "white", marginTop: "20px" }}>
              Verificando permisos...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Redirigir a la página de inicio si el usuario no es administrador
  if (!currentUser || !isAdmin) {
    return <Navigate to="/" />;
  }

  return children;
};

export default AdminRoute;