import { useState } from "react";
import { useNavigate } from "react-router-dom";
import PaginatedTable from "../../components/PaginatedTable";
import { useTranslation } from "react-i18next";
import {
  filterByText,
  formatDate,
  filterByAgeGreater,
  filterByAgeSmaller,
  calculateAge,
} from "../../utils";
import "./Boteze.scss";
import Modal from "react-bootstrap/Modal";

function Boteze({ persoane }) {
  if (!persoane || persoane.length === 0) {
    return <div>Loading...</div>; // O un mensaje de estado inicial
  }
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [firstNameFilter, setFirstNameFilter] = useState("");
  const [lastNameFilter, setLastNameFilter] = useState("");
  const [ageFilterGreater, setAgeFilterGreater] = useState("");
  const [ageFilterSmaller, setAgeFilterSmaller] = useState("");
  const [addressFilter, setAddressFilter] = useState("");
  const [telefonFilter, setTelefonFilter] = useState("");
  const [listByDateBaptized, setListByDateBaptized] = useState([]);
  const [baptisedBy, setBaptisedBy] = useState();
  const [baptisedDate, setBaptisedDate] = useState();
  const [showModal, setShowModal] = useState(false);

  const handleClose = () => setShowModal(false);

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
      const regex = /\beben\b.*\bezer\b|\bezer\b.*\beben\b/i;
      filteredMembers = filteredMembers.filter((member) =>
        regex.test(member.baptisePlace)
      );

      const listBaptist = filteredMembers.reduce((boteze, item) => {
        if (
          !boteze.find(
            (botez) => botez.baptiseDate.seconds === item.baptiseDate.seconds
          )
        ) {
          boteze.push(item);
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
    let listaBotezati = persoane.filter(
      (data) => data?.baptiseDate?.seconds === dataBotez.seconds
    );
    setShowModal(true);
    setBaptisedDate(dataBotez);
    setBaptisedBy(baptisedBy);
    setListByDateBaptized(listaBotezati);
  };
  // console.log("lista Botezati", listByDateBaptized);

  return (
    <>
      <div className="pagina-boteze">
        <div className="boteze">
          <div className="title">
            <h3>BOTEZE în EBEN EZER</h3>
          </div>
          <PaginatedTable
            data={
              persoane
                ? filterMembers(persoane).map((p, index) => ({
                    ...p,
                    index: index + 1,
                  }))
                : []
            }
            columns={[
              { key: "index", label: "#", sortable: false, width: "5%" },
              {
                key: "baptiseDate",
                label: t("table.baptismDate") || "Data Botezului",
                sortable: true,
                render: (row) => formatDate(row.baptiseDate),
                width: "15%",
              },
              {
                key: "baptisedBy",
                label: t("table.baptismMinisters") || "Slujitori Botez",
                sortable: true,
              },
              {
                key: "invitedMinisters",
                label: t("table.invitedMinisters") || "Slujitori Invitati",
                sortable: true,
              },
            ]}
            onRowClick={(row) => listBaptized(row.baptiseDate, row.baptisedBy)}
            defaultPageSize={10}
            striped
            bordered
            hover
            size="sm"
            variant="light"
          />
        </div>
        <Modal
          style={{ width: "100%" }}
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
            <Modal.Title style={{ marginLeft: "20px" }}>
              <div className="Modal-title">
                <h3> LISTA BOTEZATI</h3>
              </div>
              {baptisedDate && <h6>{` Data: ${formatDate(baptisedDate)}`}</h6>}
              {baptisedBy && <div>{`Slujitori: ${baptisedBy}`} </div>}
            </Modal.Title>
          </Modal.Header>
          <PaginatedTable
            data={
              listByDateBaptized
                ? listByDateBaptized.map((p, index) => ({
                    ...p,
                    index: index + 1,
                    age: calculateAge(p.birthDate),
                  }))
                : []
            }
            columns={[
              { key: "index", label: "#", sortable: false },
              {
                key: "lastName",
                label: t("table.lastName") || "Nume",
                sortable: true,
              },
              {
                key: "firstName",
                label: t("table.firstName") || "Prenume",
                sortable: true,
              },
              {
                key: "birthDate",
                label: t("table.birthDate") || "D. Nasterii",
                sortable: true,
                render: (row) => formatDate(row.birthDate),
              },
              { key: "age", label: t("table.age") || "Varsta", sortable: true },
              {
                key: "sex",
                label: t("table.sex") || "Gen",
                sortable: true,
                render: (row) => (row.sex ? "M" : "F"),
              },
              {
                key: "details",
                label: t("table.details") || "Detalii",
                sortable: true,
              },
            ]}
            onRowClick={(row) => goToPerson(row.id)}
            defaultPageSize={10}
            striped
            bordered
            hover
            size="sm"
            variant="light"
            className="baptism-list-table"
          />
        </Modal>
      </div>
    </>
  );
}

export default Boteze;
