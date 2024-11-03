import { useParams, useNavigate, useLocation } from "react-router-dom";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import React, { useState, useEffect, useRef } from "react";
import {
  useGetMemberQuery,
  useModifyMemberMutation,
  useAddRelationMutation,
} from "../../services/members";
import { Card } from "react-bootstrap";
import Tab from "react-bootstrap/Tab";
import Tabs from "react-bootstrap/Tabs";
import "./Persoana.css";
import General from "./General";
import Biserica from "./Biserica";
import Familie from "./Familie";
import Observatii from "./Observatii";
import DownloadLink from "react-download-link";
import { BrowserRouter, Routes, Route, NavLink, Link } from "react-router-dom";
import { get, onValue, ref } from "firebase/database";
import { db, firestore } from "../../firebase-config";
import { memo } from "react";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";

/// Hook para manejar la advertencia de salida
const useBeforeUnload = (isModified) => {
  useEffect(() => {
    const handleBeforeUnload = (event) => {
      if (isModified) {
        const message = "Există modificări nesalvate. Doriți să ieșiți?";
        event.preventDefault();
        event.returnValue = message; // Para navegadores modernos
        return message; // Para navegadores más antiguos
      }
    };
    const handleWindowUnload = (event) => {
      if (isModified) {
        const confirmed = window.confirm(
          "You have unsaved changes. Do you really want to leave?"
        );
        if (confirmed) {
          setIsModified(false); // Desactiva la advertencia después de aceptar
        } else {
          event.preventDefault(); // Evita que la navegación ocurra si cancelas
        }
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("popstate", handleWindowUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("popstate", handleWindowUnload);
    };
  }, [isModified]);
};

function Persoana() {
  const navigate = useNavigate();

  const { id } = useParams();
  const location = useLocation(); // Se usa para obtener el estado
  const { persons } = location.state || {}; // Desestructuramos persons del state
  const [data, setData] = useState();
  const [isModified, setIsModified] = useState(false); // Estado para cambios no guardados
  const [activeTab, setActiveTab] = useState("general");
  const [currentData, setCurrentData] = useState(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true); // Estado para controlar la carga inicial
  const initialDataRef = useRef(null); // Para almacenar los datos iniciales
  const hasLoadedData = useRef(false); // Controla si los datos ya han sido cargados una vez
  // const [curentPerson, setCurentPerson] = useState(null);
  console.log("Data", data);
  const getMemberData = async () => {
    const docRef = doc(firestore, "persoane", id);
    const docSnap = await getDoc(docRef);
    const tmpArray = [];
    if (docSnap.exists()) {
      tmpArray.push(docSnap.data(), id);
      setData(tmpArray);
      setCurrentData(tmpArray);
      initialDataRef.current = tmpArray; // Guarda los datos originales al cargar
      hasLoadedData.current = true; // Marca como que los datos fueron cargados
      setIsInitialLoad(false); // Marcar la carga inicial como completada
    } else {
      console.log("No such document!");
    }
  };

  useEffect(() => {
    getMemberData();
    // if (data) {
    //   setCurentPerson(data[0]);
    // }
  }, []);

  // Muestra advertencia si hay cambios no guardados
  useBeforeUnload(isModified);

  const modifyMember = (newData) => {
    const docRef = doc(firestore, "persoane", id);
    updateDoc(docRef, newData);
  };

  const saveData = () => {
    if (data[0].firstName != "" && data[0].lastName != "") {
      modifyMember(currentData);
      setIsModified(false); // Reseteamos el estado de modificación al guardar
      navigate("/persoane");
    } else {
      alert("Nu stergeti numele sau prenumele !");
    }
  };

  // Función para verificar si los datos han cambiado comparado con `initialDataRef`
  const hasDataChanged = (updatedData) => {
    return (
      JSON.stringify(initialDataRef.current) !== JSON.stringify(updatedData)
    );
  };

  // Función que actualiza los datos y verifica si han cambiado
  const dataUpdated = (updatedData) => {
    setCurrentData(updatedData);

    // Solo marca `isModified` si hay diferencias y la carga inicial ha terminado
    if (!isInitialLoad.current && hasDataChanged(updatedData)) {
      setIsModified(true);
    }
  };

  return (
    <div
      style={{ display: "flex", justifyContent: "center", marginTop: "15px" }}
    >
      <div
        style={{
          width: "80%",
          borderRadius: "15%",
          backgroundColor: "#b1cdd2",
        }}
      >
        <Card
          style={{
            borderRadius: "15%",
          }}
        >
          <Card style={{ width: "100%" }}>
            <Card.Body
              style={{
                display: "flex",
                justifyContent: "center",
                backgroundColor: "#b1cdd2",
              }}
            >
              FISA PERSONALA:
              {currentData && (
                <Card.Title style={{ marginLeft: "20px" }}>
                  {data[0].firstName} {data[0].lastName}
                </Card.Title>
              )}
            </Card.Body>
          </Card>
          <Tabs
            id="controlled-tab-example"
            activeKey={activeTab}
            onSelect={(k) => setActiveTab(k)}
            className="mb-3"
          >
            <Tab eventKey="general" title="GENERAL">
              {data && (
                <General
                  isModified={isModified}
                  data={data}
                  dataUpdated={dataUpdated}
                  persoane={persons}
                />
              )}
            </Tab>
            <Tab eventKey="familie" title="FAMILIE">
              {data && (
                <Familie
                  data={data}
                  dataUpdated={dataUpdated}
                  persoane={persons}
                />
              )}
            </Tab>
            <Tab eventKey="biserica" title="BISERICA">
              {data && (
                <Biserica
                  data={data}
                  dataUpdated={dataUpdated}
                  persoane={persons}
                />
              )}
            </Tab>
            <Tab eventKey="observatii" title="OBSERVATII">
              {data && (
                <Observatii
                  data={data}
                  dataUpdated={dataUpdated}
                  persoane={persons}
                />
              )}
            </Tab>
          </Tabs>
          <Card>
            <Card.Body>
              <Form style={{ marginLeft: "25px" }}>
                <Button
                  variant="primary"
                  type="button"
                  onClick={saveData}
                  // disabled={result.isLoading}
                >
                  Salveaza
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Card>
      </div>
    </div>
  );
}

export default Persoana;
