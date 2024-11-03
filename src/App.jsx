import React, { useState, useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  NavLink,
  Link,
  useLocation,
} from "react-router-dom";
import { Button } from "react-bootstrap";
import Persoana from "./pages/Persoana/Persoana";
import "./App.scss";
import Persoane from "./pages/Persoane/Persoane";
import Membrii from "./pages/Persoane/Membrii";
import Boteze from "./pages/Persoane/Boteze";
import Speciale from "./pages/Persoane/Speciale";
import Transferuri from "./pages/Persoane/Transferuri";
import Familii from "./pages/Persoane/Familii";
import Home from "./pages/Home";
import Grafice from "./pages/Grafice";
import LogIn from "./pages/Login/Login";
import SignUp from "./pages/Login/SignUp";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth, firestore } from "./firebase-config";
import { collection, onSnapshot, query } from "firebase/firestore";
import ProtectedRoute from "./ProtectedRoute";
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
import { FaUserCircle, FaSignInAlt, FaSignOutAlt } from "react-icons/fa";

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

  // Solo cargar los datos si el usuario está logueado
  useEffect(() => {
    if (currentUser) {
      const q = query(collection(firestore, "persoane"));
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const tmpArray = [];
        querySnapshot.forEach((doc) => {
          const childKey = doc.id;
          const childData = doc.data();
          tmpArray.push({ id: childKey, ...childData });
        });
        setPersoane(tmpArray);
      });

      // Limpiar el efecto
      return () => unsubscribe();
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
      <nav className="nav-bar">
        <div>
          <Button
            as={NavLink}
            to="/"
            className={({ isActive }) => (isActive ? "active" : "")}
            variant="primary"
          >
            Home
          </Button>
          {logedUser && (
            <>
              <Button
                as={NavLink}
                to="/grafice"
                className={({ isActive }) => (isActive ? "active" : "")}
                variant="primary"
              >
                Grafice
              </Button>
              <Button
                as={NavLink}
                to="/persoane"
                className={({ isActive }) => (isActive ? "active" : "")}
                variant="primary"
              >
                Persoane
              </Button>
              <Button
                as={NavLink}
                to="/persoane/membrii"
                className={({ isActive }) => (isActive ? "active" : "")}
                variant="primary"
              >
                Membrii
              </Button>
              <Button
                as={NavLink}
                to="/persoane/boteze"
                className={({ isActive }) => (isActive ? "active" : "")}
                variant="primary"
              >
                Boteze
              </Button>
              <Button
                as={NavLink}
                to="/persoane/speciale"
                className={({ isActive }) => (isActive ? "active" : "")}
                variant="primary"
              >
                Cazuri Speciale
              </Button>
              <Button
                as={NavLink}
                to="/persoane/transferuri"
                className={({ isActive }) => (isActive ? "active" : "")}
                variant="primary"
              >
                Transferuri
              </Button>
              <Button
                as={NavLink}
                to="/persoane/familii"
                className={({ isActive }) => (isActive ? "active" : "")}
                variant="primary"
              >
                Familii
              </Button>
            </>
          )}
        </div>

        <div className="userBox-container">
          {!logedUser ? (
            <Link to="/login" className="login-button">
              <FaSignInAlt className="icon" />
              <span>Log In</span>
            </Link>
          ) : (
            <div className="logged-user">
              <div className="user-info">
                <FaUserCircle className="user-icon" />
                <span className="user-name">{logedUser}</span>
              </div>
              <Link to="/login" className="logout-button" onClick={logOut}>
                <FaSignOutAlt className="icon" />
                {/* <span>Log Out</span> */}
              </Link>
            </div>
          )}
        </div>
      </nav>

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
          path="/persoane/speciale"
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

// import React, { useState, useEffect } from "react";
// import {
//   BrowserRouter,
//   Routes,
//   Route,
//   NavLink,
//   Link,
//   useLocation,
// } from "react-router-dom";
// import { Button } from "react-bootstrap";
// import Home from "./pages/Home";
// import Persoane from "./pages/Persoane/Persoane";
// import Contributii from "./pages/Contributii";
// import LogIn from "./pages/Login/Login";
// import SignUp from "./pages/Login/SignUp";
// import Persoana from "./pages/Persoana/Persoana";
// import Membrii from "./pages/Persoane/Membrii";
// import "./App.scss";
// import Grafice from "./pages/Grafice";
// import { onAuthStateChanged, signOut } from "firebase/auth";
// import { auth, firestore } from "./firebase-config";
// import Boteze from "./pages/Persoane/Boteze";
// import { collection, onSnapshot, query } from "firebase/firestore";
// import Speciale from "./pages/Persoane/Speciale";
// import Transferuri from "./pages/Persoane/Transferuri";
// import Familii from "./pages/Persoane/Familii";
// import {
//   Chart as ChartJS,
//   CategoryScale,
//   LinearScale,
//   PointElement,
//   LineElement,
//   Title,
//   Tooltip,
//   Legend,
//   ArcElement,
//   BarElement,
// } from "chart.js";
// import ProtectedRoute from "./ProtectedRoute"; // Importa el componente de rutas protegidas
// import { useAuth } from "./Context";
// import { AuthProvider } from "./Context";
// // import MainApp from "./MainApp"; // Separa tu lógica de rutas en un componente separado

// // Registro de elementos del gráfico
// ChartJS.register(
//   CategoryScale,
//   LinearScale,
//   PointElement,
//   LineElement,
//   Title,
//   Tooltip,
//   Legend,
//   BarElement,
//   ArcElement
// );

// function App() {
//   return (
//     <BrowserRouter>
//       <AuthProvider>
//         <MainApp />
//       </AuthProvider>
//     </BrowserRouter>
//   );
// }

// function MainApp() {
//   const [logedUser, setLogedUser] = useState();
//   const [persoane, setPersoane] = useState([]);
//   const location = useLocation(); // Ubicación de la ruta actual

//   const { currentUser } = useAuth();

//   const q = query(collection(firestore, "persoane"));
//   useEffect(() => {
//     onSnapshot(q, (querySnapshot) => {
//       const tmpArray = [];
//       querySnapshot.forEach((doc) => {
//         const childKey = doc.id;
//         const childData = doc.data();
//         tmpArray.push({ id: childKey, ...childData });
//       });
//       setPersoane(tmpArray);
//     });
//   }, []);

//   useEffect(() => {
//     onAuthStateChanged(auth, (user) => {
//       if (user) {
//         setLogedUser(user.email);
//       } else {
//         console.log("user is logged out");
//       }
//     });
//   }, []);

//   const logOut = () => {
//     signOut(auth)
//       .then(() => {
//         console.log("User is Log Out");
//         setLogedUser("");
//       })
//       .catch((error) => {
//         console.error("Error logging out:", error);
//       });
//   };

//   return (
//     <div>
//       <nav className="nav-bar">
//         <div>
//           <Button
//             as={NavLink}
//             to="/"
//             className={({ isActive }) => (isActive ? "active" : "")}
//             variant="primary"
//           >
//             Home
//           </Button>
//           <Button
//             as={NavLink}
//             to="/grafice"
//             className={({ isActive }) => (isActive ? "active" : "")}
//             variant="primary"
//           >
//             Grafice
//           </Button>
//           <Button
//             as={NavLink}
//             to="/persoane"
//             className={({ isActive }) => (isActive ? "active" : "")}
//             variant="primary"
//           >
//             Persoane
//           </Button>
//           <Button
//             as={NavLink}
//             to="/persoane/membrii"
//             className={({ isActive }) => (isActive ? "active" : "")}
//             variant="primary"
//           >
//             Membrii
//           </Button>
//           <Button
//             as={NavLink}
//             to="/persoane/boteze"
//             className={({ isActive }) => (isActive ? "active" : "")}
//             variant="primary"
//           >
//             Boteze
//           </Button>
//           <Button
//             as={NavLink}
//             to="/persoane/speciale"
//             className={({ isActive }) => (isActive ? "active" : "")}
//             variant="primary"
//           >
//             Cazuri Speciale
//           </Button>
//           <Button
//             as={NavLink}
//             to="/persoane/transferuri"
//             className={({ isActive }) => (isActive ? "active" : "")}
//             variant="primary"
//           >
//             Transferuri
//           </Button>
//           <Button
//             as={NavLink}
//             to="/persoane/familii"
//             className={({ isActive }) => (isActive ? "active" : "")}
//             variant="primary"
//           >
//             Familii
//           </Button>
//         </div>
//         <div>{logedUser}</div>
//         <div>
//           {!logedUser && (
//             <Link to="/login">
//               <Button variant="primary">Log In</Button>
//             </Link>
//           )}
//           {logedUser && (
//             <Link to="/login">
//               <Button variant="primary" onClick={logOut}>
//                 Log out
//               </Button>
//             </Link>
//           )}
//         </div>
//       </nav>

//       <Routes>
//         <Route path="/" element={<Home persoane={persoane} />} />
//         <Route path="/grafice" element={<Grafice persoane={persoane} />} />
//         <Route path="/login" element={<LogIn />} />
//         <Route path="/signup" element={<SignUp />} />
//         {/* Rutas protegidas */}
//         <Route
//           path="/persoane"
//           element={
//             <ProtectedRoute>
//               <Persoane persoane={persoane} />
//             </ProtectedRoute>
//           }
//         />
//         <Route
//           path="/persoane/membrii"
//           element={
//             <ProtectedRoute>
//               <Membrii persoane={persoane} />
//             </ProtectedRoute>
//           }
//         />
//         <Route
//           path="/persoane/boteze"
//           element={
//             <ProtectedRoute>
//               <Boteze persoane={persoane} />
//             </ProtectedRoute>
//           }
//         />
//         <Route
//           path="/persoane/speciale"
//           element={
//             <ProtectedRoute>
//               <Speciale persoane={persoane} />
//             </ProtectedRoute>
//           }
//         />
//         <Route
//           path="/persoane/transferuri"
//           element={
//             <ProtectedRoute>
//               <Transferuri persoane={persoane} />
//             </ProtectedRoute>
//           }
//         />
//         <Route
//           path="/persoane/familii"
//           element={
//             <ProtectedRoute>
//               <Familii persoane={persoane} />
//             </ProtectedRoute>
//           }
//         />
//         <Route
//           path="/persoane/:id"
//           element={
//             <ProtectedRoute>
//               <Persoana persoane={persoane} />
//             </ProtectedRoute>
//           }
//         />
//       </Routes>
//     </div>
//   );
// }

// export default App;
