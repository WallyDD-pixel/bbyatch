import React, { useEffect, useState, useRef } from "react";
import { useTranslation } from 'react-i18next';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import { signOut, onAuthStateChanged } from "firebase/auth";
import {
  FaUser,
  FaChevronDown,
  FaUserCircle,
  FaQuestionCircle,
  FaSignOutAlt,
  FaClipboardList
} from "react-icons/fa";
import logo from "../logo.svg";

export default function NavBar() {
  const { t, i18n } = useTranslation();
  const [user, setUser] = useState(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileMenuRef = useRef();
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsubscribe();
  }, []);

  // Fermer le dropdown si clic en dehors
  useEffect(() => {
    function handleClickOutside(event) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="navbar navbar-expand-md navbar-light bg-white shadow-sm fixed-top py-2" style={{top: 24, left: "50%", transform: "translateX(-50%)", width: "90vw", borderRadius: 40, maxWidth: 900, zIndex: 1000, border: '2px solid black'}}>
      <div className="container-fluid">
        {/* Boutons FR/EN retirés, gérés ailleurs */}
        <a className="navbar-brand d-none d-md-block" href="#" onClick={() => navigate('/')}>
          {/* Logo pour la version bureau */}
          <img src={logo} alt="BBYATCH logo" style={{ height: 40, cursor: "pointer" }} />
        </a>
        {/* Logo centré en version mobile uniquement */}
        <div className="w-100 d-flex d-md-none justify-content-center align-items-center" style={{ position: 'absolute', left: 0, right: 0, top: 0, height: '100%', pointerEvents: 'none', zIndex: 2, justifyContent: 'center', alignItems: 'center' }}>
          <span style={{ fontWeight: 900, fontSize: 23, letterSpacing: 1, color: '#2563eb', textTransform: 'uppercase', position: 'relative', top: '50%', transform: 'translateY(40%)', fontFamily: 'Playfair Display, serif' }}>BBYATCH</span>
        </div>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#mainNavbar" aria-controls="mainNavbar" aria-expanded="false" aria-label="Toggle navigation">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="mainNavbar">
          <ul className="navbar-nav me-auto mb-2 mb-md-0 mx-auto gap-md-3" style={{ marginLeft: 'auto' }}>
            <li className="nav-item">
              <button className="nav-link btn btn-link" onClick={() => navigate('/')}>{t('navbar.experiences')}</button>
            </li>
            <li className="nav-item">
              <button className="nav-link btn btn-link" onClick={() => navigate('/')}>{t('navbar.boats')}</button>
            </li>
            <li className="nav-item">
              <button className="nav-link btn btn-link" onClick={() => navigate('/vente')}>{t('navbar.sale')}</button>
            </li>
          </ul>
          <ul className="navbar-nav ms-auto">
            <li className="nav-item dropdown" ref={profileMenuRef}>
              {user ? (
                <>
                  <button
                    className="nav-link dropdown-toggle d-flex align-items-center gap-2"
                    id="profileDropdown"
                    data-bs-toggle="dropdown"
                    aria-expanded={showProfileMenu}
                    onClick={() => setShowProfileMenu((v) => !v)}
                    style={{ border: "none", background: "none" }}
                  >
                    <FaUser style={{ color: "#2563eb", fontSize: 18 }} />
                    <span>
                      {user.displayName ||
                        user.email?.split("@")[0].split(".")[0] ||
                        t('navbar.profile')}
                    </span>
                    <FaChevronDown style={{ color: "#2563eb", fontSize: 16 }} />
                  </button>
                  <ul className={`dropdown-menu dropdown-menu-end${showProfileMenu ? " show" : ""}`} aria-labelledby="profileDropdown">
                    <li>
                      <button className="dropdown-item d-flex align-items-center gap-2" onClick={() => {navigate("/espace"); setShowProfileMenu(false);}}>
                        <FaClipboardList style={{ color: "#2563eb" }} /> {t('navbar.reservations')}
                      </button>
                    </li>
                    <li>
                      <button className="dropdown-item d-flex align-items-center gap-2" onClick={() => {navigate("/espace"); setShowProfileMenu(false);}}>
                        <FaUser style={{ color: "#2563eb" }} /> {t('navbar.personalData')}
                      </button>
                    </li>
                    <li>
                      <button className="dropdown-item d-flex align-items-center gap-2" onClick={() => {navigate("/espace"); setShowProfileMenu(false);}}>
                        <FaUserCircle style={{ color: "#2563eb" }} /> {t('navbar.mySpace')}
                      </button>
                    </li>
                    <li>
                      <button className="dropdown-item d-flex align-items-center gap-2" onClick={() => {navigate("/aide"); setShowProfileMenu(false);}}>
                        <FaQuestionCircle style={{ color: "#2563eb" }} /> {t('navbar.help')}
                      </button>
                    </li>
                    <li><hr className="dropdown-divider" /></li>
                    <li>
                      <button className="dropdown-item d-flex align-items-center gap-2 text-danger" onClick={() => {signOut(auth); setShowProfileMenu(false); navigate("/");}}>
                        <FaSignOutAlt style={{ color: "#e55353" }} /> {t('navbar.logout')}
                      </button>
                    </li>
                  </ul>
                </>
              ) : (
                <button className="btn btn-primary ms-md-2" onClick={() => {navigate("/connexion");}}>
                  {t('navbar.login')}
                </button>
              )}
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}