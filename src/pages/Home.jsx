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
import { ImWhatsapp } from "react-icons/im";
import { BsTelephoneInbound } from "react-icons/bs";
import { HiOutlineMail } from "react-icons/hi";
import { FaChurch, FaUsers, FaChild, FaWater, FaHome } from "react-icons/fa";
import ExternalRequest from "../components/ExternalRequest";
import { useTranslation } from "react-i18next";

const Home = ({ persoane }) => {
  const { t } = useTranslation();
  const [showForm, setShowForm] = useState(false);
  const [showRequest, setShowRequest] = useState(false);
  const navigate = useNavigate();

  const handleShowForm = () => {
    setShowForm(true);
  };
  const handleCloseForm = () => {
    setShowForm(false);
  };
  const handleShowRequest = () => {
    setShowRequest(true);
  };
  const handleCloseRequest = () => {
    setShowRequest(false);
  };

  return (
    <main className="home-container">
      <div className="home-content">
        <div className="glass-panel main-panel">
          <div className="church-header">
            <FaChurch className="church-icon" />
            <h1 className="secretariat_text">SECRETARIAT</h1>
            <h2 className="biserica_text">BISERICA EBEN-EZER CASTELLON</h2>
          </div>
          
          <div className="panels-container">
            {/* Panel de Contacto */}
            <div className="glass-panel info-panel">
              <h3 className="panel-title">
                <strong>CONTACT</strong>
              </h3>
              <div className="contact-info">
                <div className="contact-item">
                  <FaHome className="contact-icon" />
                  <p>Camí de la Donació, 89, 12004 Castellón de la Plana, Castellón</p>
                </div>
                <div className="contact-item">
                  <ImWhatsapp className="contact-icon" />
                  <p>
                    Trimite cauza ta de rugaciune aici:
                    <br /> WhatsApp +34 624 227 214
                  </p>
                </div>
                <div className="contact-item">
                  <BsTelephoneInbound className="contact-icon" />
                  <p>Tel./Fax: 964 37 24 00</p>
                </div>
                <div className="contact-item">
                  <HiOutlineMail className="contact-icon" />
                  <p>biserica_ebenezer@yahoo.es</p>
                </div>
              </div>
            </div>

            {/* Panel de Actualización */}
            <div className="glass-panel info-panel">
              <h3 className="panel-title">
                <strong>ACTUALIZEAZA-TI FISA MEMBRALA</strong>
              </h3>
              <p className="panel-description">
                Completează formularul cu datele care le știi, urcă o poză actuală,
                și acceptă tratatrea datelor personale Conforme a la Ley Orgánica
                3/2018, de 5 de diciembre, de Protección de Datos Personales y
                garantía de los derechos digitales. Ulterior, datele vor fii
                verificate înainte de a actualiza fișa membrală.
              </p>
              <div className="button-container">
                <button className="primary-button" onClick={handleShowForm}>
                  FORMULAR ACTUALIZARE MEMBRU
                </button>
                <button className="secondary-button" onClick={handleShowRequest}>
                  FORMULAR CERERE FISA MEMBRU
                </button>
              </div>
            </div>

            {/* Panel de Estadísticas */}
            <div className="glass-panel info-panel stats-panel">
              <h3 className="panel-title">
                <strong>STATISTICI</strong>
              </h3>
              <div className="stats-container">
                <div className="stat-card">
                  <FaUsers className="stat-icon" />
                  <div className="stat-info">
                    <h4>TOTAL MEMBRII</h4>
                    <p>1043</p>
                  </div>
                </div>
                <div className="stat-card">
                  <FaChild className="stat-icon" />
                  <div className="stat-info">
                    <h4>COPII</h4>
                    <p>387</p>
                  </div>
                </div>
                <div className="stat-card">
                  <FaWater className="stat-icon" />
                  <div className="stat-info">
                    <h4>BOTEZATI</h4>
                    <p>656</p>
                  </div>
                </div>
                <div className="stat-card">
                  <FaHome className="stat-icon" />
                  <div className="stat-info">
                    <h4>TOTAL FAMILII</h4>
                    <p>255</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Modal
        className="custom-modal"
        centered
        style={{ width: "100%", justifyContent: "center" }}
        show={showForm}
        onHide={handleCloseForm}
      >
        <ExternalForm onCloseModal={handleCloseForm} show={showForm} />
      </Modal>
      
      <Modal
        className="custom-modal"
        centered
        style={{ width: "100%", justifyContent: "center" }}
        show={showRequest}
        onHide={handleCloseRequest}
      >
        <ExternalRequest show={showRequest} onCloseModal={handleCloseRequest} />
      </Modal>

      <footer className="home-footer">
        copyright © Media EBEN-EZER 2024 - media.ebenezercastellon@gmail.com
      </footer>
    </main>
  );
};

export default Home;
