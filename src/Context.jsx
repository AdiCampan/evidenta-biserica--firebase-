// Context.jsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { auth } from "./firebase-config"; // Asegúrate de que la ruta sea correcta
import { onAuthStateChanged } from "firebase/auth";

// Crear el contexto de autenticación
const AuthContext = createContext();

// Proveedor de contexto para envolver la aplicación
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar el estado de autenticación de Firebase
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false); // Dejar de mostrar el estado de carga cuando tenemos al usuario
    });

    return () => unsubscribe();
  }, []);

  const value = {
    currentUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

// Custom hook para usar el contexto de autenticación
export const useAuth = () => {
  return useContext(AuthContext);
};
