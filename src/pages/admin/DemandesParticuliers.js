import React, { useEffect, useState } from 'react';
import { db } from '../../firebase';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';

export default function DemandesParticuliers() {
  const [demandes, setDemandes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDemande, setSelectedDemande] = useState(null);
  const [reponse, setReponse] = useState('');

  useEffect(() => {
    async function fetchDemandes() {
      setLoading(true);
      try {
        const snap = await getDocs(collection(db, 'demandesParticuliers'));
        setDemandes(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (err) {
        setError('Erreur de chargement : ' + err.message);
      }
      setLoading(false);
    }
    fetchDemandes();
  }, []);

  const openModal = (demande) => {
    setSelectedDemande(demande);
    setModalOpen(true);
    setReponse('');
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedDemande(null);
    setReponse('');
  };

  const handleReponse = async () => {
    if (!selectedDemande) return;
    try {
      await updateDoc(doc(db, 'demandesParticuliers', selectedDemande.id), { reponse });
      setDemandes(demandes => demandes.map(d => d.id === selectedDemande.id ? { ...d, reponse } : d));
      alert('Réponse enregistrée !');
    } catch (err) {
      alert('Erreur lors de l\'enregistrement : ' + err.message);
    }
    closeModal();
  };

  return (
    <div>
      <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 24 }}>Demandes particuliers</h2>
      {loading ? (
        <div>Chargement...</div>
      ) : error ? (
        <div style={{ color: 'red' }}>{error}</div>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', background: '#23272f', color: '#e8eaed', borderRadius: 8, overflow: 'hidden' }}>
          <thead>
            <tr style={{ background: '#374151' }}>
              <th style={thStyle}>Nom</th>
              <th style={thStyle}>Prénom</th>
              <th style={thStyle}>Email</th>
              <th style={thStyle}>Téléphone</th>
              <th style={thStyle}>Date</th>
              <th style={thStyle}>Action</th>
              <th style={thStyle}>Réponse</th>
            </tr>
          </thead>
          <tbody>
            {demandes.length === 0 ? (
              <tr><td colSpan={7} style={{ textAlign: 'center', padding: 24 }}>Aucune demande</td></tr>
            ) : (
              demandes.map(demande => (
                <tr key={demande.id} style={{ borderBottom: '1px solid #374151' }}>
                  <td style={tdStyle}>{demande.nom || ''}</td>
                  <td style={tdStyle}>{demande.prenom || ''}</td>
                  <td style={tdStyle}>{demande.email || ''}</td>
                  <td style={tdStyle}>{demande.telephone || ''}</td>
                  <td style={tdStyle}>{demande.date ? new Date(demande.date).toLocaleString('fr-FR') : ''}</td>
                  <td style={tdStyle}>
                    <button onClick={() => openModal(demande)} style={{ background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 14px', cursor: 'pointer', fontWeight: 600 }}>Voir le message</button>
                  </td>
                  <td style={tdStyle}>{demande.reponse ? demande.reponse : <span style={{ color: '#9ca3af' }}>—</span>}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}

      {modalOpen && selectedDemande && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(30,41,59,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 }}>
          <div style={{ background: '#23272f', borderRadius: 12, padding: 32, minWidth: 340, maxWidth: 400, boxShadow: '0 4px 24px #0008', color: '#e8eaed' }}>
            <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>Message de {selectedDemande.nom} {selectedDemande.prenom}</h3>
            <div style={{ marginBottom: 18, fontSize: 16, background: '#181c24', borderRadius: 8, padding: 12 }}>{selectedDemande.message}</div>
            <label style={{ fontWeight: 600, marginBottom: 8, display: 'block' }}>Répondre :</label>
            <textarea value={reponse} onChange={e => setReponse(e.target.value)} rows={3} style={{ width: '100%', borderRadius: 6, border: '1px solid #374151', padding: 8, fontSize: 15, marginBottom: 16, background: '#181c24', color: '#e8eaed' }} placeholder="Votre réponse..." />
            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button onClick={closeModal} style={{ background: '#374151', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 14px', cursor: 'pointer', fontWeight: 600 }}>Fermer</button>
              <button onClick={handleReponse} style={{ background: '#10b981', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 14px', cursor: 'pointer', fontWeight: 600 }}>Envoyer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const thStyle = {
  padding: '12px 8px',
  textAlign: 'left',
  fontWeight: 600,
  fontSize: 16,
  borderBottom: '2px solid #3b82f6',
};
const tdStyle = {
  padding: '10px 8px',
  fontSize: 15,
};
