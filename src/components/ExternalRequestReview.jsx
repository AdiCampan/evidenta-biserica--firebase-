import React, { useState, useEffect } from "react";
import { firestore } from "../firebase-config";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
  setDoc,
} from "firebase/firestore"; // No más Timestamp
import DatePicker from "react-datepicker"; // Importamos el DatePicker
import "react-datepicker/dist/react-datepicker.css";
import "./ExternalForm.scss";
import ImageUploader from "../components/ImageUploader/ImageUploader";
import {
  Badge,
  Button,
  Card,
  Col,
  Form,
  InputGroup,
  Modal,
  ModalBody,
  Row,
} from "react-bootstrap";
import {
  Checkbox,
  FormControlLabel,
  Input,
  Radio,
  RadioGroup,
} from "@mui/material";
import { FaTrash } from "react-icons/fa";

const ExternalRequestReview = ({ persoane }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [show, setShow] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formularVerificare, setFormularVerificare] = useState(""); //proteccion antiBot
  const [startTime, setStartTime] = useState(null);
  const [birthDate, setBirthDate] = useState(null);
  const [baptiseDate, setBaptiseDate] = useState(null);
  const [blessed, setBlessed] = useState(null);
  const [maritalStatus, setMaritalStatus] = useState("");
  const [civilWeddingDate, setCivilWeddingDate] = useState(null);
  const [religiousWeddingDate, setReligiousWeddingDate] = useState(null);
  const [hsBaptised, setHsBaptised] = useState(null);
  const [hsBaptiseDate, setHsBaptisedDate] = useState(null);
  const [childrens, setChildrens] = useState([]);
  const [personData, setPersonData] = useState({
    address: "",
    baptisedBy: "",
    baptisePlace: "",
    birthPlace: "",
    childrens: [],
    details: "",
    dni: "",
    email: "",
    firstName: "",
    father: { lastName: "", firstName: "" },
    familyFaith: "",
    familyDetails: "",
    hsBaptisePlace: "",
    lastName: "",
    maidenName: "",
    mobilePhone: "",
    mother: { lastName: "", firstName: "" },
    observations: "",
    originChurch: "",
    originChurchPeriod: "",
    profileImage: selectedFile,
    profession: "",
    sex: "",
    studies: "",
    spouse: { lastName: "", firstName: "" },
    transferNumber: "",
  });

  const [externalForms, setExternalForms] = useState([]);
  const [form, setForm] = useState(null);
  const [selectedForm, setSelectedForm] = useState(null);

  // Obtener los formularios de externalForms
  useEffect(() => {
    const fetchExternalForms = async () => {
      const formsSnapshot = await getDocs(
        collection(firestore, "externalRequests")
      );
      const formsList = formsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setExternalForms(formsList);
    };

    fetchExternalForms();
  }, []);

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
      setBirthDate(form.birthDate ? timestampToDate(form.birthDate) : null),
        setBaptiseDate(
          form.baptiseDate ? timestampToDate(form.baptiseDate) : null
        ),
        setSelectedFile(form.selectedFile),
        setCivilWeddingDate(
          form.civilWeddingDate ? timestampToDate(form.civilWeddingDate) : null
        ),
        setReligiousWeddingDate(
          form.religiousWeddingDate
            ? timestampToDate(form.religiousWeddingDate)
            : null
        ),
        setChildrens(
          form.childrens
            ? form.childrens.map((child) => ({
                firstName: child.firstName || "",
                lastName: child.lastName || "",
                sex: child.sex || "",
                birthDate: child.birthDate
                  ? timestampToDate(child.birthDate)
                  : null,
              }))
            : []
        );
      setBlessed(
        form.blessed === true ? "y" : form.blessed === false ? "n" : null
      ),
        setHsBaptised(
          form.hsBaptised === true
            ? "y"
            : form.hsBaptised === false
            ? "n"
            : null
        ),
        setHsBaptisedDate(
          form.hsBaptiseDate ? timestampToDate(form.hsBaptiseDate) : null
        );
      setMaritalStatus(
        form.maritalStatus === true
          ? "y"
          : form.maritalStatus === false
          ? "n"
          : form.maritalStatus === "other"
          ? "o"
          : null
      );
      setPersonData({
        address: form.address || "",
        baptisedBy: form.baptisedBy || "",
        baptisePlace: form.baptisePlace || "",
        birthPlace: form.birthPlace || "",
        details: form.details || "",
        dni: form.dni || "",
        email: form.email || "",
        father: {
          firstName: form.father.firstName || "",
          lastName: form.father.lastName || "",
        },
        familyFaith: form.familyFaith || "",
        familyDetails: form.familyDetails || "",
        firstName: form.firstName || "",
        hsBaptisePlace: form.hsBaptisePlace || "",
        lastName: form.lastName || "",
        maidenName: form.maidenName || "",
        mother: {
          firstName: form.mother.firstName || "",
          lastName: form.mother.lastName || "",
        },
        mobilePhone: form.mobilePhone || "",
        sex: form.sex || "",
        spouse: {
          firstName: form.spouse.firstName || "",
          lastName: form.spouse.lastName || "",
        },
        observations: form.observations || "",
        originChurch: form.originChurch || "",
        originChurchPeriod: form.originChurchPeriod || "",
        profession: form.profession || "",
        studies: form.studies || "",
        transferNumber: form.transferNumber || "",
      });
    }
  }, [form]);

  const deleteForm = async (formId) => {
    await deleteDoc(doc(firestore, "externalRequests", formId));
    setExternalForms(externalForms.filter((f) => f.id !== formId)); // Eliminar formulario sincronizado de la lista
    setForm(null); // Limpiar el formulario actual
  };

  useEffect(() => {
    setStartTime(Date.now());
  }, []);

  //Modificar datos  en EL FORMULARIO//
  useEffect(() => {
    if (hsBaptised === "n") {
      setHsBaptisedDate(null);
      setPersonData((prevState) => ({
        ...prevState,
        hsBaptisePlace: "",
      }));
    }

    setPersonData((prevData) => ({
      ...prevData,
      profileImage: form?.profileImage || null,
      birthDate: birthDate,
      baptiseDate: baptiseDate || null,
      civilWeddingDate: civilWeddingDate || null,
      religiousWeddingDate: religiousWeddingDate || null,
      childrens: childrens,
      blessed: blessed === "y" ? true : blessed === "n" ? false : null,
      hsBaptised: hsBaptised === "y" ? true : hsBaptised === "n" ? false : null,
      maritalStatus:
        maritalStatus === "y"
          ? true
          : maritalStatus === "n"
          ? false
          : maritalStatus === "o"
          ? "other"
          : null,
      hsBaptiseDate: hsBaptiseDate || null,
    }));
  }, [
    selectedFile,
    birthDate,
    baptiseDate,
    childrens,
    blessed,
    hsBaptised,
    hsBaptiseDate,
  ]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Verifica si el nombre incluye un campo anidado (e.g., "father.firstName")
    if (name.includes(".")) {
      const [parent, child] = name.split("."); // Divide "father.firstName" en ["father", "firstName"]
      setPersonData((prevState) => ({
        ...prevState,
        [parent]: {
          ...prevState[parent],
          [child]: value, // Actualiza solo el campo específico dentro del objeto anidado
        },
      }));
    } else {
      // Si no es un campo anidado, actualiza normalmente
      setPersonData({
        ...personData,
        [name]: value,
      });
    }
  };

  // MODIFICAR RELATIONS, PARA SUBIR A FIRESTORE//
  const updateRelationsForPerson = async (personData, persoane) => {
    const {
      father,
      mother,
      childrens,
      id: currentPersonId,
      spouse,
    } = personData;

    const findPersonByName = (firstName, lastName) => {
      if (!firstName || !lastName) return null;
      return persoane.find(
        (person) =>
          person.firstName?.toLowerCase().trim() ===
            firstName.toLowerCase().trim() &&
          person.lastName?.toLowerCase().trim() ===
            lastName.toLowerCase().trim()
      );
    };

    const createNewPerson = async (firstName, lastName, sex) => {
      const newPersonData = {
        firstName,
        lastName,
        sex,
        church: "other",
        relations: [],
      };
      const newPersonDoc = await addDoc(
        collection(firestore, "persoane"),
        newPersonData
      );
      return { id: newPersonDoc.id, ...newPersonData };
    };

    const updatedRelations = [...(personData.relations || [])]; // Inicializa relaciones locales

    // Agregar padre
    if (father) {
      let fatherPerson = findPersonByName(father.firstName, father.lastName);
      if (!fatherPerson) {
        fatherPerson = await createNewPerson(
          father.firstName,
          father.lastName,
          true
        );
        persoane.push(fatherPerson);
      }
      await updateDoc(doc(firestore, "persoane", fatherPerson.id), {
        relations: arrayUnion({ person: currentPersonId, type: "child" }),
      });
      updatedRelations.push({ person: fatherPerson.id, type: "father" });
    }

    // Agregar madre
    if (mother) {
      let motherPerson = findPersonByName(mother.firstName, mother.lastName);
      if (!motherPerson) {
        motherPerson = await createNewPerson(
          mother.firstName,
          mother.lastName,
          false
        );
        persoane.push(motherPerson);
      }
      await updateDoc(doc(firestore, "persoane", motherPerson.id), {
        relations: arrayUnion({ person: currentPersonId, type: "child" }),
      });
      updatedRelations.push({ person: motherPerson.id, type: "mother" });
    }

    // Agregar hijos
    if (childrens?.length) {
      for (const child of childrens) {
        let childPerson = findPersonByName(child.firstName, child.lastName);
        if (!childPerson) {
          childPerson = await createNewPerson(
            child.firstName,
            child.lastName,
            null
          );
          persoane.push(childPerson);
        }
        const parentType = personData.sex ? "father" : "mother";
        await updateDoc(doc(firestore, "persoane", childPerson.id), {
          relations: arrayUnion({
            person: currentPersonId,
            type: parentType,
          }),
        });
        updatedRelations.push({ person: childPerson.id, type: "child" });
      }
    }

    // Agregar cónyuge (spouse)
    if (spouse) {
      let spousePerson = findPersonByName(spouse.firstName, spouse.lastName);
      if (!spousePerson) {
        spousePerson = await createNewPerson(
          spouse.firstName,
          spouse.lastName,
          personData.sex ? false : true // Sexo opuesto al de la persona actual
        );
        persoane.push(spousePerson);
      }

      const spouseType = personData.sex ? "wife" : "husband";
      const marriageRelation = {
        person: spousePerson.id,
        type: spouseType,
        civilWeddingDate: personData.civilWeddingDate || null,
        religiousWeddingDate: personData.religiousWeddingDate || null,
        weddingChurch: personData.weddingChurch || "unknown",
      };

      // Relación de la persona actual
      updatedRelations.push(marriageRelation);

      // Relación espejo en el cónyuge
      const mirroredMarriageRelation = {
        person: currentPersonId,
        type: personData.sex ? "husband" : "wife",
        civilWeddingDate: personData.civilWeddingDate || null,
        religiousWeddingDate: personData.religiousWeddingDate || null,
        weddingChurch: personData.weddingChurch || "unknown",
      };

      await updateDoc(doc(firestore, "persoane", spousePerson.id), {
        relations: arrayUnion(mirroredMarriageRelation),
      });
    }

    return updatedRelations; // Devuelve las relaciones actualizadas
  };

  const initializeRelations = async (personId) => {
    if (!personId || typeof personId !== "string") {
      console.error("initializeRelations: ID inválido", personId);
      throw new Error("El ID proporcionado a initializeRelations no es válido");
    }
    const personDoc = doc(firestore, "persoane", personId);
    const personData = (await getDoc(personDoc)).data();
    if (!Array.isArray(personData.relations)) {
      await updateDoc(personDoc, { relations: [] });
    }
  };

  //  ACCEPTAR EL USUARIO
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formularVerificare !== "") {
      alert("Formulario detectado como spam.");
      return;
    }

    try {
      const personDataWithDates = {
        ...personData,
        sex:
          personData.sex === "M" ? true : personData.sex === "F" ? false : null,
        churchName: "EBEN - EZER",
        birthDate: birthDate || null,
        baptiseDate: baptiseDate || null,
        hsBaptiseDate: hsBaptiseDate || null,
        civilWeddingDate: civilWeddingDate || null,
        religiousWeddingDate: religiousWeddingDate || null,
      };

      // Añadir la nueva persona a Firestore
      const docRef = await addDoc(
        collection(firestore, "persoane"),
        personDataWithDates
      );
      const newPersonId = docRef.id;

      if (!newPersonId || typeof newPersonId !== "string") {
        console.error("Error: ID de persona inválido:", newPersonId);
        throw new Error("El ID generado para la persona no es válido");
      }

      personDataWithDates.id = newPersonId;

      // Inicializar relaciones para la nueva persona
      await initializeRelations(newPersonId);

      // Actualizar relaciones
      const updatedRelations = await updateRelationsForPerson(
        personDataWithDates,
        persoane
      );

      await updateDoc(doc(firestore, "persoane", newPersonId), {
        relations: updatedRelations || [],
      });

      alert("Cererea a fost adaugata la arhiva !");
      await deleteDoc(doc(firestore, "externalRequests", form.id));

      setExternalForms(externalForms.filter((f) => f.id !== form.id));
      setForm(null);
      setShow(false);
      setSelectedForm(null);
    } catch (err) {
      console.error("Error al enviar el formulario: ", err);
    }
  };

  // Agregar un nuevo CAMPO niño al presionar el botón//
  const addChild = () => {
    setChildrens([
      ...childrens,
      { firstName: "", lastName: "", sex: "", birthDate: null },
    ]);
  };

  // Manejar los cambios en los inputs de un niño específico
  const handleChildChange = (index, field, value) => {
    const updatedChildren = [...childrens];
    updatedChildren[index][field] = value;
    setChildrens(updatedChildren);
  };
  //RECHAZAR LA PETICION DE MEMBU//
  const handleRefuse = async (event) => {
    event.stopPropagation(); // Detener propagación
    event.preventDefault(); // Prevenir comportamiento predeterminado
    if (isSubmitting) return; // Evitar múltiples ejecuciones
    setIsSubmitting(true);

    try {
      const personDataWithDates = {
        ...personData,
        sex:
          personData.sex === "M" ? true : personData.sex === "F" ? false : null,
        churchName: "",
        birthDate: birthDate ? birthDate : null,
        baptiseDate: baptiseDate ? baptiseDate : null,
        hsBaptiseDate: hsBaptiseDate ? hsBaptiseDate : null,
        civilWeddingDate: civilWeddingDate ? civilWeddingDate : null,
        religiousWeddingDate: religiousWeddingDate
          ? religiousWeddingDate
          : null,
      };

      await addDoc(collection(firestore, "Arhiva"), personDataWithDates);
      alert("Cererea a fost adaugata la arhiva !");

      await deleteDoc(doc(firestore, "externalRequests", form.id));

      setExternalForms(externalForms.filter((f) => f.id !== form.id));
      setForm(null);
      setSelectedForm(null);
      setShow(false);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsSubmitting(false); // Permitir nuevas ejecuciones después de completar
    }
  };

  const handleClose = () => {
    setShow(false);
    setSelectedForm(null);
  };

  const handleFormClick = (form) => {
    setForm(form);
    setSelectedForm(form); // Establece el formulario seleccionado
  };

  return (
    <div>
      <Button
        style={{ marginInline: "10px" }}
        variant="primary"
        onClick={() => setShow(true)}
      >
        {" "}
        CERERI PRIMITE
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
        <ModalBody>
          {selectedForm ? (
            <div className="form-container">
              <h1 className="form-title">CERERE MEMBRU</h1>
              <form className="form-group" onSubmit={handleSubmit}>
                <Card
                  style={{
                    padding: "10px",
                    margin: "15px",
                    backgroundColor: "#ebebeb",
                  }}
                >
                  <Row>
                    <Col xs="6" style={{ maxWidth: "50%" }}>
                      <div className="colum-form">
                        <label>
                          <input
                            type="text"
                            style={{ display: "none" }}
                            name="formularVerificare"
                            value={formularVerificare}
                            onChange={(e) =>
                              setFormularVerificare(e.target.value)
                            }
                          />
                        </label>
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
                      </div>
                    </Col>
                    <Col xs="6">
                      <div style={{}}>
                        <ImageUploader
                          onFileSelectSuccess={(file) => setSelectedFile(file)}
                          onFileSelectError={({ error }) => alert(error)}
                          initialImage={form?.profileImage}
                        />
                      </div>
                    </Col>
                  </Row>

                  <Row>
                    <Col>
                      <label className="label">
                        email
                        <input
                          className="input"
                          type="text"
                          name="email"
                          value={personData.email}
                          onChange={handleChange}
                        />
                      </label>
                      <label className="label">
                        DNI
                        <input
                          className="input"
                          type="text"
                          name="dni"
                          value={personData.dni}
                          onChange={handleChange}
                        />
                      </label>
                      <label className="label">
                        Nune anterior :
                        <input
                          className="input"
                          type="text"
                          name="maidenName"
                          value={personData.maidenName}
                          onChange={handleChange}
                        />
                      </label>
                    </Col>
                    <Col>
                      <label className="label">
                        Locul nasterii
                        <input
                          className="input"
                          type="text"
                          name="birthPlace"
                          value={personData.birthPlace}
                          onChange={handleChange}
                        />
                      </label>
                      <label className="label">
                        Studii absolvite:
                        <input
                          className="input"
                          type="text"
                          name="studies"
                          value={personData.studies}
                          onChange={handleChange}
                        />
                      </label>
                      <label className="label">
                        Profesia actuala:
                        <input
                          className="input"
                          type="text"
                          name="profession"
                          value={personData.profession}
                          onChange={handleChange}
                        />
                      </label>
                    </Col>
                  </Row>
                </Card>

                <Card
                  style={{
                    padding: "10px",
                    margin: "15px",
                    backgroundColor: "#dfdfdf",
                  }}
                >
                  <div style={{ textAlign: "center", margin: "10px" }}>
                    <h5
                      style={{
                        textTransform: "uppercase",
                        textDecoration: "underLine",
                      }}
                    >
                      DATE FAMILIE
                    </h5>
                  </div>
                  <Row>
                    <Col>
                      <label className="label">
                        TATA{"  "}
                        <div className="name-box">
                          <input
                            placeholder="nume"
                            className="input"
                            type="text"
                            name="father.lastName"
                            value={personData.father.lastName}
                            onChange={handleChange}
                          />
                          <input
                            placeholder="prenume"
                            className="input"
                            type="text"
                            name="father.firstName"
                            value={personData.father.firstName}
                            onChange={handleChange}
                          />
                        </div>
                      </label>
                    </Col>
                    <Col>
                      <label className="label">
                        MAMA{" "}
                        <div className="name-box">
                          <input
                            placeholder="nume"
                            className="input"
                            type="text"
                            name="mother.lastName"
                            value={personData.mother.lastName}
                            onChange={handleChange}
                          />
                          <input
                            placeholder="prenume"
                            className="input"
                            type="text"
                            name="mother.firstName"
                            value={personData.mother.firstName}
                            onChange={handleChange}
                          />
                        </div>
                      </label>
                    </Col>
                  </Row>
                  <Card
                    style={{ marginBottom: "10px", backgroundColor: "#dfdfdf" }}
                  >
                    <Row>
                      <Col>
                        <InputGroup
                          size="sm"
                          className="mb-1"
                          style={{ marginTop: "10px" }}
                        >
                          <InputGroup.Text id="inputGroup-sizing-sm">
                            CASATORIT/A{" "}
                          </InputGroup.Text>
                          <RadioGroup
                            style={{
                              display: "flex",
                              flexDirection: "row",
                              paddingLeft: "5px",
                            }}
                            name="maritalStatus"
                            value={maritalStatus}
                            onChange={(e) => setMaritalStatus(e.target.value)}
                          >
                            <FormControlLabel
                              value="y"
                              label="DA"
                              control={<Radio />}
                            />
                            <FormControlLabel
                              value="n"
                              label="Nu"
                              control={<Radio />}
                            />
                            <FormControlLabel
                              value="o"
                              label="Alt Caz"
                              control={<Radio />}
                            />
                          </RadioGroup>
                        </InputGroup>
                      </Col>
                      <Col style={{ maxWidth: "55%" }}>
                        <div style={{ display: "flex", marginTop: "10px" }}>
                          <InputGroup.Text id="inputGroup-sizing-sm">
                            Alt caz{" "}
                          </InputGroup.Text>
                          <input
                            disabled={maritalStatus !== "o"}
                            placeholder="...specificati cazul"
                            className="input"
                            type="text"
                            name="familyDetails"
                            value={personData.familyDetails}
                            onChange={handleChange}
                          />
                        </div>
                      </Col>
                    </Row>

                    <Row>
                      <Col>
                        <label className="label">
                          SOT/SOTIE{" "}
                          <div className="name-box">
                            <input
                              disabled={maritalStatus !== "y"}
                              placeholder="nume"
                              className="input"
                              type="text"
                              name="spouse.lastName"
                              value={personData.spouse.lastName}
                              onChange={handleChange}
                            />
                            <input
                              disabled={maritalStatus !== "y"}
                              placeholder="prenume"
                              className="input"
                              type="text"
                              name="spouse.firstName"
                              value={personData.spouse.firstName}
                              onChange={handleChange}
                            />
                          </div>
                        </label>
                      </Col>
                      <div style={{ display: "flex", width: "50%" }}>
                        <Col>
                          <label>
                            Data casatoriei civile:
                            <DatePicker
                              disabled={maritalStatus !== "y"}
                              selected={civilWeddingDate}
                              onChange={(date) => setCivilWeddingDate(date)}
                              peekNextMonth
                              showMonthDropdown
                              showYearDropdown
                              dropdownMode="select"
                              dateFormat="dd/MM/yyyy"
                              className="short-input"
                            />
                          </label>
                        </Col>
                        <Col>
                          <label>
                            Data serv. Religios:
                            <DatePicker
                              disabled={maritalStatus !== "y"}
                              selected={religiousWeddingDate}
                              onChange={(date) => setReligiousWeddingDate(date)}
                              peekNextMonth
                              showMonthDropdown
                              showYearDropdown
                              dropdownMode="select"
                              dateFormat="dd/MM/yyyy"
                              className="short-input"
                            />
                          </label>
                        </Col>
                      </div>
                    </Row>
                    <Row>
                      <Col>
                        <div>
                          <label>
                            COPII:{" "}
                            {`(Copiii botezati, trebuie sa completeze cereri de membru separate de ale parintilor)`}
                          </label>

                          <Button
                            onClick={addChild}
                            disabled={childrens.length >= 15}
                          >
                            Adauga copil
                          </Button>
                          {childrens.map((child, index) => (
                            <Row
                              key={index}
                              style={{
                                display: "flex",
                                flexWrap: "wrap",
                                marginTop: "10px",
                              }}
                            >
                              <Col style={{ minWidth: "50%" }}>
                                <div className="name-box">
                                  <input
                                    placeholder="nume"
                                    className="input"
                                    type="text"
                                    value={child.lastName}
                                    onChange={(e) =>
                                      handleChildChange(
                                        index,
                                        "lastName",
                                        e.target.value
                                      )
                                    }
                                  />
                                  <input
                                    placeholder="prenume"
                                    className="input"
                                    type="text"
                                    value={child.firstName}
                                    onChange={(e) =>
                                      handleChildChange(
                                        index,
                                        "firstName",
                                        e.target.value
                                      )
                                    }
                                  />
                                </div>
                              </Col>
                              <Col style={{ maxWidth: "20%" }}>
                                <RadioGroup
                                  style={{
                                    display: "flex",
                                    flexDirection: "row",
                                    minWidth: "140px",
                                  }}
                                  value={child.sex}
                                  onChange={(e) =>
                                    handleChildChange(
                                      index,
                                      "sex",
                                      e.target.value
                                    )
                                  }
                                >
                                  <FormControlLabel
                                    value="M"
                                    label="M"
                                    control={<Radio />}
                                  />
                                  <FormControlLabel
                                    value="F"
                                    label="F"
                                    control={<Radio />}
                                  />
                                </RadioGroup>
                              </Col>
                              <Col style={{ maxWidth: "25%" }}>
                                <label>
                                  <DatePicker
                                    placeholderText="Data nasterii"
                                    selected={child.birthDate}
                                    onChange={(date) =>
                                      handleChildChange(
                                        index,
                                        "birthDate",
                                        date
                                      )
                                    }
                                    peekNextMonth
                                    showMonthDropdown
                                    showYearDropdown
                                    dropdownMode="select"
                                    dateFormat="dd/MM/yyyy"
                                    className="short-input"
                                  />
                                </label>
                              </Col>
                            </Row>
                          ))}
                        </div>
                      </Col>
                    </Row>
                  </Card>
                </Card>

                <label>
                  <Card
                    style={{
                      margin: "15px",
                      backgroundColor: "#dfdfdf",
                    }}
                  >
                    <div style={{ textAlign: "center", margin: "10px" }}>
                      <h5
                        style={{
                          textTransform: "uppercase",
                          textDecoration: "underLine",
                        }}
                      >
                        Experiența creștină anterioară
                      </h5>
                    </div>

                    <Row>
                      <Col>
                        <div style={{ display: "flex", margin: "5px" }}>
                          <InputGroup.Text id="inputGroup-sizing-sm">
                            Născut/ă intr-o famile de credință:
                          </InputGroup.Text>
                          <input
                            placeholder="...penticostală, baptistă, ortodoxă, etc."
                            className="input"
                            type="text"
                            name="familyFaith"
                            value={personData.familyFaith}
                            onChange={handleChange}
                          />
                        </div>
                      </Col>
                    </Row>
                    <Row>
                      <Col>
                        <div style={{ display: "flex", margin: "5px" }}>
                          <InputGroup.Text id="inputGroup-sizing-sm">
                            Dus la Binecuvantare:
                          </InputGroup.Text>
                          <RadioGroup
                            style={{
                              display: "flex",
                              flexDirection: "row",
                              flexWrap: "nowrap",
                              paddingLeft: 14,
                            }}
                            name="use-radio-group"
                            value={blessed}
                            onChange={(e) => {
                              setBlessed(e.target.value);
                            }}
                          >
                            <FormControlLabel
                              style={{ display: "flex" }}
                              value="y"
                              label="DA"
                              control={<Radio />}
                            />
                            <FormControlLabel
                              style={{ display: "flex", marginLeft: "10px" }}
                              value="n"
                              label="Nu"
                              control={<Radio />}
                            />
                          </RadioGroup>
                        </div>
                      </Col>
                    </Row>
                    <Row>
                      <Col>
                        <div
                          style={{
                            display: "flex",
                            margin: "5px",
                            maxWidth: "400px",
                          }}
                        >
                          <InputGroup.Text id="inputGroup-sizing-sm">
                            Botezat/ă în apă la data:
                          </InputGroup.Text>
                          <DatePicker
                            placeholderText="Data botezului"
                            selected={baptiseDate}
                            onChange={(date) => setBaptiseDate(date)}
                            peekNextMonth
                            showMonthDropdown
                            showYearDropdown
                            dropdownMode="select"
                            dateFormat="dd/MM/yyyy"
                            // className="short-input"
                          />
                        </div>
                      </Col>

                      <Col>
                        <div style={{ display: "flex", margin: "5px" }}>
                          <InputGroup.Text id="inputGroup-sizing-sm">
                            în Biserica:
                          </InputGroup.Text>
                          <input
                            placeholder="Biserica și localitatea"
                            className="input"
                            type="text"
                            name="baptisePlace"
                            value={personData.baptisePlace}
                            onChange={handleChange}
                          />
                        </div>
                      </Col>
                    </Row>
                    <Row>
                      <Col>
                        <div style={{ display: "flex", margin: "5px" }}>
                          <InputGroup.Text id="inputGroup-sizing-sm">
                            Botezat în apă de Pastorul:
                          </InputGroup.Text>
                          <input
                            placeholder=""
                            className="input"
                            type="text"
                            name="baptisedBy"
                            value={personData.baptisedBy}
                            onChange={handleChange}
                          />
                        </div>
                      </Col>
                    </Row>
                    <Row>
                      <Col>
                        <div style={{ display: "flex", margin: "5px" }}>
                          <InputGroup.Text id="inputGroup-sizing-sm">
                            Botezat cu Duhul Sfânt:
                          </InputGroup.Text>
                          <RadioGroup
                            style={{
                              display: "flex",
                              flexDirection: "row",
                              flexWrap: "nowrap",
                              paddingLeft: 14,
                            }}
                            name="use-radio-group"
                            value={hsBaptised}
                            onChange={(e) => {
                              setHsBaptised(e.target.value);
                            }}
                          >
                            <FormControlLabel
                              style={{ display: "flex" }}
                              value="y"
                              label="DA"
                              control={<Radio />}
                            />
                            <DatePicker
                              disabled={hsBaptised != "y"}
                              placeholderText="data Botezului"
                              selected={hsBaptiseDate}
                              onChange={(date) => setHsBaptisedDate(date)}
                              peekNextMonth
                              showMonthDropdown
                              showYearDropdown
                              dropdownMode="select"
                              dateFormat="dd/MM/yyyy"
                              // className="short-input"
                            />
                            <input
                              disabled={hsBaptised != "y"}
                              placeholder="Locul botezului "
                              className="input"
                              type="text"
                              name="hsBaptisePlace"
                              value={personData.hsBaptisePlace}
                              onChange={handleChange}
                            />
                            <FormControlLabel
                              style={{ display: "flex", marginLeft: "10px" }}
                              value="n"
                              label="Nu"
                              control={<Radio />}
                            />
                          </RadioGroup>
                        </div>
                      </Col>
                    </Row>
                    <Row>
                      <Col>
                        <div style={{ display: "flex", margin: "5px" }}>
                          <InputGroup.Text id="inputGroup-sizing-sm">
                            Am fost membru/ă în Biserica:
                          </InputGroup.Text>
                          <input
                            placeholder=" Biserica și localitatea"
                            className="input"
                            type="text"
                            name="originChurch"
                            value={personData.originChurch}
                            onChange={handleChange}
                          />
                        </div>
                      </Col>
                      <Col style={{ maxWidth: "35%" }}>
                        <div style={{ display: "flex", margin: "5px" }}>
                          <InputGroup.Text id="inputGroup-sizing-sm">
                            în perioada:
                          </InputGroup.Text>
                          <input
                            placeholder=""
                            className="input"
                            type="text"
                            name="originChurchPeriod"
                            value={personData.originChurchPeriod}
                            onChange={handleChange}
                          />
                        </div>
                      </Col>
                    </Row>
                    <Row>
                      <Col>
                        <div style={{ display: "flex", margin: "5px" }}>
                          <InputGroup.Text id="inputGroup-sizing-sm">
                            Am slujit în Biserica ca și:
                          </InputGroup.Text>
                          <input
                            placeholder=""
                            className="input"
                            type="text"
                            name="details"
                            value={personData.details}
                            onChange={handleChange}
                          />
                        </div>
                      </Col>
                    </Row>
                    <Row>
                      <Col>
                        <div style={{ display: "flex", margin: "5px" }}>
                          <InputGroup.Text id="inputGroup-sizing-sm">
                            Anexez scrisoarea de recomandare{" "}
                            {`(adeverință,nota de transfer)`}
                          </InputGroup.Text>
                          <input
                            placeholder=""
                            className="input"
                            type="text"
                            name="transferNumber"
                            value={personData.transferNumber}
                            onChange={handleChange}
                          />
                        </div>
                      </Col>
                    </Row>
                  </Card>
                </label>

                <Card>
                  <Row></Row>
                </Card>
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
                  ACCEPTAT
                </button>
                <button className="cancel-btn" onClick={(e) => handleRefuse(e)}>
                  REFUZAT / CERERE ARHIVATA
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
        </ModalBody>

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

export default ExternalRequestReview;
