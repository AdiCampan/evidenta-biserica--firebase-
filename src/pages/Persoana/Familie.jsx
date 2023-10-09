import React, { useState, useEffect } from "react";
import { Card } from "react-bootstrap";
import DatePicker from "react-datepicker";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Table from "react-bootstrap/Table";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import InputGroup from "react-bootstrap/InputGroup";
import Button from "react-bootstrap/Button";
import { Typeahead } from "react-bootstrap-typeahead";
import { useGetMembersQuery } from "../../services/members";
import Copil from "./Copil";
import Confirmation from "../../Confirmation";
import AddPerson from "../Persoane/AddPerson";
import { query } from "firebase/database";
import { collection, doc, getDocs, updateDoc } from "firebase/firestore";
import { firestore } from "../../firebase-config";

function uuid() {
  return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, (c) =>
    (
      c ^
      (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))
    ).toString(16)
  );
}

const Familie = ({ dataUpdated, data }) => {
  const [pereche, setPereche] = useState("");
  const [servCivil, setServCivil] = useState("");
  const [servRel, setServRel] = useState("");
  const [biserica, setBiserica] = useState("");
  const [dataNasteriiCopil, setDataNasteriiCopil] = useState("");
  const [sexCopil, setSexCopil] = useState("");
  const [idToDelete, setIdToDelete] = useState(null);
  const [persoane, setPersoane] = useState();
  const [initialSpouse, setInitialSpouse] = useState();
  const [childList, setChildList] = useState(
    data[0]?.relations
      ?.filter((relation) => relation.type === "child")
      .map((relation) => ({
        childId: relation.person,
        index: relation.id,
      })) || []
  );

  // -------------- OBTENER LISTA DE PERSOANE -----------------------------------//
  const waitingPersons = async () => {
    const q = query(collection(firestore, "persoane"));

    const querySnapshot = await getDocs(q);
    const tmpArray = [];
    querySnapshot.forEach((doc) => {
      const childKey = doc.id;
      const childData = doc.data();
      tmpArray.push({ id: childKey, ...childData });
      setPersoane(tmpArray);
    });
  };
  useEffect(() => {
    waitingPersons();
  }, []);

  // ------------------------------- ALEGE SOT/SOTIE (TypeAhead) ----------------------------- //
  const onPersonChange = (persons) => {
    if (persons.length > 0) {
      setPereche(persons[0].id);
    } else {
      setPereche("");
    }
  };

  // --------------   SETEAZA PERECHEA SI COPII   ---------------------------   //
  useEffect(() => {
    let partener = {};

    if (pereche) {
      partener = {
        person: pereche,
        type: data.sex ? "wife" : "husband",
        civilWeddingDate: servCivil,
        religiousWeddingDate: servRel,
        weddingChurch: biserica,
      };
    }
    const children =
      childList &&
      childList.map((child) => ({
        person: child.childId,
        type: "child",
      }));

    dataUpdated({
      relations: [partener, ...children],
    });
  }, [
    data,
    pereche,
    servCivil,
    servRel,
    biserica,
    childList,
    dataNasteriiCopil,
  ]);

  // ----------------------------- SET DATE SECUNDARE ------------------------------------- //
  const spouse = data[0]?.relations?.find(
    (relation) => relation.type === "wife" || relation.type === "husband"
  );
  useEffect(() => {
    setServCivil(
      spouse?.civilWeddingDate ? (spouse?.civilWeddingDate).toDate() : ""
    );
    setServRel(
      spouse?.religiousWeddingDate
        ? (spouse?.religiousWeddingDate).toDate()
        : ""
    );
    setBiserica(spouse?.weddingChurch || "");
    setDataNasteriiCopil(data?.birthDate || "");
    setSexCopil(data?.sex || "");
  }, []);

  //prima data cand se alege partenerul se seteaza in Firestore...
  //... perechea la partenerul persoanei curente :) //

  if (pereche) {
    const spouseId = pereche;
    const children =
      childList &&
      childList.map((child) => ({
        person: child.childId,
        type: "child",
      }));

    let partener = {};
    partener = {
      person: data[1],
      type: data[0].sex ? "husband" : "wife",
      civilWeddingDate: servCivil,
      religiousWeddingDate: servRel,
      weddingChurch: biserica,
    };
    //   SALVEZ DATELE IN FIRESTORE LA PERECHEA PERSOANEI CURENTE //
    const updateSpouse = { relations: [partener, ...children] };
    const docRef = doc(firestore, "persoane", spouseId);
    updateDoc(docRef, updateSpouse);
    console.log("updated in Firestore", spouseId);

    //   SALVEZ DATELE IN FIRESTORE LA PERSOANA CURENTA //
    let partenerulPersoaneiCurrente = {};
    partenerulPersoaneiCurrente = {
      person: pereche,
      type: data[0].sex ? "wife" : "husband",
      civilWeddingDate: servCivil,
      religiousWeddingDate: servRel,
      weddingChurch: biserica,
    };

    const updateCurrentPerson = {
      relations: [partenerulPersoaneiCurrente, ...children],
    };
    const docRefOfCurrent = doc(firestore, "persoane", data[1]);
    updateDoc(docRefOfCurrent, updateCurrentPerson);
    console.log("updated in Firestore", data[1]);
  }

  // -------------- SETEAZA IN FIREBASE RELATIA PERSOANEI CURENTE ----------------------//
  const relation = data[0]?.relations?.filter(
    (relation) => relation.type === "wife" || relation.type === "husband"
  );
  useEffect(() => {
    //   FILTREZ  RELATIA PERSOANEI CURENTE //
    if (relation?.length > 0) {
      //  caut si  FILTREZ PERECHEA PERSOANEI CURENTE //
      const spouseId = relation[0]?.person;
      const spouseData = persoane?.filter((p) => p.id === spouseId);
      setInitialSpouse(relation);
      const children =
        childList &&
        childList.map((child) => ({
          person: child.childId,
          type: "child",
        }));

      let partener = {};
      partener = {
        person: data[1],
        type: data.sex ? "husband" : "wife",
        civilWeddingDate: servCivil,
        religiousWeddingDate: servRel,
        weddingChurch: biserica,
      };
      //   SALVEZ DATELE IN FIRESTORE LA PERECHEA PERSOANEI CURENTE //
      const updateSpouse = { relations: [partener, ...children] };
      const docRef = doc(firestore, "persoane", spouseId);
      updateDoc(docRef, updateSpouse);
      console.log("updated");
    }
    //  DACA ARE pereche, SETEZ PERECHEA LA PERSOANA CURENTA,  ( DIN FIRESTORE ) //
    const relationPair = data[0].relations;
    if (typeof relationPair == "object") {
      setPereche(relationPair[0]?.person || "");
    } else if (relation) {
      setPereche(relation[0]?.person);
    } else {
      setPereche("");
    }
  }, [persoane, data, dataNasteriiCopil]);

  const addChildField = () => {
    setChildList([...childList, { childId: "", index: uuid() }]);
  };

  const updateChild = (childId, index) => {
    setChildList(
      childList.map((currentChild) => {
        if (index === currentChild.index) {
          return { childId, index: currentChild.index };
        }
        return currentChild;
      })
    );
  };

  const removeChild = (childIndex) => {
    setChildList(
      childList.filter((child) => {
        if (child.index !== childIndex) {
          return true;
        }
        setIdToDelete(null);
        return false;
      })
    );
  };

  return (
    <Container>
      <Card>
        <Row>
          <Col>
            <InputGroup size="sm" className="mb-3">
              <div style={{ display: "flex" }}>
                <InputGroup.Text id="inputGroup-sizing-sm">
                  Sot/Sotie
                </InputGroup.Text>
                <Typeahead
                  id="pereche"
                  onChange={onPersonChange}
                  labelKey={(option) =>
                    `${option.firstName} ${option.lastName}`
                  }
                  options={
                    persoane?.filter((person) => {
                      if (
                        // verificam daca persoana e de sex diferit
                        person.sex !== data[0].sex &&
                        // si persoana nu mai are o alta relatie de sot/sotie
                        !person.relations?.find(
                          (relation) =>
                            relation.type === "husband" ||
                            relation.type === "wife"
                        )
                      ) {
                        return true;
                      }
                      return false;
                    }) || []
                  }
                  placeholder="Alege o persoana..."
                  selected={
                    persoane?.filter((person) => person.id === pereche) ||
                    initialSpouse ||
                    []
                  }
                />
              </div>
              <AddPerson label="+" />
            </InputGroup>
          </Col>
          <Col>
            <InputGroup
              size="sm"
              className="mb-3"
              style={{ display: "flex", flexWrap: "nowrap" }}
            >
              <InputGroup.Text id="inputGroup-sizing-sm">
                Data Serv. Civil
              </InputGroup.Text>
              <DatePicker
                selected={servCivil}
                onChange={(date) => setServCivil(date)}
                peekNextMonth
                maxDate={new Date()}
                showMonthDropdown
                showYearDropdown
                dropdownMode="select"
                dateFormat="dd/MM/yyyy"
              />
            </InputGroup>
          </Col>
        </Row>
        <Row>
          <Col>
            <InputGroup
              size="sm"
              className="mb-3"
              style={{ display: "flex", flexWrap: "nowrap" }}
            >
              <InputGroup.Text id="inputGroup-sizing-sm">
                Data Serv.Rel.
              </InputGroup.Text>
              <DatePicker
                selected={servRel}
                onChange={(date) => setServRel(date)}
                peekNextMonth
                showMonthDropdown
                maxDate={new Date()}
                showYearDropdown
                dropdownMode="select"
                dateFormat="dd/MM/yyyy"
              />
            </InputGroup>
          </Col>
          <Col>
            <InputGroup size="sm" className="mb-3">
              <InputGroup.Text id="inputGroup-sizing-sm">
                Efectuat in Biserica
              </InputGroup.Text>
              <Form.Control
                aria-label="Small"
                aria-describedby="inputGroup-sizing-sm"
                onChange={(event) => setBiserica(event.target.value)}
                value={biserica}
              />
            </InputGroup>
          </Col>
        </Row>
      </Card>
      <br />
      <br />
      {/* ------- COPII --------- */}
      <Card>
        Copii
        <Col>
          <InputGroup size="sm" className="mb-3">
            <Button onClick={addChildField}>Adauga un copil</Button>
          </InputGroup>
        </Col>
        <Table striped bordered hover size="sm">
          <thead>
            <tr>
              <th>Nume si Prenume</th>
              <th>Data Nasterii</th>
              <th>Varsta</th>
              <th>Sex</th>
            </tr>
          </thead>
          <tbody>
            {childList &&
              childList?.map((childItem) => (
                <Copil
                  persoane={persoane}
                  childUpdated={(childId) =>
                    updateChild(childId, childItem.index)
                  }
                  removeChild={() => setIdToDelete(childItem.index)}
                  key={childItem.childId}
                  selected={childItem.childId}
                />
              ))}
          </tbody>
        </Table>
      </Card>
      <Confirmation
        showModal={idToDelete != null}
        id={idToDelete}
        confirmModal={(id) => removeChild(id)}
        message="Esti sigur ca vrei sa stergi copilul din baza de date ?"
        hideModal={() => setIdToDelete(null)}
      />
    </Container>
  );
};
export default Familie;
