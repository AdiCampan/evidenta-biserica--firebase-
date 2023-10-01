import { useState, useEffect } from "react";
import { useGetMembersQuery } from "../../services/members";
import { formatDate, calculateAge, filterByText } from "../../utils";
import Table from "react-bootstrap/Table";
import "./Familii.scss";
import { collection, onSnapshot, query } from "firebase/firestore";
import { firestore } from "../../firebase-config";

const Familii = () => {
  // -------------- LISTEN REAL TIME  in FIRESTORE -------------------- //
  useEffect(() => {
    const q = query(collection(firestore, "persoane"));
    onSnapshot(q, (querySnapshot) => {
      const tmpArray = [];
      querySnapshot.forEach((doc) => {
        const childKey = doc.id;
        const childData = doc.data();
        tmpArray.push({ id: childKey, ...childData });
        setPersoane(tmpArray);
      });
    });
  }, []);

  const [persoane, setPersoane] = useState();
  const [childrens, setChildrens] = useState([]);

  const [firstNameFilter, setFirstNameFilter] = useState("");

  function filterMembers(members) {
    let filteredMembers = members;
    filteredMembers = filterByText(
      filteredMembers,
      "firstName",
      firstNameFilter
    );

    filteredMembers = filteredMembers.filter((person) => person.sex === true);

    filteredMembers = filteredMembers.filter((member) =>
      member.relations?.filter((relation) => relation?.type === "wife")
    );
    return filteredMembers;
  }

  const listChildrens = (childrens) => {
    const childrensFiltered = childrens
      .filter((relation) => relation.type === "child")
      .map((relation) => relation?.person);
    setChildrens(childrensFiltered);
  };

  // const children = persoane.filter(child => child.id === childrens.map() )
  // console.log("children", children);
  return (
    <div className="pagina-familii">
      <div className="familii">
        <div className="title">FAMILII</div>
        <Table striped bordered hover size="sm">
          <thead>
            <tr>
              <th>#</th>
              <th>Familia</th>
              <th>Data serv. Civil</th>
              <th>Data serv. Relig.</th>
              <th>Biserica Serv. Relig.</th>
              <th>Nume anterior soție</th>
              <th>Varsta soț</th>
              <th>Varsta soție</th>
            </tr>
            <tr>
              <td></td>
              <td>
                <input
                  className="search-input"
                  value={firstNameFilter}
                  onChange={(e) => setFirstNameFilter(e.target.value)}
                  type="text"
                  placeholder="...numele de familie"
                />
              </td>
            </tr>
          </thead>
          <tbody>
            {persoane
              ? filterMembers(persoane).map((p, index) => (
                  <tr
                    key={p.id}
                    style={{ cursor: "pointer" }}
                    onClick={() => listChildrens(p.relations)}
                  >
                    <td>{index + 1}</td>
                    <td>
                      {p?.firstName} {p?.lastName} și{" "}
                      {
                        persoane
                          ?.filter(
                            //    to do ---->filtrar solo relatiile de wife       //
                            (persoana) => persoana.id === p.relations[0].person
                          )
                          .find((pers) => pers?.lastName)?.lastName
                      }
                    </td>
                    <td>{formatDate(p.relations[0].civilWeddingDate)}</td>
                    <td>{formatDate(p.relations[0].religiousWeddingDate)}</td>
                    <td>{p.relations[0].weddingChurch}</td>
                    <td>
                      {
                        persoane
                          ?.filter(
                            //    to do ---->filtrar solo relatiile de wife       //
                            (persoana) => persoana.id === p.relations[0].person
                          )
                          .find((pers) => pers.lastName)?.maidenName
                      }
                    </td>
                    <td>{calculateAge(p.birthDate)}</td>
                    <td>
                      {calculateAge(
                        persoane
                          ?.filter(
                            //    to do ---->filtrar solo relatiile de wife       //
                            (persoana) => persoana.id === p.relations[0].person
                          )
                          .find((pers) => pers.lastName)?.birthDate
                      )}
                    </td>
                  </tr>
                ))
              : null}
          </tbody>
        </Table>
      </div>
      <div className="copii">
        <div className="title">Copii</div>
        <Table striped bordered hover size="sm">
          <thead>
            <tr>
              <th>#</th>
              <th>Nume</th>
              <th>Prenume</th>
              <th>D. Nasterii</th>
              <th>Varsta</th>
              <th>Sex</th>
              <th>Detalii</th>
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
                          .find((children) => children.lastName).firstName
                      }
                    </td>
                    <td>
                      {
                        persoane
                          .filter((child) => child.id === p)
                          .find((children) => children.lastName).lastName
                      }
                    </td>
                    <td>
                      {formatDate(
                        persoane
                          .filter((child) => child.id === p)
                          .find((children) => children.lastName).birthDate || ""
                      )}
                    </td>
                    <td>
                      {calculateAge(
                        persoane
                          .filter((child) => child.id === p)
                          .find((children) => children.lastName).birthDate || ""
                      )}
                    </td>
                    <td>
                      {persoane
                        .filter((child) => child.id === p)
                        .find((children) => children.lastName).sex
                        ? "M"
                        : "F"}
                    </td>
                    <td>
                      {persoane
                        .filter((child) => child.id === p)
                        .find((children) => children.lastName).details || ""}
                    </td>
                  </tr>
                ))
              : null}
          </tbody>
        </Table>
      </div>
    </div>
  );
};

export default Familii;
