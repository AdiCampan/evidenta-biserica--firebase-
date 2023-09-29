import { useParams, useNavigate } from "react-router-dom";
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
  // const { data, error, isLoading, isFetching } = useGetMemberQuery(id);
  const [data, setData] = useState();
  // const [modifyMember, result] = useModifyMemberMutation();
  // const [addRelation] = useAddRelationMutation();
  const [activeTab, setActiveTab] = useState("general");
  const [currentData, setCurrentData] = useState(null);

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
  }, []);

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
    console.log("current data", currentData);
    if (currentData.firstName != "" && currentData.lastName != "") {
      modifyMember(currentData);
    } else {
      alert("Nu stergeti numele sau prenumele !");
    }
    navigate("/persoane");

    const children = data[0]?.relations?.find(
      (relation) => relation.type === "child"
    )?.person;
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
    <Card>
      <Tabs
        id="controlled-tab-example"
        activeKey={activeTab}
        onSelect={(k) => setActiveTab(k)}
        className="mb-3"
      >
        <Tab eventKey="general" title="General">
          {data && <General data={data} dataUpdated={dataUpdated} />}
        </Tab>
        <Tab eventKey="familie" title="Familie">
          {data && <Familie data={data} dataUpdated={dataUpdated} />}
        </Tab>
        <Tab eventKey="biserica" title="Biserica">
          {data && <Biserica data={data} dataUpdated={dataUpdated} />}
        </Tab>
        <Tab eventKey="observatii" title="Observatii">
          {data && <Observatii data={data} dataUpdated={dataUpdated} />}
        </Tab>
      </Tabs>
      <Card>
        <Card.Body>
          <Form>
            <Button
              variant="primary"
              type="button"
              onClick={saveData}
              // disabled={result.isLoading}
            >
              Salveaza
            </Button>

            <DownloadLink
              label="Descarca link Persoana"
              filename={`/persoane/${id}`}
              exportFile={() => `/persoane/${id}`}
            />
            <Link to={`/persoane/${id}`} target="_blank" download>
              Download
            </Link>
            {/* <a href="https://google.com" download>Download link</a> */}
          </Form>
        </Card.Body>
      </Card>
    </Card>
  );
}

export default Persoana;
