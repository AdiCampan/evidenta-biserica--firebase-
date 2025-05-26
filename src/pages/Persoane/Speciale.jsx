import { useState, useEffect } from "react";
import { Card } from "react-bootstrap";
import DropdownButton from "react-bootstrap/DropdownButton";
import Dropdown from "react-bootstrap/Dropdown";
import ButtonGroup from "react-bootstrap/ButtonGroup";
import Col from "react-bootstrap/Col";
import Modal from "react-bootstrap/Modal";
import Form from "react-bootstrap/Form";
import InputGroup from "react-bootstrap/InputGroup";
import { Button } from "react-bootstrap";
import DatePicker from "react-datepicker";
import Confirmation from "../../Confirmation";
import PaginatedTable from "../../components/PaginatedTable";
import { useTranslation } from "react-i18next";
import AddCazSpecial from "./AddCazSpecial";
import { FaTrash, FaRegEdit } from "react-icons/fa";
import { formatDate } from "../../utils";
import { useModifySpecialCaseMutation } from "../../services/specialCases";
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

const Speciale = ({ persoane }) => {
  const { t } = useTranslation();
  const [filterType, setFilterType] = useState("1");
  const [filter, setFilter] = useState("all"); // Estado para el tipo de filtro
  const [cazuri, setCazuri] = useState([]);
  const [dataRezolvarii, setDataRezolvarii] = useState("");
  const [dataExcluderii, setDataExcluderii] = useState("");
  const [detalii, setDetalii] = useState("");
  const [idToDelete, setIdToDelete] = useState(null);
  const [show, setShow] = useState(false);
  const [caseToEdit, setCaseToEdit] = useState(null);

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
    setCaseToEdit(caz);

    // Inicializar las fechas desde `caseToEdit`
    setDataRezolvarii(caz.endDate ? caz.endDate.toDate() : null);
    setDataExcluderii(
      caz.person?.leaveDate ? new Date(caz.person.leaveDate) : null
    );

    setDetalii(caz.details);
  };

  const handleUpdate = async () => {
    const cazulModificat = {
      id: caseToEdit.id,
      startDate: caseToEdit?.startDate.toDate(), // Mantén la fecha de inicio
      endDate: dataRezolvarii || null, // Actualiza la fecha de resolución si existe
      details: detalii, // Actualiza los detalles
    };

    // Actualiza el caso en Firestore
    const docRef = doc(firestore, "specialCases", caseToEdit.id);
    await updateDoc(docRef, cazulModificat);

    // Si es un caso de exclusión definitiva, actualiza los datos de la persona
    if (filterType === "2") {
      const personDocRef = doc(firestore, "persoane", caseToEdit.person.id);
      await updateDoc(personDocRef, {
        leaveDate: dataExcluderii,
        memberDate: "",
      });
    }

    setShow(false); // Cierra el modal
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
      <Card style={{ padding: "1.5rem" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "10px",
          }}
        >
          <div>
            <InputGroup
              style={{
                marginRight: "20px",
              }}
              size="sm"
              className="mb-3"
            >
              <AddCazSpecial persoane={persoane} onAddCaz={addCaz} />
            </InputGroup>
          </div>
          <div>
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
                id="bg-nested-dropdown"
              >
                <Dropdown.Item eventKey="1" onClick={() => setFilter("all")}>
                  Toate cazurile
                </Dropdown.Item>
                <Dropdown.Item eventKey="2" onClick={() => setFilter("active")}>
                  Active
                </Dropdown.Item>
                <Dropdown.Item
                  eventKey="3"
                  onClick={() => setFilter("resolved")}
                >
                  Rezolvate
                </Dropdown.Item>
              </DropdownButton>
            </InputGroup>
          </div>
        </div>
        <PaginatedTable
          data={filteredCazuri.map((caz, index) => {
            const person = persoane?.find((p) => p.id === caz.person);
            return {
              ...caz,
              index: index + 1,
              personName: person
                ? `${person.lastName} ${person.firstName}`
                : "STERS din EVIDENTA !",
              person: person,
              startDateFormatted: formatDate(caz.startDate),
              endDateFormatted: formatDate(caz.endDate),
            };
          })}
          columns={[
            { key: "index", label: "#", sortable: false, width: "5%" },
            {
              key: "personName",
              label: t("table.fullName") || "Nume si Prenume",
              sortable: true,
              width: "18%",
            },
            {
              key: "startDateFormatted",
              label: t("table.openDate") || "Data Deschiderii",
              sortable: true,
              width: "12%",
            },
            {
              key: "endDateFormatted",
              label: t("table.resolveDate") || "Data Rezolvarii",
              sortable: true,
              width: "12%",
            },
            {
              key: "details",
              label: t("table.caseDetails") || "Detalii Caz Special",
              sortable: true,
            },
            {
              key: "actions",
              label: t("table.actions") || "Actiuni",
              sortable: false,
              render: (row) => (
                <div className="d-flex">
                  <Button
                    variant="outline-primary"
                    onClick={() => editar({ ...row, person: row.person })}
                  >
                    <FaRegEdit />
                  </Button>
                  <Button
                    variant="outline-danger"
                    onClick={(ev) => showDeleteModal(row.id, ev)}
                  >
                    <FaTrash />
                  </Button>
                </div>
              ),
              width: "10%",
            },
          ]}
          defaultPageSize={10}
          striped
          bordered
          hover
          size="sm"
          variant="light"
        />
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
              selected={dataRezolvarii} // Usa el estado `dataRezolvarii`
              onChange={(date) => setDataRezolvarii(date)} // Actualiza el estado con la nueva fecha seleccionada
              peekNextMonth
              maxDate={new Date()} // No permitir fechas futuras
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
              selected={dataExcluderii} // Usa el estado `dataExcluderii`
              onChange={(date) => setDataExcluderii(date)} // Actualiza el estado con la nueva fecha seleccionada
              peekNextMonth
              maxDate={new Date()} // No permitir fechas futuras
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
