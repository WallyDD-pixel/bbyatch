import React, { useEffect, useState } from 'react';
import { auth } from '../../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import logo from '../../logo.svg';
import 'bootstrap/dist/css/bootstrap.min.css';

export default function ProfilMinimal() {
  const [prenom, setPrenom] = useState('');

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) {
        setPrenom(user.displayName || (user.email?.split('@')[0].split('.')[0]) || 'Profil');
      } else {
        setPrenom('');
      }
    });
    return () => unsub();
  }, []);

  return (
    <div>
      <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm">
        <div className="container-fluid">
          <img src={logo} alt="BBYATCH logo" style={{ height: 40 }} className="me-2" />
          <div className="ms-auto d-flex align-items-center">
            {prenom && (
              <span style={{ fontWeight: 700, color: '#000', fontSize: 18 }}>{prenom}</span>
            )}
          </div>
        </div>
      </nav>
      {/* ...autre contenu ici si besoin... */}
    </div>
  );
}
