// Dashboard d'administration avec menu latéral et responsive
import React, { useState } from 'react';
import { Link, Outlet } from 'react-router-dom';
import { FaBars, FaCity, FaShip, FaCog, FaUserFriends, FaSignOutAlt, FaClipboardList } from 'react-icons/fa';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebase';

export default function DashboardAdmin() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f4f8fb' }}>
      {/* Menu latéral */}
      <aside
        style={{
          width: menuOpen ? 220 : 60,
          background: '#1e90ff',
          color: '#fff',
          transition: 'width 0.2s',
          minHeight: '100vh',
          position: 'fixed',
          zIndex: 100,
          top: 0,
          left: 0,
          boxShadow: '2px 0 12px rgba(30,60,60,0.08)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: menuOpen ? 'flex-start' : 'center',
        }}
      >
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          style={{
            background: 'none',
            border: 'none',
            color: '#fff',
            fontSize: 28,
            margin: 18,
            cursor: 'pointer',
            alignSelf: menuOpen ? 'flex-end' : 'center',
          }}
          aria-label="Ouvrir/fermer le menu"
        >
          <FaBars />
        </button>
        <nav style={{ width: '100%', marginTop: 30, display: 'flex', flexDirection: 'column', gap: 18 }}>
          <Link to="/admin/dashboard/users" style={menuLinkStyle(menuOpen)}>
            <FaUserFriends style={{ marginRight: menuOpen ? 12 : 0, fontSize: 22 }} />
            {menuOpen && 'Utilisateurs'}
          </Link>
          <Link to="/admin/dashboard/bateaux" style={menuLinkStyle(menuOpen)}>
            <FaShip style={{ marginRight: menuOpen ? 12 : 0, fontSize: 22 }} />
            {menuOpen && 'Bateaux'}
          </Link>
          <Link to="/admin/dashboard/reservations" style={menuLinkStyle(menuOpen)}>
            <FaClipboardList style={{ marginRight: menuOpen ? 12 : 0, fontSize: 22 }} />
            {menuOpen && 'Réservations'}
          </Link>
          <Link to="/admin/dashboard/villes" style={menuLinkStyle(menuOpen)}>
            <FaCity style={{ marginRight: menuOpen ? 12 : 0, fontSize: 22 }} />
            {menuOpen && 'Gérer les villes'}
          </Link>
          <Link to="/admin/dashboard/settings" style={menuLinkStyle(menuOpen)}>
            <FaCog style={{ marginRight: menuOpen ? 12 : 0, fontSize: 22 }} />
            {menuOpen && 'Paramètres'}
          </Link>
        </nav>
        <div style={{ marginTop: 'auto', padding: '0 18px 18px', width: '100%' }}>
          <button
            className="btn btn-outline-danger"
            onClick={async () => {
              await signOut(auth);
              window.location.href = '/';
            }}
            style={{
              width: '100%',
              padding: '10px 0',
              borderRadius: 10,
              background: 'none',
              border: '2px solid #ff4757',
              color: '#ff4757',
              fontWeight: 600,
              fontSize: 16,
              cursor: 'pointer',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              boxShadow: '0 1px 4px rgba(30,60,60,0.06)',
            }}
          >
            <FaSignOutAlt />
            {menuOpen && 'Se déconnecter'}
          </button>
        </div>
      </aside>
      {/* Contenu principal */}
      <main
        style={{
          marginLeft: menuOpen ? 220 : 60,
          width: '100%',
          padding: 32,
          transition: 'margin-left 0.2s',
        }}
      >
        <Outlet />
      </main>
      {/* Responsive : menu burger en haut sur mobile */}
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
            margin-left: ${menuOpen ? '220px' : '60px'} !important;
            padding: 16px !important;
          }
        }
        @media (max-width: 600px) {
          aside {
            width: ${menuOpen ? '80vw' : '48px'} !important;
            min-width: 0 !important;
          }
          main {
            margin-left: ${menuOpen ? '80vw' : '48px'} !important;
            padding: 8px !important;
          }
        }
      `}</style>
    </div>
  );
}

function menuLinkStyle(open) {
  return {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    background: open ? '#e6f0fa' : 'transparent',
    color: open ? '#1e90ff' : '#fff',
    padding: open ? '14px 18px' : '14px 0',
    borderRadius: 10,
    textAlign: open ? 'left' : 'center',
    fontWeight: 600,
    fontSize: open ? 18 : 22,
    textDecoration: 'none',
    margin: '0 8px',
    transition: 'all 0.2s',
    boxShadow: open ? '0 1px 4px rgba(30,60,60,0.06)' : 'none',
    justifyContent: open ? 'flex-start' : 'center',
  };
}
