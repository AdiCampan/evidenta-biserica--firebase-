import React, { useState, useEffect, useRef } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../../firebase-config";
import { useAuth } from "../../Context";
import { useTranslation } from "react-i18next";
import i18n from "i18next";
import {
  FaUserCircle,
  FaSignOutAlt,
  FaBars,
  FaTimes,
  FaGlobe,
} from "react-icons/fa";
import "./Navbar.css";

const Navbar = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const userMenuRef = useRef(null);
  const langMenuRef = useRef(null);

  // Cerrar menús al cambiar de ruta
  useEffect(() => {
    setMenuOpen(false);
    setUserMenuOpen(false);
    setLangMenuOpen(false);
  }, [navigate]);

  // Cerrar menús al hacer clic fuera

  useEffect(() => {
    const handleMouseDownOutside = (event) => {
      if (
        menuOpen &&
        !event.target.closest(".navbar-menu") &&
        !event.target.closest(".menu-toggle")
      ) {
        setMenuOpen(false);
      }
      if (
        userMenuOpen &&
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target) &&
        !event.target.closest(".user-menu-toggle")
      ) {
        setUserMenuOpen(false);
      }
      if (
        langMenuOpen &&
        langMenuRef.current &&
        !langMenuRef.current.contains(event.target) &&
        !event.target.closest(".language-button")
      ) {
        setLangMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleMouseDownOutside);
    return () => {
      document.removeEventListener("mousedown", handleMouseDownOutside);
    };
  }, [menuOpen, userMenuOpen, langMenuOpen]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  const toggleMenu = () => setMenuOpen(!menuOpen);
  const toggleUserMenu = () => setUserMenuOpen(!userMenuOpen);
  const toggleLangMenu = () => setLangMenuOpen(!langMenuOpen);

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    setLangMenuOpen(false);
  };
  console.log("menuOpen", menuOpen);
  const currentLanguage = i18n.language;

  return (
    <header className="navbar-container">
      <div className="navbar-content">
        <div className="navbar-brand">
          <Link to="/" className="logo-link">
            <img
              src="/images/logo-round.png"
              alt="Logo"
              className="navbar-logo"
            />
            <span className="navbar-title">Evidenta Biserica</span>
          </Link>
        </div>

        {/* Botón de menú móvil */}
        <button
          className="menu-toggle"
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          {menuOpen ? <FaTimes /> : <FaBars />}
        </button>

        {/* Menú de navegación */}
        <nav className={`navbar-menu ${menuOpen ? "active" : ""}`}>
          <NavLink to="/" end className={"nav-link"}>
            <span>{t("nav.home")}</span>
          </NavLink>

          {currentUser && (
            <>
              <NavLink
                to="/grafice"
                end
                className={({ isActive }) =>
                  isActive ? "nav-link active" : "nav-link"
                }
              >
                <span>{t("nav.charts")}</span>
              </NavLink>

              <NavLink
                to="/persoane"
                end
                className={({ isActive }) =>
                  isActive ? "nav-link active" : "nav-link"
                }
              >
                <span>{t("nav.people")}</span>
              </NavLink>

              <NavLink
                to="/persoane/membrii"
                end
                className={({ isActive }) =>
                  isActive ? "nav-link active" : "nav-link"
                }
              >
                <span>{t("nav.members")}</span>
              </NavLink>

              <NavLink
                to="/persoane/boteze"
                end
                className={({ isActive }) =>
                  isActive ? "nav-link active" : "nav-link"
                }
              >
                <span>{t("nav.baptisms")}</span>
              </NavLink>

              <NavLink
                to="/persoane/cazuri-speciale"
                end
                className={({ isActive }) =>
                  isActive ? "nav-link active" : "nav-link"
                }
              >
                <span>{t("nav.specialCases")}</span>
              </NavLink>

              <NavLink
                to="/persoane/transferuri"
                end
                className={({ isActive }) =>
                  isActive ? "nav-link active" : "nav-link"
                }
              >
                <span>{t("nav.transfers")}</span>
              </NavLink>

              <NavLink
                to="/persoane/archive"
                end
                className={({ isActive }) =>
                  isActive ? "nav-link active" : "nav-link"
                }
              >
                <span>{t("nav.archive")}</span>
              </NavLink>
            </>
          )}
        </nav>

        {/* Selector de idioma y menú de usuario */}
        <div className="navbar-actions">
          <div className="language-selector">
            <button
              className="language-button"
              onClick={toggleLangMenu}
              aria-label="Change language"
            >
              <FaGlobe />
              <span>{currentLanguage.toUpperCase()}</span>
            </button>

            <div
              ref={langMenuRef}
              className={`language-options ${langMenuOpen ? "active" : ""}`}
            >
              <button
                className={`language-option ${
                  currentLanguage === "es" ? "active" : ""
                }`}
                onClick={() => changeLanguage("es")}
              >
                ES
              </button>
              <button
                className={`language-option ${
                  currentLanguage === "ro" ? "active" : ""
                }`}
                onClick={() => changeLanguage("ro")}
              >
                RO
              </button>
            </div>
          </div>

          {currentUser ? (
            <div className="user-menu">
              <button
                className="user-menu-toggle"
                onClick={toggleUserMenu}
                aria-label="User menu"
              >
                <FaUserCircle className="user-icon" />
              </button>

              <div
                ref={userMenuRef}
                className={`user-dropdown ${userMenuOpen ? "active" : ""}`}
              >
                <div className="user-email">{currentUser.email}</div>
                <button className="dropdown-link" onClick={handleLogout}>
                  <FaSignOutAlt className="dropdown-icon" />
                  <span>{t("nav.logout")}</span>
                </button>
              </div>
            </div>
          ) : (
            <NavLink to="/login" className="nav-link active">
              <span>{t("nav.login")}</span>
            </NavLink>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
