import React, { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
  getDoc,
} from "firebase/firestore";
import { firestore } from "../firebase-config";
import { Badge, Button, Modal } from "react-bootstrap";
import DatePicker from "react-datepicker"; // Importar DatePicker
import "react-datepicker/dist/react-datepicker.css"; // Importar los estilos de DatePicker
import ImageUploader from "../components/ImageUploader/ImageUploader";
import "./ExternalFormsReview.scss";
import { FaTrash } from "react-icons/fa";
import {
  validateName,
  validatePhone,
  validateAddress,
  validateDate,
  sanitizeText,
} from "../utils/validation";

// Estilos para los mensajes de error
const errorStyles = `
  .error-message {
    color: #dc3545;
    font-size: 0.8rem;
    margin-top: 0.25rem;
  }
  
  .is-invalid {
    border-color: #dc3545 !important;
    background-color: #fff8f8;
  }
`;

// Agregar estilos al documento
const styleElement = document.createElement("style");
styleElement.textContent = errorStyles;
document.head.appendChild(styleElement);

const ExternalFormsReview = ({ persoane }) => {
  const [show, setShow] = useState(false);
  const [form, setForm] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [externalForms, setExternalForms] = useState([]);
  const [personData, setPersonData] = useState({
    firstName: "",
    lastName: "",
    address: "",
    mobilePhone: "",
    birthDate: null,
    sex: "",
    baptiseDate: null,
    blessingDate: null,
    profileImage: selectedFile,
    observations: "",
  });

  const [selectedForm, setSelectedForm] = useState(null);

  const handleFormClick = (form) => {
    setForm(form);
    setSelectedForm(form); // Establece el formulario seleccionado
  };

  // Convertir un timestamp de Firestore a un objeto Date
  const timestampToDate = (timestamp) => {
    if (timestamp && timestamp.seconds) {
      return new Date(timestamp.seconds * 1000); // Convertir el timestamp a objeto Date
    }
    return null; // Devuelve null si no es válido
  };

  // Prellenar el formulario con los datos recibidos de Firestore
  useEffect(() => {
    if (form) {
      setPersonData({
        firstName: form.firstName || "",
        lastName: form.lastName || "",
        address: form.address || "",
        mobilePhone: form.mobilePhone || "",
        birthDate: form.birthDate ? timestampToDate(form.birthDate) : null,
        sex: form.sex || "",
        baptiseDate: form.baptiseDate
          ? timestampToDate(form.baptiseDate)
          : null,
        blessingDate: form.blessingDate
          ? timestampToDate(form.blessingDate)
          : null,
        observations: form.details || "",
        profileImage: form.profileImage ? form.profileImage : null,
      });
    }
  }, [form]);

  const [formErrors, setFormErrors] = useState({});

  const handleSubmit = async (e) => {
    setSelectedForm(null);
    e.preventDefault(); // Prevenir el comportamiento por defecto del formulario

    // Validar los campos del formulario antes de procesar
    const errors = {};

    // Sanitizar y validar nombre y apellido
    const sanitizedFirstName = sanitizeText(personData.firstName);
    const sanitizedLastName = sanitizeText(personData.lastName);

    if (!validateName(sanitizedFirstName)) {
      errors.firstName = "El nombre no es válido";
    }

    if (!validateName(sanitizedLastName)) {
      errors.lastName = "El apellido no es válido";
    }

    // Validar teléfono
    if (!validatePhone(personData.mobilePhone)) {
      errors.mobilePhone = "El número de teléfono no es válido";
    }

    // Validar dirección
    if (!validateAddress(personData.address)) {
      errors.address = "La dirección no es válida";
    }

    // Validar fecha de nacimiento
    if (personData.birthDate && !validateDate(personData.birthDate)) {
      errors.birthDate = "La fecha de nacimiento no es válida";
    }

    // Validar género
    if (!personData.sex) {
      errors.sex = "Debe seleccionar un género";
    }

    // Validar otras fechas si están presentes
    if (personData.baptiseDate && !validateDate(personData.baptiseDate)) {
      errors.baptiseDate = "La fecha de bautismo no es válida";
    }

    if (personData.blessingDate && !validateDate(personData.blessingDate)) {
      errors.blessingDate = "La fecha de bendición no es válida";
    }

    // Validar observaciones
    if (personData.observations && personData.observations.length > 500) {
      errors.observations =
        "Las observaciones no pueden exceder los 500 caracteres";
    }

    // Si hay errores, mostrarlos y detener el envío
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    // Limpiar errores si todo está bien
    setFormErrors({});

    // Sanitizar las observaciones para prevenir inyección
    personData.observations = sanitizeText(personData.observations);

    if (persoane) {
      try {
        const existingPerson = persoane?.find(
          (p) =>
            p.firstName?.toLowerCase().trim() ===
              sanitizedFirstName.toLowerCase().trim() &&
            p.lastName?.toLowerCase().trim() ===
              sanitizedLastName.toLowerCase().trim()
        );

        if (existingPerson) {
          // Obtener el valor actual de 'observations' de la persona
          const personRef = doc(firestore, "persoane", existingPerson.id);
          const personDoc = await getDoc(personRef);

          // Si existe el documento de la persona
          if (personDoc.exists()) {
            const currentPersonData = personDoc.data();
            const existingObservations = currentPersonData.observations || ""; // Valor actual de 'observations'

            // Concatenar el nuevo valor de observations al valor existente
            const newObservations = personData.observations
              ? `${existingObservations} ${personData.observations}` // Agregar espacio entre ambos textos
              : existingObservations;

            // Crear un nuevo objeto solo con los campos no vacíos
            const updatedFields = Object.keys(personData).reduce((acc, key) => {
              if (
                personData[key] !== "" &&
                personData[key] !== null &&
                personData[key] !== undefined
              ) {
                acc[key] = personData[key];
              }
              return acc;
            }, {});

            // Actualizar el campo 'observations' concatenado
            updatedFields.observations = newObservations;

            // Si la persona existe, actualizar el documento en Firestore
            if (updatedFields.sex) {
              updatedFields.sex = updatedFields.sex === "M" ? true : false;
            }

            await updateDoc(personRef, updatedFields);

            // Eliminar el formulario de la colección temporal
            await deleteDoc(doc(firestore, "externalForms", form?.id));

            alert("FISA ACTUALIZATA CORECT !!! ");
            setExternalForms(externalForms.filter((f) => f.id !== form.id)); // Eliminar formulario sincronizado de la lista
            setForm(null); // Limpiar el formulario actual
          } else {
            alert("No se encontró una persona con esos datos.");
          }
        } else {
          alert("No se encontró una persona con esos datos.");
        }
      } catch (error) {
        console.error("Error al sincronizar el formulario:", error);
      }
    }
  };

  const handleClose = () => {
    setShow(false);
    setSelectedForm(null);
  };

  // Obtener los formularios de externalForms
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

  const deleteForm = async (formId) => {
    await deleteDoc(doc(firestore, "externalForms", formId));
    setExternalForms(externalForms.filter((f) => f.id !== formId)); // Eliminar formulario sincronizado de la lista
    setForm(null); // Limpiar el formulario actual
  };

  const showForm = (form) => {
    setForm(form); // Cargar los datos del formulario seleccionado
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Sanitizar el valor ingresado según el tipo de campo
    let sanitizedValue = value;

    // Para campos de texto como nombres, direcciones, etc.
    // if (["firstName", "lastName", "address"].includes(name)) {
    //   sanitizedValue = sanitizeText(value);
    // }

    setPersonData({
      ...personData,
      [name]: sanitizedValue,
    });
  };

  return (
    <div>
      <Button
        style={{ marginInline: "10px" }}
        variant="primary"
        onClick={() => setShow(true)}
      >
        FORMULARE PRIMITE
        {externalForms.length > 0 && (
          <Badge pill bg="danger" style={{ marginLeft: "10px" }}>
            {externalForms.length} {/* Muestra la cantidad de formularios */}
          </Badge>
        )}
      </Button>

      <Modal show={show} onHide={handleClose} className="custom-modal">
        <Modal.Header closeButton className="modal-header">
          <Modal.Title className="modal-title">
            {selectedForm
              ? `${selectedForm.firstName} ${selectedForm.lastName}`
              : "FORMULARE PRIMITE"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedForm ? (
            <div className="form-container">
              <h1 className="form-title">{selectedForm.lastName}</h1>
              <form className="form-group" onSubmit={handleSubmit}>
                <div className="colums">
                  <div className="colum-form">
                    <label className="label">
                      Nume {`(obligatoriu)`}:
                      <input
                        required
                        className={`input ${
                          formErrors.lastName ? "is-invalid" : ""
                        }`}
                        type="text"
                        name="lastName"
                        value={personData.lastName}
                        onChange={handleChange}
                      />
                      {formErrors.lastName && (
                        <div className="error-message">
                          {formErrors.lastName}
                        </div>
                      )}
                    </label>
                    <label className="label">
                      Prenume {`(obligatoriu)`}:
                      <input
                        required
                        className={`input ${
                          formErrors.firstName ? "is-invalid" : ""
                        }`}
                        type="text"
                        name="firstName"
                        value={personData.firstName}
                        onChange={handleChange}
                      />
                      {formErrors.firstName && (
                        <div className="error-message">
                          {formErrors.firstName}
                        </div>
                      )}
                    </label>

                    <label className="label">
                      Adresa {`(obligatoriu)`}:
                      <input
                        required
                        className={`input ${
                          formErrors.address ? "is-invalid" : ""
                        }`}
                        type="text"
                        name="address"
                        value={personData.address}
                        onChange={handleChange}
                      />
                      {formErrors.address && (
                        <div className="error-message">
                          {formErrors.address}
                        </div>
                      )}
                    </label>
                    <label className="label">
                      Telefon {`(obligatoriu)`}:
                      <input
                        required
                        className={`input ${
                          formErrors.mobilePhone ? "is-invalid" : ""
                        }`}
                        type="text"
                        name="mobilePhone"
                        value={personData.mobilePhone}
                        onChange={handleChange}
                      />
                      {formErrors.mobilePhone && (
                        <div className="error-message">
                          {formErrors.mobilePhone}
                        </div>
                      )}
                    </label>
                    <label className="label">
                      Data nasterii {`(obligatoriu)`}:
                      <DatePicker
                        selected={personData.birthDate}
                        onChange={(date) =>
                          setPersonData({ ...personData, birthDate: date })
                        }
                        peekNextMonth
                        showMonthDropdown
                        showYearDropdown
                        dropdownMode="select"
                        dateFormat="dd/MM/yyyy"
                        className={`input ${
                          formErrors.birthDate ? "is-invalid" : ""
                        }`}
                      />
                      {formErrors.birthDate && (
                        <div className="error-message">
                          {formErrors.birthDate}
                        </div>
                      )}
                    </label>

                    <label className="label">
                      Gen {`(obligatoriu)`}:
                      <select
                        required
                        className={`select ${
                          formErrors.sex ? "is-invalid" : ""
                        }`}
                        name="sex"
                        value={personData.sex}
                        onChange={handleChange}
                      >
                        <option value="">Selectioneaza</option>
                        <option value="M">Masculin</option>
                        <option value="F">Femenin</option>
                      </select>
                      {formErrors.sex && (
                        <div className="error-message">{formErrors.sex}</div>
                      )}
                    </label>
                  </div>
                  <div className="column-form">
                    <ImageUploader
                      onFileSelectSuccess={(file) => setSelectedFile(file)}
                      onFileSelectError={({ error }) => alert(error)}
                      initialImage={form?.profileImage}
                    />

                    <label className="label">
                      Data Binecuvantarii:
                      <DatePicker
                        selected={personData.blessingDate}
                        onChange={(date) =>
                          setPersonData({ ...personData, blessingDate: date })
                        }
                        peekNextMonth
                        showMonthDropdown
                        showYearDropdown
                        dropdownMode="select"
                        dateFormat="dd/MM/yyyy"
                        className={`input ${
                          formErrors.blessingDate ? "is-invalid" : ""
                        }`}
                      />
                      {formErrors.blessingDate && (
                        <div className="error-message">
                          {formErrors.blessingDate}
                        </div>
                      )}
                    </label>
                    <label className="label">
                      Data Botezului:
                      <DatePicker
                        selected={personData.baptiseDate}
                        onChange={(date) =>
                          setPersonData({ ...personData, baptiseDate: date })
                        }
                        peekNextMonth
                        showMonthDropdown
                        showYearDropdown
                        dropdownMode="select"
                        dateFormat="dd/MM/yyyy"
                        className={`input ${
                          formErrors.blessingDate ? "is-invalid" : ""
                        }`}
                      />
                      {formErrors.blessingDate && (
                        <div className="error-message">
                          {formErrors.blessingDate}
                        </div>
                      )}
                    </label>
                  </div>
                </div>

                <label>Comentarios:</label>
                <textarea
                  id="comments"
                  name="observations" // Asegúrate de usar el nombre correcto
                  rows="4"
                  placeholder="Escribe tus comentarios aquí..."
                  value={personData.observations} // Vinculamos el valor al estado
                  className={`${formErrors.observations ? "is-invalid" : ""}`}
                  onChange={(e) =>
                    setPersonData({
                      ...personData,
                      observations: e.target.value, // Actualizamos el estado con el valor del textarea
                    })
                  } // Actualizamos el estado cuando el usuario escribe
                ></textarea>
                {formErrors.observations && (
                  <div className="error-message">{formErrors.observations}</div>
                )}
                <button className="submit-btn" type="submit">
                  Actualizar
                </button>
                <button
                  className="cancel-btn"
                  type="button"
                  onClick={() => setSelectedForm(null)} // Regresar a la lista
                >
                  Volver a la lista
                </button>
              </form>
            </div>
          ) : (
            <ul className="form-list">
              {externalForms.map((form) => (
                <li
                  key={form.id}
                  onClick={() => handleFormClick(form)}
                  className="form-item"
                >
                  <div className="form-content">
                    <h3 className="form-name">
                      {form.lastName} {form.firstName}
                    </h3>
                    <p className="form-address">{form.address}</p>
                  </div>
                  <button
                    className="delete-btn"
                    onClick={(e) => {
                      e.stopPropagation(); // Evita activar el evento onClick del formulario
                      if (
                        window.confirm(
                          "¿Estás seguro de que quieres eliminar este formulario?"
                        )
                      ) {
                        deleteForm(form.id); // Función para eliminar el formulario
                      }
                    }}
                  >
                    <FaTrash />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Modal.Body>
        <Modal.Footer className="modal-footer">
          <Button
            variant="secondary"
            onClick={handleClose}
            className="close-button"
          >
            Cerrar
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ExternalFormsReview;
