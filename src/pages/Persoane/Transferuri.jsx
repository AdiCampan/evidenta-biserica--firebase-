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
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
          <div>
            <Button
              variant="primary"
              onClick={() => setShowModal(true)}
            >
              Adauga un TRANSFER
            </Button>
          </div>
        </div>
        <PaginatedTable
           data={transfers.map((transfer, index) => {
             const person = persoaneMap[transfer?.owner];
             if (!person) return null; // Ignorar si la persona no existe

             return {
               ...transfer,
               index: index + 1,
               personName: (person.lastName || "").trim() + " " + (person.firstName || "").trim(),
               person: person,
               transferDirection: intrati.includes(transfer.type) ? "din" : "in",
               churchName: transfer.churchTransfer,
               dateFormatted: formatDate(transfer.date),
               age: calculateAge(person.birthDate),
               isIncoming: intrati.includes(transfer.type)
             };
           }).filter(Boolean)}
          columns={[
             { key: 'index', label: '#', sortable: false },
             { key: 'personName', label: t('table.fullName') || 'Nume si Prenume', sortable: true },
             { 
               key: 'transferDirection', 
               label: 'Transferat', 
               sortable: true,
               render: (row) => `${row.transferDirection} ${row.churchName}`
             },
             { key: 'dateFormatted', label: 'Data transferului', sortable: true },
             { key: 'docNumber', label: 'Act de transfer', sortable: true },
             { 
               key: 'details', 
               label: 'Detalii', 
               sortable: true,
               render: (row) => (
                 <div style={{ wordBreak: "break-all", maxWidth: "200px" }}>
                   {row.details}
                 </div>
               )
             },
             { key: 'age', label: 'Varsta', sortable: true },
             { 
               key: 'actions', 
               label: t('table.actions') || 'Actiuni', 
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
               )
             }
           ]}
           onRowClick={() => {}}
           className="transfers-table"
           striped={false}
           rowClassName={(row) => row.isIncoming ? "incoming-transfer" : "outgoing-transfer"}
          defaultPageSize={10}
          bordered
          hover
          size="sm"
          variant="light"
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

// import { useState, useEffect } from "react";
// import Table from "react-bootstrap/Table";
// import { Button, Card, FormControl } from "react-bootstrap";
// import { FaTrash, FaSort } from "react-icons/fa";
// import AddTransferModal from "./AddTransferModal";
// import { calculateAge, formatDate } from "../../utils";
// import {
//   collection,
//   deleteDoc,
//   doc,
//   onSnapshot,
//   query,
// } from "firebase/firestore";
// import { firestore } from "../../firebase-config";
// import Confirmation from "../../Confirmation";
// import ScrollButton from "../../ScrollButton";
// import "./Transferuri.scss";
// import { FaSortUp, FaSortDown } from "react-icons/fa";

// const Transferuri = ({ persoane }) => {
//   const [transfers, setTransfers] = useState([]);
//   const [showModal, setShowModal] = useState(false);
//   const [idToDelete, setIdToDelete] = useState(null);
//   const [sortOrder, setSortOrder] = useState("asc"); // Estado para controlar el orden (ascendente/descendente)
//   const [sortedTransfers, setSortedTransfers] = useState([]); // Estado para los transfers ordenados
//   const [sortByDateAsc, setSortByDateAsc] = useState(true);

//   // Crear un mapa de personas para acceso rápido por ID
//   const persoaneMap = persoane?.reduce((map, person) => {
//     map[person.id] = person;
//     return map;
//   }, {});

//   // Obtener la lista de transfers desde Firestore
//   const q = query(collection(firestore, "transfers"));
//   useEffect(() => {
//     const unsubscribe = onSnapshot(q, (querySnapshot) => {
//       const tmpArray = [];
//       querySnapshot.forEach((doc) => {
//         const childKey = doc.id;
//         const childData = doc.data();
//         tmpArray.push({ id: childKey, ...childData });
//       });
//       setTransfers(tmpArray);
//     });

//     return () => unsubscribe();
//   }, [persoane, showModal]);

//   useEffect(() => {
//     // Ordenar los transfers cada vez que cambie el orden o los datos
//     sortTransfers();
//   }, [transfers, sortOrder]);

//   // Función para alternar entre orden ascendente y descendente
//   const toggleSortOrder = () => {
//     setSortOrder((prevOrder) => (prevOrder === "asc" ? "desc" : "asc"));
//   };

