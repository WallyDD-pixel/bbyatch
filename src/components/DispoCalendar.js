import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import Modal from 'react-modal';

export default function DispoCalendar({ ville, isOpen, onRequestClose }) {
  const [dispoDates, setDispoDates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDispos() {
      setLoading(true);
      // Récupère tous les bateaux de la ville (attention à la casse du champ 'Ville')
      const bateauxSnap = await getDocs(query(collection(db, 'bateaux'), where('Ville', '==', ville)));
      let dates = new Set();
      bateauxSnap.docs.forEach(doc => {
        const data = doc.data();
        if (Array.isArray(data.disponibilites)) {
          data.disponibilites.forEach(d => {
            // On suppose que d.start et d.end sont des dates ISO
            const start = new Date(d.start);
            const end = new Date(d.end);
            for (let dt = new Date(start); dt <= end; dt.setDate(dt.getDate() + 1)) {
              // Correction : il faut cloner la date pour éviter un bug d'incrémentation
              dates.add(new Date(dt).toISOString().slice(0, 10));
            }
          });
        }
      });
      setDispoDates(Array.from(dates));
      setLoading(false);
    }
    if (ville) fetchDispos();
  }, [ville]);

  function tileDisabled({ date, view }) {
    if (view !== 'month') return false;
    // Désactive les jours où aucun bateau n'est dispo
    return !dispoDates.includes(date.toISOString().slice(0, 10));
  }

  function tileClassName({ date, view }) {
    if (view !== 'month') return '';
    const iso = date.toISOString().slice(0, 10);
    if (dispoDates.includes(iso)) {
      return 'dispo-day';
    }
    return '';
  }

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      contentLabel="Jours disponibles"
      ariaHideApp={false}
      style={{
        overlay: { backgroundColor: 'rgba(0,0,0,0.25)', zIndex: 1000 },
        content: {
          maxWidth: 260,
          margin: 'auto',
          borderRadius: 16,
          padding: 18,
          boxShadow: '0 4px 24px rgba(0,0,0,0.12)',
          border: 'none',
          inset: '50% auto auto 50%',
          transform: 'translate(-50%, -50%)',
          background: '#fff',
        }
      }}
    >
      <h6 style={{ color: '#1976d2', marginBottom: 8, fontSize: 15, textAlign: 'center' }}>Jours disponibles</h6>
      {loading ? <div style={{ fontSize: 13 }}>Chargement du calendrier...</div> :
        <Calendar
          tileDisabled={tileDisabled}
          tileClassName={tileClassName}
          minDate={new Date()}
          locale="fr-FR"
          className="mini-calendar"
        />
      }
      <button onClick={onRequestClose} style={{ margin: '18px auto 0', display: 'block', background: '#1976d2', color: '#fff', border: 'none', borderRadius: 8, padding: '6px 18px', fontWeight: 500, cursor: 'pointer' }}>Fermer</button>
    </Modal>
  );
}

/*
Ajoute ce CSS dans App.css ou index.css :
.mini-calendar {
  width: 100% !important;
  max-width: 220px !important;
  font-size: 13px !important;
}
.react-calendar__tile {
  padding: 4px 0 !important;
}
.dispo-day {
  background: #b9f6ca !important;
  color: #1b5e20 !important;
  border-radius: 50% !important;
}
*/

