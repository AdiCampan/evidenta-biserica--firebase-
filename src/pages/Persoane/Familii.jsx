import { useState, useEffect } from "react";
import { useGetMembersQuery } from "../../services/members";
import { formatDate, calculateAge, filterByText } from "../../utils";
import Table from "react-bootstrap/Table";
import "./Familii.scss";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import { collection, onSnapshot, query } from "firebase/firestore";
import { firestore } from "../../firebase-config";

const Familii = ({ persoane }) => {
  // const [persoane, setPersoane] = useState();
  const [childrens, setChildrens] = useState([]);

  const [lastNameFilter, setLastNameFilter] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [familia, setFamilia] = useState();

  const handleClose = () => setShowModal(false);

  // -------------- LISTEN "persons" in REAL TIME  in FIRESTORE -------------------- //
  // useEffect(() => {
  //   const q = query(collection(firestore, "persoane"));
  //   onSnapshot(q, (querySnapshot) => {
  //     const tmpArray = [];
  //     querySnapshot.forEach((doc) => {
  //       const childKey = doc.id;
  //       const childData = doc.data();
  //       tmpArray.push({ id: childKey, ...childData });
  //       setPersoane(tmpArray);
  //     });
  //   });
  // }, []);

  function filterMembers(members) {
    if (persoane?.length > 0) {
      let filteredMembers = members;

      filteredMembers = filterByText(
        filteredMembers,
        "lastName",
        lastNameFilter
      );

      filteredMembers = filteredMembers.filter((person) => person.sex === true);

      filteredMembers = filteredMembers.filter((member) =>
        member.relations?.find((relation) => relation?.type === "wife")
      );
      return filteredMembers;
    }
  }

  const listChildrens = (p) => {
    setShowModal(true);
    const childrensFiltered = p.relations
      .filter((relation) => relation.type === "child")
      .map((relation) => relation?.person);
    setChildrens(childrensFiltered);
    setFamilia(p.lastName);
  };

  // const children = persoane.filter(child => child.id === childrens.map() )
  // console.log("children", children);
  return (
    <div className="pagina-familii">
      <div className="familii">
        <div className="title">FAMILII</div>
        <Table striped bordered hover size="sm">
          <thead className="header-familii">
            <tr>
              <th>#</th>
              <th>Familia</th>
              <th>Serv. Civil</th>
              <th>Serv. Relig.</th>
              <th>Biserica Serv. Relig.</th>
              <th>Nume anterior soție</th>
              <th>Varsta soț</th>
              <th>Varsta soție</th>
              <th>Nr.copii</th>
            </tr>
            <tr>
              <td></td>
              <td>
                <input
                  className="search-input"
                  value={lastNameFilter}
                  onChange={(e) => setLastNameFilter(e.target.value)}
                  type="text"
                  placeholder="...numele de familie"
                />
              </td>
            </tr>
          </thead>
          <tbody>
            {persoane.length > 0 && persoane
              ? filterMembers(persoane).map((p, index) => (
                  <tr
                    key={p.id}
                    style={{ cursor: "pointer" }}
                    onClick={() => listChildrens(p)}
                    // onClick={handleShow}
                  >
                    <td>{index + 1}</td>
                    <td>
                      {p?.firstName} {p?.lastName} și{" "}
                      {persoane
                        .filter((member) =>
                          member.relations?.some(
                            (relation) =>
                              relation.type === "husband" &&
                              relation.person === p.id
                          )
                        )
                        .map((wife) => wife.firstName)}
                    </td>
                    <td>{formatDate(p.relations[0].civilWeddingDate)}</td>
                    <td>{formatDate(p.relations[0].religiousWeddingDate)}</td>
                    <td>{p.relations[0].weddingChurch}</td>
                    <td>
                      {persoane
                        .filter((member) =>
                          member.relations?.some(
                            (relation) =>
                              relation.type === "husband" &&
                              relation.person === p.id
                          )
                        )
                        .map((wife) => wife.maidenName)}
                    </td>
                    <td>{calculateAge(p.birthDate)}</td>
                    <td>
                      {calculateAge(
                        persoane
                          .filter((member) =>
                            member.relations?.some(
                              (relation) =>
                                relation.type === "husband" &&
                                relation.person === p.id
                            )
                          )
                          .map((wife) => wife.birthDate) // Crear un array con `birthDate`
                          .filter((date) => date && date !== "NULL") // Eliminar fechas inválidas
                          .find((date) => date) // Obtener la primera fecha válida
                      )}
                    </td>
                    <td>
                      {
                        p.relations.filter(
                          (relation) => relation.type === "child"
                        ).length
                      }
                    </td>
                  </tr>
                ))
              : null}
          </tbody>
        </Table>
      </div>

      <Modal
        centered
        dialogClassName="custom-modal"
        show={showModal}
        onHide={handleClose}
      >
        <Modal.Header
          closeButton
          style={{ display: "flex", width: "100%" }}
          // style={{ display: "flex", justifyContent: "center" }}
        >
          Copii familiei{" "}
          <Modal.Title style={{ marginLeft: "20px" }}>{familia}</Modal.Title>
        </Modal.Header>
        <Table striped bordered hover variant="dark">
          <thead>
            <tr>
              <th>#</th>
              <th>NUME</th>
              <th>PRENUME</th>
              <th>DATA NAST.</th>
              <th>VARSTA</th>
              <th>GEN</th>
              <th>DETALII</th>
            </tr>
          </thead>
          <tbody>
            {childrens
              ? childrens.map((p, index) => (
                  <tr key={p}>
                    <td>{index + 1}</td>
                    <td>
                      {
                        persoane
                          .filter((child) => child.id === p)
                          .find((children) => children.lastName)?.firstName
                      }
                    </td>
                    <td>
                      {
                        persoane
                          .filter((child) => child.id === p)
                          .find((children) => children.lastName)?.lastName
                      }
                    </td>
                    <td>
                      {formatDate(
                        persoane
                          .filter((child) => child.id === p)
                          .find((children) => children.lastName)?.birthDate ||
                          ""
                      )}
                    </td>
                    <td>
                      {calculateAge(
                        persoane
                          .filter((child) => child.id === p)
                          .find((children) => children.lastName)?.birthDate ||
                          ""
                      )}
                    </td>
                    <td>
                      {persoane
                        .filter((child) => child.id === p)
                        .find((children) => children.lastName)?.sex
                        ? "M"
                        : "F"}
                    </td>
                    <td>
                      {persoane
                        .filter((child) => child.id === p)
                        .find((children) => children.lastName)?.details || ""}
                    </td>
                  </tr>
                ))
              : null}
          </tbody>
        </Table>
      </Modal>
    </div>
  );
};

export default Familii;
