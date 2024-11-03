import React, { useState, useRef, useEffect } from "react";
import { useParams } from "react-router-dom";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import InputGroup from "react-bootstrap/InputGroup";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import {
  useGetMemberQuery,
  useGetMembersQuery,
  useModifyMemberMutation,
} from "../../services/members";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Radio from "@mui/material/Radio";
import DatePicker from "react-datepicker";
import ImageUploader from "../../components/ImageUploader/ImageUploader";
import AddTransferModal from "../Persoane/AddTransferModal";

import "./Persoana.css";
import AddPerson from "../Persoane/AddPerson";
import { Typeahead } from "react-bootstrap-typeahead";
import { firestore } from "../../firebase-config";
import { query } from "firebase/database";
import { collection, getDocs } from "firebase/firestore";

const General = ({ dataUpdated, data, persoane, isModified }) => {
  const { id } = useParams();
  const [showTransferModal, setShowTransferModal] = useState(false);

  const [selectedFile, setSelectedFile] = useState(null);
  const [profileImage, setProfileImage] = useState(null);

  const [nume, setNume] = useState("");
  const [prenume, setPrenume] = useState("");
  const [anterior, setAnterior] = useState("");
  const [adresa, setAdresa] = useState("");
  const [telefon, setTelefon] = useState("");
  const [email, setEmail] = useState("");
  const [sex, setSex] = useState(null);
  // const [father, setFather] = useState("");
  // const [mother, setMother] = useState("");
  const [placeOfBirth, setPlaceOfBirth] = useState("");
  const [enterBirthDate, setEnterBirthDate] = useState(null);
  const [membruData, setMembruData] = useState(null);
  const [detalii, setDetalii] = useState("");
  const [previouslyUpdatedData, setPreviouslyUpdatedData] = useState(null);

  const isInitialLoad = useRef(true); // Flag para controlar la carga inicial
  const [isDataLoaded, setIsDataLoaded] = useState(false); // Nuevo estado para verificar si los datos han sido cargados

  // --------- SETEZ PROPRIETATILE DUPA "data" PRIMITE DIN "Persoana" -> din Firestore -----//
  useEffect(() => {
    if (data && data[0] && isInitialLoad.current) {
      setNume(data[0].firstName || "");
      setPrenume(data[0].lastName || "");
      setAnterior(data[0].maidenName || "");
      setAdresa(data[0].address || "");
      setTelefon(data[0].mobilePhone || "");
      setEmail(data[0].email || "");
      setSex(data[0].sex === true ? "M" : data[0].sex === false ? "F" : null);
      setEnterBirthDate(data[0].birthDate ? data[0].birthDate.toDate() : null);
      setPlaceOfBirth(data[0].placeOfBirth || "");
      setMembruData(data[0].memberDate ? data[0].memberDate.toDate() : null);
      setDetalii(data[0].details || "");
      setSelectedFile(data[0].profileImage || null);
      setProfileImage(data[0].profileImage || null);
      isInitialLoad.current = false; // Marca el fin de la carga inicial
      setIsDataLoaded(true); // Marca que los datos han sido cargados
    }
  }, [data]);

  // --------- TRIMIT NOILE SETARI LA "PERSOANA" PT SALVARE IN BAZA DE DATE ------------ //

  useEffect(() => {
    if (!isInitialLoad.current && nume && prenume) {
      const updatedData = {
        firstName: nume,
        lastName: prenume,
        maidenName: anterior,
        address: adresa,
        mobilePhone: telefon,
        email: email,
        sex: sex === "M" ? true : sex === "F" ? false : null,
        birthDate: enterBirthDate,
        placeOfBirth: placeOfBirth,
        memberDate: membruData,
        details: detalii,
        profileImage: selectedFile,
      };

      // Comprobar si los datos son diferentes antes de actualizar
      if (
        JSON.stringify(updatedData) !== JSON.stringify(previouslyUpdatedData)
      ) {
        dataUpdated(updatedData);
        setPreviouslyUpdatedData(updatedData); // Actualiza el estado
      }
    }
  }, [
    nume,
    prenume,
    anterior,
    adresa,
    telefon,
    email,
    sex,
    placeOfBirth,
    enterBirthDate,
    detalii,
    selectedFile,
    membruData,
  ]);

  // ------------------ ADD TRANSFER  --------------- //

  const addTransfer = (newData) => {
    dataUpdated(newData);
    setMembruData(newData.memberDate || "");
  };

  return (
    <Container>
      <Row style={{ marginLeft: "20px" }}>
        <Col>
          <Row>
            <Col>
              <InputGroup size="sm" className="mb-3">
                <InputGroup.Text id="inputGroup-sizing-sm">
                  Nume
                </InputGroup.Text>
                <Form.Control
                  aria-label="Small"
                  aria-describedby="inputGroup-sizing-sm"
                  onChange={(event) => setPrenume(event.target.value)}
                  value={prenume}
                />
              </InputGroup>
            </Col>
            <Col>
              <InputGroup size="sm" className="mb-3">
                <InputGroup.Text id="inputGroup-sizing-sm">
                  Prenume
                </InputGroup.Text>
                <Form.Control
                  aria-label="Small"
                  aria-describedby="inputGroup-sizing-sm"
                  value={nume}
                  onChange={(event) => setNume(event.target.value)}
                />
              </InputGroup>
            </Col>
          </Row>
          <InputGroup size="sm" className="mb-3">
            <InputGroup.Text id="inputGroup-sizing-sm">
              Nume anterior
            </InputGroup.Text>
            <Form.Control
              aria-label="Small"
              aria-describedby="inputGroup-sizing-sm"
              value={anterior}
              onChange={(event) => setAnterior(event.target.value)}
            />
          </InputGroup>
          <InputGroup size="sm" className="mb-3">
            <InputGroup.Text id="inputGroup-sizing-sm">Adresa</InputGroup.Text>
            <Form.Control
              aria-label="Small"
              aria-describedby="inputGroup-sizing-sm"
              value={adresa}
              onChange={(event) => setAdresa(event.target.value)}
            />
          </InputGroup>
          <Row>
            <Col>
              <InputGroup size="sm" className="mb-3">
                <InputGroup.Text id="inputGroup-sizing-sm">
                  Telefon
                </InputGroup.Text>
                <Form.Control
                  aria-label="Small"
                  aria-describedby="inputGroup-sizing-sm"
                  onChange={(event) => setTelefon(event.target.value)}
                  value={telefon}
                />
              </InputGroup>
            </Col>
            <Col>
              <InputGroup size="sm" className="mb-3">
                <InputGroup.Text id="inputGroup-sizing-sm">
                  email
                </InputGroup.Text>
                <Form.Control
                  aria-label="Small"
                  aria-describedby="inputGroup-sizing-sm"
                  onChange={(event) => setEmail(event.target.value)}
                  value={email}
                />
              </InputGroup>
            </Col>
          </Row>

          <Row>
            <Col>
              <InputGroup
                size="sm"
                className="mb-3"
                style={{ display: "flex", flexWrap: "nowrap" }}
              >
                <InputGroup.Text>Data nasterii</InputGroup.Text>
                <DatePicker
                  selected={enterBirthDate}
                  onChange={(date) => setEnterBirthDate(date)}
                  peekNextMonth
                  maxDate={new Date()}
                  showMonthDropdown
                  showYearDropdown
                  dropdownMode="select"
                  dateFormat="dd/MM/yyyy"
                />
              </InputGroup>
            </Col>
            <Col>
              <InputGroup size="sm" className="mb-3">
                <InputGroup.Text id="inputGroup-sizing-sm">
                  Locul nasterii
                </InputGroup.Text>
                <Form.Control
                  aria-label="Small"
                  aria-describedby="inputGroup-sizing-sm"
                  value={placeOfBirth}
                  onChange={(event) => setPlaceOfBirth(event.target.value)}
                />
              </InputGroup>
            </Col>
          </Row>
          <InputGroup size="sm" className="mb-3">
            <InputGroup.Text id="inputGroup-sizing-sm">GEN: </InputGroup.Text>
            <RadioGroup
              style={{ display: "flex", flexDirection: "row", paddingLeft: 14 }}
              name="use-radio-group"
              value={sex}
              onChange={(e) => {
                console.log("valoare", e);
                setSex(e.target.value);
              }}
            >
              <FormControlLabel
                value="M"
                label="Masculin"
                control={<Radio />}
              />
              <FormControlLabel value="F" label="Feminin" control={<Radio />} />
            </RadioGroup>
          </InputGroup>

          <Row>
            <Col>
              {membruData && (
                <InputGroup
                  size="sm"
                  className="mb-3"
                  style={{ display: "flex", flexWrap: "nowrap" }}
                >
                  <InputGroup.Text>Membru începând cu data </InputGroup.Text>
                  <DatePicker
                    selected={membruData}
                    onChange={(date) => setMembruData(date)}
                    peekNextMonth
                    showMonthDropdown
                    showYearDropdown
                    disabled
                    dropdownMode="select"
                    dateFormat="dd/MM/yyyy"
                  />
                </InputGroup>
              )}
            </Col>
            <Col>
              <Button
                variant="danger"
                type="button"
                onClick={() => setShowTransferModal(true)}
              >
                Transfer
              </Button>
            </Col>
          </Row>
        </Col>
        <Col>
          <ImageUploader
            onFileSelectSuccess={(file) => setSelectedFile(file)}
            onFileSelectError={({ error }) => alert(error)}
            initialImage={profileImage}
            id={id}
          />
        </Col>
      </Row>
      <AddTransferModal
        persoane={persoane}
        isDisabled
        onAddTransfer={addTransfer}
        show={showTransferModal}
        onClose={() => setShowTransferModal(false)}
        transferredPerson={data[1]}
      />
    </Container>
  );
};

export default General;
