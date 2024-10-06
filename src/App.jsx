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
import Home from "./pages/Home";
import Persoane from "./pages/Persoane";
import Contributii from "./pages/Contributii";
import LogIn from "./pages/Login/Login";
import SignUp from "./pages/Login/SignUp";
import Persoana from "./pages/Persoana/Persoana";
import Membrii from "./pages/Persoane/Membrii";
import "./App.scss";
import Grafice from "./pages/Grafice";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth, firestore } from "./firebase-config";
import Boteze from "./pages/Persoane/Boteze";
import { collection, onSnapshot, query } from "firebase/firestore";
import Speciale from "./pages/Persoane/Speciale";
import Transferuri from "./pages/Persoane/Transferuri";
import Familii from "./pages/Persoane/Familii";
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
      <MainApp />
    </BrowserRouter>
  );
}

function MainApp() {
  const [logedUser, setLogedUser] = useState();
  const [persoane, setPersoane] = useState([]);
  const location = useLocation(); // Ubicación de la ruta actual

  const q = query(collection(firestore, "persoane"));
  useEffect(() => {
    onSnapshot(q, (querySnapshot) => {
      const tmpArray = [];
      querySnapshot.forEach((doc) => {
        const childKey = doc.id;
        const childData = doc.data();
        tmpArray.push({ id: childKey, ...childData });
      });
      setPersoane(tmpArray);
    });
  }, []);

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        setLogedUser(user.email);
      } else {
        console.log("user is logged out");
      }
    });
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
        </div>
        <div>{logedUser}</div>
        <div>
          {!logedUser && (
            <Link to="/login">
              <Button variant="primary">Log In</Button>
            </Link>
          )}
          {logedUser && (
            <Link to="/login">
              <Button variant="primary" onClick={logOut}>
                Log out
              </Button>
            </Link>
          )}
        </div>
      </nav>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/grafice" element={<Grafice />} />
        <Route path="/login" element={<LogIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/persoane" element={<Persoane />} />
        <Route path="/persoane/membrii" element={<Membrii />} />
        <Route
          path="/persoane/boteze"
          element={<Boteze persoane={persoane} />}
        />
        <Route
          path="/persoane/speciale"
          element={<Speciale persoane={persoane} />}
        />
        <Route
          path="/persoane/transferuri"
          element={<Transferuri persoane={persoane} />}
        />
        <Route
          path="/persoane/familii"
          element={<Familii persoane={persoane} />}
        />
        <Route path="/persoane/:id" element={<Persoana />} />
      </Routes>
    </div>
  );
}

export default App;

// import React, { useState, useEffect } from "react";
// import { BrowserRouter, Routes, Route, NavLink, Link } from "react-router-dom";
// import { Button, Tab, Tabs } from "react-bootstrap";
// import Home from "./pages/Home";
// import Biserici from "./pages/Biserici";
// import Persoane from "./pages/Persoane";
// import Contributii from "./pages/Contributii";
// import LogIn from "./pages/Login/Login";
// import SignUp from "./pages/Login/SignUp";
// import Persoana from "./pages/Persoana/Persoana";
// import Membrii from "./pages/Persoane/Membrii";
// import "./App.scss";
// import Grafice from "./pages/Grafice";
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
// import { onAuthStateChanged, signOut } from "firebase/auth";
// import { auth, firestore } from "./firebase-config";
// import Boteze from "./pages/Persoane/Boteze";
// import { collection, onSnapshot, query } from "firebase/firestore";
// import Speciale from "./pages/Persoane/Speciale";
// import Transferuri from "./pages/Persoane/Transferuri";
// import Familii from "./pages/Persoane/Familii";

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
//   const [logedUser, setLogedUser] = useState();
//   const [persoane, setPersoane] = useState("");

//   const q = query(collection(firestore, "persoane"));
//   useEffect(() => {
//     onSnapshot(q, (querySnapshot) => {
//       const tmpArray = [];
//       querySnapshot.forEach((doc) => {
//         const childKey = doc.id;
//         const childData = doc.data();
//         tmpArray.push({ id: childKey, ...childData });
//         setPersoane(tmpArray);
//       });
//     });
//   }, []);

//   useEffect(() => {
//     onAuthStateChanged(auth, (user) => {
//       if (user) {
//         // User is signed in, see docs for a list of available properties
//         // https://firebase.google.com/docs/reference/js/firebase.User
//         // const uid = user.uid;
//         // ...
//         setLogedUser(user.email);
//       } else {
//         // User is signed out
//         // ...
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
//         // An error happened.
//       });
//   };

//   const navClass = (isActive) => {
//     return isActive ? "active" : "";
//   };

//   return (
//     <BrowserRouter>
//       <nav className="nav-bar">
//         <div>
//           <Button as={NavLink} to="/" className={navClass} variant="primary">
//             Home
//           </Button>

//           <Button
//             as={NavLink}
//             to="/persoane"
//             className={navClass}
//             variant="primary"
//           >
//             PERSOANE
//           </Button>

//           <Button
//             as={NavLink}
//             to="/contributii"
//             className={navClass}
//             variant="primary"
//           >
//             Contributii
//           </Button>
//           <Button
//             as={NavLink}
//             to="/grafice"
//             className={navClass}
//             variant="primary"
//           >
//             Grafice
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
//         <Route path="/" element={<Home />} />
//         <Route path="/biserici" element={<Biserici />} />
//         <Route path="/persoane" element={<Persoane />} />
//         <Route path="/persoane/:id" element={<Persoana />} />
//         <Route path="/contributii" element={<Contributii />} />
//         <Route path="/grafice" element={<Grafice />} />
//         <Route path="/login" element={<LogIn />} />
//         <Route path="/signup" element={<SignUp />} />
//         <Route path="/persoane/membrii" element={<Membrii />} />
//       </Routes>
//     </BrowserRouter>
//   );
// }

// export default App;
