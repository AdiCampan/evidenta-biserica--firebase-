import React, { useState, useEffect } from "react";
import { firestore } from "../firebase-config";
import { collection, addDoc } from "firebase/firestore"; // No más Timestamp
import DatePicker from "react-datepicker"; // Importamos el DatePicker
import "react-datepicker/dist/react-datepicker.css";
import "./ExternalForm.scss";
import ImageUploader from "../components/ImageUploader/ImageUploader";

const ExternalForm = ({ onCloseModal }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [show, setShow] = useState(false);

  // Estado para las fechas como objetos Date
  const [birthDate, setBirthDate] = useState(null);
  const [baptiseDate, setBaptiseDate] = useState(null);
  const [blessingDate, setBlessingDate] = useState(null);

  const [personData, setPersonData] = useState({
    firstName: "",
    lastName: "",
    address: "",
    mobilePhone: "",
    sex: "",
    profileImage: selectedFile,
    details: "",
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
    e.preventDefault();
    setShow(false);
    onCloseModal();

    try {
      // Crear un objeto con las fechas directamente como Date
      const personDataWithDates = {
        ...personData,
        birthDate: birthDate ? birthDate : null,
        baptiseDate: baptiseDate ? baptiseDate : null,
        blessingDate: blessingDate ? blessingDate : null,
      };

      // Guardar en Firestore
      await addDoc(collection(firestore, "externalForms"), personDataWithDates);
      alert("Formulario enviado con éxito!");
    } catch (err) {
      console.error("Error al enviar el formulario: ", err);
    }
  };

  return (
    <div className="form-container">
      <h1 className="form-title">FORMULAR ACTUALIZARE REGISTRU </h1>
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
              <DatePicker
                selected={birthDate}
                onChange={(date) => setBirthDate(date)}
                peekNextMonth
                maxDate={new Date()}
                showMonthDropdown
                showYearDropdown
                dropdownMode="select"
                dateFormat="dd/MM/yyyy"
                className="input"
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
            />

            <label className="label">
              Data Binecuvantarii:
              <DatePicker
                selected={blessingDate}
                onChange={(date) => setBlessingDate(date)}
                peekNextMonth
                showMonthDropdown
                showYearDropdown
                dropdownMode="select"
                dateFormat="dd/MM/yyyy"
                className="input"
              />
            </label>
            <label className="label">
              Data Botezului:
              <DatePicker
                selected={baptiseDate}
                onChange={(date) => setBaptiseDate(date)}
                peekNextMonth
                showMonthDropdown
                showYearDropdown
                dropdownMode="select"
                dateFormat="dd/MM/yyyy"
                className="input"
              />
            </label>
          </div>
        </div>

        <label>Comentarios:</label>
        <textarea
          id="comments"
          name="details" // Asegúrate de usar el nombre correcto
          rows="4"
          placeholder="Escribe tus comentarios aquí..."
          value={personData.details} // Vinculamos el valor al estado
          onChange={(e) =>
            setPersonData({ ...personData, details: e.target.value })
          } // Actualizamos el estado cuando el usuario escribe
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
