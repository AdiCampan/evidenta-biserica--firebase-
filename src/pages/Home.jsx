import { useEffect, useState } from "react";
import "./Home.css";
import { Line, Bar, Pie } from "react-chartjs-2";
import { useGetMembersQuery } from "../services/members";
import { calculateAge, formatDate } from "../utils";
import { Button, Modal } from "react-bootstrap";
import { collection, onSnapshot, query } from "firebase/firestore";
import { firestore } from "../firebase-config";
import CSVUploader from "../components/CSVUploader";
import { useNavigate } from "react-router-dom";
import ExternalForm from "../components/ExternalForm";

const Home = ({ persoane }) => {
  // const [persoane, setPersoane] = useState("");
  const [totalMembri, setTotalMembri] = useState();
  const [nrBarbati, setNrBarbati] = useState();
  const [nrFemei, setNrFemei] = useState();
  const [nrCopii, setNrCopii] = useState();
  const [showUploader, setShowUploader] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [nrMembrii, setNrMembrii] = useState([]);
  const navigate = useNavigate();

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

  const date = new Date();

  // useEffect(() => {
  //   if (persoane.length > 0) {
  //     setTotalMembri(persoane?.filter((p) => p.memberDate).length);
  //     setNrCopii(
  //       persoane?.filter((p) => calculateAge(p.birthDate) < 18).length
  //     );
  //     setNrBarbati(
  //       persoane?.filter(
  //         (p) =>
  //           p.sex === true && p.memberDate && calculateAge(p.birthDate) >= 18
  //       ).length
  //     );
  //     setNrFemei(
  //       persoane?.filter(
  //         (p) =>
  //           p.sex === false && p.memberDate && calculateAge(p.birthDate) >= 18
  //       ).length
  //     );
  //   }
  // }, [persoane]);

  const getYearsFromInterval = (from, to) => {
    const listOfYears = [];
    for (let year = from; year <= to; year++) {
      listOfYears.push(year);
    }
    return listOfYears;
  };

  const getMemberHistoryYears = () => {
    const currentYear = new Date().getFullYear();
    const years = getYearsFromInterval(currentYear - 10, currentYear);
    return years;
  };

  const getMemberHistory = () => {
    if (persoane.length > 0) {
      const membersByYears = [];
      const years = getMemberHistoryYears();
      for (let i = 0; i < years.length; i++) {
        const personsByYear = persoane?.filter((p) => {
          if (
            p.memberDate &&
            p.memberDate?.toDate().getFullYear() <= years[i]
          ) {
            // if (p.leaveDate &&  new Date(p.leaveDate).getFullYear() > years[i]) {
            // 	return true;
            // } else if (!p.leaveDate) {
            return true;
            // }
          }
          return false;
        }).length;
        membersByYears.push(personsByYear);
      }
      return membersByYears;
    }
  };

  const handleShowForm = () => {
    setShowForm(true);
  };
  const handleCloseForm = () => {
    setShowForm(false);
  };

  return (
    <>
      <div className="home_page">
        <div className="secretariat_text">SECRETARIAT</div>
        <div className="biserica_text">BISERICA EBEN-EZER CASTELLON</div>
      </div>
      <div className="charts">
        <div className="info-bar">
          <h3>Biserica Eben-Ezer Castellon</h3>
          <p>
            Adresa: Camí de la Donació, 89, 12004 Castellón de la Plana,
            Castellón
          </p>
          <br />
          <p>Tel./Fax: 964 37 24 00</p>
          <br />
          <Button onClick={handleShowForm}>FORMULAR MEMBRU</Button>

          <p>biserica_ebenezer@yahoo.es</p>
        </div>

        <div className="chart-container">
          {/* {persoane && (
            <Pie
              data={{
                labels: ["Barbați", "Femei", "Copii"],
                datasets: [
                  {
                    data: [nrBarbati, nrFemei, nrCopii],
                    backgroundColor: [
                      "rgba(50, 162, 235, 0.7)",
                      "rgba(255, 99, 132, 0.7)",
                      "rgba(145, 63, 184, 0.7)",
                    ],
                  },
                ],
              }}
              width={150}
              height={150}
              options={{ maintainAspectRatio: true }}
            />
          )}
        </div>
        <div className="chart-conatiner">
          <div className="total-text">
            <h5>
              Total Membrii la{" "}
              {`${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`}
              :
            </h5>{" "}
            <h3>{totalMembri}</h3>
          </div>
          <Line
            datasetIdKey="id345"
            data={{
              labels: getMemberHistoryYears(),
              datasets: [
                {
                  id: 1,
                  label: "Nr.de membri",
                  data: getMemberHistory(),
                  backgroundColor: ["rgba(54, 162, 235, 1.9)"],
                },
              ],
            }}
          /> */}
        </div>
        {showUploader && <CSVUploader />}
      </div>

      <Modal
        className="custom-modal" // Aplica estilos al dialog
        centered
        style={{ width: "100%", justifyContent: "center" }}
        show={showForm}
        onHide={handleCloseForm}
      >
        {/* <Modal.Header
          onHide={handleCloseForm}
          // closeButton
          style={{ display: "flex", width: "100%" }}
          // style={{ display: "flex", justifyContent: "center" }}
        ></Modal.Header> */}
        <ExternalForm onCloseModal={handleCloseForm} show={showForm} />
      </Modal>

      <footer className="footer">copyright © Media EBEN-EZER 2022 </footer>
    </>
  );
};

export default Home;
