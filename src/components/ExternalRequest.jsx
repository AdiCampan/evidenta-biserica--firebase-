import React, { useState, useEffect } from "react";
import { firestore } from "../firebase-config";
import { collection, addDoc } from "firebase/firestore"; // No más Timestamp
import DatePicker from "react-datepicker"; // Importamos el DatePicker
import "react-datepicker/dist/react-datepicker.css";
import "./ExternalForm.scss";
import ImageUploader from "../components/ImageUploader/ImageUploader";
import { Button, Card, Col, Form, InputGroup, Row } from "react-bootstrap";
import {
  Checkbox,
  FormControlLabel,
  Input,
  Radio,
  RadioGroup,
} from "@mui/material";
import { useParams } from "react-router";

const ExternalRequest = ({ onCloseModal }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [show, setShow] = useState(false);
  const [isAgreed, setIsAgreed] = useState(false); // Estado para la casilla de verificación

  // Estado para las fechas como objetos Date
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
  console.log("selectedFile", selectedFile);

  useEffect(() => {
    setStartTime(Date.now());
  }, []);

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
      profileImage: selectedFile,
      birthDate: birthDate,
      baptiseDate: baptiseDate,
      civilWeddingDate: civilWeddingDate,
      religiousWeddingDate: religiousWeddingDate,
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
      hsBaptiseDate: hsBaptiseDate,
    }));
  }, [
    selectedFile,
    birthDate,
    baptiseDate,
    childrens,
    blessed,
    hsBaptised,
    hsBaptiseDate,
    maritalStatus,
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

  console.log(personData);

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log("Validando selectedFile antes de enviar:", selectedFile);
    if (!selectedFile || !selectedFile.startsWith("http")) {
      alert("Por favor, cargue una imagen válida antes de enviar.");
      return;
    }

    const endTime = Date.now();
    const timeTaken = (endTime - startTime) / 1000; // Tiempo en segundos

    if (timeTaken < 10) {
      // Si toma menos de 10 segundos
      alert("Por favor, tómese su tiempo para llenar el formulario.");
      return;
    }
    // verifica daca este un bot
    if (formularVerificare !== "") {
      alert("Formulario detectado como spam.");
      return;
    }

    // Validar si el usuario ha aceptado los términos
    if (!isAgreed) {
      alert(
        "Debes aceptar el tratamiento de los datos personales para continuar."
      );
      return;
    }

    setShow(false);
    onCloseModal();

    try {
      // Crear un objeto con las fechas directamente como Date
      const personDataWithDates = {
        ...personData,
        birthDate: birthDate ? birthDate : null,
        baptiseDate: baptiseDate ? baptiseDate : null,
        hsBaptiseDate: hsBaptiseDate ? hsBaptiseDate : null,
        civilWeddingDate: civilWeddingDate ? civilWeddingDate : null,
        religiousWeddingDate: religiousWeddingDate
          ? religiousWeddingDate
          : null,
      };

      // Guardar en Firestore
      await addDoc(
        collection(firestore, "externalRequests"),
        personDataWithDates
      );
      alert("Formulario enviado con éxito!");
    } catch (err) {
      console.error("Error al enviar el formulario: ", err);
    }
  };

  // Agregar un nuevo niño al presionar el botón
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

  return (
    <div className="form-container">
      <h1 className="form-title">FIȘA CERERE MEMBRU</h1>
      <Form className="form-group" onSubmit={handleSubmit}>
        <Card
          style={{
            padding: "5px",
            margin: "5px",
            backgroundColor: "#ebebeb",
          }}
        >
          <Row className="colums">
            {/* <Col xs="6" style={{ maxWidth: "50%" }}> */}
            <div className="colum-form">
              <label>
                <input
                  type="text"
                  style={{ display: "none" }}
                  name="formularVerificare"
                  value={formularVerificare}
                  onChange={(e) => setFormularVerificare(e.target.value)}
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
            {/* </Col> */}
            {/* <Col xs="6"> */}
            <div className="colum-form">
              <ImageUploader
                // uploadPath={`externalRequests/${personData.lastName}_${personData.firstName}`}
                onFileSelectSuccess={(file) => setSelectedFile(file)}
                onFileSelectError={(error) => {
                  alert("No se pudo cargar la imagen. Inténtalo nuevamente.");
                }}
                id={`${personData.lastName}_${personData.firstName}`}
                // initialImage={personData?.profileImage}
              />
            </div>
            {/* </Col> */}
          </Row>
          <Row className="colums">
            {/* <Col> */}
            <div className="colum-form">
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
            </div>

            {/* </Col> */}
            {/* <Col> */}
            <div className="colum-form">
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
            </div>
            {/* </Col> */}
          </Row>
        </Card>

        <Card
          style={{
            padding: "5px",
            margin: "5px",
            backgroundColor: "#ebebeb",
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
          <Row className="colums">
            <Col>
              <div className="colum-form">
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
              </div>
            </Col>
            <Col>
              <div className="colum-form">
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
              </div>
            </Col>
          </Row>
          <Card style={{ marginBottom: "10px", backgroundColor: "#dfdfdf" }}>
            <Row className="colums">
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
              <Col style={{ marginBottom: "20px" }}>
                <div className="colum-form">
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
                </div>
              </Col>
            </Row>

            <Row className="colums">
              <div className="colum-form">
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
              </div>

              <div className="colum-form">
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
              </div>
            </Row>
            <Row className="colums">
              <Col>
                <div>
                  <label>
                    COPII:{" "}
                    {`(Copiii botezati, trebuie sa completeze cereri de membru separate de ale parintilor)`}
                  </label>

                  <Button onClick={addChild} disabled={childrens.length >= 15}>
                    Adauga copil
                  </Button>
                  {childrens.map((child, index) => (
                    <Row
                      className="colums"
                      key={index}
                      // style={{
                      //   display: "flex",
                      //   flexWrap: "wrap",
                      //   marginTop: "10px",
                      // }}
                    >
                      <Col className="colum-form" style={{ minWidth: "50%" }}>
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
                      <Col>
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "row",
                            // minWidth: "140px",
                          }}
                        >
                          <label>
                            <RadioGroup
                              style={{
                                display: "flex",
                                flexDirection: "row",
                                // minWidth: "140px",
                              }}
                              value={child.sex}
                              onChange={(e) =>
                                handleChildChange(index, "sex", e.target.value)
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
                          </label>
                          <div>
                            <DatePicker
                              placeholderText="Data nasterii"
                              selected={child.birthDate}
                              onChange={(date) =>
                                handleChildChange(index, "birthDate", date)
                              }
                              peekNextMonth
                              showMonthDropdown
                              showYearDropdown
                              dropdownMode="select"
                              dateFormat="dd/MM/yyyy"
                              className="short-input"
                            />
                          </div>
                        </div>
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
              padding: "5px",
              margin: "5px",
              backgroundColor: "#ebebeb",
            }}
          >
            <div style={{ textAlign: "center", margin: "20px" }}>
              <h5
                style={{
                  textTransform: "uppercase",
                  textDecoration: "underLine",
                }}
              >
                Experiența creștină anterioară
              </h5>
            </div>
            <Card
              style={{
                padding: "5px",
                marginBottom: "25px",
                backgroundColor: "#dfdfdf",
              }}
            >
              <Row className="colums">
                <div className="colum-form">
                  <InputGroup.Text id="inputGroup-sizing-sm">
                    Născut/ă intr-o famile de credință:
                  </InputGroup.Text>
                </div>
                <div className="colum-form">
                  <input
                    placeholder="...penticostală, baptistă, ortodoxă, etc."
                    className="input"
                    type="text"
                    name="familyFaith"
                    value={personData.familyFaith}
                    onChange={handleChange}
                  />
                </div>
              </Row>
            </Card>

            <Row className="colums">
              <div className="colum-form" style={{ display: "flex" }}>
                <InputGroup.Text id="inputGroup-sizing-sm">
                  Dus la Binecuvantare:
                </InputGroup.Text>
                <RadioGroup
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    flexWrap: "nowrap",
                    paddingLeft: 12,
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
                    style={{ display: "flex", marginLeft: "5px" }}
                    value="n"
                    label="Nu"
                    control={<Radio />}
                  />
                </RadioGroup>
              </div>
            </Row>
            <Row className="colums" style={{ marginBlock: "10px" }}>
              <Col className="colum">
                <div
                  className="colum-form"
                  style={{
                    display: "flex",

                    maxWidth: "400px",
                  }}
                >
                  <InputGroup.Text id="inputGroup-sizing-sm">
                    Botezat/ă în apă la data:
                  </InputGroup.Text>
                  <DatePicker
                    required
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
              <Col className="colum">
                <div className="colum-form" style={{ display: "flex" }}>
                  <InputGroup.Text id="inputGroup-sizing-sm">
                    în Biserica:
                  </InputGroup.Text>
                  <input
                    required
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
            <Row className="colums">
              <Col>
                <div style={{ display: "flex", marginBlock: "5px" }}>
                  <InputGroup.Text id="inputGroup-sizing-sm">
                    Botezat în apă de Pastorul:
                  </InputGroup.Text>
                  <input
                    required
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
            <Card
              style={{
                padding: "5px",
                marginBlock: "10px",
                backgroundColor: "#dfdfdf",
              }}
            >
              <Row className="colums">
                <Col className="colum-form">
                  <div style={{ display: "flex", marginBlock: "5px" }}>
                    <InputGroup.Text id="inputGroup-sizing-sm">
                      Botezat cu Duhul Sfânt:
                    </InputGroup.Text>
                    <RadioGroup
                      style={{
                        display: "flex",
                        flexDirection: "row",
                        flexWrap: "nowrap",
                        paddingLeft: 4,
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

                      <FormControlLabel
                        style={{ display: "flex" }}
                        value="n"
                        label="Nu"
                        control={<Radio />}
                      />
                    </RadioGroup>
                  </div>
                </Col>
                <Col className="colum-form">
                  <div>
                    <DatePicker
                      disabled={hsBaptised != "y"}
                      placeholderText="data Botezului cu Duh Sfant"
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
                      placeholder="Locul botezului cu Duh Sfant"
                      className="input"
                      type="text"
                      name="hsBaptisePlace"
                      value={personData.hsBaptisePlace}
                      onChange={handleChange}
                    />
                  </div>
                </Col>
              </Row>
            </Card>

            <Card
              style={{
                padding: "5px",
                marginBlock: "10px",
                backgroundColor: "#dfdfdf",
              }}
            >
              <Row className="colums">
                <Col>
                  <div style={{ display: "flex", marginTop: "5px" }}>
                    <InputGroup.Text id="inputGroup-sizing-sm">
                      Am fost membru/ă în Biserica:
                    </InputGroup.Text>
                  </div>
                </Col>
                <Col>
                  <input
                    placeholder=" Biserica și localitatea"
                    className="input"
                    type="text"
                    name="originChurch"
                    value={personData.originChurch}
                    onChange={handleChange}
                  />
                </Col>

                <Col>
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
            </Card>

            <Row className="colums">
              <Col>
                <div style={{ display: "flex", margin: "5px" }}>
                  <InputGroup.Text id="inputGroup-sizing-sm">
                    Am slujit în Biserica ca și:
                  </InputGroup.Text>
                </div>
              </Col>
              <Col>
                <input
                  placeholder=""
                  className="input"
                  type="text"
                  name="details"
                  value={personData.details}
                  onChange={handleChange}
                />
              </Col>
            </Row>
            <Row className="colums">
              <Col>
                <div style={{ display: "flex", margin: "5px" }}>
                  <InputGroup.Text
                    id="inputGroup-sizing-sm"
                    style={{
                      whiteSpace: "normal",
                      wordBreak: "break-word",
                      // textAlign: "center",
                      maxWidth: "100%",
                    }}
                  >
                    Anexez scrisoarea de recomandare{" "}
                    {`(adeverință,nota de transfer)`}
                  </InputGroup.Text>
                </div>
              </Col>
              <Col>
                <input
                  placeholder=""
                  className="input"
                  type="text"
                  name="transferNumber"
                  value={personData.transferNumber}
                  onChange={handleChange}
                />
              </Col>
            </Row>
          </Card>
        </label>

        <textarea
          id="comments"
          name="observations" // Asegúrate de usar el nombre correcto
          rows="4"
          placeholder="Escribe tus comentarios aquí..."
          value={personData.observations} // Vinculamos el valor al estado
          onChange={(e) =>
            setPersonData({ ...personData, observations: e.target.value })
          } // Actualizamos el estado cuando el usuario escribe
        ></textarea>

        {/* Texto sobre la Ley Orgánica 3/2018 */}
        <div className="data-protection-info">
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
          Enviar
        </button>
        <button className="cancel-btn" onClick={() => onCloseModal()}>
          Cancel
        </button>
      </Form>
    </div>
  );
};

export default ExternalRequest;
