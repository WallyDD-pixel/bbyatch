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
          
          {/* Bouton hamburger amélioré pour mobile */}
          <button 
            className="navbar-toggler" 
            type="button" 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            style={{
              border: 'none',
              padding: '8px 12px',
              borderRadius: '8px',
              background: isMobileMenuOpen ? '#f8f9fa' : 'transparent',
              transition: 'all 0.3s ease'
            }}
          >
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
              width: '20px',
              height: '16px'
            }}>
              <div style={{
                width: '100%',
                height: '2px',
                background: '#2c3e50',
                borderRadius: '2px',
                transition: 'all 0.3s ease',
                transform: isMobileMenuOpen ? 'rotate(45deg) translateY(6px)' : 'none'
              }}></div>
              <div style={{
                width: '100%',
                height: '2px',
                background: '#2c3e50',
                borderRadius: '2px',
                transition: 'all 0.3s ease',
                opacity: isMobileMenuOpen ? 0 : 1
              }}></div>
              <div style={{
                width: '100%',
                height: '2px',
                background: '#2c3e50',
                borderRadius: '2px',
                transition: 'all 0.3s ease',
                transform: isMobileMenuOpen ? 'rotate(-45deg) translateY(-6px)' : 'none'
              }}></div>
            </div>
          </button>

          {/* Menu responsive amélioré */}
          <div 
            className={`navbar-collapse ${isMobileMenuOpen ? 'show' : ''}`} 
            id="navbarNav"
            style={{
              transition: 'all 0.3s ease',
              background: isMobile ? '#ffffff' : 'transparent',
              borderRadius: isMobile ? '12px' : '0',
              boxShadow: isMobile && isMobileMenuOpen ? '0 4px 20px rgba(0, 0, 0, 0.1)' : 'none',
              marginTop: isMobile ? '16px' : '0',
              padding: isMobile ? '20px' : '0'
            }}
          >
            <ul className="navbar-nav ms-auto" style={{
              gap: isMobile ? '8px' : '16px',
              flexDirection: isMobile ? 'column' : 'row',
              alignItems: isMobile ? 'stretch' : 'center'
            }}>
              {/* Navigation items */}
              {['sav', 'management', 'vente'].map((route, i) => {
                const label = route === 'sav' ? 'Service après-vente' : route === 'management' ? 'Management' : 'Vente d\'occasion';
                return (
                  <li key={route} className="nav-item" style={{ padding: isMobile ? '0' : 'auto' }}>
                    <span 
                      className="nav-link" 
                      onClick={() => {
                        navigate(`/${route}`);
                        setIsMobileMenuOpen(false);
                      }}
                      style={{
                        cursor: 'pointer',
                        padding: isMobile ? '12px 16px' : '8px 16px',
                        borderRadius: isMobile ? '8px' : '0',
                        background: isMobile ? '#f8f9fa' : 'transparent',
                        border: isMobile ? '1px solid #e9ecef' : 'none',
                        transition: 'all 0.3s ease',
                        fontSize: isMobile ? '14px' : '16px',
                        fontWeight: 500,
                        color: '#2c3e50'
                      }}
                      onMouseEnter={(e) => {
                        if (isMobile) {
                          e.target.style.background = '#e8f4fd';
                          e.target.style.borderColor = '#0066cc';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (isMobile) {
                          e.target.style.background = '#f8f9fa';
                          e.target.style.borderColor = '#e9ecef';
                        }
                      }}
                    >
                      {label}
                    </span>
                  </li>
                );
              })}

              {/* Section utilisateur */}
              <li className="nav-item d-flex align-items-center position-relative" style={{
                marginTop: isMobile ? '16px' : '0',
                paddingTop: isMobile ? '16px' : '0',
                borderTop: isMobile ? '1px solid #e9ecef' : 'none'
              }}>
                {user ? (
                  <div style={{ 
                    fontWeight: 600, 
                    color: '#2c3e50', 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 10, 
                    cursor: 'pointer', 
                    position: 'relative',
                    padding: isMobile ? '12px 16px' : '8px 16px',
                    borderRadius: isMobile ? '8px' : '0',
                    background: isMobile ? '#e8f4fd' : 'transparent',
                    border: isMobile ? '1px solid #b8daff' : 'none',
                    width: isMobile ? '100%' : 'auto'
                  }} 
                  onClick={() => setShowProfileMenu(v => !v)}
                  >
                    <FaUser style={{ color: '#0066cc', fontSize: isMobile ? 16 : 18 }} />
                    <span style={{ 
                      fontSize: isMobile ? '14px' : '16px',
                      flex: 1
                    }}>
                      {user.displayName || (user.email?.split('@')[0].split('.')[0]) || 'Profil'}
                    </span>
                    <FaChevronDown style={{ 
                      color: '#0066cc', 
                      fontSize: isMobile ? 14 : 16,
                      transform: showProfileMenu ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 0.3s ease'
                    }} />
                    
                    {showProfileMenu && (
                      <div ref={profileMenuRef} style={{ 
                        position: 'absolute', 
                        top: isMobile ? '60px' : '38px', 
                        right: 0, 
                        background: '#fff', 
                        borderRadius: 12, 
                        boxShadow: '0 8px 32px rgba(0,0,0,0.15)', 
                        minWidth: isMobile ? '280px' : '240px', 
                        zIndex: 1000, 
                        padding: 0,
                        border: '1px solid #e1e5e9'
                      }}>
                        <div style={{ 
                          padding: '20px 20px 12px 20px', 
                          borderBottom: '1px solid #e9ecef', 
                          fontWeight: 700, 
                          color: '#0066cc', 
                          fontSize: isMobile ? 16 : 18, 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: 12 
                        }}>
                          <FaUserCircle style={{ fontSize: 24 }} /> 
                          {user.displayName || (user.email?.split('@')[0].split('.')[0]) || 'Profil'}
                        </div>
                        <ul className="list-unstyled mb-0" style={{ padding: '8px 0', margin: 0 }}>
                          {[
                            { label: 'Mes réservations', icon: FaClipboardList, path: '/espace' },
                            { label: 'Données personnelles', icon: FaUser, path: '/espace' },
                            { label: 'Mon espace', icon: FaUserCircle, path: '/espace' },
                            { label: 'Aide', icon: FaQuestionCircle, path: '/aide' }
                          ].map(({ label, icon: Icon, path }) => (
                            <li 
                              key={label} 
                              style={{
                                ...menuItemStyle,
                                fontSize: isMobile ? 14 : 16,
                                padding: isMobile ? '10px 18px' : '12px 18px',
                                borderRadius: 0,
                                transition: 'background 0.2s'
                              }} 
                              onClick={() => {
                                navigate(path);
                                setShowProfileMenu(false);
                                setIsMobileMenuOpen(false);
                              }}
                              onMouseEnter={e => e.currentTarget.style.background = '#f0f8ff'}
                              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                            >
                              <Icon style={iconStyle} />
                              {label}
                            </li>
                          ))}
                          <li 
                            style={{
                              ...menuItemStyle,
                              borderTop: '1px solid #e9ecef',
                              color: '#e55353',
                              fontWeight: 600
                            }} 
                            onClick={() => {
                              signOut(auth);
                              setShowProfileMenu(false);
                              setIsMobileMenuOpen(false);
                              navigate('/');
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = '#f8d7da'}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                          >
                            <FaSignOutAlt style={{ ...iconStyle, color: '#e55353' }} />
                            Déconnexion
                          </li>
                        </ul>
                      </div>
                    )}
                  </div>
                ) : (
                  <button 
                    onClick={() => navigate('/connexion')}
                    className="btn btn-outline-primary"
                    style={{ padding: isMobile ? '8px 16px' : '8px 22px', fontWeight: 600, fontSize: isMobile ? 14 : 16 }}
                  >
                    Se connecter
                  </button>
                )}
              </li>
            </ul>
          </div>
        </div>
      </nav>
      {/* Pour laisser la place sous la nav fixe */}
      <div style={{ height: isMobile ? 62 : 70 }} />
    </>
  );
}
