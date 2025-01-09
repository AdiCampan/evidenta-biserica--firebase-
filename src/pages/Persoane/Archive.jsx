import { collection, deleteDoc, doc, getDocs } from "firebase/firestore";
import { useEffect, useState } from "react";
import { firestore } from "../../firebase-config";
import { FaTrash } from "react-icons/fa";
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
import DatePicker from "react-datepicker"; // Importamos el DatePicker
import ImageUploader from "../../components/ImageUploader/ImageUploader";

function Archive() {
  const [archivesList, setArchivesList] = useState([]);
  const [form, setForm] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedArchive, setSelectedArchive] = useState(null);
  const [show, setShow] = useState(false);
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
    father: { firstName: "", lastName: "" },
    familyFaith: "",
    familyDetails: "",
    hsBaptisePlace: "",
    lastName: "",
    maidenName: "",
    mobilePhone: "",
    mother: { firstName: "", lastName: "" },
    observations: "",
    originChurch: "",
    originChurchPeriod: "",
    profileImage: selectedFile,
    profession: "",
    sex: "",
    studies: "",
    spouse: { firstName: "", lastName: "" },
    transferNumber: "",
  });

  // Convertir un timestamp de Firestore a un objeto Date
  const timestampToDate = (timestamp) => {
    if (timestamp && timestamp.seconds) {
      return new Date(timestamp.seconds * 1000); // Convertir el timestamp a objeto Date
    }
    return null; // Devuelve null si no es válido
  };

  // Obtener los archivos de externalForms
  useEffect(() => {
    const fetchArchives = async () => {
      const archivesSnapshot = await getDocs(collection(firestore, "Arhiva"));
      const archivesList = archivesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setArchivesList(archivesList);
    };

    fetchArchives();
  }, []);

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
        sex: form.sex === true ? "M" : form.sex === false ? "F" : "",
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    // const endTime = Date.now();
    // const timeTaken = (endTime - startTime) / 1000; // Tiempo en segundos

    // if (timeTaken < 10) {
    //   // Si toma menos de 10 segundos
    //   alert("Por favor, tómese su tiempo para llenar el formulario.");
    //   return;
    // }
    // // verifica daca este un bot
    // if (formularVerificare !== "") {
    //   alert("Formulario detectado como spam.");
    //   return;
    // }
    // try {
    //   // Crear un objeto con las fechas directamente como Date
    //   const personDataWithDates = {
    //     ...personData,
    //     sex:
    //       personData.sex === "M" ? true : personData.sex === "F" ? false : null,
    //     churchName: "EBEN - EZER",
    //     birthDate: birthDate ? birthDate : null,
    //     baptiseDate: baptiseDate ? baptiseDate : null,
    //     hsBaptiseDate: hsBaptiseDate ? hsBaptiseDate : null,
    //     civilWeddingDate: civilWeddingDate ? civilWeddingDate : null,
    //     religiousWeddingDate: religiousWeddingDate
    //       ? religiousWeddingDate
    //       : null,
    //     // id: crypto.randomUUID(),
    //   };
    //   //Add new person//
    //   await addDoc(collection(firestore, "persoane"), personDataWithDates);

    //   // Guardar en archiva Firestore
    //   await addDoc(collection(firestore, "Arhiva"), personDataWithDates);
    //   alert("Persoana a fost adaugata cu succes !");
    // } catch (err) {
    //   console.error("Error al enviar el formulario: ", err);
    // }
  };

  const handleFormClick = (form) => {
    setShow(true);
    setForm(form);

    setSelectedArchive(form); // Establece el formulario seleccionado
  };
  const handleClose = () => {
    setShow(false);
    setSelectedArchive(null);
  };

  const deleteForm = async (formId) => {
    await deleteDoc(doc(firestore, "Arhiva", formId));
    setArchivesList(archivesList.filter((f) => f.id !== formId)); // Eliminar formulario sincronizado de la lista
    setForm(null); // Limpiar el formulario actual
  };

  console.log("archives", archivesList);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "center" }}>
        <h3>CERERI PRIMITE</h3>
      </div>

      <div style={{ marginInline: "20px" }}>
        {archivesList.map((form) => (
          <li
            key={form.id}
            onClick={() => handleFormClick(form)}
            className="form-item-archive"
            style={{
              backgroundColor:
                form.churchName === "EBEN - EZER"
                  ? "#baf2c7"
                  : form.churchName === ""
                  ? "#f4e0e6"
                  : "coral",
            }}
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
      </div>
      <Modal show={show} onHide={handleClose} className="custom-modal">
        <Modal.Header closeButton className="modal-header">
          <Modal.Title className="modal-title">
            {selectedArchive
              ? `${selectedArchive.firstName} ${selectedArchive.lastName}`
              : "FORMULARE PRIMITE"}
          </Modal.Title>
        </Modal.Header>
        <ModalBody>
          {selectedArchive && (
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
                        {/* <label>
                          <input
                            type="text"
                            style={{ display: "none" }}
                            name="formularVerificare"
                            value={formularVerificare}
                            onChange={(e) =>
                              setFormularVerificare(e.target.value)
                            }
                          />
                        </label> */}
                        <label className="label">
                          Nume {`(obligatoriu)`}:
                          <input
                            defaultValue={personData.lastName}
                            required
                            className="input"
                            type="text"
                            name="lastName"
                            // value={personData.lastName}
                            // onChange={handleChange}
                          />
                        </label>
                        <label className="label">
                          Prenume {`(obligatoriu)`}:
                          <input
                            defaultValue={personData.firstName}
                            required
                            className="input"
                            type="text"
                            name="firstName"
                            // value={personData.firstName}
                            // onChange={handleChange}
                          />
                        </label>

                        <label className="label">
                          Gen {`(obligatoriu)`}:
                          <select
                            readOnly
                            // defaultValue={personData.sex}
                            required
                            className="select"
                            name="sex"
                            value={personData.sex}
                            // onChange={handleChange}
                          >
                            <option value="">Selectioneaza</option>
                            <option value="M">Masculin</option>
                            <option value="F">Femenin</option>
                          </select>
                        </label>
                        <label className="label">
                          Data nasterii {`(obligatoriu)`}:
                          <DatePicker
                            readOnly
                            selected={birthDate}
                            // onChange={(date) => setBirthDate(date)}
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
                            defaultValue={personData.address}
                            required
                            className="input"
                            type="text"
                            name="address"
                            // value={personData.address}
                            // onChange={handleChange}
                          />
                        </label>
                        <label className="label">
                          Telefon {`(obligatoriu)`}:
                          <input
                            defaultValue={personData.mobilePhone}
                            required
                            className="input"
                            type="text"
                            name="mobilePhone"
                            // value={personData.mobilePhone}
                            // onChange={handleChange}
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
                          defaultValue={personData.email}
                          className="input"
                          type="text"
                          name="email"
                          // value={personData.email}
                          // onChange={handleChange}
                        />
                      </label>
                      <label className="label">
                        DNI
                        <input
                          defaultValue={personData.dni}
                          className="input"
                          type="text"
                          name="dni"
                          // value={personData.dni}
                          // onChange={handleChange}
                        />
                      </label>
                      <label className="label">
                        Nune anterior :
                        <input
                          defaultValue={personData.maidenName}
                          className="input"
                          type="text"
                          name="maidenName"
                          // value={personData.maidenName}
                          // onChange={handleChange}
                        />
                      </label>
                    </Col>
                    <Col>
                      <label className="label">
                        Locul nasterii
                        <input
                          defaultValue={personData.birthPlace}
                          className="input"
                          type="text"
                          name="birthPlace"
                          // value={personData.birthPlace}
                          // onChange={handleChange}
                        />
                      </label>
                      <label className="label">
                        Studii absolvite:
                        <input
                          defaultValue={personData.studies}
                          className="input"
                          type="text"
                          name="studies"
                          // value={personData.studies}
                          // onChange={handleChange}
                        />
                      </label>
                      <label className="label">
                        Profesia actuala:
                        <input
                          defaultValue={personData.profession}
                          className="input"
                          type="text"
                          name="profession"
                          // value={personData.profession}
                          // onChange={handleChange}
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
                            defaultValue={personData.father.firstName}
                            placeholder="nume"
                            className="input"
                            type="text"
                            name="father.firstName"
                            // value={personData.father.firstName}
                            // onChange={handleChange}
                          />
                          <input
                            defaultValue={personData.father.lastName}
                            placeholder="prenume"
                            className="input"
                            type="text"
                            name="father.lastName"
                            // value={personData.father.lastName}
                            // onChange={handleChange}
                          />
                        </div>
                      </label>
                    </Col>
                    <Col>
                      <label className="label">
                        MAMA{" "}
                        <div className="name-box">
                          <input
                            defaultValue={personData.mother.firstName}
                            placeholder="nume"
                            className="input"
                            type="text"
                            name="mother.firstName"
                            // value={personData.mother.firstName}
                            // onChange={handleChange}
                          />
                          <input
                            defaultValue={personData.mother.lastName}
                            placeholder="prenume"
                            className="input"
                            type="text"
                            name="mother.lastName"
                            // value={personData.mother.lastName}
                            // onChange={handleChange}
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
                            // defaultValue={maritalStatus}
                            name="maritalStatus"
                            value={maritalStatus}
                            // onChange={(e) => setMaritalStatus(e.target.value)}
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
                            defaultValue={personData.familyDetails}
                            disabled={maritalStatus !== "o"}
                            placeholder="...specificati cazul"
                            className="input"
                            type="text"
                            name="familyDetails"
                            // value={personData.familyDetails}
                            // onChange={handleChange}
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
                              defaultValue={personData.spouse.firstName}
                              disabled={maritalStatus !== "y"}
                              placeholder="nume"
                              className="input"
                              type="text"
                              name="spouse.firstName"
                              // value={personData.spouse.firstName}
                              // onChange={handleChange}
                            />
                            <input
                              defaultValue={personData.spouse.lastName}
                              disabled={maritalStatus !== "y"}
                              placeholder="prenume"
                              className="input"
                              type="text"
                              name="spouse.lastName"
                              // value={personData.spouse.lastName}
                              // onChange={handleChange}
                            />
                          </div>
                        </label>
                      </Col>
                      <div style={{ display: "flex", width: "50%" }}>
                        <Col>
                          <label>
                            Data casatoriei civile:
                            <DatePicker
                              readOnly
                              disabled={maritalStatus !== "y"}
                              selected={civilWeddingDate}
                              // onChange={(date) => setCivilWeddingDate(date)}
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
                              readOnly
                              disabled={maritalStatus !== "y"}
                              selected={religiousWeddingDate}
                              // onChange={(date) => setReligiousWeddingDate(date)}
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

                          {/* <Button
                            onClick={addChild}
                            disabled={childrens.length >= 15}
                          >
                            Adauga copil
                          </Button> */}
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
                                    defaultValue={child.firstName}
                                    placeholder="nume"
                                    className="input"
                                    type="text"
                                    // value={child.firstName}
                                    // onChange={(e) =>
                                    //   handleChildChange(
                                    //     index,
                                    //     "firstName",
                                    //     e.target.value
                                    //   )
                                    // }
                                  />
                                  <input
                                    defaultValue={child.lastName}
                                    placeholder="prenume"
                                    className="input"
                                    type="text"
                                    // value={child.lastName}
                                    // onChange={(e) =>
                                    //   handleChildChange(
                                    //     index,
                                    //     "lastName",
                                    //     e.target.value
                                    //   )
                                    // }
                                  />
                                </div>
                              </Col>
                              <Col style={{ maxWidth: "20%" }}>
                                <RadioGroup
                                  // defaultValue={child.sex}
                                  style={{
                                    display: "flex",
                                    flexDirection: "row",
                                    minWidth: "140px",
                                  }}
                                  value={child.sex}
                                  // onChange={(e) =>
                                  //   handleChildChange(
                                  //     index,
                                  //     "sex",
                                  //     e.target.value
                                  //   )
                                  // }
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
                                    // onChange={(date) =>
                                    //   handleChildChange(
                                    //     index,
                                    //     "birthDate",
                                    //     date
                                    //   )
                                    // }
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
                            defaultValue={personData.familyFaith}
                            placeholder="...penticostală, baptistă, ortodoxă, etc."
                            className="input"
                            type="text"
                            name="familyFaith"
                            // value={personData.familyFaith}
                            // onChange={handleChange}
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
                            // defaultValue={blessed}
                            name="use-radio-group"
                            value={blessed}
                            // onChange={(e) => {
                            //   setBlessed(e.target.value);
                            // }}
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
                            readOnly
                            placeholderText="Data botezului"
                            selected={baptiseDate}
                            // onChange={(date) => setBaptiseDate(date)}
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
                            defaultValue={personData.baptisePlace}
                            placeholder="Biserica și localitatea"
                            className="input"
                            type="text"
                            name="baptisePlace"
                            // value={personData.baptisePlace}
                            // onChange={handleChange}
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
                            defaultValue={personData.baptisedBy}
                            placeholder=""
                            className="input"
                            type="text"
                            name="baptisedBy"
                            // value={personData.baptisedBy}
                            // onChange={handleChange}
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
                            // defaultValue={hsBaptised}
                            style={{
                              display: "flex",
                              flexDirection: "row",
                              flexWrap: "nowrap",
                              paddingLeft: 14,
                            }}
                            name="use-radio-group"
                            value={hsBaptised}
                            //   onChange={(e) => {
                            //     setHsBaptised(e.target.value);
                            //   }}
                          >
                            <FormControlLabel
                              style={{ display: "flex" }}
                              value="y"
                              label="DA"
                              control={<Radio />}
                            />
                            <DatePicker
                              readOnly
                              disabled={hsBaptised != "y"}
                              placeholderText="data Botezului"
                              selected={hsBaptiseDate}
                              // onChange={(date) => setHsBaptisedDate(date)}
                              peekNextMonth
                              showMonthDropdown
                              showYearDropdown
                              dropdownMode="select"
                              dateFormat="dd/MM/yyyy"
                              // className="short-input"
                            />
                            <input
                              defaultValue={personData.hsBaptisePlace}
                              disabled={hsBaptised != "y"}
                              placeholder="Locul botezului "
                              className="input"
                              type="text"
                              name="hsBaptisePlace"
                              // value={personData.hsBaptisePlace}
                              // onChange={handleChange}
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
                            defaultValue={personData.originChurch}
                            placeholder=" Biserica și localitatea"
                            className="input"
                            type="text"
                            name="originChurch"
                            // value={personData.originChurch}
                            // onChange={handleChange}
                          />
                        </div>
                      </Col>
                      <Col style={{ maxWidth: "35%" }}>
                        <div style={{ display: "flex", margin: "5px" }}>
                          <InputGroup.Text id="inputGroup-sizing-sm">
                            în perioada:
                          </InputGroup.Text>
                          <input
                            defaultValue={personData.originChurchPeriod}
                            placeholder=""
                            className="input"
                            type="text"
                            name="originChurchPeriod"
                            // value={personData.originChurchPeriod}
                            // onChange={handleChange}
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
                            defaultValue={personData.details}
                            placeholder=""
                            className="input"
                            type="text"
                            name="details"
                            // value={personData.details}
                            // onChange={handleChange}
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
                            defaultValue={personData.transferNumber}
                            placeholder=""
                            className="input"
                            type="text"
                            name="transferNumber"
                            // value={personData.transferNumber}
                            // onChange={handleChange}
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

                {/* <button className="submit-btn" type="submit">
                  ACCEPTAT
                </button>
                <button className="cancel-btn" onClick={handleClose}>
                  REFUZAT / CERERE ARHIVATA
                </button> */}
              </form>
            </div>
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
}
export default Archive;
