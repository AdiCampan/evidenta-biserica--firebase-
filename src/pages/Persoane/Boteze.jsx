import { useEffect, useState } from "react";
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
  filterByAgeSmaller,
  filterByDate,
  calculateAge,
} from "../../utils";
import "./Boteze.scss";
import { collection, getDocs, onSnapshot, query } from "firebase/firestore";
import { firestore } from "../../firebase-config";
import { list } from "firebase/storage";

function Boteze({ persoane }) {
  if (!persoane || persoane.length === 0) {
    return <div>Loading...</div>; // O un mensaje de estado inicial
  }
  const navigate = useNavigate();

  const [firstNameFilter, setFirstNameFilter] = useState("");
  const [lastNameFilter, setLastNameFilter] = useState("");
  const [ageFilterGreater, setAgeFilterGreater] = useState("");
  const [ageFilterSmaller, setAgeFilterSmaller] = useState("");
  const [addressFilter, setAddressFilter] = useState("");
  const [telefonFilter, setTelefonFilter] = useState("");
  const [listByDateBaptized, setListByDateBaptized] = useState([]);
  const [baptisedBy, setBaptisedBy] = useState();
  const [baptisedDate, setBaptisedDate] = useState();

  function filterMembers(members) {
    if (persoane && persoane.length > 0) {
      let filteredMembers = members;
      filteredMembers = filterByText(
        filteredMembers,
        "firstName",
        firstNameFilter
      );
      filteredMembers = filterByText(
        filteredMembers,
        "lastName",
        lastNameFilter
      );
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
      filteredMembers = filteredMembers.filter((member) => member?.baptiseDate);

      filteredMembers = filteredMembers.filter(
        (member) =>
          member?.baptisePlace === "EBEN EZER" ||
          member.baptisePlace === "Eben Ezer" ||
          member.baptisePlace === "EbenEzer" ||
          member.baptisePlace === "Eben-Ezer" ||
          member.baptisePlace === "EBEN-EZER" ||
          member.baptisePlace === "EBEN - EZER"
      );

      const listBaptist = filteredMembers.reduce((boteze, item) => {
        if (
          !boteze.find(
            (botez) => botez.baptiseDate.seconds === item.baptiseDate.seconds
          )
        ) {
          boteze.push(item);
          // console.log("boteze", boteze);
          // console.log("item", item.baptiseDate);
        }
        return boteze;
      }, []);
      return listBaptist;
    }
  }

  // console.log("Lista de boteze", filterMembers(persoane));
  const goToPerson = (id) => {
    navigate(`/persoane/${id}`);
  };

  const listBaptized = (dataBotez, baptisedBy) => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
    let listaBotezati = persoane.filter(
      (data) => data?.baptiseDate?.seconds === dataBotez.seconds
    );
    setBaptisedDate(dataBotez);
    setBaptisedBy(baptisedBy);
    setListByDateBaptized(listaBotezati);
  };
  // console.log("lista Botezati", listByDateBaptized);

  return (
    <>
      <div className="pagina-boteze">
        <div className="boteze">
          <h3 className="title">BOTEZE în EBEN EZER</h3>
          <Table striped bordered hover size="sm">
            <thead>
              <tr>
                <th>#</th>
                <th>Data Botezului</th>
                <th>Slujitori Botez</th>
              </tr>
            </thead>
            <tbody>
              {persoane
                ? filterMembers(persoane).map((p, index) => (
                    <tr
                      key={p?.id}
                      style={{ cursor: "pointer" }}
                      onClick={() => listBaptized(p?.baptiseDate, p.baptisedBy)}
                    >
                      <td>{index + 1}</td>
                      <td>{formatDate(p?.baptiseDate)}</td>
                      <td>{p?.baptisedBy}</td>
                    </tr>
                  ))
                : null}
            </tbody>
          </Table>
        </div>
        <div className="botezati">
          <h4 className="title"> LISTA BOTEZATI</h4>
          {baptisedDate && formatDate(baptisedDate)}
          {baptisedBy && <div>{`Slujitori:${baptisedBy}`} </div>}

          <Table striped bordered hover size="sm">
            <thead>
              <tr>
                <th>#</th>
                <th>Nume</th>
                <th>Prenume</th>
                <th>D. Nasterii</th>
                <th>Varsta</th>
                <th>Gen</th>
                <th>Detalii</th>
              </tr>
            </thead>
            <tbody>
              {listByDateBaptized
                ? listByDateBaptized.map((p, index) => (
                    <tr
                      key={p.id}
                      style={{ cursor: "pointer" }}
                      onClick={() => goToPerson(p.id)}
                    >
                      <td>{index + 1}</td>
                      <td>{p.lastName}</td>
                      <td>{p.firstName}</td>
                      <td>{formatDate(p.birthDate)}</td>
                      <td>{calculateAge(p.birthDate)}</td>
                      <td>{p.sex ? "M" : "F"}</td>
                      <td>{p.details}</td>
                    </tr>
                  ))
                : null}
            </tbody>
          </Table>
        </div>
      </div>
    </>
  );
}

export default Boteze;
