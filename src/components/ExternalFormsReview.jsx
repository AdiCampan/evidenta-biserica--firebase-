// ExternalFormsReview.jsx

import React, { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  setDoc,
} from "firebase/firestore";
import { firestore } from "../firebase-config";
import { Button, Modal, Table } from "react-bootstrap";

const ExternalFormsReview = () => {
  const [show, setShow] = useState(false);
  const [form, setForm] = useState();
  const [externalForms, setExternalForms] = useState([]);
  const [personData, setPersonData] = useState({
    firstName: "",
    lastName: "",
    address: "",
    mobilePhone: "",
    birthDate: "",
    sex: "",
    baptiseDate: "",
    blessingDate: "",
    // profileImage: selectedFile,
  });
  const handleSubmit = async (form) => {
    // Guardar en la colección principal "persoane"
    await setDoc(doc(firestore, "persoane", form.id), form);
    // Eliminar de la colección temporal
    await deleteDoc(doc(firestore, "externalForms", form.id));
    alert("Formulario sincronizado con éxito!");
    setExternalForms(externalForms.filter((f) => f.id !== form.id));
  };

  const handleClose = () => setShow(false);

  useEffect(() => {
    const fetchExternalForms = async () => {
      const formsSnapshot = await getDocs(
        collection(firestore, "externalForms")
      );
      const formsList = formsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setExternalForms(formsList);
    };

    fetchExternalForms();
  }, []);

  const showForm = (form) => {
    setForm(form);
  };
  const handleChange = (e) => {
    const { name, value } = e.target;
    setPersonData({
      ...personData,
      [name]: value,
    });
  };

  return (
    <div>
      {/* <h2>Revisión de Formularios Externos</h2> */}
      <Button variant="primary" onClick={() => setShow(true)}>
        FORMULARE PRIMITE
      </Button>

      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>FORMULARE PRIMITE</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {externalForms.length === 0 ? (
            <p>Nu sunt formulare primite </p>
          ) : (
            <ul>
              {externalForms.map((form) => (
                <li key={form.id} onClick={() => showForm(form)}>
                  {form.firstName} {form.lastName} - {form.address} -{" "}
                  {/* <button onClick={() => syncToFirestore(form)}>
                    Sincronizar
                  </button> */}
                </li>
              ))}
            </ul>
          )}
          {form && personData && (
            <div className="form-container">
              <h1 className="form-title">{form.lastName}</h1>
              <form className="form-group" onSubmit={handleSubmit(form)}>
                <div className="colums">
                  <div className="colum-form">
                    <label className="label">
                      Nume {`(obligatoriu)`}:
                      <input
                        required
                        className="input"
                        type="text"
                        name="lastName"
                        value={personData.lastName}
                        onChange={handleChange}
                      />
                    </label>
                    <label className="label">
                      Prenume {`(obligatoriu)`}:
                      <input
                        required
                        className="input"
                        type="text"
                        name="firstName"
                        value={personData.firstName}
                        onChange={handleChange}
                      />
                    </label>

                    <label className="label">
                      Adresa {`(obligatoriu)`}:
                      <input
                        required
                        className="input"
                        type="text"
                        name="address"
                        value={personData.address}
                        onChange={handleChange}
                      />
                    </label>
                    <label className="label">
                      Telefon {`(obligatoriu)`}:
                      <input
                        required
                        className="input"
                        type="text"
                        name="mobilePhone"
                        value={personData.mobilePhone}
                        onChange={handleChange}
                      />
                    </label>
                    <label className="label">
                      Data nasterii {`(obligatoriu)`}:
                      <input
                        className="input"
                        type="date"
                        name="birthDate"
                        value={personData.birthDate}
                        onChange={handleChange}
                      />
                    </label>
                    <label className="label">
                      Gen {`(obligatoriu)`}:
                      <select
                        required
                        className="select"
                        name="sex"
                        value={personData.sex}
                        onChange={handleChange}
                      >
                        <option value="">Selectioneaza</option>
                        <option value="M">Masculin</option>
                        <option value="F">Femenin</option>
                      </select>
                    </label>
                  </div>
                  <div className="column-form">
                    {/* <ImageUploader
                      onFileSelectSuccess={(file) => setSelectedFile(file)}
                      onFileSelectError={({ error }) => alert(error)}
                      // initialImage={profileImage}
                    /> */}

                    <label className="label">
                      Data Binecuvantarii:
                      <input
                        className="input"
                        type="date"
                        name="blessingDate"
                        value={personData.blessingDate}
                        onChange={handleChange}
                      />
                    </label>
                    <label className="label">
                      Data Botezului:
                      <input
                        className="input"
                        type="date"
                        name="baptiseDate"
                        value={personData.baptiseDate}
                        onChange={handleChange}
                      />
                    </label>
                  </div>
                </div>

                <label for="comments">Comentarios:</label>
                <textarea
                  id="comments"
                  rows="4"
                  placeholder="Escribe tus comentarios aquí..."
                ></textarea>
                <button className="submit-btn" type="submit">
                  Enviar
                </button>
                <button className="cancel-btn" onClick={() => onCloseModal()}>
                  Cancel
                </button>
              </form>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ExternalFormsReview;
