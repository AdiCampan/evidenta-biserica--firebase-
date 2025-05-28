import React, { useState, useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import Navbar from "./components/Navbar/Navbar";
import Persoana from "./pages/Persoana/Persoana";
import "./App.scss";
import Persoane from "./pages/Persoane/Persoane";
import Membrii from "./pages/Persoane/Membrii";
import Boteze from "./pages/Persoane/Boteze";
import Speciale from "./pages/Persoane/Speciale";
import Transferuri from "./pages/Persoane/Transferuri";
import Familii from "./pages/Persoane/Familii";
import Archive from "./pages/Persoane/Archive";
import Home from "./pages/Home";
import Grafice from "./pages/Grafice";
import LogIn from "./pages/Login/Login";
import SignUp from "./pages/Login/SignUp";
import CreateAdmin from "./pages/Admin/CreateAdmin";
import AdminManagement from "./pages/Admin/AdminManagement";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth, firestore } from "./firebase-config";
import { collection, onSnapshot, query } from "firebase/firestore";
import { initializeAuthorizedAdmins } from "./utils/initializeAdminCollection";
import ProtectedRoute from "./ProtectedRoute";
import AdminRoute from "./AdminRoute";
import { AuthProvider, useAuth } from "./Context";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  BarElement,
} from "chart.js";


// Registro de elementos del gráfico
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  BarElement,
  ArcElement
);

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <MainApp />
      </AuthProvider>
    </BrowserRouter>
  );
}

function MainApp() {
  const [logedUser, setLogedUser] = useState();
  const [persoane, setPersoane] = useState([]);
  const location = useLocation();
  const { currentUser } = useAuth();
  
  // Inicializar la colección de administradores autorizados al cargar la aplicación
  useEffect(() => {
    initializeAuthorizedAdmins();
  }, []);

  // Solo cargar los datos si el usuario está logueado
  useEffect(() => {
    console.log('Estado de autenticación:', currentUser ? 'Usuario autenticado' : 'No autenticado');
    
    if (currentUser) {
      console.log('Intentando cargar datos de personas...');
      const q = query(collection(firestore, "persoane"));
      
      try {
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
          console.log('Snapshot recibido con', querySnapshot.size, 'documentos');
          const tmpArray = [];
          querySnapshot.forEach((doc) => {
            const childKey = doc.id;
            const childData = doc.data();
            tmpArray.push({ id: childKey, ...childData });
          });
          console.log('Datos cargados correctamente:', tmpArray.length, 'personas');
          setPersoane(tmpArray);
        }, (error) => {
          console.error('Error al escuchar cambios en Firestore:', error);
        });

        // Limpiar el efecto
        return () => unsubscribe();
      } catch (error) {
        console.error('Error al configurar el listener de Firestore:', error);
      }
    } else {
      console.log('No hay usuario autenticado, no se cargarán datos');
    }
  }, [currentUser]);
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setLogedUser(user.email);
      } else {
        setLogedUser(""); // Resetear si no hay usuario
      }
    });

    // Limpiar el efecto
    return () => unsubscribe();
  }, []);

  const logOut = () => {
    signOut(auth)
      .then(() => {
        console.log("User is Log Out");
        setLogedUser("");
      })
      .catch((error) => {
        console.error("Error logging out:", error);
      });
  };

  return (
    <div>
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />
        {/* Rutas protegidas */}
        <Route
          path="/grafice"
          element={
            <ProtectedRoute>
              <Grafice persoane={persoane} />
            </ProtectedRoute>
          }
        />
        <Route path="/login" element={<LogIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route
          path="/admin/create"
          element={
            <AdminRoute>
              <CreateAdmin />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/manage"
          element={
            <AdminRoute>
              <AdminManagement />
            </AdminRoute>
          }
        />
        <Route
          path="/persoane"
          element={
            <ProtectedRoute>
              <Persoane persoane={persoane} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/persoane/membrii"
          element={
            <ProtectedRoute>
              <Membrii persoane={persoane} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/persoane/boteze"
          element={
            <ProtectedRoute>
              <Boteze persoane={persoane} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/persoane/cazuri-speciale"
          element={
            <ProtectedRoute>
              <Speciale persoane={persoane} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/persoane/transferuri"
          element={
            <ProtectedRoute>
              <Transferuri persoane={persoane} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/persoane/familii"
          element={
            <ProtectedRoute>
              <Familii persoane={persoane} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/persoane/archive"
          element={
            <ProtectedRoute>
              <Archive persoane={persoane} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/persoane/:id"
          element={
            <ProtectedRoute>
              <Persoana persoane={persoane} />
            </ProtectedRoute>
          }
        />
      </Routes>
    </div>
  );
}

export default App;
