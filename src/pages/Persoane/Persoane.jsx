import Button from "react-bootstrap/Button";
import Dropdown from "react-bootstrap/Dropdown";
import DropdownButton from "react-bootstrap/DropdownButton";
import ButtonGroup from "react-bootstrap/ButtonGroup";
import Table from "react-bootstrap/Table";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Radio from "@mui/material/Radio";
import { useEffect, useRef, useState } from "react";
import Form from "react-bootstrap/Form";
import AddPerson from "./AddPerson";
import { useNavigate } from "react-router-dom";
import {
  useGetMembersQuery,
  useAddMemberMutation,
  useDelMemberMutation,
} from "../../services/members";
import Confirmation from "../../Confirmation";
import ExternalFormsReview from "../../components/ExternalFormsReview";
import ExternalRequestReview from "../../components/ExternalRequestReview";
import {
  calculateAge,
  formatDate,
  searchField,
  filterByText,
  filterByAgeSmaller,
  filterByAge,
  filterByAgeGreater,
  filterByDate,
  filterBySex,
  filterByAnyText,
} from "../../utils";

import "./Persoane.scss";
import ScrollButton from "../../ScrollButton";
import { onValue, query, ref, remove } from "firebase/database";
import { db, firestore } from "../../firebase-config";
import {
  doc,
  setDoc,
  onSnapshot,
  collection,
  where,
  getDocs,
  deleteDoc,
} from "firebase/firestore";
import CSVUploader from "../../components/CSVUploader";
import { Modal } from "react-bootstrap";

const AGE_FILTER_LABEL = {
  1: ">=",
  2: "<=",
  3: "=",
  4: "< >",
};

