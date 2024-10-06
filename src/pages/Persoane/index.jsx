import Transferuri from "./Transferuri";
import Boteze from "./Boteze";
import Persoane from "./Persoane";
import Membrii from "./Membrii";
import Speciale from "./Speciale";
import Familii from "./Familii";
import { useEffect, useState } from "react";
import { collection, onSnapshot, query } from "firebase/firestore";
import { firestore } from "../../firebase-config";
import { Button } from "react-bootstrap"; // Importa el botón de react-bootstrap

const PersonsPage = () => {
  const [persoane, setPersoane] = useState([]);
  const [activeSection, setActiveSection] = useState("persoane"); // Estado para gestionar la sección activa

  const q = query(collection(firestore, "persoane"));

  useEffect(() => {
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
  }, []);

  const renderSection = () => {
    switch (activeSection) {
      case "persoane":
        return <Persoane />;
      case "membrii":
        return <Membrii />;
      case "boteze":
        return <Boteze persoane={persoane} />;
      case "speciale":
        return <Speciale persoane={persoane} />;
      case "transferuri":
        return <Transferuri persoane={persoane} />;
      case "familii":
        return <Familii />;
      default:
        return <Persoane />; // Valor por defecto
    }
  };

  return (
    <div>
      <div className="button-group">
        {/* <Button variant="primary" onClick={() => setActiveSection("persoane")}>
          Persoane
        </Button>
        <Button variant="primary" onClick={() => setActiveSection("membrii")}>
          Membrii
        </Button>
        <Button variant="primary" onClick={() => setActiveSection("boteze")}>
          Boteze
        </Button>
        <Button variant="primary" onClick={() => setActiveSection("speciale")}>
          Cazuri Speciale
        </Button>
        <Button
          variant="primary"
          onClick={() => setActiveSection("transferuri")}
        >
          Transferuri
        </Button>
        <Button variant="primary" onClick={() => setActiveSection("familii")}>
          Familii
        </Button> */}
      </div>

      <div className="section-content">
        {renderSection()} {/* Renderiza la sección activa */}
      </div>
    </div>
  );
};

export default PersonsPage;

// import Tab from "react-bootstrap/Tab";
// import Tabs from "react-bootstrap/Tabs";
// import Transferuri from "./Transferuri";
// import Boteze from "./Boteze";
// import Persoane from "./Persoane";
// import Membrii from "./Membrii";
// import Speciale from "./Speciale";
// import Familii from "./Familii";
// import { useEffect, useState } from "react";
// import { collection, onSnapshot, query } from "firebase/firestore";
// import { firestore } from "../../firebase-config";

// const PersonsPage = () => {
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

//   return (
//     <Tabs id="controlled-tab-example" className="mb-3">
//       <Tab eventKey="persoane" title="Persoane">
//         {<Persoane />}
//       </Tab>
//       <Tab eventKey="membrii" title="Membrii">
//         {<Membrii />}
//       </Tab>
//       <Tab eventKey="boteze" title="Boteze">
//         {<Boteze persoane={persoane} />}
//       </Tab>
//       <Tab eventKey="observatii" title="Cazuri Speciale">
//         {<Speciale persoane={persoane} />}
//       </Tab>
//       <Tab eventKey="transferuri" title="Transferuri">
//         {<Transferuri persoane={persoane} />}
//       </Tab>
//       <Tab eventKey="familii" title="Familii">
//         {<Familii />}
//       </Tab>
//     </Tabs>
//   );
// };

// export default PersonsPage;
