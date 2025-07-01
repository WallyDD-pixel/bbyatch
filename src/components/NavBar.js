import React, { useEffect, useState, useRef } from "react";
import logo from "../logo.svg";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { FaUser, FaChevronDown, FaIdCard, FaUserCircle, FaQuestionCircle, FaSignOutAlt, FaClipboardList } from 'react-icons/fa';

const menuItemStyle = { padding: '12px 18px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12, fontSize: 16, color: '#222', fontWeight: 500, transition: 'background 0.15s', borderRadius: 8 };
const iconStyle = { fontSize: 18, color: '#1e90ff' };

export default function NavBar() {
  const [user, setUser] = useState(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileMenuRef = useRef();
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <>
      <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm" style={{ position: 'fixed', top: 0, left: 0, width: '100%', zIndex: 1000 }}>
        <div className="container">
          <img src={logo} alt="BBYATCH logo" style={{ height: 40 }} className="me-2" />
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav ms-auto">
              <li className="nav-item"><span className="nav-link" onClick={() => navigate('/')}>Accueil</span></li>
              <li className="nav-item"><span className="nav-link" onClick={() => navigate('/search-results')}>Bateaux</span></li>
              <li className="nav-item"><span className="nav-link" onClick={() => navigate('/contact')}>Contact</span></li>
              <li className="nav-item d-flex align-items-center position-relative">
                <FaUser style={{ fontSize: 20, marginRight: 6, color: '#fff' }} />
                {user ? (
                  <div style={{ fontWeight: 700, color: '#000', display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', position: 'relative' }} onClick={() => setShowProfileMenu(v => !v)}>
                    <span className="prenom-profil" style={{ fontWeight: 700, color: '#000', display: 'flex', alignItems: 'center', marginLeft: 8, cursor: 'pointer' }}>
                      <FaUser style={{ marginRight: 6, color: '#000' }} /> {user.displayName || (user.email?.split('@')[0].split('.')[0]) || 'Profil'}
                    </span>
                    <FaChevronDown style={{ marginLeft: 6, color: '#000', fontSize: 16 }} />
                    {showProfileMenu && (
                      <div ref={profileMenuRef} style={{ position: 'absolute', top: 38, right: 0, background: '#fff', borderRadius: 12, boxShadow: '0 4px 24px rgba(0,0,0,0.13)', minWidth: 240, zIndex: 1000, padding: 0 }}>
                        <div style={{ padding: '18px 18px 8px 18px', borderBottom: '1px solid #eee', fontWeight: 700, color: '#1e90ff', fontSize: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                          <FaUserCircle style={{ fontSize: 22 }} /> {user.displayName || (user.email?.split('@')[0].split('.')[0]) || 'Profil'}
                        </div>
                        <ul className="list-unstyled mb-0" style={{ padding: 0, margin: 0 }}>
                          <li style={menuItemStyle} onClick={() => { setShowProfileMenu(false); navigate('/espace'); }}><FaClipboardList style={iconStyle} /> Mes réservations</li>
                          <li style={menuItemStyle} onClick={() => { setShowProfileMenu(false); navigate('/espace'); }}><FaUser style={iconStyle} /> Données personnelles</li>
                          <li style={menuItemStyle} onClick={() => { setShowProfileMenu(false); navigate('/espace'); }}><FaUserCircle style={iconStyle} /> Profil</li>
                          <li style={menuItemStyle} onClick={() => { setShowProfileMenu(false); navigate('/espace'); }}><FaUserCircle style={iconStyle} /> Mon espace</li>
                          <li style={{ ...menuItemStyle, borderTop: '1px solid #eee', marginTop: 6 }} onClick={() => { setShowProfileMenu(false); navigate('/aide'); }}><FaQuestionCircle style={iconStyle} /> Aide</li>
                          <li style={{ ...menuItemStyle, color: '#e74c3c', fontWeight: 700 }} onClick={async () => { setShowProfileMenu(false); await signOut(auth); window.location.href = '/'; }}><FaSignOutAlt style={iconStyle} /> Se déconnecter</li>
                        </ul>
                      </div>
                    )}
                  </div>
                ) : (
                  <span style={{ fontWeight: 700, color: '#000' }}>
                    <span style={{ cursor: 'pointer', color: '#000' }} onClick={() => navigate('/connexion')}>Connexion</span>
                    <span style={{ color: '#000', margin: '0 6px' }}>|</span>
                    <span style={{ cursor: 'pointer', color: '#000' }} onClick={() => navigate('/inscription')}>Inscription</span>
                  </span>
                )}
              </li>
            </ul>
          </div>
        </div>
      </nav>
      <div style={{ width: '100%', height: 10, background: '#111', margin: 0, padding: 0 }} />
    </>
  );
}
