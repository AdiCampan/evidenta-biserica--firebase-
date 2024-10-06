import { useState, useEffect } from "react";
import { Card, FormControl } from "react-bootstrap";
import DropdownButton from "react-bootstrap/DropdownButton";
import Dropdown from "react-bootstrap/Dropdown";
import ButtonGroup from "react-bootstrap/ButtonGroup";
import Col from "react-bootstrap/Col";
import Modal from "react-bootstrap/Modal";
import Form from "react-bootstrap/Form";
import Table from "react-bootstrap/Table";
import InputGroup from "react-bootstrap/InputGroup";
import { Button } from "react-bootstrap";
import DatePicker from "react-datepicker";
import Confirmation from "../../Confirmation";
import AddCazSpecial from "./AddCazSpecial";
import { FaTrash, FaRegEdit } from "react-icons/fa";
import {
  calculateAge,
  formatDate,
  searchField,
  filterByText,
  filterByAgeSmaller,
  filterByAge,
  filterByAgeGreater,
  filterByDate,
  filterBySex,
} from "../../utils";
import {
  useGetSpecialCasesQuery,
  useModifySpecialCaseMutation,
} from "../../services/specialCases";
import {
  useGetMembersQuery,
  useModifyMemberMutation,
} from "../../services/members";
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { firestore } from "../../firebase-config";

const FILTER_LABEL = {
  1: "Exclus temporar",
  2: "Exclus defintiv",
};

function uuid() {
  return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, (c) =>
    (
      c ^
      (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))
    ).toString(16)
  );
}

