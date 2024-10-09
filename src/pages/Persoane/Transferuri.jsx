import { useState, useEffect } from "react";
import Table from "react-bootstrap/Table";
import { Button, Card, FormControl } from "react-bootstrap";
import Col from "react-bootstrap/Col";
import InputGroup from "react-bootstrap/InputGroup";
import { useGetMembersQuery } from "../../services/members";
import AddTransferModal from "./AddTransferModal";
import { calculateAge, formatDate } from "../../utils";
import { FaTrash, FaRegEdit } from "react-icons/fa";
import {
  useGetTransfersQuery,
  useDelTransferMutation,
} from "../../services/transfers";
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  query,
} from "firebase/firestore";
import { firestore } from "../../firebase-config";
import Confirmation from "../../Confirmation";
import ScrollButton from "../../ScrollButton";
import { GoPlusCircle } from "react-icons/go";

const Transferuri = ({ persoane }) => {
  const [transfers, setTransfers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [idToDelete, setIdToDelete] = useState(null);

  //  ----------------  get list of all transfers fron Firestore dataBase --------  //
  const q = query(collection(firestore, "transfers"));
  useEffect(() => {
    onSnapshot(q, (querySnapshot) => {
      const tmpArray = [];
      querySnapshot.forEach((doc) => {
        const childKey = doc.id;
        const childData = doc.data();
        tmpArray.push({ id: childKey, ...childData });
        setTransfers(tmpArray);
      });
    });
  }, [persoane, showModal]);

  const addTransfer = (transfer) => {
    const transfersActualizados = [transfer, ...transfers];
    setTransfers(transfersActualizados);
  };

  function deleteTransfer(id) {
    delTransfer(id);

    setIdToDelete(null);
  }

  const showDeleteModal = (personId, ev) => {
    setIdToDelete(personId);
    // ev.stopPropagation();
  };

  const delTransfer = async (id) => {
    await deleteDoc(doc(firestore, "transfers", id));
  };

  const intrati = ["baptise", "transferFrom"];

  return (
    <>
      <Card style={{ position: "inherit" }}>
        <Table striped bordered hover size="sm">
          <thead className="head-list">
            <tr>
              <th>#</th>
              <th>Nume si Prenume</th>
              <th>
                Transferat
                <Button
                  variant="primary"
                  style={{
                    marginLeft: "40px",
                  }}
                  onClick={() => setShowModal(true)}
                >
                  Adauga un TRANSFER
                </Button>
              </th>
              <th>Data transferului</th>
              <th>Act de transfer</th>
              <th>Detalii</th>
              <th>Varsta</th>
            </tr>
          </thead>
          <>
            <tbody>
              {transfers &&
                persoane &&
                transfers.map((transfer, index) => (
                  <tr
                    key={index}
                    style={{
                      backgroundColor: intrati.includes(transfer?.type)
                        ? "#00c90057"
                        : "#ff000021",
                    }}
                  >
                    <td>{index + 1}</td>
                    <td>
                      {
                        persoane?.filter((p) => p?.id === transfer?.owner)[0]
                          ?.lastName
                      }{" "}
                      {
                        persoane?.filter((p) => p?.id === transfer?.owner)[0]
                          ?.firstName
                      }
                    </td>
                    <td>
                      {intrati.includes(transfer.type) ? "din" : "in"}{" "}
                      {transfer.churchTransfer}
                    </td>
                    <td>{formatDate(transfer.date)}</td>
                    <td>{transfer.docNumber}</td>
                    <td style={{ wordBreak: "break-all", maxWidth: "200px" }}>
                      {transfer.details}
                    </td>
                    <td>
                      {calculateAge(
                        persoane?.filter((p) => p?.id === transfer?.owner)[0]
                          ?.birthDate
                      )}
                    </td>
                    <td>
                      <FaTrash
                        style={{ cursor: "pointer" }}
                        onClick={() => showDeleteModal(transfer?.id)}
                      />
                    </td>
                  </tr>
                ))}
            </tbody>
          </>
        </Table>
        <ScrollButton />
        {/* <Button>
          <GoPlusCircle
            style={{
              position: "fixed",
              width: "20%",
              right: "50%",
              bottom: "590px",
              height: "50px",
              fontSize: "3rem",
              zIndex: "1",
              cursor: "pointer",
              color: "#0060ac",
            }}
          />
        </Button> */}
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
    </>
  );
};

export default Transferuri;
