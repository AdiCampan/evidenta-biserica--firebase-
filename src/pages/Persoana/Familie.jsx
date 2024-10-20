import React, { useState, useEffect } from "react";
import {
  Card,
  Container,
  Row,
  Col,
  InputGroup,
  Table,
  Button,
} from "react-bootstrap";
import { Typeahead } from "react-bootstrap-typeahead";
import {
  collection,
  doc,
  getDocs,
  getDoc,
  updateDoc,
} from "firebase/firestore";
import { firestore } from "../../firebase-config";
import AddPerson from "../Persoane/AddPerson";
import DatePicker from "react-datepicker";
import Form from "react-bootstrap/Form";
import Confirmation from "../../Confirmation";
import { calculateAge } from "../../utils";

const Familie = ({ data, persoane }) => {
  const [pereche, setPereche] = useState("");
  const [biserica, setBiserica] = useState("");
  const [idToDelete, setIdToDelete] = useState(null);
  const [childList, setChildList] = useState([]);
  const [father, setFather] = useState(null);
  const [mother, setMother] = useState(null);
  const [children, setChildren] = useState([]);
  const [currentPersonId, setCurrentPersonId] = useState("");
  const [servCivil, setServCivil] = useState(null);
  const [servRel, setServRel] = useState(null);

  useEffect(() => {
    if (data && data[1]) {
      setCurrentPersonId(data[1]);
    }
  }, [data]);

  const timestampToDate = (timestamp) => {
    if (timestamp && timestamp.seconds) {
      return new Date(timestamp.seconds * 1000); // Convertir a milisegundos
    }
    return null; // Devuelve null si no es un Timestamp válido
  };

  // useEffect para cargar relaciones y setear valores de pareja (esposa o esposo)
  useEffect(() => {
    if (data.length === 0 || !data[0].relations) return;

    const currentRelations = data[0].relations;

    // Encontrar la relación de spouse (wife/husband)
    const spouseRelation = currentRelations.find(
      (relation) => relation.type === "wife" || relation.type === "husband"
    );

    if (spouseRelation) {
      // Setear persona de la pareja
      setPereche(spouseRelation.person || "");

      // Setear fechas y datos de la boda
      setServCivil(timestampToDate(spouseRelation.civilWeddingDate));
      setServRel(timestampToDate(spouseRelation.religiousWeddingDate));
      setBiserica(spouseRelation.weddingChurch || ""); // Asignar weddingChurch
    } else {
      // Si no hay spouse, reiniciar los valores de matrimonio
      setServCivil("");
      setServRel("");
      setBiserica("");
    }

    // Setear padres si existen
    const fatherRelation = currentRelations.find(
      (relation) => relation.type === "father"
    );
    const motherRelation = currentRelations.find(
      (relation) => relation.type === "mother"
    );
    setFather(fatherRelation ? { id: fatherRelation.person } : null);
    setMother(motherRelation ? { id: motherRelation.person } : null);
  }, [data]);
  // Actualizar relaciones en Firestore al cambiar la pareja
  useEffect(() => {
    if (pereche) {
      updateSpouseRelations().catch(console.error);
    }
  }, [pereche, servCivil, servRel, biserica]);

  // Función para actualizar la relación de la esposa sin sobrescribir las relaciones anteriores
  const updateSpouseRelations = async () => {
    const spouseType = data[0].sex ? "wife" : "husband";
    const personType = data[0].sex ? "husband" : "wife";

    const newRelation = {
      person: pereche,
      type: spouseType,
      civilWeddingDate: servCivil || null,
      religiousWeddingDate: servRel || null,
      weddingChurch: biserica || "",
    };

    const spouseRelation = {
      person: data[1],
      type: personType,
      civilWeddingDate: servCivil || null,
      religiousWeddingDate: servRel || null,
      weddingChurch: biserica || "",
    };

    // 1. Actualizar Firestore con la nueva relación en la persona actual
    const currentPersonRef = doc(firestore, "persoane", data[1]);

    // Obtener las relaciones actuales desde Firestore
    const currentPersonDoc = await getDoc(currentPersonRef);
    const currentRelations = currentPersonDoc.exists()
      ? currentPersonDoc.data().relations || []
      : [];

    // Mantener las relaciones existentes y agregar/modificar la nueva relación de spouse
    const updatedRelations = currentRelations
      .filter((relation) => relation.type !== spouseType) // Filtrar cualquier relación previa de spouse
      .concat(newRelation); // Agregar la nueva relación de spouse

    await updateDoc(currentPersonRef, { relations: updatedRelations });

    // 2. Actualizar Firestore con la relación de la persona actual en la esposa
    const spousePersonRef = doc(firestore, "persoane", pereche);

    // Obtener las relaciones actuales de la esposa desde Firestore
    const spousePersonDoc = await getDoc(spousePersonRef);
    const spouseCurrentRelations = spousePersonDoc.exists()
      ? spousePersonDoc.data().relations || []
      : [];

    // Mantener las relaciones existentes y agregar/modificar la nueva relación de husband/wife
    const updatedSpouseRelations = spouseCurrentRelations
      .filter((relation) => relation.type !== personType) // Filtrar cualquier relación previa de husband/wife
      .concat(spouseRelation); // Agregar la nueva relación de husband/wife

    await updateDoc(spousePersonRef, { relations: updatedSpouseRelations });
  };

  const onPersonChange = (persons) => {
    if (persons.length > 0) {
      setPereche(persons[0].id);
    } else {
      setPereche("");
    }
  };

  // useEffect(() => {
  //   if (currentPersonId) {
  //     loadRelations().catch(console.error);
  //   }
  // }, [currentPersonId]);

  // const loadRelations = async () => {
  //   if (!currentPersonId) return;

  //   // Obtener el documento de la persona actual
  //   const currentPersonRef = doc(firestore, "persoane", currentPersonId);
  //   const currentPersonSnapshot = await getDoc(currentPersonRef);

  //   if (currentPersonSnapshot.exists()) {
  //     const { relations } = currentPersonSnapshot.data();

  //     // Filtrar relaciones de padre y madre
  //     const fatherRelation = relations?.find((rel) => rel.type === "father");
  //     const motherRelation = relations?.find((rel) => rel.type === "mother");
  //     // const fatherId = String(fatherRelation.person); // Convertir a string si es un número
  //     // const motherId = String(motherRelation.person); // Hacer lo mismo con la madre

  //     // Cargar los datos del padre y la madre usando sus IDs
  //     setFather(fatherRelation ? await getPersonById(fatherRelation) : null);
  //     setMother(motherRelation ? await getPersonById(motherRelation) : null);

  //     // Filtrar relaciones de hijos
  //     const childRelations =
  //       relations?.filter((rel) => rel.type === "child") || [];
  //     const childrenData = await Promise.all(
  //       childRelations.map(async (rel) => await getPersonById(rel.person))
  //     );
  //     setChildren(childrenData);
  //   }
  // };

  // const getPersonById = async (id) => {
  //   const personRef = doc(firestore, "persoane", id);
  //   const personSnapshot = await getDoc(personRef);
  //   return { id, ...personSnapshot.data() }; // Retornar el objeto con datos de la persona
  // };

  useEffect(() => {
    if (currentPersonId) {
      loadRelations().catch(console.error);
    }
  }, [currentPersonId]);

  const loadRelations = async () => {
    if (!currentPersonId) return;

    const currentPersonRef = doc(firestore, "persoane", currentPersonId);
    const currentPersonSnapshot = await getDoc(currentPersonRef);

    if (currentPersonSnapshot.exists()) {
      const { relations } = currentPersonSnapshot.data();

      const fatherRelation = relations?.find((rel) => rel.type === "father");
      const motherRelation = relations?.find((rel) => rel.type === "mother");

      setFather(
        fatherRelation ? await getPersonById(fatherRelation.person) : null
      );
      setMother(
        motherRelation ? await getPersonById(motherRelation.person) : null
      );

      const childRelations =
        relations?.filter((rel) => rel.type === "child") || [];
      const childrenData = await Promise.all(
        childRelations.map(async (rel) => await getPersonById(rel.person))
      );
      setChildren(childrenData);
    }
  };

  const getPersonById = async (id) => {
    const personRef = doc(firestore, "persoane", id);
    const personSnapshot = await getDoc(personRef);
    return { id, ...personSnapshot.data() };
  };

  useEffect(() => {
    if (currentPersonId) {
      updateRelations().catch(console.error);
    }
  }, [father, mother]);

  const updateRelations = async () => {
    if (!currentPersonId) return;

    const currentPersonRef = doc(firestore, "persoane", currentPersonId);
    const currentPersonSnapshot = await getDoc(currentPersonRef);
    let relations = [];

    if (currentPersonSnapshot.exists()) {
      relations = currentPersonSnapshot.data().relations || [];
    }

    if (father) {
      const fatherExists = relations.some(
        (rel) => rel.person === father.id && rel.type === "father"
      );
      if (!fatherExists) {
        relations.push({ person: father.id, type: "father" });
      }

      await updateParentRelation(father.id, "child", currentPersonId);
    }

    if (mother) {
      const motherExists = relations.some(
        (rel) => rel.person === mother.id && rel.type === "mother"
      );
      if (!motherExists) {
        relations.push({ person: mother.id, type: "mother" });
      }

      await updateParentRelation(mother.id, "child", currentPersonId);
    }

    await updateDoc(currentPersonRef, { relations });
  };

  const updateParentRelation = async (parentId, type, childId) => {
    const parentRef = doc(firestore, "persoane", parentId);
    const parentSnapshot = await getDoc(parentRef);

    if (parentSnapshot.exists()) {
      const parentData = parentSnapshot.data();
      let parentRelations = parentData.relations || [];

      const relationExists = parentRelations.some(
        (rel) => rel.person === childId && rel.type === type
      );

      if (!relationExists) {
        parentRelations.push({ person: childId, type });
        await updateDoc(parentRef, { relations: parentRelations });
      }
    }
  };

  const onFatherChange = (persons) => {
    if (persons.length > 0 && persons[0].sex) {
      setFather({
        id: persons[0].id,
        firstName: persons[0].firstName,
        lastName: persons[0].lastName,
      });
    } else {
      setFather(null);
    }
  };

  const onMotherChange = (persons) => {
    if (persons.length > 0 && !persons[0].sex) {
      setMother({
        id: persons[0].id,
        firstName: persons[0].firstName,
        lastName: persons[0].lastName,
      });
    } else {
      setMother(null);
    }
  };

  function deletePerson(id) {
    removeChild(id);

    setIdToDelete(null);
  }

  const showDeleteModal = (personId, ev) => {
    setIdToDelete(personId);
    ev.stopPropagation();
  };

  const removeChild = async (childId) => {
    const currentPersonRef = doc(firestore, "persoane", currentPersonId);
    const currentPersonSnapshot = await getDoc(currentPersonRef);
    if (currentPersonSnapshot.exists()) {
      const { relations } = currentPersonSnapshot.data();
      const updatedRelations = relations.filter(
        (rel) => rel.person !== childId
      );
      await updateDoc(currentPersonRef, { relations: updatedRelations });
      setChildren(children.filter((child) => child.id !== childId));
    }
  };

  // Función de manejo para cambiar la fecha civil
  const handleCivilDateChange = (date) => {
    setServCivil(date);
  };

  // Función de manejo para cambiar la fecha religiosa
  const handleRelDateChange = (date) => {
    setServRel(date);
  };

  return (
    <Container style={{ width: "93%" }}>
      {currentPersonId && (
        <>
          <Card style={{ marginBottom: "10px", backgroundColor: "#dfdfdf" }}>
            <Row style={{ padding: "5px" }}>
              <Col>
                <InputGroup size="sm" className="mb-3">
                  <InputGroup.Text>Sot/Sotie</InputGroup.Text>
                  <Typeahead
                    id="pereche"
                    onChange={onPersonChange}
                    labelKey={(option) =>
                      `${option.firstName} ${option.lastName}`
                    }
                    options={persoane?.filter(
                      (person) => person.sex !== data[0].sex
                    )}
                    placeholder="Alege sot/sotie..."
                    selected={persoane?.filter(
                      (person) => person.id === pereche
                    )}
                  />
                  <AddPerson label="+" />
                </InputGroup>
              </Col>
              <Col>
                <InputGroup
                  size="sm"
                  className="mb-3"
                  style={{ display: "flex", flexWrap: "nowrap" }}
                >
                  <InputGroup.Text>Data Serv. Civil</InputGroup.Text>

                  <DatePicker
                    selected={servCivil}
                    onChange={handleCivilDateChange}
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
            <Row style={{ padding: "5px" }}>
              <Col>
                <InputGroup
                  size="sm"
                  className="mb-3"
                  style={{ display: "flex", flexWrap: "nowrap" }}
                >
                  <InputGroup.Text>Data Serv. Religios</InputGroup.Text>

                  <DatePicker
                    selected={servRel}
                    onChange={handleRelDateChange}
                    peekNextMonth
                    maxDate={new Date()}
                    showMonthDropdown
                    showYearDropdown
                    dropdownMode="select"
                    dateFormat="dd/MM/yyyy"
                  />
                </InputGroup>
              </Col>
              <Col>
                <InputGroup size="sm" className="mb-3">
                  <InputGroup.Text>Biserica</InputGroup.Text>
                  <Form.Control
                    value={biserica}
                    onChange={(e) => setBiserica(e.target.value)}
                    placeholder="Introdu biserica"
                  />
                </InputGroup>
              </Col>
            </Row>
          </Card>
          <Card style={{ marginBottom: "10px", backgroundColor: "#dfdfdf" }}>
            <Row style={{ padding: "5px" }}>
              <Col>
                <div style={{ marginLeft: "20px" }}>TATA</div>
                <InputGroup size="sm" className="mb-3">
                  <Typeahead
                    id="father"
                    onChange={onFatherChange}
                    labelKey={(option) =>
                      option.firstName && option.lastName
                        ? `${option.firstName} ${option.lastName}`
                        : "Numele nu e disponibil"
                    }
                    options={persoane?.filter((person) => person.sex)}
                    placeholder="Select Father..."
                    selected={father ? [father] : []}
                  />
                  <AddPerson label="+" />
                </InputGroup>
              </Col>
              <Col>
                <div style={{ marginLeft: "20px" }}>MAMA</div>
                <InputGroup size="sm" className="mb-3">
                  <Typeahead
                    id="mother"
                    onChange={onMotherChange}
                    labelKey={(option) =>
                      option.firstName && option.lastName
                        ? `${option.firstName} ${option.lastName}`
                        : "Numele nu e disponibil"
                    }
                    options={persoane?.filter((person) => !person.sex)}
                    placeholder="Select Mother..."
                    selected={mother ? [mother] : []}
                  />
                  <AddPerson label="+" />
                </InputGroup>
              </Col>
            </Row>
          </Card>
          <Card style={{ backgroundColor: "#dfdfdf" }}>
            <h5 style={{ marginLeft: "20px" }}> COPII</h5>
            <Table striped bordered hover size="sm">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Prenume</th>
                  <th>Nume</th>
                  <th>Varsta</th>
                  <th>Actiuni</th>
                </tr>
              </thead>
              <tbody>
                {children.map((child, index) => (
                  <tr key={child.id}>
                    <td>{index + 1}</td>
                    <td>{child.firstName}</td>
                    <td>{child.lastName}</td>
                    <td>{calculateAge(child.birthDate)}</td>
                    <td>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => showDeleteModal(child.id)}
                      >
                        Sterge
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card>
          <Confirmation
            showModal={idToDelete != null}
            id={idToDelete}
            confirmModal={(id) => deletePerson(id)}
            message="Esti sigur ca vrei sa stergi copilul din baza de date ?"
            hideModal={() => setIdToDelete(null)}
          />
        </>
      )}
    </Container>
  );
};

export default Familie;

// import React, { useState, useEffect } from "react";
// import {
//   Card,
//   Container,
//   Row,
//   Col,
//   InputGroup,
//   Button,
//   Table,
// } from "react-bootstrap";
// import DatePicker from "react-datepicker";
// import { Typeahead } from "react-bootstrap-typeahead";
// import { collection, doc, getDocs, updateDoc } from "firebase/firestore";
// import { firestore } from "../../firebase-config";
// import Copil from "./Copil";
// import AddPerson from "../Persoane/AddPerson";
// import Confirmation from "../../Confirmation";

// function uuid() {
//   return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, (c) =>
//     (
//       c ^
//       (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))
//     ).toString(16)
//   );
// }

// const Familie = ({ dataUpdated, data }) => {
//   const [pereche, setPereche] = useState("");
//   const [servCivil, setServCivil] = useState("");
//   const [childList, setChildList] = useState([]);
//   const [father, setFather] = useState(null);
//   const [mother, setMother] = useState(null);
//   const [persoane, setPersoane] = useState([]);
//   const [initialFather, setInitialFather] = useState(null);
//   const [initialMother, setInitialMother] = useState(null);
//   const [idToDelete, setIdToDelete] = useState(null);

//   const waitingPersons = async () => {
//     const q = collection(firestore, "persoane");
//     const querySnapshot = await getDocs(q);
//     const tmpArray = [];
//     querySnapshot.forEach((doc) => {
//       const childKey = doc.id;
//       const childData = doc.data();
//       tmpArray.push({ id: childKey, ...childData });
//     });
//     setPersoane(tmpArray);
//   };

//   useEffect(() => {
//     waitingPersons();
//   }, []);

//   const onPersonChange = (persons) => {
//     setPereche(persons.length > 0 ? persons[0].id : "");
//   };

//   const onFatherChange = (persons) => {
//     if (persons.length > 0 && persons[0].sex) {
//       setFather({
//         id: persons[0].id,
//         firstName: persons[0].firstName,
//         lastName: persons[0].lastName,
//       });
//     } else {
//       setFather(null);
//     }
//   };

//   const onMotherChange = (persons) => {
//     if (persons.length > 0 && !persons[0].sex) {
//       setMother({
//         id: persons[0].id,
//         firstName: persons[0].firstName,
//         lastName: persons[0].lastName,
//       });
//     } else {
//       setMother(null);
//     }
//   };

//   useEffect(() => {
//     const relation = data[0]?.relations?.filter(
//       (relation) => relation.type === "child"
//     );
//     const fatherData = relation?.find((relation) => relation.type === "father");
//     const motherData = relation?.find((relation) => relation.type === "mother");

//     if (fatherData) {
//       setInitialFather(fatherData);
//     }

//     if (motherData) {
//       setInitialMother(motherData);
//     }
//   }, [data]);

//   const updateParentChildRelations = async () => {
//     const children = childList.map((child) => ({
//       person: child.childId,
//       type: "child",
//     }));

//     // Actualizar la relación del padre
//     if (father && father.id) {
//       const fatherRef = doc(firestore, "persoane", father.id);
//       await updateDoc(fatherRef, {
//         relations: [...(father.relations || []), ...children],
//       });
//     }

//     // Actualizar la relación de la madre
//     if (mother && mother.id) {
//       const motherRef = doc(firestore, "persoane", mother.id);
//       await updateDoc(motherRef, {
//         relations: [...(mother.relations || []), ...children],
//       });
//     }

//     // Actualizar la persona actual sin incluirla como child de sí misma
//     const currentPersonRef = doc(firestore, "persoane", data[1]);
//     const updateCurrentPerson = {
//       relations: [
//         ...(father ? [{ person: father.id, type: "father" }] : []),
//         ...(mother ? [{ person: mother.id, type: "mother" }] : []),
//         ...children, // Aquí se agregan solo los hijos, no la persona actual
//       ],
//     };
//     await updateDoc(currentPersonRef, updateCurrentPerson);
//   };

//   const addChildField = () => {
//     setChildList([...childList, { childId: "", index: uuid() }]);
//   };

//   const removeChild = (childIndex) => {
//     setChildList(childList.filter((child) => child.index !== childIndex));
//   };

//   return (
//     <Container>
//       <Card>
//         <Row>
//           <Col>
//             <InputGroup size="sm" className="mb-3">
//               <Typeahead
//                 id="pereche"
//                 onChange={onPersonChange}
//                 labelKey={(option) => `${option.firstName} ${option.lastName}`}
//                 options={persoane.filter(
//                   (person) => person.sex !== data[0].sex
//                 )}
//                 placeholder="Alege o persoana..."
//                 selected={persoane.filter((person) => person.id === pereche)}
//               />
//               <AddPerson label="+" />
//             </InputGroup>
//           </Col>
//           <Col>
//             <InputGroup size="sm" className="mb-3">
//               <InputGroup.Text id="inputGroup-sizing-sm">
//                 Data Serv. Civil
//               </InputGroup.Text>
//               <DatePicker
//                 selected={servCivil}
//                 onChange={(date) => setServCivil(date)}
//               />
//             </InputGroup>
//           </Col>
//         </Row>
//       </Card>

//       <Card>
//         <h5>Parinti</h5>
//         <Row>
//           <Col>
//             <InputGroup size="sm" className="mb-3">
//               <Typeahead
//                 id="father"
//                 onChange={onFatherChange}
//                 labelKey={(option) => `${option.firstName} ${option.lastName}`}
//                 options={persoane.filter((person) => person.sex)}
//                 placeholder="Alege tata..."
//                 selected={
//                   father ? [father] : initialFather ? [initialFather] : []
//                 }
//               />
//               <AddPerson label="+" />
//             </InputGroup>
//           </Col>
//           <Col>
//             <InputGroup size="sm" className="mb-3">
//               <Typeahead
//                 id="mother"
//                 onChange={onMotherChange}
//                 labelKey={(option) => `${option.firstName} ${option.lastName}`}
//                 options={persoane.filter((person) => !person.sex)}
//                 placeholder="Alege mama..."
//                 selected={
//                   mother ? [mother] : initialMother ? [initialMother] : []
//                 }
//               />
//               <AddPerson label="+" />
//             </InputGroup>
//           </Col>
//         </Row>
//       </Card>

//       <Card>
//         <h5>Copii</h5>
//         <Button onClick={addChildField}>Adauga un copil</Button>
//         <Table striped bordered hover size="sm">
//           <thead>
//             <tr>
//               <th>Nume si Prenume</th>
//               <th>Data Nasterii</th>
//               <th>Varsta</th>
//               <th>Sex</th>
//             </tr>
//           </thead>
//           <tbody>
//             {childList.map((childItem) => (
//               <Copil
//                 key={childItem.index}
//                 selected={childItem.childId}
//                 removeChild={() => removeChild(childItem.index)}
//               />
//             ))}
//           </tbody>
//         </Table>
//       </Card>

//       <Confirmation
//         showModal={idToDelete != null}
//         id={idToDelete}
//         confirmModal={() => removeChild(idToDelete)}
//         message="Esti sigur ca vrei sa stergi copilul din baza de date?"
//         hideModal={() => setIdToDelete(null)}
//       />
//     </Container>
//   );
// };

// export default Familie;
