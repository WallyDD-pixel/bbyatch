import React, { useEffect, useState } from "react";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase";
import { Modal, Button } from 'react-bootstrap';

export default function AdminReservations() {
  const [reservations, setReservations] = useState([]);
  const [bateauxMap, setBateauxMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    async function fetchData() {
      // Récupère toutes les réservations
      const snap = await getDocs(collection(db, "reservations"));
      const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setReservations(data);
      // Récupère tous les bateaux pour mapping id -> nom
      const snapB = await getDocs(collection(db, "bateaux"));
      const map = {};
      snapB.docs.forEach(doc => { map[doc.id] = doc.data().nom || doc.id; });
      setBateauxMap(map);
      setLoading(false);
    }
    fetchData();
  }, []);

  return (
    <div className="container py-4">
      <h2 className="mb-4" style={{ color: '#1e90ff', fontWeight: 700 }}>Gestion des réservations</h2>
      {loading ? (
        <div>Chargement...</div>
      ) : (
        <div className="table-responsive">
          <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, fontSize: 15, background: '#fff', borderRadius: 16, overflow: 'hidden', boxShadow: '0 2px 16px #1e90ff22' }}>
            <thead style={{ background: 'linear-gradient(90deg, #e6f0fa 60%, #fff 100%)', fontWeight: 700, fontSize: 16, color: '#1e90ff' }}>
              <tr>
                <th style={{ padding: 12, fontWeight: 800, color: '#1976d2', background: 'none', borderBottom: '2.5px solid #b3c6e0', fontSize: 16, letterSpacing: 0.5, textAlign: 'center' }}>Bateau</th>
                <th style={{ padding: 12, fontWeight: 800, color: '#1976d2', background: 'none', borderBottom: '2.5px solid #b3c6e0', fontSize: 16, letterSpacing: 0.5, textAlign: 'center' }}>Date début</th>
                <th style={{ padding: 12, fontWeight: 800, color: '#1976d2', background: 'none', borderBottom: '2.5px solid #b3c6e0', fontSize: 16, letterSpacing: 0.5, textAlign: 'center' }}>Heure début</th>
                <th style={{ padding: 12, fontWeight: 800, color: '#1976d2', background: 'none', borderBottom: '2.5px solid #b3c6e0', fontSize: 16, letterSpacing: 0.5, textAlign: 'center' }}>Date fin</th>
                <th style={{ padding: 12, fontWeight: 800, color: '#1976d2', background: 'none', borderBottom: '2.5px solid #b3c6e0', fontSize: 16, letterSpacing: 0.5, textAlign: 'center' }}>Heure fin</th>
                <th style={{ padding: 12, fontWeight: 800, color: '#1976d2', background: 'none', borderBottom: '2.5px solid #b3c6e0', fontSize: 16, letterSpacing: 0.5, textAlign: 'center' }}>Montant</th>
                <th style={{ padding: 12, fontWeight: 800, color: '#1976d2', background: 'none', borderBottom: '2.5px solid #b3c6e0', fontSize: 16, letterSpacing: 0.5, textAlign: 'center' }}>Devise</th>
                <th style={{ padding: 12, fontWeight: 800, color: '#1976d2', background: 'none', borderBottom: '2.5px solid #b3c6e0', fontSize: 16, letterSpacing: 0.5, textAlign: 'center' }}>Nom</th>
                <th style={{ padding: 12, fontWeight: 800, color: '#1976d2', background: 'none', borderBottom: '2.5px solid #b3c6e0', fontSize: 16, letterSpacing: 0.5, textAlign: 'center' }}>Prénom</th>
                <th style={{ padding: 12, fontWeight: 800, color: '#1976d2', background: 'none', borderBottom: '2.5px solid #b3c6e0', fontSize: 16, letterSpacing: 0.5, textAlign: 'center' }}>Email</th>
                <th style={{ padding: 12, fontWeight: 800, color: '#1976d2', background: 'none', borderBottom: '2.5px solid #b3c6e0', fontSize: 16, letterSpacing: 0.5, textAlign: 'center' }}>Téléphone</th>
                <th style={{ padding: 12, fontWeight: 800, color: '#1976d2', background: 'none', borderBottom: '2.5px solid #b3c6e0', fontSize: 16, letterSpacing: 0.5, textAlign: 'center' }}>Créée le</th>
                <th style={{ padding: 12, fontWeight: 800, color: '#1976d2', background: 'none', borderBottom: '2.5px solid #b3c6e0', fontSize: 16, letterSpacing: 0.5, textAlign: 'center' }}>Paiement complet</th>
                <th style={{ padding: 12, fontWeight: 800, color: '#1976d2', background: 'none', borderBottom: '2.5px solid #b3c6e0', fontSize: 16, letterSpacing: 0.5, textAlign: 'center' }}>Statut paiement complet</th>
                <th style={{ padding: 12, fontWeight: 800, color: '#1976d2', background: 'none', borderBottom: '2.5px solid #b3c6e0', fontSize: 16, letterSpacing: 0.5, textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {reservations.map((r, idx) => (
                <tr key={r.id} style={{ background: idx % 2 === 0 ? '#f8fbff' : '#fff', borderBottom: '2px solid #e6f0fa', transition: 'background 0.2s' }}>
                  <td style={{ padding: 10, textAlign: 'center', color: '#0a2342', fontSize: 15, fontWeight: 500 }}>{r.bateauNom || bateauxMap[r.bateauId] || r.bateauId || <span className="text-muted">-</span>}</td>
                  <td style={{ padding: 10, textAlign: 'center', color: '#0a2342', fontSize: 15, fontWeight: 500 }}>{r.dateDebut || <span className="text-muted">-</span>}</td>
                  <td style={{ padding: 10, textAlign: 'center', color: '#0a2342', fontSize: 15, fontWeight: 500 }}>{r.heureDebut || <span className="text-muted">-</span>}</td>
                  <td style={{ padding: 10, textAlign: 'center', color: '#0a2342', fontSize: 15, fontWeight: 500 }}>{r.dateFin || <span className="text-muted">-</span>}</td>
                  <td style={{ padding: 10, textAlign: 'center', color: '#0a2342', fontSize: 15, fontWeight: 500 }}>{r.heureFin || <span className="text-muted">-</span>}</td>
                  <td style={{ padding: 10, textAlign: 'center', color: '#0a2342', fontSize: 15, fontWeight: 500 }}>{r.montant ? r.montant : r.prix || <span className="text-muted">-</span>}</td>
                  <td style={{ padding: 10, textAlign: 'center', color: '#0a2342', fontSize: 15, fontWeight: 500 }}>{r.devise ? r.devise.toUpperCase() : <span className="text-muted">-</span>}</td>
                  <td style={{ padding: 10, textAlign: 'center', color: '#0a2342', fontSize: 15, fontWeight: 500 }}>{r.nom || <span className="text-muted">-</span>}</td>
                  <td style={{ padding: 10, textAlign: 'center', color: '#0a2342', fontSize: 15, fontWeight: 500 }}>{r.prenom || <span className="text-muted">-</span>}</td>
                  <td style={{ padding: 10, textAlign: 'center', color: '#0a2342', fontSize: 15, fontWeight: 500 }}>{r.email || <span className="text-muted">-</span>}</td>
                  <td style={{ padding: 10, textAlign: 'center', color: '#0a2342', fontSize: 15, fontWeight: 500 }}>{r.phone || <span className="text-muted">-</span>}</td>
                  <td style={{ padding: 10, textAlign: 'center', color: '#0a2342', fontSize: 15, fontWeight: 500 }}>{r.createdAt && r.createdAt.toDate ? r.createdAt.toDate().toLocaleString() : (r.createdAt ? new Date(r.createdAt).toLocaleString() : <span className="text-muted">-</span>)}</td>
                  <td style={{ padding: 10, textAlign: 'center', fontWeight: 700 }}>{r.statusComplet === true ? <span style={{ color: '#1bbf4c' }}>Payé</span> : <span style={{ color: '#e67e22' }}>Non payé</span>}</td>
                  <td style={{ padding: 10, textAlign: 'center', fontWeight: 700 }}>{r.statusComplet === true ? 'Validé' : 'En attente'}</td>
                  <td style={{ padding: 10, textAlign: 'center' }}>
                    <button className="btn btn-outline-primary btn-sm" style={{ borderRadius: 10, fontWeight: 600 }} onClick={() => { setSelectedReservation(r); setShowModal(true); }}>Gérer</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {showModal && selectedReservation && (
        <Modal show={showModal} onHide={() => setShowModal(false)} centered>
          <Modal.Header closeButton style={{ background: '#1e90ff', color: '#fff' }}>
            <Modal.Title>Détail de la réservation</Modal.Title>
          </Modal.Header>
          <Modal.Body style={{ background: '#fafdff' }}>
            <div style={{ fontSize: 17, fontWeight: 600, color: '#1e90ff', marginBottom: 10 }}>
              {selectedReservation.bateauNom || bateauxMap[selectedReservation.bateauId] || selectedReservation.bateauId || <span className="text-muted">-</span>}
            </div>
            <div><b>Nom :</b> {selectedReservation.nom} {selectedReservation.prenom}</div>
            <div><b>Email :</b> {selectedReservation.email}</div>
            <div><b>Téléphone :</b> {selectedReservation.phone}</div>
            <div><b>Date début :</b> {selectedReservation.dateDebut} {selectedReservation.heureDebut}</div>
            <div><b>Date fin :</b> {selectedReservation.dateFin} {selectedReservation.heureFin}</div>
            <div><b>Montant acompte payé :</b> {selectedReservation.montant ? selectedReservation.montant : selectedReservation.prix} {selectedReservation.devise ? selectedReservation.devise.toUpperCase() : ''}</div>
            <div><b>Prix total :</b> {selectedReservation.prix ? selectedReservation.prix : '-'} {selectedReservation.devise ? selectedReservation.devise.toUpperCase() : ''}</div>
            <div style={{ color: '#e67e22', fontWeight: 700, marginTop: 10 }}>
              Reste à payer : {selectedReservation.prix && selectedReservation.montant ? (Number(selectedReservation.prix) - Number(selectedReservation.montant)).toFixed(2) : '-'} {selectedReservation.devise ? selectedReservation.devise.toUpperCase() : ''}
            </div>
            <div style={{ marginTop: 18 }}>
              <b>Status paiement complet :</b> {selectedReservation.statusComplet === true ? <span style={{ color: '#1bbf4c', fontWeight: 700 }}>Payé</span> : <span style={{ color: '#e67e22', fontWeight: 700 }}>Non payé</span>}
            </div>
          </Modal.Body>
          <Modal.Footer style={{ background: '#fafdff' }}>
            {selectedReservation.statusComplet !== true && (
              <Button variant="success" onClick={async () => {
                if(window.confirm('Êtes-vous sûr de vouloir valider le paiement complet de cette réservation ?')) {
                  await updateReservationStatus(selectedReservation.id);
                  setSelectedReservation({ ...selectedReservation, statusComplet: true });
                }
              }}>
                Valider paiement complet
              </Button>
            )}
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Fermer
            </Button>
          </Modal.Footer>
        </Modal>
      )}
    </div>
  );
}

// Ajoute cette fonction utilitaire en bas du fichier :
async function updateReservationStatus(reservationId) {
  const { doc, updateDoc } = await import('firebase/firestore');
  const { db } = await import('../../firebase');
  await updateDoc(doc(db, 'reservations', reservationId), { statusComplet: true });
}
