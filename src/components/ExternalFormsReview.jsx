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

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevenir el comportamiento por defecto del formulario

    if (persoane) {
      try {
        const existingPerson = persoane?.find(
          (p) =>
            p.firstName === personData.firstName &&
            p.lastName === personData.lastName
          // Puedes agregar la comparación de la fecha de nacimiento aquí si es necesario
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
            await deleteDoc(doc(firestore, "externalForms", form.id));

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

  const handleClose = () => setShow(false);

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

  const showForm = (form) => {
    setForm(form); // Cargar los datos del formulario seleccionado
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

      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>FORMULARE PRIMITE</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {externalForms.length === 0 ? (
            <p>Nu sunt formulare primite</p>
          ) : (
            <ul>
              {externalForms.map((form) => (
                <li key={form.id} onClick={() => showForm(form)}>
                  {form.firstName} {form.lastName} - {form.address}
                </li>
              ))}
            </ul>
          )}
          {form && (
            <div className="form-container">
              <h1 className="form-title">{form.lastName}</h1>
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
                        selected={personData.birthDate}
                        onChange={(date) =>
                          setPersonData({ ...personData, birthDate: date })
                        }
                        peekNextMonth
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
                      initialImage={form.profileImage}
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
                        className="input"
                      />
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
                        className="input"
                      />
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
                  onChange={(e) =>
                    setPersonData({
                      ...personData,
                      observations: e.target.value,
                    })
                  } // Actualizamos el estado cuando el usuario escribe
                ></textarea>
                <button className="submit-btn" type="submit">
                  Actualizar
                </button>
                <button
                  className="cancel-btn"
                  type="button"
                  onClick={handleClose}
                >
                  Cancelar
                </button>
              </form>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Cerrar
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ExternalFormsReview;
