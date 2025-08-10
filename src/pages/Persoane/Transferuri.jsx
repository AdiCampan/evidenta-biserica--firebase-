import { useState, useEffect } from "react";
import { Button, Card } from "react-bootstrap";
import { FaTrash, FaRegEdit } from "react-icons/fa";
import AddTransferModal from "./AddTransferModal";
import { calculateAge, formatDate } from "../../utils";
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
} from "firebase/firestore";
import { firestore } from "../../firebase-config";
import Confirmation from "../../Confirmation";
import ScrollButton from "../../ScrollButton";
import PaginatedTable from "../../components/PaginatedTable";
import { useTranslation } from "react-i18next";
import "./Transferuri.scss";

const Transferuri = ({ persoane }) => {
  const { t } = useTranslation();
  const [transfers, setTransfers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [idToDelete, setIdToDelete] = useState(null);

  // Crear un mapa de personas para acceso rápido por ID
  const persoaneMap = persoane?.reduce((map, person) => {
    map[person.id] = person;
    return map;
  }, {});

  // Obtener la lista de transfers desde Firestore
  const q = query(collection(firestore, "transfers"));
  useEffect(() => {
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const tmpArray = [];
      querySnapshot.forEach((doc) => {
        const childKey = doc.id;
        const childData = doc.data();
        tmpArray.push({ id: childKey, ...childData });
      });
      setTransfers(tmpArray);
    });

    return () => unsubscribe();
  }, [persoane, showModal]);

  const addTransfer = (transfer) => {
    const transfersActualizados = [transfer, ...transfers];
    setTransfers(transfersActualizados);
  };

  const showDeleteModal = (personId, ev) => {
    setIdToDelete(personId);
    if (ev) ev.stopPropagation();
  };

  const deleteTransfer = async (id) => {
    await deleteDoc(doc(firestore, "transfers", id));
    setIdToDelete(null);
  };

  const intrati = ["baptise", "transferFrom"];

  return (
    <div>
      <Card style={{ padding: "1.5rem" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "10px",
          }}
        >
          <div>
            <Button variant="primary" onClick={() => setShowModal(true)}>
              Adauga un TRANSFER
            </Button>
          </div>
        </div>
        <PaginatedTable
          data={transfers
            .map((transfer, index) => {
              const person = persoaneMap[transfer?.owner];
              if (!person) return null; // Ignorar si la persona no existe

              return {
                ...transfer,
                index: index + 1,
                personName:
                  (person.lastName || "").trim() +
                  " " +
                  (person.firstName || "").trim(),
                person: person,
                transferDirection: intrati.includes(transfer.type)
                  ? "din"
                  : "in",
                churchName: transfer.churchTransfer,
                dateFormatted: formatDate(transfer.date),
                transferDate: transfer.date,
                age: calculateAge(person.birthDate),
                isIncoming: intrati.includes(transfer.type),
              };
            })
            .filter(Boolean)}
          columns={[
            { key: "index", label: "#", sortable: false, width: "5%" },
            {
              key: "personName",
              label: t("table.fullName") || "Nume si Prenume",
              sortable: true,
              width: "20%",
            },
            {
              key: "transferDirection",
              label: "Transferat",
              sortable: true,
              render: (row) => `${row.transferDirection} ${row.churchName}`,
              width: "14%",
            },
            {
              key: "dateFormatted",
              label: "Data transferului",
              sortable: true,
              width: "10%",
            },
            {
              key: "docNumber",
              label: "Act de transfer",
              sortable: true,
              width: "11%",
            },
            {
              key: "details",
              label: "Detalii",
              sortable: true,
              render: (row) => (
                <div style={{ wordBreak: "break-all", maxWidth: "200px" }}>
                  {row.details}
                </div>
              ),
              width: "30%",
            },
            { key: "age", label: "Varsta", sortable: true, width: "7%" },
            {
              key: "actions",
              label: t("table.actions") || "Actiuni",
              sortable: false,
              render: (row) => (
                <div className="d-flex">
                  <Button
                    variant="outline-danger"
                    onClick={(ev) => showDeleteModal(row.id, ev)}
                  >
                    <FaTrash />
                  </Button>
                </div>
              ),
              width: "7%",
            },
          ]}
          onRowClick={() => {}}
          className="transfers-table"
          striped={false}
          rowClassName={(row) =>
            row.isIncoming ? "incoming-transfer" : "outgoing-transfer"
          }
          defaultPageSize={10}
          bordered
          hover
          size="sm"
          variant="light"
          initialSort={{ key: "transferDate", direction: "desc" }}
        />
        <ScrollButton />
        <AddTransferModal
          persoane={persoane}
          onAddTransfer={addTransfer}
          show={showModal}
          onClose={() => setShowModal(false)}
        />
      </Card>
      <Confirmation
        showModal={idToDelete != null}
        id={idToDelete}
        confirmModal={(id) => deleteTransfer(id)}
        message="Esti sigur ca vrei sa stergi transferul din baza de date ?"
        hideModal={() => setIdToDelete(null)}
      />
    </div>
  );
};

export default Transferuri;