function Persoane({ persoane }) {
  const navClass = (isActive) => {
    return isActive ? "active" : "";
  };
  const navigate = useNavigate();

  const [idToDelete, setIdToDelete] = useState(null);
  const [firstNameFilter, setFirstNameFilter] = useState("");
  const [lastNameFilter, setLastNameFilter] = useState("");
  const [ageFilter, setAgeFilter] = useState("");
  const [ageFilterBetween, setAgeFilterBetween] = useState("");
  const [addressFilter, setAddressFilter] = useState("");
  const [telefonFilter, setTelefonFilter] = useState("");
  const [sexFilter, setSexFilter] = useState("");
  const [masculin, setMasculin] = useState(false);
  const [feminin, setFeminin] = useState(false);
  const [ageFilterType, setAgeFilterType] = useState("1");
  const [memberSorting, setMemberSorting] = useState({
    field: null,
    direction: null,
  });
  const [baptisedOnly, setBaptisedOnly] = useState(false);
  const [notBabtisedOnly, setNotBaptisedOnly] = useState(false);
  const [blessedOnly, setBlessedOnly] = useState(false);
  const [notBlessedOnly, setNotBlessedOnly] = useState(false);
  const [membersOnly, setMembersOnly] = useState(true);
  const [notMembersOnly, setNotMembersOnly] = useState(false);
  const [persons, setPersons] = useState("");

  const tableRef = useRef();

  const handlePrint = () => {
    let printContents = tableRef.current.innerHTML;

    const currentDate = new Date().toLocaleDateString("ro-RO", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

    // Generar el título dinámico basado en los filtros seleccionados
    let title = "Lista de: ";

    const selectedFilters = [];
    if (baptisedOnly) selectedFilters.push("Botezati");
    if (notBabtisedOnly) selectedFilters.push("Nebotezati");
    if (blessedOnly) selectedFilters.push("Dusi la Binecuvantare");
    if (notBlessedOnly) selectedFilters.push("Nu dusi la Binecuvantare");
    if (membersOnly) selectedFilters.push("Membrii");
    if (notMembersOnly) selectedFilters.push("Nu membri");
    if (masculin) selectedFilters.push("Masculin");
    if (feminin) selectedFilters.push("Feminin");

    // Si hay filtros seleccionados, añadirlos al título
    if (selectedFilters.length > 0) {
      title += selectedFilters.join(", ");
    } else {
      title += "Toți membri"; // Mostrar un mensaje por defecto
    }

    // Crear un contenedor con el título dinámico
    const printHeader = ` <div class="print-date">${currentDate}  </div> 
                          <div class="print-logo"> Biserica Penticostala EBEN-EZER </br> Castellon de la Plana</div>
                          <h2 class="print-title">${title}</h2> 
                         
                          `;

    // Agregar el título antes de la tabla en la impresión
    printContents = printHeader + printContents;

    // Guardar el contenido original y reemplazarlo con la versión imprimible
    const originalContents = document.body.innerHTML;
    document.body.innerHTML = printContents;
    window.print();
    document.body.innerHTML = originalContents;
    window.location.reload();
  };

  useEffect(() => {
    if (persoane) {
      setPersons(persoane);
    }
  }, []);

  const deleteMember = async (id) => {
    await deleteDoc(doc(firestore, "persoane", id));
  };
  function filterMembers(members) {
    let filteredMembers = members;

    filteredMembers = filterByText(
      filteredMembers,
      "firstName",
      firstNameFilter
    );
    filteredMembers = filterByText(filteredMembers, "lastName", lastNameFilter);
    filteredMembers = filterByAnyText(
      filteredMembers,
      "address",
      addressFilter
    );
    filteredMembers = filterByText(
      filteredMembers,
      "mobilePhone",
      telefonFilter
    );
    if (ageFilterType === "1" || ageFilterType === "4") {
      // >=
      filteredMembers = filterByAgeGreater(
        filteredMembers,
        "birthDate",
        ageFilter
      );
    }
    if (ageFilterType === "2") {
      // <=
      filteredMembers = filterByAgeSmaller(
        filteredMembers,
        "birthDate",
        ageFilter
      );
    }
    if (ageFilterType === "3") {
      // ==
      filteredMembers = filterByAge(filteredMembers, "birthDate", ageFilter);
    }
    if (ageFilterType === "4") {
      filteredMembers = filterByAgeSmaller(
        filteredMembers,
        "birthDate",
        ageFilterBetween
      );
    }
    filteredMembers = filterBySex(filteredMembers, sexFilter);

    if (masculin !== feminin) {
      if (masculin) {
        filteredMembers = filteredMembers.filter(
          (member) => member.sex === true
        );
      }
      if (feminin) {
        filteredMembers = filteredMembers.filter(
          (member) => member.sex === false
        );
      }
    }

    if (baptisedOnly !== notBabtisedOnly) {
      if (baptisedOnly) {
        filteredMembers = filteredMembers.filter(
          (member) => member.baptiseDate
        );
      }
      if (notBabtisedOnly) {
        filteredMembers = filteredMembers.filter(
          (member) => !member.baptiseDate
        );
      }
    }

    if (blessedOnly !== notBlessedOnly) {
      if (blessedOnly) {
        filteredMembers = filteredMembers.filter(
          (member) => member.blessingDate
        );
      }
      if (notBlessedOnly) {
        filteredMembers = filteredMembers.filter(
          (member) => !member.blessingDate
        );
      }
    }

    if (membersOnly !== notMembersOnly) {
      if (membersOnly) {
        const regex = /\beben\b.*\bezer\b|\bezer\b.*\beben\b/i;
        filteredMembers = filteredMembers.filter(
          (member) => member.churchID === 1 || regex.test(member.churchName)
        );
      }
      if (notMembersOnly) {
        filteredMembers = filteredMembers.filter(
          (member) => member.leaveDate || !member.memberDate
          // member.leaveDate > member.memberDate
        );
      }
    }
    return filteredMembers;
  }

  function deletePerson(id) {
    deleteMember(id);

    setIdToDelete(null);
  }

  const showDeleteModal = (personId, ev) => {
    setIdToDelete(personId);
    ev.stopPropagation();
  };

  const goToPerson = (id) => {
    if (persons) {
      navigate(`/persoane/${id}`, { state: { persons } });
    }
  };

  const filterBaptize = (members) => {
    let filteredMembers = members;
    filteredMembers = filterByDate(filteredMembers, "baptiseDate");
    return filteredMembers;
  };

  const sortList = (a, b) => {
    if (!memberSorting.field) {
      return 1;
    }
    // ascendent
    if (memberSorting.direction === "asc") {
      if (
        a[memberSorting.field]?.toLowerCase() >
        b[memberSorting.field]?.toLowerCase()
      ) {
        return 1;
      }
      return -1;
      // descendent
    } else {
      if (
        a[memberSorting.field]?.toLowerCase() <
        b[memberSorting.field]?.toLowerCase()
      ) {
        return 1;
      }
      return -1;
    }
  };

  const sorting = (field) => {
    let newDirection = "asc";

    // 1. nu e setat deloc, deci trebuie pus ascendent
    if (memberSorting.direction === null) {
      newDirection = "asc";
      // 2. e setat ascendent, deci trebuie pus descendent
    } else if (memberSorting.direction === "asc") {
      newDirection = "desc";
      // 3 e setat descendent, deci trebuie pus ascendent
    } else {
      newDirection = "asc";
    }

    setMemberSorting({
      field: field,
      direction: newDirection,
    });
  };

  return (
    <div className="page-persons">
      <div className="lista_persoane">
        <div className="barra-buttons">
          <AddPerson />
          <ExternalFormsReview persoane={persoane} />
          <ExternalRequestReview persoane={persoane} />
          <CSVUploader persoane={persoane} />
          <Button
            onClick={handlePrint}
            variant="primary"
            style={{ marginLeft: "10px" }}
          >
            Imprimir
          </Button>
        </div>
        <div ref={tableRef} className="printable-table">
          <div>
            <Form.Check
              inline
              label="Botezati"
              name="group1"
              type="checkbox"
              value={baptisedOnly}
              onChange={(e) => setBaptisedOnly(e.target.checked)}
            />
            <Form.Check
              inline
              label="Nebotezati"
              name="group1"
              type="checkbox"
              value={notBabtisedOnly}
              onChange={(e) => setNotBaptisedOnly(e.target.checked)}
            />
            <Form.Check
              inline
              label="Dusi la Binecuvantare"
              name="group1"
              type="checkbox"
              value={blessedOnly}
              onChange={(e) => setBlessedOnly(e.target.checked)}
            />
            <Form.Check
              inline
              label="Nu dusi la Binecuvantare"
              name="group1"
              type="checkbox"
              value={notBlessedOnly}
              onChange={(e) => setNotBlessedOnly(e.target.checked)}
            />
            <Form.Check
              defaultChecked
              inline
              label="Membrii"
              name="group1"
              type="checkbox"
              value={membersOnly}
              onChange={(e) => setMembersOnly(e.target.checked)}
            />
            <Form.Check
              inline
              label="Nu membri"
              name="group1"
              type="checkbox"
              value={notMembersOnly}
              onChange={(e) => setNotMembersOnly(e.target.checked)}
            />
          </div>

          <Table striped bordered hover size="sm">
            <thead className="head-list">
              <tr>
                <th>#</th>
                <th
                  onClick={() => sorting("lastName")}
                  style={{ cursor: "pointer" }}
                >
                  Nume
                </th>
                <th
                  onClick={() => sorting("firstName")}
                  style={{ cursor: "pointer" }}
                >
                  Prenume
                </th>
                <th
                  onClick={() => sorting("address")}
                  style={{ cursor: "pointer" }}
                >
                  Adresa
                </th>
                <th>Telefon</th>
                <th
                  onClick={() => sorting("age")}
                  style={{ cursor: "pointer" }}
                >
                  Varsta
                </th>
                <th style={{ minWidth: 108 }}>Data nasterii</th>
                <th>Sex</th>
                <th className="no-print">Actiuni</th>
              </tr>
            </thead>

            <tbody>
              <tr className="inputs-list">
                <td> {filterMembers(persoane).length}</td>
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
                  <input
                    className="search-input"
                    type="text"
                    value={addressFilter}
                    onChange={(e) => setAddressFilter(e.target.value)}
                  />
                </td>
                <td>
                  <input
                    className="search-phone"
                    type="text"
                    value={telefonFilter}
                    onChange={(e) => setTelefonFilter(e.target.value)}
                  />
                </td>
                <td>
                  <div>
                    {[DropdownButton].map((DropdownType, idx) => (
                      <DropdownType
                        style={{ position: "unset" }}
                        as={ButtonGroup}
                        key={idx}
                        id={`dropdown-button-drop-${idx}`}
                        size="sm"
                        variant="secondary"
                        title={AGE_FILTER_LABEL[ageFilterType]}
                        onSelect={(key) => setAgeFilterType(key)}
                      >
                        <Dropdown.Item eventKey="1">
                          Peste sau egal cu...
                        </Dropdown.Item>
                        <Dropdown.Item eventKey="2">
                          Sub sau egal cu...
                        </Dropdown.Item>
                        <Dropdown.Item eventKey="3">
                          Doar Cu varsta...
                        </Dropdown.Item>
                        <Dropdown.Divider />
                        <Dropdown.Item eventKey="4">
                          Intre varstele...
                        </Dropdown.Item>
                      </DropdownType>
                    ))}
                  </div>
                  <input
                    className="age-input"
                    type="number"
                    value={ageFilter}
                    onChange={(e) => setAgeFilter(e.target.value)}
                  />
                  {ageFilterType == "4" && (
                    <input
                      className="age-input"
                      type="number"
                      value={ageFilterBetween}
                      onChange={(e) => setAgeFilterBetween(e.target.value)}
                    />
                  )}
                </td>
                <td></td>
                <td className="sex-filter">
                  <div className="checkbox-m-f">
                    <Form.Check
                      inline
                      label="M"
                      name="group1"
                      type="checkbox"
                      value={masculin}
                      onChange={(e) => setMasculin(e.target.checked)}
                    />
                    <Form.Check
                      inline
                      label="F"
                      name="group1"
                      type="checkbox"
                      value={feminin}
                      onChange={(e) => setFeminin(e.target.checked)}
                    />
                  </div>
                </td>
                <td></td>
              </tr>
              {persoane
                ? filterMembers(persoane)
                    .sort(sortList)
                    .map((p, index) => (
                      <tr
                        key={p.id}
                        style={{ cursor: "pointer" }}
                        onClick={() => goToPerson(p.id)}
                      >
                        <td>{index + 1}</td>
                        <td>{p.lastName}</td>
                        <td>{p["firstName"]}</td>
                        <td>{p.address}</td>
                        <td>{p.mobilePhone}</td>
                        <td>{calculateAge(p.birthDate)}</td>
                        <td>{formatDate(p.birthDate)}</td>
                        <td>{p.sex ? "M" : "F"}</td>
                        <td className="no-print">
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
        </div>
        <ScrollButton />
      </div>
      <Confirmation
        showModal={idToDelete != null}
        id={idToDelete}
        confirmModal={(id) => deletePerson(id)}
        message="Esti sigur ca vrei sa stergi persoana din baza de date ?"
        hideModal={() => setIdToDelete(null)}
      />
    </div>
  );
}

export default Persoane;
