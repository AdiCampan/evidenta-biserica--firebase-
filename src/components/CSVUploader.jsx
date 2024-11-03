import React, { useEffect, useState } from "react";
import Papa from "papaparse";
import { setDoc, doc } from "firebase/firestore";
import { firestore } from "../firebase-config";
import "./CSVuploader.scss";
import { Timestamp } from "../firebase-config";
import { Modal, ModalBody, Button } from "react-bootstrap";

const CSVUploader = ({ persoane }) => {
  const [transfers, setTransfers] = useState([]);
  const [specialCases, setSpecialCases] = useState([]);
  const [newSpecialCases, setNewSpecialCases] = useState([]);
  const [newTransfers, setNewTransfers] = useState([]);
  const [persons, setPersons] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [blessedBy, setBlessedBy] = useState([]);
  const [baptisedByHS, setBaptisedByHS] = useState([]);
  const [baptisedBy, setBaptisedBy] = useState([]);
  const [members, setMembers] = useState([]);
  const [mergedPersons, setMergedPersons] = useState([]);
  const [transformedPersons, setTransformedPersons] = useState([]);
  const [weddings, setWeddings] = useState([]);
  const [shortPersons, setShortPersons] = useState([]);
  const [shortTransfers, setShortTransfers] = useState([]);
  const [show, setShow] = useState(false);
  const [showUploader, setShowUploader] = useState(false);

  const handleClose = () => setShow(false);

  const handleCSV = (event, setter) => {
    const file = event.target.files[0];

    Papa.parse(file, {
      header: true,
      delimiter: ";",
      complete: (results) => {
        setter(results.data);
      },
      encoding: "UTF-8",
      dynamicTyping: true, // Para convertir los valores automáticamente
      skipEmptyLines: true, // Asegúrate de que esto solo salte líneas completamente vacías
    });
  };

  const normalizeValue = (value) => {
    if (value === null || value === "NULL" || value === "") {
      return null;
    }
    return value;
  };

  // Función para combinar los datos de los diferentes arrays
  const mergeData = () => {
    const combined = persons.map((person) => {
      const matchingAddress = addresses.find(
        (addr) => addr.AddressID === normalizeValue(person.AddressID)
      );
      const matchingBlessing = blessedBy.find(
        (bless) => bless.PersonID === normalizeValue(person.PersonID)
      );
      const matchingBaptism = baptisedBy.find(
        (bap) => bap.PersonID === normalizeValue(person.PersonID)
      );
      const matchingBaptismHS = baptisedByHS.find(
        (hs) => hs.PersonID === normalizeValue(person.PersonID)
      );
      const matchingMember = members.find(
        (mem) => mem.PersonID === normalizeValue(person.PersonID)
      );

      return {
        ...person,
        address: matchingAddress
          ? normalizeValue(matchingAddress.Address)
          : null,
        blessingDate: matchingBlessing
          ? normalizeValue(matchingBlessing.BlessingDate)
          : null,
        blessingPlace: matchingBlessing
          ? normalizeValue(matchingBlessing.BlessingChurch)
          : null,
        baptisedBy: matchingBaptism
          ? normalizeValue(matchingBaptism.BaptismServant)
          : null,
        baptisePlace: matchingBaptism
          ? normalizeValue(matchingBaptism.BaptismChurch)
          : null,
        baptiseDate: matchingBaptism
          ? normalizeValue(matchingBaptism.BaptismDate)
          : null,
        hsBaptiseDate: matchingBaptismHS
          ? normalizeValue(matchingBaptismHS.HolySpiritBaptismDate)
          : null,
        hsBaptisePlace: matchingBaptismHS
          ? normalizeValue(matchingBaptismHS.HolySpiritBaptismAddress)
          : null,
        memberDate: matchingMember
          ? normalizeValue(matchingMember.BecomeDate)
          : null,
        leaveDate: matchingMember
          ? normalizeValue(matchingMember.RetireDate)
          : null,
        observations: matchingMember
          ? normalizeValue(matchingMember.Details)
          : "",
        sex: person.Sex === 1 ? true : person.Sex === 0 ? false : null,
      };
    });
    setMergedPersons(combined);
    return combined;
  };

  //RELATIONS//

  if (mergedPersons.length > 0) {
    const updateRelations = (transformedPersons, weddings) => {
      // Crear un diccionario para buscar personas rápidamente usando PersonID
      const personsById = transformedPersons.reduce((acc, person) => {
        acc[person.PersonID] = person; // Usar PersonID
        return acc;
      }, {});

      // 1. Añadir relaciones de matrimonios (wife, husband) usando el array 'weddings'
      weddings.forEach((wedding) => {
        const {
          HusbandID,
          WifeID,
          CivilServiceDate,
          ReligiousServiceDate,
          WeddingChurch,
        } = wedding;

        // Encontrar al marido y a la esposa en el array 'transformedPersons'
        const husband = personsById[HusbandID]; // Usar HusbandID y WifeID
        const wife = personsById[WifeID];

        // Si ambos existen, actualizar sus relaciones
        if (husband && wife) {
          const hasRelation = (relations, type, relatedPersonId) =>
            relations.some(
              (rel) => rel.type === type && rel.person === relatedPersonId
            );

          // Añadir esposa a las relaciones del marido
          husband.relations = husband.relations || [];
          if (!hasRelation(husband.relations, "wife", String(wife.PersonID))) {
            husband.relations.push({
              civilWeddingDate:
                CivilServiceDate !== "NULL"
                  ? Timestamp.fromDate(new Date(CivilServiceDate.trim()))
                  : null,
              religiousWeddingDate:
                ReligiousServiceDate !== "NULL"
                  ? Timestamp.fromDate(new Date(ReligiousServiceDate.trim()))
                  : null,
              weddingChurch: WeddingChurch !== "NULL" ? WeddingChurch : null,
              type: "wife",
              person: String(wife.PersonID), // Usar PersonID como string
            });
          }

          // Añadir marido a las relaciones de la esposa
          wife.relations = wife.relations || [];
          if (
            !hasRelation(wife.relations, "husband", String(husband.PersonID))
          ) {
            wife.relations.push({
              civilWeddingDate:
                CivilServiceDate !== "NULL"
                  ? Timestamp.fromDate(new Date(CivilServiceDate.trim()))
                  : null,
              religiousWeddingDate:
                ReligiousServiceDate !== "NULL"
                  ? Timestamp.fromDate(new Date(ReligiousServiceDate.trim()))
                  : null,
              weddingChurch: WeddingChurch !== "NULL" ? WeddingChurch : null,
              type: "husband",
              person: String(husband.PersonID), // Usar PersonID como string
            });
          }
        }
      });

      // 2. Añadir relaciones padre-hijo/madre-hijo basadas en 'FatherID' y 'MotherID'
      transformedPersons.forEach((person) => {
        const { PersonID, FatherID, MotherID } = person;

        // Relación con el padre
        if (FatherID && FatherID !== "NULL" && personsById[FatherID]) {
          const father = personsById[FatherID];
          father.relations = father.relations || [];
          if (
            !father.relations.some(
              (rel) => rel.type === "child" && rel.person === String(PersonID)
            )
          ) {
            father.relations.push({
              type: "child",
              person: String(PersonID), // Usar PersonID como string
            });
          }

          person.relations = person.relations || [];
          if (
            !person.relations.some(
              (rel) => rel.type === "father" && rel.person === String(FatherID)
            )
          ) {
            person.relations.push({
              type: "father",
              person: String(FatherID), // Usar FatherID como string
            });
          }
        }

        // Relación con la madre
        if (MotherID && MotherID !== "NULL" && personsById[MotherID]) {
          const mother = personsById[MotherID];
          mother.relations = mother.relations || [];
          if (
            !mother.relations.some(
              (rel) => rel.type === "child" && rel.person === String(PersonID)
            )
          ) {
            mother.relations.push({
              type: "child",
              person: String(PersonID), // Usar PersonID como string
            });
          }

          person.relations = person.relations || [];
          if (
            !person.relations.some(
              (rel) => rel.type === "mother" && rel.person === String(MotherID)
            )
          ) {
            person.relations.push({
              type: "mother",
              person: String(MotherID), // Usar MotherID como string
            });
          }
        }
      });

      // console.log("relations", transformedPersons);
      return transformedPersons;
    };

    // Supongamos que 'transformedPersons' y 'weddings' están disponibles:
    const transformedPersonsUpdated = updateRelations(mergedPersons, weddings);

    // Mostrar el array actualizado en la consola
    console.log(
      "Personas con relaciones actualizadas:",
      transformedPersonsUpdated
    );
  }
  const uploadTransfersToFirestore = async () => {
    if (transfers.length > 0) {
      const modifiedTransfers = transfers.map((row) => ({
        id: row.TransferID ? String(row.TransferID) : null,
        churchTransfer: row.TransferredToChurchName
          ? row.TransferredToChurchName.trim()
          : null,
        date: row.TransferDate
          ? Timestamp.fromDate(new Date(row.TransferDate.trim()))
          : null,
        docNumber: row.TransferAct ? row.TransferAct : null,
        details: row.TransferDetails ? row.TransferDetails.trim() : null,
        owner: row.PersonID ? String(row.PersonID) : null,
        type: "transferTo",
      }));

      setNewTransfers(modifiedTransfers);

      // Usar un bucle for...of para asegurarse de que todas las operaciones se completen
      for (const transfer of modifiedTransfers) {
        try {
          await setDoc(doc(firestore, "transfers", transfer.id), transfer);
        } catch (error) {
          console.error(
            `Error al subir el transfer con id ${transfer.id}:`,
            error
          );
        }
      }

      alert("Todos los transfers han sido subidos correctamente.");
    }
  };
  const uploadSpecialsCasesToFirestore = async () => {
    if (specialCases.length > 0) {
      const modifiedSpecialCases = specialCases
        .map((row) => {
          const isValidDate = (dateString) =>
            dateString && !isNaN(new Date(dateString.trim()));

          return {
            id:
              row.SpecialCaseID && row.SpecialCaseID !== ""
                ? String(row.SpecialCaseID)
                : null,
            details:
              row.SpecialCaseDetails && row.SpecialCaseDetails.trim() !== ""
                ? row.SpecialCaseDetails
                : null,
            startDate: isValidDate(row.SpecialCaseDate)
              ? Timestamp.fromDate(new Date(row.SpecialCaseDate.trim()))
              : null,
            endDate: isValidDate(row.SolvedDate)
              ? Timestamp.fromDate(new Date(row.SolvedDate.trim()))
              : null,
            person:
              row.PersonID && row.PersonID !== "" ? String(row.PersonID) : null,
          };
        })
        .filter((caseItem) => caseItem.id);

      if (modifiedSpecialCases.length > 0) {
        for (const caz of modifiedSpecialCases) {
          try {
            await setDoc(doc(firestore, "specialCases", caz.id), caz);
          } catch (error) {
            console.error(
              `Error al subir el caso especial con id ${caz.id}:`,
              error
            );
          }
        }

        alert("Todos los casos especiales han sido subidos correctamente.");
      } else {
        alert("No hay casos especiales válidos para subir a Firestore.");
      }
    } else {
      alert("El array `specialCases` está vacío.");
    }
  };

  // useEffect(() => {
  //   if (mergedPersons.length > 0) {
  //     setShortPersons(mergedPersons.slice(0, 200));
  //   }
  // }, [mergedPersons]);

  const isValidDate = (dateString) => {
    return dateString && !isNaN(new Date(dateString.trim()));
  };

  // Función para convertir una fecha a Timestamp
  const convertToTimestamp = (dateString) => {
    if (isValidDate(dateString)) {
      const date = new Date(dateString.trim());
      return Timestamp.fromDate(date);
    }
    return null;
  };

  const uploadPersonsToFirestore = async () => {
    if (mergedPersons.length > 0) {
      const modifiedPersons = mergedPersons.map((person) => ({
        firstName: normalizeValue(person.FirstName),
        lastName: normalizeValue(person.LastName),
        address: normalizeValue(person.address),
        birthDate: person.BirthDate
          ? convertToTimestamp(person.BirthDate)
          : null,
        maidenName: normalizeValue(person.MaidenName),
        churchID: person.ChurchID, // No es necesario convertir ChurchID a string, a menos que así lo necesites
        churchName: normalizeValue(person.ChurchName),
        deathDate: person.DeathDate
          ? convertToTimestamp(person.DeathDate)
          : null,
        details: normalizeValue(person.Details),
        fatherID: person.FatherID ? String(person.FatherID) : null, // Convertir FatherID a string
        motherID: person.MotherID ? String(person.MotherID) : null, // Convertir MotherID a string
        placeOfBirth: normalizeValue(person.PlaceOfBirth),
        mobilePhone: normalizeValue(person.MobilePhone),
        sex: person.Sex === 1 ? true : person.Sex === 0 ? false : null,
        id: String(person.PersonID), // Convertir PersonID a string
        blessingDate: person.blessingDate
          ? convertToTimestamp(person.blessingDate)
          : null,
        blessingPlace: normalizeValue(person.blessingPlace),
        baptisedBy: normalizeValue(person.baptisedBy),
        baptisePlace: normalizeValue(person.baptisePlace),
        baptiseDate: person.baptiseDate
          ? convertToTimestamp(person.baptiseDate)
          : null,
        hsBaptiseDate: person.hsBaptiseDate
          ? convertToTimestamp(person.hsBaptiseDate)
          : null,
        hsBaptisePlace: normalizeValue(person.hsBaptisePlace),
        memberDate: person.memberDate
          ? convertToTimestamp(person.memberDate)
          : null,
        leaveDate: person.leaveDate
          ? convertToTimestamp(person.leaveDate)
          : null,
        observations: normalizeValue(person.observations),
        email: "", // Asegúrate de que el email no sea undefined
        profileImage: normalizeValue(person.Photo) || null, // Aseguramos que no sea undefined
        relations: person.relations || [], // Relaciones ya vienen formateadas correctamente
      }));

      for (const person of modifiedPersons) {
        const docId = String(person.id); // Asegurarse de que `id` es un string
        try {
          await setDoc(doc(firestore, "persoane", docId), person);
        } catch (error) {
          console.error(`Error subiendo persona con ID ${docId}:`, error);
        }
      }
    }
  };

  const uploadBackups = () => {
    setShow(true);
  };

  const handleCloseForm = () => {
    setShow(false);
  };

  return (
    <>
      <Button onClick={uploadBackups}>UPLOAD BACKUP</Button>
      <Modal
        className="custom-modal" // Aplica estilos al dialog
        centered
        style={{ width: "100%", justifyContent: "center" }}
        show={show}
        onHide={handleCloseForm}
      >
        <Modal.Header closeButton>
          <Modal.Title>UPDATE DIN Evidenta Biserica </Modal.Title>
        </Modal.Header>
        <ModalBody>
          <div className="csv-main">
            <div className="CSVcontainer">
              <h5>Subir 'persoane' CSV</h5>
              <input
                className="imputCSV"
                type="file"
                accept=".csv"
                onChange={(e) => handleCSV(e, setPersons)}
              />
            </div>
            <div className="CSVcontainer">
              <h6>Subir 'adrese' CSV</h6>
              <input
                className="imputCSV"
                type="file"
                accept=".csv"
                onChange={(e) => handleCSV(e, setAddresses)}
              />
            </div>
            <div className="CSVcontainer">
              <h6>Subir 'Binecuvantat de:' CSV</h6>
              <input
                className="imputCSV"
                type="file"
                accept=".csv"
                onChange={(e) => handleCSV(e, setBlessedBy)}
              />
            </div>
            <div className="CSVcontainer">
              <h6>Subir 'botezat cu DS ' CSV</h6>
              <input
                className="imputCSV"
                type="file"
                accept=".csv"
                onChange={(e) => handleCSV(e, setBaptisedByHS)}
              />
            </div>
            <div className="CSVcontainer">
              <h6>Subir 'botezat de:' CSV</h6>
              <input
                className="imputCSV"
                type="file"
                accept=".csv"
                onChange={(e) => handleCSV(e, setBaptisedBy)}
              />
            </div>
            <div className="CSVcontainer">
              <h6>Subir 'members' CSV</h6>
              <input
                className="imputCSV"
                type="file"
                accept=".csv"
                onChange={(e) => handleCSV(e, setMembers)}
              />
            </div>
            <div className="CSVcontainer">
              <h6>Subir 'CASATORII' CSV</h6>
              <input
                className="imputCSV"
                type="file"
                accept=".csv"
                onChange={(e) => handleCSV(e, setWeddings)}
              />
            </div>
            <div className="CSVcontainer">
              <h6>Subir 'TRANSFERURI' CSV</h6>
              <input
                className="imputCSV"
                type="file"
                accept=".csv"
                onChange={(e) => handleCSV(e, setTransfers)}
              />
              <button className="imputCSV" onClick={uploadTransfersToFirestore}>
                Update Firestore
              </button>
            </div>
            <div className="CSVcontainer">
              <h6 className="imputCSV">Subir 'Special Cases' CSV</h6>
              <input
                className="imputCSV"
                type="file"
                accept=".csv"
                onChange={(e) => handleCSV(e, setSpecialCases)}
              />
              <button onClick={uploadSpecialsCasesToFirestore}>
                Subir SpecialCases to Firestore
              </button>
            </div>

            {/* Botón para combinar datos */}
            <button onClick={mergeData}>Combinar Datos</button>

            {/* Botón para subir los datos combinados a Firestore */}
            <button onClick={uploadPersonsToFirestore}>
              Subir PERSOANE a Firestore
            </button>
          </div>
        </ModalBody>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Cerrar
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default CSVUploader;
