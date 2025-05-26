import { useState, useEffect } from "react";
import Button from "react-bootstrap/Button";
import { useNavigate } from "react-router-dom";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Radio from "@mui/material/Radio";
import { useTranslation } from "react-i18next";
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
import ScrollButton from "../../ScrollButton";
import PaginatedTable from "../../components/PaginatedTable";

function Membrii({ persoane }) {
  // Función para mostrar el modal de confirmación de eliminación
  const [idToDelete, setIdToDelete] = useState(null);

  const showDeleteModal = (id, event) => {
    event.stopPropagation();
    setIdToDelete(id);
  };

  const deletePerson = (id) => {
    // Implementar la lógica de eliminación aquí
    console.log(`Eliminar persona con ID: ${id}`);
    setIdToDelete(null);
  };
  const navigate = useNavigate();

  const [firstNameFilter, setFirstNameFilter] = useState("");
  const [lastNameFilter, setLastNameFilter] = useState("");
  const [ageFilterGreater, setAgeFilterGreater] = useState("");
  const [ageFilterSmaller, setAgeFilterSmaller] = useState("");
  const [memberDateFilter, setMemberDateFilter] = useState({
    field: null,
    direction: null,
  });

  const [addressFilter, setAddressFilter] = useState("");
  const [telefonFilter, setTelefonFilter] = useState("");

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

    return filteredMembers.filter(
      (member) => member.memberDate && !member.leaveDate
    );
  }

  const goToPerson = (id) => {
    navigate(`/persoane/${id}`, { state: { persons: persoane } });
  };

  const sortList = (a, b) => {
    if (!memberDateFilter.field) {
      return 1;
    }
    // ascendent
    if (memberDateFilter.direction === "asc") {
      if (a[memberDateFilter.field] > b[memberDateFilter.field]) {
        return 1;
      }
      return -1;
      // descendent
    } else {
      if (a[memberDateFilter.field] < b[memberDateFilter.field]) {
        return 1;
      }
      return -1;
    }
  };

  const sorting = (field) => {
    let newDirection = "asc";

    // 1. nu e setat deloc, deci trebuie pus ascendent
    if (memberDateFilter.direction === null) {
      newDirection = "asc";
      // 2. e setat ascendent, deci trebuie pus descendent
    } else if (memberDateFilter.direction === "asc") {
      newDirection = "desc";
      // 3 e setat descendent, deci trebuie pus ascendent
    } else {
      newDirection = "asc";
    }

    setMemberDateFilter({
      field: field,
      direction: newDirection,
    });
  };

  const { t } = useTranslation();

  return (
    <div className="page-membrii">
      {/* <div className="filters-container">
        <div className="filters-title">
          {t("table.filter")} {t("table.search")}
        </div>
        <div className="barra-buttons">
          <div className="age-input" data-label={`${t("table.min-age")}`}>
            <input
              placeholder=">0"
              type="text"
              value={ageFilterGreater}
              onChange={(e) => setAgeFilterGreater(e.target.value)}
            />
          </div>

          <div className="age-input" data-label={`${t("table.max-age")}`}>
            <input
              placeholder="<99"
              type="text"
              value={ageFilterSmaller}
              onChange={(e) => setAgeFilterSmaller(e.target.value)}
            />
          </div>

          <div className="search-input">
            <input
              placeholder={t("table.lastName")}
              type="text"
              value={lastNameFilter}
              onChange={(e) => setLastNameFilter(e.target.value)}
              aria-label={`${t("table.filter")} ${t("table.lastName")}`}
            />
          </div>

          <div className="search-input">
            <input
              placeholder={t("table.firstName")}
              type="text"
              value={firstNameFilter}
              onChange={(e) => setFirstNameFilter(e.target.value)}
              aria-label={`${t("table.filter")} ${t("table.firstName")}`}
            />
          </div>
        </div>
      </div> */}

      {/* Implementación de PaginatedTable */}
      <PaginatedTable
        data={
          persoane
            ? filterMembers(persoane)
                .sort(sortList)
                .map((p, index) => ({
                  ...p,
                  index: index + 1,
                  age: calculateAge(p.birthDate),
                }))
            : []
        }
        columns={[
          { key: "index", label: "#", sortable: false, width: "5%" },
          { key: "lastName", label: "Nume", sortable: true },
          { key: "firstName", label: "Prenume", sortable: true },
          {
            key: "memberDate",
            label: "Data membru",
            sortable: true,
            render: (row) => formatDate(row.memberDate),
            width: "10%",
          },
          {
            key: "baptiseDate",
            label: "Data Botezului",
            sortable: true,
            render: (row) => formatDate(row.baptiseDate),
            width: "10%",
          },
          { key: "baptisePlace", label: "Locul Botezului", sortable: true },
          { key: "age", label: "Varsta", sortable: true, width: "8%" },
          {
            key: "birthDate",
            label: "Data nasterii",
            sortable: true,
            render: (row) => formatDate(row.birthDate),
            width: "10%",
          },
          {
            key: "sex",
            label: "Gen",
            sortable: true,
            render: (row) => (row.sex ? "M" : "F"),
            width: "6%",
          },
          {
            key: "actions",
            label: "Actiuni",
            sortable: false,
            render: (row) => (
              <Button
                variant="primary"
                onClick={(event) => {
                  event.stopPropagation();
                  showDeleteModal(row.id, event);
                }}
              >
                Sterge
              </Button>
            ),
            width: "9%",
          },
        ]}
        onRowClick={(row) => goToPerson(row.id)}
        defaultPageSize={10}
        striped
        bordered
        hover
        size="sm"
        variant="light"
      />
      <ScrollButton />
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
export default Membrii;

const Confirmation = ({ showModal, id, confirmModal, message, hideModal }) => {
  return (
    showModal && (
      <div className="modal-overlay">
        <div className="modal-content">
          <h3>{message}</h3>
          <div className="modal-buttons">
            <button onClick={() => confirmModal(id)}>Confirmar</button>
            <button onClick={hideModal}>Cancelar</button>
          </div>
        </div>
      </div>
    )
  );
};
