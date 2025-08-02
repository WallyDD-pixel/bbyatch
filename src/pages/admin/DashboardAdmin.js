// Dashboard d'administration avec menu latéral et responsive - Style moderne cohérent
import React, { useState } from 'react';
import { Link, Outlet } from 'react-router-dom';
import { FaBars, FaCity, FaShip, FaCog, FaUserFriends, FaSignOutAlt, FaClipboardList, FaChevronDown, FaChevronUp, FaCalendarAlt, FaStar, FaTools } from 'react-icons/fa';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebase';
import AdminServicesPage from './AdminServicesPage';

export default function DashboardAdmin() {
  const [menuOpen, setMenuOpen] = useState(true);
  const [settingsDropdown, setSettingsDropdown] = useState(false);

  // Liste des sous-pages de paramètres
  const settingsLinks = [
    { to: '/admin/dashboard/settings', label: 'Paramètres généraux' },
    { to: '/admin/dashboard/settings/galerie-home', label: 'Galerie d\'accueil' },
    { to: '/admin/dashboard/settings/homepage', label: 'Homepage' },
    { to: '/admin/dashboard/settings/presentation', label: 'Présentation' },
    { to: '/admin/dashboard/settings/services', label: 'Services' },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#1a1d23' }}>
      {/* Sidebar */}
      <aside
        style={{
          width: menuOpen ? 260 : 70,
          background: '#2a2d35',
          color: '#e8eaed',
          transition: 'width 0.25s ease',
          minHeight: '100vh',
          position: 'fixed',
          zIndex: 100,
          top: 0,
          left: 0,
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: menuOpen ? 'flex-start' : 'center',
          border: '1px solid #374151',
        }}
      >
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          style={{
            background: 'none',
            border: 'none',
            color: '#3b82f6',
            fontSize: 24,
            margin: 20,
            cursor: 'pointer',
            alignSelf: menuOpen ? 'flex-end' : 'center',
            transition: 'all 0.3s ease',
            padding: '8px',
            borderRadius: '8px',
          }}
          aria-label="Ouvrir/fermer le menu"
          onMouseEnter={(e) => {
            e.target.style.background = '#374151';
            e.target.style.color = '#60a5fa';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'none';
            e.target.style.color = '#3b82f6';
          }}
        >
          <FaBars />
        </button>
        
        <div style={{ width: '100%', textAlign: 'center', marginBottom: 20 }}>
          {menuOpen && (
            <span style={{ 
              fontWeight: 700, 
              fontSize: 20, 
              letterSpacing: 1, 
              color: '#e8eaed', 
              marginLeft: 20,
            }}>
              BBYACHTS Admin
            </span>
          )}
        </div>

        <nav style={{ width: '100%', marginTop: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <SidebarLink to="/admin/dashboard/users" icon={<FaUserFriends />} open={menuOpen} label="Utilisateurs" />
          <SidebarLink to="/admin/dashboard/bateaux" icon={<FaShip />} open={menuOpen} label="Bateaux" />
          <SidebarLink to="/admin/dashboard/bateauxoccasion" icon={<FaClipboardList />} open={menuOpen} label="Bateaux d'occasion" />
          <SidebarLink to="/admin/dashboard/calendrier" icon={<FaCalendarAlt />} open={menuOpen} label="Calendrier" />
          <SidebarLink to="/admin/dashboard/reservations" icon={<FaClipboardList />} open={menuOpen} label="Réservations" />
          <SidebarLink to="/admin/dashboard/villes" icon={<FaCity />} open={menuOpen} label="Villes" />
          {/* Onglet ajouté pour les demandes particuliers */}
          <SidebarLink to="/admin/dashboard/demandes-particuliers" icon={<FaClipboardList />} open={menuOpen} label="Demandes particuliers" />
          {/* Onglet ajouté pour les expériences */}
          <SidebarLink to="/admin/dashboard/experiences" icon={<FaStar />} open={menuOpen} label="Expériences" />
          {/* Onglet ajouté pour les services supplémentaires */}
          <SidebarLink to="/admin/dashboard/services" icon={<FaTools />} open={menuOpen} label="Services supplémentaires" />
          {/* Dropdown Paramètres */}
          <div style={{ position: 'relative', width: '100%' }}>
            <div
              onClick={() => setSettingsDropdown(v => !v)}
              style={{
                display: 'flex', 
                alignItems: 'center', 
                gap: 12, 
                cursor: 'pointer',
                background: '#1a1d23',
                color: '#e8eaed',
                padding: menuOpen ? '12px 16px' : '12px 0',
                borderRadius: 8,
                fontWeight: 500,
                fontSize: menuOpen ? 14 : 20,
                margin: '0 12px',
                transition: 'all 0.2s ease',
                border: '1px solid #374151',
                justifyContent: menuOpen ? 'flex-start' : 'center',
              }}
              onMouseEnter={(e) => {
                e.target.style.background = '#374151';
                e.target.style.borderColor = '#4b5563';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = '#1a1d23';
                e.target.style.borderColor = '#374151';
              }}
            >
              <span style={{ fontSize: 16, color: '#3b82f6' }}><FaCog /></span>
              {menuOpen && <span>Paramètres</span>}
              {menuOpen && (settingsDropdown ? <FaChevronUp style={{ marginLeft: 'auto', color: '#9ca3af' }} /> : <FaChevronDown style={{ marginLeft: 'auto', color: '#9ca3af' }} />)}
            </div>
            
            {menuOpen && settingsDropdown && (
              <div style={{
                position: 'absolute', 
                left: 0, 
                top: '100%', 
                background: '#2a2d35', 
                boxShadow: '0 8px 24px rgba(0,0,0,0.4)', 
                borderRadius: 8, 
                minWidth: 220, 
                zIndex: 10, 
                marginTop: 4,
                padding: '8px 0',
                border: '1px solid #374151',
              }}>
                {settingsLinks.map(link => (
                  <Link
                    key={link.to}
                    to={link.to}
                    style={{
                      display: 'block', 
                      color: '#e8eaed', 
                      padding: '10px 16px', 
                      textDecoration: 'none', 
                      fontWeight: 500, 
                      fontSize: 14,
                      transition: 'all 0.2s ease',
                    }}
                    onClick={() => setSettingsDropdown(false)}
                    onMouseEnter={(e) => {
                      e.target.style.background = '#374151';
                      e.target.style.color = '#60a5fa';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = 'transparent';
                      e.target.style.color = '#e8eaed';
                    }}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </nav>

        <div style={{ marginTop: 'auto', padding: '0 16px 20px', width: '100%' }}>
          <button
            onClick={async () => {
              await signOut(auth);
              window.location.href = '/';
            }}
            style={{
              width: '100%',
              padding: '12px 16px',
              borderRadius: 8,
              background: '#dc2626',
              border: '1px solid #ef4444',
              color: '#fff',
              fontWeight: 600,
              fontSize: 14,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
            }}
            onMouseEnter={(e) => {
              e.target.style.background = '#b91c1c';
              e.target.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = '#dc2626';
              e.target.style.transform = 'translateY(0)';
            }}
          >
            <FaSignOutAlt />
            {menuOpen && 'Se déconnecter'}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div
        style={{
          marginLeft: menuOpen ? 260 : 70,
          width: '100%',
          transition: 'margin-left 0.25s ease',
          background: '#1a1d23',
        }}
      >
        {/* Header */}
        <header style={{
          width: '100%',
          background: '#2a2d35',
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          padding: '20px 32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          minHeight: 70,
          border: '1px solid #374151',
          borderTop: 'none',
        }}>
          <span style={{ 
            fontWeight: 700, 
            fontSize: 24, 
            color: '#e8eaed', 
            letterSpacing: 0.5,
          }}>
            Administration
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              background: '#3b82f6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontWeight: 600,
              fontSize: 16,
            }}>
              A
            </div>
          </div>
        </header>

        {/* Content */}
        <main style={{
          background: '#2a2d35',
          borderRadius: 12,
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          padding: '24px',
          minHeight: 'calc(100vh - 110px)',
          margin: '20px',
          border: '1px solid #374151',
          color: '#e8eaed',
        }}>
          <Outlet />
        </main>
      </div>

      {/* Responsive */}
      <style>{`
        @media (max-width: 900px) {
          aside {
            position: fixed !important;
            left: 0 !important;
            top: 0 !important;
            height: 100vh !important;
            z-index: 2000 !important;
          }
          main {
            margin-left: ${menuOpen ? '260px' : '70px'} !important;
            margin: 10px !important;
          }
        }
        @media (max-width: 600px) {
          aside {
            width: ${menuOpen ? '80vw' : '60px'} !important;
            min-width: 0 !important;
          }
          main {
            margin-left: ${menuOpen ? '80vw' : '60px'} !important;
            margin: 5px !important;
          }
        }
      `}</style>
    </div>
  );
}

function SidebarLink({ to, icon, open, label }) {
  return (
    <Link
      to={to}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        background: '#1a1d23',
        color: '#e8eaed',
        padding: open ? '12px 16px' : '12px 0',
        borderRadius: 8,
        textAlign: open ? 'left' : 'center',
        fontWeight: 500,
        fontSize: open ? 14 : 20,
        textDecoration: 'none',
        margin: '0 12px',
        transition: 'all 0.2s ease',
        border: '1px solid #374151',
        justifyContent: open ? 'flex-start' : 'center',
      }}
      onMouseEnter={(e) => {
        e.target.style.background = '#374151';
        e.target.style.borderColor = '#4b5563';
        e.target.style.color = '#60a5fa';
        e.target.style.transform = 'translateX(2px)';
      }}
      onMouseLeave={(e) => {
        e.target.style.background = '#1a1d23';
        e.target.style.borderColor = '#374151';
        e.target.style.color = '#e8eaed';
        e.target.style.transform = 'translateX(0)';
      }}
    >
      <span style={{ fontSize: 16, color: '#3b82f6' }}>{icon}</span>
      {open && <span>{label}</span>}
    </Link>
  );
}

// Ajout des routes dans le fichier de configuration des routes
// <Route path="services" element={<AdminServicesPage />} />