const Speciale = ({ persoane }) => {
  const [filterType, setFilterType] = useState("1");
  const [filter, setFilter] = useState("all"); // Estado para el tipo de filtro
  const [cazuri, setCazuri] = useState([]);
  const [dataOpencase, setDataOpenCase] = useState("");
  const [dataRezolvarii, setDataRezolvarii] = useState("");
  const [dataExcluderii, setDataExcluderii] = useState("");
  const [detalii, setDetalii] = useState("");
  const [idToDelete, setIdToDelete] = useState(null);
  const [idToEdit, setIdToEdit] = useState(null);
  const [show, setShow] = useState(false);
  const [resolved, setResolved] = useState(false);
  const [caseToEdit, setCaseToEdit] = useState(null);

  // const { data: cazuriSpeciale, isLoading: cazuriSpecialeLoading } =
  //   useGetSpecialCasesQuery();
  const [modifySpecialCase] = useModifySpecialCaseMutation();
  // const [modifyMember] = useModifyMemberMutation();
  // const { data: persoane, isLoading: persoaneLoading } = useGetMembersQuery();

  //  ----------------  get list of all cases fron Firestore dataBase --------  //
  const q = query(collection(firestore, "specialCases"));

  useEffect(() => {
    onSnapshot(q, (querySnapshot) => {
      const tmpArray = [];
      querySnapshot.forEach((doc) => {
        const childKey = doc.id;
        const childData = doc.data();
        tmpArray.push({ id: childKey, ...childData });
        setCazuri(tmpArray);
      });
    });
  }, [persoane]);

  const filteredCazuri = cazuri.filter((caz) => {
    // Aplicar el filtro según el estado `filter`
    if (filter === "all") return true;
    if (filter === "active") return !caz.endDate; // Casos con solo `startDate`
    if (filter === "resolved") return !!caz.endDate; // Casos con `endDate`
    return true;
  });

  const editar = (caz) => {
    console.log("caz", caz);
    setShow(true);
    setDataRezolvarii(caz.endDate);
    setDataExcluderii(caz.person.leaveDate);
    setDetalii(caz.details);
    setIdToEdit(caz.id);
    setCaseToEdit(caz);
  };

  const handleUpdate = () => {
    const cazulModificat = {
      id: caseToEdit.id,
      startDate: caseToEdit?.startDate.toDate(),
      endDate: dataRezolvarii || "",
      details: detalii,
    };
    const docRef = doc(firestore, "specialCases", caseToEdit.id);
    updateDoc(docRef, cazulModificat);

    // exclus definitiv, deci facem un transfer
    if (filterType === "2") {
      const docRef = doc(firestore, "persoane", caseToEdit.person.id);
      updateDoc(docRef, { leaveDate: dataExcluderii, memberDate: "" });
    }
    setShow(false);
  };

  const handleClose = () => setShow(false);

  const addCaz = async (newCase) => {
    await setDoc(doc(firestore, "specialCases", crypto.randomUUID()), {
      ...newCase,
    });
    // const cazuriActualizate = [...cazuri, caz];
  };

  const deleteCase = (cazIndex) => {
    setCazuri(
      cazuri.filter((caz) => {
        if (caz.id !== cazIndex) {
          return true;
        }
        deleteDoc(doc(firestore, "specialCases", cazIndex));

        setIdToDelete(null);
        return false;
      })
    );
  };

  const showDeleteModal = (personId, ev) => {
    setIdToDelete(personId);
    ev.stopPropagation();
  };

  return (
    <div>
      <div
        style={{
          display: "flex",
          paddingLeft: "20px",
          position: "sticky",
          top: 0,
        }}
      >
        <Col>
          <InputGroup size="sm" className="mb-3">
            <AddCazSpecial persoane={persoane} onAddCaz={addCaz} />
          </InputGroup>
        </Col>

        <Col></Col>
      </div>
      <Card>
        <Table striped bordered hover size="sm">
          <thead className="head-list">
            <tr>
              <th>#</th>
              <th>Nume si Prenume</th>
              <th>Data Deschiderii</th>
              <th>Data Rezolvarii</th>
              <th style={{ display: "flex" }}>
                Detalii Caz Special{" "}
                <InputGroup className="mb-3" size="sm">
                  <DropdownButton
                    as={ButtonGroup}
                    title={
                      filter === "all"
                        ? "Toate cazurile"
                        : filter === "active"
                        ? "Active"
                        : "Rezolvate"
                    }
                    onSelect={(key) => setFilter(key)}
                  >
                    <Dropdown.Item eventKey="all">Toate cazurile</Dropdown.Item>
                    <Dropdown.Item eventKey="active"> Active</Dropdown.Item>
                    <Dropdown.Item eventKey="resolved">Rezolvate</Dropdown.Item>
                  </DropdownButton>
                </InputGroup>
              </th>
              <th>Actiuni</th>
            </tr>
          </thead>
          <tbody>
            {filteredCazuri?.map((caz, index) => (
              <tr
                key={caz.id}
                style={{
                  backgroundColor: caz.endDate ? "#55bb5580" : "#af404038",
                }}
              >
                <td>{index + 1}</td>
                <td>
                  {persoane &&
                  persoane.find((person) => person.id === caz.person) ? (
                    <>
                      {`${
                        persoane.find((person) => person.id === caz.person)
                          .lastName
                      }  ${
                        persoane.find((person) => person.id === caz.person)
                          .firstName
                      } `}
                    </>
                  ) : (
                    "STERS din EVIDENTA !"
                  )}
                </td>

                <td>{formatDate(caz.startDate)}</td>
                <td>{formatDate(caz.endDate)}</td>
                <td>{caz.details}</td>
                <td>
                  <FaRegEdit
                    style={{ cursor: "pointer" }}
                    onClick={() => editar(caz)}
                  />
                  <FaTrash
                    style={{ cursor: "pointer", marginLeft: "15px" }}
                    onClick={(event) => showDeleteModal(caz.id, event)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>

      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Editare Caz Special</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Col>
            <InputGroup size="sm" className="mb-3">
              <InputGroup.Text id="inputGroup-sizing-sm">
                {" "}
                Nume{" "}
              </InputGroup.Text>
              <Form.Control
                aria-label="Small"
                aria-describedby="inputGroup-sizing-sm"
                value={
                  persoane &&
                  caseToEdit &&
                  persoane.find((person) => person.id === caseToEdit.person)
                    ? persoane.find((person) => person.id === caseToEdit.person)
                        .lastName
                    : ""
                }
                disabled
              />
              <InputGroup.Text id="inputGroup-sizing-sm">
                {" "}
                Prenume{" "}
              </InputGroup.Text>
              <Form.Control
                aria-label="Small"
                aria-describedby="inputGroup-sizing-sm"
                value={
                  persoane &&
                  caseToEdit &&
                  persoane.find((person) => person.id === caseToEdit.person)
                    ? persoane.find((person) => person.id === caseToEdit.person)
                        .firstName
                    : ""
                }
                disabled
              />
            </InputGroup>
          </Col>
          <InputGroup
            size="sm"
            className="mb-3"
            style={{ display: "flex", flexWrap: "nowrap" }}
          >
            <InputGroup.Text id="inputGroup-sizing-sm">
              Data deschiderii Cazului
            </InputGroup.Text>
            <Form.Control
              aria-label="Small"
              as={DatePicker}
              selected={
                caseToEdit?.startDate ? caseToEdit?.startDate.toDate() : null
              }
              // onChange={(date) => setDataOpenCase(date)}
              disabled
              peekNextMonth
              maxDate={new Date()}
              showMonthDropdown
              showYearDropdown
              dropdownMode="select"
              aria-describedby="inputGroup-sizing-sm"
            />
          </InputGroup>
          <InputGroup
            size="sm"
            className="mb-3"
            style={{ display: "flex", flexWrap: "nowrap" }}
          >
            <InputGroup.Text id="inputGroup-sizing-sm">
              Data Rezolvarii Cazului
            </InputGroup.Text>
            <Form.Control
              aria-label="Small"
              as={DatePicker}
              selected={
                caseToEdit?.endDate ? caseToEdit?.endDate.toDate() : null
              }
              onChange={(date) => setDataRezolvarii(date)}
              peekNextMonth
              maxDate={new Date()}
              showMonthDropdown
              showYearDropdown
              dropdownMode="select"
              aria-describedby="inputGroup-sizing-sm"
            />
          </InputGroup>

          <InputGroup size="sm" className="mb-3">
            <InputGroup.Text id="inputGroup-sizing-sm">
              Selecteaza tipul excluderii:
            </InputGroup.Text>
            {[DropdownButton].map((DropdownType, idx) => (
              <DropdownType
                as={ButtonGroup}
                key={idx}
                id={`dropdown-button-drop-${idx}`}
                size="sm"
                variant="secondary"
                title={FILTER_LABEL[filterType]}
                onSelect={(key) => setFilterType(key)}
              >
                <Dropdown.Item eventKey="1">Exclus temporar</Dropdown.Item>
                <Dropdown.Item eventKey="2">Exclus dfinitiv</Dropdown.Item>
              </DropdownType>
            ))}
          </InputGroup>

          <InputGroup
            size="sm"
            className="mb-3"
            style={{ display: "flex", flexWrap: "nowrap" }}
          >
            <InputGroup.Text id="inputGroup-sizing-sm">
              Data excluderii
            </InputGroup.Text>
            <Form.Control
              aria-label="Small"
              as={DatePicker}
              selected={dataExcluderii ? new Date(dataExcluderii) : null}
              onChange={(date) => setDataExcluderii(date)}
              peekNextMonth
              maxDate={new Date()}
              showMonthDropdown
              showYearDropdown
              dropdownMode="select"
              aria-describedby="inputGroup-sizing-sm"
            />
          </InputGroup>

          <InputGroup size="sm" className="mb-3">
            <InputGroup.Text id="inputGroup-sizing-sm">Detalii</InputGroup.Text>
            <Form.Control
              as="textarea"
              rows={3}
              aria-label="Small"
              aria-describedby="inputGroup-sizing-sm"
              value={detalii}
              onChange={(event) => setDetalii(event.target.value)}
            />
          </InputGroup>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
          <Button variant="primary" onClick={handleUpdate}>
            Salveaza
          </Button>
        </Modal.Footer>
      </Modal>

      <Confirmation
        showModal={idToDelete != null}
        id={idToDelete}
        confirmModal={(id) => deleteCase(id)}
        message="Esti sigur ca vrei sa stergi Cazul Special din baza de date ?"
        hideModal={() => setIdToDelete(null)}
      />
    </div>
  );
};

export default Speciale;
