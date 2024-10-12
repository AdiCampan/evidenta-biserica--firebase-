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

const General = ({ dataUpdated, data, persoane }) => {
  const { id } = useParams();
  // const [modifyMember, result] = useModifyMemberMutation();
  const [showTransferModal, setShowTransferModal] = useState(false);
  // const { data: persoane, error, isLoading, isFetching } = useGetMembersQuery();

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
  // const [member, setMember] = useState(false);
  const [membruData, setMembruData] = useState(null);
  const [detalii, setDetalii] = useState("");
  // const [persoane, setPersoane] = useState();
  // const [initialFather, setInitialFather] = useState(null);
  // const [initialMother, setInitialMother] = useState(null);

  // ---------- OBTIN DATELE  PERSOANELOR  (DIN FIRESTORE)  ------------- //
  // const waitingPersons = async () => {
  //   const q = query(collection(firestore, "persoane"));

  //   const querySnapshot = await getDocs(q);
  //   const tmpArray = [];
  //   querySnapshot.forEach((doc) => {
  //     const childKey = doc.id;
  //     const childData = doc.data();
  //     tmpArray.push({ id: childKey, ...childData });
  //     setPersoane(tmpArray);
  //   });
  // };
  // useEffect(() => {
  //   waitingPersons();
  // }, []);

  // --------- TRIMIT NOILE SETARI LA "PERSOANA" PT SALVARE IN BAZA DE DATE ------------ //
  useEffect(() => {
    dataUpdated({
      id: data[1],
      firstName: nume,
      lastName: prenume,
      maidenName: anterior,
      address: adresa,
      mobilePhone: telefon,
      email: email,
      sex: sex === "M" ? true : sex === "F" ? false : null,
      fatherID: "",
      motherID: "",
      birthDate: enterBirthDate,
      placeOfBirth: placeOfBirth,
      memberDate: membruData,
      details: detalii,
      profileImage: selectedFile,
    });
  }, [
    nume,
    prenume,
    anterior,
    adresa,
    telefon,
    email,
    sex,
    // father,
    // mother,
    placeOfBirth,
    enterBirthDate,
    detalii,
    selectedFile,
    membruData,
  ]);

  // --------- SETEZ PROPRIETATILE DUPA "data" PRIMITE DIN "Persoana" -> din Firestore -----//
  useEffect(() => {
    if (data) {
      setNume(data[0].firstName || "");
      setPrenume(data[0].lastName || "");
      setAnterior(data[0].maidenName || "");
      setAdresa(data[0].address || "");
      setTelefon(data[0].mobilePhone || "");
      setEmail(data[0].email || "");
      setSex(data[0].sex === true ? "M" : data[0].sex === false ? "F" : null);
      // setFather(data[0].fatherID || "");
      // setMother(data[0].motherID || "");
      setEnterBirthDate(data[0].birthDate ? data[0].birthDate.toDate() : null);
      setPlaceOfBirth(data[0].placeOfBirth || "");
      setMembruData(data[0].memberDate ? data[0].memberDate.toDate() : null);
      // setMember(!!data[0].memberDate);
      setDetalii(data[0].details || "");
      setSelectedFile(data[0].profileImage || null);
      setProfileImage(data[0].profileImage || null);
    }
  }, []);

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
