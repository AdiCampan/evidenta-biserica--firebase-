import Tab from "react-bootstrap/Tab";
import Tabs from "react-bootstrap/Tabs";
import Transferuri from "./Transferuri";
import Boteze from "./Boteze";
import Persoane from "./Persoane";
import Membrii from "./Membrii";
import Speciale from "./Speciale";
import Familii from "./Familii";
import { useEffect, useState } from "react";
import { collection, onSnapshot, query } from "firebase/firestore";
import { firestore } from "../../firebase-config";

const PersonsPage = () => {
  const [persoane, setPersoane] = useState("");

  const q = query(collection(firestore, "persoane"));
  useEffect(() => {
    onSnapshot(q, (querySnapshot) => {
      const tmpArray = [];
      querySnapshot.forEach((doc) => {
        const childKey = doc.id;
        const childData = doc.data();
        tmpArray.push({ id: childKey, ...childData });
        setPersoane(tmpArray);
      });
    });
  }, []);

  return (
    <Tabs id="controlled-tab-example" className="mb-3">
      <Tab eventKey="persoane" title="Persoane">
        {<Persoane />}
      </Tab>
      <Tab eventKey="membrii" title="Membrii">
        {<Membrii />}
      </Tab>
      <Tab eventKey="boteze" title="Boteze">
        {<Boteze persoane={persoane} />}
      </Tab>
      <Tab eventKey="observatii" title="Cazuri Speciale">
        {<Speciale persoane={persoane} />}
      </Tab>
      <Tab eventKey="transferuri" title="Transferuri">
        {<Transferuri persoane={persoane} />}
      </Tab>
      <Tab eventKey="familii" title="Familii">
        {<Familii />}
      </Tab>
    </Tabs>
  );
};

export default PersonsPage;
