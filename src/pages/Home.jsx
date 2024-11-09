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
          <h3>CONTACT</h3>
          <p>
            Adresa: Camí de la Donació, 89, 12004 Castellón de la Plana,
            Castellón
          </p>
          <br />
          <p>Tel./Fax: 964 37 24 00</p>
          <br />
          <Button onClick={handleShowForm}>FORMULAR ACTUALIZARE MEMBRU</Button>

          <p>biserica_ebenezer@yahoo.es</p>
        </div>

        <div className="chart-container">
          <div className="info-cards">
            <h6 style={{ marginTop: "10px" }}>TOTAL MEMBRII</h6>
            <h4 style={{ fontWeight: "bolder" }}>1043</h4>
          </div>
          <div className="info-cards">
            <h6 style={{ marginTop: "10px" }}>COPII</h6>
            <h4 style={{ fontWeight: "bolder" }}>320</h4>
          </div>
          <div className="info-cards">
            <h6 style={{ marginTop: "10px" }}>BOTEZATI</h6>
            <h4 style={{ fontWeight: "bolder" }}>650</h4>
          </div>
          <div className="info-cards">
            <h6 style={{ marginTop: "10px" }}>TOTAL FAMILII</h6>
            <h4 style={{ fontWeight: "bolder" }}>255</h4>
          </div>
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
        <ExternalForm onCloseModal={handleCloseForm} show={showForm} />
      </Modal>

      <footer className="footer">copyright © Media EBEN-EZER 2024 </footer>
    </>
  );
};

export default Home;
