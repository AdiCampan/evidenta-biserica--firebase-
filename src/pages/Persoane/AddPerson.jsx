import Form from "react-bootstrap/Form";
import InputGroup from "react-bootstrap/InputGroup";
import ButtonGroup from "react-bootstrap/ButtonGroup";
import React, { useState, useEffect } from "react";
// import { useDispatch } from 'react-redux';
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import { push, ref, set } from "firebase/database";
import { db, firestore } from "../../firebase-config";
import { doc, setDoc } from "firebase/firestore";
import { useAddMemberMutation } from "../../services/members";
import { Alert, FormControlLabel, Radio, RadioGroup } from "@mui/material";

function AddPerson({ label }) {
  const [show, setShow] = useState(false);
  // const dispatch = useDispatch();

  const [nume, setNume] = useState("");
  const [prenume, setPrenume] = useState("");
  const [biserica, setBiserica] = useState(null);
  const [sex, setSex] = useState(null);
  const [alert, setAlert] = useState(false);
  const [otherChurch, setOtherChurch] = useState("");

  const [result] = useAddMemberMutation();

  // FIRESTORE //
  const addMember = async (newMember) => {
    await setDoc(doc(firestore, "persoane", newMember.id), {
      firstName: newMember.firstName,
      lastName: newMember.lastName,
      sex: newMember.sex,
      id: newMember.id,
      churchName: biserica,
    });
    setShow(false);
    setAlert(false);
  };

  const handleClose = () => {
    setNume("");
    setPrenume("");
    setSex(null);
    setBiserica(null);
    setAlert(false);

    setShow(false);
  };

  useEffect(() => {
    if (result.isSuccess) {
      setShow(false);
    }
  }, [result]);

  const addData = () => {
    const newPerson = {
      firstName: prenume,
      lastName: nume,
      id: crypto.randomUUID(),
      sex: sex === "M" ? true : sex === "F" ? false : null,
      biserica: biserica,
    };

    if (nume != "" && prenume != "" && sex !== null && biserica !== null) {
      setNume("");
      setPrenume("");
      setSex(null);
      setBiserica(null);
      addMember(newPerson);
    } else {
      setAlert(true);
    }
  };

  return (
    <>
      <Button variant="primary" onClick={() => setShow(true)}>
        {label || "Persoana noua"}
      </Button>

      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title style={{ color: "GrayText", marginLeft: "100px" }}>
            PERSOANA NOUA
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <input
            style={{ paddingLeft: 20, marginBottom: 10, height: 40 }}
            placeholder="Nume"
            value={nume}
            onChange={(event) => setNume(event.target.value)}
          ></input>
          <input
            style={{ paddingLeft: 20, marginLeft: 20, height: 40 }}
            placeholder="Prenume"
            value={prenume}
            onChange={(event) => setPrenume(event.target.value)}
          ></input>
          <InputGroup size="sm" className="mb-3">
            <InputGroup.Text id="inputGroup-sizing-sm">GEN: </InputGroup.Text>
            <RadioGroup
              style={{ display: "flex", flexDirection: "row", paddingLeft: 14 }}
              name="use-radio-group"
              value={sex}
              onChange={(e) => {
                setSex(e.target.value);
              }}
            >
              <FormControlLabel
                value="M"
                label="Masculin"
                control={<Radio />}
              />
              <FormControlLabel value="F" label="Feminin" control={<Radio />} />
            </RadioGroup>
          </InputGroup>
          <InputGroup size="sm" className="mb-3">
            <InputGroup.Text id="inputGroup-sizing-sm">
              BISERICA:{" "}
            </InputGroup.Text>
            <RadioGroup
              style={{ display: "flex", flexDirection: "row", paddingLeft: 14 }}
              name="use-radio-group"
              value={biserica}
              onChange={(e) => {
                setBiserica(e.target.value);
              }}
            >
              <FormControlLabel
                value="EBEN - EZER"
                label="EBEN - EZER"
                control={<Radio />}
              />
              <FormControlLabel
                style={{ paddingLeft: 25 }}
                value={otherChurch}
                // label="Alta Biserica"
                control={<Radio />}
              />
              <input
                style={{ paddingLeft: 25 }}
                placeholder="Alta Biserica"
                value={otherChurch}
                onChange={(event) => setOtherChurch(event.target.value)}
              ></input>
            </RadioGroup>
          </InputGroup>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
          <Button variant="primary" onClick={addData}>
            Add
          </Button>
        </Modal.Footer>
        {alert && (
          <Alert variant="outlined" severity="warning">
            Toate campurile sunt obligatorii !
          </Alert>
        )}
      </Modal>
    </>
  );
}

export default AddPerson;