//   // Función para ordenar los transfers por "Nume și Prenume"
//   const sortTransfers = () => {
//     const sorted = [...transfers].sort((a, b) => {
//       const personA = persoaneMap[a.owner];
//       const personB = persoaneMap[b.owner];

//       if (!personA || !personB) return 0;

//       const fullNameA =
//         `${personA.lastName} ${personA.firstName}`.toLowerCase();
//       const fullNameB =
//         `${personB.lastName} ${personB.firstName}`.toLowerCase();

//       if (sortOrder === "asc") {
//         return fullNameA.localeCompare(fullNameB);
//       } else {
//         return fullNameB.localeCompare(fullNameA);
//       }
//     });

//     setSortedTransfers(sorted);
//   };

//   const addTransfer = (transfer) => {
//     const transfersActualizados = [transfer, ...transfers];
//     setTransfers(transfersActualizados);
//   };

//   const showDeleteModal = (personId) => {
//     setIdToDelete(personId);
//   };

//   const deleteTransfer = async (id) => {
//     await deleteDoc(doc(firestore, "transfers", id));
//     setIdToDelete(null);
//   };

//   const intrati = ["baptise", "transferFrom"];

//   // Función para ordenar por fecha
//   const sortByDate = () => {
//     const sorted = [...transfers].sort((a, b) => {
//       const dateA = new Date(a.date);
//       const dateB = new Date(b.date);
//       return sortByDateAsc ? dateA - dateB : dateB - dateA;
//     });
//     setSortedTransfers(sorted); // Actualizar sortedTransfers en lugar de transfers
//     setSortByDateAsc(!sortByDateAsc); // Alternar entre ascendente y descendente
//   };

//   return (
//     <>
//       <Card style={{ position: "inherit" }}>
//         <Table striped bordered hover size="sm" className="table-resizable">
//           <thead className="head-list">
//             <tr>
//               <th>#</th>
//               <th onClick={toggleSortOrder} style={{ cursor: "pointer" }}>
//                 Nume si Prenume <FaSort />{" "}
//                 {/* Icono para indicar que se puede ordenar */}
//               </th>
//               <th>
//                 Transferat
//                 <Button
//                   variant="primary"
//                   style={{ marginLeft: "40px" }}
//                   onClick={() => setShowModal(true)}
//                 >
//                   Adauga un TRANSFER
//                 </Button>
//               </th>
//               <th onClick={sortByDate} style={{ cursor: "pointer" }}>
//                 Data transferului{" "}
//                 {sortByDateAsc ? <FaSortUp /> : <FaSortDown />}
//               </th>
//               <th>Act de transfer</th>
//               <th>Detalii</th>
//               <th>Varsta</th>
//               <th>Actiuni</th>
//             </tr>
//           </thead>
//           <tbody>
//             {sortedTransfers.map((transfer, index) => {
//               const person = persoaneMap[transfer?.owner];
//               if (!person) return null; // Ignorar si la persona no existe

//               return (
//                 <tr
//                   key={index}
//                   style={{
//                     backgroundColor: intrati.includes(transfer?.type)
//                       ? "#00c90057"
//                       : "#ff000021",
//                   }}
//                 >
//                   <td>{index + 1}</td>
//                   <td>
//                     {person.lastName} {person.firstName}
//                   </td>
//                   <td>
//                     {intrati.includes(transfer.type) ? "din" : "in"}{" "}
//                     {transfer.churchTransfer}
//                   </td>
//                   <td>{formatDate(transfer.date)}</td>
//                   <td>{transfer.docNumber}</td>
//                   <td style={{ wordBreak: "break-all", maxWidth: "200px" }}>
//                     {transfer.details}
//                   </td>
//                   <td>{calculateAge(person.birthDate)}</td>
//                   <td>
//                     <FaTrash
//                       style={{ cursor: "pointer" }}
//                       onClick={() => showDeleteModal(transfer?.id)}
//                     />
//                   </td>
//                 </tr>
//               );
//             })}
//           </tbody>
//         </Table>
//         <ScrollButton />
//         <AddTransferModal
//           persoane={persoane}
//           onAddTransfer={addTransfer}
//           show={showModal}
//           onClose={() => setShowModal(false)}
//         />
//       </Card>
//       <Confirmation
//         showModal={idToDelete != null}
//         id={idToDelete}
//         confirmModal={(id) => deleteTransfer(id)}
//         message="Esti sigur ca vrei sa stergi transferul din baza de date ?"
//         hideModal={() => setIdToDelete(null)}
//       />
//     </>
//   );
// };

// export default Transferuri;
