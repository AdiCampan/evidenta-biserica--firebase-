import React, { useState, useEffect } from "react";
import { firestore } from "../firebase-config";
import { collection, addDoc } from "firebase/firestore"; // No más Timestamp
import DatePicker from "react-datepicker"; // Importamos el DatePicker
import "react-datepicker/dist/react-datepicker.css";
import "./ExternalForm.scss";
import ImageUploader from "../components/ImageUploader/ImageUploader";
import { validateName, validatePhone, validateAddress, validateDate, sanitizeText } from "../utils/validation";
import { generateCSRFToken, verifyCSRFToken } from "../utils/csrf";

const ExternalForm = ({ onCloseModal }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isAgreed, setIsAgreed] = useState(false); // Estado para la casilla de verificación
  const [csrfToken, setCsrfToken] = useState(""); // Token CSRF
  const [formId] = useState(() => `form_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`); // ID único para el formulario

  // Estado para las fechas como objetos Date
  const [honeypot, setHoneypot] = useState(""); //proteccion antiBot
  const [startTime, setStartTime] = useState(null);
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
    setStartTime(Date.now());
    // Generar token CSRF al cargar el componente
    setCsrfToken(generateCSRFToken());
  }, []);

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

    const endTime = Date.now();
    const timeTaken = (endTime - startTime) / 1000; // Tiempo en segundos

    if (timeTaken < 10) {
      // Si toma menos de 10 segundos
      alert("Por favor, tómese su tiempo para llenar el formulario.");
      return;
    }

    if (honeypot !== "") {
      alert("Formulario detectado como spam.");
      return;
    }
    
    // Verificar token CSRF
    if (!verifyCSRFToken(csrfToken)) {
      alert("Error de seguridad: La sesión ha expirado o es inválida. Por favor, recarga la página.");
      return;
    }

    // Validar si el usuario ha aceptado los términos
    if (!isAgreed) {
      alert(
        "Debes aceptar el tratamiento de los datos personales para continuar."
      );
      return;
    }
    
    // Validar los campos del formulario
    const errors = [];
    
    // Sanitizar y validar nombre y apellido
    const sanitizedFirstName = sanitizeText(personData.firstName);
    const sanitizedLastName = sanitizeText(personData.lastName);
    
    if (!validateName(sanitizedFirstName)) {
      errors.push("El nombre no es válido");
    }
    
    if (!validateName(sanitizedLastName)) {
      errors.push("El apellido no es válido");
    }
    
    // Validar teléfono si se proporcionó
    if (personData.mobilePhone && !validatePhone(personData.mobilePhone)) {
      errors.push("El número de teléfono no es válido");
    }
    
    // Validar dirección si se proporcionó
    if (personData.address && !validateAddress(personData.address)) {
      errors.push("La dirección no es válida");
    }
    
    // Validar fecha de nacimiento
    if (birthDate && !validateDate(birthDate)) {
      errors.push("La fecha de nacimiento no es válida");
    }
    
    // Si hay errores, mostrarlos y detener el envío
    if (errors.length > 0) {
      alert("Por favor corrija los siguientes errores:\n" + errors.join("\n"));
      return;
    }

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
      <h1 className="form-title">FORMULAR ACTUALIZARE REGISTRU</h1>
      <form className="form-group" onSubmit={handleSubmit}>
        <div className="colums">
          <div className="colum-form">
            <label>
              <input
                type="text"
                style={{ display: "none" }}
                name="honeypot"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
              />
            </label>
            <label className="label">
              Nume {`(Apellidos)`}:
              <input
                placeholder="obligatoriu"
                required
                className="input"
                type="text"
                name="lastName"
                value={personData.lastName}
                onChange={handleChange}
              />
            </label>
            <label className="label">
              Prenume {`(Nombre)`}:
              <input
                placeholder="obligatoriu"
                required
                className="input"
                type="text"
                name="firstName"
                value={personData.firstName}
                onChange={handleChange}
              />
            </label>
            <label className="label">
              Adresa {`(Direccion)`}:
              <input
                placeholder="obligatoriu"
                required
                className="input"
                type="text"
                name="address"
                value={personData.address}
                onChange={handleChange}
              />
            </label>
            <label className="label">
              Telefon {`(Telefono)`}:
              <input
                placeholder="obligatoriu"
                required
                className="input"
                type="text"
                name="mobilePhone"
                value={personData.mobilePhone}
                onChange={handleChange}
              />
            </label>
            <label className="label">
              Data nașterii {`(Fecha de nacimiento)`}:
              <DatePicker
                placeholderText="Obligatoriu"
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
              Gen {`(Genero)`}:
              <select
                placeholder="obligatoriu"
                required
                className="select"
                name="sex"
                value={personData.sex}
                onChange={handleChange}
              >
                <option value="">Obligatoriu</option>
                <option value="M">Masculin</option>
                <option value="F">Femenin</option>
              </select>
            </label>
          </div>
          <div className="column-form">
            <ImageUploader
              id={formId}
              onFileSelectSuccess={(file) => setSelectedFile(file)}
              onFileSelectError={({ error }) => alert(error)}
              isExternalForm={true}
            />

            <label className="label">
              Data Binecuvantarii {`(Fecha de bendición)`}:
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
              Data Botezului {`(Fecha de bautismo)`}:
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

        <label>Comentarii {`(Comentarios)`}:</label>
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

        {/* Texto sobre la Ley Orgánica 3/2018 */}
        <div className="data-protection-info">
          <p>
            În conformitate cu <strong>Legea organică 3/2018</strong> , din 5
            decembrie, privind protecția datelor cu caracter personal și
            garanția drepturilor digitale, datele dumneavoastră vor fi
            prelucrate în conformitate cu reglementările în vigoare.{" "}
            <a
              href="https://www.boe.es/eli/es/lo/2018/12/05/3/con"
              target="_blank"
              rel="noopener noreferrer"
            >
              Leer más...
            </a>
          </p>
          <p>
            Conforme a la <strong>Ley Orgánica 3/2018</strong>, de 5 de
            diciembre, de Protección de Datos Personales y garantía de los
            derechos digitales, tus datos serán tratados de acuerdo con la
            normativa vigente.{" "}
            <a
              href="https://www.boe.es/eli/es/lo/2018/12/05/3/con"
              target="_blank"
              rel="noopener noreferrer"
            >
              Leer más...
            </a>
          </p>
        </div>

        {/* Casilla de verificación para la conformidad con el tratamiento de datos */}
        <div className="checkbox-container">
          <div>
            <input
              type="checkbox"
              id="data-agreement"
              name="dataAgreement"
              checked={isAgreed}
              onChange={() => setIsAgreed(!isAgreed)}
            />
          </div>

          <label htmlFor="data-agreement">
            He leído y estoy de acuerdo con el{" "}
            <a
              href="https://www.boe.es/eli/es/lo/2018/12/05/3/con"
              target="_blank"
              rel="noopener noreferrer"
            >
              tratamiento de los datos personales
            </a>{" "}
            conforme la ley.
          </label>
        </div>

        <button className="submit-btn" type="submit" disabled={!isAgreed}>
          Enviar / Trimite
        </button>
        <button className="cancel-btn" onClick={() => onCloseModal()}>
          Cancel / Anulează
        </button>
      </form>
    </div>
  );
};

export default ExternalForm;
