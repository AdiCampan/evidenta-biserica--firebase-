import InputGroup from "react-bootstrap/InputGroup";
import React, { useState, useEffect } from "react";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import { firestore } from "../../firebase-config";
import { doc, setDoc } from "firebase/firestore";
import { useAddMemberMutation } from "../../services/members";
import { Alert, FormControlLabel, Radio, RadioGroup } from "@mui/material";
import { validateName, sanitizeText } from "../../utils/validation";

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
    // Sanitizar y validar los datos
    const sanitizedNume = sanitizeText(nume);
    const sanitizedPrenume = sanitizeText(prenume);
    const sanitizedBiserica = biserica === "EBEN - EZER" ? biserica : sanitizeText(otherChurch);
    
    // Validar los campos
    const isNumeValid = validateName(sanitizedNume);
    const isPrenumeValid = validateName(sanitizedPrenume);
    
    const newPerson = {
      firstName: sanitizedPrenume,
      lastName: sanitizedNume,
      id: crypto.randomUUID(),
      sex: sex === "M" ? true : sex === "F" ? false : null,
      churchName: sanitizedBiserica,
    };

    if (isNumeValid && isPrenumeValid && sex !== null && sanitizedBiserica) {
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
      <Button
        style={{ marginLeft: "20px" }}
        variant="primary"
        onClick={() => setShow(true)}
      >
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
