// ExternalForm.jsx

import React, { useState, useEffect } from "react";
import { firestore } from "../firebase-config"; // Importa tu configuración de Firestore
import { collection, addDoc, Timestamp } from "firebase/firestore";

import "./ExternalForm.scss";
import ImageUploader from "../components/ImageUploader/ImageUploader";

const ExternalForm = ({ onCloseModal }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [show, setShow] = useState(false);

  const [personData, setPersonData] = useState({
    firstName: "",
    lastName: "",
    address: "",
    mobilePhone: "",
    birthDate: "",
    sex: "",
    baptiseDate: "",
    blessingDate: "",
    profileImage: selectedFile,
  });

  useEffect(() => {
    setPersonData((prevData) => ({
      ...prevData,
      profileImage: selectedFile,
    }));
  }, [selectedFile]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPersonData({
      ...personData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    setShow(false);
    onCloseModal();
    e.preventDefault();

    try {
      // Crear un objeto con las fechas convertidas a Timestamp
      const personDataWithTimestamp = {
        ...personData,
        birthDate: personData.birthDate
          ? Timestamp.fromDate(new Date(personData.birthDate))
          : null,
        baptiseDate: personData.baptiseDate
          ? Timestamp.fromDate(new Date(personData.baptiseDate))
          : null,
        blessingDate: personData.blessingDate
          ? Timestamp.fromDate(new Date(personData.blessingDate))
          : null,
      };

      // Guardar en una colección temporal en Firestore
      await addDoc(
        collection(firestore, "externalForms"),
        personDataWithTimestamp
      );
      alert("Formulario enviado con éxito!");
    } catch (err) {
      console.error("Error al enviar el formulario: ", err);
    }
  };

  return (
    <div className="form-container">
      <h1 className="form-title">Formulario de Registro</h1>
      <form className="form-group" onSubmit={handleSubmit}>
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
            <ImageUploader
              onFileSelectSuccess={(file) => setSelectedFile(file)}
              onFileSelectError={({ error }) => alert(error)}
              // initialImage={profileImage}
            />

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

        <label>Comentarios:</label>
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
  );
};

export default ExternalForm;
