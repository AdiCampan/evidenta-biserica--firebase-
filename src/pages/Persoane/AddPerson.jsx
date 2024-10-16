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

function AddPerson({ label }) {
  const [show, setShow] = useState(false);
  // const dispatch = useDispatch();

  const [nume, setNume] = useState("");
  const [prenume, setPrenume] = useState("");
  // const [adresa, setAdresa] = useState("");
  // const [telefon, setTelefon] = useState("");
  // const [email, setEmail] = useState("");
  const [sex, setSex] = useState(true);

  const [result] = useAddMemberMutation();

  // FIRESTORE //
  const addMember = async (newMember) => {
    await setDoc(doc(firestore, "persoane", crypto.randomUUID()), {
      firstName: newMember.firstName,
      lastName: newMember.lastName,
      sex: newMember.sex,
    });
    setShow(false);
  };

  const handleClose = () => setShow(false);

  useEffect(() => {
    if (result.isSuccess) {
      setShow(false);
    }
  }, [result]);

  const addData = () => {
    const newPerson = {
      firstName: prenume,
      lastName: nume,
      // address: adresa,
      // telefon: telefon,
      // email: email,
      sex: sex,
    };

    // id: Math.random().toString()

    if (nume != "" && prenume != "") {
      setNume("");
      setPrenume("");
      // setAdresa("");
      // setTelefon("");
      // setEmail("");
      setSex(true);
      addMember(newPerson);
    }
  };

  return (
    <>
      <Button variant="primary" onClick={() => setShow(true)}>
        {label || "Persoana noua"}
      </Button>

      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Detalii Persoana</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <input
            placeholder="Nume"
            value={nume}
            onChange={(event) => setNume(event.target.value)}
          ></input>
          <input
            placeholder="Prenume"
            value={prenume}
            onChange={(event) => setPrenume(event.target.value)}
          ></input>
          {/* <input 
          placeholder='Adresa' 
          value={adresa}
          onChange={(event) => setAdresa(event.target.value)}
          ></input>
          <input
            placeholder='Telefon'
            value={telefon} 
            onChange={(event) => setTelefon(event.target.value)}
          ></input>
          <input
            placeholder='email'
            value={email} 
            onChange={(event) => setEmail(event.target.value)}
          ></input> */}
          <ButtonGroup aria-label="Basic example">
            <Button
              variant="secondary"
              active={sex == true}
              onClick={() => setSex(true)}
            >
              M
            </Button>
            <Button
              variant="secondary"
              active={sex == false}
              onClick={() => setSex(false)}
            >
              F
            </Button>
          </ButtonGroup>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
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

export default AddPerson;
