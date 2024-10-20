import { useParams, useNavigate, useLocation } from "react-router-dom";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import React, { useState, useEffect } from "react";
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

function Persoana() {
  const navigate = useNavigate();

  const { id } = useParams();
  const location = useLocation(); // Se usa para obtener el estado
  const { persons } = location.state || {}; // Desestructuramos persons del state
  // const { data, error, isLoading, isFetching } = useGetMemberQuery(id);
  const [data, setData] = useState();
  // const [modifyMember, result] = useModifyMemberMutation();
  // const [addRelation] = useAddRelationMutation();
  const [activeTab, setActiveTab] = useState("general");
  const [currentData, setCurrentData] = useState(null);
  const [curentPerson, setCurentPerson] = useState(null);

  const getMemberData = async () => {
    const docRef = doc(firestore, "persoane", id);
    const docSnap = await getDoc(docRef);
    const tmpArray = [];
    if (docSnap.exists()) {
      tmpArray.push(docSnap.data(), id);
      setData(tmpArray);
    } else {
      console.log("No such document!");
    }
  };

  useEffect(() => {
    getMemberData();
    if (data) {
      setCurentPerson(data[0]);
    }
  }, []);
  console.log("persons", persons);

  const modifyMember = (newData) => {
    const docRef = doc(firestore, "persoane", id);
    updateDoc(docRef, newData);
  };

  // useEffect(() => {
  //   if (data) {
  //     setCurrentData(data);
  //     console.log("current", currentData);
  //   }
  // }, [data]);

  // useEffect(() => {
  //   if (result.isSuccess) {
  //     navigate("/persoane");
  //   }
  // }, [result]);

  const saveData = () => {
    if (currentData.firstName != "" && currentData.lastName != "") {
      modifyMember(currentData);
    } else {
      alert("Nu stergeti numele sau prenumele !");
    }
    navigate("/persoane");

    // if (spouse && children.length > 0) {
    //   console.log("update spouse");
    //   modifyMember({
    //     id: spouse.person,
    //     relations: children,
    //   });
    // } else {
    //   console.log("no spuse and children", spouse, children);
    // }
    // addRelation({
    //   owner: currentData.id,
    //   person: currentData.partner,
    //   type: currentData.sex ? 'wife' : 'husband',
    // });
  };

  const dataUpdated = (updatedData) => {
    setCurrentData((prevState) => {
      return {
        ...prevState,
        id,
        ...updatedData,
      };
    });
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
                  {currentData.firstName} {currentData.lastName}
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

                {/* <DownloadLink
                  label="Descarca link Persoana"
                  filename={`/persoane/${id}`}
                  exportFile={() => `/persoane/${id}`}
                /> */}
                {/* <Link to={`/persoane/${id}`} target="_blank" download>
                  Download
                </Link> */}
                {/* <a href="https://google.com" download>Download link</a> */}
              </Form>
            </Card.Body>
          </Card>
        </Card>
      </div>
    </div>
  );
}

export default Persoana;
