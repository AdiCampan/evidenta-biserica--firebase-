import React, { useState, useRef, useEffect } from "react";
import { useParams } from "react-router-dom";
import Form from "react-bootstrap/Form";
import InputGroup from "react-bootstrap/InputGroup";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import DatePicker from "react-datepicker";
import "./Persoana.css";

const Biserica = ({ data, dataUpdated }) => {
  const { id } = useParams();
  const [blessingDate, setBlessingDate] = useState(null);
  const [blessingPlace, setBlessingPLace] = useState("");
  const [baptiseDate, setBaptiseDate] = useState(null);
  const [baptisePlace, setBaptisePlace] = useState("");
  const [baptisedBy, setBaptisedBy] = useState("");
  const [dsBotezDate, setDsBotezDate] = useState(null);
  const [dsBotezPlace, setDsBotezPlace] = useState("");
  const [detalii, setDetalii] = useState("");

  useEffect(() => {
    const updatedInfo = {
      blessingDate: blessingDate,
      blessingPlace: blessingPlace,
      baptiseDate: baptiseDate,
      baptisePlace: baptisePlace,
      hsBaptiseDate: dsBotezDate,
      baptisedBy: baptisedBy,
      hsBaptisePlace: dsBotezPlace,
      details: detalii,
    };
    if (
      baptiseDate &&
      (baptisePlace.toLowerCase() === "eben ezer" ||
        baptisePlace.toLowerCase() === "eben-ezer")
    ) {
      updatedInfo.memberDate = baptiseDate;
    }

    dataUpdated(updatedInfo);
  }, [
    blessingDate,
    blessingPlace,
    baptiseDate,
    baptisePlace,
    baptisedBy,
    dsBotezDate,
    dsBotezPlace,
    detalii,
  ]);
  // actualizeaza datele la save, de ex
  useEffect(() => {
    setBlessingDate(data[0].blessingDate ? data[0].blessingDate.toDate() : "");
    setBlessingPLace(data[0].blessingPlace || "");
    setBaptiseDate(data[0].baptiseDate ? data[0].baptiseDate.toDate() : "");
    setBaptisePlace(data[0].baptisePlace || "");
    setDsBotezDate(data[0].hsBaptiseDate ? data[0].hsBaptiseDate.toDate() : "");
    setBaptisedBy(data[0].baptisedBy || "");
    setDsBotezPlace(data[0].hsBaptisePlace || "");
    setDetalii(data[0].details || "");
  }, [data]);

  return (
    <Row style={{ width: "100%" }}>
      <div style={{ marginLeft: "20px" }}>
        <Col>
          <Row>
            <Col>
              <InputGroup
                size="sm"
                className="mb-3"
                style={{ display: "flex", flexWrap: "nowrap" }}
              >
                <InputGroup.Text id="inputGroup-sizing-sm">
                  Data Binecuvântării
                </InputGroup.Text>
                <DatePicker
                  selected={blessingDate}
                  onChange={(date) => setBlessingDate(date)}
                  peekNextMonth
                  showMonthDropdown
                  showYearDropdown
                  dropdownMode="select"
                  dateFormat="dd/MM/yyyy"
                />
              </InputGroup>
            </Col>
            <Col>
              <InputGroup
                size="sm"
                className="mb-3"
                style={{ display: "flex", flexWrap: "nowrap" }}
              >
                <InputGroup.Text id="inputGroup-sizing-sm">
                  Locul Binecuvântării
                </InputGroup.Text>
                <Form.Control
                  aria-label="Small"
                  aria-describedby="inputGroup-sizing-sm"
                  value={blessingPlace}
                  onChange={(event) => setBlessingPLace(event.target.value)}
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
                <InputGroup.Text id="inputGroup-sizing-sm">
                  Data Botezului in apa
                </InputGroup.Text>
                <DatePicker
                  selected={baptiseDate}
                  onChange={(date) => setBaptiseDate(date)}
                  peekNextMonth
                  showMonthDropdown
                  showYearDropdown
                  dropdownMode="select"
                  dateFormat="dd/MM/yyyy"
                />
              </InputGroup>
            </Col>
            <Col>
              <InputGroup
                size="sm"
                className="mb-3"
                style={{ display: "flex", flexWrap: "nowrap" }}
              >
                <InputGroup.Text id="inputGroup-sizing-sm">
                  Locul botezului in apa
                </InputGroup.Text>
                <Form.Control
                  aria-label="Small"
                  aria-describedby="inputGroup-sizing-sm"
                  value={baptisePlace}
                  onChange={(event) => setBaptisePlace(event.target.value)}
                />
              </InputGroup>
            </Col>
          </Row>
          <InputGroup size="sm" className="mb-3">
            <InputGroup.Text id="inputGroup-sizing-sm">
              Botez efectuat de :
            </InputGroup.Text>
            <Form.Control
              aria-label="Small"
              aria-describedby="inputGroup-sizing-sm"
              value={baptisedBy}
              onChange={(e) => setBaptisedBy(e.target.value)}
            />
          </InputGroup>
          <Row>
            <Col>
              <InputGroup
                size="sm"
                className="mb-3"
                style={{ display: "flex", flexWrap: "nowrap" }}
              >
                <InputGroup.Text id="inputGroup-sizing-sm">
                  Botezat cu Duh Sfânt
                </InputGroup.Text>
                <DatePicker
                  selected={dsBotezDate}
                  onChange={(date) => setDsBotezDate(date)}
                  peekNextMonth
                  showMonthDropdown
                  showYearDropdown
                  dropdownMode="select"
                  dateFormat="dd/MM/yyyy"
                />
              </InputGroup>
            </Col>
            <Col>
              <InputGroup
                size="sm"
                className="mb-3"
                style={{ display: "flex", flexWrap: "nowrap" }}
              >
                <InputGroup.Text id="inputGroup-sizing-sm">
                  Locul botezului cu Duh Sfant
                </InputGroup.Text>
                <Form.Control
                  aria-label="Small"
                  aria-describedby="inputGroup-sizing-sm"
                  value={dsBotezPlace}
                  onChange={(event) => setDsBotezPlace(event.target.value)}
                />
              </InputGroup>
            </Col>
          </Row>
          <InputGroup size="sm" className="mb-3">
            <InputGroup.Text id="inputGroup-sizing-sm">
              DETALII <br />
              Observatii
            </InputGroup.Text>
            <Form.Control
              aria-label="Small"
              aria-describedby="inputGroup-sizing-sm"
              value={detalii}
              onChange={(event) => setDetalii(event.target.value)}
            />
          </InputGroup>
        </Col>
      </div>
    </Row>
  );
};

export default Biserica;
