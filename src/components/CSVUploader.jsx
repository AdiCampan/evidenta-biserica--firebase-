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
  console.log("persons", persons);
  console.log("addresses:", addresses);
  console.log("blessedBy:", blessedBy);
  console.log("baptisedBy:", baptisedBy);
  console.log("baptisedByHS:", baptisedByHS);
  console.log("members:", members);

  // Función para combinar los datos de los diferentes arrays
  const mergeData = () => {
    const combined = persons.map((person) => {
      const matchingAddress = addresses.find(
        (addr) => addr.AddressID === person.AddressID
      );
      const matchingBlessing = blessedBy.find(
        (bless) => bless.PersonID === person.PersonID
      );
      const matchingBaptism = baptisedBy.find(
        (bap) => bap.PersonID === person.PersonID
      );
      const matchingBaptismHS = baptisedByHS.find(
        (hs) => hs.PersonID === person.PersonID
      );
      const matchingMember = members.find(
        (mem) => mem.PersonID === person.PersonID
      );

      return {
        ...person,
        address: matchingAddress ? matchingAddress.Address : null,
        blessingDate: matchingBlessing ? matchingBlessing.BlessingDate : null,
        blessingPlace: matchingBlessing
          ? matchingBlessing.BlessingChurch
          : null,
        baptisedBy: matchingBaptism ? matchingBaptism.BaptismServant : null,
        baptisePlace: matchingBaptism ? matchingBaptism.BaptismChurch : null,
        baptiseDate: matchingBaptism ? matchingBaptism.BaptismDate : null,
        hsBaptiseDate: matchingBaptismHS
          ? matchingBaptismHS.HolySpiritBaptismDate
          : null,
        hsBaptisePlace: matchingBaptismHS
          ? matchingBaptismHS.HolySpiritBaptismAddress
          : null,
        memberDate: matchingMember ? matchingMember.BecomeDate : null,
        leaveDate: matchingMember ? matchingMember.RetireDate : null,
        observations: matchingMember ? matchingMember.Details : "",
      };
    });

    // Guardamos el array combinado en el estado y lo mostramos en consola
    setMergedPersons(combined);
  };

  //RELATIONS//
  if (transformedPersons.length > 0) {
    const updateRelations = (transformedPersons, weddings) => {
      // 0. Transformar el valor del campo `Sex` de 0/1 a `true`/`false`
      transformedPersons.forEach((person) => {
        person.Sex = person.Sex === "1" ? true : false;
      });

      // Crear un diccionario para buscar personas rápidamente
      const personsById = transformedPersons.reduce((acc, person) => {
        acc[person.id] = person;
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
        const husband = personsById[HusbandID];
        const wife = personsById[WifeID];

        // Si ambos existen, actualizar sus relaciones
        if (husband && wife) {
          // Función auxiliar para verificar duplicados
          const hasRelation = (relations, type, relatedPersonId) =>
            relations.some(
              (rel) => rel.type === type && rel.person === relatedPersonId
            );

          // Añadir esposa a las relaciones del marido (si no existe ya)
          husband.relations = husband.relations || [];
          if (!hasRelation(husband.relations, "wife", wife.id)) {
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
              person: wife.id, // Solo agregar el ID de la persona relacionada
            });
          }

          // Añadir marido a las relaciones de la esposa (si no existe ya)
          wife.relations = wife.relations || [];
          if (!hasRelation(wife.relations, "husband", husband.id)) {
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
              person: husband.id, // Solo agregar el ID de la persona relacionada
            });
          }
        }
      });

      // 2. Añadir relaciones padre-hijo/madre-hijo basadas en 'fatherID' y 'motherID'
      transformedPersons.forEach((person) => {
        const { id, fatherID, motherID } = person;

        // Relación con el padre (si existe)
        if (fatherID && fatherID !== "NULL" && personsById[fatherID]) {
          const father = personsById[fatherID];
          // Agregar la relación de hijo al padre
          father.relations = father.relations || [];
          if (
            !father.relations.some(
              (rel) => rel.type === "child" && rel.person === id
            )
          ) {
            father.relations.push({
              type: "child",
              person: id, // ID del hijo/hija
            });
          }

          // Agregar la relación de padre a la persona
          person.relations = person.relations || [];
          if (
            !person.relations.some(
              (rel) => rel.type === "father" && rel.person === fatherID
            )
          ) {
            person.relations.push({
              type: "father",
              person: fatherID, // ID del padre
            });
          }
        }

        // Relación con la madre (si existe)
        if (motherID && motherID !== "NULL" && personsById[motherID]) {
          const mother = personsById[motherID];
          // Agregar la relación de hijo a la madre
          mother.relations = mother.relations || [];
          if (
            !mother.relations.some(
              (rel) => rel.type === "child" && rel.person === id
            )
          ) {
            mother.relations.push({
              type: "child",
              person: id, // ID del hijo/hija
            });
          }

          // Agregar la relación de madre a la persona
          person.relations = person.relations || [];
          if (
            !person.relations.some(
              (rel) => rel.type === "mother" && rel.person === motherID
            )
          ) {
            person.relations.push({
              type: "mother",
              person: motherID, // ID de la madre
            });
          }
        }
      });

      return transformedPersons;
    };

    // Supongamos que 'transformedPersons' y 'weddings' están disponibles:
    const transformedPersonsUpdated = updateRelations(
      transformedPersons,
      weddings
    );

    // Mostrar el array actualizado en la consola
    console.log(
      "Personas con relaciones actualizadas:",
      transformedPersonsUpdated
    );
  }

  const uploadTransfersToFirestore = async () => {
    if (transfers.length > 0) {
      const modifiedTransfers = transfers.map((row) => ({
        id: row.TransferID ? row.TransferID.trim() : null,
        churchTransfer: row.TransferredToChurchName
          ? row.TransferredToChurchName.trim()
          : null,
        date: row.TransferDate
          ? Timestamp.fromDate(new Date(row.TransferDate.trim()))
          : null,
        docNumber: row.TransferAct ? row.TransferAct.trim() : null,
        details: row.TransferDetails ? row.TransferDetails.trim() : null,
        owner: row.PersonID ? row.PersonID.trim() : null,
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
              row.SpecialCaseID && row.SpecialCaseID.trim() !== ""
                ? row.SpecialCaseID.trim()
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
              row.PersonID && row.PersonID.trim() !== "" ? row.PersonID : null,
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

  const uploadPersonsToFirestore = async () => {
    if (mergedPersons.length > 0) {
      // Transformar los datos para verificar la estructura deseada antes de subir a Firestore
      const modifiedPersons = mergedPersons.map((row) => ({
        firstName: row.FirstName ? row.FirstName.trim() : null,
        lastName: row.LastName ? row.LastName.trim() : null,
        addressID:
          row.AddressID && typeof row.AddressID === "string"
            ? row.AddressID.trim()
            : null,
        birthDate: row.BirthDate ? row.BirthDate : null, // Si BirthDate es null o no válido, lo asignamos a null
        maidenName: row.MaidenName ? row.MaidenName.trim() : null,
        churchID:
          row.ChurchID && typeof row.ChurchID === "string"
            ? row.ChurchID.trim()
            : null,
        churchName: row.ChurchName ? row.ChurchName.trim() : null,
        deathDate:
          row.DeathDate && row.DeathDate.trim() !== "NULL"
            ? Timestamp.fromDate(new Date(row.DeathDate.trim()))
            : null, // Conversión de fecha
        details: row.Details ? row.Details.trim() : "",
        fatherID:
          row.FatherID && typeof row.FatherID === "string"
            ? row.FatherID.trim()
            : null,
        motherID:
          row.MotherID && typeof row.MotherID === "string"
            ? row.MotherID.trim()
            : null,
        placeOfBirth: row.PlaceOfBirth ? row.PlaceOfBirth.trim() : null,
        mobilePhone:
          row.MobilePhone && typeof row.MobilePhone === "string"
            ? row.MobilePhone.trim()
            : null,
        sex:
          row.Sex && typeof row.Sex === "string"
            ? row.Sex.trim() === "1"
              ? true
              : false
            : null,
        id:
          row.PersonID && typeof row.PersonID === "string"
            ? row.PersonID.trim()
            : null,
        address: row.address || null,
        blessingDate:
          row.blessingDate && row.blessingDate !== "NULL"
            ? Timestamp.fromDate(new Date(row.blessingDate.trim()))
            : null, // Conversión de fecha
        blessingPlace:
          row.blessingPlace && row.blessingPlace !== "NULL"
            ? row.blessingPlace
            : null,
        baptisedBy:
          row.baptisedBy && row.baptisedBy !== "NULL" ? row.baptisedBy : null,
        baptisePlace:
          row.baptisePlace && row.baptisePlace !== "NULL"
            ? row.baptisePlace
            : null,
        baptiseDate:
          row.baptiseDate && row.baptiseDate !== "NULL"
            ? Timestamp.fromDate(new Date(row.baptiseDate.trim()))
            : null, // Conversión de fecha
        hsBaptiseDate:
          row.hsBaptiseDate && row.hsBaptiseDate !== "NULL"
            ? Timestamp.fromDate(new Date(row.hsBaptiseDate.trim()))
            : null, // Conversión de fecha
        hsBaptisePlace:
          row.hsBaptisePlace && row.hsBaptisePlace !== "NULL"
            ? row.hsBaptisePlace
            : null,
        memberDate:
          row.memberDate && row.memberDate !== "NULL"
            ? Timestamp.fromDate(new Date(row.memberDate.trim()))
            : null, // Conversión de fecha
        leaveDate:
          row.leaveDate && row.leaveDate !== "NULL"
            ? Timestamp.fromDate(new Date(row.leaveDate.trim()))
            : null, // Conversión de fecha
        observations: row.observations ? row.observations.trim() : "",
        email: "",
        profileImage: row.Photo ? row.Photo.trim() : null,
      }));
      setTransformedPersons(modifiedPersons);

      transformedPersons.forEach(async (person) => {
        await setDoc(doc(firestore, "persoane", person.id), person);
      });

      alert("Datos subidos correctamente a Firestore");
    } else {
      alert("No se han combinado todos los datos necesarios o están vacíos.");
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
