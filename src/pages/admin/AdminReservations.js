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
          <table className="table table-bordered align-middle text-center" style={{ boxShadow: '0 4px 24px #1e90ff22', borderRadius: 16, overflow: 'hidden', background: '#fafdff' }}>
            <thead className="table-light" style={{ background: 'linear-gradient(90deg, #e6f0fa 60%, #fff 100%)', fontWeight: 700, fontSize: 16, color: '#1e90ff' }}>
              <tr>
                <th>Bateau</th>
                <th>Date début</th>
                <th>Heure début</th>
                <th>Date fin</th>
                <th>Heure fin</th>
                <th>Montant</th>
                <th>Devise</th>
                <th>Nom</th>
                <th>Prénom</th>
                <th>Email</th>
                <th>Téléphone</th>
                <th>Créée le</th>
                <th>Paiement complet</th>
                <th>Statut paiement complet</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {reservations.map(r => (
                <tr key={r.id}>
                  <td>{r.bateauNom || bateauxMap[r.bateauId] || r.bateauId || <span className="text-muted">-</span>}</td>
                  <td>{r.dateDebut || <span className="text-muted">-</span>}</td>
                  <td>{r.heureDebut || <span className="text-muted">-</span>}</td>
                  <td>{r.dateFin || <span className="text-muted">-</span>}</td>
                  <td>{r.heureFin || <span className="text-muted">-</span>}</td>
                  <td>{r.montant ? r.montant : r.prix || <span className="text-muted">-</span>}</td>
                  <td>{r.devise ? r.devise.toUpperCase() : <span className="text-muted">-</span>}</td>
                  <td>{r.nom || <span className="text-muted">-</span>}</td>
                  <td>{r.prenom || <span className="text-muted">-</span>}</td>
                  <td>{r.email || <span className="text-muted">-</span>}</td>
                  <td>{r.phone || <span className="text-muted">-</span>}</td>
                  <td>{r.createdAt && r.createdAt.toDate ? r.createdAt.toDate().toLocaleString() : (r.createdAt ? new Date(r.createdAt).toLocaleString() : <span className="text-muted">-</span>)}</td>
                  <td>{r.statusComplet === true ? <span style={{ color: '#1bbf4c', fontWeight: 700 }}>Payé</span> : <span style={{ color: '#e67e22', fontWeight: 700 }}>Non payé</span>}</td>
                  <td>{r.statusComplet === true ? 'Validé' : 'En attente'}</td>
                  <td>
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
