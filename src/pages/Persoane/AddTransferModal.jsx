import DropdownButton from "react-bootstrap/DropdownButton";
import Dropdown from "react-bootstrap/Dropdown";
import ButtonGroup from "react-bootstrap/ButtonGroup";
import { useEffect } from "react";
import { Typeahead } from "react-bootstrap-typeahead";
import Col from "react-bootstrap/Col";
import InputGroup from "react-bootstrap/InputGroup";
import React, { useState } from "react";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import DatePicker from "react-datepicker";
import Form from "react-bootstrap/Form";
import {
  useGetMembersQuery,
  useModifyMemberMutation,
} from "../../services/members";
import { useAddTransferMutation } from "../../services/transfers";
import {
  collection,
  doc,
  getDocs,
  query,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { firestore } from "../../firebase-config";
import { createGlobalStyle } from "styled-components";

const FILTER_LABEL = {
  1: "din EBEN-EZER",
  2: "in EBEN-EZER",
};

function AddTransferModal({
  persoane,
  show,
  onAddTransfer,
  onClose,
  isDisabled,
  transferredPerson,
}) {
  // const { data: persoane, error, isLoading, isFetching } = useGetMembersQuery();
  // const [persoane, setPersoane] = useState();
  const [filterType, setFilterType] = useState("1");
  const [showModal, setShowModal] = useState(false);
  const [person, setPerson] = useState(transferredPerson || "");
  const [dataTransfer, setDataTransfer] = useState("");
  const [bisericaTransfer, setBisericaTransfer] = useState("");
  const [actTransfer, setActTransfer] = useState("");
  const [detalii, setDetalii] = useState("");
  // const [modifyMember] = useModifyMemberMutation();
  // const [addTransfer] = useAddTransferMutation();

  //  ----------------  get list of all persons fron Firestore dataBase --------  //
  // const waitingPersons = async () => {
  //   const q = query(collection(firestore, "persoane"));

  //   const querySnapshot = await getDocs(q);
  //   const tmpArray = [];
  //   querySnapshot.forEach((doc) => {
  //     const childKey = doc.id;
  //     const childData = doc.data();
  //     tmpArray.push({ id: childKey, ...childData });
  //     setPersoane(tmpArray);
  //   });
  // };
  // useEffect(() => {
  //   waitingPersons();
  // }, []);
  useEffect(() => {
    setShowModal(show);
  }, [show]);

  // ------------ Add new transfer to firestore dataBase --------------- //
  const addTransfer = async (newTransfer) => {
    await setDoc(doc(firestore, "transfers", crypto.randomUUID()), {
      date: dataTransfer,
      churchTransfer: bisericaTransfer,
      docNumber: actTransfer,
      details: detalii,
      owner: person,
      type: filterType === "1" ? "transferTo" : "transferFrom",
    });
  };

  // ----------- Add transfer to current person, en 'Persoane' ----- //
  const modifyTransfer = (newData) => {
    onAddTransfer(newData);
    const docRef = doc(firestore, "persoane", person);
    updateDoc(docRef, newData);
  };

  const addData = () => {
    const newTransfer = {
      date: dataTransfer,
      churchTransfer: bisericaTransfer,
      docNumber: actTransfer,
      details: detalii,
      owner: person,
      type: filterType === "1" ? "transferTo" : "transferFrom",
    };

    // plecat
    if (filterType === "1") {
      modifyTransfer({
        // id: person.id,

        churchID: "",
        churchName: bisericaTransfer,
        leaveDate: dataTransfer,
        memberDate: "",
      });
      // venit
    } else {
      modifyTransfer({
        // id: person.id,
        churchID: 1,
        churchName: "EBEN-EZER",
        leaveDate: "",
        memberDate: dataTransfer,
      });
    }

    addTransfer({
      date: dataTransfer,
      churchTransfer: bisericaTransfer,
      docNumber: actTransfer,
      details: detalii,
      owner: person,
      type: filterType === "1" ? "transferTo" : "transferFrom",
    });

    if (person) {
      setBisericaTransfer("");
      setActTransfer("");
      setDataTransfer("");
      setDetalii("");
      onClose();
      setPerson(null);
    }
  };

  const onTrasferedChange = (p) => {
    if (p.length > 0) {
      setPerson(p[0].id);
    } else {
      setPerson(null);
    }
  };

  const filterByMember = (person) => {
    // console.log("person", person);
    if (filterType == "1") {
      return !!person.memberDate; // pleaca
    } else {
      return !person.memberDate; // vine
    }
  };

  return (
    <>
      <Modal show={showModal} onHide={onClose}>
        <Modal.Header closeButton>
          <Modal.Title>Transfer</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Col>
            <InputGroup size="sm" className="mb-3">
              <InputGroup.Text id="inputGroup-sizing-sm">
                Tipul transferului
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
                  <Dropdown.Item eventKey="1">
                    Transfer din Biserica Eben-Ezer
                  </Dropdown.Item>
                  <Dropdown.Item eventKey="2">
                    Transfer in Biserica Eben-Ezer
                  </Dropdown.Item>
                </DropdownType>
              ))}
            </InputGroup>
            <InputGroup size="sm" className="mb-3">
              <div style={{ display: "flex" }}>
                <InputGroup.Text id="inputGroup-sizing-sm">
                  Persoana pt. transfer
                </InputGroup.Text>
                <Typeahead
                  disabled={isDisabled}
                  id="transfered"
                  onChange={onTrasferedChange}
                  labelKey={(option) =>
                    `${option.firstName} ${""}${option.lastName}`
                  }
                  options={(persoane || []).filter(filterByMember)}
                  placeholder="Alege o persoana..."
                  selected={persoane?.filter((p) => p.id === person) || []}
                />
              </div>
            </InputGroup>
          </Col>
          <InputGroup
            size="sm"
            className="mb-3"
            style={{ display: "flex", flexWrap: "nowrap" }}
          >
            <InputGroup.Text id="inputGroup-sizing-sm">
              Data Transferului
            </InputGroup.Text>
            <Form.Control
              aria-label="Small"
              as={DatePicker}
              selected={dataTransfer}
              onChange={(date) => setDataTransfer(date)}
              peekNextMonth
              maxDate={new Date()}
              showMonthDropdown
              showYearDropdown
              dropdownMode="select"
              aria-describedby="inputGroup-sizing-sm"
              dateFormat="dd/MM/yyyy"
            />
          </InputGroup>

          <InputGroup size="sm" className="mb-3">
            <InputGroup.Text id="inputGroup-sizing-sm">
              Bserica de {filterType == "1" ? "destino" : "origine"}
            </InputGroup.Text>
            <Form.Control
              aria-label="Small"
              aria-describedby="inputGroup-sizing-sm"
              value={bisericaTransfer}
              onChange={(event) => setBisericaTransfer(event.target.value)}
            />
          </InputGroup>

          <InputGroup size="sm" className="mb-3">
            <InputGroup.Text id="inputGroup-sizing-sm">
              Nr. Act de transfer
            </InputGroup.Text>
            <Form.Control
              aria-label="Small"
              aria-describedby="inputGroup-sizing-sm"
              value={actTransfer}
              onChange={(event) => setActTransfer(event.target.value)}
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
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
          <Button variant="primary" onClick={addData}>
            Add
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default AddTransferModal;
