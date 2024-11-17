// PrintableDocument.js
import React, { useEffect, useState } from "react";
import { formatDateLong } from "../../utils";
import "./PrintableDocument.css";
import logo from "../../assets/images/logo-round.png";

function PrintableDocument({ data, persons }) {
  const EMPTY_IMAGE = "/src/assets/images/person-placeholder.jpg";

  const [spouse, setSpouse] = useState("");
  const [weddingChurch, setWeddingChurch] = useState("");
  const [servCivil, setServCivil] = useState("");
  const [servRel, setServRel] = useState("");
  const [father, setFather] = useState("");
  const [mother, setMother] = useState("");
  const [childrens, setChildrens] = useState([]);
  const [imagePreview, setImagePreview] = useState(EMPTY_IMAGE); // Vista previa de la imagen

  const hexToBase64 = (hexString) => {
    if (hexString.startsWith("0x")) {
      hexString = hexString.slice(2);
    }
    const hexArray = hexString.match(/.{1,2}/g) || [];
    const byteArray = new Uint8Array(
      hexArray.map((byte) => parseInt(byte, 16))
    );
    const base64String = btoa(String.fromCharCode(...byteArray));
    return `data:image/jpeg;base64,${base64String}`;
  };

  useEffect(() => {
    if (data) {
      // Filtra la relación de pareja (husband o wife)
      const partnerRelation = data[0].relations.find(
        (relation) => relation.type === "husband" || relation.type === "wife"
      );

      // Filtra la iglesia de boda (weddingChurch) y las fechas de boda
      const biserica = data[0].relations.find(
        (relation) => relation.weddingChurch
      )?.weddingChurch;
      const civil = data[0].relations.find(
        (relation) => relation.weddingChurch
      )?.civilWeddingDate;
      const religios = data[0].relations.find(
        (relation) => relation.weddingChurch
      )?.religiousWeddingDate;
      const tata = persons?.find((person) => person.id === data[0].fatherID);
      const mama = persons?.find((person) => person.id === data[0].motherID);
      const copii = data[0].relations.filter(
        (relation) => relation.type === "child"
      );

      // Buscar al cónyuge en la lista de personas usando el ID
      const partner = persons?.find(
        (person) => person.id === partnerRelation?.person
      );

      // Configura el estado de `spouse` y otros datos de la relación
      setSpouse(
        partner
          ? `${partnerRelation.type === "husband" ? "Soț" : "Soție"}: ${
              partner.firstName
            } ${partner.lastName}`
          : ""
      );
      const initialImage = data[0].profileImage;
      if (initialImage && initialImage.startsWith("0x")) {
        const base64Image = hexToBase64(initialImage);
        setImagePreview(base64Image);
      } else {
        setImagePreview(initialImage || EMPTY_IMAGE);
      }

      setWeddingChurch(biserica);
      setServCivil(civil);
      setServRel(religios);
      if (tata) {
        setFather(`${tata.lastName} ${tata.firstName}`);
      }
      if (mama) {
        setMother(`${mama?.lastName} ${mama?.firstName}`);
      }
      setChildrens(copii);
    }
  }, [data, persons]);

  return (
    <div id="printable-content">
      {data && (
        <div className="printable-content">
          <div className="header-box">
            <div className="info-box">
              BISERICA PENTICOSTALA ROMANA "EBEN EZER" Camí de la Donació, 89,
              12004, Castellón de la Plana biserica_ebenezer@yahoo.com | Tel:
              123-456-7890
            </div>
            <div className="logo-box">
              <img src={logo} alt="logo" />
            </div>
          </div>
          <div className="title-box">
            <h2>FISA MEMBRULUI</h2>
          </div>

          <div className="general-box">
            <div className="vertical-text-box">
              <div className="vertical-text">
                <b>DATE GENERALE</b>
              </div>
            </div>
            <div className="box">
              <div className="general-data">
                <span>
                  Nume: <b>{data[0].lastName}</b> Prenume: {"  "}
                  <b>{data[0].firstName}</b>
                </span>
                <p style={{ margin: "5px 0" }}>
                  Nume anterior: {data[0].maidenName}
                </p>
                <p style={{ margin: "5px 0" }}>Adresa: {data[0].address}</p>
                <p style={{ margin: "5px 0" }}>email: {data[0].email}</p>
                <p style={{ margin: "5px 0" }}>
                  Telefon: {data[0].mobilePhone}
                </p>
                <p style={{ margin: "5px 0" }}>
                  Data nasterii: {formatDateLong(data[0].birthDate)}
                </p>
                <p style={{ margin: "5px 0" }}>
                  Locul nasterii: {data[0].placeOfBirth}
                </p>
              </div>
              <div className="image">
                <img
                  className="image-preview"
                  src={imagePreview}
                  alt="Vista previa"
                />
              </div>
            </div>
          </div>
          <div className="general-box">
            <div className="vertical-text-box">
              <div className="vertical-text">
                <b>FAMILIA</b>
              </div>
            </div>
            <div className="box">
              {spouse && (
                <div className="spouse">
                  <p style={{ margin: "5px 0" }}>{spouse}</p>
                  <p style={{ margin: "5px 0" }}>
                    Data serv. civil: {formatDateLong(servCivil)}
                  </p>
                  <p style={{ margin: "5px 0" }}>
                    Data serv rel.: {formatDateLong(servRel)}
                  </p>
                  <p style={{ margin: "5px 0" }}>Biserica: {weddingChurch}</p>
                  <p style={{ margin: "5px 0" }}>Tata: {father}</p>
                  <p style={{ margin: "5px 0" }}>Mama: {mother}</p>
                </div>
              )}

              {childrens && childrens.length > 0 && (
                <div style={{ marginLeft: "100px" }}>
                  <div>Copii:</div>
                  <ul>
                    {childrens.map((children, index) => {
                      const child = persons.find(
                        (person) => person.id === children.person
                      );
                      return (
                        <li key={index}>
                          {child
                            ? `${child.firstName} ${child.lastName}`
                            : "Nombre no encontrado"}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </div>
          </div>

          <div className="general-box">
            <div className="vertical-text-box">
              <div className="vertical-text">
                <b>BISERICA</b>
              </div>
            </div>
            <div className="box">
              <div>
                <p style={{ margin: "5px 0" }}>
                  Membru din : {formatDateLong(data[0].memberDate)}
                </p>
                <p style={{ margin: "5px 0" }}>
                  Data botezului: {formatDateLong(data[0].baptiseDate)}
                </p>
                <p style={{ margin: "5px 0" }}>
                  Locul botezului: {data[0].baptisePlace}
                </p>
                <p style={{ margin: "5px 0" }}>
                  Botezat de: {data[0].baptisedBy}
                </p>
                <p style={{ margin: "5px 0" }}>
                  Data Binecuvantarii: {formatDateLong(data[0].blessingDate)}
                </p>
                <p style={{ margin: "5px 0" }}>
                  Locul Binecuvantarii: {data[0].blessingPlace}
                </p>
                <p style={{ margin: "5px 0" }}>
                  Data botezului cu Duh Sfant :{" "}
                  {formatDateLong(data[0].hsBaptiseDate)}
                </p>
                <p style={{ margin: "5px 0" }}>
                  Locul botezului cu Duh Sfant: {data[0].hsBaptisePlace}
                </p>
              </div>
            </div>
          </div>
          <div className="general-box">
            <div className="vertical-text-box">
              <div className="vertical-text">
                <b>OBS.</b>
              </div>
            </div>
            <div className="box">
              <p>{data[0].observations}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PrintableDocument;
