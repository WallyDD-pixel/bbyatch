import React, { useEffect, useState, useRef } from "react";
import logo from "../logo.svg";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { FaUser, FaChevronDown, FaUserCircle, FaQuestionCircle, FaSignOutAlt, FaClipboardList } from 'react-icons/fa';

const menuItemStyle = { padding: '12px 18px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12, fontSize: 16, color: '#222', fontWeight: 500, transition: 'background 0.15s', borderRadius: 8 };
const iconStyle = { fontSize: 18, color: '#1e90ff' };

export default function NavBar() {
  const [user, setUser] = useState(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const profileMenuRef = useRef();
  const navigate = useNavigate();

  // Gestion auth utilisateur
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsubscribe();
  }, []);

  // Gestion clic en dehors du menu profil pour le fermer
  useEffect(() => {
    function handleClickOutside(event) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Gestion resize fenêtre pour update windowWidth
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = windowWidth < 768;

  return (
    <>
      <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm" style={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        width: '100%', 
        zIndex: 1000,
        padding: isMobile ? '8px 0' : '12px 0'
      }}>
        <div className="container" style={{ 
          padding: isMobile ? '0 16px' : '0 15px'
        }}>
          <img
            src={logo}
            alt="BBYATCH logo"
            style={{ 
              height: isMobile ? 35 : 40, 
              cursor: "pointer" 
            }}
            className="me-2"
            onClick={() => navigate('/')}
          />
          {/* ...existing code... */}
        </div>
      </nav>
      {/* Pour laisser la place sous la nav fixe */}
      <div style={{ height: isMobile ? 62 : 70 }} />
    </>
  );
}