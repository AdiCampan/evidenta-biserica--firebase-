import { useState, useEffect } from "react";
import Table from "react-bootstrap/Table";
import Button from "react-bootstrap/Button";
import { useNavigate } from "react-router-dom";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Radio from "@mui/material/Radio";
import { useGetMembersQuery } from "../../services/members";
import {
  filterByText,
  formatDate,
  searchField,
  filterByAgeGreater,
  filterByAge,
  filterByAgeSmaller,
  filterByDate,
  calculateAge,
} from "../../utils";
import "./Membrii.scss";
import { collection, onSnapshot, query } from "firebase/firestore";
import { firestore } from "../../firebase-config";
import ScrollButton from "../../ScrollButton";

function Membrii({ persoane }) {
  // const { data: persoane, error, isLoading, isFetching } = useGetMembersQuery();
  const navigate = useNavigate();

  // const [persoane, setPersoane] = useState();
  const [firstNameFilter, setFirstNameFilter] = useState("");
  const [lastNameFilter, setLastNameFilter] = useState("");
  const [ageFilterGreater, setAgeFilterGreater] = useState("");
  const [ageFilterSmaller, setAgeFilterSmaller] = useState("");

  const [addressFilter, setAddressFilter] = useState("");
  const [telefonFilter, setTelefonFilter] = useState("");

  // const q = query(collection(firestore, "persoane"));
  // useEffect(() => {
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
    let filteredMembers = members;

    filteredMembers = filterByText(
      filteredMembers,
      "firstName",
      firstNameFilter
    );
    filteredMembers = filterByText(filteredMembers, "lastName", lastNameFilter);
    filteredMembers = filterByText(filteredMembers, "address", addressFilter);
    filteredMembers = filterByText(
      filteredMembers,
      "mobilePhone",
      telefonFilter
    );
    filteredMembers = filterByAgeGreater(
      filteredMembers,
      "birthDate",
      ageFilterGreater
    );
    filteredMembers = filterByAgeSmaller(
      filteredMembers,
      "birthDate",
      ageFilterSmaller
    );

    return filteredMembers.filter((member) => member.memberDate);
  }

  const goToPerson = (id) => {
    navigate(`/persoane/${id}`);
  };

  return (
    <div className="page-membrii">
      <br />
      <br />
      <Table striped bordered hover size="sm">
        <thead>
          <tr className="head-list-membri">
            <th>#</th>
            <th className="header-lista">Nume</th>
            <th className="header-lista">Prenume</th>
            <th>Data membru</th>
            <th>Data Botezului</th>
            <th>Locul Botezului</th>
            <th>Varsta</th>
            <th>Data nasterii</th>
            <th>Gen</th>
            <th>Actiuni</th>
          </tr>
        </thead>
        <tbody>
          <tr className="inputs-list-members">
            <td></td>
            <td>
              <input
                className="search-input"
                type="text"
                value={lastNameFilter}
                onChange={(e) => setLastNameFilter(e.target.value)}
              />
            </td>
            <td>
              <input
                className="search-input"
                placeholder="Filtreaza"
                type="text"
                value={firstNameFilter}
                onChange={(e) => setFirstNameFilter(e.target.value)}
              />
            </td>

            <td>
              {/* <input
                                className='search-input'
                                type="text"
                                value={addressFilter}
                                onChange={(e) => setAddressFilter(e.target.value)}
                            /> */}
            </td>
            <td>
              {/* <input
                                className='search-phone'
                                type='text'
                                value={telefonFilter}
                                onChange={(e) => setTelefonFilter(e.target.value)}
                            /> */}
            </td>
            <td></td>
            <td className="age-input">
              <input
                placeholder=">0"
                className="age-input"
                type="text"
                value={ageFilterGreater}
                onChange={(e) => setAgeFilterGreater(e.target.value)}
              />
              <input
                placeholder="<99"
                className="age-input"
                type="text"
                value={ageFilterSmaller}
                onChange={(e) => setAgeFilterSmaller(e.target.value)}
              />
            </td>
            <td></td>
            <td></td>
            <td></td>
          </tr>
          {persoane
            ? filterMembers(persoane).map((p, index) => (
                <tr
                  key={p.id}
                  style={{ cursor: "pointer" }}
                  onClick={() => goToPerson(p.id)}
                >
                  <td>{index + 1}</td>
                  <td>{p.lastName}</td>
                  <td>{p["firstName"]}</td>
                  <td>{formatDate(p.memberDate)}</td>
                  <td>{formatDate(p.baptiseDate)}</td>
                  <td>{p.baptisePlace}</td>
                  <td>{calculateAge(p.birthDate)}</td>
                  <td>{formatDate(p.birthDate)}</td>
                  <td>{p.sex ? "M" : "F"}</td>
                  {/* {console.log(p.sex)} */}
                  <td>
                    <Button
                      variant="primary"
                      onClick={(event) => showDeleteModal(p.id, event)}
                    >
                      Sterge
                    </Button>
                  </td>
                </tr>
              ))
            : null}
        </tbody>
      </Table>
      <ScrollButton />
    </div>
  );
}
export default Membrii;
